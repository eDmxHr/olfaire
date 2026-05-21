import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import Svg, { Path, Circle } from 'react-native-svg';
import { Lumi } from '@/components/Lumi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { supabase } from '@/lib/supabase';
import { FONTS } from '@/lib/theme';

WebBrowser.maybeCompleteAuthSession();

// Google client IDs — set via env vars or replace inline
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <Path fill="none" d="M0 0h48v48H0z" />
    </Svg>
  );
}

export default function SignInScreen() {
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [_request, googleResponse, promptGoogleAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.params.id_token;
      if (idToken) {
        handleGoogleToken(idToken);
      } else {
        setError('Google sign-in failed. Please try again.');
        setLoading(null);
      }
    } else if (googleResponse?.type === 'error') {
      setError('Google sign-in failed. Please try again.');
      setLoading(null);
    } else if (googleResponse?.type === 'dismiss') {
      setLoading(null);
    }
  }, [googleResponse]);

  async function handleGoogleToken(idToken: string) {
    try {
      const { error: supaError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (supaError) throw supaError;
      // Routing handled by _layout.tsx onAuthStateChange
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(null);
    }
  }

  async function handleAppleSignIn() {
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
      // Routing handled by _layout.tsx onAuthStateChange
    } catch (err: any) {
      if (err.code !== 'ERR_REQUEST_CANCELED') {
        setError(err.message ?? 'Apple sign-in failed. Please try again.');
      }
      setLoading(null);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading('google');
    await promptGoogleAsync();
    // response handled in useEffect above
  }

  const isLoading = loading !== null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Back button */}
      <Pressable onPress={() => router.back()} className="px-6 py-4" hitSlop={12}>
        <Text style={{ fontFamily: FONTS.ui, fontSize: 22 }} className="text-foreground">
          ‹
        </Text>
      </Pressable>

      <View className="flex-1 justify-center gap-10 px-8">
        {/* Header */}
        <View className="gap-2">
          <Text
            style={{ fontFamily: FONTS.displayLight, fontSize: 38, letterSpacing: 1 }}
            className="text-foreground">
            Welcome back
          </Text>
          <Text style={{ fontFamily: FONTS.ui, fontSize: 14 }} className="text-muted-foreground">
            Sign in to continue
          </Text>
        </View>

        {/* Auth buttons */}
        <View className="gap-4">
          {/* Apple Sign In — iOS only */}
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={10}
              style={{ height: 48 }}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Divider */}
          {Platform.OS === 'ios' && (
            <View className="flex-row items-center gap-3">
              <View className="h-px flex-1 bg-border" />
              <Text
                style={{ fontFamily: FONTS.ui, fontSize: 12 }}
                className="text-muted-foreground">
                or
              </Text>
              <View className="h-px flex-1 bg-border" />
            </View>
          )}

          {/* Google Sign In */}
          <Button
            variant="outline"
            size="lg"
            className="w-full flex-row gap-3"
            onPress={handleGoogleSignIn}
            disabled={isLoading}>
            {loading === 'google' ? <ActivityIndicator size="small" /> : <GoogleIcon />}
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15 }} className="text-foreground">
              Continue with Google
            </Text>
          </Button>

          {/* Error */}
          {error && (
            <Text
              style={{ fontFamily: FONTS.ui, fontSize: 13 }}
              className="text-center text-destructive">
              {error}
            </Text>
          )}
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-center gap-2">
          <Lumi size={16} />
          <Text style={{ fontFamily: FONTS.ui, fontSize: 11 }} className="text-muted-foreground">
            secured by Supabase
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
