const fs = require('fs');

function inspectCsv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  console.log(`\nFile: ${filePath}`);
  console.log(`Total Rows: ${lines.length}`);
  console.log('Sample header/rows:', lines.slice(0, 5));
}

inspectCsv('C:\\Users\\user\\Downloads\\For manager - SMS_Contacts.csv');
inspectCsv('C:\\Users\\user\\Downloads\\Contact List with ID and Phone - Contact List with ID and Phone.csv');
inspectCsv('C:\\Users\\user\\Downloads\\contacts.csv');
inspectCsv('C:\\Users\\user\\Downloads\\Telegram Desktop\\contacts\\extracted_contacts.csv');

// Also check VCF
const vcfPath = 'C:\\Users\\user\\Downloads\\contacts.vcf';
if (fs.existsSync(vcfPath)) {
  const vcfContent = fs.readFileSync(vcfPath, 'utf8');
  const vcardMatches = vcfContent.match(/BEGIN:VCARD/g);
  console.log(`\nFile: ${vcfPath}`);
  console.log(`Total VCards: ${vcardMatches?.length || 0}`);
}
