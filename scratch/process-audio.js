const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

async function processAudio() {
  console.log('Locating ffmpeg binary...');
  let ffmpegPath;
  try {
    ffmpegPath = require('ffmpeg-static');
    console.log(`Found FFmpeg binary at: ${ffmpegPath}`);
  } catch (err) {
    console.error('Failed to require ffmpeg-static:', err.message);
    process.exit(1);
  }

  const m4aPath = path.resolve(__dirname, 'S3NA_FINAL.m4a');
  const wavPath = path.resolve(__dirname, 'S3NA_FINAL.wav');
  const cleanedWavPath = path.resolve(__dirname, 'S3NA_FINAL_cleaned.wav');
  const finalMp3Path = path.resolve(__dirname, 'S3NA_FINAL_cleaned.mp3');

  if (!fs.existsSync(m4aPath)) {
    console.error(`Error: Source file not found at ${m4aPath}`);
    process.exit(1);
  }

  console.log('\nStep 1: Converting M4A to WAV...');
  if (fs.existsSync(wavPath)) {
    fs.unlinkSync(wavPath);
  }
  
  try {
    execSync(`"${ffmpegPath}" -i "${m4aPath}" -ar 16000 -ac 1 "${wavPath}"`, { stdio: 'inherit' });
    console.log('[+] Converted to WAV successfully.');
  } catch (err) {
    console.error('[-] FFmpeg conversion failed:', err.message);
    process.exit(1);
  }

  console.log('\nStep 2: Denoising WAV audio via Python...');
  if (fs.existsSync(cleanedWavPath)) {
    fs.unlinkSync(cleanedWavPath);
  }

  try {
    const pythonScript = path.resolve(__dirname, 'denoise-audio.py');
    // Using subtraction factor 2.5 and noise duration of 0.6 seconds
    execSync(`python "${pythonScript}" "${wavPath}" "${cleanedWavPath}" 0.6 2.5`, { stdio: 'inherit' });
    console.log('[+] Denoising completed.');
  } catch (err) {
    console.error('[-] Denoising script failed:', err.message);
    process.exit(1);
  }

  console.log('\nStep 3: Compressing cleaned WAV to MP3 (Optimized for mNotify upload)...');
  if (fs.existsSync(finalMp3Path)) {
    fs.unlinkSync(finalMp3Path);
  }

  try {
    execSync(`"${ffmpegPath}" -i "${cleanedWavPath}" -filter:a "atempo=1.12" -codec:a libmp3lame -b:a 64k "${finalMp3Path}"`, { stdio: 'inherit' });
    console.log(`[+] Compression successful. Saved output to: ${finalMp3Path}`);
  } catch (err) {
    console.error('[-] Compression to MP3 failed:', err.message);
    process.exit(1);
  }

  console.log('\nAll audio processing finished successfully!');
}

processAudio().catch(console.error);
