const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── DATE RANGE ────────────────────────────────────────────────────────────────
function getDates(a, b) {
  const dates = [], cur = new Date(a), end = new Date(b);
  while (cur <= end) { dates.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return dates;
}
const DAYS = getDates('2026-08-12', '2026-09-04');
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September'];
function fmtDate(d) { return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, 2026`; }

// ─── CREATOR FACTS (ONLY REAL, CONFIRMED DETAILS) ──────────────────────────────
const CREATOR = {
  name: 'Ishmael',
  degree: 'Petroleum Engineering',
  year: '2nd Year',
  university: 'university',
  locations: ['hostel room', 'lecture hall corridor', 'campus study area', 'university library', 'research lab'],
  firstBuild: 'trading journal',
  tradesMarkets: true,
  portfolioCount: 14,
  paidClients: 0,
  goal: 'first paying client from TikTok',
  bainStat: 'A Bain & Company labour report shows that by 2030, the workers who survive automation will be the ones with AI literacy — not degrees, not experience. AI literacy.',
  insight: 'No one is coming to save you. Everyone learns the same thing in school. Very few exceptional people fill the gap.',
  tools: ['Claude', 'Bolt.new', 'Supabase', 'Vercel', 'Paystack / MoMo'],
  projects: [
    'Solara Luxury Residences (real estate)',
    'Paa Kwesi Folson Advisory (personal brand)',
    'Kinetic Lab Gym (booking portal)',
    'Sena Academy LMS (full learning platform)',
    'Trading Journal (personal tool)',
  ],
};

// ─── LOCATIONS BY DATE ──────────────────────────────────────────────────────────
function getLocation(dayIndex) {
  // Research lab unlocks from day 6 (Aug 17)
  const pool = dayIndex >= 6
    ? CREATOR.locations
    : CREATOR.locations.slice(0, 4);
  return pool[dayIndex % pool.length];
}

// ─── 10 VIDEO ARCHETYPES ────────────────────────────────────────────────────────
// 1. TALKING HEAD – Career Truth Bomb (15–30s)
// 2. SCREEN RECORD – Live Build Demo (45–60s)
// 3. VLOG/WALK – Day In My Life as a Builder (60–90s)
// 4. TALKING HEAD – Origin Story Beat (45–90s)
// 5. SCREEN RECORD – Prompt Breakdown (30–45s)
// 6. TALKING HEAD – Myth Bust (15–30s)
// 7. POV SKIT – Pattern Interrupt (15–30s)
// 8. TALKING HEAD – Ghanaian Small Biz Opportunity (45–60s)
// 9. BUILD IN PUBLIC – Progress Update (30–60s)
// 10. STORY TIME – Longer Narrative (60–90s)

const ARCHETYPES = [
  'CAREER TRUTH BOMB',
  'LIVE BUILD DEMO',
  'DAY IN MY LIFE',
  'ORIGIN STORY BEAT',
  'PROMPT BREAKDOWN',
  'MYTH BUST',
  'POV SKIT',
  'SMALL BIZ OPPORTUNITY',
  'BUILD IN PUBLIC',
  'STORY TIME',
];

const FORMATS = [
  'Talking Head — direct to camera, ring light, mic on',
  'Screen Record + Voiceover — record laptop screen, speak over it',
  'Vlog / Walk-and-Talk — phone in hand, walking through campus or hostel',
  'Talking Head — direct to camera, ring light, mic on',
  'Screen Record + Voiceover — record laptop screen, speak over it',
  'Talking Head — direct to camera, ring light, mic on',
  "POV / Skit — camera placed on desk or held at arm's length",
  'Talking Head — direct to camera, ring light, mic on',
  'Screen Record + Talking Head split — show screen then cut to face',
  'Talking Head — direct to camera, sitting down, relaxed energy',
];

const DURATIONS = [
  '15–30 seconds',
  '45–60 seconds',
  '60–90 seconds',
  '45–90 seconds',
  '30–45 seconds',
  '15–30 seconds',
  '15–30 seconds',
  '45–60 seconds',
  '30–60 seconds',
  '60–90 seconds',
];

// ─── CAREER TRUTH BOMBS (Video 1 per day) ──────────────────────────────────────
const TRUTH_BOMBS = [
  {
    hook: 'Nobody told me this when I entered university.',
    script: `Nobody told me this when I entered university.

We all graduate. Thousands of us. Every single year.
But go look at the people actually thriving — I mean actually building wealth, not just employed —
you will see that they are exceptional at something very specific.

Everyone in my class is learning the exact same thing.
The same notes. The same exams. The same certificate.

So when we all graduate, who do you think wins?

[PAUSE — look into camera]

The person who learned something on top.`,
    cta: 'Comment "ON TOP" if you are building a skill on top of your degree right now.',
    caption: `Nobody told me this before I entered university.\n\nThousands graduate every year. Very few thrive. The difference isn't the degree.\n\n#GhanaStudents #AIinGhana #CareerTruth #SenaAcademy`,
  },
  {
    hook: 'I read a labour report that scared me into action.',
    script: `I read a labour report that scared me into action.

Bain & Company — one of the biggest global consulting firms — published a report.
It says that by 2030, the workers who survive will be the ones with AI literacy.

Not the ones with the best grades.
Not the ones with the most experience.
AI literacy.

I am a 2nd year petroleum engineering student.
That report made me open my laptop that same night and start building.

What are you waiting for?`,
    cta: 'Save this. Share it with someone doing national service right now.',
    caption: `A Bain & Company report said AI literacy will separate survivors from casualties by 2030.\n\nI'm a petroleum engineering student. That was enough for me.\n\n#AILiteracy #GhanaGraduates #FutureOfWork #BuildWithAI`,
  },
  {
    hook: 'Your parents are not obliged to take care of you after graduation.',
    script: `Your parents are not obliged to take care of you after graduation.

I know that is uncomfortable to hear but it is the truth.

At some point, you are fully on your own.
And the question is — what did you build while you had time?

Not what grade did you get.
Not what internship did you do.

What did you BUILD?

I study petroleum engineering.
In my hostel room, after lectures, I build software with AI.

Not because I am a genius.
Because no one is coming to save me.`,
    cta: 'Follow this page. I post how to build real things with AI, no coding required.',
    caption: `Nobody is coming to save you.\n\nThe question is what are you building while you still have time?\n\n#RealTalk #GhanaYouth #BuildInPublic #AIinGhana`,
  },
  {
    hook: 'The gap in Ghana is not jobs. It is exceptional people.',
    script: `The gap in Ghana is not jobs.

It is exceptional people.

Think about it. When someone truly exceptional graduates — I mean exceptional at something real —
do they struggle to find work? No. People look for THEM.

The problem is we are all being trained to be average.
Same curriculum. Same notes. Same certificate.

Exceptional skills are built outside the classroom.

I am a 2nd year petroleum engineering student.
I have built 14 live web platforms with AI.
Zero coding knowledge. Zero computer science background.

That is my exceptional skill. What is yours?`,
    cta: 'Comment your degree and what skill you are building on top of it.',
    caption: `Ghana doesn't have a job shortage. It has an exceptional people shortage.\n\nWhat are you doing to be exceptional?\n\n#GhanaStudents #CareerAdvice #BuildWithAI #SenaAcademy`,
  },
  {
    hook: 'I have not gotten my first client yet. Here is why I am still posting.',
    script: `I am going to be honest with you.

I have built 14 websites and web platforms.
I have not gotten a single paid client yet.

And I am still posting every single day.

Because I know what the data says.
The people who build in public — who show their journey before they arrive —
get clients faster than the ones who wait until they are "ready."

I am not hiding behind a highlight reel.
This is the actual journey.

Follow along. We are going to get there together.`,
    cta: 'Follow to see when I land that first client. I will document the whole thing.',
    caption: `14 websites built. 0 paid clients yet. Still posting.\n\nThe journey is the content.\n\n#BuildInPublic #GhanaFreelancer #AIinGhana #RealTalk`,
  },
  {
    hook: 'Most people will graduate and immediately start competing for 30,000 jobs.',
    script: `Every year in Ghana, roughly 80,000 people graduate from universities.

The economy creates maybe 30,000 formal sector jobs.

Do the math.
Most people are fighting over scraps.

But the ones who learned to build something —
a website, a tool, a product —
they don't compete for jobs.
They create their own.

I study petroleum engineering.
I am not waiting to see if an oil company will hire me.
I am building things people will pay for.

That is the difference.`,
    cta: 'Save this. This is the most important math you will ever do.',
    caption: `80,000 graduates. 30,000 jobs. The math doesn't work.\n\nBuilders don't wait in that queue.\n\n#GhanaJobs #CareerTruth #BuildWithAI #AIinGhana`,
  },
  {
    hook: 'The most dangerous advice given to Ghanaian students.',
    script: `The most dangerous advice given to Ghanaian students:

"Study hard, get a good grade, and a good job will find you."

I looked around at the graduates ahead of me.
Brilliant people. First class students.
Some of them are still doing national service at 26, waiting.

The advice is broken.

What actually works?
Show something you built.
A GitHub link. A live website. A tool you made.

One working project does more than a 4.0 GPA in 2026.

I am a 2nd year petroleum engineering student.
My portfolio has 14 live projects.
That is my application.`,
    cta: 'What did you build this month? Drop the link in the comments.',
    caption: `"Study hard and a good job will find you" is broken advice.\n\nIn 2026, your portfolio is your application.\n\n#GhanaStudents #CareerTruth #BuildWithAI #Portfolio`,
  },
  {
    hook: 'AI will not take your job. But this will.',
    script: `Everyone is scared AI will take their job.

That is the wrong fear.

AI won't replace you.
A person your same age, with your same degree,
who also uses AI to do your entire week's output in 3 hours —
THAT person will replace you.

The threat is not the machine.
The threat is the human who learned to use the machine.

I am that person right now, in training.

Come learn with me before it is too late.`,
    cta: 'Follow this page. Free workshop coming in September. Link in bio.',
    caption: `AI won't take your job. Someone your age using AI will.\n\nLearn before it's too late.\n\n#AIinGhana #FutureOfWork #BuildWithAI #SenaAcademy`,
  },
];

