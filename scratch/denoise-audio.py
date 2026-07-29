import sys
import numpy as np
from scipy.io import wavfile

def reduce_noise(input_path, output_path, noise_estimation_seconds=0.5, subtraction_factor=2.0):
    print(f"Reading input WAV: {input_path}")
    sample_rate, data = wavfile.read(input_path)
    
    # Handle stereo files by converting to mono for processing
    if len(data.shape) > 1:
        print("Converting stereo to mono...")
        data = np.mean(data, axis=1)
        
    # Convert integer data to float for calculations
    original_dtype = data.dtype
    if np.issubdtype(original_dtype, np.integer):
        max_val = np.iinfo(original_dtype).max
        signal = data.astype(float) / max_val
    else:
        signal = data.astype(float)
        
    # Parameters for Short-Time Fourier Transform (STFT)
    nfft = 2048
    hop_length = 512
    window = np.hanning(nfft)
    
    # Pad signal
    padded_signal = np.pad(signal, (nfft // 2, nfft // 2), mode='reflect')
    
    # Calculate STFT
    num_frames = (len(padded_signal) - nfft) // hop_length + 1
    stft = np.zeros((nfft // 2 + 1, num_frames), dtype=complex)
    
    for i in range(num_frames):
        start = i * hop_length
        frame = padded_signal[start : start + nfft] * window
        fft_frame = np.fft.rfft(frame)
        stft[:, i] = fft_frame
        
    # Calculate magnitude and phase
    magnitude = np.abs(stft)
    phase = np.angle(stft)
    
    # Estimate noise from the first N seconds
    noise_frames = int((noise_estimation_seconds * sample_rate) / hop_length)
    if noise_frames < 2:
        noise_frames = 2
    print(f"Estimating noise profile from the first {noise_estimation_seconds}s ({noise_frames} frames)...")
    
    noise_magnitude = np.mean(magnitude[:, :noise_frames], axis=1, keepdims=True)
    
    # Perform spectral subtraction
    subtracted = magnitude - (subtraction_factor * noise_magnitude)
    # Floor to zero for any negative values (half-wave rectification)
    subtracted = np.maximum(subtracted, 0.0)
    
    # Reconstruct STFT
    reconstructed_stft = subtracted * np.exp(1j * phase)
    
    # Inverse STFT (Overlap-Add method)
    reconstructed_signal = np.zeros(num_frames * hop_length + nfft)
    window_sum = np.zeros_like(reconstructed_signal)
    
    for i in range(num_frames):
        start = i * hop_length
        fft_frame = reconstructed_stft[:, i]
        frame = np.fft.irfft(fft_frame)
        
        reconstructed_signal[start : start + nfft] += frame * window
        window_sum[start : start + nfft] += window ** 2
        
    # Normalize window overlap
    window_sum[window_sum < 1e-4] = 1.0
    cleaned_signal = reconstructed_signal / window_sum
    # Trim padding
    cleaned_signal = cleaned_signal[nfft // 2 : nfft // 2 + len(signal)]
    
    # Convert back to original data type format
    if np.issubdtype(original_dtype, np.integer):
        cleaned_signal = np.clip(cleaned_signal, -1.0, 1.0)
        output_data = (cleaned_signal * max_val).astype(original_dtype)
    else:
        output_data = cleaned_signal.astype(original_dtype)
        
    print(f"Writing denoised WAV to: {output_path}")
    wavfile.write(output_path, sample_rate, output_data)
    print("Noise reduction complete.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python denoise-audio.py <input_wav> <output_wav> [noise_estimation_sec] [subtraction_factor]")
        sys.exit(1)
        
    in_path = sys.argv[1]
    out_path = sys.argv[2]
    noise_sec = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5
    sub_factor = float(sys.argv[4]) if len(sys.argv) > 4 else 2.5
    
    reduce_noise(in_path, out_path, noise_sec, sub_factor)
