import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Lumi } from '@/components/lumi';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';
import { LUMI_THINKING_PHRASES } from '@/data/lumi-phrases';

interface Props {
  phrases?: string[];
  size?: number;
  wingColor?: string;
  veinColor?: string;
}

export function LumiThinking({
  phrases = LUMI_THINKING_PHRASES,
  size = 36,
  wingColor = COLORS.ink,
  veinColor = COLORS.parchment,
}: Props) {
  const [phraseIndex, setPhraseIndex] = useState(() => Math.floor(Math.random() * phrases.length));
  const textOpacity = useSharedValue(1);
  const lumiScale = useSharedValue(1);
  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const lumiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lumiScale.value }],
  }));

  useEffect(() => {
    lumiScale.value = withRepeat(
      withSequence(withTiming(1.08, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false
    );

    const FADE_OUT = 220;
    const PAUSE = 300;
    const FADE_IN = 220;
    const INTERVAL = FADE_OUT + PAUSE + FADE_IN + 800;

    const interval = setInterval(() => {
      textOpacity.value = withTiming(0, { duration: FADE_OUT });
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        textOpacity.value = withTiming(1, { duration: FADE_IN });
      }, FADE_OUT + PAUSE);
    }, INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <View className="items-center gap-3">
      <Animated.View style={lumiStyle}>
        <Lumi size={size} wingColor={wingColor} veinColor={veinColor} bodyColor={COLORS.amber} />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text style={{ fontFamily: FONTS.displayLightItalic, fontSize: 17, color: COLORS.ash }}>
          {phrases[phraseIndex]}
        </Text>
      </Animated.View>
    </View>
  );
}