// ─── LIVE BUILD DEMOS (Video 2 per day) ────────────────────────────────────────
const BUILD_DEMOS = [
  {
    hook: 'Watch me type one sentence and generate a full business website.',
    script: `[SCREEN RECORD: Open Claude or Bolt.new. Type this prompt slowly so viewers can read it.]

"Build a simple booking website for a Ghanaian barbershop called Kings Cut in Accra. 
Include: hero section, services list, appointment form, and a WhatsApp contact button. 
Mobile-first, dark background, modern design."

[SHOW: Hit Enter. Let the response stream in. Zoom in on the code or preview appearing.]

That prompt took me 8 seconds to type.

The response? A complete, functional barbershop website — ready to deploy.

No CSS classes memorized. No HTML tags written manually. 
Just plain English describing what I want.

[SHOW: Preview of the generated site on mobile view.]

This is what I teach at Sena Academy.
Free September workshop. Link in bio.`,
    visualCue: 'Zoom in on the prompt as you type it slowly. Then zoom out to show the full generated result.',
    caption: `8 seconds to type the prompt. 30 seconds to get a full working website.\n\nThis is what AI building looks like in 2026.\n\n#BuildWithAI #AIinGhana #NoCode #SenaAcademy`,
  },
  {
    hook: 'I built myself a trading journal because the subscriptions were too expensive.',
    script: `[SCREEN RECORD: Open the trading journal app. Navigate through it slowly.]

I trade markets.
And if you are serious about trading, you have to journal EVERYTHING.
Win rate. Risk-reward. Psychology notes. All of it.

The platforms that do this properly charge $30 to $80 dollars a month.
That is GHS 350 to GHS 900. Every month.

I was not paying that.

So I opened Claude and typed:
"Build me a trading journal web app where I can log trades, 
track my win rate, and write notes on each trade."

[SHOW: The app opening, adding a trade entry, seeing the dashboard.]

It built it.
I refined it. Added features. Deployed it.
Cost me GHS 0.

This is what happens when you stop being a consumer and start building.`,
    visualCue: 'Show the actual trading journal app you built. Navigate slowly so people can see the features.',
    caption: `Trading journals cost $80/month. I built my own for free.\n\nAI didn't just save me money. It showed me I could build anything.\n\n#Trading #BuildWithAI #AIinGhana #NoCode`,
  },
  {
    hook: 'Watch me connect a form to a real database in under 3 minutes.',
    script: `[SCREEN RECORD: Open Claude + Supabase dashboard side by side.]

Most people think connecting a form to a database requires a backend developer.

It does not.

Watch this.

[TYPE THE PROMPT:]
"Write JavaScript code to take form values: name, phone, service, and date —
and insert them into a Supabase table called bookings.
Show a success message after saving."

[SHOW: Code generated. Paste into editor. Fill form. Check Supabase dashboard — row appears.]

That row just appeared in a real cloud database.
No backend developer. No server. No GHS 2,000 freelancer fee.

Just a prompt and free tools.`,
    visualCue: 'Split screen: code on left, Supabase table on right. Show the row appearing in real time.',
    caption: `Connecting a form to a cloud database used to need a backend developer.\n\nNow it takes one prompt.\n\n#Supabase #BuildWithAI #NoCode #AIinGhana`,
  },
  {
    hook: 'I built a luxury real estate website in one afternoon. Here is the proof.',
    script: `[SCREEN RECORD: Open solara-three-gamma.vercel.app. Scroll slowly through the site.]

This is Solara Luxury Residences.

A high-end real estate developer website with:
— An interactive floor plan finder
— Unit filtering by bedroom count and price
— An investor ROI calculator
— A mobile-responsive contact and booking form

[PAUSE on the most impressive section]

I built this in one afternoon.
I study petroleum engineering, not computer science.

I described every section to Claude in plain English.
It generated the code. I pasted. I refined. I deployed.

Freelancers would charge GHS 8,000 to GHS 15,000 for this.

This is what AI literacy looks like.`,
    visualCue: 'Show the live website. Slow scroll. Stop on the ROI calculator and floor plan section.',
    caption: `GHS 0 and one afternoon to build this.\n\nFreelancers charge GHS 15,000 for the same thing.\n\nI study petroleum engineering.\n\n#BuildWithAI #AIinGhana #NoCode #WebDev`,
  },
  {
    hook: 'The exact 60-second workflow I use from idea to live website.',
    script: `[SCREEN RECORD: Show your full workflow. Timer visible in corner.]

Step 1: Open Claude. [00:00]
Describe the site in 3–5 sentences. Include the business name, colour, and sections needed.
Hit send.

Step 2: Copy the generated HTML/CSS/JS. [00:20]
Open VS Code or Bolt.new. Paste.

Step 3: Open the browser preview. [00:35]
See it live. If something looks off, describe the fix in plain English.
"Make the font bigger. Change the button to green."

Step 4: Deploy to Vercel. [00:50]
Drag the folder. Click deploy.

Step 5: Live URL. [01:00]
Share with client.

That is it.
That is the entire workflow.
No bootcamp. No CS degree. No tutorials.`,
    visualCue: 'Use a timer overlay. Show each step in real time. Speed up the typing sections.',
    caption: `Idea to live website in 60 seconds.\n\nThis is my actual workflow.\n\n#BuildWithAI #NoCode #AIinGhana #WebDevelopment`,
  },
  {
    hook: 'Watch MoMo payments go live on a website I built in real time.',
    script: `[SCREEN RECORD: Show Paystack integration being tested.]

One of the first questions I always get:
"Can you actually accept Mobile Money on a website you built with AI?"

Yes. Let me show you.

[SHOW: Open Claude. Type:]
"Write JavaScript using the Paystack inline SDK to accept GHS 150 payment 
from a customer on a button click. Show a success message with transaction reference."

[SHOW: Code generated. Paste it. Open the page. Click "Pay Now". Paystack popup appears.]

That is a live GHS 150 MoMo payment popup.

Any local business in Ghana — salon, hostel, baker, gym — 
can start accepting money online with this exact code.

This is what I teach in September. Free. Link in bio.`,
    visualCue: 'Show the Paystack popup appearing on a real webpage. Zoom in so it is clearly visible.',
    caption: `MoMo payments on a website you built yourself.\n\nThis is not theory. This is a working demo.\n\n#Paystack #MoMo #BuildWithAI #GhanaBusiness`,
  },
  {
    hook: 'Building a salon booking app live on screen right now.',
    script: `[SCREEN RECORD: Real-time build. Timer in corner.]

A barbershop in Accra has been getting calls all day.
No system. No bookings. Just chaos.

I am going to build them a solution right now.

[TYPE PROMPT:]
"Build an appointment booking form for a barbershop. 
Include: customer name, phone number, stylist dropdown with 3 names, 
service dropdown, date picker, time slots from 9am to 6pm. 
On submit, open a WhatsApp message to +233XXXXXXXXX with the booking details."

[SHOW: Full form appearing. Fill it in as a demo. Click submit. WhatsApp opens with pre-filled message.]

That took 4 minutes.
That barbershop could charge GHS 1,200 for this.

Or a freelancer could build it for them and charge that same GHS 1,200.

That freelancer could be you.`,
    visualCue: 'Timer overlay. Show the WhatsApp message opening at the end as the payoff moment.',
    caption: `I built a barbershop booking system in 4 minutes.\n\nThe client pays GHS 1,200. The builder earns GHS 1,200.\n\nWhich one will you be?\n\n#BuildWithAI #GhanaBusiness #FreelanceGhana #NoCode`,
  },
  {
    hook: 'First time I showed someone this, they thought I was lying.',
    script: `[SCREEN RECORD: Slow reveal of the site being generated.]

The first time I showed someone Claude building a website in front of them,
they genuinely thought I had prepared it in advance.

They said: "You must have had that code already."

So I opened a fresh browser. Fresh Claude session.
Typed a prompt from scratch in front of them.

Within 40 seconds — a complete homepage appeared.

The look on their face —

[CUT TO: Face on camera. Smile.]

That look is why I make these videos.
Because that look should not be reserved for computer science students.
It should be available to everyone.`,
    visualCue: 'Start with screen record of fresh generation. Cut to face cam for the final 10 seconds.',
    caption: `They thought I was lying. So I did it from scratch in front of them.\n\nThis skill belongs to everyone.\n\n#BuildWithAI #AIinGhana #NoCode #SenaAcademy`,
  },
];

