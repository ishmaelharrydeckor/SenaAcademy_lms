const apiKey = 'pBYuxG4wFronfEqmbCy97xaWB';

async function checkBalance() {
  const smsUrl = `https://api.mnotify.com/api/balance/sms?key=${apiKey}`;
  const voiceUrl = `https://api.mnotify.com/api/balance/voice?key=${apiKey}`;

  try {
    const sRes = await fetch(smsUrl);
    const sData = await sRes.json();
    console.log('SMS Balance response:', sData);
  } catch (err) {
    console.error('SMS check error:', err.message);
  }

  try {
    const vRes = await fetch(voiceUrl);
    const vData = await vRes.json();
    console.log('Voice Balance response:', vData);
  } catch (err) {
    console.error('Voice check error:', err.message);
  }
}

checkBalance();
