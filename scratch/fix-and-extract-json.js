const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, 'tiktok_data_raw.txt');
const outPath = path.join(__dirname, 'tiktok_data.json');

function fixAndExtract() {
  if (!fs.existsSync(rawPath)) {
    console.error('Raw file does not exist at:', rawPath);
    return;
  }

  let text = fs.readFileSync(rawPath, 'utf8').trim();

  // Let's inspect the end of the text
  console.log('End of raw text:');
  console.log(text.substring(text.length - 100));

  // The text ends with:
  //   ]
  // We need to add:
  // }
  // ]
  
  if (text.endsWith(']')) {
    text = text + '\n}';
  }
  if (!text.endsWith(']')) {
    text = text + '\n]';
  }

  try {
    const parsed = JSON.parse(text);
    console.log('Success! Parsed JSON array contains:', parsed.length, 'items.');
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log('Saved corrected JSON to:', outPath);
  } catch (err) {
    console.error('Failed to parse corrected JSON:', err.message);
    
    // Let's do a more robust truncation check
    // Find the last complete object in the array
    let lastCommaIdx = text.lastIndexOf('},');
    if (lastCommaIdx !== -1) {
      let salvagedText = text.substring(0, lastCommaIdx + 1) + '\n]';
      try {
        const salvagedParsed = JSON.parse(salvagedText);
        console.log('Robust Salvage Success! Extracted:', salvagedParsed.length, 'complete items.');
        fs.writeFileSync(outPath, JSON.stringify(salvagedParsed, null, 2), 'utf8');
        console.log('Saved salvaged JSON to:', outPath);
      } catch (salvageErr) {
        console.error('Robust salvage also failed:', salvageErr.message);
      }
    }
  }
}

fixAndExtract();