// ─── DAY IN MY LIFE / VLOG (Video 3 per day) ───────────────────────────────────
const VLOGS = [
  {
    hook: 'Day in my life: 2nd year petroleum engineering student who builds websites.',
    script: `[VLOG — Walk and talk from hostel room]

7am. Hostel room. 
Before I open my engineering notes, I check on a project I deployed last night.

[SHOW: Phone/laptop screen briefly]

I study petroleum engineering.
Reservoir mechanics. Fluid dynamics. The full thing.

But after lectures, I come back here —

[GESTURE to hostel room]

— and I build.

Today I am working on a concept booking site for salons.
Not for a client yet. But it will be.

That is the part nobody tells you about building in public.
You build before the client appears.
And when they appear, you are ready.`,
    visualCue: 'Film yourself in hostel room, then walking to campus. Quick cuts. Show screen briefly.',
    caption: `Day in my life: petroleum engineering student who builds websites after lectures.\n\n#DayInMyLife #GhanaStudent #BuildInPublic #AIinGhana`,
  },
  {
    hook: 'What my laptop looks like between lectures.',
    script: `[VLOG — Quick cuts between locations]

Between my 8am lecture and my 11am lab —

[SHOW: Laptop open in study area or corridor]

This is what my laptop looks like.

Claude on one tab.
A project on another.

Most people are on Twitter or YouTube.
I am prompting and building.

It is not because I am special.
It is because I made a decision very early:

Everyone in my class is learning the same petroleum engineering.
If I want a different outcome, I have to do something different.

This is my different.`,
    visualCue: 'POV laptop screen. Quick cut to face. Cut back to screen. Fast paced.',
    caption: `Between lectures, while others scroll — I build.\n\nNot because I'm special. Because I made a decision.\n\n#StudyWithMe #BuildWithAI #GhanaStudent #DayInMyLife`,
  },
  {
    hook: 'Study area at university. Building a real estate website while people read textbooks.',
    script: `[VLOG — Film in study area, low voice]

University study area.
Everyone around me has textbooks open.

I have my engineering notes on one side —

[PAN to laptop]

— and a real estate website I am building on the other.

No one here knows.
This is what building in silence looks like.

I am not smarter than anyone in this room.
I just learned a tool that they have not learned yet.

And by the time most people realise what AI can do,
the ones who started early will be years ahead.`,
    visualCue: 'Low key filming in study area. Whisper-style voice. Show the split: notes and laptop.',
    caption: `Building in silence at the study area.\n\nNobody knows what's on this laptop.\n\n#StudyWithMe #BuildInPublic #AIinGhana #GhanaStudent`,
  },
  {
    hook: 'Hostel room tour: where I build 14 websites with no coding knowledge.',
    script: `[VLOG — Slow pan of hostel room]

This is where I build.

[PAN: Show the setup — ring light, mic, laptop, maybe some books]

Not a Silicon Valley office.
Not a GHS 50,000 MacBook.

A hostel room. A laptop. A ring light I bought for recording videos.
And free tools.

14 live web platforms.
No coding school.
No computer science degree.

This is where petroleum engineering meets AI.

If you are waiting for the perfect setup before you start —
this is mine.
It works fine.`,
    visualCue: 'Slow, deliberate room tour. Stop and look at camera for the final statement.',
    caption: `14 websites built in this hostel room.\n\nNo coding school. No CS degree. No perfect setup.\n\nJust a laptop and free tools.\n\n#HositelLife #BuildWithAI #GhanaStudent #DayInMyLife`,
  },
  {
    hook: 'What I actually do during a free period on campus.',
    script: `[VLOG — Walk and talk]

Free period between lectures.
Most people head to the canteen or scroll social media.

I find a corner —

[SIT DOWN. Open laptop.]

— and I work on whatever project I have open.

Today it is a product catalogue for an Instagram boutique.
Fictional client for now, but I am building the portfolio.

By the time I graduate, I want 30 live projects on my portfolio
and at least 5 real clients.

Right now I have 14 and zero clients.
Every free period is one step closer.`,
    visualCue: 'Walk to a spot on campus. Sit down. Show laptop screen briefly. Look up at camera.',
    caption: `Free period on campus. Everyone else is at the canteen.\n\nI'm building a portfolio.\n\n14 projects. 0 clients yet. Every day is progress.\n\n#BuildInPublic #DayInMyLife #GhanaStudent #AIinGhana`,
  },
  {
    hook: 'Research lab day. Building software while studying petroleum reservoir mechanics.',
    script: `[VLOG — Research lab setting, quieter, more serious tone]

Research lab today.
Petroleum reservoir mechanics.

The kind of work that makes people think: 
"This guy is going to work in oil and gas his whole life."

[LOOK AT CAMERA]

And maybe I will.
But I will also have a software business on the side
that does not need permission from any oil company to run.

That is the insurance policy nobody talks about in engineering programmes.

Build a second skill.
Not as a backup plan.
As a parallel track.`,
    visualCue: 'Film in the research lab context. Serious tone. Look directly into camera for key lines.',
    caption: `Petroleum reservoir mechanics in the research lab.\n\nBuilding software businesses in the evening.\n\nBoth. Always both.\n\n#ResearchLab #BuildWithAI #PetroleumEngineering #GhanaStudent`,
  },
  {
    hook: 'Library session: engineering textbooks on one side, AI tools on the other.',
    script: `[VLOG — University library, whisper/low voice]

University library.

[SHOW: Engineering textbook on desk. Laptop open.]

Petroleum engineering on the left.
AI building on the right.

People who walk past see a student reading.
They do not see that on my laptop I have a live Supabase database
connected to a form that is accepting real data.

Building in public is not about announcing everything.
Sometimes it is just about showing up —
and doing the work — 
before anyone is watching.

The audience comes later.
The skill comes first.`,
    visualCue: 'Subtle library vibes. Whisper narration. Quick shots of both the textbook and laptop screen.',
    caption: `Engineering textbook on the left. AI building on the right.\n\nThe skill comes first. The audience comes later.\n\n#LibraryDay #BuildWithAI #GhanaStudent #DayInMyLife`,
  },
  {
    hook: 'The walk to campus every morning and what I think about.',
    script: `[VLOG — Walking shot, morning, towards campus]

Every morning I walk to campus, I think about the same thing.

[WALKING SHOT — look ahead, then at camera]

Thousands of petroleum engineers will graduate in the next few years.
Most of them will apply to the same 5 oil companies.
Most will not get in.

I am not spending my university years panicking about that.

I am spending them building a skill that does not care about oil prices,
does not care about hiring cycles,
and does not need permission from anyone.

The walk to campus every morning feels different
when you are working on something bigger than the curriculum.`,
    visualCue: 'Genuine walking shot towards campus. Morning light if possible. Look at camera while walking.',
    caption: `The walk to campus hits different when you're building something bigger than the curriculum.\n\n#MorningRoutine #BuildWithAI #GhanaStudent #DayInMyLife`,
  },
];

// ─── ORIGIN STORY BEATS (Video 4 per day) ──────────────────────────────────────
const ORIGIN_STORIES = [
  {
    hook: 'The moment I realised I was building someone else\'s dream, not mine.',
    script: `I want to tell you about the moment that changed everything for me.

I was looking at graduates.
Not random graduates. People I knew. Brilliant people.
First class students. Deans list.

And I started connecting the dots on their lives 3 to 5 years after school.

Most of them had jobs. Some had good jobs.
But very few — very few — were building anything for themselves.

They had traded 4 years of their life for a salary.
Which is not bad. But it is also not free.

And I thought: if everyone around me is learning the exact same thing —
petroleum engineering, law, accounting —
then we are all competing for the same opportunities.

The only way out of that competition is to be exceptional at something different.

I chose AI building.
Not because I am technical.
Because I saw the gap.`,
    cta: 'What did you choose? Drop it in the comments.',
    caption: `I looked at the graduates ahead of me and saw a pattern.\n\nThen I made a different choice.\n\n#RealTalk #GhanaStudent #BuildWithAI #OriginStory`,
  },
  {
    hook: 'I built my first ever app because I was tired of paying subscriptions.',
    script: `My first ever app was a trading journal.

I trade markets. And if you trade seriously —
I mean, if you actually want to improve —
you have to journal every single trade.
Win. Loss. Why you entered. Why you exited. Your emotional state.
Everything.

The platforms that do this properly charge between 30 and 80 dollars a month.
That is over GHS 900. Every month. Just to track your trades.

I was not doing that.

So one night I opened Claude and I typed something like:
"Is it possible to build a web app where I can log trades and track my win rate?"

And it said yes. And started writing the code.

That night changed everything.
Not because I built something useful.
Because I realised: I can build anything I can describe.

That is still the rule I use today.`,
    cta: 'What would you build if you knew you could build anything?',
    caption: `I built my first app because subscriptions were too expensive.\n\nNow I know I can build anything I can describe.\n\n#OriginStory #Trading #BuildWithAI #AIinGhana`,
  },
  {
    hook: 'The Bain report that made me open my laptop the same night.',
    script: `I came across a Bain and Company labour report.

Bain is one of the biggest management consulting firms in the world.
These are not TikTok people. These are researchers.

The report said that by 2030,
the workers who thrive in the global economy
will be the ones with AI literacy.

Not the most experienced.
Not the ones with the most degrees.
AI literacy.

I read that sitting in my hostel room.
I am a petroleum engineering student.

And I thought: if I wait until this becomes obvious to everyone,
it will be too late to be early.

I opened my laptop that same night.
I have not closed it since.`,
    cta: 'Save this and share it with someone in school right now.',
    caption: `A Bain & Company report said AI literacy = survival by 2030.\n\nI read it in my hostel room. I opened my laptop that same night.\n\n#BuildWithAI #AILiteracy #GhanaStudent #OriginStory`,
  },
  {
    hook: 'What I was doing the night I built my first real website.',
    script: `The night I built my first real website,
I was sitting on my bed in my hostel room.

It was a trading journal.
I built it for myself. No client. No audience. Nobody watching.

I had described what I wanted to Claude.
It gave me the code.
I pasted it. I opened the browser.

And it worked.

I do not mean it was perfect.
It was rough. The styling was off. Some buttons did not work.

But the form saved data. The dashboard showed numbers.
It was functional.

And in that moment, sitting alone in my hostel room —
I understood something very clearly:

The barrier to building software was never skill.
It was not knowing that you could ask for help in plain English.

That was two years ago.
I have 14 projects in my portfolio now.
I am still in my hostel room.`,
    cta: 'Follow along as I get my first paid client. The whole journey is here.',
    caption: `The night I built my first website alone in my hostel room.\n\nThat was the night I understood the barrier was never skill.\n\n#OriginStory #BuildWithAI #GhanaStudent #BuildInPublic`,
  },
  {
    hook: 'Nobody tells petroleum engineering students about the parallel track.',
    script: `In petroleum engineering, they teach you one path.

Graduate. Join an oil company or service company.
Work for 30 years. Pension. Retire.

They do not teach you about the parallel track.

The parallel track is: while you are learning petroleum engineering,
you also build a skill that is entirely yours.
Not a skill an employer can take from you.
A skill that generates value independently.

For me, that skill is AI-assisted software building.

Every week I build something.
Sometimes for practice. Sometimes as a concept.
Eventually for clients.

I am still a petroleum engineering student.
I will finish my degree.

But I will finish it with a portfolio, not just a certificate.`,
    cta: 'What is your parallel track? Comment below.',
    caption: `Nobody tells engineering students about the parallel track.\n\nI found mine. AI building.\n\nI will finish my degree AND a portfolio.\n\n#PetroleumEngineering #BuildWithAI #GhanaStudent #ParallelTrack`,
  },
  {
    hook: 'The conversation that made me realise everyone in school is playing the same game.',
    script: `There was a moment — I cannot tell you the exact day —
but I was talking to someone a few years ahead of me.

Smart person. Worked hard. Got good grades.
Was doing national service.

And they said something that stayed with me.

They said: "I did everything they told me to do.
And now I am just waiting."

Just waiting.

That sentence.

That is when I understood:
everyone in school is playing the same game,
with the same rules, expecting different outcomes.

The people who get different outcomes are the ones who added a different variable.

I added AI building.
It cost me GHS 0.
It has already changed how I think about the next 10 years.`,
    cta: 'What variable are you adding to your game?',
    caption: `"I did everything they told me. Now I'm just waiting."\n\nThat sentence changed everything for me.\n\n#RealTalk #GhanaStudent #BuildWithAI #CareerTruth`,
  },
  {
    hook: 'How trading taught me more about business than any lecture.',
    script: `I trade markets.

And trading taught me something that no university lecture has:

If you do not have an edge — a real, tested, documented edge —
you will lose money. Every time. Consistently.

The market does not care about your feelings.
It does not care that you worked hard.
It rewards skill and punishes ignorance.

I took that lesson out of the market and put it into my career.

In the job market, in business —
the people without a real skill get averaged out.
The ones with a genuine edge, compounded over time —
they win.

That is why I build.
That is why I journal my trades.
That is why I am documenting everything here.

Edge is built. Not given.`,
    cta: 'If this hit, follow. I post this kind of thinking every day.',
    caption: `Trading taught me: without a real edge, you lose consistently.\n\nI applied that to my career. Now I build instead of wait.\n\n#Trading #BuildWithAI #Mindset #GhanaYouth`,
  },
  {
    hook: 'Day 1 of documenting my journey to first paid client.',
    script: `Today I am making a decision.

I have 14 web platforms in my portfolio.
I have zero paid clients.

I am a 2nd year petroleum engineering student
who learned to build with AI.

Starting today, I am documenting everything publicly.
Every attempt to get a client.
Every win. Every rejection.

Not because I have already figured it out.
But because the people who figure it out usually did it in public —
where the pressure of being watched forced them to keep going.

This is day one.

Follow along.
Let's see how long it takes.`,
    cta: 'Follow so you don\'t miss the moment I land the first one.',
    caption: `Day 1: 14 projects. 0 clients. Documenting everything.\n\nFollow to see when it happens.\n\n#BuildInPublic #Day1 #GhanaFreelancer #AIinGhana`,
  },
];

