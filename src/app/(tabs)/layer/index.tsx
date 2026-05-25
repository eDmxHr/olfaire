import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { IconX, IconCheck } from '@tabler/icons-react-native';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';

import { Text } from '@/components/ui/text';
import { useCollectionStore } from '@/store/Collectionstore';
import { useLayeringStore } from '@/store/LayeringStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';
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

function BottleRow({ item, isSelected, isDisabled, onToggle }: BottleRowProps) {
  const frag = item.fragrance;
  const sub = [frag?.house, frag?.family].filter(Boolean).join(' · ');

  return (
    <Pressable
      onPress={onToggle}
      disabled={isDisabled}
      style={{
        backgroundColor: isSelected ? `${COLORS.amber}12` : 'transparent',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.dust,
        opacity: isDisabled ? 0.35 : 1,
      }}
      className="flex-row items-center py-3.5 pl-4 pr-4">
      <View className="flex-1">
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
}

// ── LayerScreen ──────────────────────────────────────────────────────────────

export default function LayerScreen() {
  const items = useCollectionStore((s) => s.items);
  const getById = useCollectionStore((s) => s.getById);
  const { selectedItems, selectBottle, deselectBottle, clearSelection, canAnalyse } = useLayeringStore();
  const { preselect } = useLocalSearchParams<{ preselect?: string }>();
  const profile = useAuthStore((s) => s.profile);
  const isPremium = useAuthStore((s) => s.isPremium());
  const [isGateChecking, setIsGateChecking] = useState(false);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
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
        const { data, error } = await (supabase as any).rpc('get_daily_layering_count', {
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
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <Lumi size={48} />
          <Text
            className="text-center"
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 20,
              color: COLORS.ink,
              lineHeight: 28,
            }}>
            Add some bottles to your collection first.
          </Text>
          <Button variant="outline" onPress={() => router.push('/modals/bottle-quick-add')}>
            <Text style={{ fontFamily: FONTS.ui }}>Add a bottle</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const nudgeKey = Math.min(selectedItems.length, 3) as 0 | 1 | 2 | 3;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 + bottomInset }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={animStyle}>
          {/* Header */}
          <View className="mt-5 items-center">
            <Text style={{ fontFamily: FONTS.displayLightItalic, fontSize: 30, color: COLORS.ink }}>
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
                  <Pressable onPress={() => deselectBottle(item.id)} hitSlop={8} className="ml-0.5">
                    <IconX size={14} color={COLORS.ash} strokeWidth={1.5} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Lumi nudge */}
          <View className="mb-2 mt-5 flex-row items-center gap-2.5">
            <Lumi size={24} />
            <Text
              className="flex-1"
              style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash, lineHeight: 20 }}>
              {LUMI_NUDGE[nudgeKey]}
            </Text>
          </View>

          {/* Section label */}
          <Text
            className="mb-1 mt-3 uppercase tracking-widest"
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 0.8,
            }}>
            Your collection
          </Text>

          {/* Bottle list */}
          <View>
            {items.map((item) => {
              const isSelected = selectedItems.some((s) => s.id === item.id);
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
          <Text style={{ fontFamily: FONTS.uiMedium }}>
            {isGateChecking ? 'Analysing...' : 'Analyse'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
