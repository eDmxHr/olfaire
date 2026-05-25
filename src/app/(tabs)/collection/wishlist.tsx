import { useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { IconCheck, IconX } from '@tabler/icons-react-native';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useCollectionStore } from '@/store/Collectionstore';
import { useCollection } from '@/hooks/useCollection';
import { COLORS, FONTS } from '@/lib/theme';
import type { CollectionItem } from '@/lib/supabase';

// Gap hints keyed by dominant family — generic fallback if no DNA
const FAMILY_GAP_HINTS: Record<string, string> = {
  Floral: 'You love florals — a woody or leather base could add depth to your rotation.',
  Woody: 'Your collection skews woody — a bright citrus or aquatic could lighten your palette.',
  Fresh: 'Fresh is your signature — a warm oriental or amber would make a striking contrast.',
  Oriental: 'You gravitate to warm, opulent scents — a clean green or aquatic could surprise you.',
  Chypre: 'Chypre runs through your DNA — a fruity floral might open up new occasions.',
  Fougère: 'Fougères dominate — a rich oud or incense would push you somewhere bolder.',
  Gourmand: 'You have a sweet side — a dry, smoky wood could balance things beautifully.',
  Leather: 'Leather is clearly your thing — a delicate white floral would be an interesting contrast.',
};

const GENERIC_HINT =
  'Build out your wishlist and Lumi will start spotting gaps in your rotation.';

function WishlistRow({
  item,
  onMove,
  onRemove,
}: {
  item: CollectionItem;
  onMove: () => void;
  onRemove: () => void;
}) {
  const frag = item.fragrance;
  const sub = [frag?.house, frag?.family].filter(Boolean).join(' · ');

  return (
    <View
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.dust,
      }}
      className="flex-row items-center py-3.5">
      <View style={{ flex: 1 }}>
        {frag?.house ? (
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
            }}>
            {frag.house}
          </Text>
        ) : null}
        <Text
          style={{
            fontFamily: FONTS.displayLightItalic,
            fontSize: 17,
            lineHeight: 22,
            color: COLORS.ink,
          }}>
          {frag?.name ?? '—'}
        </Text>
        {sub ? (
          <Text className="mt-0.5" style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
            {sub}
          </Text>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginLeft: 12 }}>
        {/* Move to collection */}
        <Pressable
          onPress={onMove}
          hitSlop={8}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.amber,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <IconCheck size={16} color={COLORS.parchment} strokeWidth={2.5} />
        </Pressable>

        {/* Remove */}
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: COLORS.linen,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <IconX size={16} color={COLORS.ash} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
}

export default function WishlistScreen() {
  const wishlist = useCollectionStore((s) => s.wishlist);
  const dna = useCollectionStore((s) => s.dna);
  const { moveToCollection, removeBottle } = useCollection();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  const gapHint = dna?.dominant_family
    ? (FAMILY_GAP_HINTS[dna.dominant_family] ?? GENERIC_HINT)
    : GENERIC_HINT;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Wishlist" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[animStyle, { overflow: 'visible' }]}>

          {wishlist.length === 0 ? (
            /* Empty state */
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 16 }}>
              <Lumi size={48} />
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 20,
                  color: COLORS.ink,
                  lineHeight: 28,
                  textAlign: 'center',
                }}>
                Your wishlist is empty.
              </Text>
              <Button
                variant="outline"
                onPress={() => router.push('/(tabs)/collection/add?wishlist=true' as any)}>
                <Text style={{ fontFamily: FONTS.ui }}>Browse & add</Text>
              </Button>
            </View>
          ) : (
            <>
              {/* Lumi gap insight */}
              <View
                style={{
                  backgroundColor: COLORS.ink,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    fontFamily: FONTS.uiMedium,
                    fontSize: 10,
                    color: COLORS.ash,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                  Gap insight
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 16,
                    color: COLORS.parchment,
                    lineHeight: 22,
                  }}>
                  {gapHint}
                </Text>
              </View>

              {/* Wishlist items */}
              <View>
                {wishlist.map((item) => (
                  <WishlistRow
                    key={item.id}
                    item={item}
                    onMove={() => moveToCollection(item.id)}
                    onRemove={() => removeBottle(item.id)}
                  />
                ))}
              </View>

              {/* Add more CTA */}
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <Button
                  variant="outline"
                  onPress={() => router.push('/(tabs)/collection/add?wishlist=true' as any)}>
                  <Text style={{ fontFamily: FONTS.ui }}>Add to wishlist</Text>
                </Button>
              </View>
            </>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
