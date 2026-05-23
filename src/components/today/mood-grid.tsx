import { View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { MOODS } from '@/data/moods';
import { COLORS, FONTS } from '@/lib/theme';
import type { Mood } from '@/lib/supabase';

export function MoodGrid({
  onSelect,
  disabled,
  selected,
}: {
  onSelect: (mood: Mood) => void;
  disabled: boolean;
  selected: Mood | null;
}) {
  const rows = [MOODS.slice(0, 2), MOODS.slice(2, 4), MOODS.slice(4, 6), MOODS.slice(6, 8)];

  return (
    <View className="gap-2">
      {rows.map((row, i) => (
        <View key={i} className="flex-row gap-2">
          {row.map((m) => (
            <MoodCard
              key={m.key}
              mood={m}
              onSelect={onSelect}
              disabled={disabled}
              selected={selected === m.key}
            />
          ))}
        </View>
      ))}
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

  const Icon = mood.icon;

  return (
    <Animated.View style={animStyle} className="flex-1">
      <Pressable
        onPress={() => !disabled && onSelect(mood.key)}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
        className="rounded-[10px] py-3.5 items-center gap-1.5 border-[1.5px]"
        style={{
          backgroundColor: mood.tint,
          borderColor: selected ? COLORS.amber : 'transparent',
          opacity: disabled && !selected ? 0.5 : 1,
        }}>
        <Icon size={20} color={COLORS.ink} strokeWidth={1.5} />
        <Text style={{ fontFamily: selected ? FONTS.uiMedium : FONTS.ui, fontSize: 12, color: COLORS.ink }}>
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
