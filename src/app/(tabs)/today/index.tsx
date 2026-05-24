import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
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
import { COLORS, FONTS } from '@/lib/theme';
import type { Mood } from '@/lib/supabase';

export default function TodayScreen() {
  const store = useTodayStore();
  const { selectMood, fetchSuggestion, submitRating } = useToday();
  const { fetchSignatures } = useLayering();
  const signatures = useLayeringStore((s) => s.signatures);
  const [hasError, setHasError] = useState(false);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
    fetchSignatures();
  }, []);

  useEffect(() => {
    if (store.hasMoodToday() && !store.suggestion && !store.isLoadingSuggestion) {
      fetchSuggestion();
    }
  }, [store.todayLog]);

  async function handleMoodSelect(mood: Mood) {
    setHasError(false);
    try {
      await selectMood(mood);
    } catch {
      setHasError(true);
    }
  }

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
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 22,
                  color: COLORS.ink,
                  lineHeight: 30,
                }}>
                {store.lumiOpening}
              </Text>
            ) : (
              <View className="gap-2.5">
                <ShimmerLine width="80%" />
                <ShimmerLine width="55%" />
              </View>
            )}
          </View>

          {/* Mood section label */}
          <Text
            className="mb-3.5 mt-4 text-xs uppercase tracking-widest"
            style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash, letterSpacing: 0.8 }}>
            How are you feeling?
          </Text>

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
              <Text
                className="mb-2 uppercase tracking-widest"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 1,
                }}>
                Recent layers
              </Text>
              {signatures.slice(0, 3).map((sig) => {
                const date = new Date(sig.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <Pressable
                    key={sig.id}
                    onPress={() => router.push('/(tabs)/profile')}
                    className="mb-2 rounded-[10px] px-3.5 py-3"
                    style={{ backgroundColor: COLORS.linen }}>
                    <View className="flex-row items-start justify-between">
                      <Text
                        className="flex-1"
                        style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.ink }}>
                        {sig.name}
                      </Text>
                      <Text
                        className="ml-2"
                        style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                        {date}
                      </Text>
                    </View>
                    {sig.tags.length > 0 && (
                      <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                        {sig.tags.map((tag) => (
                          <View
                            key={tag}
                            className="rounded-full px-2 py-0.5"
                            style={{ backgroundColor: COLORS.parchment }}>
                            <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Error state */}
          {hasError && !store.isLoadingSuggestion && (
            <Text
              className="mt-4 text-center"
              style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.red }}>
              Lumi couldn't find a match. Try a different mood.
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
