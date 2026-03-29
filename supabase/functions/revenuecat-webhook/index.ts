import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Store product id → max family members. Only Duo (2) and Family (5) tiers. */
const TIER_MAX_MEMBERS: Record<string, number> = {
  fiftyfifty_duo: 2,
  fiftyfifty_family: 5,
  fiftyfifty_small_monthly: 2,
  fiftyfifty_small_yearly: 2,
  fiftyfifty_medium_monthly: 5,
  fiftyfifty_medium_yearly: 5,
};
const DEFAULT_MAX_MEMBERS = 2;

const REVENUECAT_WEBHOOK_AUTH = Deno.env.get('REVENUECAT_WEBHOOK_AUTH') ?? '';

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

    const appUserId = event.app_user_id;
    const productId = event.product_id ?? '';
    const type: string = event.type ?? '';

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

    const maxMembers = TIER_MAX_MEMBERS[productId] ?? DEFAULT_MAX_MEMBERS;

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

    const { error: updateError } = await supabase
      .from('families')
      .update({ is_active: isActive, max_members: maxMembers })
      .eq('id', membership.family_id);

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
        family_id: membership.family_id,
        is_active: isActive,
        max_members: maxMembers,
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
