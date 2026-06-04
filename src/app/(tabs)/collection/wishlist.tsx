import React, { useCallback, useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { IconCheck, IconX, IconBookmark } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/ui/empty-state';
import { LumiQuote } from '@/components/ui/lumi-quote';
import { FragranceName } from '@/components/ui/fragrance-name';
import { useCollectionStore } from '@/store/Collectionstore';
import { useCollection } from '@/hooks/useCollection';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
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

const WishlistRow = React.memo(function WishlistRow({
  item,
  onMove,
  onRemove,
}: {
  item: CollectionItem;
  onMove: () => void;
  onRemove: () => void;
}) {
  const frag = item.fragrance;
  const sub = [frag?.house, frag?.family].filter(Boolean).join(' · ') || null;

  return (
    <View
      style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.dust }}
      className="flex-row items-center py-3.5">
      <View className="flex-1">
        <FragranceName house={frag?.house} name={frag?.name ?? '—'} subtitle={sub} />
      </View>

      <View className="ml-3 flex-row gap-2">
        <Pressable
          onPress={onMove}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.amber }}>
          <IconCheck size={16} color={COLORS.parchment} strokeWidth={2.5} />
        </Pressable>
        <Pressable
          onPress={onRemove}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.linen }}>
          <IconX size={16} color={COLORS.ash} strokeWidth={1.5} />
        </Pressable>
      </View>
    </View>
  );
});

export default function WishlistScreen() {
  const wishlist = useCollectionStore((s) => s.wishlist);
  const dna = useCollectionStore((s) => s.dna);
  const { moveToCollection, removeBottle } = useCollection();

  const { animStyle, trigger } = useScreenAnimation(8);

  useEffect(() => {
    trigger();
  }, []);

  const handleMove = useCallback((id: string) => moveToCollection(id), [moveToCollection]);
  const handleRemove = useCallback((id: string) => removeBottle(id), [removeBottle]);

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
            <EmptyState
              icon={
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.linen, alignItems: 'center', justifyContent: 'center' }}>
                  <IconBookmark size={36} color={COLORS.ash} strokeWidth={1.2} />
                </View>
              }
              title="Your wishlist is empty."
              action={{ label: 'Browse & add', onPress: () => router.push({ pathname: '/(tabs)/collection/add', params: { wishlist: 'true' } }) }}
            />
          ) : (
            <>
              <View className="mb-5">
                <LumiQuote label="Gap insight" body={gapHint} />
              </View>

              <View>
                {wishlist.map((item) => (
                  <WishlistRow
                    key={item.id}
                    item={item}
                    onMove={() => handleMove(item.id)}
                    onRemove={() => handleRemove(item.id)}
                  />
                ))}
              </View>

              <View className="mt-6 items-center">
                <Pressable
                  onPress={() => router.push({ pathname: '/(tabs)/collection/add', params: { wishlist: 'true' } })}
                  className="rounded-full border px-5 py-2.5"
                  style={{ borderColor: COLORS.dust }}>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.ink }}>
                    Add to wishlist
                  </Text>
                </Pressable>
              </View>
            </>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
