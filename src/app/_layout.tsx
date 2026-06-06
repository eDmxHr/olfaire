import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ToastOverlay } from '@/components/ui/toast';
import type { Session } from '@supabase/supabase-js';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { supabase } from '@/lib/supabase';
import { syncPremiumStatus } from '@/lib/revenueCat';
import '../../global.css';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/Collectionstore';
import { useLayeringStore } from '@/store/LayeringStore';
import { useTodayStore } from '@/store/TodayStore';
import { useProfile } from '@/hooks/useProfile';
import { useCollection } from '@/hooks/useCollection';
import { useToday } from '@/hooks/useToday';
import { fetchAppConfig } from '@/hooks/useAppConfig';

SplashScreen.preventAutoHideAsync();

// Module-level ref so useAuth.ts can trigger post-sign-in fetching after
// supabase.auth.setSession() fully resolves (avoids deadlock in onAuthStateChange).
export let triggerPostSignIn: ((session: Session) => Promise<void>) | null = null;

// ── Auth gate ─────────────────────────────────────────────────────
function useAuthRedirect() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const setSession = useAuthStore((s) => s.setSession);
  const clearAuth = useAuthStore((s) => s.clearAll);
  const resetCollection = useCollectionStore((s) => s.reset);
  const resetLayering = useLayeringStore((s) => s.reset);
  const resetToday = useTodayStore((s) => s.reset);

  const { fetchProfile } = useProfile();
  const { fetchCollection } = useCollection();
  const { fetchTodayLog, fetchWeather, fetchLumiOpening } = useToday();

  const segments = useSegments();

  // isReady flips true once INITIAL_SESSION fires — prevents routing before Supabase rehydrates
  const [isReady, setIsReady] = useState(false);

  // Post-sign-in data fetching — called from useAuth after setSession/signInWithIdToken resolves
  const onSignedIn = useRef(async (newSession: Session) => {
    setSession(newSession);
    await fetchProfile();
    await fetchCollection();
    await fetchTodayLog();
    await Purchases.logIn(newSession.user.id);
    await syncPremiumStatus();
  });

  // Keep the ref current so it always closes over latest hooks
  useEffect(() => {
    onSignedIn.current = async (newSession: Session) => {
      setSession(newSession);
      await fetchProfile();
      await fetchCollection();
      await fetchTodayLog();
      await Purchases.logIn(newSession.user.id);
      await syncPremiumStatus();
    };
  });

  // Wire module-level ref so useAuth.ts can call it
  useEffect(() => {
    triggerPostSignIn = (s) => onSignedIn.current(s);
    return () => { triggerPostSignIn = null; };
  }, []);

  // Auth state listener — only updates store state, no data fetching (avoids deadlock)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'INITIAL_SESSION') {
        setSession(newSession);
        try {
          if (newSession) {
            const found = await fetchProfile();
            if (!found) {
              await supabase.auth.signOut();
              return;
            }
            await Purchases.logIn(newSession.user.id);
            await syncPremiumStatus();
            void fetchAppConfig();
          }
        } finally {
          setIsReady(true);
        }
        return;
      }

      // SIGNED_IN fired by manual setSession — do NOT call any supabase.* methods here
      // (deadlock). Data fetching is done by triggerPostSignIn in useAuth.ts instead.
      if (event === 'SIGNED_IN') {
        setSession(newSession);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        return;
      }

      if (event === 'SIGNED_OUT') {
        clearAuth();
        resetCollection();
        resetToday();
        resetLayering();
        try {
          await Purchases.logOut();
        } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inModalsGroup = segments[0] === 'modals';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/splash');
      return;
    }

    if (!profile) return;

    if (!profile.onboarding_completed) {
      if (!inOnboardingGroup) router.replace('/(onboarding)/meet-lumi');
      return;
    }

    if (!inTabsGroup && !inModalsGroup) {
      router.replace('/(tabs)/today');
    }
  }, [isReady, session, profile, segments]);

  useEffect(() => {
    if (!session || !profile?.onboarding_completed) return;

    fetchCollection();
    fetchTodayLog();
    (async () => {
      if (profile.city) await fetchWeather(profile.city);
      await fetchLumiOpening();
    })();
  }, [session, profile?.onboarding_completed, profile?.city]);
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
      <ToastOverlay />
      <StatusBar style="auto" />
      <PortalHost />
    </>
  );
}

// ── Root layout ───────────────────────────────────────────────────
export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({
      apiKey: Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!,
        default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!,
      })!,
    });
  }, []);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Navigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
