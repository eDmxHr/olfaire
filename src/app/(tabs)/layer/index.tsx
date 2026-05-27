import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Animated from 'react-native-reanimated';
import { IconX, IconCheck } from '@tabler/icons-react-native';
import { Lumi } from '@/components/lumi';
import { SpinningLoader } from '@/components/spinning-loader';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';

import { Text } from '@/components/ui/text';
import { useCollectionStore } from '@/store/Collectionstore';
import { useLayeringStore } from '@/store/LayeringStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { useCollectionSearch } from '@/hooks/useCollectionSearch';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS, TYPE, colorWithOpacity, OPACITY } from '@/lib/theme';
import type { CollectionItem } from '@/lib/supabase';

// ── Constants ────────────────────────────────────────────────────────────────

const LUMI_NUDGE: Record<0 | 1 | 2 | 3, string> = {
  0: 'Pick two or three fragrances to explore their chemistry.',
  1: 'Good start — add one more to unlock the analysis.',
  2: 'Ready to analyse, or add a third for a richer blend.',
  3: "Perfect trio. Let's see how these interact.",
};

// ── BottleRow ────────────────────────────────────────────────────────────────

interface BottleRowProps {
  item: CollectionItem;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

const BottleRow = React.memo(function BottleRow({ item, isSelected, isDisabled, onToggle }: BottleRowProps) {
  const frag = item.fragrance;
  const sub = [frag?.house, frag?.family].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onToggle}
      disabled={isDisabled}
      style={{
        backgroundColor: isSelected ? colorWithOpacity(COLORS.amber, 0.07) : 'transparent',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.dust,
        opacity: isDisabled ? OPACITY.disabled : 1,
      }}
      className="flex-row items-center py-3.5">
      <View className="flex-1">
        <Text style={[TYPE.displayS, { color: COLORS.ink }]}>
          {frag?.name ?? '—'}
        </Text>
        {sub ? (
          <Text
            className="mt-0.5"
            style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
            {sub}
          </Text>
        ) : null}
      </View>
      <View
        className="ml-3 h-6 w-6 items-center justify-center rounded-full"
        style={{
          backgroundColor: isSelected ? COLORS.amber : 'transparent',
          borderWidth: isSelected ? 0 : 1.5,
          borderColor: COLORS.dust,
        }}>
        {isSelected && <IconCheck size={13} color="#fff" strokeWidth={2.5} />}
      </View>
    </Pressable>
  );
});

// ── LayerScreen ──────────────────────────────────────────────────────────────

export default function LayerScreen() {
  const items = useCollectionStore((s) => s.items);
  const getById = useCollectionStore((s) => s.getById);
  const { selectedItems, selectBottle, deselectBottle, clearSelection, canAnalyse } =
    useLayeringStore();
  const { preselect } = useLocalSearchParams<{ preselect?: string }>();
  const profile = useAuthStore((s) => s.profile);
  const isPremium = useAuthStore((s) => s.isPremium());
  const [isGateChecking, setIsGateChecking] = useState(false);
  const { bottom: bottomInset } = useSafeAreaInsets();
  const { query, setQuery, filtered: filteredItems, visible: visibleItems, hasMore, setShowAll } = useCollectionSearch(items);

  const selectedIds = useMemo(
    () => new Set(selectedItems.map((i) => i.id)),
    [selectedItems]
  );

  const { animStyle, trigger } = useScreenAnimation(16);

  useEffect(() => {
    trigger();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!preselect) return;
      const item = getById(preselect);
      if (!item) return;
      clearSelection();
      selectBottle(item);
    }, [preselect, getById, clearSelection, selectBottle])
  );

  async function handleAnalyse() {
    if (isGateChecking) return;
    setIsGateChecking(true);
    try {
      if (!isPremium) {
        const userId = profile?.id ?? (await supabase.auth.getUser()).data.user?.id;
        if (!userId) return;
        const { data, error } = await supabase.rpc('get_daily_layering_count', {
          p_user_id: userId,
        });
        if (!error && (data as number) >= 3) {
          router.push('/modals/premium-gate');
          return;
        }
      }
      router.push('/(tabs)/layer/analysis');
    } catch (err) {
      console.error('handleAnalyse error:', err);
      Alert.alert('Error', 'Could not start analysis. Check your connection and try again.');
    } finally {
      setIsGateChecking(false);
    }
  }

  if (items.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: COLORS.parchment }}
        edges={['top']}>
        <EmptyState
          title="Add some bottles to your collection first."
          action={{ label: 'Add a bottle', onPress: () => router.push('/modals/bottle-quick-add') }}
        />
      </SafeAreaView>
    );
  }

  const nudgeKey = Math.min(selectedItems.length, 3) as 0 | 1 | 2 | 3;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 + bottomInset }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={animStyle}>
          {/* Header */}
          <View className="mt-5 items-center">
            <Text style={[TYPE.displayXL, { color: COLORS.ink }]}>
              Layer
            </Text>
            {selectedItems.length > 0 && (
              <Text
                className="mt-0.5"
                style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                {selectedItems.length} / 3
              </Text>
            )}
          </View>

          {/* Selected tray */}
          {selectedItems.length > 0 && (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {selectedItems.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                  style={{
                    backgroundColor: COLORS.linen,
                    borderWidth: 1,
                    borderColor: COLORS.dust,
                  }}>
                  <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.ink }}>
                    {item.fragrance?.name ?? '—'}
                  </Text>
                  <Pressable onPress={() => deselectBottle(item.id)} hitSlop={16} className="ml-0.5">
                    <IconX size={14} color={COLORS.ash} strokeWidth={1.5} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Lumi nudge */}
          <View className="mb-2 mt-5 flex-row items-center gap-2.5">
            <View style={{ transform: [{ rotate: '12deg' }] }}>
              <Lumi size={24} />
            </View>
            <Text className="flex-1" style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash, lineHeight: 20 }}>
              {LUMI_NUDGE[nudgeKey]}
            </Text>
          </View>

          {/* Search */}
          <SearchInput
            className="mt-3"
            value={query}
            onChangeText={setQuery}
            placeholder="Search your collection…"
          />

          {/* Section label */}
          <SectionLabel className="mb-1 mt-3">Your collection</SectionLabel>

          {/* Bottle list */}
          <View>
            {visibleItems.map((item) => {
              const isSelected = selectedIds.has(item.id);
              const isDisabled = selectedItems.length >= 3 && !isSelected;
              return (
                <BottleRow
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onToggle={() => (isSelected ? deselectBottle(item.id) : selectBottle(item))}
                />
              );
            })}
            {hasMore && (
              <Pressable
                onPress={() => setShowAll(true)}
                className="items-center py-3.5"
                style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: COLORS.dust }}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.ash }} >
                  Show {filteredItems.length - visibleItems.length} more
                </Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Analyse button */}
      <View
        style={{
          position: 'absolute',
          bottom: 6,
          left: 20,
          right: 20,
        }}>
        <Button disabled={!canAnalyse() || isGateChecking} onPress={handleAnalyse}>
          {isGateChecking && <SpinningLoader size={14} color={COLORS.parchment} />}
          <Text style={{ fontFamily: FONTS.uiMedium }}>
            {isGateChecking ? 'Analysing...' : 'Analyse'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
