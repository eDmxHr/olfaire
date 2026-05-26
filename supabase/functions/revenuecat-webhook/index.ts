// deno-lint-ignore-file no-explicit-any
/// <reference path="../../../node_modules/@deno/types/deno.d.ts" />
/// <reference path="../../../node_modules/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PREMIUM_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'NON_RENEWING_PURCHASE',
  'UNCANCELLATION',
]);

const REVOKE_EVENTS = new Set(['CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE', 'SUBSCRIBER_ALIAS']);

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const secret = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  const event = body?.event;
  if (!event) return new Response('Missing event', { status: 400 });

  const userId: string | undefined = event.app_user_id;
  const eventType: string = event.type ?? '';

  if (!userId) return new Response('Missing app_user_id', { status: 400 });

  const isPremium = PREMIUM_EVENTS.has(eventType);
  const isRevoke = REVOKE_EVENTS.has(eventType);

  if (!isPremium && !isRevoke) {
    // Unhandled event type — acknowledge without acting
    return new Response('OK', { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Build the update payload. For premium events we always set is_premium=true.
  // premium_expires_at: use expiration_at_ms if present, otherwise leave the
  // column untouched (don't null it out) so a prior value isn't erased.
  // For revoke events we clear both fields.
  const updatePayload: Record<string, unknown> = { is_premium: isPremium };

  if (isPremium) {
    if (event.expiration_at_ms) {
      updatePayload.premium_expires_at = new Date(event.expiration_at_ms).toISOString();
    }
    // If no expiration_at_ms (e.g. lifetime or sandbox quirk), don't touch premium_expires_at
  } else {
    // Revoking — clear expiry too
    updatePayload.premium_expires_at = null;
  }

  const { error } = await supabase
    .from('profiles')
    .update(updatePayload as any)
    .eq('id', userId);

  if (error) {
    console.error('profiles update failed:', error);
    return new Response('Internal error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
