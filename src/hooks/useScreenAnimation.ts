import { useSharedValue, useAnimatedStyle, withTiming, withDelay, type AnimatedStyle } from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

interface UseScreenAnimationReturn {
  animStyle: AnimatedStyle<ViewStyle>;
  trigger: () => void;
}

export function useScreenAnimation(initialY: number = 8): UseScreenAnimationReturn {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(initialY);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  function trigger() {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
  }

  return { animStyle, trigger };
}
