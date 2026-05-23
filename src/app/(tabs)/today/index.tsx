import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
} from 'react-native-reanimated';
import { Lumi } from '@/components/lumi';
import { SpinningLoader } from '@/components/spinning-loader';
import { Text } from '@/components/ui/text';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { COLORS, FONTS } from '@/lib/theme';
import type { Mood } from '@/lib/supabase';

// ── Mood config ────────────────────────────────────────────────────
const MOODS: { key: Mood; label: string; emoji: string; tint: string }[] = [
  { key: 'soft', label: 'Soft', emoji: '🌸', tint: '#F5EDE8' },
  { key: 'bold', label: 'Bold', emoji: '🔥', tint: '#F0E8DC' },
  { key: 'cosy', label: 'Cosy', emoji: '☁️', tint: '#EAE8E0' },
  { key: 'sharp', label: 'Sharp', emoji: '⚡', tint: '#E8EAEC' },
  { key: 'mysterious', label: 'Mysterious', emoji: '🌙', tint: '#E5E0EA' },
];

// ── Shimmer ────────────────────────────────────────────────────────
function ShimmerLine({ width }: { width: `${number}%` | number }) {
  const opacity = useSharedValue(0.5);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.2, { duration: 900 }), -1, true);
  }, []);

  return (
    <Animated.View
      style={[
        animStyle,
        {
          height: 26,
          width,
          borderRadius: 6,
          backgroundColor: COLORS.linen,
        },
      ]}
    />
  );
}

// ── Main screen ────────────────────────────────────────────────────
export default function TodayScreen() {
  const store = useTodayStore();
  const { selectMood, fetchSuggestion } = useToday();
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
  }, []);

  // Rehydrate suggestion if mood was set but suggestion lost (e.g. app reopen)
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
        <Animated.View style={[animStyle, { gap: 0 }]}>
          {/* Header — Lumi + weekday */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 20,
            }}>
            <Lumi size={32} />
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.ash }}>
              {weekday}
            </Text>
          </View>

          {/* Lumi greeting */}
          <View style={{ marginTop: 24, minHeight: 60 }}>
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
              <View style={{ gap: 10 }}>
                <ShimmerLine width="80%" />
                <ShimmerLine width="55%" />
              </View>
            )}
          </View>

          {/* Mood section label */}
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 11,
              color: COLORS.ash,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              marginTop: 36,
              marginBottom: 14,
            }}>
            How are you feeling?
          </Text>

          {/* Mood grid — 2 + 3 layout */}
          <MoodGrid
            onSelect={handleMoodSelect}
            disabled={store.isLoadingSuggestion}
            selected={store.todayLog?.mood ?? null}
          />

          {/* Loading state */}
          {store.isLoadingSuggestion && (
            <View style={{ alignItems: 'center', marginTop: 28, gap: 10 }}>
              <SpinningLoader size={20} color={COLORS.amber} />
              <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                Lumi is thinking...
              </Text>
            </View>
          )}

          {/* Error state */}
          {hasError && !store.isLoadingSuggestion && (
            <Text
              style={{
                fontFamily: FONTS.ui,
                fontSize: 13,
                color: COLORS.red,
                marginTop: 16,
                textAlign: 'center',
              }}>
              Lumi couldn't find a match. Try a different mood.
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── MoodGrid ───────────────────────────────────────────────────────
function MoodGrid({
  onSelect,
  disabled,
  selected,
}: {
  onSelect: (mood: Mood) => void;
  disabled: boolean;
  selected: Mood | null;
}) {
  const row1 = MOODS.slice(0, 2);
  const row2 = MOODS.slice(2);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {row1.map((m) => (
          <MoodCard
            key={m.key}
            mood={m}
            onSelect={onSelect}
            disabled={disabled}
            selected={selected === m.key}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {row2.map((m) => (
          <MoodCard
            key={m.key}
            mood={m}
            onSelect={onSelect}
            disabled={disabled}
            selected={selected === m.key}
          />
        ))}
      </View>
    </View>
  );
}

// ── MoodCard ───────────────────────────────────────────────────────
function MoodCard({
  mood,
  onSelect,
  disabled,
  selected,
}: {
  mood: (typeof MOODS)[number];
  onSelect: (mood: Mood) => void;
  disabled: boolean;
  selected: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePressIn() {
    scale.value = withTiming(0.97, { duration: 100 });
  }
  function handlePressOut() {
    scale.value = withTiming(1, { duration: 120 });
  }

  return (
    <Animated.View style={[animStyle, { flex: 1 }]}>
      <Pressable
        onPress={() => !disabled && onSelect(mood.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: mood.tint,
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          gap: 6,
          borderWidth: 1.5,
          borderColor: selected ? COLORS.amber : 'transparent',
          opacity: disabled && !selected ? 0.5 : 1,
        }}>
        <Text style={{ fontSize: 22 }}>{mood.emoji}</Text>
        <Text
          style={{
            fontFamily: selected ? FONTS.uiMedium : FONTS.ui,
            fontSize: 13,
            color: COLORS.ink,
          }}>
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
