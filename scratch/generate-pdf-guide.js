const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePdf() {
  console.log('Generating pixel-perfect PDF guide...');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Non-Coder's Guide to AI: How to Prompt Like a Pro</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

    @page {
      size: A4;
      margin: 18mm 18mm 18mm 18mm;
      @bottom-right {
        content: "Page " counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #94A3B8;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0F172A;
      background-color: #FFFFFF;
      line-height: 1.6;
      font-size: 10pt;
    }

    /* Cover / Header Banner */
    .header-banner {
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .brand-name {
      font-family: 'Archivo', sans-serif;
      font-size: 14pt;
      font-weight: 900;
      color: #4F46E5;
      letter-spacing: -0.02em;
    }

    .category-tag {
      background-color: #EEF2FF;
      color: #4338CA;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1px solid #C7D2FE;
    }

    h1 {
      font-family: 'Archivo', sans-serif;
      font-size: 21pt;
      font-weight: 900;
      line-height: 1.2;
      color: #0F172A;
      letter-spacing: -0.03em;
      margin-bottom: 6px;
    }

    .subtitle {
      font-size: 10pt;
      color: #475569;
      margin-bottom: 10px;
      font-style: italic;
    }

    .author-meta {
      font-size: 8.5pt;
      color: #64748B;
      font-weight: 500;
    }

    .author-meta strong {
      color: #1E293B;
    }

    /* Headings */
    h2 {
      font-family: 'Archivo', sans-serif;
      font-size: 13pt;
      font-weight: 800;
      color: #1E293B;
      letter-spacing: -0.02em;
      margin-top: 22px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    h3 {
      font-family: 'Archivo', sans-serif;
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    p {
      margin-bottom: 10px;
      color: #334155;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 12px;
      color: #334155;
    }

    li {
      margin-bottom: 4px;
    }

    /* Callout & Prompt Boxes */
    .formula-box {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-left: 4px solid #4F46E5;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 14px 0;
      font-size: 9.5pt;
    }

    .prompt-box {
      background-color: #0F172A;
      color: #F8FAFC;
      border-radius: 8px;
      padding: 14px 16px;
      margin: 14px 0;
      position: relative;
      border: 1px solid #1E293B;
    }

    .prompt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #334155;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }

    .prompt-title {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #10B981;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .prompt-body {
      font-family: 'Fira Code', monospace;
      font-size: 8.5pt;
      line-height: 1.5;
      color: #E2E8F0;
      white-space: pre-wrap;
    }

    .placeholder-highlight {
      color: #FDE047;
      font-weight: 600;
      background-color: rgba(253, 224, 71, 0.15);
      padding: 1px 4px;
      border-radius: 3px;
    }

    /* Highlight Banner */
    .cta-box {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      border: 1px solid #C7D2FE;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      margin-top: 24px;
    }

    .cta-title {
      font-family: 'Archivo', sans-serif;
      font-size: 11pt;
      font-weight: 800;
      color: #3730A3;
      margin-bottom: 4px;
    }

    .cta-link {
      display: inline-block;
      background-color: #25D366;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 9pt;
      padding: 8px 18px;
      border-radius: 6px;
      text-decoration: none;
      margin-top: 8px;
    }

    .footer-bar {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #E2E8F0;
      display: flex;
      justify-content: space-between;
      font-size: 7.5pt;
      color: #94A3B8;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header-banner">
    <div class="badge-row">
      <span class="brand-name">SENA ACADEMY</span>
      <span class="category-tag">FREE MASTER WORKSHOP GUIDE</span>
    </div>
    <h1>The Non-Coder’s Guide to AI: How to Prompt Like a Pro</h1>
    <p class="subtitle">A Practical Blueprint to Turn Plain English into High-Quality Work & Web Software</p>
    <p class="author-meta">By <strong>Ishmael Harry-Deckor</strong> • Founder, Sena Academy • <em>“Stop learning to code. Start learning to build.”</em></p>
  </div>

  <!-- SECTION 1 -->
  <h2>🛑 1. Why 90% of People Get Bad Results from AI</h2>
  <p>Most people open AI tools like ChatGPT, Claude, or Google AI Studio and type something generic:</p>
  <ul>
    <li>❌ <em>"Write me a business plan for my project."</em></li>
    <li>❌ <em>"Build me a website for my business."</em></li>
  </ul>
  <p>And what does the AI give them? A long, boring, generic response filled with corporate buzzwords that is completely useless in the real world.</p>
  <p>The secret to mastering AI in 2026 isn’t learning to write complex computer code—it’s <strong>learning how to think and prompt with clarity</strong>.</p>

  <!-- SECTION 2 -->
  <h2>🏛️ 2. Framework 1: The C.G.C. Formula</h2>
  <p>Every high-performing prompt must have three distinct layers:</p>
  
  <div class="formula-box">
    <strong>[ CONTEXT ]</strong> ➔ Who is the AI, and what is the exact situation?<br>
    <strong>[ GOAL ]</strong> ➔ What is the exact, specific output you want?<br>
    <strong>[ CONSTRAINTS ]</strong> ➔ What rules MUST the AI follow (tone, length, what to avoid)?
  </div>

  <div class="prompt-box">
    <div class="prompt-header">
      <span class="prompt-title">📋 Real-World Example Prompt</span>
    </div>
    <div class="prompt-body">"[Context]: You are an experienced digital business consultant in Ghana helping a local car rental company in Accra.

[Goal]: Write a 3-part WhatsApp message sequence to follow up with clients who inquired about renting a car for a weekend event but haven't paid their deposit yet.

[Constraints]: Keep each message under 50 words. The tone must be polite, warm, and professional. Mention Mobile Money payment options. Avoid corporate American jargon."</div>
  </div>

  <!-- PAGE BREAK FOR CLEAN PRESENTATION -->
  <div class="page-break"></div>

  <!-- SECTION 3 -->
  <h2>🔄 3. Framework 2: The "Reverse Interview" Method</h2>
  <p>When you have a project in mind but don’t know all the technical details, <strong>never try to write a long prompt from scratch</strong>. Instead, make the AI interview you.</p>

  <div class="prompt-box">
    <div class="prompt-header">
      <span class="prompt-title">📋 Copy-Paste Prompt</span>
    </div>
    <div class="prompt-body">"I want to create a <span class="placeholder-highlight">[INSERT YOUR PROJECT: e.g. digital registration portal for an event / client booking system for a hair salon in Kumasi]</span>.

Before you give me any answers or write anything, I want you to act as an expert project consultant and ask me 5 clarifying questions one by one to understand my target audience, budget, timeline, and goals.

Wait for my answer after each question before asking the next."</div>
  </div>
  <p><em>Why this works: It forces the AI to extract your exact business needs step-by-step, resulting in a 100% custom solution instead of a generic guess.</em></p>

  <!-- SECTION 4 -->
  <h2>📱 4. Framework 3: The "Idea-to-App Blueprint" (Using Google AI Studio)</h2>
  <p>You don't need any coding software to turn a business idea into a visual prototype. You can do it completely free inside <strong>Google AI Studio</strong> (<code>aistudio.google.com</code>).</p>
  
  <ul>
    <li><strong>100% Free:</strong> Sign in directly with your regular Google/Gmail account at <code>aistudio.google.com</code>.</li>
    <li><strong>Zero Software to Install:</strong> Runs directly inside your mobile or laptop browser.</li>
    <li><strong>Instant Visual Mockups:</strong> It lets you see what your app will look like right on screen.</li>
  </ul>

  <div class="prompt-box">
    <div class="prompt-header">
      <span class="prompt-title">📋 Universal Idea-to-App Prompt (with Placeholders)</span>
    </div>
    <div class="prompt-body">"I have a business idea: I want to build a simple web application for <span class="placeholder-highlight">[INSERT BUSINESS TYPE — e.g. a car rental in Accra / a bakery in Kumasi / a church event / a hair salon]</span>.

The main problem it solves is: <span class="placeholder-highlight">[INSERT PROBLEM — e.g. customers currently have to call or DM manually on WhatsApp to book and pay]</span>.

Act as an expert software architect in Google AI Studio and break this down into 3 clear sections:

1. The Customer Journey: Exactly what the customer sees, clicks, and experiences from the homepage to confirmation.
2. The Required Form Fields: The exact information we need to collect (e.g. <span class="placeholder-highlight">[INSERT REQUIRED DETAILS — e.g. Full Name, WhatsApp Number, Service Type, Date/Time, Mobile Money Option]</span>).
3. The Visual Layout & Live Mockup: Generate the clean, modern visual layout code so I can see what this application looks like right inside my browser.

Keep the design clean, lightweight, and 100% mobile-friendly for Ghanaian users."</div>
  </div>

  <!-- SECTION 5 -->
  <h2>🛠️ 5. Framework 4: The 4 Golden Rules of Prompting</h2>
  <ol>
    <li><strong>Rule 1: Give AI a Role:</strong> Always start by assigning an identity (<em>"Act as a senior event coordinator..."</em> or <em>"Act as a copywriter..."</em>).</li>
    <li><strong>Rule 2: Provide Examples:</strong> Paste an example of what you like before asking for the result.</li>
    <li><strong>Rule 3: Use Step-by-Step Thinking:</strong> Add this phrase at the end of hard tasks: <em>"Think step-by-step before giving your final answer."</em></li>
    <li><strong>Rule 4: Never Restart—Iterate:</strong> If the AI’s answer is 70% good, reply: <em>"Make the tone more casual, cut paragraph two in half, and make the button green."</em></li>
  </ol>

  <!-- SECTION 6 & CTA -->
  <h2>🚀 6. The Next Step: Building Real Software with AI</h2>
  <p>Prompting AI to plan ideas is step 1. The real breakthrough happens when you use these exact same plain English prompts to <strong>build and deploy real, working web applications</strong> that Ghanaian businesses will pay you <strong>GHS 1,500 – GHS 5,000</strong> for.</p>
  <p>In our <strong>free live online workshop in September</strong>, we will open our laptops and show you how to use these prompt frameworks to build a complete, live web app from scratch!</p>

  <div class="cta-box">
    <div class="cta-title">👉 Join Our WhatsApp Community for Free Workshop Access</div>
    <p style="font-size: 8.5pt; color: #4338CA; margin-bottom: 6px;">Get the exact September date, live online access link, and free templates:</p>
    <a href="https://chat.whatsapp.com/LtAPH7IPPTg160oJj0REpS?s=cl&p=a&ilr=1" class="cta-link">Join Free WhatsApp Community</a>
  </div>

  <div class="footer-bar">
    <span>Sena Academy • Learning Portal</span>
    <span>senaacademy.org/waitlist</span>
    <span>“Stop learning to code. Start learning to build.”</span>
  </div>

</body>
</html>
  `;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
  });

  await browser.close();

  // Save to Downloads folder
  const downloadsPath = 'C:\\Users\\user\\Downloads\\The Non-Coder Guide to AI - How to Prompt Like a Pro.pdf';
  fs.writeFileSync(downloadsPath, pdfBuffer);
  console.log(`✅ Saved to Downloads: ${downloadsPath}`);

  // Save to public folder for website access
  const publicPath = path.join(__dirname, '..', 'public', 'ai-prompt-guide.pdf');
  fs.writeFileSync(publicPath, pdfBuffer);
  console.log(`✅ Saved to Public Web: ${publicPath}`);

  // Save to artifacts
  const artifactPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\c63ea1cb-b440-4fb3-8b78-7e272d659f4b\\The Non-Coder Guide to AI.pdf';
  fs.writeFileSync(artifactPath, pdfBuffer);
  console.log(`✅ Saved to Artifacts: ${artifactPath}`);
}

generatePdf().catch(err => console.error(err));
