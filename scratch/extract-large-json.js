const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Path to transcript_full.jsonl
const logDir = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\c63ea1cb-b440-4fb3-8b78-7e272d659f4b\\.system_generated\\logs';
const logFile = path.join(logDir, 'transcript_full.jsonl');

async function extractJson() {
  if (!fs.existsSync(logFile)) {
    console.error('Log file does not exist at:', logFile);
    return;
  }

  console.log('Reading full transcript from:', logFile);
  
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastUserContent = null;

  for await (const line of rl) {
    try {
      const step = JSON.parse(line);
      // We look for user inputs
      if (step.type === 'USER_INPUT' && step.content) {
        lastUserContent = step.content;
      }
    } catch (e) {
      // Ignore JSON parse errors for lines that might be incomplete
    }
  }

  if (!lastUserContent) {
    console.error('Could not find any USER_INPUT in logs.');
    return;
  }

  console.log('Found last user input content of size:', lastUserContent.length, 'characters.');

  // Let's try to extract the JSON array from the user content
  // The content starts with the JSON array
  let jsonStart = lastUserContent.indexOf('[');
  let jsonEnd = lastUserContent.lastIndexOf(']');

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
    console.error('Could not find a valid JSON array boundary [ ... ] in user input.');
    console.log('Content starts with:', lastUserContent.substring(0, 100));
    return;
  }

  const jsonText = lastUserContent.substring(jsonStart, jsonEnd + 1);
  console.log('Extracted JSON text of size:', jsonText.length, 'characters.');

  try {
    const parsed = JSON.parse(jsonText);
    console.log('Successfully parsed JSON array with', parsed.length, 'items!');
    
    // Save to tiktok_data.json
    const outputPath = path.join(__dirname, 'tiktok_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log('Saved to:', outputPath);
  } catch (err) {
    console.error('Failed to parse the extracted JSON:', err.message);
    // Write raw text anyway for inspection
    const rawOutPath = path.join(__dirname, 'tiktok_data_raw.txt');
    fs.writeFileSync(rawOutPath, jsonText, 'utf8');
    console.log('Saved raw text to:', rawOutPath);
  }
}

extractJson();