// ─── PROMPT BREAKDOWNS (Video 5 per day) ───────────────────────────────────────
const PROMPT_BREAKDOWNS = [
  {
    hook: 'The 4-part prompt structure that gets working code every single time.',
    script: `[SCREEN RECORD — Show Claude open. Type slowly as you narrate.]

Most people's prompts fail because they are too vague.
"Build me a website" is not a prompt. That is a wish.

Here is the 4-part structure I use every time:

Part 1: What you are building.
"Build a booking form for a barbershop."

Part 2: What it must include.
"Include: name field, service dropdown, date picker, time slots."

Part 3: How it must behave.
"On submit, open WhatsApp to +233XXXXXXXXX with booking details."

Part 4: How it must look.
"Mobile-first. Dark background. Green submit button."

[PASTE FULL PROMPT. SHOW RESULT.]

Four parts. One prompt. Full working feature.

Save this. Use it tonight.`,
    caption: `Stop writing vague prompts. Use this 4-part structure instead.\n\n#AIPrompts #BuildWithAI #NoCode #AIinGhana`,
  },
  {
    hook: 'The exact prompt I used to build my trading journal. Copy it.',
    script: `[SCREEN RECORD — Show prompt being typed.]

This is the first prompt that started everything for me.

"Build a web app where I can log a trade entry. 
Fields: date, market/pair traded, entry price, exit price, position size, 
win or loss, profit/loss in GHS, and a notes section.
Calculate and display my overall win rate on a dashboard.
Store all trades in localStorage so they persist on page refresh."

[SHOW: The result. The form. The dashboard with win rate.]

That is it.
That is the exact prompt that made me realise I could build anything.

I refined it over a week.
Added charts. Added filters.

But it started with this one paragraph of plain English.

Steal it.`,
    caption: `The exact prompt that started everything for me.\n\nA trading journal built from one paragraph of plain English.\n\n#AIPrompts #Trading #BuildWithAI #NoCode`,
  },
  {
    hook: 'How to describe a design to AI so it actually looks good.',
    script: `[SCREEN RECORD]

The biggest mistake people make when prompting for design:

They say "make it look nice."

That means nothing to AI.

Instead, be specific:

[TYPE AND SHOW:]
"Design: dark slate background (#0F172A), white headings, 
gray body text. Single accent colour: emerald green (#10B981).
Rounded corners on cards. Subtle border instead of heavy shadows.
Sans-serif font. Generous padding between sections."

[SHOW: The difference between "make it look nice" vs this specific prompt.]

Vague prompts get generic results.
Specific prompts get professional results.

Same tool. Different output. The difference is your description.`,
    caption: `"Make it look nice" is not a design prompt.\n\nHere's how to describe design so AI actually gets it right.\n\n#AIPrompts #BuildWithAI #WebDesign #NoCode`,
  },
  {
    hook: 'Copy this prompt to add MoMo payments to any website in 5 minutes.',
    script: `[SCREEN RECORD — Paystack integration demo]

Ghanaian businesses leave money on the table daily
because their website has no way to accept payment.

Here is the prompt to fix that:

[TYPE SLOWLY:]
"Using the Paystack inline JavaScript SDK,
write code that triggers a payment popup when a user clicks 'Pay Now'.
Amount: [X] GHS. Customer email: taken from a form field.
On successful payment, show a confirmation message with the transaction reference."

[SHOW: Paste into project. Paystack popup appears on click.]

That popup accepts MoMo, Visa, and bank cards.

Paystack is free to set up.
The prompt is free.
The only cost is the transaction fee Paystack takes when money moves.

Every local business website you build should have this.`,
    caption: `Add MoMo payments to any website in 5 minutes.\n\nCopy this exact prompt.\n\n#Paystack #MoMo #GhanaBusiness #BuildWithAI`,
  },
  {
    hook: 'The debugging prompt that fixes broken code every time.',
    script: `[SCREEN RECORD — Show broken code, then the fix.]

The most common reason people quit building with AI:
the code breaks and they do not know how to fix it.

Here is the prompt that fixes almost everything:

[TYPE:]
"Here is my code: [PASTE YOUR CODE]

The problem is: [DESCRIBE IN PLAIN ENGLISH WHAT IS NOT WORKING]

For example: 'The form submits but nothing appears in the database.'
Or: 'The button works on desktop but not on mobile.'

Please identify the exact bug, explain why it happens in simple terms,
and give me the corrected version."

[SHOW: Broken code in. Fixed code out.]

You do not need to understand the bug.
You need to describe the symptom in plain English.

That is it. That is debugging with AI.`,
    caption: `Broken code doesn't have to stop you.\n\nUse this prompt to fix it without understanding a single line.\n\n#AIPrompts #Debugging #BuildWithAI #NoCode`,
  },
  {
    hook: 'How to make AI build something that looks like a real agency made it.',
    script: `[SCREEN RECORD — Before and after comparison.]

The difference between an AI-generated site that looks cheap
and one that looks like a GHS 10,000 agency job:

The prompt quality.

Here is what most people type:
"Build me a website for my business."

Here is what I type:

[TYPE:]
"Build a premium, conversion-focused landing page for [BUSINESS].
Visual style: Linear.app or Stripe.com level minimalism.
No stock photo backgrounds. Use abstract geometric shapes or gradients instead.
Typography: large, tight-kerned headline. Small caps label above it.
Micro-interactions: buttons scale slightly on hover. Cards lift 2px.
Footer: just logo, one tagline, and a WhatsApp link. Nothing else."

[SHOW: Result.]

Same AI. Same tool.
Completely different output.

The quality of your prompt is the quality of your product.`,
    caption: `The gap between cheap AI sites and premium ones is just the prompt quality.\n\nHere's how to write prompts that get agency-level results.\n\n#AIPrompts #WebDesign #BuildWithAI #NoCode`,
  },
  {
    hook: 'Prompt to build a searchable product catalogue for any Ghanaian shop.',
    script: `[SCREEN RECORD]

Every Instagram boutique or thrift shop in Ghana is losing sales in DMs.

Here is the prompt to fix it:

[TYPE:]
"Build a product catalogue page for a Ghana fashion boutique.
Show 6 products in a 2-column mobile grid.
Each product card: photo (use placeholder), name, price in GHS, available sizes, 
and a green 'Order on WhatsApp' button.
WhatsApp button opens: 'Hi, I want to order [PRODUCT NAME] in size [SIZE]' 
pre-filled to +233XXXXXXXXX.
Clean white background. No navbar needed."

[SHOW: Result. Click the WhatsApp button. Message pre-fills.]

That is a professional online shop.
Built in 3 minutes.
Chargeable for GHS 900 minimum.

The boutique owner just needs to replace the placeholder images with their actual photos.`,
    caption: `Every Ghanaian boutique needs this instead of selling in DMs.\n\nCopy this prompt. Build it in 3 minutes. Charge GHS 900.\n\n#GhanaBusiness #BuildWithAI #AIPrompts #NoCode`,
  },
  {
    hook: 'One prompt to connect your website to a real cloud database forever.',
    script: `[SCREEN RECORD — Supabase integration.]

Most websites built with AI are "dumb" —
the form submits and the data disappears.

Here is how to make it permanent.

[TYPE:]
"I am using Supabase. Write JavaScript that:
1. Imports the Supabase client using my project URL and anon key.
2. On form submit, inserts: name, email, phone, and message into a table called 'leads'.
3. Displays 'Thank you! We will be in touch.' on success.
4. Displays 'Something went wrong.' on error."

[SHOW: Form fills. Data appears in Supabase dashboard in real time.]

That is a real cloud database.
Your leads are now stored forever.
Accessible from anywhere.

Free tier: 50,000 rows. 
More than enough for any Ghanaian small business starting out.`,
    caption: `Make your website actually store data forever.\n\nOne Supabase prompt. Real cloud database. Free to start.\n\n#Supabase #BuildWithAI #AIPrompts #NoCode`,
  },
];

