import { Pressable, ScrollView } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { MOODS } from '@/data/moods';
import { COLORS, FONTS, OPACITY } from '@/lib/theme';
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
      {MOODS.map((m) => (
        <MoodCard
          key={m.key}
          mood={m}
          onSelect={onSelect}
          disabled={disabled}
          selected={selected === m.key}
        />
      ))}
    </ScrollView>
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
    <Animated.View style={[animStyle, { width: 80 }]}>
      <Pressable
        onPress={() => !disabled && onSelect(mood.key)}
        onPressIn={() => { scale.value = withTiming(0.97, { duration: 100 }); }}
        onPressOut={() => { scale.value = withTiming(1, { duration: 120 }); }}
        className="rounded-[10px] py-3.5 items-center gap-1.5 border-[1.5px]"
        style={{
          backgroundColor: mood.tint,
          borderColor: selected ? mood.activeBorder : 'transparent',
          opacity: disabled && !selected ? OPACITY.disabled : 1,
        }}>
        <Icon size={20} color={COLORS.ink} strokeWidth={1.5} />
        <Text style={{ fontFamily: selected ? FONTS.uiMedium : FONTS.ui, fontSize: 12, color: COLORS.ink }}>
          {mood.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
