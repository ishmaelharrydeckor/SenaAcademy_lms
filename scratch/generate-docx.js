const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } = require('docx');

async function createDoc() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "30-DAY TIKTOK CONTENT ENGINE & MASTER PLAYBOOK",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Personal Brand, Client Acquisition & Cohort 2 Launch Strategy",
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "Author: Ishmael Harry-Deckor | Sena Academy\nTagline: \"Stop learning to code. Start learning to build.\"",
                italics: true,
                color: "555555",
              })
            ]
          }),

          // Section 1: Brand Identity & Signature Positioning
          new Paragraph({
            text: "1. Brand Identity & Signature Positioning",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "• Target Audience: Non-coders, aspiring builders, tech career changers, and local business clients in Ghana.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Core Slogan: \"Stop learning to code. Start learning to build.\"",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Archetype (Russell Brunson): The Authentic Underdog Builder documenting the real journey from GHS 0 to consistent client deals.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Signature Recurring Series: \"Idea to Live App\" (building functional business prototypes with AI in 60s).",
            spacing: { after: 200 },
          }),

          // Section 2: The 4 Core Content Pillars
          new Paragraph({
            text: "2. The 4 Content Pillars",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "1. Pillar 1: Proof & Case Studies (The Authority)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "Real monetary numbers (Paystack GHS 3,650), speed of delivery (72-hour turnaround), and client invoices. Proof destroys skepticism instantly.",
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: "2. Pillar 2: Old Way vs. New Way (The Pattern Interrupt)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "Challenging traditional tech tutorials. Contrasting 6 months of syntax memorization vs. shipping full apps in 2 weeks with modern AI tools.",
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: "3. Pillar 3: Build in Public (The How-To)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "Laptop screen recordings showing real-world development in Cursor AI, Next.js, and Supabase. High bookmark and save rate.",
            spacing: { after: 150 },
          }),
          new Paragraph({
            text: "4. Pillar 4: Local Tech Opportunities (The Aspiration)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "Hyper-local Ghanaian market insights: most in-demand web features for businesses in Accra, pricing structures (GHS 1,500 - 5,000), and remote earning.",
            spacing: { after: 300 },
          }),

          // Section 3: The 30-Day Master Calendar Table
          new Paragraph({
            text: "3. The 30-Day Master Content Calendar",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Day", children: [new TextRun({ text: "Day", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Video Hook / Topic", children: [new TextRun({ text: "Video Hook / Topic", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Pillar", children: [new TextRun({ text: "Pillar", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ text: "Core Takeaway", children: [new TextRun({ text: "Core Takeaway", bold: true })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 1")] }),
                  new TableCell({ children: [new Paragraph("How I made GHS 3,650 in 7 days using AI")] }),
                  new TableCell({ children: [new Paragraph("Proof")] }),
                  new TableCell({ children: [new Paragraph("Big proof announcement & waitlist seed")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 2")] }),
                  new TableCell({ children: [new Paragraph("What I actually built for GHS 3,650")] }),
                  new TableCell({ children: [new Paragraph("Demo")] }),
                  new TableCell({ children: [new Paragraph("Laptop screen recording of the app & 72h delivery")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 3")] }),
                  new TableCell({ children: [new Paragraph("Why spending 6 months learning syntax is a trap")] }),
                  new TableCell({ children: [new Paragraph("Old vs New")] }),
                  new TableCell({ children: [new Paragraph("Contrasting manual coding vs AI building")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 4")] }),
                  new TableCell({ children: [new Paragraph("The 3 AI tools on my laptop that do 80% of work")] }),
                  new TableCell({ children: [new Paragraph("Tech Stack")] }),
                  new TableCell({ children: [new Paragraph("Walkthrough of Cursor, Next.js, Supabase")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 5")] }),
                  new TableCell({ children: [new Paragraph("How an AI app got me recognized at a tech conference")] }),
                  new TableCell({ children: [new Paragraph("Authority")] }),
                  new TableCell({ children: [new Paragraph("Conference recognition story & stage applause")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 6")] }),
                  new TableCell({ children: [new Paragraph("Building a barbershop booking system in 10 mins")] }),
                  new TableCell({ children: [new Paragraph("Build in Public")] }),
                  new TableCell({ children: [new Paragraph("Solving a real Accra business problem")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 7")] }),
                  new TableCell({ children: [new Paragraph("The exact DM script I use to pitch local businesses")] }),
                  new TableCell({ children: [new Paragraph("Client Acquisition")] }),
                  new TableCell({ children: [new Paragraph("How non-coders can reach out to clients")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 8")] }),
                  new TableCell({ children: [new Paragraph("Look at this Paystack graph: Flatline vs Spike")] }),
                  new TableCell({ children: [new Paragraph("Storytime")] }),
                  new TableCell({ children: [new Paragraph("The journey from 0 to first revenue with Green Screen")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 9")] }),
                  new TableCell({ children: [new Paragraph("3 high-paying software features Ghanaian businesses need")] }),
                  new TableCell({ children: [new Paragraph("Client Ed")] }),
                  new TableCell({ children: [new Paragraph("Invoicing, WhatsApp alerts, Paystack checkouts")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 10")] }),
                  new TableCell({ children: [new Paragraph("How I deploy full websites with 1 click using Vercel")] }),
                  new TableCell({ children: [new Paragraph("Micro-Tutorial")] }),
                  new TableCell({ children: [new Paragraph("Demystifying hosting and custom domains")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 11")] }),
                  new TableCell({ children: [new Paragraph("Stop learning to code. Start learning to build.")] }),
                  new TableCell({ children: [new Paragraph("Philosophy")] }),
                  new TableCell({ children: [new Paragraph("Core mindset shift for non-coders in 2026")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 12")] }),
                  new TableCell({ children: [new Paragraph("How to set up a database in 5 minutes with Supabase")] }),
                  new TableCell({ children: [new Paragraph("Micro-Tutorial")] }),
                  new TableCell({ children: [new Paragraph("User auth and logins made dead simple")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 13")] }),
                  new TableCell({ children: [new Paragraph("3 biggest mistakes Ghanaian tech beginners make")] }),
                  new TableCell({ children: [new Paragraph("Educational")] }),
                  new TableCell({ children: [new Paragraph("Tutorial trap, no portfolio, complex setups")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 14")] }),
                  new TableCell({ children: [new Paragraph("Building a real estate listing page live with AI")] }),
                  new TableCell({ children: [new Paragraph("Build in Public")] }),
                  new TableCell({ children: [new Paragraph("Rapid UI prototyping in Next.js")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 15")] }),
                  new TableCell({ children: [new Paragraph("How non-coders build MVPs without tech co-founders")] }),
                  new TableCell({ children: [new Paragraph("Founder Advice")] }),
                  new TableCell({ children: [new Paragraph("Empowering entrepreneurs to launch tools")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 16")] }),
                  new TableCell({ children: [new Paragraph("How much should you charge for an AI web app in Ghana?")] }),
                  new TableCell({ children: [new Paragraph("Pricing")] }),
                  new TableCell({ children: [new Paragraph("GHS 1,500 - 5,000 freelance pricing framework")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 17")] }),
                  new TableCell({ children: [new Paragraph("The prompt formula I feed AI to write complete backend APIs")] }),
                  new TableCell({ children: [new Paragraph("Deep-Dive")] }),
                  new TableCell({ children: [new Paragraph("Prompt engineering mechanics for devs")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 18")] }),
                  new TableCell({ children: [new Paragraph("Why local companies are hiring AI builders over agencies")] }),
                  new TableCell({ children: [new Paragraph("Market Insight")] }),
                  new TableCell({ children: [new Paragraph("Speed of delivery beats agency overhead")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 19")] }),
                  new TableCell({ children: [new Paragraph("Announcing the exact date for THE BUILDER SESSION '26")] }),
                  new TableCell({ children: [new Paragraph("Event Hype")] }),
                  new TableCell({ children: [new Paragraph("Teaser of live build workshop")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 20")] }),
                  new TableCell({ children: [new Paragraph("My 3-screen desk setup as a solo developer in Accra")] }),
                  new TableCell({ children: [new Paragraph("Lifestyle")] }),
                  new TableCell({ children: [new Paragraph("Behind-the-scenes builder lifestyle")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 21")] }),
                  new TableCell({ children: [new Paragraph("What we are building live this week on Google Meet")] }),
                  new TableCell({ children: [new Paragraph("Sneak Peek")] }),
                  new TableCell({ children: [new Paragraph("Revealing the starter code templates")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 22")] }),
                  new TableCell({ children: [new Paragraph("Why I'm making this September workshop 100% free")] }),
                  new TableCell({ children: [new Paragraph("Values")] }),
                  new TableCell({ children: [new Paragraph("Mission to build Ghanaian tech talent")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 23")] }),
                  new TableCell({ children: [new Paragraph("Answering your top questions about AI development")] }),
                  new TableCell({ children: [new Paragraph("Q&A")] }),
                  new TableCell({ children: [new Paragraph("Replying to comment objections")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 24")] }),
                  new TableCell({ children: [new Paragraph("Closing the free waitlist in 48 hours")] }),
                  new TableCell({ children: [new Paragraph("Urgency")] }),
                  new TableCell({ children: [new Paragraph("Final push to senaacademy.org/waitlist")] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Day 25")] }),
                  new TableCell({ children: [new Paragraph("Tomorrow is the day: Have your laptops ready")] }),
                  new TableCell({ children: [new Paragraph("Last Call")] }),
                  new TableCell({ children: [new Paragraph("Final countdown for live workshop")] }),
                ]
              }),
            ]
          }),

          // Section 4: Production Workflows & Zero-Skill Editing
          new Paragraph({
            text: "4. Zero-Skill Production & Weekend Batching System",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "• The 90-Minute Saturday Batch Routine:",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "1. Minutes 0-20: Screen record the 2 laptop app demos in Cursor / browser.\n2. Minutes 20-70: Sit in front of a window, record 5 speaking scripts back-to-back using jump cuts.\n3. Minutes 70-90: Import to CapCut, click 'Auto-Captions', add screen overlay, and save drafts.",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "• Editing Rules for Maximum Retention:",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "1. Zero Dead Air at 0:00: Cut the start so speech begins on frame 1.\n2. Center Graphics: Keep screenshots in the middle 60% of the screen.\n3. Ghost Volume: Keep background trending audio at 4-7% so voice is crystal clear.\n4. Call to Action: Every video directs to senaacademy.org/waitlist.",
            spacing: { after: 300 },
          }),

          // Section 5: Complete Script Swipe File (Video 1 - 5)
          new Paragraph({
            text: "5. Production Script Swipe File",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Script for Video #2: \"What I Actually Built for GHS 3,650\"",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "[00:00 - 00:05] \"A lot of people saw my last video and asked: 'What did you actually build to make GHS 3,650 in a week using AI?' Let me show you.\"\n\n[00:05 - 00:18] \"If I tried to code this by hand two years ago, it would have taken 4 to 6 weeks of writing backend logic and styling CSS from scratch. But with modern AI workflows, I shipped the entire project in 72 hours.\"\n\n[00:18 - 00:30] \"I used AI to scaffold the modern frontend layout, connected Supabase for instant database storage, and deployed it live with one click. It solved the client's problem immediately.\"\n\n[00:30 - 00:45] \"In September, I'm hosting a 100% free live workshop where we will build a working web app together from scratch. Link is in my bio to join the free waitlist 👉 senaacademy.org/waitlist.\"",
            spacing: { after: 200 },
          }),
          new Paragraph({
            text: "Script for Video #3: \"The Conference Recognition\"",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "[00:00 - 00:05] \"This was the moment I got called out at a tech conference for an app I built using AI in less than 48 hours.\"\n\n[00:05 - 00:20] \"The event organizers had a huge issue with slow, messy registration lines at the door. Instead of spending weeks building something from scratch, I used modern AI development tools to build a fast registration system in two days.\"\n\n[00:20 - 00:32] \"The attendees checked in within seconds, the flow was smooth, and the organizers gave me this recognition. You don't need a 4-year degree to build software that solves real problems.\"\n\n[00:32 - 00:45] \"In September, I'm hosting a free live session showing you how to build real apps like this using AI. Join the free waitlist in my bio 👉 senaacademy.org/waitlist.\"",
            spacing: { after: 200 },
          }),
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Save to Downloads folder
  const downloadsPath = path.join('C:', 'Users', 'user', 'Downloads', '30-Day TikTok Content Engine & Copywriting Master Playbook.docx');
  fs.writeFileSync(downloadsPath, buffer);
  console.log(`✅ Saved to Downloads: ${downloadsPath}`);

  // Save to local project scratch folder
  const scratchPath = path.join(__dirname, '30-Day TikTok Content Engine & Copywriting Master Playbook.docx');
  fs.writeFileSync(scratchPath, buffer);
  console.log(`✅ Saved to Scratch: ${scratchPath}`);
}

createDoc().catch(err => console.error(err));
