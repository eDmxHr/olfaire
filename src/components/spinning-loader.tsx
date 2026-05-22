import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { IconLoader3 } from '@tabler/icons-react-native';
import { Icon } from '@/components/ui/icon';

export function SpinningLoader({ size, color }: { size: number; color: string }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 800, easing: Easing.linear }), -1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon icon={IconLoader3} size={size} color={color} />
    </Animated.View>
  );
}