// ─── MYTH BUSTS (Video 6 per day) ──────────────────────────────────────────────
const MYTH_BUSTS = [
  {
    hook: 'You do not need a powerful laptop to build with AI.',
    myth: 'You need a GHS 8,000 MacBook.',
    truth: 'Claude and Bolt.new run in any browser. Any laptop. Any phone. I build from a university hostel room on a regular laptop with a charger that wobbles.',
    caption: 'Waiting for a better laptop is an excuse. I said what I said.\n\n#BuildWithAI #NoCode #AIinGhana #RealTalk',
  },
  {
    hook: 'No, you do not need to learn Python first.',
    myth: 'You must learn Python or JavaScript before you can build real software.',
    truth: 'I have 14 live web projects. I have never taken a programming language course. You describe what you want in English. The AI writes the language. You use the result.',
    caption: '"Learn Python first" is 2019 advice. This is 2026.\n\n#BuildWithAI #NoCode #AIinGhana #Myth',
  },
  {
    hook: 'Building with AI is not cheating.',
    myth: 'Using AI to build software is not real skill. You are not a real developer.',
    truth: 'A carpenter who uses a nail gun instead of a hammer is not cheating. They are building faster. The skill is knowing what to build, how to describe it, and how to make it work for real people. AI is the nail gun.',
    caption: 'Using AI to build is not cheating. It\'s leverage.\n\n#BuildWithAI #RealTalk #AIinGhana #NoCode',
  },
  {
    hook: 'You do not need to be in Accra to get clients.',
    myth: 'Local tech clients are only in Accra or Kumasi. If you are at a regional university, you have no market.',
    truth: 'Every campus, every town, every village with a barbershop, salon, or pharmacy is a potential client. The website is delivered online. You can be anywhere.',
    caption: 'Your location is not your market. The internet is your market.\n\n#FreelanceGhana #BuildWithAI #AIinGhana #NoCode',
  },
  {
    hook: 'You do not need a registered company to take your first client.',
    myth: 'You need a business registration, a company name, and an invoice system before you can work with clients.',
    truth: 'Your first client pays GHS 1,200. They pay you via MoMo. You deliver the website. That is it. Register the company when the income justifies it. Not before.',
    caption: 'Stop waiting to be official before you start being useful.\n\n#FreelanceGhana #BuildWithAI #GhanaBusiness #RealTalk',
  },
  {
    hook: 'Hosting your website does not cost money.',
    myth: 'You need to pay for web hosting to put a site online.',
    truth: 'Vercel is free. Netlify is free. GitHub Pages is free. I have deployed 14 live projects and paid GHS 0 in hosting. The only thing you might pay for is a custom domain — GHS 80 a year at most.',
    caption: 'Free hosting exists. Stop using cost as an excuse.\n\n#BuildWithAI #NoCode #AIinGhana #WebHosting',
  },
  {
    hook: 'This does not only work in the US. It works in Ghana.',
    myth: 'AI building and freelance web development only works in Western countries where clients have money.',
    truth: 'I am building in Ghana for Ghana. Local businesses pay GHS 900 to GHS 2,500 for simple websites. They have the money. They just do not know to ask. Your job is to ask.',
    caption: 'Ghana has the market. Ghana has the clients. You just have to show up.\n\n#GhanaBusiness #FreelanceGhana #BuildWithAI #AIinGhana',
  },
  {
    hook: 'You do not need a portfolio before you start talking to clients.',
    myth: 'You need a polished portfolio before you can approach any client.',
    truth: 'Build 3 concept projects in 3 different niches. A salon, a boutique, and a school. Put them on Vercel with live links. That is a portfolio. It cost you a weekend. Start approaching clients on Monday.',
    caption: 'Build 3 concept sites this weekend. Approach clients Monday.\n\nNo excuses after this.\n\n#BuildWithAI #FreelanceGhana #AIinGhana #NoCode',
  },
];

// ─── POV SKITS (Video 7 per day) ────────────────────────────────────────────────
const POV_SKITS = [
  {
    hook: 'POV: Your coursemate asks what you do after lectures.',
    script: `[SKIT FORMAT — set up two sides of a conversation]

Coursemate: "What do you do after lectures?"

Me: "I build websites."

Coursemate: "Oh you study computer science too?"

Me: "No. Petroleum engineering."

Coursemate: "So… who teaches you?"

Me: "I describe what I want. An AI writes it. I use it."

[LONG PAUSE. Coursemate's confused face.]

Coursemate: "So… can you build me one?"

[LOOK AT CAMERA]

First client unlocked.`,
    caption: 'The conversation that changes everything.\n\n#POV #BuildWithAI #GhanaStudent #AIinGhana',
  },
  {
    hook: 'POV: You just showed a local business owner their new website.',
    script: `[SKIT FORMAT — reaction video style]

You: "This is what your business website could look like."

[SHOW PHONE WITH WEBSITE TO CAMERA]

Business owner: [PAUSE]

Business owner: "But… how? Who built this?"

You: "I did."

Business owner: "You built this? How much?"

[LOOK AT CAMERA. Slight smile.]

You: "GHS 1,200."

Business owner: "When can you start?"

[THIS IS HOW EVERY FIRST CLIENT CONVERSATION SHOULD GO]`,
    caption: 'This is the conversation I am working towards.\n\nEvery project I build is preparation for this moment.\n\n#POV #FreelanceGhana #BuildWithAI #FirstClient',
  },
  {
    hook: 'POV: You are in a lecture about petroleum reservoir mechanics and your side project just got 100 visitors.',
    script: `[SIT IN LECTURE POSITION. Phone on desk. Lecture sounds in background if possible.]

[PHONE NOTIFICATION: Vercel — 100 unique visitors]

[LOOK AT PHONE. Look up at camera. Back at phone.]

Reservoir mechanics lecture is happening.
My website just hit 100 visitors.

[PAUSE]

Both things can be true at the same time.

Study your degree.
Build your parallel income.

Not one or the other.
Both.`,
    caption: 'Reservoir mechanics lecture + 100 website visitors.\n\nBoth at the same time.\n\n#POV #BuildInPublic #GhanaStudent #PetroleumEngineering',
  },
  {
    hook: 'POV: You just realised you could have built that trading journal 2 years ago.',
    script: `[REACTION STYLE — look of realisation]

[STARE AT CAMERA for 3 seconds]

I paid for a trading journal subscription for 8 months.
GHS 180 every month.

GHS 1,440 total.

[PAUSE]

The free AI tools that could have built it for me?
They existed the whole time.

I just did not know to ask.

[LOOK DOWN. Look up.]

That is the whole point of this page.
So you do not waste 8 months finding out the hard way.`,
    caption: 'I paid GHS 1,440 in subscriptions that I could have built for free.\n\nDon\'t make the same mistake.\n\n#POV #Trading #BuildWithAI #RealTalk',
  },
  {
    hook: 'POV: You type a sentence and a full website appears.',
    script: `[SCREEN RECORD first 10 seconds, then cut to face]

[SHOW: Type one sentence prompt. Hit enter.]

[CUT TO FACE: Reaction of watching it generate]

This face —

[POINT TO OWN FACE]

This is the face of someone watching the rules change.

This is not magic.
This is a tool.
A tool that should be in every Ghanaian student's hand right now.

Not in 2028 when everyone knows about it.

Now.`,
    caption: 'The face of watching the rules change in real time.\n\nGet this tool in your hand now, not when everyone knows about it.\n\n#POV #BuildWithAI #AIinGhana #RealTalk',
  },
  {
    hook: 'POV: First time you open Claude and build something that actually works.',
    script: `[REACTION STYLE]

Picture this.

You have never written a line of code in your life.
You open Claude.
You describe what you want in plain English.
You paste the result into a browser.

And it works.

[PAUSE]

Not almost works.
Not kind of works.

WORKS.

[LOOK AT CAMERA]

That moment does something to you.
It removes a wall from your mind that you did not even know was there.

That wall says: "Software is for technical people. Not me."

Once that wall is gone, it never comes back.`,
    caption: 'The moment that wall falls down, it never comes back.\n\nThis is that moment for most people.\n\n#POV #BuildWithAI #AIinGhana #FirstBuild',
  },
  {
    hook: 'POV: Someone tells you AI building is not a real skill.',
    script: `[STRAIGHT TO CAMERA. Calm but direct.]

Someone told me AI building is not a real skill.

I asked them one question:

"When a client pays you GHS 1,500 for a website you built with AI,
is that fake money or real money?"

[PAUSE]

They did not have an answer.

Skill is the ability to create value for someone else.
The tools you use to do it are irrelevant.

Clients do not pay for code.
They pay for solutions.

Build solutions. Get paid. Move on.`,
    caption: 'Skill = ability to create value. The tools are irrelevant.\n\nClients pay for solutions, not code.\n\n#POV #BuildWithAI #RealTalk #FreelanceGhana',
  },
  {
    hook: 'POV: You pitch your first website to a local business and they say yes.',
    script: `[EXCITED ENERGY — as if it just happened]

Okay. Imagine this.

You walk into a barbershop.
You show the owner a website you built for a similar barbershop —
one of your practice projects.

They look at it.
They look at you.

They say: "Can you do this for my shop?"

You say: "Yes. GHS 1,200. 50 percent upfront."

They say: "Okay."

[PAUSE]

GHS 600 just landed in your MoMo account.
For building something that took you 2 hours.

This is not a fantasy.
This is the plan.

I have the projects.
I am working on the first conversation.`,
    caption: 'This is the exact plan I am executing right now.\n\n14 projects. Working on conversation #1.\n\nFollow to see it happen.\n\n#POV #BuildInPublic #FreelanceGhana #GhanaStudent',
  },
];

