import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { IconPlus } from '@tabler/icons-react-native';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BottleRow } from '@/components/collection/bottle-row';
import { useCollectionStore } from '@/store/Collectionstore';
import { useCollection } from '@/hooks/useCollection';
import { COLORS, FONTS } from '@/lib/theme';

// ── CollectionScreen ──────────────────────────────────────────────────────────

export default function CollectionScreen() {
  const items = useCollectionStore((s) => s.items);
  const lowStockItems = useCollectionStore((s) => s.lowStockItems);
  const { fetchCollection } = useCollection();
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
    fetchCollection();
  }, []);

  const families = Array.from(
    new Set(items.map((i) => i.fragrance?.family).filter(Boolean) as string[])
  ).sort();

  const filteredItems = selectedFamily
    ? items.filter((i) => i.fragrance?.family === selectedFamily)
    : items;

  const familyCount = families.length;
  const lowCount = lowStockItems().length;

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
            Start your collection.
          </Text>
          <Button
            variant="outline"
            onPress={() => router.navigate('/modals/bottle-quick-add' as any)}>
            <Text style={{ fontFamily: FONTS.ui }}>Add a bottle</Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[animStyle, { overflow: 'visible' }]}>
          {/* Header */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 30,
                lineHeight: 40,
                color: COLORS.ink,
              }}>
              Collection
            </Text>
            <Pressable
              onPress={() => router.navigate('/modals/bottle-quick-add' as any)}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.amber,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <IconPlus size={20} color={COLORS.parchment} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Stats row */}
          <View className="mt-5 flex-row gap-3">
            <View
              className="flex-1 items-center rounded-2xl py-4"
              style={{ backgroundColor: COLORS.linen }}>
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 28,
                  color: COLORS.ink,
                  lineHeight: 32,
                }}>
                {items.length}
              </Text>
              <Text
                className="mt-0.5 uppercase"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                }}>
                Bottles
              </Text>
            </View>

            <View
              className="flex-1 items-center rounded-2xl py-4"
              style={{ backgroundColor: COLORS.linen }}>
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 28,
                  color: COLORS.ink,
                  lineHeight: 32,
                }}>
                {familyCount}
              </Text>
              <Text
                className="mt-0.5 uppercase"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                }}>
                Families
              </Text>
            </View>

            <Pressable
              className="flex-1 items-center rounded-2xl py-4"
              style={{ backgroundColor: COLORS.linen }}
              onPress={() => router.push('/(tabs)/collection/low-stock')}>
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 28,
                  color: lowCount > 0 ? COLORS.red : COLORS.ink,
                  lineHeight: 32,
                }}>
                {lowCount}
              </Text>
              <Text
                className="mt-0.5 uppercase"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                }}>
                Low stock
              </Text>
            </Pressable>
          </View>

          {/* DNA link */}
          <Pressable
            onPress={() => router.push('/(tabs)/collection/dna')}
            style={{ alignItems: 'flex-end', marginTop: 8 }}>
            <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.amber }}>
              View DNA →
            </Text>
          </Pressable>

          {/* Filter chips */}
          <View className="mt-5">
            <Text
              className="mb-3 uppercase"
              style={{
                fontFamily: FONTS.uiMedium,
                fontSize: 10,
                color: COLORS.ash,
                letterSpacing: 0.8,
              }}>
              Filter
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingRight: 20 }}>
              {(['All', ...families] as string[]).map((family) => {
                const isAll = family === 'All';
                const active = isAll ? selectedFamily === null : selectedFamily === family;
                return (
                  <Pressable
                    key={family}
                    onPress={() => setSelectedFamily(isAll ? null : family)}
                    style={{
                      backgroundColor: active ? COLORS.amber : COLORS.linen,
                      borderRadius: 99,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}>
                    <Text
                      style={{
                        fontFamily: active ? FONTS.uiMedium : FONTS.ui,
                        fontSize: 13,
                        color: active ? COLORS.parchment : COLORS.ink,
                      }}>
                      {family}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Bottle list */}
          <Text
            className="mb-1 mt-5 uppercase"
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 0.8,
            }}>
            {selectedFamily ?? 'All bottles'}
          </Text>

          {filteredItems.length === 0 && selectedFamily !== null ? (
            <Text
              className="mt-6 text-center"
              style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.ash }}>
              No {selectedFamily} bottles in your collection.
            </Text>
          ) : (
            <View>
              {filteredItems.map((item) => (
                <BottleRow
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/collection/${item.id}` as any)}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
