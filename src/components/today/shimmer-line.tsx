import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { COLORS } from '@/lib/theme';

export function ShimmerLine({ width }: { width: `${number}%` | number }) {
  const opacity = useSharedValue(0.5);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