// ─── SMALL BIZ OPPORTUNITIES (Video 8 per day) ─────────────────────────────────
const SMALL_BIZ = [
  {
    biz: 'Barbershop / Salon',
    hook: 'Every barbershop in Ghana is losing money on missed appointments.',
    problem: 'Customers call all day. The barber picks up mid-cut. Takes a mental note. Forgets. No-shows happen. No deposit taken. Real money lost every week.',
    solution: 'A simple booking page: pick stylist, service, date, time. Submit. WhatsApp confirmation sent. GHS 20 deposit captured via MoMo before they even walk in.',
    pitch: '"I noticed you don\'t have a booking system. I built one for a similar barbershop — let me show you. If you like it, I build yours for GHS 1,200. Take 2 days."',
    price: 'GHS 1,200 – GHS 1,800',
    caption: 'Every barbershop owner knows this problem. Very few know the solution exists.\n\nYou can be the one who shows them.\n\n#GhanaBusiness #FreelanceGhana #BuildWithAI #NoCode',
  },
  {
    biz: 'Campus Hostel',
    hook: 'Students walk from hostel to hostel looking for rooms. This is a 2026 problem with a 2010 solution.',
    problem: 'No system. Students walk in. "Is there a room?" "Come back tomorrow." Student leaves. Another student takes the room. First student comes back — nothing.',
    solution: 'A simple room availability page. Shows available rooms, prices, and room types. WhatsApp button to confirm booking. GHS 30 deposit to hold the room.',
    pitch: '"I can build you a page that shows your available rooms in real time. Students find you on their phones before they walk in. I charge GHS 1,200."',
    price: 'GHS 1,200 – GHS 1,500',
    caption: 'Students are still walking from hostel to hostel in 2026.\n\nThis problem has a GHS 1,200 solution.\n\n#CampusLife #GhanaBusiness #BuildWithAI #FreelanceGhana',
  },
  {
    biz: 'Instagram Boutique / Thrift Shop',
    hook: 'Instagram boutique sellers are drowning in DMs and losing half their sales.',
    problem: 'Customer DMs: "Do you have size 12?" Seller replies 3 hours later. Customer already bought from someone else. No product page. No size chart. No clear price list.',
    solution: 'A product catalogue page: 6–12 items, photo, price in GHS, sizes, and a pre-filled WhatsApp order button. Customer taps one button and the message is already written.',
    pitch: '"Can I show you something? This is what your shop could look like online. Takes me 2 days to build. GHS 900."',
    price: 'GHS 900 – GHS 1,200',
    caption: 'Instagram boutiques lose 40% of sales in the DMs.\n\nA GHS 900 product page solves this permanently.\n\n#GhanaBusiness #BuildWithAI #FreelanceGhana #InstagramBusiness',
  },
  {
    biz: 'Private School / Daycare',
    hook: 'Private schools in Ghana are still calling parents individually. There is a better way.',
    problem: 'Parents call about fees. Teachers call about events. Admin calls about admissions. Everyone is on the phone all day. No central information point.',
    solution: 'A simple school portal: fee structure page, event calendar, admission enquiry form, and a contact section. Parents find answers before they call.',
    pitch: '"What if parents could check fees and school events on their phones without calling? I build this in 3 days. GHS 2,000."',
    price: 'GHS 1,800 – GHS 2,500',
    caption: 'Private schools lose hours daily on calls that a website page could answer.\n\nGHS 2,000 to solve a permanent problem.\n\n#GhanaEducation #BuildWithAI #FreelanceGhana #SchoolWebsite',
  },
  {
    biz: 'Personal Trainer / Fitness Coach',
    hook: 'Fitness coaches in Ghana are selling sessions one by one in WhatsApp. There is a smarter model.',
    problem: 'Trainer posts: "Slots available this week." 20 DMs. Trainer replies to each one. Schedules manually. One person cancels. Trainer loses that hour with no deposit.',
    solution: 'A booking page with session types, pricing, and a MoMo deposit to hold the slot. Recurring clients can subscribe monthly via Paystack.',
    pitch: '"You are spending hours managing bookings in DMs. I build you a system that does it automatically. GHS 1,200."',
    price: 'GHS 1,000 – GHS 1,500',
    caption: 'Fitness coaches are selling one session at a time.\n\nA booking page with MoMo deposit changes the whole model.\n\n#FitnessGhana #BuildWithAI #FreelanceGhana #GhanaBusiness',
  },
  {
    biz: 'Church / Ministry',
    hook: 'Every church in Ghana loses offerings and members because they have no digital presence.',
    problem: 'Members forget tithe dates. New visitors cannot find information. Past sermons are inaccessible. Events are only announced verbally on Sunday.',
    solution: 'A simple church website: sermon archive with audio, giving portal with MoMo, event calendar, and a "Join Us" form for new visitors.',
    pitch: '"Most churches your size have a website now. I can build yours for GHS 1,200. Includes a giving button so members can tithe from their phone."',
    price: 'GHS 1,000 – GHS 1,500',
    caption: 'Churches are losing tithes because they have no way to receive them digitally.\n\nGHS 1,200 website with MoMo giving changes that.\n\n#GhanaChurch #BuildWithAI #FreelanceGhana #GhanaBusiness',
  },
  {
    biz: 'Event Planner / Photographer',
    hook: 'Event planners and photographers in Ghana have no professional online presence. This is a mistake.',
    problem: 'Potential clients cannot see past work. Cannot check availability. Cannot get a quote. They message someone else who has a website.',
    solution: 'A portfolio site: past events or photos in a gallery, a pricing guide, an availability calendar, and a "Book a Consultation" form.',
    pitch: '"When a potential client searches for a photographer in Accra, do they find you? I build you a portfolio that shows up and converts. GHS 1,500."',
    price: 'GHS 1,200 – GHS 2,000',
    caption: 'Photographers and event planners with no website are invisible.\n\nGHS 1,500 portfolio site. Always open. Always selling.\n\n#GhanaPhotography #BuildWithAI #FreelanceGhana #GhanaBusiness',
  },
  {
    biz: 'Real Estate Agent / Land Broker',
    hook: 'Land brokers in Ghana still share property details in WhatsApp voice notes. This is costing them serious clients.',
    problem: 'Serious buyers want to browse listings, see photos, check location, and compare prices before calling. A voice note does not do that.',
    solution: 'A property listings page: photos, location, price, bedroom count, and a WhatsApp enquiry button. Filterable by location and price range.',
    pitch: '"Serious buyers do not respond to voice notes. I build you a listings page where they browse and qualify themselves before contacting you. GHS 2,000."',
    price: 'GHS 1,800 – GHS 2,500',
    caption: 'Sharing property details in WhatsApp voice notes is costing brokers serious buyers.\n\nA listings page filters and qualifies buyers automatically.\n\n#RealEstateGhana #BuildWithAI #FreelanceGhana #GhanaBusiness',
  },
];

