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

  const expiresAt: string | null = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const { error } = await supabase
    .from('profiles')
    .update({
      is_premium: isPremium,
      premium_expires_at: isPremium ? expiresAt : null,
    })
    .eq('id', userId);

  if (error) {
    console.error('profiles update failed:', error);
    return new Response('Internal error', { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
