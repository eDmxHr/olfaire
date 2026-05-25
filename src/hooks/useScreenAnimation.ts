import { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';

export function useScreenAnimation(initialY: number = 8) {
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