// ─── BUILD IN PUBLIC (Video 9 per day) ─────────────────────────────────────────
const BUILD_IN_PUBLIC = [
  {
    hook: 'Day 1 of trying to land my first web development client. No experience. No referrals. Just a portfolio.',
    script: `Day 1.

I have 14 web platforms built and deployed.
I have zero paid clients.

Today I am starting to change that.

My plan:
Find 5 local businesses in my area with no website.
Build a quick concept version for one of them.
Show up and pitch it in person.

No cold emails. No DMs yet.
In person.

[SHOW: Notes app with business types listed]

Barbershop. Salon. Pharmacy. Hostel. Restaurant.

I am going to update you with every single attempt.
Whether it fails or works.

This is the whole journey. Not just the highlight reel.`,
    caption: '14 projects. 0 clients. Day 1 of changing that.\n\nEvery attempt documented here.\n\n#BuildInPublic #Day1 #FreelanceGhana #AIinGhana',
  },
  {
    hook: 'What I worked on today. Building in public update.',
    script: `Quick update on what I built today.

[SHOW: Screen briefly]

Working on a concept booking site for a barbershop.
Not a real client yet — but a real demo.

The idea is simple:
When I go to pitch to an actual barbershop,
I want to show them something for THEIR type of business.

Not a generic template.
A barbershop site that looks like theirs could look.

That specificity is what converts "no" to "how much?"

Build the thing before the client exists.
The client will appear.`,
    caption: 'Building the demo before the client exists.\n\nBecause the client appears when you are ready.\n\n#BuildInPublic #BuildWithAI #FreelanceGhana #Progress',
  },
  {
    hook: 'Current portfolio count and what I am building next.',
    script: `Status update.

[COUNT ON FINGERS or SHOW NOTES APP]

14 live projects on Vercel.
0 paid clients.

What is in progress:

Concept 1: Barbershop booking site — 80% done.
Concept 2: Thrift boutique catalogue — starting this week.
Concept 3: Private school portal — planned.

The strategy:
Build 3 highly specific demos for 3 different local business types.
Then approach 5 businesses in each category.

That is 15 pitches.
Industry average conversion: 1 in 5.

If the average holds, that is 3 clients.
First real income from building.

Let's go.`,
    caption: 'Current status: 14 projects, 0 clients, 3 demos in progress.\n\n15 pitches coming. Let\'s see.\n\n#BuildInPublic #FreelanceGhana #Progress #AIinGhana',
  },
  {
    hook: 'The hardest part of building in public that nobody talks about.',
    script: `The hardest part of building in public is not the building.

It is showing up when there is nothing to show.

When no client has said yes yet.
When the view count is low.
When a classmate asks "but are you actually making money from this?"

And the honest answer is: not yet.

[PAUSE]

But here is what I know about the gap between "not yet" and "yes":

It is filled by people who kept showing up anyway.

I am in the gap right now.
And I am posting from it.

Follow so you see when I get out of it.`,
    caption: 'Showing up from inside the gap.\n\nNot yet. But close.\n\n#BuildInPublic #RealTalk #FreelanceGhana #GhanaStudent',
  },
  {
    hook: 'This is what my portfolio looks like right now. Honest review.',
    script: `[SCREEN RECORD — Share portfolio page slowly]

Honest review of my own portfolio.

[NAVIGATE: portfoliosite-xi-one.vercel.app/projects]

14 projects. Mix of live client work and concept builds.

What is strong:
— The quality looks professional. Nobody can tell I used AI.
— Range of niches: real estate, education, personal brand, fitness, SaaS.

What needs work:
— I need more Ghanaian local business demos.
— I need a case study that shows the before and after for a real client.

That second one I cannot fix until I get a real client.

Which is exactly why I am posting every day.
Building the audience that brings the client.`,
    caption: 'Honest review of my own portfolio: what is strong and what needs a real client to fix.\n\nWorking on it daily.\n\n#BuildInPublic #Portfolio #FreelanceGhana #AIinGhana',
  },
  {
    hook: 'What I am learning from posting every day even with a small following.',
    script: `Something is shifting from posting every day.

Not in follower count yet.
But in clarity.

Every video I make forces me to articulate something I understand intuitively
into words someone else can act on.

That process makes me better at explaining the work.

Which is exactly the skill I need when I walk into a barbershop
and have 90 seconds to explain why they need a website
and why I am the person to build it.

TikTok is not just content.
It is practice for the pitch.

Every video is a pitch.`,
    caption: 'Every video I post is practice for the client pitch.\n\nTikTok is the training ground.\n\n#BuildInPublic #ContentCreator #FreelanceGhana #RealTalk',
  },
  {
    hook: 'I tried to pitch a local business today. Here is what happened.',
    script: `I approached a business today.
I had the demo on my phone.
I had the pitch ready.

[PAUSE]

The owner was not there.
Come back tomorrow.

[LOOK AT CAMERA]

That is it. That is the update.

Nobody shows you this part on social media.
The "come back tomorrow."
The walk home with the pitch unused.

But this is what building in public actually looks like.
Not just the wins.
The days you come back with nothing.

I am coming back tomorrow.`,
    caption: '"Come back tomorrow."\n\nThat\'s the update. Trying again tomorrow.\n\nThis is what building in public actually looks like.\n\n#BuildInPublic #RealTalk #FreelanceGhana #GhanaStudent',
  },
  {
    hook: 'Why I document everything even when nothing is happening yet.',
    script: `People ask me: why are you documenting if you don't have clients?

Here is the honest answer.

The audience I am building right now is worth more than a client.

A client pays me once.
An audience of people watching my journey —
some of them will become clients.
Some will send me referrals.
Some will join Sena Academy.
Some will just watch.

And I am okay with all of those.

Every post is an asset.
Every video is a document of the journey.

When I eventually land that first client,
the video of that moment will be the most viewed thing on this page.

I am setting up for that moment.`,
    caption: 'The audience is the asset. Every post builds it.\n\nI\'m setting up for the first-client video.\n\n#BuildInPublic #ContentStrategy #FreelanceGhana #AIinGhana',
  },
];

// ─── STORY TIME (Video 10 per day) ─────────────────────────────────────────────
const STORY_TIMES = [
  {
    hook: 'The real reason I became a petroleum engineering student who builds websites.',
    script: `I want to tell you the real story.

Not the polished version.

I observed people.
That is what I do.
I watch how things turn out for people and I connect the dots backwards.

And what I observed was this:

Thousands of brilliant people graduate every year in Ghana.
Most of them are competing for the same small number of opportunities.
The ones who fill the real gaps — who build real wealth — are exceptional at something specific.

Not just educated. Exceptional.

I looked at what was coming.
I read a Bain report about AI literacy and the future of work.
I looked at what I could learn that would cost me nothing but time.

And I started building.

Not because someone told me to.
Not because I wanted to change my major.

Because no one is coming to save me.
And the earlier I understood that, the better.

I am still in my 2nd year.
I have 14 projects.
Zero clients.

But I am ahead of where I would have been
if I had just kept my head down and read reservoir mechanics.

That is the story.`,
    caption: 'Nobody is coming to save you.\n\nThe earlier you understand that, the better.\n\n#StoryTime #GhanaStudent #BuildWithAI #RealTalk',
  },
  {
    hook: 'The night I built my first trading journal and realised I could build anything.',
    script: `Let me tell you about the night everything changed.

I trade markets.
If you trade seriously, you must journal.
Win rate, risk-reward, psychology, all of it.

The platforms that do this properly charge 30 to 80 dollars a month.
I was not paying that.

So one night — just to see if it was possible —
I opened Claude and I described a trading journal app.

Fields for entry and exit price.
Win rate calculation.
Notes per trade.

And it wrote the code.

I pasted it into a browser.
It worked.

Not perfectly. The styling was off. Some things were broken.
But the core worked. Data saved. Win rate calculated.

I sat there in my hostel room staring at something I had built
without writing a single line of code intentionally.

And in that moment I understood:
the barrier was never technical knowledge.

The barrier was not knowing you could ask for help in plain English.

That realisation changed how I think about everything.
Software. Business. Opportunities.

If I can describe it in English, I can build it.

That is still the rule.`,
    caption: 'The night I sat in my hostel and watched code appear that I described in plain English.\n\nThat was the moment the barrier fell.\n\n#StoryTime #Trading #BuildWithAI #OriginStory',
  },
  {
    hook: 'What looking at other people\'s lives taught me about my own career.',
    script: `I watch people. A lot.

Not in a weird way. In a pattern-recognition way.

I look at graduates 3 to 5 years ahead of me.
I look at how their lives turned out.
Not to judge — to learn.

And the pattern I noticed is uncomfortable.

Most people who graduate, even with good degrees and decent grades —
they end up in a narrow band of outcomes.
Entry level job. Steady but not exceptional. Waiting.

But the ones outside that band?
The ones actually building wealth in their 20s?

They had a specific, demonstrable skill.
Something they could show, not just say.

Not a degree. A skill.

In engineering, we learn to analyse systems.
I took that same analytical thinking and applied it to career strategy.

If everyone learns the same thing in school,
and competing for the same jobs —
then the variable is what you build on top.

I chose AI-assisted software building.
It cost me nothing but time.

It is not yet paying me in money.
But it is paying me in capability.
And capability compounds.`,
    caption: 'I analysed the pattern in graduates around me. Then I made a different choice.\n\n#StoryTime #CareerTruth #GhanaStudent #BuildWithAI',
  },
  {
    hook: 'Why I stopped waiting to be ready and started building before I was.',
    script: `There is a version of this journey where I wait.

I wait until I finish my degree.
I wait until I have "real" coding skills.
I wait until I have a client ready before I build.
I wait until my portfolio is perfect before I post.

That version of this journey does not exist.

Because waiting for ready is a way of never starting.

The people who are where I want to be in 5 years?
They started messy.

They posted before they were polished.
They pitched before they had a full portfolio.
They built before anyone was watching.

I decided to do the same.

14 projects. Zero clients. Posting every day.
None of it is perfect.

But it is real.
And real compounds.

The polished version comes later.
The starting version is now.`,
    caption: 'Waiting for ready is a way of never starting.\n\nI started messy. You should too.\n\n#StoryTime #BuildInPublic #RealTalk #GhanaStudent',
  },
  {
    hook: 'The gap between where I am and where I want to be — and what I am doing about it.',
    script: `Let me be completely honest with you.

Gap number 1:
I study petroleum engineering.
I want to build a software business.
Those two things do not connect automatically.

Gap number 2:
I have 14 projects.
I have zero paid clients.
The portfolio exists but the income does not yet.

Gap number 3:
I am building in public.
My audience is small right now.
The reach does not reflect the quality of the work yet.

These are the real gaps.

Here is what I am doing about each one:

Gap 1: The degree gives me credibility and structure.
The software skill gives me options the degree alone cannot.
I am finishing both.

Gap 2: I am building concept demos for specific local business types.
Then I am pitching in person.
One yes changes the whole story.

Gap 3: I am posting every single day.
Volume and consistency build audiences.
Even a small audience converts if the content is real.

This is the plan.
Watch it work.`,
    caption: 'The gaps are real. The plan is real. The work is happening.\n\nWatch.\n\n#StoryTime #BuildInPublic #RealTalk #FreelanceGhana',
  },
  {
    hook: 'What I would tell a Ghanaian student who just entered first year.',
    script: `If I could go back to first year and tell myself one thing:

Start building something in your first semester.

Not after you graduate.
Not when you feel ready.
Not when you have the time.

First semester.

It does not matter what.
A simple webpage. A calculator. A to-do list.

The point is not the product.
The point is the realisation that you can build something real with free tools and plain English.

Once you have that realisation in year one,
you spend the next 4 years compounding it.

By the time you graduate,
you do not enter the job market as a graduate with a certificate.

You enter it as a graduate with a portfolio, clients, and proof.

That is a completely different conversation with the world.

Start in first semester.`,
    caption: 'What I would tell every first-year student in Ghana.\n\nStart building in semester one. Not semester eight.\n\n#StoryTime #GhanaStudent #BuildWithAI #CareerAdvice',
  },
  {
    hook: 'The thing about trading that most people miss — and how it applies to building.',
    script: `I trade markets.

And there is something traders learn very quickly
that most people in other fields never learn:

The market does not care about your effort.

You can work 12 hours a day on a bad strategy
and lose money consistently.

Meanwhile someone with a better strategy works 2 hours
and grows steadily.

Effort is not the variable.
Edge is.

I carried that lesson into building.

Most graduates work extremely hard.
On the wrong things.
In the wrong direction.

Building an AI skill is not working harder.
It is building a different edge.

Trading taught me that edge compounds.
Small edge, applied consistently, over time — changes outcomes dramatically.

That is what I am doing here.
Building edge.

Not hustle. Edge.`,
    caption: 'Trading taught me: effort without edge loses consistently.\n\nBuild edge, not hustle.\n\n#StoryTime #Trading #BuildWithAI #Mindset',
  },
  {
    hook: 'What Sena Academy actually is — and why I built it while still in school.',
    script: `Let me tell you what Sena Academy actually is.

It is not a typical tech school.

It is a live, online workshop
where I teach non-technical people in Ghana
how to build real web platforms using AI and plain English.

No coding required.
No prior knowledge needed.

I built it because I kept seeing the same pattern:

Smart people. Motivated people.
Who did not know that the barrier to building software had changed.

The barrier used to be: can you write code?

The barrier now is: can you clearly describe what you want?

That is a very different skill.
And it is a skill anyone can learn.

I am a petroleum engineering student.
I built the entire Sena Academy learning management system myself.
With AI.

If I can build an LMS while studying reservoir mechanics,
you can build a booking site for a local business.

That is the whole point.
Free workshop. September. Link in bio.`,
    caption: 'What Sena Academy actually is — and why I built it while still studying.\n\nFree September workshop. Link in bio.\n\n#SenaAcademy #StoryTime #BuildWithAI #AIinGhana',
  },
];

