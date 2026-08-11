const fs = require('fs');
const path = require('path');

function normalizePhone(raw) {
  if (!raw) return null;
  let cleaned = raw.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '233' + cleaned.substring(1);
  } else if (cleaned.startsWith('233')) {
    // ok
  } else if (cleaned.length === 9) {
    cleaned = '233' + cleaned;
  }
  if (cleaned.length === 12 && cleaned.startsWith('233')) {
    return cleaned;
  }
  return null;
}

async function partitionAllBatches() {
  console.log('Partitioning all remaining contacts across Batch 2, 3, 4, and 5...\n');

  // 1. Load Batch 1 (already sent) to exclude
  const batch1Path = path.join(__dirname, 'batch-1812-contacts.json');
  const batch1Sent = new Set(JSON.parse(fs.readFileSync(batch1Path, 'utf8')));
  console.log(`Excluding ${batch1Sent.size} numbers already sent in Batch 1.`);

  // 2. Load all numbers from master CSVs
  const masterNumbers = new Set();

  // Load from "For manager - SMS_Contacts.csv"
  const csv1 = 'C:\\Users\\user\\Downloads\\For manager - SMS_Contacts.csv';
  if (fs.existsSync(csv1)) {
    const lines = fs.readFileSync(csv1, 'utf8').split('\n');
    lines.forEach(l => {
      const p = normalizePhone(l.trim());
      if (p && !batch1Sent.has(p)) masterNumbers.add(p);
    });
  }

  // Load from "extracted_contacts.csv"
  const csv2 = 'C:\\Users\\user\\Downloads\\Telegram Desktop\\contacts\\extracted_contacts.csv';
  if (fs.existsSync(csv2)) {
    const lines = fs.readFileSync(csv2, 'utf8').split('\n');
    lines.forEach(l => {
      const p = normalizePhone(l.trim());
      if (p && !batch1Sent.has(p)) masterNumbers.add(p);
    });
  }

  const pool = Array.from(masterNumbers);
  console.log(`Total clean, unsent contacts remaining: ${pool.length}`);

  // Split evenly across 4 days (Tue, Wed, Thu, Fri)
  const batchSize = Math.ceil(pool.length / 4); // ~1,557 per batch
  const batch2 = pool.slice(0, batchSize);
  const batch3 = pool.slice(batchSize, batchSize * 2);
  const batch4 = pool.slice(batchSize * 2, batchSize * 3);
  const batch5 = pool.slice(batchSize * 3);

  fs.writeFileSync(path.join(__dirname, 'batch-2-contacts.json'), JSON.stringify(batch2, null, 2));
  fs.writeFileSync(path.join(__dirname, 'batch-3-contacts.json'), JSON.stringify(batch3, null, 2));
  fs.writeFileSync(path.join(__dirname, 'batch-4-contacts.json'), JSON.stringify(batch4, null, 2));
  fs.writeFileSync(path.join(__dirname, 'batch-5-contacts.json'), JSON.stringify(batch5, null, 2));

  console.log(`\n✅ Batch 2 (Tuesday): ${batch2.length} contacts saved`);
  console.log(`✅ Batch 3 (Wednesday): ${batch3.length} contacts saved`);
  console.log(`✅ Batch 4 (Thursday): ${batch4.length} contacts saved`);
  console.log(`✅ Batch 5 (Friday): ${batch5.length} contacts saved`);
  console.log(`\nTotal Evenly Distributed Pool: ${batch2.length + batch3.length + batch4.length + batch5.length} contacts!`);
}

partitionAllBatches();
