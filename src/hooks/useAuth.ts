import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

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
        const hash = new URL(result.url).hash.slice(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
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
      const { error: supaError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (supaError) throw supaError;
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
