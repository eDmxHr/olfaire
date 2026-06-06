// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const RATE_LIMITED_TYPES = new Set(['suggestion', 'layering']);

const LIMIT_KEY: Record<string, string> = {
  suggestion: 'free_mood_per_day',
  layering: 'free_layering_per_day',
};

function isPremiumActive(isP: boolean, expiresAt: string | null): boolean {
  if (!isP) return false;
  if (!expiresAt) return true;
  return new Date(expiresAt) > new Date();
}

Deno.serve(async (req: Request) => {
  // 1. Validate caller has a live Supabase session
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!jwt) return new Response('Unauthorized', { status: 401 });

  const anonClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  );
  const { data: { user }, error: authError } = await anonClient.auth.getUser();
  if (authError || !user) return new Response('Unauthorized', { status: 401 });

  // 2. Parse request body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const callType: string = body.call_type ?? '';
  if (!callType) {
    return new Response(JSON.stringify({ error: 'missing_call_type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Rate limiting for free users (only for rate-limited call types)
  if (RATE_LIMITED_TYPES.has(callType)) {
    // Use service role to read profiles and api_usage (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check premium status
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('is_premium, premium_expires_at')
      .eq('id', user.id)
      .single();

    const premium = isPremiumActive(
      profile?.is_premium ?? false,
      profile?.premium_expires_at ?? null
    );

    if (!premium) {
      const limitKey = LIMIT_KEY[callType];

      // Fetch limit from app_config
      const { data: configRow } = await serviceClient
        .from('app_config')
        .select('value')
        .eq('key', limitKey)
        .single();

      const limit = configRow ? parseInt(configRow.value, 10) : 1;

      // Fetch today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usageRow } = await serviceClient
        .from('api_usage')
        .select('call_count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .eq('call_type', callType)
        .maybeSingle();

      const currentCount = usageRow?.call_count ?? 0;

      if (currentCount >= limit) {
        return new Response(
          JSON.stringify({ error: 'limit_reached', call_type: callType }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // 4. Forward to Anthropic (strip call_type before sending)
  const { call_type: _removed, ...anthropicBody } = body;
  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(anthropicBody),
  });

  const data = await res.json();

  // 5. On success, increment usage count for rate-limited types
  if (res.ok && RATE_LIMITED_TYPES.has(callType)) {
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const today = new Date().toISOString().split('T')[0];
    await serviceClient.rpc('increment_api_usage', {
      p_user_id: user.id,
      p_usage_date: today,
      p_call_type: callType,
    });
  }

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
});
