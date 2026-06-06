// @ts-nocheck
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

  const userId = user.id;

  // 2. Create service-role client for privileged operations
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // 3. Delete storage files — log errors but don't block
  try {
    // avatars: single file per user
    await serviceClient.storage.from('avatars').remove([`${userId}.jpg`]);
  } catch (err) {
    console.error('delete avatars error:', err);
  }

  for (const bucket of ['user-uploads', 'signature-cards']) {
    try {
      const { data: files } = await serviceClient.storage
        .from(bucket)
        .list(userId);
      if (files?.length) {
        const paths = files.map((f: any) => `${userId}/${f.name}`);
        await serviceClient.storage.from(bucket).remove(paths);
      }
    } catch (err) {
      console.error(`delete ${bucket} error:`, err);
    }
  }

  // 4. Delete all user DB rows via SQL function
  try {
    const { error: rpcError } = await serviceClient.rpc('delete_user_data', {
      p_user_id: userId,
    });
    if (rpcError) console.error('delete_user_data rpc error:', rpcError);
  } catch (err) {
    console.error('delete_user_data error:', err);
  }

  // 5. Delete auth user — must be last (invalidates JWT)
  const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(userId);
  if (deleteAuthError) {
    console.error('deleteUser error:', deleteAuthError);
    return new Response('Failed to delete account', { status: 500 });
  }

  return new Response('OK', { status: 200 });
});
