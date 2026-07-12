import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

// Initialize Supabase Admin Client to bypass RLS for counts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface StatsCache {
  data: {
    studentsCount: number;
    facilitatorsCount: number;
    projectsCount: number;
    whatsappMemberCount: number;
  };
  expiresAt: number;
}

// In-memory cache for 15 minutes
let statsCache: StatsCache | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 mins

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting check
    const ip = getClientIp(request);
    const limitCheck = await checkRateLimit(ip, 30, 60 * 1000); // 30 requests per minute
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute.' },
        { status: 429 }
      );
    }

    // 2. Cache hit check
    const now = Date.now();
    if (statsCache && now < statsCache.expiresAt) {
      return NextResponse.json(statsCache.data, {
        headers: {
          'X-Cache': 'HIT',
        },
      });
    }

    // 3. Fetch Student count
    const { count: studentCount, error: studentErr } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student');

    if (studentErr) throw studentErr;

    // 4. Fetch Facilitator count
    const { count: facilitatorCount, error: facilitatorErr } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'facilitator');

    if (facilitatorErr) throw facilitatorErr;

    // 5. Fetch Projects count (submissions)
    const { count: projectCount, error: projectErr } = await supabaseAdmin
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (projectErr) throw projectErr;

    // 6. Fetch WhatsApp member count from site_settings (fallback to 238 if table/key not present yet)
    let whatsappCount = 238;
    try {
      const { data: settingsData } = await supabaseAdmin
        .from('site_settings')
        .select('value')
        .eq('key', 'whatsapp_member_count')
        .maybeSingle();

      if (settingsData?.value) {
        whatsappCount = parseInt(settingsData.value, 10) || 238;
      }
    } catch (dbErr) {
      console.warn('site_settings table query warning (likely not created yet):', dbErr);
    }

    const data = {
      studentsCount: studentCount || 0,
      facilitatorsCount: facilitatorCount || 0,
      projectsCount: projectCount || 0,
      whatsappMemberCount: whatsappCount,
    };

    // 7. Update cache
    statsCache = {
      data,
      expiresAt: now + CACHE_TTL,
    };

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
      },
    });

  } catch (err: any) {
    console.error('Error fetching public statistics:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
