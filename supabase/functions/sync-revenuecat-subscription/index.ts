import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Store product id → max family members (keep in sync with app + webhook). */
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

/** Must match RevenueCat dashboard entitlement identifier (Product catalog → Entitlements). */
const ENTITLEMENT_ID = 'FiftyFifty Pro';

function isEntitlementActive(expiresDate: string | null | undefined): boolean {
  if (expiresDate == null || expiresDate === '') return true;
  const t = Date.parse(expiresDate);
  if (Number.isNaN(t)) return false;
  return t > Date.now();
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'missing_authorization' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const rcSecret = Deno.env.get('REVENUECAT_SECRET_API_KEY') ?? '';

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey);

  const { data: ownedFamilies, error: famError } = await admin
    .from('families')
    .select('id')
    .eq('owner_id', user.id);

  if (famError) {
    console.error('Families lookup:', famError);
    return new Response(JSON.stringify({ error: 'db_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!ownedFamilies?.length) {
    return new Response(JSON.stringify({ status: 'not_owner' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!rcSecret) {
    return new Response(JSON.stringify({ error: 'revenuecat_not_configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rcUrl = `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`;
  console.log('[sync-revenuecat] V1 GET subscribers', { userId: user.id, entitlementExpected: ENTITLEMENT_ID });

  const rcRes = await fetch(rcUrl, {
    headers: { Authorization: `Bearer ${rcSecret}` },
  });

  let isActive = false;
  let productId: string | null = null;

  if (rcRes.status === 404) {
    console.log('[sync-revenuecat] RevenueCat 404 — no subscriber for this app_user_id');
    isActive = false;
  } else if (!rcRes.ok) {
    const text = await rcRes.text();
    console.error('[sync-revenuecat] RevenueCat API error', {
      status: rcRes.status,
      body: text,
      hint403:
        rcRes.status === 403
          ? 'If body mentions API V1 vs secret key, use a legacy V1 secret from RevenueCat or their V2 API — this function only calls V1.'
          : undefined,
    });
    return new Response(JSON.stringify({ error: 'revenuecat_error', status: rcRes.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    const body = (await rcRes.json()) as {
      subscriber?: {
        entitlements?: Record<
          string,
          { expires_date?: string | null; product_identifier?: string }
        >;
      };
    };
    const entKeys = body.subscriber?.entitlements
      ? Object.keys(body.subscriber.entitlements)
      : [];
    console.log('[sync-revenuecat] V1 subscriber entitlements keys', entKeys);

    const ent = body.subscriber?.entitlements?.[ENTITLEMENT_ID];
    if (ent) {
      const active = isEntitlementActive(ent.expires_date ?? null);
      console.log('[sync-revenuecat] Matched entitlement', {
        identifier: ENTITLEMENT_ID,
        expires_date: ent.expires_date ?? null,
        product_identifier: ent.product_identifier ?? null,
        treatedAsActive: active,
      });
      if (active) {
        isActive = true;
        productId = ent.product_identifier ?? null;
      }
    } else {
      console.warn(
        '[sync-revenuecat] No entitlement matching ENTITLEMENT_ID — check dashboard identifier matches exactly (case and spaces).',
        { expected: ENTITLEMENT_ID, receivedKeys: entKeys },
      );
    }
  }

  console.log('[sync-revenuecat] Resolved', { isActive, productId, families: ownedFamilies.length });

  const tierMax = productId ? (TIER_MAX_MEMBERS[productId] ?? DEFAULT_MAX_MEMBERS) : DEFAULT_MAX_MEMBERS;

  for (const row of ownedFamilies) {
    if (isActive) {
      const { count, error: cErr } = await admin
        .from('family_members')
        .select('*', { count: 'exact', head: true })
        .eq('family_id', row.id);

      if (cErr) {
        console.error('Member count:', cErr);
        continue;
      }

      const maxMembers = Math.max(tierMax, count ?? 0);
      const { error: uErr } = await admin
        .from('families')
        .update({ is_active: true, max_members: maxMembers })
        .eq('id', row.id);

      if (uErr) console.error('Family update:', uErr);
    } else {
      const { error: uErr } = await admin
        .from('families')
        .update({ is_active: false })
        .eq('id', row.id);

      if (uErr) console.error('Family update:', uErr);
    }
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      is_active: isActive,
      product_id: productId,
      families_updated: ownedFamilies.length,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
