const fs = require('fs');
const path = require('path');

function normalizePhone(raw) {
  if (!raw) return null;
  let cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  } else if (cleaned.startsWith('233')) {
    // already 233
  } else if (cleaned.length === 9) {
    cleaned = '233' + cleaned;
  }
  // Valid Ghanaian mobile numbers are 12 digits: 233 + 9 digits
  if (cleaned.length === 12 && cleaned.startsWith('233')) {
    return cleaned;
  }
  return null;
}

async function prepareBatch() {
  console.log('Loading contacts from Downloads/For manager - SMS_Contacts.csv...');
  const csvPath = 'C:\\Users\\user\\Downloads\\For manager - SMS_Contacts.csv';
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n');

  const uniqueNumbers = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.toLowerCase().includes('phone')) continue;

    const normalized = normalizePhone(trimmed);
    if (normalized) {
      uniqueNumbers.add(normalized);
    }
  }

  const allNumbers = Array.from(uniqueNumbers);
  console.log(`Total valid, unique numbers found: ${allNumbers.length}`);

  // Take exactly the first 1,812 contacts for the GHS 50 test batch
  const batch = allNumbers.slice(0, 1812);
  console.log(`Prepared target test batch: ${batch.length} numbers.`);

  const outputPath = path.join(__dirname, 'batch-1812-contacts.json');
  fs.writeFileSync(outputPath, JSON.stringify(batch, null, 2));
  console.log(`✅ Saved batch to ${outputPath}`);
}

prepareBatch();
