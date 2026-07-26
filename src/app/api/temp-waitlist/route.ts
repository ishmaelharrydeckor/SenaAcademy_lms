import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceRole);

  const eventId = "91458b94-24c7-43f7-a734-b90f1b65c78a";
  
  // Fetch waitlist
  const { data: waitlist, error: wlError } = await supabase
    .from('event_waitlist')
    .select('*')
    .eq('event_id', eventId);

  if (wlError) {
    return NextResponse.json({ error: wlError.message }, { status: 500 });
  }

  return NextResponse.json({ waitlist });
}
