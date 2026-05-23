import { View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';
import type { Mood } from '@/lib/supabase';

const MOODS: { key: Mood; label: string; emoji: string; tint: string }[] = [
  { key: 'soft', label: 'Soft', emoji: '🌸', tint: '#F5EDE8' },
  { key: 'bold', label: 'Bold', emoji: '🔥', tint: '#F0E8DC' },
  { key: 'cosy', label: 'Cosy', emoji: '☁️', tint: '#EAE8E0' },
  { key: 'sharp', label: 'Sharp', emoji: '⚡', tint: '#E8EAEC' },
  { key: 'mysterious', label: 'Mysterious', emoji: '🌙', tint: '#E5E0EA' },
];

export function MoodGrid({
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
    <View className="gap-2.5">
      <View className="flex-row gap-2.5">
        {row1.map((m) => (
          <MoodCard key={m.key} mood={m} onSelect={onSelect} disabled={disabled} selected={selected === m.key} />
        ))}
      </View>
      <View className="flex-row gap-2.5">
        {row2.map((m) => (
          <MoodCard key={m.key} mood={m} onSelect={onSelect} disabled={disabled} selected={selected === m.key} />
        ))}
      </View>
    </View>
  );
}

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
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePressIn() {
    scale.value = withTiming(0.97, { duration: 100 });
  }
  function handlePressOut() {
    scale.value = withTiming(1, { duration: 120 });
  }

  return (
    <Animated.View style={animStyle} className="flex-1">
      <Pressable
        onPress={() => !disabled && onSelect(mood.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: mood.tint,
          borderColor: selected ? COLORS.amber : 'transparent',
          opacity: disabled && !selected ? 0.5 : 1,
        }}
        className="rounded-xl p-4 items-center gap-1.5 border-2">
        <Text style={{ fontSize: 22 }}>{mood.emoji}</Text>
        <Text style={{ fontFamily: selected ? FONTS.uiMedium : FONTS.ui, fontSize: 13, color: COLORS.ink }}>
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
