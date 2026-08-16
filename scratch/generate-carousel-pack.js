const fs = require('fs');
const path = require('path');

// ─── DOCX Writer (pure XML, no npm dependency) ───────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── DATE RANGE ───────────────────────────────────────────────────────────────
function getDates(startStr, endStr) {
  const dates = [];
  let cur = new Date(startStr);
  const end = new Date(endStr);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

const DAYS = getDates('2026-08-12', '2026-09-04');

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function fmtDate(d) {
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, 2026`;
}

// ─── PORTFOLIO PROJECTS ───────────────────────────────────────────────────────
const PROJECTS = [
  { name: 'Solara Luxury Residences', type: 'Real Estate Website', url: 'https://solara-three-gamma.vercel.app/', category: 'Real Estate & Architecture' },
  { name: 'Paa Kwesi Folson Advisory', type: 'Personal Brand & Executive Coaching Portal', url: 'https://pkf-pink.vercel.app/', category: 'Personal Brand & Advisory' },
  { name: 'Samuel Mensah Advisory', type: 'Executive Consulting Platform', url: 'https://sammy-drab.vercel.app/', category: 'Personal Brand & Advisory' },
  { name: 'Sena Academy LMS', type: 'Full Learning Management System', url: 'https://sena-academy-lms-ten.vercel.app/', category: 'Education & LMS' },
  { name: 'Kinetic Lab Gym', type: 'Gym Trial Booking & Membership Portal', url: 'https://gym-livid-five.vercel.app/', category: 'Booking & Portal' },
  { name: 'Aether Studio', type: 'Boutique Creative Technology Showcase', url: 'https://boutique-two-silk.vercel.app/', category: 'Booking & Portal' },
  { name: 'Real Estate Catalog', type: 'Property Listings & Filter Platform', url: 'https://real-estate-jade-nine.vercel.app/', category: 'SaaS Catalog' },
  { name: 'Sena Waitlist', type: 'High-Conversion Waitlist Landing Page', url: 'https://senawaitlist.vercel.app/', category: 'Waitlist & Landing' },
];

// ─── SMALL BUSINESS NICHES ────────────────────────────────────────────────────
const NICHES = [
  { biz: 'Campus Hostel', problem: 'Students waste hours walking from hostel to hostel looking for rooms', solution: 'A room availability & instant booking page with WhatsApp confirmation', price: 'GHS 1,200' },
  { biz: 'Instagram Boutique / Thrift Shop', problem: 'Sellers lose orders in WhatsApp DMs and have zero professional presence', solution: 'A product catalogue with photos, prices, sizes, and a WhatsApp order button', price: 'GHS 900' },
  { biz: 'Barbershop / Salon', problem: 'Customers call and call with no system. Stylists lose money on no-shows', solution: 'An appointment booking page with time slots, stylist selection, and MoMo deposit', price: 'GHS 1,500' },
  { biz: 'Pharmacy / Mini-Mart', problem: 'Customers come in to find items out of stock. Zero online search visibility', solution: 'A basic searchable price list and stock checker with WhatsApp contact', price: 'GHS 1,000' },
  { biz: 'Event Planner / Photographer', problem: 'Potential clients cannot see past work and have no way to check availability or pricing', solution: 'A portfolio page with a live availability calendar and instant booking form', price: 'GHS 1,800' },
  { biz: 'Private School / Daycare', problem: 'Parents call endlessly about fees, admissions, and school events with no central info hub', solution: 'An admissions portal with fee structure, report card checker, and event calendar', price: 'GHS 2,500' },
  { biz: 'Church / Ministry', problem: 'Members forget tithe, struggle to access past sermons, and miss event updates', solution: 'A giving portal with MoMo integration, sermon audio archive, and events board', price: 'GHS 1,200' },
  { biz: 'Car Rental / Chauffeur Service', problem: 'Drivers lose clients to competitors who have a website presence and look professional', solution: 'A fleet showcase with daily rate calculator, WhatsApp booking, and driver profiles', price: 'GHS 2,000' },
  { biz: 'Personal Trainer / Fitness Coach', problem: 'Coaches sell sessions one-by-one on WhatsApp with no automated system or recurring revenue', solution: 'A fitness plan download page + monthly MoMo subscription and online session booking', price: 'GHS 1,000' },
  { biz: 'Bespoke Baker / Cake Decorator', problem: 'Customers cannot visualize flavours and sizes. Bakers get rushed or wrong orders constantly', solution: 'A cake builder tool: pick flavour, size, message, date. Pay MoMo deposit instantly', price: 'GHS 900' },
  { biz: 'Real Estate Agent / Land Broker', problem: 'Buyers cannot browse verified land listings and agents waste hours on unqualified calls', solution: 'A searchable property listings page with location filters and WhatsApp tour booking', price: 'GHS 2,500' },
  { biz: 'Seamstress / Fashion Designer', problem: 'Clients cannot see style options, guess on pricing, and measurements get lost in WhatsApp chats', solution: 'A style catalogue with measurement form, fabric picker, delivery date selector, and MoMo deposit', price: 'GHS 1,000' },
];

// ─── PROMPTS LIBRARY ──────────────────────────────────────────────────────────
const PROMPTS = [
  {
    title: 'The Full Business Website Prompt',
    prompt: `"Build a complete, mobile-first business website for a [BUSINESS TYPE] in Ghana called [NAME]. Include: a hero section with a WhatsApp contact button, a services/products section, an about section, and a footer. Use clean modern design with [COLOR] as the brand color. Make it work on mobile phones."`,
    tool: 'Claude / ChatGPT / Bolt.new',
    result: 'A fully structured, mobile-ready website ready to paste into a builder in under 2 minutes.',
  },
  {
    title: 'The Appointment Booking Prompt',
    prompt: `"Create a simple appointment booking form in HTML for a salon/barbershop. Include: stylist name dropdown, service type dropdown, date picker, time slot selector (9am–6pm every hour), customer name, and WhatsApp number. On submit, format the booking details and open a WhatsApp message to +233XXXXXXXXX with the booking summary."`,
    tool: 'Claude / ChatGPT',
    result: 'A working, zero-backend booking form that fires directly to the owner\'s WhatsApp.',
  },
  {
    title: 'The Product Catalogue Prompt',
    prompt: `"Build a simple product catalogue page for a Ghana thrift/boutique Instagram seller. Show 6 items in a grid. Each item has: a photo placeholder, item name, price in GHS, available sizes, and a green 'Order on WhatsApp' button. Make it clean and work on mobile."`,
    tool: 'Claude / v0.dev / Bolt.new',
    result: 'A clean catalogue page that replaces a messy DM inbox and looks 100x more professional.',
  },
  {
    title: 'The MoMo Payment Integration Prompt',
    prompt: `"I am using Paystack in Ghana. Write the frontend JavaScript code to trigger a Paystack payment popup for GHS [AMOUNT] from a customer. Use the Paystack inline JS SDK. On success, log the transaction reference and show a 'Payment confirmed. We will contact you shortly.' message."`,
    tool: 'Claude / ChatGPT',
    result: 'Live MoMo/card payment in your website in under 10 minutes with no backend setup.',
  },
  {
    title: 'The Database Connection Prompt',
    prompt: `"I am using Supabase. Write the JavaScript code to: 1) connect to my Supabase project using my URL and anon key, 2) insert a new row into a table called 'bookings' with columns: name, phone, service, date, and time, 3) show a success message to the user after saving."`,
    tool: 'Claude / ChatGPT + Supabase',
    result: 'Every booking or order form submission is saved to a cloud database forever. No spreadsheet needed.',
  },
  {
    title: 'The Landing Page Conversion Prompt',
    prompt: `"Write the HTML and CSS for a high-converting landing page for a free online workshop in Ghana. Include: a bold headline with a problem and promise, 3 bullet points of what they will learn, a simple name and WhatsApp number form, and a green submit button. Make the background dark and text white. Mobile-first."`,
    tool: 'Claude / ChatGPT',
    result: 'A ready-to-deploy landing page that captures leads in under 5 minutes of prompting.',
  },
  {
    title: 'The Debugging Prompt',
    prompt: `"Here is my HTML/JavaScript code: [PASTE YOUR CODE]. It is not working correctly. The problem is: [DESCRIBE THE BUG IN PLAIN ENGLISH]. Please identify the exact problem, explain why it is happening in simple terms, and give me the corrected version of the code."`,
    tool: 'Claude (best for debugging) / ChatGPT',
    result: 'Fixes any broken code in plain English without you understanding a single line of syntax.',
  },
  {
    title: 'The WhatsApp Auto-Message Prompt',
    prompt: `"Write JavaScript that, when a form is submitted on my webpage, takes the values from fields: name, service, date, and phone — and opens a pre-filled WhatsApp message to +233XXXXXXXXX with the text: 'New Booking from [name]: Service: [service], Date: [date], Contact: [phone]'. Use window.open with the wa.me link."`,
    tool: 'Claude / ChatGPT',
    result: 'Every form submission automatically lands in your WhatsApp as a formatted message. Zero backend.',
  },
];

// ─── CAREER TRUTH TOPICS ──────────────────────────────────────────────────────
const CAREER_TRUTHS = [
  {
    hook: 'Your degree gives you knowledge. AI gives you leverage. Only one of them pays bills in 2026.',
    points: [
      'Ghana produces 80,000+ university graduates every year. The economy creates roughly 30,000 formal jobs.',
      'The math does not work in your favour if your only plan is a certificate.',
      'The graduates who get hired fast are not the smartest. They are the ones who can show something they built.',
      'A 4-year Petroleum Engineering degree trains you to work IN oil companies. AI skills train you to build FOR anyone.',
      'Which skill can you start monetizing this week with a GHS 200 phone and free tools?',
    ],
    cta: 'Comment "BUILD" if you want to see how to land your first GHS 1,500 client this month.',
  },
  {
    hook: 'NSS pays GHS 700/month. A simple 1-page business website pays GHS 1,200 in a single afternoon.',
    points: [
      'The average National Service allowance in Ghana is GHS 700 per month.',
      'The average local business website project in Ghana pays between GHS 900 and GHS 2,500.',
      'You only need to close 1 client per month to make more than NSS without leaving your room.',
      'The tools are free: Claude AI, Bolt.new, Supabase, Vercel, Paystack.',
      'The only thing standing between you and your first GHS 1,000 is not skill. It is a decision.',
    ],
    cta: 'Save this. Share it with a friend doing NSS right now.',
  },
  {
    hook: 'In 2015, you needed Photoshop skills to design a church flyer. Today a 14-year-old does it on Canva in 3 minutes.',
    points: [
      'The same exact shift just happened to software and web development.',
      'You used to need 3 years of coding bootcamp to build a booking website.',
      'Today, you describe what you want in plain English and AI builds it for you.',
      'The people who saw Canva early and learned it made money from design with zero design school.',
      'The people who see AI early and learn it now will make money from software with zero CS degree.',
    ],
    cta: 'Follow this page. We teach this live every week.',
  },
  {
    hook: 'AI will not take your job. A non-coder using AI to do your entire week\'s work in 45 minutes will.',
    points: [
      'This is not a motivational quote. This is what is already happening in Ghana\'s job market.',
      'Employers are starting to ask: "Can you use AI tools?" not "What degree do you have?"',
      'A business administration student who can build a customer database app is worth more than one who cannot.',
      'A nurse who can build a patient scheduling tool for their clinic is worth more than one who cannot.',
      'The barrier is not intelligence. The barrier is knowing where to start.',
    ],
    cta: 'Comment "START" and I will show you exactly where to begin.',
  },
  {
    hook: 'I study Petroleum Engineering. I have never taken a computer science class. I built 14 live websites.',
    points: [
      'None of the websites on my portfolio required me to memorize code syntax.',
      'Every single one was built by describing what I wanted to an AI in plain English.',
      'The most complex one — a full learning management system with user logins and payments — took 3 weeks.',
      'A freelancer would have charged GHS 15,000 for the same system. I built it myself.',
      'If a petroleum engineering student can do this, your degree is not your barrier.',
    ],
    cta: 'Link to portfolio in bio. Tell me which project shocked you the most.',
  },
  {
    hook: 'The most dangerous lie told to Ghanaian students: "Study hard, get a good grade, get a good job."',
    points: [
      'The job market does not reward grades. It rewards demonstrated skills and proof of work.',
      'No employer has ever asked to see a university transcript before offering a freelance contract.',
      'What employers and clients ask for is: "Can you show me something you built?"',
      'A GitHub link or a Vercel project link does more work than a 4.0 GPA in tech.',
      'The students winning right now are building their portfolio while their classmates are cramming for exams.',
    ],
    cta: 'Follow this page if you are building in silence.',
  },
];

// ─── FOUNDER STORIES ──────────────────────────────────────────────────────────
const FOUNDER_STORIES = [
  {
    hook: 'GHS 0 to GHS 3,650 in 7 days. No coding school. No CS degree. Just AI and a laptop.',
    story: [
      'In July 2026, I had zero clients and zero income from software.',
      'I built a luxury real estate website (Solara) as a concept project to sharpen my skills.',
      'I posted the screenshot on my TikTok page with a simple caption: "I built this with AI, no code."',
      'Within 3 days, I had 3 enquiries from local businesses wanting a similar site.',
      'By day 7, I had closed GHS 3,650 in website projects — all built with free AI tools.',
    ],
    cta: 'This is literally what I teach at Sena Academy. Free workshop in September. Link in bio.',
  },
  {
    hook: 'I built an executive advisory portal for a top Ghanaian speaker in one weekend. He had zero website before.',
    story: [
      'Paa Kwesi Folson is a speaker, executive coach, and advisor in Ghana.',
      'His only online presence was a phone number and a Facebook page.',
      'I built him a full multi-page brand website: speaking catalog, advisory services, and a contact booking system.',
      'Total time from blank screen to live URL: 1 weekend.',
      'Total code I wrote manually: zero lines.',
    ],
    cta: 'Live link in bio. Tell me what you think in the comments.',
  },
  {
    hook: 'How I built a gym membership and trial booking website for a boutique fitness studio using 1 prompt.',
    story: [
      'Kinetic Lab is a boutique athletic training studio concept I built to practice booking systems.',
      'I described the site in 3 sentences to Claude AI: dark branding, membership tiers, trial session booking.',
      'It generated the full HTML, CSS, and JavaScript structure in one response.',
      'I pasted it into my editor, connected a simple form backend, and deployed to Vercel in 45 minutes.',
      'The entire build cost GHS 0. Hosting is free. The domain costs GHS 80/year.',
    ],
    cta: 'Save this post. The full prompt breakdown is in the next carousel.',
  },
];

// ─── PILLAR ROTATION (10 per day) ────────────────────────────────────────────
// Pillar labels: FP=Founder Proof, SB=Small Business, CT=Career Truth, PT=Prompt, NI=Niche Idea
const DAILY_PILLARS = [
  'FP', 'SB', 'CT', 'PT', 'NI', 'FP', 'SB', 'CT', 'PT', 'NI',
];

// ─── CAROUSEL GENERATOR ───────────────────────────────────────────────────────
function generateCarousel(dayIndex, carouselIndex, date) {
  const pillar = DAILY_PILLARS[carouselIndex];
  const absIndex = dayIndex * 10 + carouselIndex;

  if (pillar === 'FP') {
    const story = FOUNDER_STORIES[absIndex % FOUNDER_STORIES.length];
    const project = PROJECTS[absIndex % PROJECTS.length];
    return {
      pillar: '🎯 FOUNDER PROOF',
      visualNote: `[SCREENSHOT: Open ${project.url} on your phone/laptop and record your screen scrolling through it. Use as Slide 3 background with bold white text overlay.]`,
      slides: [
        { label: 'SLIDE 1 — HOOK', text: story.hook },
        { label: 'SLIDE 2 — CONTEXT', text: `Project: ${project.name}\nCategory: ${project.category}\nBuilt with: AI tools only. Zero manual code.\nBackground: 2nd Year Petroleum Engineering Student.\nNo CS degree. No coding bootcamp.` },
        { label: 'SLIDE 3 — STORY (Screenshot Slide)', text: story.story.map((s, i) => `${i + 1}. ${s}`).join('\n') },
        { label: 'SLIDE 4 — THE TRUTH', text: `This is not a special talent.\nThis is a learnable skill that takes 1 focused weekend to start.\n\nThe tools are free.\nThe knowledge is free.\nThe only cost is making the decision to start.\n\nYou do not need a Computer Science degree.\nYou need a clear prompt and 45 minutes.` },
        { label: 'SLIDE 5 — CTA', text: story.cta + '\n\n🔗 Free September Live Workshop: senaacademy.org/waitlist' },
      ],
      caption: `${story.hook}\n\nI study Petroleum Engineering. I have never coded a website from scratch in my life.\n\nEvery project on my portfolio was built with AI, plain English, and free tools.\n\nThis is not gatekept knowledge. Come learn live with us in September.\n\n👉 Free workshop link in bio.\n\n#AIinGhana #BuildWithAI #GhanaStartups #SenaAcademy #LearnAI #NoCodingDegree`,
    };
  }

  if (pillar === 'SB') {
    const niche = NICHES[absIndex % NICHES.length];
    return {
      pillar: '🏪 SMALL BUSINESS BLUEPRINT',
      visualNote: `[TEXT SLIDES ONLY: Clean white background with dark slate text, OR dark graphite background with white text. No gradients. No glows. Bold Sans-Serif font (Inter or Helvetica). Use checkmarks ✓ and arrows → to guide the eye.]`,
      slides: [
        { label: 'SLIDE 1 — HOOK', text: `Every ${niche.biz} in Ghana needs this.\n\nMost do not have it yet.\n\nYou can build it for them today.` },
        { label: 'SLIDE 2 — THE PROBLEM', text: `The Problem:\n${niche.problem}.\n\nThis costs them real customers and real money every single week.\n\nThey have no idea a solution exists, or they think it will cost millions of cedis to build.` },
        { label: 'SLIDE 3 — THE SOLUTION', text: `The Fix:\n${niche.solution}.\n\nTime to build: Under 2 hours with AI.\nCost to build: GHS 0 (free tools).\nWhat you charge: ${niche.price} — GHS ${parseInt(niche.price.replace('GHS ', '').replace(',', '')) + 200} for premium.\nHosting cost for them: GHS 0 – GHS 80/year.` },
        { label: 'SLIDE 4 — YOUR PITCH SCRIPT', text: `How to pitch this to the business owner:\n\n"Hello, I noticed your business does not have a website. I can build you a professional one that lets customers book appointments/order products/check availability directly from their phone. It takes me 2 days to finish. I charge ${niche.price}. Would you like to see an example?"\n\n→ Then show them a project from your portfolio.\n→ Ask for 50% deposit via MoMo upfront.\n→ Deliver in 2 days.` },
        { label: 'SLIDE 5 — CTA', text: `I teach exactly how to build these at Sena Academy.\n\nFree Live September Workshop where we build one of these from scratch on screen together.\n\nComment "BUILD" or join via link in bio.\n\n🔗 senaacademy.org/waitlist` },
      ],
      caption: `Most ${niche.biz} owners in Ghana are losing customers daily because they have no digital presence.\n\n${niche.problem}.\n\nYou can fix this for them — with AI and free tools — in under 2 hours.\n\nCharge: ${niche.price}. Build time: 2 hours. Your cost: GHS 0.\n\nThis is exactly what we teach live at Sena Academy in September.\n\n👉 Free workshop link in bio.\n\n#GhanaBusiness #AIinGhana #BuildWithAI #SenaAcademy #FreelanceGhana #NoCode`,
    };
  }

  if (pillar === 'CT') {
    const truth = CAREER_TRUTHS[absIndex % CAREER_TRUTHS.length];
    return {
      pillar: '🔥 CAREER TRUTH',
      visualNote: `[MINIMALIST TEXT SLIDES: Deep graphite background (#0C0D12) with pure white bold text. Large font, short lines. Zero images. The words ARE the design. Think X/Twitter viral post aesthetic.]`,
      slides: [
        { label: 'SLIDE 1 — HOOK', text: truth.hook },
        { label: 'SLIDE 2 — THE REALITY', text: truth.points.slice(0, 2).join('\n\n') },
        { label: 'SLIDE 3 — THE DETAIL', text: truth.points.slice(2, 4).join('\n\n') },
        { label: 'SLIDE 4 — THE PIVOT', text: `But here is the truth nobody tells you in Ghana:\n\n${truth.points[4]}\n\nThe window to learn this skill and be early is still open.\nIt will not be open for long.` },
        { label: 'SLIDE 5 — CTA', text: `${truth.cta}\n\nFree Live September Workshop — senaacademy.org/waitlist\n\nWe build a real web platform from scratch in plain English. No coding required.` },
      ],
      caption: `${truth.hook}\n\n${truth.points[0]}\n\n${truth.points[2]}\n\nSave this. Share it with someone who needs to hear it.\n\n👉 Free September AI workshop — link in bio.\n\n#GhanaYouth #AIinGhana #CareerAdvice #SenaAcademy #BuildWithAI #Unemployment`,
    };
  }

  if (pillar === 'PT') {
    const prompt = PROMPTS[absIndex % PROMPTS.length];
    return {
      pillar: '⚡ STEAL THIS PROMPT',
      visualNote: `[SCREENSHOT SLIDE for Slide 3: Paste this prompt into Claude or ChatGPT on your phone/laptop, take a screenshot of the response, and use it as Slide 3. Blur or crop any sensitive info. This shows real-time proof that the prompt works.]`,
      slides: [
        { label: 'SLIDE 1 — HOOK', text: `Steal this prompt.\n\nI use this exact template to build ${prompt.title.toLowerCase()} without writing a single line of code.\n\nCopy it. Test it. Thank me later.` },
        { label: 'SLIDE 2 — THE PROMPT', text: `📋 THE PROMPT:\n\n${prompt.prompt}\n\n🔧 Tool: ${prompt.tool}` },
        { label: 'SLIDE 3 — THE RESULT (Screenshot Slide)', text: `[PLACE SCREENSHOT OF AI RESPONSE HERE]\n\nWhat it generates: ${prompt.result}` },
        { label: 'SLIDE 4 — HOW TO USE IT', text: `How to adapt this for any business:\n\n→ Replace the CAPS placeholder text with your specific details.\n→ Be specific: "salon in Kumasi called Nana's Beauty" not just "a business".\n→ If the first response is not perfect, reply: "Make the design cleaner and more professional. Use a white background."\n→ Keep refining in plain English until it is exactly what you want.` },
        { label: 'SLIDE 5 — CTA', text: `Save this prompt. You will use it.\n\nWe give out 10+ prompts like this every week inside our WhatsApp community.\n\nFree to join. Link in bio.\n\n🔗 senaacademy.org/waitlist — Free September Live Build Workshop` },
      ],
      caption: `Here is the exact prompt I use to ${prompt.title.toLowerCase()}.\n\nCopy it. Paste it into Claude or ChatGPT. Watch it build in 30 seconds.\n\nNo coding knowledge required. No tutorials. Just plain English.\n\nSave this post. Try it tonight.\n\n👉 More prompts and a free live workshop in bio.\n\n#AIPrompts #BuildWithAI #AIinGhana #SenaAcademy #NoCode #TechGhana`,
    };
  }

  if (pillar === 'NI') {
    const niche = NICHES[(absIndex + 5) % NICHES.length];
    const project = PROJECTS[(absIndex + 3) % PROJECTS.length];
    return {
      pillar: '💡 NICHE BUSINESS IDEA',
      visualNote: `[MIX: Slide 1-2 are clean text cards. Slide 3 is a screenshot of ${project.name} (${project.url}) with bold overlay text to show the quality of what AI can produce. Slides 4-5 are clean text cards.]`,
      slides: [
        { label: 'SLIDE 1 — HOOK', text: `${niche.biz} owners in Ghana are sitting on a gold mine.\n\nThey just do not know it yet.\n\nAnd you can help them unlock it.` },
        { label: 'SLIDE 2 — THE GAP', text: `Right now, most ${niche.biz} businesses in Ghana:\n\n✗ Have no website\n✗ Lose leads in WhatsApp DMs\n✗ Cannot accept online deposits\n✗ Have zero way to show credibility to new customers\n\nThis is the gap. You are the solution.` },
        { label: 'SLIDE 3 — PROOF OF QUALITY (Screenshot Slide)', text: `[Screenshot of ${project.name}]\n\nThis is the quality of site you can build for them with AI in under 2 hours.\n\nCategory: ${project.category}\nBuilt by: A 2nd-year Petroleum Engineering student.\nLines of code written manually: 0.` },
        { label: 'SLIDE 4 — THE NUMBERS', text: `The business case:\n\nCharge per website: ${niche.price}\nBuild time: 2–4 hours\nYour tool cost: GHS 0\nHosting cost for client: GHS 0 – GHS 80/year\n\nIf you build 3 websites per month:\nMonthly income: ${parseInt(niche.price.replace('GHS ', '').replace(',', '')) * 3} GHS\n\nThat is more than most entry-level jobs in Ghana.\nAnd you work from anywhere.` },
        { label: 'SLIDE 5 — CTA', text: `We build a site like this from scratch — live on screen — at our free September workshop.\n\nYou watch. You follow along. You leave with a working project in your portfolio.\n\nLink in bio. Free to register.\n\n🔗 senaacademy.org/waitlist` },
      ],
      caption: `${niche.biz} owners are losing clients every day because they have no digital presence.\n\nYou can build a professional solution for them in 2 hours with AI tools.\n\nCharge: ${niche.price}. Your cost: GHS 0.\n\nThis is a real income stream, not a fantasy.\n\n👉 Free live AI build workshop in September. Register via link in bio.\n\n#GhanaBusiness #FreelanceGhana #AIinGhana #SenaAcademy #BuildWithAI #WorkFromAnywhere`,
    };
  }

  return null;
}

