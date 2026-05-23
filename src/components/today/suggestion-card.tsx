import { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { IconHeart, IconMinus, IconThumbDown, IconRefresh } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';
import type { Suggestion } from '@/store/TodayStore';
import type { WearRating } from '@/lib/supabase';

const INK_RAISED = '#2A2724';

const RATINGS: { key: WearRating; label: string; Icon: typeof IconHeart }[] = [
  { key: 'loved', label: 'Loved it', Icon: IconHeart },
  { key: 'neutral', label: 'Neutral', Icon: IconMinus },
  { key: 'disliked', label: 'Not today', Icon: IconThumbDown },
];

interface Props {
  suggestion: Suggestion;
  isWearing: boolean;
  hasRated: boolean;
  wearRating: WearRating | null;
  onConfirmWearing: (fragranceId: number) => void;
  onRating: (rating: WearRating) => void;
  onRequestAnother: () => void;
}

export function SuggestionCard({
  suggestion,
  isWearing,
  hasRated,
  wearRating,
  onConfirmWearing,
  onRating,
  onRequestAnother,
}: Props) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(60, withTiming(1, { duration: 350 }));
    translateY.value = withDelay(60, withTiming(0, { duration: 350 }));
  }, []);

  return (
    <Animated.View style={[animStyle, { marginTop: 24 }]}>
      <View style={{ backgroundColor: COLORS.ink, borderRadius: 16, padding: 20, gap: 16 }}>
        {/* Fragrance name */}
        <View style={{ gap: 2 }}>
          <Text
            className="uppercase"
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 1,
            }}>
            {suggestion.fragrance_house}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 20,
              color: COLORS.parchment,
              lineHeight: 26,
            }}>
            {suggestion.fragrance_name}
          </Text>
        </View>

        {/* Lumi's line */}
        <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash, lineHeight: 20 }}>
          {suggestion.lumi_line}
        </Text>

        {/* Reasoning tags */}
        {suggestion.reasoning_tags?.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5">
            {suggestion.reasoning_tags.map((tag) => (
              <View
                key={tag}
                style={{
                  backgroundColor: INK_RAISED,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}>
                <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                  {tag.replace(/-/g, ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA — pre-wearing */}
        {!isWearing && !hasRated && (
          <View style={{ gap: 10 }}>
            <Pressable
              onPress={() => onConfirmWearing(suggestion.fragrance_id)}
              style={{
                backgroundColor: COLORS.amber,
                borderRadius: 10,
                paddingVertical: 13,
                alignItems: 'center',
              }}>
              <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.ink }}>
                Wearing this today
              </Text>
            </Pressable>
            <Pressable
              onPress={onRequestAnother}
              className="flex-row items-center justify-center gap-1.5 py-2">
              <IconRefresh size={14} color={COLORS.ash} strokeWidth={1.5} />
              <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                Show me another
              </Text>
            </Pressable>
          </View>
        )}

        {/* Rating — post-wearing, pre-rated */}
        {isWearing && !hasRated && (
          <View style={{ gap: 10 }}>
            <Text
              className="uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, fontSize: 10, color: COLORS.ash }}>
              How did it wear?
            </Text>
            <View className="flex-row gap-2">
              {RATINGS.map(({ key, label, Icon }) => (
                <Pressable
                  key={key}
                  onPress={() => onRating(key)}
                  className="flex-1 items-center gap-1.5 rounded-xl py-3"
                  style={{ backgroundColor: INK_RAISED }}>
                  <Icon size={18} color={COLORS.parchment} strokeWidth={1.5} />
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.parchment }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Done state */}
        {hasRated && wearRating && (
          <View className="flex-row items-center gap-2">
            {wearRating === 'loved' && (
              <IconHeart size={15} color={COLORS.amber} strokeWidth={1.5} />
            )}
            {wearRating === 'neutral' && (
              <IconMinus size={15} color={COLORS.ash} strokeWidth={1.5} />
            )}
            {wearRating === 'disliked' && (
              <IconThumbDown size={15} color={COLORS.ash} strokeWidth={1.5} />
            )}
            <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
              {wearRating === 'loved'
                ? 'Logged as a favourite'
                : wearRating === 'neutral'
                  ? 'Logged as neutral'
                  : 'Noted for next time'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
