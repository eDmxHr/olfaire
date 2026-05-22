import { useState, useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { IconCheck, IconLoader3, IconSearchOff } from '@tabler/icons-react-native';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { ProgressDots } from '@/components/progress-dots';
import { OnboardingHeader } from '@/components/onboarding-header';
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
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { searchFragrances, addBottle, clearSearch } = useCollection();
  const results = useCollectionStore((s) => s.searchResults);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      await searchFragrances(query);
      setSearching(false);
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
    <OnboardingScreen
      action={
        <>
          {addedId !== null && (
            <View className="flex-row items-center justify-center gap-1.5">
              <Icon icon={IconCheck} size={13} color={COLORS.amber} />
              <Text style={{ fontFamily: FONTS.ui }} className="text-xs text-muted-foreground">
                Added to your collection
              </Text>
            </View>
          )}
          <Button size="lg" className="w-full" disabled={addedId === null} onPress={handleContinue}>
            <Text style={{ fontFamily: FONTS.uiMedium }}>Continue</Text>
          </Button>
          <Pressable onPress={handleSkip} className="items-center py-2">
            <Text
              style={{ fontFamily: FONTS.ui }}
              className="text-sm text-muted-foreground underline">
              I'll add my collection later
            </Text>
          </Pressable>
        </>
      }>
      <ProgressDots current={3} />

      <OnboardingHeader
        title="Add your first bottle"
        subtitle="Search by name or house to start your collection."
      />

      <View className="flex-row items-start gap-3">
        <Lumi size={28} />
        <Card className="flex-1 rounded-tl-sm px-4 py-3">
          <Text
            style={{ fontFamily: FONTS.displayItalic }}
            className="text-sm leading-relaxed text-ring">
            "A collection without bottles is just a wishlist."
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

      <View>
        {results.map((item, index) => {
          const isAdded = addedId === item.id;
          const isAdding = addingId === item.id;
          return (
            <View key={item.id}>
              {index > 0 && <View className="h-px bg-border" />}
              <View className="flex-row items-center gap-3 py-3">
                <View className="flex-1 gap-0.5">
                  <Text
                    style={{ fontFamily: FONTS.uiMedium }}
                    className="text-sm text-foreground">
                    {item.name}
                  </Text>
                  <Text
                    style={{ fontFamily: FONTS.ui }}
                    className="text-xs text-muted-foreground">
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
                    <Text
                      style={{ fontFamily: FONTS.uiMedium }}
                      className="text-xs text-foreground">
                      Add
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          );
        })}
        {results.length === 0 && query.length >= 2 && (
          <View className="items-center py-4">
            {searching ? (
              <Icon icon={IconLoader3} size={20} color={COLORS.ash} />
            ) : (
              <Icon icon={IconSearchOff} size={20} color={COLORS.ash} />
            )}
          </View>
        )}
      </View>
    </OnboardingScreen>
  );
}
