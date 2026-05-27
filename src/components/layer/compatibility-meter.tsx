import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS, TYPE } from '@/lib/theme';
const SEGMENTS = 5;

function SegmentBar({ filled, delay }: { filled: boolean; delay: number }) {
  const opacity = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [delay]);

  return (
    <Animated.View
      style={[
        { flex: 1, height: 6, borderRadius: 3, backgroundColor: filled ? COLORS.amber : COLORS.inkRaised },
        style,
      ]}
    />
  );
}

export function CompatibilityMeter({ score, label, fragNames }: { score: number; label: string; fragNames?: string }) {
  return (
    <View className="mb-8 mt-4 items-center gap-3">
      {fragNames && (
        <View className="items-center gap-1">
          <Text className="uppercase tracking-widest" style={[TYPE.label, { color: COLORS.ash }]}>
            Compatibility
          </Text>
          <Text style={{ fontFamily: FONTS.displayLightItalic, fontSize: 17, color: COLORS.parchment, lineHeight: 22 }}>
            {fragNames}
          </Text>
        </View>
      )}
      <Text style={{ fontFamily: FONTS.displayLightItalic, fontSize: 80, color: COLORS.parchment, lineHeight: 88 }}>
        {score}
      </Text>
      <View className="w-full flex-row gap-1.5">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <SegmentBar key={i} filled={score >= (i + 1) * 20} delay={i * 80} />
        ))}
      </View>
      <Text className="uppercase tracking-widest" style={[TYPE.label, { color: COLORS.ash }]}>
        {label}
      </Text>
    </View>
  );
}