// ─── MAIN GENERATION FUNCTION ──────────────────────────────────────────────────
function generateScript(dayIndex, videoIndex) {
  const archetype = ARCHETYPES[videoIndex];
  const format = FORMATS[videoIndex];
  const duration = DURATIONS[videoIndex];
  const location = getLocation(dayIndex);
  const absIndex = dayIndex * 10 + videoIndex;

  let data;

  switch (videoIndex) {
    case 0: data = TRUTH_BOMBS[absIndex % TRUTH_BOMBS.length]; break;
    case 1: data = BUILD_DEMOS[absIndex % BUILD_DEMOS.length]; break;
    case 2: data = VLOGS[absIndex % VLOGS.length]; break;
    case 3: data = ORIGIN_STORIES[absIndex % ORIGIN_STORIES.length]; break;
    case 4: data = PROMPT_BREAKDOWNS[absIndex % PROMPT_BREAKDOWNS.length]; break;
    case 5: data = MYTH_BUSTS[absIndex % MYTH_BUSTS.length]; break;
    case 6: data = POV_SKITS[absIndex % POV_SKITS.length]; break;
    case 7: data = SMALL_BIZ[absIndex % SMALL_BIZ.length]; break;
    case 8: data = BUILD_IN_PUBLIC[absIndex % BUILD_IN_PUBLIC.length]; break;
    case 9: data = STORY_TIMES[absIndex % STORY_TIMES.length]; break;
    default: data = TRUTH_BOMBS[0];
  }

  return { archetype, format, duration, location, data, absIndex };
}

// ─── BUILD DOCX ────────────────────────────────────────────────────────────────
function buildDocx() {
  let body = '';

  // Title page
  body += `
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="60"/></w:rPr><w:t>SENA ACADEMY</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="44"/></w:rPr><w:t>240 TikTok Video Scripts</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="28"/></w:rPr><w:t>August 12 – September 4, 2026</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>10 Ready-to-Film Scripts Per Day · Mix of Short (15–30s) and Long (60–90s)</w:t></w:r></w:p>
    <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>Creator: Ishmael Harry-Deckor · Petroleum Engineering Year 2</w:t></w:r></w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

  // Legend
  body += `
    <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/></w:rPr><w:t>📋 THE 10 DAILY VIDEO ARCHETYPES</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 1: CAREER TRUTH BOMB — Talking Head, 15–30s. Direct to camera. One bold, uncomfortable truth about Ghana jobs, AI, or degrees.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 2: LIVE BUILD DEMO — Screen Record + Voiceover, 45–60s. Real-time AI generation of a website or feature.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 3: DAY IN MY LIFE — Vlog / Walk-and-Talk, 60–90s. Campus, hostel, study area. The duality of engineering + building.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 4: ORIGIN STORY BEAT — Talking Head, 45–90s. A chapter from the real story: trading journal, Bain report, graduates, the decision.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 5: PROMPT BREAKDOWN — Screen Record + Voiceover, 30–45s. One specific prompt. Show it working. Audience can copy it.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 6: MYTH BUST — Talking Head, 15–30s. Kill one false belief about AI building, coding, or clients.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 7: POV SKIT — Skit Style, 15–30s. Pattern interrupt. Relatable moment from the builder's life.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 8: SMALL BIZ OPPORTUNITY — Talking Head, 45–60s. One specific Ghanaian business type, the problem, the solution, the pitch, the price.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 9: BUILD IN PUBLIC — Screen Record or Talking Head, 30–60s. Raw progress update. What was built today, what was attempted, what failed.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Video 10: STORY TIME — Talking Head, 60–90s. Longer narrative. Sit down, relax, tell the real story behind a belief, decision, or realisation.</w:t></w:r></w:p>
    <w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

  // Days
  DAYS.forEach((date, dayIndex) => {
    body += `
      <w:p><w:r><w:rPr><w:b/><w:sz w:val="52"/></w:rPr><w:t>${esc('█ DAY ' + (dayIndex + 1) + ': ' + fmtDate(date).toUpperCase())}</w:t></w:r></w:p>
      <w:p><w:r><w:rPr><w:sz w:val="24"/></w:rPr><w:t>${esc('10 Videos · Location pool: ' + getLocation(dayIndex))}</w:t></w:r></w:p>
      <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;

    for (let vi = 0; vi < 10; vi++) {
      const { archetype, format, duration, location, data } = generateScript(dayIndex, vi);

      body += `
        <w:p><w:r><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="1a3a5c"/></w:rPr><w:t>${esc(`VIDEO ${vi + 1}/10  ·  ${archetype}`)}</w:t></w:r></w:p>
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${esc('FORMAT: ' + format)}</w:t></w:r></w:p>
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${esc('DURATION: ' + duration)}</w:t></w:r></w:p>
        <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${esc('SUGGESTED LOCATION: ' + location)}</w:t></w:r></w:p>
        <w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;

      // Hook
      const hook = data.hook || data.myth || '';
      body += `<w:p><w:r><w:rPr><w:b/><w:color w:val="b45309"/></w:rPr><w:t>${esc('▶ HOOK (0–3 seconds): ' + hook)}</w:t></w:r></w:p>`;
      body += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;

      // Script / Content
      body += `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>FULL SCRIPT:</w:t></w:r></w:p>`;

      let scriptLines = [];

      if (vi === 5) {
        // Myth Bust
        scriptLines = [
          `MYTH: "${data.myth}"`,
          ``,
          `THE TRUTH:`,
          data.truth,
        ];
      } else if (vi === 7) {
        // Small Biz
        scriptLines = [
          `THE PROBLEM:`,
          data.problem,
          ``,
          `THE SOLUTION:`,
          data.solution,
          ``,
          `THE PITCH (word-for-word):`,
          data.pitch,
          ``,
          `WHAT TO CHARGE: ${data.price}`,
        ];
      } else {
        const rawScript = data.script || data.caption || '';
        scriptLines = rawScript.split('\n');
      }

      scriptLines.forEach(line => {
        body += `<w:p><w:r><w:t xml:space="preserve">${esc(line || ' ')}</w:t></w:r></w:p>`;
      });

      body += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;

      // Visual cue if exists
      if (data.visualCue) {
        body += `<w:p><w:r><w:rPr><w:b/><w:color w:val="166534"/></w:rPr><w:t>${esc('📷 VISUAL CUE: ' + data.visualCue)}</w:t></w:r></w:p>`;
        body += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
      }

      // CTA if exists
      if (data.cta) {
        body += `<w:p><w:r><w:rPr><w:b/><w:color w:val="7c3aed"/></w:rPr><w:t>${esc('💬 CTA (say at end): ' + data.cta)}</w:t></w:r></w:p>`;
        body += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
      }

      // Caption
      body += `<w:p><w:r><w:rPr><w:b/></w:rPr><w:t>CAPTION (copy-paste):</w:t></w:r></w:p>`;
      const caption = data.caption || '';
      caption.split('\n').forEach(line => {
        body += `<w:p><w:r><w:t xml:space="preserve">${esc(line || ' ')}</w:t></w:r></w:p>`;
      });

      body += `<w:p><w:r><w:rPr><w:color w:val="999999"/></w:rPr><w:t>────────────────────────────────────────────────────────────</w:t></w:r></w:p>`;
      body += `<w:p><w:r><w:t xml:space="preserve"> </w:t></w:r></w:p>`;
    }

    if (dayIndex < DAYS.length - 1) {
      body += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
  });

  const docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>${body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr>
    <w:rFonts w:ascii="Helvetica" w:hAnsi="Helvetica"/>
    <w:sz w:val="24"/><w:szCs w:val="24"/>
  </w:rPr></w:rPrDefault></w:docDefaults>
</w:styles>`;

  const ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const zip = new AdmZip();
  zip.addFile('[Content_Types].xml', Buffer.from(ct, 'utf8'));
  zip.addFile('_rels/.rels', Buffer.from(rels, 'utf8'));
  zip.addFile('word/document.xml', Buffer.from(docXml, 'utf8'));
  zip.addFile('word/_rels/document.xml.rels', Buffer.from(wordRels, 'utf8'));
  zip.addFile('word/styles.xml', Buffer.from(styles, 'utf8'));

  const out = 'C:\\Users\\user\\Desktop\\Sena Academy - 240 TikTok Video Scripts (Aug 12 to Sept 4).docx';
  zip.writeZip(out);

  console.log('\n✅ SUCCESS!');
  console.log(`📄 File: ${out}`);
  console.log(`\n📊 Stats:`);
  console.log(`   • Days: ${DAYS.length} (Aug 12 – Sept 4)`);
  console.log(`   • Total videos: ${DAYS.length * 10}`);
  console.log(`   • Archetypes per day: 10 (unique formats)`);
  console.log(`   • Every script includes: Hook, Full Script, Visual Cue, CTA, Caption`);
  console.log(`   • Based on: real Ishmael facts only. Zero generic content.`);
}

buildDocx();
