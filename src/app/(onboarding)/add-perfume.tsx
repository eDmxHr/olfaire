import { useState, useEffect, useRef } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { router } from 'expo-router';
import { IconSearch, IconCheck, IconLoader3 } from '@tabler/icons-react-native';
import { Screen } from '@/components/screen-wrapper';
import { ProgressDots } from '@/components/progress-dots';
import { Lumi } from '@/components/lumi';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { FONTS, COLORS } from '@/lib/theme';
import type { Fragrance } from '@/lib/supabase';

export default function AddPerfumeScreen() {
  const [query, setQuery] = useState('');
  const [addedId, setAddedId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { searchFragrances, addBottle, clearSearch } = useCollection();
  const results = useCollectionStore((s) => s.searchResults);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchFragrances(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    return () => clearSearch();
  }, []);

  async function handleAdd(fragrance: Fragrance) {
    if (addingId !== null) return;
    setAddingId(fragrance.id);
    await addBottle(fragrance.id);
    setAddedId(fragrance.id);
    setAddingId(null);
  }

  function handleContinue() {
    clearSearch();
    router.push('/(onboarding)/ready');
  }

  function handleSkip() {
    clearSearch();
    router.push({ pathname: '/(onboarding)/ready', params: { skipped: 'true' } });
  }

  return (
    <Screen noPadding>
      <View className="flex-1 gap-6 px-4 py-6">
        <ProgressDots current={3} />

        <View className="flex-row items-start gap-3">
          <Lumi size={32} />
          <Card className="flex-1 rounded-tl-sm px-4 py-3">
            <Text style={{ fontFamily: FONTS.displayItalic }} className="text-base leading-relaxed text-ring">
              "A collection without bottles is just a wish list."
            </Text>
          </Card>
        </View>

        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or house…"
          placeholderTextColor={COLORS.ash}
          style={{ fontFamily: FONTS.ui }}
          autoFocus
        />

        {addedId !== null && (
          <View className="flex-row items-center gap-2 rounded-xl border border-ring/30 bg-ring/5 px-4 py-3">
            <Icon icon={IconCheck} size={16} color={COLORS.amber} />
            <Text style={{ fontFamily: FONTS.uiMedium }} className="text-sm text-ring">
              Added to your collection
            </Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-px bg-border" />}
          renderItem={({ item }) => {
            const isAdded = addedId === item.id;
            const isAdding = addingId === item.id;
            return (
              <View className="flex-row items-center gap-3 py-3">
                <View className="flex-1 gap-0.5">
                  <Text style={{ fontFamily: FONTS.uiMedium }} className="text-sm text-foreground">
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: FONTS.ui }} className="text-xs text-muted-foreground">
                    {item.house}
                    {item.family ? ` · ${item.family}` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleAdd(item)}
                  disabled={isAdded || isAdding}
                  className={`rounded-lg border px-3 py-1.5 ${
                    isAdded ? 'border-ring/30 bg-ring/5' : 'border-border bg-card'
                  }`}>
                  {isAdding ? (
                    <Icon icon={IconLoader3} size={14} color={COLORS.ash} />
                  ) : isAdded ? (
                    <Icon icon={IconCheck} size={14} color={COLORS.amber} />
                  ) : (
                    <Text style={{ fontFamily: FONTS.uiMedium }} className="text-xs text-foreground">
                      Add
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          }}
          ListEmptyComponent={
            query.length >= 2 ? (
              <Text style={{ fontFamily: FONTS.ui }} className="py-4 text-center text-sm text-muted-foreground">
                No results for "{query}"
              </Text>
            ) : null
          }
        />

        <View className="gap-3 pb-2">
          <Button size="lg" className="w-full" disabled={addedId === null} onPress={handleContinue}>
            <Text style={{ fontFamily: FONTS.uiMedium }}>Continue</Text>
          </Button>
          <Pressable onPress={handleSkip} className="items-center py-2">
            <Text style={{ fontFamily: FONTS.ui }} className="text-sm text-muted-foreground underline">
              I'll add my collection later
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
