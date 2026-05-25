import { useState, useRef } from 'react';
import { View, TextInput, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSearch } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useCollectionStore } from '@/store/Collectionstore';
import { useCollection } from '@/hooks/useCollection';
import { COLORS, FONTS } from '@/lib/theme';
import type { Fragrance } from '@/lib/supabase';

function ResultRow({
  frag,
  onPress,
}: {
  frag: Fragrance;
  onPress: () => void;
}) {
  const sub = [frag.house, frag.family].filter(Boolean).join(' · ');
  return (
    <Pressable
      onPress={onPress}
      style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.dust }}
      className="py-3.5">
      {frag.house ? (
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
        {frag.name}
      </Text>
      {sub ? (
        <Text className="mt-0.5" style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
          {sub}
        </Text>
      ) : null}
    </Pressable>
  );
}

export default function AddPerfumeScreen() {
  const { wishlist: wishlistParam } = useLocalSearchParams<{ wishlist?: string }>();
  const isWishlist = wishlistParam === 'true';

  const [query, setQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const searchResults = useCollectionStore((s) => s.searchResults);
  const { searchFragrances, addBottle, clearSearch } = useCollection();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChangeText(text: string) {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchFragrances(text);
    }, 300);
  }

  async function handleAdd(frag: Fragrance) {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await addBottle(frag.id, isWishlist);
      clearSearch();
      router.back();
    } finally {
      setIsAdding(false);
    }
  }

  const showEmpty = query.trim().length >= 2 && searchResults.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title={isWishlist ? 'Add to wishlist' : 'Add perfume'} />

      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        {/* Search input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: COLORS.linen,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            gap: 10,
          }}>
          <IconSearch size={18} color={COLORS.ash} strokeWidth={1.5} />
          <TextInput
            value={query}
            onChangeText={handleChangeText}
            placeholder="Search by name or house…"
            placeholderTextColor={COLORS.ash}
            autoFocus
            style={{
              flex: 1,
              fontFamily: FONTS.ui,
              fontSize: 15,
              color: COLORS.ink,
              padding: 0,
            }}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {showEmpty ? (
          <Text
            style={{
              fontFamily: FONTS.ui,
              fontSize: 14,
              color: COLORS.ash,
              marginTop: 24,
              textAlign: 'center',
            }}>
            No results for "{query}"
          </Text>
        ) : (
          <View>
            {searchResults.map((frag) => (
              <ResultRow key={frag.id} frag={frag} onPress={() => handleAdd(frag)} />
            ))}
          </View>
        )}

        {/* Manual entry fallback */}
        <Pressable
          onPress={() => Alert.alert('Coming soon', 'Manual entry will be available in a future update.')}
          style={{ alignItems: 'center', marginTop: 32, paddingVertical: 8 }}>
          <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
            Can't find it?{' '}
            <Text style={{ fontFamily: FONTS.uiMedium, color: COLORS.amber }}>
              Add manually
            </Text>
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
