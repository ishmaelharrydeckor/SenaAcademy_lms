const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, ShadingType } = require('docx');
const fs = require('fs');
const path = require('path');

async function generateExamCarouselPack() {
  console.log('Generating Exam Season Autopilot Carousel Pack .docx on Desktop...');

  const carousels = [
    {
      number: "1",
      title: "The 3 Free AI Tools Replacing a 4-Year CS Degree",
      cta: 'Comment "TOOLS"',
      slides: [
        { num: "Slide 1 (Hook)", text: "3 free AI tools on my laptop replacing a 4-year Computer Science degree in Ghana 🇬🇭\n(Swipe to see the stack 👉)" },
        { num: "Slide 2 (Tool 1)", text: "1. Google AI Studio (aistudio.google.com)\n• What it is: A free direct playground to test plain-English prompts with zero setup.\n• How we use it: Generate full UI wireframes, forms, and functional prototypes in 60 seconds." },
        { num: "Slide 3 (Tool 2)", text: "2. Cursor AI (cursor.com)\n• What it is: An AI code editor that writes and debugs entire web platforms using plain English instructions.\n• How we use it: Edit multiple files at once without typing syntax by hand." },
        { num: "Slide 4 (Tool 3)", text: "3. Supabase (supabase.com)\n• What it is: A complete cloud database and user login system that takes 2 minutes to connect.\n• How we use it: Store attendee registrations, bookings, and customer profiles securely." },
        { num: "Slide 5 (CTA)", text: "Want to learn how we connect these 3 tools live?\n\nI put together a free Non-Coder Prompt Guide breaking down how to use them from zero.\n\nComment \"TOOLS\" below 👇\n(I'll DM you the free guide + workshop invite!)" }
      ],
      caption: "You don't need expensive coding bootcamps in 2026. These 3 free tools allow you to build and ship real software from a coffee shop in Accra. Comment 'TOOLS' below and I'll DM you our free starter guide! 🚀 #techghana #noncoder #senaacademy"
    },
    {
      number: "2",
      title: "The 3-Part C.G.C. Prompt Formula (Stop AI Hallucination)",
      cta: 'Comment "PROMPT"',
      slides: [
        { num: "Slide 1 (Hook)", text: "Why 90% of beginners fail when asking AI to build websites (and the 3-part fix) 👇 (Swipe 👉)" },
        { num: "Slide 2 (Part 1: Context)", text: "1. [C] - Context (Who the AI is)\n• The Mistake: Asking 'Build me a booking page'.\n• The Fix: 'You are an expert full-stack product engineer building a mobile-first appointment booking page for a hair salon in Accra.'" },
        { num: "Slide 3 (Part 2: Goal)", text: "2. [G] - Goal (What the user must accomplish)\n• The Fix: 'The goal is allowing clients to select a hairstyle service, pick an open 1-hour time slot, and pay a deposit via Mobile Money.'" },
        { num: "Slide 4 (Part 3: Constraints)", text: "3. [C] - Constraints (Rules the AI cannot break)\n• The Fix: 'Use clean modern dark mode, zero complex setup, store submissions in Supabase, and validate Ghanaian phone numbers (+233).'" },
        { num: "Slide 5 (CTA)", text: "Want our 10 copy-paste prompt templates using this formula?\n\nGrab our free Non-Coder Guide to AI.\n\nComment \"PROMPT\" below 👇\n(I'll DM you the direct guide link right now!)" }
      ],
      caption: "When you give AI vague instructions, it gives you broken code. When you use the C.G.C. formula, it builds functional software on the first try. Comment 'PROMPT' for the free template guide! 🔥 #aitools #promptengineering #senaacademy"
    },
    {
      number: "3",
      title: "Why 'Build Me a Website' Fails (The Reverse-Interview Technique)",
      cta: 'Comment "INTERVIEW"',
      slides: [
        { num: "Slide 1 (Hook)", text: "The #1 prompt trick I use to get AI to build entire software architectures without mistakes 👇" },
        { num: "Slide 2 (The Secret)", text: "Stop telling AI what to do immediately. Make the AI interview YOU first.\n\nMost beginners don't know all the technical specifications of their project. But AI does." },
        { num: "Slide 3 (The Prompt)", text: "Copy and paste this exact prompt:\n\n'I want to build a [insert idea, e.g. salon booking app]. Before writing any code, interview me one question at a time to determine my exact database schema, UI layout, and payment needs.'" },
        { num: "Slide 4 (The Result)", text: "What happens:\n• The AI asks you 5 focused questions (e.g. 'What payment methods?', 'Do users need logins?').\n• You answer in plain English.\n• It generates an error-free software blueprint tailored to your needs." },
        { num: "Slide 5 (CTA)", text: "Want the full collection of prompt architecture frameworks?\n\nComment \"INTERVIEW\" below 👇\n(I'll send you our free Non-Coder Guide to AI + September workshop link!)" }
      ],
      caption: "Let AI ask the questions first. The Reverse-Interview technique eliminates 95% of AI coding bugs. Comment 'INTERVIEW' below to grab our full prompt playbook! 🚀 #noncoder #buildwithai #techghana"
    },
    {
      number: "4",
      title: "How to Price Web Builds in Ghana (GHS 500 vs. GHS 3,000)",
      cta: 'Comment "PRICE"',
      slides: [
        { num: "Slide 1 (Hook)", text: "How to price software builds in Ghana: Why charging GHS 500 keeps you broke, and how to charge GHS 3,000+ 👇" },
        { num: "Slide 2 (The Cheap Trap)", text: "The GHS 500 Trap (Selling 'Websites'):\n• You tell a business: 'I can build you a 5-page website.'\n• The owner thinks: 'I already have an Instagram page, I don't need a website.'\n• Result: Low perceived value." },
        { num: "Slide 3 (The GHS 3,000 Shift)", text: "The GHS 3,000 Shift (Selling 'Revenue Systems'):\n• You tell the owner: 'I can build an automated booking system that stops missed WhatsApp messages and collects 30% MoMo deposits upfront.'\n• Result: You are solving a real business pain." },
        { num: "Slide 4 (The Math)", text: "If your system saves a salon 10 lost clients a month (worth GHS 2,000+ monthly revenue), paying you GHS 2,500 once is an absolute no-brainer investment." },
        { num: "Slide 5 (CTA)", text: "Want the step-by-step client pitch script we use in Ghana?\n\nComment \"PRICE\" below 👇\n(I'll DM you our free guide + workshop details!)" }
      ],
      caption: "Stop selling pretty websites. Start selling business tools that automate revenue and bookings. Comment 'PRICE' below to get our client pitch templates! 💼 #ghanaentrepreneurs #techghana #senaacademy"
    },
    {
      number: "5",
      title: "Why Salons & Clinics Lose Money on WhatsApp DMs",
      cta: 'Comment "BOOK"',
      slides: [
        { num: "Slide 1 (Hook)", text: "Why local businesses in Accra are losing thousands of Cedis on WhatsApp DMs every month 👇" },
        { num: "Slide 2 (The Chaos)", text: "A customer wants an appointment on Friday at 3 PM:\n• Customer: 'Are you free Friday?'\n• Salon replies 4 hours later: 'Yes, what time?'\n• Customer replies next morning: '3 PM.'\n• Salon: 'Sorry, that slot got taken.'\n• Result: Customer leaves to a competitor." },
        { num: "Slide 3 (The 1-Page Fix)", text: "The 1-Page Booking Solution:\n• A clean link in bio (e.g. salonname.com).\n• Customer sees available time slots live.\n• Selects 3 PM, enters phone number, pays GHS 50 MoMo deposit.\n• Both receive instant SMS confirmation." },
        { num: "Slide 4 (Build Time)", text: "With Google AI Studio and modern tools, you can build and deliver this entire 1-page system in 4 hours.\n\nLocal businesses happily pay GHS 1,500 to GHS 2,500 for this fix." },
        { num: "Slide 5 (CTA)", text: "Want to learn how we build booking tools in plain English?\n\nComment \"BOOK\" below 👇\n(I'll send you our free prompt guide + workshop invite!)" }
      ],
      caption: "Automating appointments is one of the easiest ways to land your first software client in Ghana. Comment 'BOOK' below and I'll send you the free build guide! 🚀 #accrabusiness #noncoder #senaacademy"
    },
    {
      number: "6",
      title: "The 48-Hour KNUST Conference App Blueprint",
      cta: 'Comment "EVENT"',
      slides: [
        { num: "Slide 1 (Hook)", text: "Case Study: How I built a live conference registration system for KNUST in 48 hours with AI 🇬🇭" },
        { num: "Slide 2 (The Problem)", text: "Organizers of the M.M.M 1.0 Summit at KNUST had hundreds of attendees arriving and needed:\n• Fast online registration.\n• Instant digital ticket delivery.\n• Real-time QR check-in on event day.\n• Agencies quoted weeks of work." },
        { num: "Slide 3 (The Tech Stack)", text: "I built the entire platform in 48 hours using:\n1. Google AI Studio to generate UI components in plain English.\n2. Supabase to handle attendee verification.\n3. Vercel for instant 1-click cloud hosting." },
        { num: "Slide 4 (The Result)", text: "• 100% seamless check-in on event day with zero paper sheets.\n• Paystack revenue hit GHS 3,650 in 7 days.\n• Proved that speed beats traditional coding every single time." },
        { num: "Slide 5 (CTA)", text: "Want the exact prompt templates I used for this build?\n\nComment \"EVENT\" below 👇\n(I'll DM you the free guide + workshop details!)" }
      ],
      caption: "Real proof that plain-English AI prompting beats traditional coding bootcamps. Comment 'EVENT' below to get the full prompt breakdown! 🔥 #knust #ghanaevents #techghana #senaacademy"
    },
    {
      number: "7",
      title: "How to Connect Mobile Money Checkout to Any Web App",
      cta: 'Comment "MOMO"',
      slides: [
        { num: "Slide 1 (Hook)", text: "How to accept MTN & Telecel Mobile Money on your web apps in Ghana (Step-by-Step) 👇" },
        { num: "Slide 2 (The Tool)", text: "You don't need to build bank integrations from scratch.\n\nWe use Paystack (paystack.com/gh).\n• Takes 5 minutes to create a free business account.\n• Supports MTN MoMo, Telecel Cash, AT Money, and bank cards." },
        { num: "Slide 3 (The AI Prompt)", text: "In Google AI Studio or Cursor, you simply prompt:\n\n'Integrate Paystack Ghana checkout popup. When the user taps Pay GHS 100, open the MoMo payment modal. On successful payment, redirect to confirmation page and send receipt.'" },
        { num: "Slide 4 (The Workflow)", text: "• Customer enters their MoMo number on your site.\n• They receive an instant prompt on their phone to authorize the transaction.\n• Your system updates automatically in real-time." },
        { num: "Slide 5 (CTA)", text: "Want to see how we build live MoMo integrations on screen?\n\nJoin our Free September Live Online Workshop.\n\nComment \"MOMO\" below 👇\n(I'll DM you the free guide + workshop access!)" }
      ],
      caption: "Adding MoMo payments to a website is what turns a project into a real money-making business. Comment 'MOMO' below to get the free integration blueprint! 💳🇬🇭 #paystack #momo #techghana #senaacademy"
    },
    {
      number: "8",
      title: "3 High-Income Tech Skills You Can Learn in 14 Days Without Code",
      cta: 'Comment "SKILLS"',
      slides: [
        { num: "Slide 1 (Hook)", text: "3 high-income digital skills you can master in 14 days without writing code by hand 👇" },
        { num: "Slide 2 (Skill 1)", text: "1. Prompt Architecture\n• Learning how to structure multi-step prompts that make AI build full-stack web applications without errors.\n• Value: Replace 2 junior developers with 1 skilled prompt architect." },
        { num: "Slide 3 (Skill 2)", text: "2. Cloud Database Wiring\n• Using modern tools like Supabase to connect databases, tables, and logins using plain English queries in 5 minutes.\n• Value: Store customer data securely for any business." },
        { num: "Slide 4 (Skill 3)", text: "3. Local Payment Automation\n• Connecting Paystack and automated email/SMS delivery to web forms.\n• Value: Deliver revenue-generating tools for local salons, clinics, and events." },
        { num: "Slide 5 (CTA)", text: "Want the beginner roadmap to learn all 3 skills?\n\nComment \"SKILLS\" below 👇\n(I'll send you our free Non-Coder Guide to AI!)" }
      ],
      caption: "You don't need 2 years to learn high-income skills in 2026. The rules of tech have changed. Comment 'SKILLS' below to get our free starter guide! 🔋 #noncoder #highincomeskills #techghana #senaacademy"
    },
    {
      number: "9",
      title: "How to Deploy a Live Website for 100% Free on Vercel",
      cta: 'Comment "HOST"',
      slides: [
        { num: "Slide 1 (Hook)", text: "How to host your web app on a public .com link for 100% FREE in 60 seconds 👇" },
        { num: "Slide 2 (The Old Way)", text: "The Old Way:\n• Buy expensive cPanel hosting packages ($10/month).\n• Configure complicated FTP servers and domain DNS records.\n• Takes hours of troubleshooting." },
        { num: "Slide 3 (The Modern Way: Vercel)", text: "The Modern Way (vercel.com):\n• Create a free Vercel account.\n• Connect your GitHub repository.\n• Tap 'Deploy' — your site goes live globally in 45 seconds on a free secure link (yourname.vercel.app)." },
        { num: "Slide 4 (Custom Domains)", text: "Want a custom `.com` or `.org` domain?\n• Connect it in 2 clicks.\n• Free SSL security certificate included automatically with zero monthly server fees." },
        { num: "Slide 5 (CTA)", text: "Want our 1-click deployment checklist?\n\nComment \"HOST\" below 👇\n(I'll send you our free guide + workshop details!)" }
      ],
      caption: "Hosting websites used to cost money and headache. Today, Vercel lets you launch unlimited web apps for free. Comment 'HOST' below for the checklist! 🌐 #vercel #webdevelopment #senaacademy"
    },
    {
      number: "10",
      title: "The Exact Cold DM Pitch Template for Ghanaian Businesses",
      cta: 'Comment "PITCH"',
      slides: [
        { num: "Slide 1 (Hook)", text: "The exact DM script I use to land GHS 1,500+ projects from Ghanaian businesses (without sounding salesy) 👇" },
        { num: "Slide 2 (The Hook Message)", text: "Hey [Business Name], love your work with [specific service]. I noticed clients currently have to wait on WhatsApp to book time slots. I built a quick 60-second mobile booking demo for your brand where clients can pick open hours automatically." },
        { num: "Slide 3 (The No-Risk Offer)", text: "'I put together a free prototype link you can test right on your phone. Would you like me to send you the link to see how it works? No worries if not!'" },
        { num: "Slide 4 (Why It Converts)", text: "• Zero sales pressure.\n• You already built a prototype.\n• You are offering a solution to a problem they feel every single day." },
        { num: "Slide 5 (CTA)", text: "Want the full 5-step client acquisition playbook?\n\nComment \"PITCH\" below 👇\n(I'll DM you our free guide + workshop invite!)" }
      ],
      caption: "Cold messaging works when you lead with upfront value and a prototype rather than a sales pitch. Comment 'PITCH' below to get all our client templates! 💼 #clientacquisition #ghanaentrepreneurs #senaacademy"
    },
    {
      number: "11",
      title: "The Non-Coder Tech Stack: AI Studio vs. Traditional Code",
      cta: 'Comment "STACK"',
      slides: [
        { num: "Slide 1 (Hook)", text: "Traditional Coding vs. Modern AI Builder Stack in 2026: Why the gap is closing fast 👇" },
        { num: "Slide 2 (Traditional Way)", text: "The Traditional Way:\n• Memorize HTML, CSS, JavaScript, React, Node.js.\n• 6 to 12 months learning curve.\n• Endless syntax errors and bugs.\n• 90% of beginners give up." },
        { num: "Slide 3 (Modern AI Stack)", text: "The Modern AI Stack:\n• Google AI Studio + Cursor + Supabase + Vercel.\n• Build in plain English.\n• Prototype in 60 seconds; deploy in 48 hours.\n• Focus on solving problems and building revenue." },
        { num: "Slide 4 (The Winner)", text: "Clients don't care how many lines of code you typed by hand. They only care if your software works fast, looks clean, and helps their business." },
        { num: "Slide 5 (CTA)", text: "Want to master the modern AI builder stack?\n\nComment \"STACK\" below 👇\n(I'll send you our free Non-Coder Guide to AI!)" }
      ],
      caption: "Stop learning syntax like it's 2016. The modern AI builder stack allows you to ship software 10x faster. Comment 'STACK' below for the guide! ⚡ #aitools #noncoder #senaacademy"
    },
    {
      number: "12",
      title: "Stop Building From Scratch in 2026 (Use AI Scaffolding)",
      cta: 'Comment "BUILD"',
      slides: [
        { num: "Slide 1 (Hook)", text: "The biggest mistake beginners make in 2026: Trying to write code from a blank screen 👇" },
        { num: "Slide 2 (The Trap)", text: "Starting with a blank file is slow, frustrating, and outdated.\n\nProfessional developers in 2026 NEVER write code from scratch. They use AI scaffolding and starter templates." },
        { num: "Slide 3 (How It Works)", text: "You feed the AI a clean starter structure (Next.js + Tailwind + Supabase), and ask it to modify only the specific features you need.\n\nWhat used to take 2 weeks now takes 20 minutes." },
        { num: "Slide 4 (The Result)", text: "You spend 90% of your time designing the user experience and talking to clients, while AI handles the heavy technical lifting." },
        { num: "Slide 5 (CTA)", text: "Want our free collection of AI starter templates?\n\nComment \"BUILD\" below 👇\n(I'll DM you the free guide + workshop details!)" }
      ],
      caption: "Never start from a blank screen. Use AI scaffolding to ship functional web apps in record time. Comment 'BUILD' below to grab our templates! 🚀 #aitools2026 #techghana #senaacademy"
    },
    {
      number: "13",
      title: "The 5 Most Common Prompting Mistakes Beginners Make",
      cta: 'Comment "GUIDE"',
      slides: [
        { num: "Slide 1 (Hook)", text: "5 prompting mistakes keeping you stuck when trying to build web apps with AI 👇" },
        { num: "Slide 2 (Mistakes 1 & 2)", text: "1. Asking for too much at once (e.g. 'Build me Uber').\n• Fix: Build one feature at a time (e.g. 'Build the login screen first').\n\n2. Not specifying the design system.\n• Fix: Always specify 'Modern dark mode, mobile-first, clean whitespace'." },
        { num: "Slide 3 (Mistakes 3 & 4)", text: "3. Forgetting database constraints.\n• Fix: Tell the AI exactly what fields to store.\n\n4. Ignoring error messages.\n• Fix: Copy-paste raw error logs directly back into AI; it fixes them in 5 seconds." },
        { num: "Slide 4 (Mistake 5)", text: "5. Not giving the AI an expert persona.\n• Fix: Always start with 'You are a principal frontend engineer specializing in Next.js'." },
        { num: "Slide 5 (CTA)", text: "Want our complete 20-page prompt engineering guide?\n\nComment \"GUIDE\" below 👇\n(I'll DM you the free PDF download link!)" }
      ],
      caption: "Avoid these 5 prompting mistakes and you will 10x the quality of code AI generates for you. Comment 'GUIDE' below for the full prompt manual! 📘 #promptengineering #aitools #senaacademy"
    },
    {
      number: "14",
      title: "The Complete Non-Coder AI Starter Kit (Free PDF Download)",
      cta: 'Comment "STARTER"',
      slides: [
        { num: "Slide 1 (Hook)", text: "I put together the complete Non-Coder AI Starter Kit for young Ghanaians wanting to get into tech 🇬🇭" },
        { num: "Slide 2 (Inside the Kit)", text: "What's inside the free guide:\n• The 3-Part C.G.C. Prompt Framework.\n• The Universal Idea-to-App 60-Second Prompt.\n• The Reverse-Interview AI prompt template." },
        { num: "Slide 3 (The Tools)", text: "• Step-by-step setup for Google AI Studio (100% Free).\n• How to connect Supabase databases with zero coding.\n• Paystack Mobile Money integration cheat sheet." },
        { num: "Slide 4 (The Live Workshop)", text: "Plus, an invitation to our Free Live Online Workshop in September where we open our laptops and build a complete web app together live on screen." },
        { num: "Slide 5 (CTA)", text: "Download your free copy right now:\n\nComment \"STARTER\" below 👇\n(I'll send you the direct download link immediately!)" }
      ],
      caption: "Stop wondering how people are building apps with AI. Download your free copy of The Non-Coder Guide to AI today! Comment 'STARTER' below! 🚀 #noncoder #senaacademy #techghana #accra"
    }
  ];

  const docChildren = [
    new Paragraph({
      text: "SENA ACADEMY • EXAM SEASON CONTENT ENGINE",
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Exam Season Autopilot Carousel Pack (14 Ready-to-Post Slides)",
          bold: true,
          size: 32,
          color: "1E293B"
        })
      ],
      spacing: { after: 150 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: "Strategy: ", bold: true }),
        new TextRun({ text: "100% Minimalist Text Carousels (Zero Filming / 3 mins creation time) during University Exams up to September 4th." })
      ],
      spacing: { after: 300 }
    })
  ];

  carousels.forEach(c => {
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: `CAROUSEL #${c.number}: ${c.title}`, bold: true, size: 24, color: "4F46E5" }),
          new TextRun({ text: `  [Trigger: ${c.cta}]`, bold: true, size: 20, color: "166534" })
        ],
        spacing: { before: 300, after: 100 }
      })
    );

    c.slides.forEach(s => {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${s.num}:\n`, bold: true, size: 20, color: "0F172A" }),
            new TextRun({ text: s.text, size: 19 })
          ],
          spacing: { after: 100 }
        })
      );
    });

    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Caption: ", bold: true, color: "4B5563" }),
          new TextRun({ text: c.caption, italic: true, size: 18, color: "374151" })
        ],
        spacing: { after: 200 }
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } }
      },
      children: docChildren
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const desktopPath = 'C:\\Users\\user\\Desktop\\Exam Season Autopilot Carousel Pack.docx';
  fs.writeFileSync(desktopPath, buffer);
  console.log(`✅ Successfully saved Exam Carousel Pack to Desktop: ${desktopPath}`);

  const downloadsPath = 'C:\\Users\\user\\Downloads\\Exam Season Autopilot Carousel Pack.docx';
  fs.writeFileSync(downloadsPath, buffer);
  console.log(`✅ Saved to Downloads: ${downloadsPath}`);
}

generateExamCarouselPack().catch(err => console.error(err));
