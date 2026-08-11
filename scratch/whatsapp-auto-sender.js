const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Delay between messages (in milliseconds) - 60 to 90 seconds
  minDelay: 60000, 
  maxDelay: 90000, 
  // Session storage folder to keep the new number logged in
  sessionFolder: path.join(__dirname, 'whatsapp-session-stealth'),
  // Files
  contactsFile: path.join(__dirname, 'waitlist_contacts.json'),
  progressFile: path.join(__dirname, 'progress_stealth.json'),
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
    console.error('Please run the following command in your terminal first:');
    console.error('   npm install puppeteer\n');
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
  console.log('            WHATSAPP DMs SENDER (STEALTH MODE)');
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
  console.log('Starting browser in Stealth Mode...');

  const browser = await puppeteer.launch({
    headless: false, // Must be visible to scan QR code
    userDataDir: CONFIG.sessionFolder,
    defaultViewport: null,
    slowMo: 50, // Add slight delay to all operations to mimic human pace
    args: [
      '--start-maximized', 
      '--no-sandbox',
      '--disable-blink-features=AutomationControlled', // Disable automation flag
      '--use-fake-device-for-media-stream',
      '--disable-web-security'
    ]
  });

  const page = (await browser.pages())[0];
  
  // Stealth: Mask WebDriver control flag
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // Add fake plugins to look like a standard user browser
    Object.defineProperty(navigator, 'plugins', {
      get: () => [
        { name: 'Chrome PDF Viewer' },
        { name: 'Chromium PDF Viewer' },
        { name: 'WebKit built-in PDF' }
      ]
    });
  });

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  console.log('\n=============================================================');
  console.log('Opening WhatsApp Web...');
  console.log('PLEASE SCAN THE QR CODE WITH YOUR NEW SECONDARY PHONE NUMBER.');
  console.log('=============================================================\n');

  await page.goto('https://web.whatsapp.com', { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for login by looking for the main WhatsApp panel elements
  console.log('Waiting for WhatsApp Web to load...');
  try {
    await page.waitForSelector('#pane-side, [data-testid="chat-list"], [data-icon="chat"], div[contenteditable="true"]', { timeout: 120000 });
    console.log('Successfully logged in!');
  } catch (err) {
    console.error('[Error] Login timed out. Please scan the QR code faster next time.');
    await browser.close();
    process.exit(1);
  }

  let sessionCount = 0;

  for (let i = 0; i < pendingContacts.length; i++) {
    const contact = pendingContacts[i];
    const firstName = contact.name.split(' ')[0] || 'Builder';
    const message = `Hi ${firstName},\n\nIshmael here from Sena Academy.\n\nWe just sent out access codes to the latest batch of builders who completed their enrollment for the Founding Builders Cohort. The remaining GHS 100 discount slots (regularly GHS 200) are filling up.\n\nIf you are ready to build with AI starting this Saturday, August 1st, complete your enrollment here:\nhttps://senaacademy.org/enroll\n\nYou can also join the cohort group here:\nhttps://chat.whatsapp.com/FMfa6oY0VhKGriix2EEH9e`;

    // Batch break control
    if (sessionCount >= CONFIG.batchSizeLimit) {
      console.log(`\n[Batch Limit Reached] Sent ${CONFIG.batchSizeLimit} messages.`);
      console.log(`Taking a ${CONFIG.batchBreakDuration / 60000} minutes break to keep the account safe...`);
      await new Promise(resolve => setTimeout(resolve, CONFIG.batchBreakDuration));
      sessionCount = 0; // Reset counter
    }

    console.log(`\n[${i + 1}/${pendingContacts.length}] Opening chat with ${contact.name} (${contact.phone})...`);

    try {
      // Navigate to chat (WITHOUT pre-filled text in URL to avoid easy bot detection!)
      const waUrl = `https://web.whatsapp.com/send?phone=${contact.phone}`;
      await page.goto(waUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait to see if chat loads successfully
      const inputSelector = 'div[role="textbox"], div[data-testid="conversation-text-input"], div[title="Type a message"]';
      let chatLoaded = false;
      
      try {
        await page.waitForSelector(inputSelector, { timeout: 25000 });
        chatLoaded = true;
      } catch (err) {
        // Chat didn't load in 25 seconds. Check if there's an active invalid number dialog
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
      
      // Simulate real typing speeds (50-100ms per character with random intervals)
      const textToType = message;
      for (const char of textToType) {
        if (char === '\n') {
          await page.keyboard.down('Shift');
          await page.keyboard.press('Enter');
          await page.keyboard.up('Shift');
        } else {
          await page.keyboard.sendCharacter(char);
        }
        const typingDelay = Math.floor(Math.random() * 40) + 20; // 20ms to 60ms per char
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

      // Wait between DMs (60 to 90 seconds)
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
  await browser.close();
}

main().catch(console.error);
