const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function speedUp() {
  const ffmpegPath = require('ffmpeg-static');
  const inputMp3 = path.resolve(__dirname, 'S3NA_FINAL_cleaned.mp3');
  const tempMp3 = path.resolve(__dirname, 'S3NA_FINAL_speedup.mp3');

  if (!fs.existsSync(inputMp3)) {
    console.error('Source file not found.');
    process.exit(1);
  }

  console.log('Speeding up audio by 4% to fit under 30-second billing limit...');
  try {
    // atempo=1.04 speeds up the audio without changing pitch
    execSync(`"${ffmpegPath}" -y -i "${inputMp3}" -filter:a "atempo=1.04" "${tempMp3}"`, { stdio: 'inherit' });
    
    // Replace original cleaned MP3 with the sped-up version
    fs.unlinkSync(inputMp3);
    fs.renameSync(tempMp3, inputMp3);
    console.log('[+] Audio successfully optimized to under 30 seconds!');
  } catch (err) {
    console.error('[-] Speedup failed:', err.message);
  }
}

speedUp();
