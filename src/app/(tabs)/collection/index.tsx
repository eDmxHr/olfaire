import { useEffect, useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { IconPlus, IconMoodEmpty } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { BottleRow } from '@/components/collection/bottle-row';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchInput } from '@/components/ui/search-input';
import { useCollectionStore } from '@/store/Collectionstore';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionSearch } from '@/hooks/useCollectionSearch';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { SectionLabel } from '@/components/ui/section-label';
import { StatCard } from '@/components/ui/stat-card';
import { COLORS, FONTS, TYPE } from '@/lib/theme';

// ── CollectionScreen ──────────────────────────────────────────────────────────

export default function CollectionScreen() {
  const items = useCollectionStore((s) => s.items);
  const lowStockItems = useCollectionStore((s) => s.lowStockItems);
  const { fetchCollection } = useCollection();
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const { query, setQuery, isSearching } = useCollectionSearch(items, items.length);

  const { animStyle, trigger } = useScreenAnimation(8);

  useEffect(() => {
    trigger();
    fetchCollection();
  }, []);

  const families = Array.from(
    new Set(items.map((i) => i.fragrance?.family).filter(Boolean) as string[])
  ).sort();

  const filteredItems = items.filter((i) => {
    const matchesFamily = selectedFamily ? i.fragrance?.family === selectedFamily : true;
    const matchesQuery = isSearching
      ? i.fragrance?.name?.toLowerCase().includes(query.toLowerCase()) ||
        i.fragrance?.house?.toLowerCase().includes(query.toLowerCase())
      : true;
    return matchesFamily && matchesQuery;
  });

  const familyCount = families.length;
  const lowCount = lowStockItems().length;

  if (true || items.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: COLORS.parchment }}
        edges={['top']}>
        <EmptyState
          icon={
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.linen, alignItems: 'center', justifyContent: 'center' }}>
              <IconMoodEmpty size={36} color={COLORS.ash} strokeWidth={1.2} />
            </View>
          }
          title="Start your collection."
          action={{
            label: 'Add a bottle',
            onPress: () => router.navigate('/modals/bottle-quick-add'),
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[animStyle, { overflow: 'visible' }]}>
          {/* Header */}
          <View className="mt-5 flex-row items-center justify-between">
            <Text style={[TYPE.displayXL, { color: COLORS.ink }]}>Collection</Text>
            <Pressable
              onPress={() => router.navigate('/modals/bottle-quick-add')}
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
            <StatCard value={items.length} label="Bottles" />
            <StatCard value={familyCount} label="Families" />
            <StatCard
              value={lowCount}
              label="Low stock"
              valueColor={lowCount > 0 ? COLORS.amber : undefined}
              onPress={() => router.push('/(tabs)/collection/low-stock')}
            />
          </View>

          {/* Search */}
          <SearchInput
            className="mt-4"
            value={query}
            onChangeText={setQuery}
            placeholder="Search your collection…"
          />

          {/* Filter chips */}
          <View className="mt-4">
            <SectionLabel className="mb-3">Filter</SectionLabel>
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
          <SectionLabel className="mb-1 mt-5">{selectedFamily ?? 'All bottles'}</SectionLabel>

          {filteredItems.length === 0 ? (
            <Text
              className="mt-6 text-center"
              style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
              {isSearching
                ? 'No results for that search.'
                : `No ${selectedFamily} bottles in your collection.`}
            </Text>
          ) : (
            <View>
              {filteredItems.map((item) => (
                <BottleRow
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({ pathname: '/collection/[id]', params: { id: item.id } })
                  }
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
