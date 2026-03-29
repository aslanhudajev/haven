import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';
const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN') ?? '';

type PeriodRow = {
  id: string;
  family_id: string;
  name: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

function todayUtcDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('authorization');
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!EXPO_ACCESS_TOKEN) {
    return new Response(JSON.stringify({ error: 'EXPO_ACCESS_TOKEN not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const today = todayUtcDateString();

  const { data: periods, error: periodsError } = await supabase
    .from('periods')
    .select('id, family_id, name, starts_at, ends_at, status')
    .eq('status', 'archived')
    .is('period_end_push_sent_at', null)
    .lt('ends_at', today);

  if (periodsError) {
    console.error('periods query:', periodsError);
    return new Response(JSON.stringify({ error: periodsError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const list = (periods ?? []) as PeriodRow[];
  const results: { period_id: string; sent: number; skipped: string }[] = [];

  for (const period of list) {
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select('user_id')
      .eq('family_id', period.family_id);

    if (membersError || !members?.length) {
      results.push({
        period_id: period.id,
        sent: 0,
        skipped: membersError?.message ?? 'no_members',
      });
      continue;
    }

    const userIds = [...new Set(members.map((m) => m.user_id as string))];

    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('user_id, expo_push_token')
      .in('user_id', userIds);

    if (tokensError) {
      results.push({ period_id: period.id, sent: 0, skipped: tokensError.message });
      continue;
    }

    const tokenRows = tokens ?? [];
    if (tokenRows.length === 0) {
      results.push({ period_id: period.id, sent: 0, skipped: 'no_push_tokens' });
      continue;
    }

    const messages = tokenRows.map((row) => ({
      to: row.expo_push_token as string,
      title: 'Period report ready',
      body: `${period.name} has ended. Open the app to see balances and settlements.`,
      data: {
        periodId: period.id,
        periodName: period.name,
        startsAt: String(period.starts_at),
        endsAt: String(period.ends_at),
        status: period.status,
      },
    }));

    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(messages.length === 1 ? messages[0] : { messages }),
    });

    const expoJson = (await expoRes.json()) as {
      data?: { status?: string; message?: string } | Array<{ status?: string; message?: string }>;
      errors?: unknown;
    };

    let okCount = 0;
    if (Array.isArray(expoJson.data)) {
      okCount = expoJson.data.filter((d) => d.status === 'ok').length;
    } else if (expoJson.data && typeof expoJson.data === 'object' && expoJson.data.status === 'ok') {
      okCount = 1;
    }

    if (okCount > 0) {
      const { error: updateError } = await supabase
        .from('periods')
        .update({ period_end_push_sent_at: new Date().toISOString() })
        .eq('id', period.id);

      if (updateError) {
        console.error('mark sent:', updateError);
        results.push({ period_id: period.id, sent: okCount, skipped: updateError.message });
        continue;
      }
    }

    results.push({
      period_id: period.id,
      sent: okCount,
      skipped: okCount > 0 ? 'ok' : 'expo_no_ok_tickets',
    });
  }

  return new Response(JSON.stringify({ today, processed: list.length, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
