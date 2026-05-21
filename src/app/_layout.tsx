import { useEffect, useState } from 'react';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { supabase } from '@/lib/supabase';
import '../../global.css';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/Collectionstore';
import { useLayeringStore } from '@/store/LayeringStore';
import { useTodayStore } from '@/store/TodayStore';
import { useProfile } from '@/hooks/useProfile';
import { useCollection } from '@/hooks/useCollection';
import { useToday } from '@/hooks/useToday';

SplashScreen.preventAutoHideAsync();

// ── Auth gate ─────────────────────────────────────────────────────
function useAuthRedirect() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAll);
  const resetCollection = useCollectionStore((s) => s.reset);
  const resetLayering = useLayeringStore((s) => s.reset);
  const resetToday = useTodayStore((s) => s.reset);
  // profileReady: true once we've fetched a fresh profile from the server for the current session
  const [profileReady, setProfileReady] = useState(false);

  const { fetchProfile } = useProfile();
  const { fetchCollection } = useCollection();
  const { fetchTodayLog, fetchWeather, fetchLumiOpening } = useToday();

  const segments = useSegments();

  // Listen for Supabase auth events
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);

      if (event === 'INITIAL_SESSION') {
        if (newSession) {
          await fetchProfile();
          setProfileReady(true);
        } else {
          // No session — nothing to fetch, safe to redirect to auth
          setProfileReady(true);
        }
      }

      if (event === 'SIGNED_IN' && newSession) {
        setProfileReady(false);
        await fetchProfile();
        setProfileReady(true);
        await fetchCollection();
        await fetchTodayLog();
      }

      if (event === 'SIGNED_OUT') {
        setProfileReady(false);
        clearAuth();
        resetCollection();
        resetToday();
        resetLayering();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth + onboarding state
  useEffect(() => {
    if (!profileReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/splash');
      return;
    }

    if (!profile) return;

    if (!profile.onboarding_completed) {
      if (!inOnboardingGroup) router.replace('/(onboarding)/meet-lumi');
      return;
    }

    if (inAuthGroup || inOnboardingGroup) {
      router.replace('/(tabs)/today');
    }
  }, [profileReady, session, profile, segments]);

  // Bootstrap data once signed in and onboarded
  useEffect(() => {
    if (!session || !profile?.onboarding_completed) return;

    const bootstrap = async () => {
      await fetchCollection();
      await fetchTodayLog();
      if (profile.city) {
        await fetchWeather(profile.city);
        await fetchLumiOpening();
      }
    };

    bootstrap();
  }, [session, profile?.onboarding_completed]);
}

// ── Navigator (needs to be a child so router is available to useAuthRedirect) ──
function Navigator() {
  useAuthRedirect();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="modals/bottle-quick-add"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="modals/signature-share"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="modals/stock-update"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
        <Stack.Screen
          name="modals/premium-gate"
          options={{ presentation: 'transparentModal', animation: 'fade' }}
        />
      </Stack>
      <StatusBar style="auto" />
      <PortalHost />
    </>
  );
}

// ── Root layout ───────────────────────────────────────────────────
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'CormorantGaramond-Light': require('../../assets/fonts/CormorantGaramond-Light.ttf'),
    'CormorantGaramond-LightItalic': require('../../assets/fonts/CormorantGaramond-LightItalic.ttf'),
    'CormorantGaramond-Regular': require('../../assets/fonts/CormorantGaramond-Regular.ttf'),
    'CormorantGaramond-Italic': require('../../assets/fonts/CormorantGaramond-Italic.ttf'),
    'CormorantGaramond-Medium': require('../../assets/fonts/CormorantGaramond-Medium.ttf'),
    'DMSans-Light': require('../../assets/fonts/DMSans-Light.ttf'),
    'DMSans-Regular': require('../../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../../assets/fonts/DMSans-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <Navigator />
    </SafeAreaProvider>
  );
}
