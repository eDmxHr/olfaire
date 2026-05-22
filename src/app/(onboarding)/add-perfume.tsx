import { useState, useEffect, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { IconCheck, IconSearchOff, IconTrash } from '@tabler/icons-react-native';
import { SpinningLoader } from '@/components/spinning-loader';
import { OnboardingScreen } from '@/components/onboarding/screen';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { OnboardingHeader } from '@/components/onboarding/header';
import { Lumi } from '@/components/lumi';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { LUMI_COLLECTION_QUOTES } from '@/data/onboarding';
import { FONTS, COLORS } from '@/lib/theme';
import type { CollectionItem } from '@/lib/supabase';

export default function AddPerfumeScreen() {
  const [query, setQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { searchFragrances, addBottle, removeBottle, clearSearch, fetchCollection } =
    useCollection();
  const results = useCollectionStore((s) => s.searchResults);
  const items = useCollectionStore((s) => s.items);
  const isSyncing = useCollectionStore((s) => s.isSyncing);
  const getByFragrance = useCollectionStore((s) => s.getByFragrance);

  const lumiQuote =
    LUMI_COLLECTION_QUOTES[Math.min(items.length, 10)] ?? LUMI_COLLECTION_QUOTES[10]!;

  const [displayedQuote, setDisplayedQuote] = useState(lumiQuote);
  const quoteOpacity = useSharedValue(1);
  const quoteStyle = useAnimatedStyle(() => ({ opacity: quoteOpacity.value }));

  useEffect(() => {
    quoteOpacity.value = withTiming(0, { duration: 200 });
    const t = setTimeout(() => {
      setDisplayedQuote(lumiQuote);
      quoteOpacity.value = withTiming(1, { duration: 200 });
    }, 200);
    return () => clearTimeout(t);
  }, [lumiQuote]);

  useEffect(() => {
    fetchCollection();
    return () => clearSearch();
  }, []);

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

  async function handleAdd(fragrance: { id: number }) {
    if (addingId !== null) return;
    setAddingId(fragrance.id);
    await addBottle(fragrance.id);
    setAddedIds((prev) => new Set(prev).add(fragrance.id));
    setQuery('');
    clearSearch();
    setAddingId(null);
  }

  async function handleRemove(item: CollectionItem) {
    setRemovingId(item.id);
    await removeBottle(item.id);
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.delete(item.fragrance_id);
      return next;
    });
    setRemovingId(null);
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
          <Button
            size="lg"
            className="w-full"
            disabled={items.length === 0 || isSyncing}
            onPress={handleContinue}>
            {isSyncing ? (
              <SpinningLoader size={18} color={COLORS.parchment} />
            ) : (
              <Text style={{ fontFamily: FONTS.uiMedium }}>Continue</Text>
            )}
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
        <View style={{ transform: [{ rotate: '45deg' }] }}>
          <Lumi size={28} />
        </View>
        <Card className="flex-1 rounded-tl-sm px-4 py-3">
          <Animated.Text
            style={[{ fontFamily: FONTS.displayItalic }, quoteStyle]}
            className="text-sm leading-relaxed text-ring">
            {displayedQuote}
          </Animated.Text>
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
          const isOwned = !!getByFragrance(item.id);
          const isAdded = addedIds.has(item.id);
          const isAdding = addingId === item.id;
          const showTick = isOwned || isAdded;
          return (
            <View key={item.id}>
              {index > 0 && <View className="h-px bg-border" />}
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
                  disabled={showTick || isAdding}
                  className={`rounded-lg border px-3 py-1.5 ${
                    showTick ? 'border-ring/30 bg-ring/5' : 'border-border bg-card'
                  }`}>
                  {isAdding ? (
                    <SpinningLoader size={14} color={COLORS.ash} />
                  ) : showTick ? (
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
              <SpinningLoader size={20} color={COLORS.ash} />
            ) : (
              <Icon icon={IconSearchOff} size={20} color={COLORS.ash} />
            )}
          </View>
        )}
      </View>

      {items.length > 0 && (
        <View className="gap-2">
          <Text
            style={{ fontFamily: FONTS.uiMedium }}
            className="text-xs uppercase tracking-widest text-muted-foreground">
            Your Collection
          </Text>
          {items.map((item, index) =>
            item.fragrance ? (
              <View key={item.id}>
                {index > 0 && <Separator />}
                <View className="flex-row items-center gap-3 py-1.5">
                  <View className="flex-1">
                    <Text
                      style={{ fontFamily: FONTS.uiMedium }}
                      className="text-sm text-foreground">
                      {item.fragrance.name}
                    </Text>
                    <Text
                      style={{ fontFamily: FONTS.ui }}
                      className="text-xs text-muted-foreground">
                      {item.fragrance.house}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemove(item)}
                    disabled={removingId === item.id}
                    hitSlop={8}>
                    {removingId === item.id ? (
                      <SpinningLoader size={14} color={COLORS.ash} />
                    ) : (
                      <Icon icon={IconTrash} size={16} color={COLORS.ash} />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null
          )}
        </View>
      )}
    </OnboardingScreen>
  );
}
