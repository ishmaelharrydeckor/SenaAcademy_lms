import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceRole);

  // Fetch recent payments
  const { data: payments, error: payError } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30);

  if (payError) {
    return NextResponse.json({ error: payError.message }, { status: 500 });
  }

  // Check access codes in the system
  const { data: accessCodes, error: codeError } = await supabase
    .from('access_codes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ payments, accessCodes });
}
