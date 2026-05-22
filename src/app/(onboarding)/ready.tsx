import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useProfile } from '@/hooks/useProfile';
import { FONTS } from '@/lib/theme';

export default function ReadyScreen() {
  const { skipped } = useLocalSearchParams<{ skipped?: string }>();
  const isSkipped = skipped === 'true';
  const { completeOnboarding } = useProfile();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 500 }));
  }, []);

  return (
    <OnboardingScreen
      scrollable={false}
      action={
        <Button size="lg" className="w-full" onPress={completeOnboarding}>
          <Text style={{ fontFamily: FONTS.uiMedium }}>Start exploring</Text>
        </Button>
      }>
      <Animated.View style={animatedStyle} className="flex-1 items-center justify-center gap-10">
        <Lumi size={65} />

        <View className="w-full gap-6">
          <Text
            style={{ fontFamily: FONTS.displayLight }}
            className="text-center text-4xl tracking-tight text-foreground">
            {isSkipped ? 'Almost there.' : "You're all set."}
          </Text>

          <View className="rounded-2xl border border-border bg-card px-5 py-4">
            <Text
              style={{ fontFamily: FONTS.displayItalic }}
              className="text-center text-xl leading-relaxed text-ring">
              {isSkipped
                ? '"Every great collection starts with one bottle. Add yours when you\'re ready."'
                : '"Morning is when I work best. Come back tomorrow and see what I suggest."'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </OnboardingScreen>
  );
}
