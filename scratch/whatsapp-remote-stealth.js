const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Delay between messages (in milliseconds) - 65 to 95 seconds
  minDelay: 65000, 
  maxDelay: 95000, 
  // Files
  contactsFile: path.join(__dirname, 'waitlist_contacts.json'),
  progressFile: path.join(__dirname, 'progress_remote_stealth.json'),
  // Max messages to send in a single session before taking a long break
  batchSizeLimit: 25,
  batchBreakDuration: 180000, // 3 minutes break between batches
};

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (err) {
    console.error('\n[Error] "puppeteer" package is not installed.');
    console.error('Please run: npm install puppeteer\n');
    process.exit(1);
  }

  // Load contacts
  if (!fs.existsSync(CONFIG.contactsFile)) {
    console.error(`[Error] Contacts file not found at: ${CONFIG.contactsFile}`);
    console.error('Please run "node scratch/parse-and-generate.js" first.');
    process.exit(1);
  }
  const contacts = JSON.parse(fs.readFileSync(CONFIG.contactsFile, 'utf8'));

  // Load progress
  let progress = { sent: [], failed: [] };
  if (fs.existsSync(CONFIG.progressFile)) {
    progress = JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf8'));
  }

  console.log('=============================================================');
  console.log('     WHATSAPP DMs SENDER (REMOTE CHROME STEALTH MODE)');
  console.log('=============================================================');
  console.log(`Loaded ${contacts.length} total contacts.`);
  console.log(`Already Sent: ${progress.sent.length} | Failed: ${progress.failed.length}`);
  
  const pendingContacts = contacts.filter(
    c => !progress.sent.includes(c.email) && !progress.failed.includes(c.email)
  );

  if (pendingContacts.length === 0) {
    console.log('All messages have been successfully sent! Nothing to do.');
    process.exit(0);
  }

  console.log(`Pending to send: ${pendingContacts.length}`);
  console.log('Connecting to your running Chrome browser on port 9222...');

  let browser;
  try {
    browser = await puppeteer.connect({
      browserURL: 'http://127.0.0.1:9222',
      defaultViewport: null
    });
    console.log('[+] Connected successfully to Chrome!');
  } catch (err) {
    console.error('\n[Error] Could not connect to Chrome.');
    console.error('Please make sure you launched Chrome with remote debugging enabled:');
    console.error('1. Close all existing Chrome windows.');
    console.error('2. Run this command in a new terminal or command prompt:');
    console.error('   "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\\Users\\user\\Desktop\\lms\\scratch\\chrome-profile-stealth"');
    console.error('3. In that new Chrome window, open WhatsApp Web and login with your 3rd phone number.');
    console.error('4. Run this script again.\n');
    process.exit(1);
  }

  // Find or create WhatsApp Web tab
  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('web.whatsapp.com'));
  
  if (page) {
    console.log('[+] Found existing WhatsApp Web tab.');
    await page.bringToFront();
  } else {
    console.log('[+] Creating a new tab for WhatsApp Web...');
    page = await browser.newPage();
    await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  // Wait for login
  console.log('Verifying WhatsApp Web login status...');
  try {
    await page.waitForSelector('#pane-side, [data-testid="chat-list"], [data-icon="chat"], div[contenteditable="true"]', { timeout: 60000 });
    console.log('[+] WhatsApp Web is logged in and ready!');
  } catch (err) {
    console.log('[-] Login not detected. Please scan the QR code in the Chrome window first.');
    console.log('Waiting for you to log in...');
    await page.waitForSelector('#pane-side, [data-testid="chat-list"], [data-icon="chat"]', { timeout: 120000 });
    console.log('[+] Logged in!');
  }

  let sessionCount = 0;

  for (let i = 0; i < pendingContacts.length; i++) {
    const contact = pendingContacts[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const message = `Hi ${firstName}, Ishmael here from Sena Academy. We just sent out access codes to the latest batch of builders who completed their enrollment for the Founding Builders Cohort. The remaining GHS 100 discount slots (regularly GHS 200) are filling up. If you are ready to build with AI starting this Saturday, August 1st, complete your enrollment here: https://senaacademy.org/enroll. You can also join the cohort group here: https://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e`;

    // Batch break control
    if (sessionCount >= CONFIG.batchSizeLimit) {
      console.log(`\n[Batch Limit Reached] Sent ${CONFIG.batchSizeLimit} messages.`);
      console.log(`Taking a ${CONFIG.batchBreakDuration / 60000} minutes break to keep the account safe...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.batchBreakDuration));
      sessionCount = 0; // Reset counter
    }

    console.log(`\n[${i + 1}/${pendingContacts.length}] Opening chat with ${contact.name} (${contact.phone})...`);

    try {
      const waUrl = `https://web.whatsapp.com/send?phone=${contact.phone}`;
      await page.goto(waUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait to see if chat loads successfully
      const inputSelector = 'div[role="textbox"], div[data-testid="conversation-text-input"], div[title="Type a message"]';
      let chatLoaded = false;
      
      try {
        await page.waitForSelector(inputSelector, { timeout: 25000 });
        chatLoaded = true;
      } catch (err) {
        // Check if invalid number popup appears
        const invalidPopupExists = await page.evaluate(() => {
          const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]'));
          return dialogs.some(d => {
            const txt = d.textContent.toLowerCase();
            return txt.includes('invalid') || txt.includes('not exist') || txt.includes('url is') || txt.includes('phone number shared');
          });
        });

        if (invalidPopupExists) {
          console.log(`[-] ${contact.name} (${contact.phone}) is not on WhatsApp (Invalid Number). Skipping.`);
          // Click OK to close dialog
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, div[role="button"]'));
            const okBtn = buttons.find(b => {
              const txt = b.textContent.trim().toLowerCase();
              return txt === 'ok' || txt === 'close' || txt === 'okay';
            });
            if (okBtn) okBtn.click();
          });
          progress.failed.push(contact.email);
          fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
          continue;
        } else {
          throw new Error('Loading chat timed out. Will retry.');
        }
      }

      // Chat loaded. Wait a random short duration to simulate human reading/focusing (3-6 seconds)
      const initialDelay = Math.floor(Math.random() * 3000) + 3000;
      await new Promise(resolve => setTimeout(resolve, initialDelay));

      // Focus input field and type the message character-by-character
      console.log(`Typing message like a human for ${contact.name}...`);
      await page.focus(inputSelector);
      
      // Simulate real typing speeds (20-60ms per character with random intervals)
      const textToType = message;
      for (const char of textToType) {
        await page.keyboard.sendCharacter(char);
        const typingDelay = Math.floor(Math.random() * 40) + 20; 
        await new Promise(resolve => setTimeout(resolve, typingDelay));
      }

      // Wait a moment after typing before hitting Send
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Press Enter to send the message
      await page.keyboard.press('Enter');

      console.log(`[+] Sent successfully to ${contact.name}!`);
      progress.sent.push(contact.email);
      fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
      sessionCount++;

      // Wait for message to successfully upload/send to servers
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Wait between DMs (65 to 95 seconds)
      if (i < pendingContacts.length - 1) {
        const delay = Math.floor(Math.random() * (CONFIG.maxDelay - CONFIG.minDelay + 1) + CONFIG.minDelay);
        console.log(`Waiting for ${Math.round(delay / 1000)} seconds before the next contact to stay stealthy...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (err) {
      console.error(`[!] Failed to send message to ${contact.name}:`, err.message);
      // Wait before retrying next one
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log('\nAll pending messages sent successfully!');
  await browser.disconnect();
}

main().catch(console.error);
