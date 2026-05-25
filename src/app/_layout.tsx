import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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

  const { fetchProfile } = useProfile();
  const { fetchCollection } = useCollection();
  const { fetchTodayLog, fetchWeather, fetchLumiOpening } = useToday();

  const segments = useSegments();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    return () => unsub();
  }, []);

  // Auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'INITIAL_SESSION') return; // handled by hydration

      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession) {
        await fetchProfile();
        await fetchCollection();
        await fetchTodayLog();
      }

      if (event === 'SIGNED_OUT') {
        clearAuth();
        resetCollection();
        resetToday();
        resetLayering();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && useAuthStore.getState().session) {
        clearAuth();
        resetCollection();
        resetToday();
        resetLayering();
      } else if (session) {
        setSession(session);
        fetchProfile();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

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
  }, [hydrated, session, profile, segments]);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Navigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
