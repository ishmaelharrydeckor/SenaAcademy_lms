const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse env keys
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim().startsWith('#') || !line.includes('=')) return;
    const firstEq = line.indexOf('=');
    const key = line.substring(0, firstEq).trim();
    const value = line.substring(firstEq + 1).replace(/"/g, '').replace(/'/g, '').trim();
    process.env[key] = value;
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleObjections = [
  {
    objection_text: "The tuition fee of 2,850 GHS is too high to pay all at once. Are there flexible installment payment options?",
    category: "price",
    source_context: "Prospect: 'Hello, I really want to join Cohort 2 but I cannot afford to pay 2,850 GHS in a single payment. Do you allow students to pay in installments?'",
    frequency_count: 8,
    resolved: false
  },
  {
    objection_text: "I do not own a high-spec laptop. Will my basic laptop (4GB RAM, dual core) be sufficient for web development coding?",
    category: "laptop",
    source_context: "Prospect: 'My laptop is old. It has 4GB RAM and a basic Intel Celeron processor. Will it be able to run VS Code and git, or do I need to buy a new one before class?'",
    frequency_count: 6,
    resolved: false
  },
  {
    objection_text: "I have absolutely zero programming or science background. Will I get left behind or is this designed for complete beginners?",
    category: "fear",
    source_context: "Prospect: 'I studied Business in school and I have never written a single line of code. Is it possible for me to learn software engineering in this cohort?'",
    frequency_count: 11,
    resolved: false
  },
  {
    objection_text: "I work a full-time job (8 AM to 5 PM). Can I take this cohort in the evenings and are the sessions recorded if I miss them?",
    category: "time",
    source_context: "Prospect: 'I work long hours as an accountant. Is the course flexible? Will you record the Zoom calls so I can catch up on weekends?'",
    frequency_count: 5,
    resolved: false
  },
  {
    objection_text: "Will this training help me get an internship or a software engineering job in Ghana after completing the cohort?",
    category: "other",
    source_context: "Prospect: 'I am taking this course to transition careers. Do you offer job placement assistance, CV reviews, or partnerships with tech companies?'",
    frequency_count: 4,
    resolved: false
  },
  {
    objection_text: "Is there a certificate of completion at the end of the cohort that is recognized by tech companies?",
    category: "other",
    source_context: "Prospect: 'Do we get a certificate after the training? Is it accredited so I can add it to my resume and LinkedIn?'",
    frequency_count: 3,
    resolved: false
  }
];

async function seedObjections() {
  console.log('Seeding student objections into Supabase...');
  try {
    const { data, error } = await supabase
      .from('marketing_objections')
      .insert(sampleObjections)
      .select();

    if (error) {
      console.error('Failed to seed objections:', error.message);
    } else {
      console.log(`Successfully seeded ${data.length} student objections!`);
    }
  } catch (err) {
    console.error('Database query failed:', err.message);
  }
}

seedObjections();
