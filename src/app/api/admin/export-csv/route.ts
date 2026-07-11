import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // 2. Gate to Admin role only
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // 3. Parse table parameter
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('table');
    const allowedTables = ['profiles', 'submissions', 'modules', 'access_codes', 'payments', 'events', 'event_registrations'];

    if (!tableName || !allowedTables.includes(tableName)) {
      return NextResponse.json({ error: 'Bad Request: Invalid or missing table parameter' }, { status: 400 });
    }

    // 4. Fetch table data from Supabase
    let query = supabaseAdmin.from(tableName).select('*');
    
    // Apply event_id filter for event_registrations if provided
    const eventId = searchParams.get('event_id');
    if (tableName === 'event_registrations' && eventId) {
      query = query.eq('event_id', eventId);
    }
    
    // Sort logically by creation date
    if (tableName === 'modules') {
      query = query.order('module_number', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: rows, error: fetchError } = await query;
    if (fetchError) {
      console.error(`Failed to fetch table ${tableName}:`, fetchError.message);
      return NextResponse.json({ error: `Database fetch failed: ${fetchError.message}` }, { status: 550 });
    }

    if (!rows || rows.length === 0) {
      return new NextResponse('', {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${tableName}_export_empty.csv`,
        },
      });
    }

    // 5. Convert to CSV format (RFC 4180 compliant escaping)
    const headers = Object.keys(rows[0]);
    const csvRows = [headers.join(',')];

    for (const row of rows) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) {
          return '""';
        }
        if (typeof val === 'object') {
          // Keep objects/arrays serialized
          const stringified = JSON.stringify(val).replace(/"/g, '""');
          return `"${stringified}"`;
        }
        // Escape quotes and wrap strings in quotes
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = csvRows.join('\r\n');

    // 6. Return standard CSV attachment response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${tableName}_export_${Date.now()}.csv`,
      },
    });

  } catch (err: any) {
    console.error('Error in export-csv API:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
