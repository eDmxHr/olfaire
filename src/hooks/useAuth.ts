import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { triggerPostSignIn } from '@/app/_layout';

type AuthProvider = 'apple' | 'google';

interface UseAuthReturn {
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  loading: AuthProvider | null;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [loading, setLoading] = useState<AuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setLoading('google');
    try {
      const { data, error: supaError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: 'olfaire://auth/callback',
        },
      });
      if (supaError) throw supaError;
      if (!data.url) throw new Error('No OAuth URL returned.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, 'olfaire://auth/callback');

      if (result.type === 'success') {
        const url = new URL(result.url);
        const hashParams = new URLSearchParams(url.hash.slice(1));
        const accessToken = hashParams.get('access_token') ?? url.searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') ?? url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
          if (session && triggerPostSignIn) await triggerPostSignIn(session);
        } else {
          // PKCE flow: Supabase exchanged the code internally, just confirm the session exists
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          if (!data.session) throw new Error('Sign-in completed but no session was established.');
          if (triggerPostSignIn) await triggerPostSignIn(data.session);
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function signInWithApple() {
    setError(null);
    setLoading('apple');
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) throw new Error('No identity token from Apple.');
      const { data: { session }, error: supaError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (supaError) throw supaError;
      if (session && triggerPostSignIn) await triggerPostSignIn(session);
    } catch (err: any) {
      if (err.code !== 'ERR_REQUEST_CANCELED')
        setError(err.message ?? 'Apple sign-in failed. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  return {
    signInWithGoogle,
    signInWithApple,
    loading,
    error,
  };
}
