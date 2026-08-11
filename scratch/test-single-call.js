const fs = require('fs');
const path = require('path');

const mnotifyApiKey = 'pBYuxG4wFronfEqmbCy97xaWB';
const testPhone = '233594607904'; // Target test number

async function testSingleCall() {
  console.log('Sending a single test call via mNotify...');
  try {
    const audioUrl = 'https://production.mnotify.com/storage/voice_files/A9JLk9YxekioLl9_20260727180022.mp3';
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) throw new Error('Failed to download audio template');
    const audioBlob = await audioResponse.blob();

    const formData = new FormData();
    formData.append('campaign', 'Sena Academy Single Test Call');
    formData.append('file', audioBlob, 'enrollment.mp3');
    formData.append('recipient[]', testPhone);

    const url = `https://api.mnotify.com/api/voice/quick?key=${mnotifyApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testSingleCall();
