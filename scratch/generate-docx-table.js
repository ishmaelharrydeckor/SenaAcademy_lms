const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType, AlignmentType, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

async function createDocx() {
  console.log('Generating styled .docx file on Desktop...');

  const borderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
  };

  const daysData = [
    // WEEK 1
    { day: "Day 1", week: "Week 1", format: "🎥 Talking Head", title: "How I made GHS 3,650 in 7 days without writing code", time: "12 mins", cta: "Comment 'PROOF'" },
    { day: "Day 2", week: "Week 1", format: "🎥 Talking Head", title: "Stop learning to code in 2026 (Do this instead)", time: "10 mins", cta: "Comment 'BUILD'" },
    { day: "Day 3", week: "Week 1", format: "🖼️ Photo Carousel", title: "3 simple web apps Ghanaian businesses pay GHS 1,500+ for", time: "3 mins", cta: "Comment 'APPS'" },
    { day: "Day 4", week: "Week 1", format: "📱 7-Second Loop", title: "Why coding bootcamps fail non-coders (Read caption for truth)", time: "2 mins", cta: "Comment 'NOCODE'" },
    { day: "Day 5", week: "Week 1", format: "💻 Screen Demo", title: "Watch me generate a full registration portal in 60 seconds", time: "4 mins", cta: "Comment 'PORTAL'" },
    { day: "Day 6", week: "Week 1", format: "📄 Text Graphic", title: "In 2026, syntax memorization is obsolete. Prompting is king.", time: "1 min", cta: "Comment 'BUILD'" },
    { day: "Day 7", week: "Week 1", format: "🖼️ Photo Carousel", title: "The 3 free AI tools on my laptop replacing a 4-year CS degree", time: "3 mins", cta: "Comment 'TOOLS'" },

    // WEEK 2
    { day: "Day 8", week: "Week 2", format: "💻 Screen Demo", title: "How to use Google AI Studio for free on your phone", time: "4 mins", cta: "Comment 'PROMPT'" },
    { day: "Day 9", week: "Week 2", format: "📱 7-Second Loop", title: "Agency: 4 Weeks & GHS 15k vs. AI Builder: 48 Hours & GHS 2k", time: "2 mins", cta: "Comment 'SPEED'" },
    { day: "Day 10", week: "Week 2", format: "🖼️ Photo Carousel", title: "The 3-part C.G.C. prompt formula that stops AI hallucination", time: "3 mins", cta: "Comment 'GUIDE'" },
    { day: "Day 11", week: "Week 2", format: "📄 Text Graphic", title: "The #1 reason 'build me a website' fails with AI (and the fix)", time: "1 min", cta: "Comment 'PROMPT'" },
    { day: "Day 12", week: "Week 2", format: "💻 Screen Demo", title: "How to connect Mobile Money checkout to any web app", time: "4 mins", cta: "Comment 'MOMO'" },
    { day: "Day 13", week: "Week 2", format: "📱 7-Second Loop", title: "Turning a raw voice note into a functional app layout", time: "2 mins", cta: "Comment 'VOICE'" },
    { day: "Day 14", week: "Week 2", format: "🎥 Talking Head", title: "Do you need a Computer Science degree to build software in 2026?", time: "10 mins", cta: "Comment 'BUILD'" },

    // WEEK 3
    { day: "Day 15", week: "Week 3", format: "🖼️ Photo Carousel", title: "How to price your web builds in Ghana: GHS 500 vs. GHS 3,000", time: "3 mins", cta: "Comment 'PRICE'" },
    { day: "Day 16", week: "Week 3", format: "📄 Text Graphic", title: "Why local salons & businesses are losing money on WhatsApp DMs", time: "1 min", cta: "Comment 'SOLVE'" },
    { day: "Day 17", week: "Week 3", format: "💻 Screen Demo", title: "Behind the scenes: The KNUST conference attendee check-in app", time: "5 mins", cta: "Comment 'EVENT'" },
    { day: "Day 18", week: "Week 3", format: "📱 7-Second Loop", title: "3 high-income tech skills you can learn in 14 days without code", time: "2 mins", cta: "Comment 'SKILLS'" },
    { day: "Day 19", week: "Week 3", format: "💻 Screen Demo", title: "How to deploy a live website to a public .com link for free", time: "4 mins", cta: "Comment 'HOST'" },
    { day: "Day 20", week: "Week 3", format: "🖼️ Photo Carousel", title: "The exact DM pitch template I use to land local business clients", time: "3 mins", cta: "Comment 'CLIENT'" },
    { day: "Day 21", week: "Week 3", format: "💻 Screen Demo", title: "Reviewing a Ghanaian business website & building a 10x fix", time: "5 mins", cta: "Comment 'AUDIT'" },

    // WEEK 4
    { day: "Day 22", week: "Week 4", format: "🖼️ Photo Carousel", title: "The complete Non-Coder AI Starter Kit (Free PDF Download)", time: "3 mins", cta: "Comment 'STARTER'" },
    { day: "Day 23", week: "Week 4", format: "📱 7-Second Loop", title: "What we are building in our September Free Live Online Workshop", time: "2 mins", cta: "Comment 'WORKSHOP'" },
    { day: "Day 24", week: "Week 4", format: "📄 Text Graphic", title: "Stop building from scratch in 2026. Use modern AI scaffolding.", time: "1 min", cta: "Comment 'TEMPLATES'" },
    { day: "Day 25", week: "Week 4", format: "🎥 Talking Head", title: "7 days until our Free Live Online Build Workshop!", time: "8 mins", cta: "Comment 'SEAT'" },
    { day: "Day 26", week: "Week 4", format: "🖼️ Photo Carousel", title: "Sneak peek of the live app blueprint we will build together", time: "3 mins", cta: "Comment 'JOIN'" },
    { day: "Day 27", week: "Week 4", format: "📱 7-Second Loop", title: "3 days left: Zero coding background required. Just bring laptop.", time: "2 mins", cta: "Comment 'READY'" },
    { day: "Day 28", week: "Week 4", format: "🎥 Talking Head", title: "48 hours countdown: Free Live Online Workshop (Laptop Checklist)", time: "8 mins", cta: "Comment 'LIVE'" },
    { day: "Day 29", week: "Week 4", format: "🖼️ Photo Carousel", title: "Tomorrow @ 7:00 PM: We are building a complete web app live!", time: "3 mins", cta: "Comment 'ACCESS'" },
    { day: "Day 30", week: "Week 4", format: "🎥 Direct Callout", title: "🚨 WE ARE LIVE ONLINE RIGHT NOW! (Join the room)", time: "2 mins", cta: "Comment 'ROOM'" },
  ];

  // Header Row
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Day", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 10, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Format", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 20, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Title / Hook", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 45, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Effort", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 10, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Comment CTA", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 15, type: WidthType.PERCENTAGE }
      }),
    ]
  });

  const tableRows = [headerRow];

  daysData.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowBg = isEven ? "F8FAFC" : "FFFFFF";

    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.day, bold: true })] })],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.format })] })],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.title })] })],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.time, color: "166534", bold: true })] })],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.cta, color: "4F46E5", bold: true })] })],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
        ]
      })
    );
  });

  const contentTable = new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: tableBorder
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 720, bottom: 720, left: 720, right: 720 }
        }
      },
      children: [
        new Paragraph({
          text: "SENA ACADEMY • 30-DAY CONTENT ENGINE",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "30-Day TikTok Multi-Format Content Engine & Lead Machine",
              bold: true,
              size: 32,
              color: "1E293B"
            })
          ],
          spacing: { after: 150 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Author: ", bold: true }),
            new TextRun({ text: "Ishmael Harry-Deckor (Founder, Sena Academy) | " }),
            new TextRun({ text: "Target: ", bold: true }),
            new TextRun({ text: "September Free Live Online Workshop & Waitlist Funnel" })
          ],
          spacing: { after: 300 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Strategic Overview:", bold: true, size: 22 })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "• Multi-Format Mix: Only 6 talking-head videos required; 24 days are rapid carousels, 7s loops, and screen recordings (average < 4 mins creation time).",
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: "• Comment Trigger Funnel: Solves TikTok bio link limits. Viewers comment keywords (e.g. 'BUILD', 'PROMPT') and receive automated DMs linking to senaacademy.org/waitlist?src=tiktok.",
          spacing: { after: 50 }
        }),
        new Paragraph({
          text: "• Two-Step Capture: Captures Name, Email, and Phone number first before redirecting to the private WhatsApp community and delivering the free AI Guide.",
          spacing: { after: 300 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "30-Day Master Calendar Table:", bold: true, size: 24, color: "4F46E5" })
          ],
          spacing: { after: 150 }
        }),
        contentTable,
        new Paragraph({
          children: [
            new TextRun({ text: "\n\nStandard DM Response Template (When viewers comment):", bold: true, size: 22 })
          ],
          spacing: { before: 300, after: 100 }
        }),
        new Paragraph({
          text: '\"Hey [Name]! Thanks for reaching out. Reserve your free spot for our September live online workshop here: 👉 https://senaacademy.org/waitlist?src=tiktok (You will get instant access to our private WhatsApp community and free AI Prompt Guide right after registering!) 🚀\"',
          spacing: { after: 200 }
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);

  // 1. Save directly on Desktop
  const desktopPath = 'C:\\Users\\user\\Desktop\\30-Day TikTok Multi-Format Content Engine.docx';
  fs.writeFileSync(desktopPath, buffer);
  console.log(`✅ Successfully saved to Desktop: ${desktopPath}`);

  // 2. Save in Downloads
  const downloadsPath = 'C:\\Users\\user\\Downloads\\30-Day TikTok Multi-Format Content Engine.docx';
  fs.writeFileSync(downloadsPath, buffer);
  console.log(`✅ Successfully saved to Downloads: ${downloadsPath}`);

  // 3. Save in scratch
  const scratchPath = path.join(__dirname, '30-Day TikTok Multi-Format Content Engine.docx');
  fs.writeFileSync(scratchPath, buffer);
  console.log(`✅ Saved in Scratch: ${scratchPath}`);
}

createDocx().catch(err => console.error(err));
