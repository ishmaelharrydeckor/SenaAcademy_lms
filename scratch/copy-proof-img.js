const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\c63ea1cb-b440-4fb3-8b78-7e272d659f4b\\.user_uploaded\\media_1786180392705.jpg';
const dest = path.join(__dirname, '..', 'public', 'paystack-proof.jpg');

fs.copyFileSync(src, dest);
console.log('Copied paystack proof image to public/paystack-proof.jpg');
