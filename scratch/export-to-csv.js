const fs = require('fs');
const path = require('path');

const contactsFile = path.join(__dirname, 'waitlist_contacts.json');
const csvOutputPath1 = path.join(__dirname, 'waitlist_contacts_export.csv');
const csvOutputPath2 = 'C:\\Users\\user\\Desktop\\waitlist_contacts_export.csv';

if (!fs.existsSync(contactsFile)) {
  console.error(`[Error] Contacts file not found at: ${contactsFile}`);
  process.exit(1);
}

const contacts = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));

// Format as CSV (Name, Phone, Email)
// Prepending the plus sign for phone number if needed (some bulk senders require it, some don't)
let csvContent = 'Name,Phone,Email\n';

for (const contact of contacts) {
  // Clean name (remove any commas in name to avoid breaking CSV format)
  const name = contact.name.replace(/,/g, ' ');
  const email = contact.email;
  const phone = contact.phone; // Already in clean digits format (e.g. 233...)
  
  csvContent += `"${name}","+${phone}","${email}"\n`;
}

// Write to scratch directory
fs.writeFileSync(csvOutputPath1, csvContent, 'utf8');

// Write directly to user's Desktop for easy access
try {
  fs.writeFileSync(csvOutputPath2, csvContent, 'utf8');
  console.log(`[+] Exported successfully to your Desktop: ${csvOutputPath2}`);
} catch (e) {
  console.log(`[+] Exported to scratch directory: ${csvOutputPath1}`);
  console.log(`Note: Desktop write failed: ${e.message}`);
}

console.log(`[+] Total records exported: ${contacts.length}`);
