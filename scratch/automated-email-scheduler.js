const fs = require('fs');
const path = require('path');
const { runCampaign } = require('./run-email-sequence');
const { runNewLeadsDrip } = require('./run-new-leads-drip');

const sequencePath = path.join(__dirname, '..', 'src', 'lib', 'email-campaigns', 'unpaid-nurture-sequence.json');

function loadSequence() {
  return JSON.parse(fs.readFileSync(sequencePath, 'utf8'));
}

function saveSequence(data) {
  fs.writeFileSync(sequencePath, JSON.stringify(data, null, 2));
}

async function checkAndExecuteSchedule() {
  const sequence = loadSequence();
  const now = new Date();

  console.log(`[${now.toISOString()}] 🕒 Checking Email Nurture Campaign Schedule...`);

  for (const email of sequence.emails) {
    if (email.status === 'scheduled') {
      const scheduledTime = new Date(email.scheduledDate);

      if (now >= scheduledTime) {
        console.log(`\n🚨 SCHEDULE TRIGGERED: [${email.id.toUpperCase()}] - "${email.title}"`);
        console.log(`Scheduled for: ${email.displayDate}`);
        console.log(`Current Time: ${now.toISOString()}\n`);

        try {
          await runCampaign(email.id);
          email.status = 'sent';
          email.sentAt = new Date().toISOString();
          saveSequence(sequence);
          console.log(`✅ Marked ${email.id} as SENT in campaign registry.`);
        } catch (err) {
          console.error(`❌ Error executing scheduled campaign ${email.id}:`, err);
        }
      } else {
        const remainingMinutes = Math.round((scheduledTime - now) / 60000);
        console.log(`⏳ [${email.id}] scheduled for ${email.displayDate} (in ~${remainingMinutes} minutes)`);
      }
    }
  }

  // Also run relative day drip check for new leads (Day 3 / Day 6)
  try {
    await runNewLeadsDrip();
  } catch (dripErr) {
    console.error('Drip error:', dripErr);
  }
}

async function startSchedulerDaemon() {
  console.log(`\n========================================`);
  console.log(`🤖 AUTONOMOUS EMAIL CAMPAIGN SCHEDULER STARTED`);
  console.log(`========================================\n`);

  await checkAndExecuteSchedule();

  // Run check every 15 minutes
  setInterval(async () => {
    try {
      await checkAndExecuteSchedule();
    } catch (err) {
      console.error('Scheduler interval error:', err);
    }
  }, 15 * 60 * 1000);
}

startSchedulerDaemon();
