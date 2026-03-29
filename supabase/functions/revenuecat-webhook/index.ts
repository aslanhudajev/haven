import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Store product id → max family members. Only Duo (2) and Family (5) tiers. */
const TIER_MAX_MEMBERS: Record<string, number> = {
  fiftyfifty_duo: 2,
  fiftyfifty_family: 5,
  fiftyfifty_small_monthly: 2,
  fiftyfifty_small_yearly: 2,
  fiftyfifty_medium_monthly: 5,
  fiftyfifty_medium_yearly: 5,
  duo_monthly: 2,
  duo_yearly: 2,
  family_monthly: 5,
  family_yearly: 5,
};
const DEFAULT_MAX_MEMBERS = 2;

const REVENUECAT_WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? '';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('authorization');
  if (REVENUECAT_WEBHOOK_AUTH && authHeader !== `Bearer ${REVENUECAT_WEBHOOK_AUTH}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(JSON.stringify({ error: 'No event in body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const appUserId = String(event.app_user_id ?? '');
    const productId = event.product_id ?? '';
    const type: string = event.type ?? '';

    if (!isUuid(appUserId)) {
      return new Response(JSON.stringify({ status: 'ignored_non_uuid', app_user_id: appUserId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const activatingEvents = [
      'INITIAL_PURCHASE',
      'RENEWAL',
      'PRODUCT_CHANGE',
      'UNCANCELLATION',
    ];
    const deactivatingEvents = [
      'EXPIRATION',
      'BILLING_ISSUE',
      'SUBSCRIPTION_PAUSED',
    ];

    let isActive: boolean | undefined;
    if (activatingEvents.includes(type)) {
      isActive = true;
    } else if (deactivatingEvents.includes(type)) {
      isActive = false;
    }

    if (isActive === undefined) {
      return new Response(JSON.stringify({ status: 'ignored', type }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const tierMax = TIER_MAX_MEMBERS[productId] ?? DEFAULT_MAX_MEMBERS;

    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', appUserId)
      .eq('role', 'owner')
      .single();

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ status: 'no_family', user_id: appUserId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const familyId = membership.family_id;

    if (isActive) {
      const { count, error: countError } = await supabase
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', familyId);

      if (countError) {
        console.error('Member count error:', countError);
        return new Response(
          JSON.stringify({ error: 'count_failed', details: countError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
      }

      const maxMembers = Math.max(tierMax, count ?? 0);

      const { error: updateError } = await supabase
        .from('families')
        .update({ is_active: true, max_members: maxMembers })
        .eq('id', familyId);

      if (updateError) {
        console.error('Family update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'update_failed', details: updateError.message }),
          { status: 500, headers: { 'Content-Type': 'application/json' } },
        );
      }

      return new Response(
        JSON.stringify({
          status: 'ok',
          family_id: familyId,
          is_active: true,
          max_members: maxMembers,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const { error: deactivateError } = await supabase
      .from('families')
      .update({ is_active: false })
      .eq('id', familyId);

    if (deactivateError) {
      console.error('Family deactivate error:', deactivateError);
      return new Response(
        JSON.stringify({ error: 'update_failed', details: deactivateError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        family_id: familyId,
        is_active: false,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Webhook handler error:', err);
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