// ─── BUILD DOCX XML ───────────────────────────────────────────────────────────
function makeDocx() {
  let bodyXml = '';

  // Title Page
  bodyXml += `
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="56"/></w:rPr><w:t>SENA ACADEMY</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="40"/></w:rPr><w:t>240 Autopilot Carousel Pack</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:t>August 12 – September 4, 2026</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>10 Ready-to-Post Carousels Per Day</w:t></w:r>
    </w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Creator: Ishmael Harry-Deckor | Petroleum Engineering, Year 2</w:t></w:r>
    </w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

  // Design Guide
  bodyXml += `
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>📐 VISUAL DESIGN GUIDE (Read Before Posting)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>BACKGROUNDS (Pick One Per Carousel):</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Deep Graphite Dark: #0C0D12 background with pure white text — for Career Truth and Prompt carousels.</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Crisp White: #FFFFFF background with #0C0D12 text — for Small Business and Niche carousels.</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>ACCENT COLORS (use sparingly — 1 accent per slide max):</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Emerald Green: #10B981 — for checkmarks, highlight words, CTA buttons.</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Warm Amber: #D97706 — for numbers, prices, and GHS figures to make them pop.</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>TYPOGRAPHY:</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Font: Inter, Outfit, or Helvetica. NEVER use cursive or decorative fonts.</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Slide 1 hook text: 36–48pt, bold, max 2 lines.</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Body text slides: 18–24pt, regular weight, tight line-height.</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>SCREENSHOT SLIDES:</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Take a real screenshot of the portfolio project on your laptop/phone.</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Add a subtle dark overlay (40% opacity black) and place bold white text on top.</w:t></w:r></w:p>
    <w:p><w:r><w:t>• Always include the live URL in small text at the bottom of the screenshot slide.</w:t></w:r></w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

  // Generate all days
  DAYS.forEach((date, dayIndex) => {
    // Day header
    bodyXml += `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="48"/></w:rPr><w:t>DAY ${dayIndex + 1}: ${fmtDate(date).toUpperCase()}</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="28"/></w:rPr><w:t>10 Ready-to-Post Carousels</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</w:t></w:r></w:p>
      <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;

    // Generate 10 carousels for the day
    for (let ci = 0; ci < 10; ci++) {
      const carousel = generateCarousel(dayIndex, ci, date);
      if (!carousel) continue;

      bodyXml += `
        <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>${esc(`CAROUSEL ${ci + 1}/10  |  ${carousel.pillar}`)}</w:t></w:r></w:p>
        <w:p><w:r><w:rPr><w:color w:val="666666"/></w:rPr><w:t>${esc(carousel.visualNote)}</w:t></w:r></w:p>
        <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;

      // Slides
      carousel.slides.forEach((slide) => {
        bodyXml += `
          <w:p><w:r><w:rPr><w:b/><w:color w:val="1a5276"/></w:rPr><w:t>${esc('▌ ' + slide.label)}</w:t></w:r></w:p>`;
        const lines = slide.text.split('\n');
        lines.forEach(line => {
          bodyXml += `<w:p><w:r><w:t xml:space="preserve">${esc(line || ' ')}</w:t></w:r></w:p>`;
        });
        bodyXml += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
      });

      // Caption
      bodyXml += `
        <w:p><w:r><w:rPr><w:b/><w:color w:val="1a5276"/></w:rPr><w:t>▌ TIKTOK / IG CAPTION (Copy-Paste Ready):</w:t></w:r></w:p>`;
      carousel.caption.split('\n').forEach(line => {
        bodyXml += `<w:p><w:r><w:t xml:space="preserve">${esc(line || ' ')}</w:t></w:r></w:p>`;
      });

      bodyXml += `
        <w:p><w:r><w:rPr><w:color w:val="999999"/></w:rPr><w:t>────────────────────────────────────────</w:t></w:r></w:p>
        <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
    }

    // Page break between days (except last)
    if (dayIndex < DAYS.length - 1) {
      bodyXml += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
  });

  // ─── Assemble the full DOCX XML structure ─────────────────────────────────
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
            xmlns:v="urn:schemas-microsoft-com:vml"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:w10="urn:schemas-microsoft-com:office:word"
            xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
            xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
            xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
            xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
            xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
            mc:Ignorable="w14 wp14">
  <w:body>
    ${bodyXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Helvetica" w:hAnsi="Helvetica" w:cs="Helvetica"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  return { documentXml, relsXml, wordRelsXml, stylesXml, contentTypesXml };
}

// ─── WRITE AS REAL .DOCX (ZIP) ────────────────────────────────────────────────
async function writeDocx() {
  // Use JSZip if available, otherwise fall back to writing raw XML (which Word can open as .docx)
  try {
    // Try to use the adm-zip package if available
    const AdmZip = require('adm-zip');
    const { documentXml, relsXml, wordRelsXml, stylesXml, contentTypesXml } = makeDocx();

    const zip = new AdmZip();
    zip.addFile('[Content_Types].xml', Buffer.from(contentTypesXml, 'utf8'));
    zip.addFile('_rels/.rels', Buffer.from(relsXml, 'utf8'));
    zip.addFile('word/document.xml', Buffer.from(documentXml, 'utf8'));
    zip.addFile('word/_rels/document.xml.rels', Buffer.from(wordRelsXml, 'utf8'));
    zip.addFile('word/styles.xml', Buffer.from(stylesXml, 'utf8'));

    const outPath = path.join('C:\\Users\\user\\Desktop', 'Sena Academy - 240 Autopilot Carousels (Aug 12 to Sept 4).docx');
    zip.writeZip(outPath);
    console.log(`\n✅ SUCCESS: Word document created at:\n${outPath}\n`);
    console.log(`📊 Stats:`);
    console.log(`   • Days covered: ${DAYS.length} (Aug 12 – Sept 4)`);
    console.log(`   • Total carousels: ${DAYS.length * 10}`);
    console.log(`   • Total slides: ${DAYS.length * 10 * 5}`);
    console.log(`   • Total TikTok captions: ${DAYS.length * 10}`);
  } catch (e) {
    // Fallback: write as plain text file with .txt extension
    console.log('adm-zip not found, writing as formatted text file...');
    writeAsTxt();
  }
}

function writeAsTxt() {
  let output = '';

  output += `SENA ACADEMY — 240 AUTOPILOT CAROUSEL PACK\n`;
  output += `August 12 to September 4, 2026\n`;
  output += `10 Ready-to-Post Carousels Per Day\n`;
  output += `Creator: Ishmael Harry-Deckor | Petroleum Engineering, Year 2\n`;
  output += `${'═'.repeat(80)}\n\n`;

  output += `📐 VISUAL DESIGN GUIDE\n${'─'.repeat(80)}\n`;
  output += `BACKGROUNDS:\n• Deep Graphite Dark (#0C0D12) + white text → Career Truth & Prompt carousels\n• Crisp White (#FFFFFF) + dark text → Small Business & Niche carousels\n\n`;
  output += `ACCENT COLORS:\n• Emerald Green #10B981 → checkmarks, CTA highlights\n• Warm Amber #D97706 → GHS prices and numbers\n\n`;
  output += `TYPOGRAPHY:\n• Font: Inter, Outfit, or Helvetica\n• Hook slide: 36–48pt bold, max 2 lines\n• Body slides: 18–24pt regular\n${'═'.repeat(80)}\n\n`;

  DAYS.forEach((date, dayIndex) => {
    output += `\n${'█'.repeat(80)}\n`;
    output += `DAY ${dayIndex + 1}: ${fmtDate(date).toUpperCase()}\n`;
    output += `${'█'.repeat(80)}\n\n`;

    for (let ci = 0; ci < 10; ci++) {
      const carousel = generateCarousel(dayIndex, ci, date);
      if (!carousel) continue;

      output += `┌${'─'.repeat(78)}┐\n`;
      output += `│ CAROUSEL ${ci + 1}/10  |  ${carousel.pillar}\n`;
      output += `└${'─'.repeat(78)}┘\n\n`;
      output += `🎨 VISUAL NOTE: ${carousel.visualNote}\n\n`;

      carousel.slides.forEach((slide) => {
        output += `▌ ${slide.label}\n`;
        output += `${slide.text}\n\n`;
      });

      output += `▌ TIKTOK / IG CAPTION:\n${carousel.caption}\n\n`;
      output += `${'─'.repeat(80)}\n\n`;
    }
  });

  const outPath = path.join('C:\\Users\\user\\Desktop', 'Sena Academy - 240 Autopilot Carousels (Aug 12 to Sept 4).txt');
  fs.writeFileSync(outPath, output, 'utf8');
  console.log(`\n✅ SUCCESS: Text document created at:\n${outPath}`);
  console.log(`📊 Stats:`);
  console.log(`   • Days covered: ${DAYS.length}`);
  console.log(`   • Total carousels: ${DAYS.length * 10}`);
  console.log(`   • Total slides: ${DAYS.length * 10 * 5}`);
  console.log(`   • File size: ${(fs.statSync(outPath).size / 1024 / 1024).toFixed(2)} MB`);
}

writeDocx().catch(err => {
  console.error('Error:', err.message);
  writeAsTxt();
});
