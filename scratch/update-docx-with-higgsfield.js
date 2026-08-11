const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, BorderStyle, WidthType, AlignmentType, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

async function updateDocxWithHiggsfield() {
  console.log('Generating updated 30-Day Content Engine with Higgsfield prompts on Desktop...');

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
    {
      day: "Day 1",
      week: "Week 1",
      format: "🎥 Talking Head + Visual Proof",
      title: "How I made GHS 3,650 in 7 days without writing code",
      cta: 'Comment "PROOF"',
      saving: "Turns flat Paystack screenshot into a dynamic 3D camera push-in commercial.",
      prompt: 'Image-to-Video: [UPLOAD paystack-proof.jpg] -> Motion: "Slow cinematic 3D push-in, subtle holographic glowing highlights on revenue numbers GHS 3,650, 4k tech aesthetic, 9:16 vertical"'
    },
    {
      day: "Day 2",
      week: "Week 1",
      format: "🎥 Talking Head + Pattern Interrupt",
      title: "Stop learning to code in 2026 (Do this instead)",
      cta: 'Comment "BUILD"',
      saving: "Creates a 2-second explosive visual intro hook so viewers don't scroll past.",
      prompt: 'Text-to-Video: "Dramatic crash zoom into a chaotic wall of glowing computer code lines dissolving into digital smoke and morphing into a clean 1-click button, cinematic lighting, 9:16 vertical"'
    },
    {
      day: "Day 3",
      week: "Week 1",
      format: "🖼️ Photo Carousel + 3D UI",
      title: "3 simple web apps Ghanaian businesses pay GHS 1,500+ for",
      cta: 'Comment "APPS"',
      saving: "Animates 3 flat app wireframes (salon booking, check-in, MoMo) into 3D rotating cards.",
      prompt: 'Image-to-Video: [UPLOAD UI mockup of salon/event app] -> Motion: "Smooth 3D orbital pan around mobile phone mockup showing booking form, soft studio lighting, 9:16 vertical"'
    },
    {
      day: "Day 4",
      week: "Week 1",
      format: "📱 7-Second Loop",
      title: "Why coding bootcamps fail non-coders (Read caption)",
      cta: 'Comment "NOCODE"',
      saving: "Zero filming needed. Generates 7-second moody workspace loop to maximize watch-time.",
      prompt: 'Text-to-Video: "Cinematic 7-second loop of hands typing on a glowing laptop keyboard in a dark modern studio, shallow depth of field, purple rim light, 35mm film grain, 9:16 vertical"'
    },
    {
      day: "Day 5",
      week: "Week 1",
      format: "💻 Screen Demo + UI Motion",
      title: "Watch me generate a full registration portal in 60 seconds",
      cta: 'Comment "PORTAL"',
      saving: "Generates high-tech intro bumper showing automated form generation.",
      prompt: 'Text-to-Video: "Futuristic digital wireframe of an event registration portal assembling itself in real-time on a glass display screen, indigo glow, smooth camera pan, 9:16 vertical"'
    },
    {
      day: "Day 6",
      week: "Week 1",
      format: "📄 Text Graphic / Faceless Video",
      title: "In 2026, syntax memorization is obsolete. Prompting is king.",
      cta: 'Comment "BUILD"',
      saving: "100% no-camera workflow. Generates minimalist background for quote overlay.",
      prompt: 'Text-to-Video: "Minimalist dark aesthetic background with subtle floating neon particles and smooth geometric lighting, slow cinematic drift, 9:16 vertical"'
    },
    {
      day: "Day 7",
      week: "Week 1",
      format: "🖼️ Photo Carousel + Tool Showcase",
      title: "The 3 free AI tools on my laptop replacing a 4-year CS degree",
      cta: 'Comment "TOOLS"',
      saving: "Turns 3 static logos/interfaces into floating 3D glass icons.",
      prompt: 'Image-to-Video: [UPLOAD Cursor & Google AI Studio screenshots] -> Motion: "Floating 3D glass UI badges with soft ambient reflections and slow camera tilt, premium tech look, 9:16 vertical"'
    },

    // WEEK 2
    {
      day: "Day 8",
      week: "Week 2",
      format: "💻 Screen Demo (Google AI Studio)",
      title: "How to use Google AI Studio for free on your phone",
      cta: 'Comment "PROMPT"',
      saving: "Creates high-energy intro hook showing AI generating full layout instantly.",
      prompt: 'Text-to-Video: "Close-up of a modern smartphone screen displaying a futuristic AI chat prompt turning into a working website preview, neon green accent, 9:16 vertical"'
    },
    {
      day: "Day 9",
      week: "Week 2",
      format: "📱 7-Second Loop",
      title: "Agency: 4 Weeks & GHS 15k vs. AI Builder: 48 Hours & GHS 2k",
      cta: 'Comment "SPEED"',
      saving: "Generates high-speed time-lapse background comparing slow vs fast building.",
      prompt: 'Text-to-Video: "Split-screen aesthetic time-lapse: Left side dark slow dusty clock, right side ultra-fast sleek neon developer shipping code, high contrast cinematic, 9:16 vertical"'
    },
    {
      day: "Day 10",
      week: "Week 2",
      format: "🖼️ Photo Carousel (CGC Framework)",
      title: "The 3-part C.G.C. prompt formula that stops AI hallucination",
      cta: 'Comment "GUIDE"',
      saving: "Generates 3 visually distinct stylized diagrams for Context, Goal, and Constraints.",
      prompt: 'Text-to-Video: "Three glowing modular 3D building blocks snapping together with precision on a dark slate tabletop, emerald and purple glow, 9:16 vertical"'
    },
    {
      day: "Day 11",
      week: "Week 2",
      format: "📄 Text Graphic / Faceless Video",
      title: "The #1 reason 'build me a website' fails with AI (and the fix)",
      cta: 'Comment "PROMPT"',
      saving: "Provides clean aesthetic B-roll background for text breakdown without recording face.",
      prompt: 'Text-to-Video: "Overhead top-down camera view of a modern wooden desk with a MacBook, notebook, coffee cup, and soft morning sunlight, smooth slow pan, 9:16 vertical"'
    },
    {
      day: "Day 12",
      week: "Week 2",
      format: "💻 Screen Demo (MoMo Checkout)",
      title: "How to connect Mobile Money checkout to any web app",
      cta: 'Comment "MOMO"',
      saving: "Creates dynamic 3D animation of a phone completing an instant MoMo payment.",
      prompt: 'Image-to-Video: [UPLOAD Paystack MoMo modal screenshot] -> Motion: "Dynamic 3D push-in with green glowing checkmark and confetti particles on payment success, 9:16 vertical"'
    },
    {
      day: "Day 13",
      week: "Week 2",
      format: "📱 7-Second Loop",
      title: "Turning a raw voice note into a functional app layout",
      cta: 'Comment "VOICE"',
      saving: "Zero filming. Generates futuristic soundwave visual transforming into UI.",
      prompt: 'Text-to-Video: "A glowing audio soundwave pulsating with neon purple light, smoothly transforming into structured digital wireframe boxes, cinematic 4k, 9:16 vertical"'
    },
    {
      day: "Day 14",
      week: "Week 2",
      format: "🎥 Talking Head (CS Degree Myth)",
      title: "Do you need a Computer Science degree to build software in 2026?",
      cta: 'Comment "BUILD"',
      saving: "Creates high-contrast visual intro hook contrasting old degree vs modern AI builder.",
      prompt: 'Text-to-Video: "A graduation cap dissolving into glowing lines of modern AI software code, cinematic slow motion, dramatic studio lighting, 9:16 vertical"'
    },

    // WEEK 3
    {
      day: "Day 15",
      week: "Week 3",
      format: "🖼️ Photo Carousel (Pricing Guide)",
      title: "How to price your web builds in Ghana: GHS 500 vs. GHS 3,000",
      cta: 'Comment "PRICE"',
      saving: "Generates high-end financial graphics and value-ladder slides.",
      prompt: 'Text-to-Video: "Clean 3D bar chart with glowing green currency bars rising exponentially on a dark slate background, smooth cinematic camera tilt, 9:16 vertical"'
    },
    {
      day: "Day 16",
      week: "Week 3",
      format: "📄 Text Graphic / Faceless Video",
      title: "Why local salons & businesses are losing money on WhatsApp DMs",
      cta: 'Comment "SOLVE"',
      saving: "Faceless B-roll showing chaotic messaging vs seamless automated booking.",
      prompt: 'Text-to-Video: "Overhead shot of a smartphone receiving dozens of unread WhatsApp message notifications, transition into a clean calm booking screen, 9:16 vertical"'
    },
    {
      day: "Day 17",
      week: "Week 3",
      format: "💻 Screen Demo (KNUST Case Study)",
      title: "Behind the scenes: The KNUST conference attendee check-in app",
      cta: 'Comment "EVENT"',
      saving: "Creates cinematic establishing shot of modern African university auditorium.",
      prompt: 'Text-to-Video: "Cinematic drone view of a modern conference hall with hundreds of attendees checking in at digital kiosks, warm lighting, 4k photorealistic, 9:16 vertical"'
    },
    {
      day: "Day 18",
      week: "Week 3",
      format: "📱 7-Second Loop",
      title: "3 high-income tech skills you can learn in 14 days without code",
      cta: 'Comment "SKILLS"',
      saving: "Zero filming. Generates aesthetic late-night developer workspace loop.",
      prompt: 'Text-to-Video: "Cinematic close-up of a founder focused on a glowing dual-monitor setup at night, indigo and cyan backlight, smooth slow camera zoom, 9:16 vertical"'
    },
    {
      day: "Day 19",
      week: "Week 3",
      format: "💻 Screen Demo (1-Click Deployment)",
      title: "How to deploy a live website to a public .com link for free",
      cta: 'Comment "HOST"',
      saving: "Generates dynamic globe network animation showing global deployment.",
      prompt: 'Text-to-Video: "A glowing 3D digital globe with fiber optic network lines connecting from Accra to the cloud with instant green Deployed badge, 9:16 vertical"'
    },
    {
      day: "Day 20",
      week: "Week 3",
      format: "🖼️ Photo Carousel (Cold DM Script)",
      title: "The exact DM pitch template I use to land local business clients",
      cta: 'Comment "CLIENT"',
      saving: "Creates stylized mockup slides of Instagram and WhatsApp DM conversations.",
      prompt: 'Image-to-Video: [UPLOAD DM pitch screenshot] -> Motion: "Smooth 3D push-in on verified DM chat bubble with glowing gold outline, premium UI look, 9:16 vertical"'
    },
    {
      day: "Day 21",
      week: "Week 3",
      format: "💻 Screen Demo (Website Audit)",
      title: "Reviewing a Ghanaian business website & building a 10x fix",
      cta: 'Comment "AUDIT"',
      saving: "Generates a futuristic scanner HUD overlay over website screenshots.",
      prompt: 'Text-to-Video: "Futuristic holographic UI scanner analyzing a webpage wireframe with glowing red Problems turning into green Optimized checkmarks, 9:16 vertical"'
    },

    // WEEK 4
    {
      day: "Day 22",
      week: "Week 4",
      format: "🖼️ Photo Carousel (Free Starter Kit)",
      title: "The complete Non-Coder AI Starter Kit (Free PDF Download)",
      cta: 'Comment "STARTER"',
      saving: "Turns flat PDF guide cover into a 3D rotating magazine / eBook mockup.",
      prompt: 'Image-to-Video: [UPLOAD Guide PDF cover image] -> Motion: "3D floating eBook mockup opening with glowing pages turning slowly, clean studio lighting, 9:16 vertical"'
    },
    {
      day: "Day 23",
      week: "Week 4",
      format: "📱 7-Second Loop",
      title: "What we are building in our September Free Live Online Workshop",
      cta: 'Comment "WORKSHOP"',
      saving: "Generates high-energy sneak peek loop of a deployed full-stack web app.",
      prompt: 'Text-to-Video: "Dynamic 3D camera pan across a modern SaaS dashboard with live analytics, user logins, and payment notifications, high tech aesthetic, 9:16 vertical"'
    },
    {
      day: "Day 24",
      week: "Week 4",
      format: "📄 Text Graphic / Faceless Video",
      title: "Stop building from scratch in 2026. Use modern AI scaffolding.",
      cta: 'Comment "TEMPLATES"',
      saving: "Faceless visual metaphor of lego blocks assembling into an app.",
      prompt: 'Text-to-Video: "Futuristic digital modular blocks assembling effortlessly into a completed luxury modern house, sleek lighting, 9:16 vertical"'
    },
    {
      day: "Day 25",
      week: "Week 4",
      format: "🎥 Talking Head (7 Days Countdown)",
      title: "7 days until our Free Live Online Build Workshop!",
      cta: 'Comment "SEAT"',
      saving: "Creates intense 3D countdown clock intro hook.",
      prompt: 'Text-to-Video: "Dramatic glowing 3D countdown digital clock ticking from 7 to 0 with energetic light flare and bass impact, 9:16 vertical"'
    },
    {
      day: "Day 26",
      week: "Week 4",
      format: "🖼️ Photo Carousel (Blueprint Teaser)",
      title: "Sneak peek of the live app blueprint we will build together",
      cta: 'Comment "JOIN"',
      saving: "Animates the workshop project blueprint with glowing connection lines.",
      prompt: 'Text-to-Video: "Architectural blueprint of a modern web application with glowing neon lines connecting user frontend to database, smooth camera tilt, 9:16 vertical"'
    },
    {
      day: "Day 27",
      week: "Week 4",
      format: "📱 7-Second Loop",
      title: "3 days left: Zero coding background required. Just bring laptop.",
      cta: 'Comment "READY"',
      saving: "Zero filming. Generates clean minimalist laptop opening loop.",
      prompt: 'Text-to-Video: "Cinematic close-up of a sleek modern laptop opening in a stylish coffee shop in Accra, morning light, smooth 60fps, 9:16 vertical"'
    },
    {
      day: "Day 28",
      week: "Week 4",
      format: "🎥 Talking Head (48 Hours Checklist)",
      title: "48 hours countdown: Free Live Online Workshop (Laptop Checklist)",
      cta: 'Comment "LIVE"',
      saving: "Generates 3D animated checklist graphic floating next to you on screen.",
      prompt: 'Text-to-Video: "Futuristic floating holographic checklist with 3 glowing green checkmarks checking off in sequence, high-tech HUD look, 9:16 vertical"'
    },
    {
      day: "Day 29",
      week: "Week 4",
      format: "🖼️ Photo Carousel (Tomorrow Live)",
      title: "Tomorrow @ 7:00 PM: We are building a complete web app live!",
      cta: 'Comment "ACCESS"',
      saving: "Creates high-urgency neon event pass / admission ticket animation.",
      prompt: 'Text-to-Video: "VIP glowing holographic digital access ticket floating and rotating in dark space with glowing LIVE WORKSHOP text, 9:16 vertical"'
    },
    {
      day: "Day 30",
      week: "Week 4",
      format: "🎥 Direct Callout (Live Now)",
      title: "🚨 WE ARE LIVE ONLINE RIGHT NOW! (Join the room)",
      cta: 'Comment "ROOM"',
      saving: "Creates pulsating red/green ON AIR studio sign animation.",
      prompt: 'Text-to-Video: "Neon glowing ON AIR / LIVE NOW studio sign flashing with energetic red and indigo light flares in a dark modern creator studio, 9:16 vertical"'
    },
  ];

  // Build Table
  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Day", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 8, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Format & Hook", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 27, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "How Higgsfield Saves You", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 25, type: WidthType.PERCENTAGE }
      }),
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: "Higgsfield Prompt (with Placeholders)", bold: true, color: "FFFFFF" })] })],
        shading: { type: ShadingType.CLEAR, fill: "4F46E5" },
        width: { size: 40, type: WidthType.PERCENTAGE }
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
            children: [
              new Paragraph({ children: [new TextRun({ text: item.format, bold: true, color: "1E293B" })] }),
              new Paragraph({ children: [new TextRun({ text: item.title, italic: true, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `CTA: ${item.cta}`, color: "4F46E5", bold: true, size: 18 })] })
            ],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.saving, color: "166534", size: 18 })] })],
            shading: { type: ShadingType.CLEAR, fill: rowBg }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: item.prompt, font: "Consolas", size: 17, color: "0F172A" })] })],
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
          text: "SENA ACADEMY • TIKTOK GROWTH & HIGGSFIELD ENGINE",
          heading: HeadingLevel.HEADING_3,
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "30-Day TikTok Content Engine + Higgsfield AI Automation Playbook",
              bold: true,
              size: 30,
              color: "1E293B"
            })
          ],
          spacing: { after: 150 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Creator: ", bold: true }),
            new TextRun({ text: "Ishmael Harry-Deckor (Founder, Sena Academy) | " }),
            new TextRun({ text: "Tool Stack: ", bold: true }),
            new TextRun({ text: "Higgsfield Pro (Seedance 2.0 CLI) + Google AI Studio + Cursor" })
          ],
          spacing: { after: 250 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "The 4 Higgsfield Production Levers:", bold: true, size: 22 })
          ],
          spacing: { after: 80 }
        }),
        new Paragraph({
          text: "1. 7-Second Aesthetic B-Roll Loops: Zero filming required. High-retention 4K background loops generated in 60 seconds.",
          spacing: { after: 40 }
        }),
        new Paragraph({
          text: "2. 3D UI & Mockup Motion (Image-to-Video): Turns static 2D app screenshots into dynamic 3D camera fly-through commercials.",
          spacing: { after: 40 }
        }),
        new Paragraph({
          text: "3. 3-Second Scroll-Stopping Visual Hooks: High-impact pattern interrupts placed in the first 2 seconds to double watch-through rates.",
          spacing: { after: 40 }
        }),
        new Paragraph({
          text: "4. 100% Faceless Video Production: Clean B-roll packs stitched together with simple voiceovers on busy days.",
          spacing: { after: 250 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Complete 30-Day Content Engine Table (with Higgsfield Prompts):", bold: true, size: 24, color: "4F46E5" })
          ],
          spacing: { after: 150 }
        }),
        contentTable,
        new Paragraph({
          children: [
            new TextRun({ text: "\nStandard DM Reply Template (For all comment triggers):", bold: true, size: 22 })
          ],
          spacing: { before: 250, after: 100 }
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
  console.log(`✅ Successfully updated Desktop file: ${desktopPath}`);

  // 2. Save in Downloads
  const downloadsPath = 'C:\\Users\\user\\Downloads\\30-Day TikTok Multi-Format Content Engine.docx';
  fs.writeFileSync(downloadsPath, buffer);
  console.log(`✅ Successfully updated Downloads file: ${downloadsPath}`);

  // 3. Save in scratch
  const scratchPath = path.join(__dirname, '30-Day TikTok Multi-Format Content Engine.docx');
  fs.writeFileSync(scratchPath, buffer);
  console.log(`✅ Updated Scratch copy: ${scratchPath}`);
}

updateDocxWithHiggsfield().catch(err => console.error(err));
