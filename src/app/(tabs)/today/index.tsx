import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Lumi } from '@/components/lumi';
import { LumiThinking } from '@/components/lumi-thinking';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { IconArrowRight } from '@tabler/icons-react-native';
import { ShimmerLine } from '@/components/today/shimmer-line';
import { MoodGrid } from '@/components/today/mood-grid';
import { SuggestionCard } from '@/components/today/suggestion-card';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { useCollectionStore } from '@/store/Collectionstore';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { SectionLabel } from '@/components/ui/section-label';
import { SignatureCard } from '@/components/ui/signature-card';
import { COLORS, FONTS, TYPE } from '@/lib/theme';
import type { Mood } from '@/lib/supabase';

export default function TodayScreen() {
  const store = useTodayStore();
  const { selectMood, submitRating } = useToday();
  const { fetchSignatures } = useLayering();
  const signatures = useLayeringStore((s) => s.signatures);
  const collectionEmpty = useCollectionStore((s) => s.items.length === 0);
  const [hasError, setHasError] = useState(false);
  const { animStyle, trigger } = useScreenAnimation(16);

  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    trigger();
    fetchSignatures();
  }, []);

  const handleMoodSelect = useCallback(
    async (mood: Mood) => {
      setHasError(false);
      try {
        await selectMood(mood);
      } catch {
        setHasError(true);
      }
    },
    [selectMood]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={animStyle}>
          {/* Header — Lumi + weekday + weather */}
          <View className="mt-5 flex-row items-center justify-between">
            <Lumi size={32} />
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.ash }}>
              {store.weather
                ? `${store.weather.temp_c}° ${store.weather.condition} · ${weekday}`
                : weekday}
            </Text>
          </View>

          {/* Lumi greeting */}
          <View className="mt-6 min-h-[60px]">
            {store.lumiOpening ? (
              <Text style={[TYPE.displayM, { color: COLORS.ink }]}>{store.lumiOpening}</Text>
            ) : (
              <View className="gap-2.5">
                <ShimmerLine width="80%" />
                <ShimmerLine width="55%" />
              </View>
            )}
          </View>

          {/* Mood section label */}
          <SectionLabel className="mb-3.5 mt-4">How are you feeling?</SectionLabel>

          {/* Mood grid */}
          <MoodGrid
            onSelect={handleMoodSelect}
            disabled={store.isLoadingSuggestion}
            selected={store.todayLog?.mood ?? null}
          />

          {/* Loading state */}
          {store.isLoadingSuggestion && (
            <View className="mt-10">
              <LumiThinking />
            </View>
          )}

          {/* Suggestion card — tap to open full detail */}
          {store.suggestion && !store.isLoadingSuggestion && (
            <Pressable onPress={() => router.push('/(tabs)/today/pick')}>
              <SuggestionCard
                suggestion={store.suggestion}
                isWearing={store.isWearing()}
                hasRated={store.hasRated()}
                wearRating={store.todayLog?.wear_rating ?? null}
                onConfirmWearing={() => router.push('/(tabs)/today/pick')}
                onRating={submitRating}
                onRequestAnother={() => router.push('/(tabs)/today/pick')}
                previewOnly
              />
            </Pressable>
          )}

          {/* This week link */}
          {store.todayLog && (
            <Button
              variant="outline"
              className="mt-5"
              onPress={() => router.push('/(tabs)/today/week')}>
              <Text style={{ fontFamily: FONTS.ui }}>This week</Text>
              <IconArrowRight size={16} color={COLORS.ink} strokeWidth={1.5} />
            </Button>
          )}

          {/* Recent layers */}
          {signatures.length > 0 && (
            <View className="mt-6">
              <SectionLabel className="mb-2">Recent layers</SectionLabel>
              {signatures.slice(0, 3).map((sig) => (
                <SignatureCard
                  key={sig.id}
                  signature={sig}
                  onPress={() => router.navigate('/(tabs)/profile/signatures')}
                />
              ))}
            </View>
          )}

          {/* Error state */}
          {hasError && !store.isLoadingSuggestion && (
            <Text
              className="mt-4 text-center"
              style={{
                fontFamily: FONTS.ui,
                fontSize: 13,
                color: collectionEmpty ? COLORS.ash : COLORS.red,
              }}>
              {collectionEmpty
                ? 'Add some bottles to your collection so Lumi can suggest one.'
                : "Lumi couldn't find a match. Try a different mood."}
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
