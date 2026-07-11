const { createClient } = require('@supabase/supabase-js');

// Load env variables if running locally, or use default settings
const supabaseUrl = 'https://jrenwqurwdbxkcbirfkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZW53cXVyd2RieGtjYmlyZmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NDcsImV4cCI6MjA5ODgzNzY0N30.Go_0-4qEp0KO1pP6POvU6clivxpgAOucBNOQ1D7DDdM';

// Note: To test admin insertions in this script, we use the client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('==================================================');
  console.log('     Sena Academy Events Verification Suite       ');
  console.log('==================================================\n');

  console.log('[1/5] Verifying if migrations are applied...');
  
  // Check if events table exists
  const { data: eventsList, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .limit(1);

  if (eventsError && eventsError.message.includes('Could not find')) {
    console.error('❌ Error: The "events" table does not exist in the database.');
    console.log('\n👉 ACTION REQUIRED: Please execute the SQL queries in "events_schema.sql" inside your Supabase SQL Editor first, then run this verification script again.');
    process.exit(1);
  } else if (eventsError) {
    console.log('⚠️ Events table check error (RLS restriction is expected if unauthenticated):', eventsError.message);
  } else {
    console.log('✅ Events table is accessible!');
  }

  // Check if registrants table exists
  const { error: regError } = await supabase
    .from('event_registrations')
    .select('id')
    .limit(1);

  if (regError && regError.message.includes('Could not find')) {
    console.error('❌ Error: The "event_registrations" table does not exist in the database.');
    process.exit(1);
  } else {
    console.log('✅ Event Registrations table is accessible!');
  }

  console.log('\n[2/5] Verifying Row-Level Security (RLS) policies...');
  
  // Test direct insert into events by anonymous client (should fail RLS)
  const testEventId = '99999999-9999-9999-9999-999999999999';
  const { error: anonInsertError } = await supabase
    .from('events')
    .insert({
      id: testEventId,
      title: 'Hack Hack Hack',
      slug: 'hack-hack',
      description: 'Hack',
      event_type: 'online',
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 3600000).toISOString(),
      status: 'draft'
    });

  if (anonInsertError) {
    console.log('✅ RLS Success: Direct anonymous insert into "events" was blocked as expected.');
  } else {
    console.warn('⚠️ RLS Warning: Direct anonymous insert into "events" succeeded. Check your RLS policy config!');
    // clean up
    await supabase.from('events').delete().eq('id', testEventId);
  }

  // Test direct insert into registrations by anonymous client (should fail RLS, since insertions go through RPC)
  const { error: anonRegError } = await supabase
    .from('event_registrations')
    .insert({
      event_id: testEventId,
      full_name: 'Hacker',
      email: 'hacker@hack.com'
    });

  if (anonRegError) {
    console.log('✅ RLS Success: Direct anonymous insert into "event_registrations" was blocked as expected.');
  } else {
    console.warn('⚠️ RLS Warning: Direct anonymous insert into "event_registrations" succeeded. Check your RLS policy config!');
  }

  console.log('\n[3/5] Verifying RPC functions and registration flows...');
  
  console.log('👉 Note: To test the register_for_event function, we need a published event.');
  console.log('👉 Querying for an existing published event, or instruct user to use admin tab to create one.');

  const { data: pubEvent } = await supabase
    .from('events')
    .select('id, title, capacity')
    .eq('status', 'published')
    .limit(1)
    .maybeSingle();

  if (!pubEvent) {
    console.log('⚠️ Info: No published event found in the database. Open the Admin portal at http://localhost:3000/admin, log in, create a published event in the "Events" tab, and then re-run this script to test the registration RPC.');
    return;
  }

  console.log(`Found published event: "${pubEvent.title}" (ID: ${pubEvent.id})`);

  // Test successful free registration via RPC
  const testEmail = 'verify_' + Math.random().toString(36).substring(2, 8) + '@sena.org';
  console.log(`Registering test attendee: ${testEmail}...`);
  
  const { data: regResult, error: rpcError } = await supabase.rpc('register_for_event', {
    p_event_id: pubEvent.id,
    p_full_name: 'Verification Bot',
    p_email: testEmail,
    p_payment_status: 'not_required'
  });

  if (rpcError) {
    console.error('❌ RPC Error: Call to register_for_event failed:', rpcError.message);
    return;
  }

  const result = regResult[0];
  if (result.success) {
    console.log(`✅ Success: Registration created! ID: ${result.registration_id}`);
  } else {
    console.error(`❌ RPC Error: Registration failed: ${result.error_message}`);
  }

  console.log('\n[4/5] Verifying attendee count secure RPC...');
  const { data: count, error: countError } = await supabase.rpc('get_event_attendee_count', {
    p_event_id: pubEvent.id
  });

  if (countError) {
    console.error('❌ RPC Error: Call to get_event_attendee_count failed:', countError.message);
  } else {
    console.log(`✅ Success: Current attendee count for event is: ${count}`);
  }

  console.log('\n[5/5] Testing capacity safety constraints...');
  if (pubEvent.capacity !== null) {
    console.log(`Event capacity is configured to: ${pubEvent.capacity}`);
    if (count >= pubEvent.capacity) {
      console.log('Event is already full. Testing registering one more attendee...');
      const { data: failReg } = await supabase.rpc('register_for_event', {
        p_event_id: pubEvent.id,
        p_full_name: 'Verification Bot 2',
        p_email: 'bot2@sena.org'
      });
      const failRes = failReg[0];
      if (!failRes.success && failRes.error_message === 'Event is full') {
        console.log('✅ Success: Capacity block triggered correctly! Error returned: "Event is full"');
      } else {
        console.error('❌ Failure: Registration succeeded or returned wrong error:', failRes);
      }
    } else {
      console.log('Event is not full. Capacity constraints will be enforced once limit is reached.');
    }
  } else {
    console.log('ℹ️ Info: Event has unlimited capacity. Capacity check not applicable.');
  }

  console.log('\n🎉 Verification checks complete!');
}

runTests().catch(console.error);
