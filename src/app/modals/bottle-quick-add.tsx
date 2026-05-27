import { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  FlatList,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconX, IconCheck } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { SearchInput } from '@/components/ui/search-input';
import { StockLevelPicker } from '@/components/ui/stock-level-picker';
import { FragranceName } from '@/components/ui/fragrance-name';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { enrichFragrance } from '@/lib/claudeApi';
import { SectionLabel } from '@/components/ui/section-label';
import {
  ManualFragranceForm,
  type ManualFragranceFormValues,
} from '@/components/collection/manual-fragrance-form';
import type { UserProvidedFragranceData } from '@/lib/claudeApi';
import { COLORS, FONTS, OPACITY } from '@/lib/theme';
import type { Fragrance, StockLevel } from '@/lib/supabase';

const INITIAL_FORM: ManualFragranceFormValues = {
  house: '',
  name: '',
  concentration: undefined,
  notesTop: '',
  notesHeart: '',
  notesBase: '',
  family: '',
  year: '',
  gender: undefined,
};

type Step = 'search' | 'stock';

function normalizeGender(g: string | null): 'men' | 'women' | 'unisex' | null {
  if (!g) return null;
  const v = g.toLowerCase();
  if (v === 'men' || v === 'masculine' || v === 'male') return 'men';
  if (v === 'women' || v === 'feminine' || v === 'female') return 'women';
  if (v === 'unisex') return 'unisex';
  return null;
}

export default function BottleQuickAddModal() {
  const insets = useSafeAreaInsets();
  const { addBottle } = useCollection();

  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fragrance[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Fragrance | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [formValues, setFormValues] = useState<ManualFragranceFormValues>(INITIAL_FORM);

  const [stockLevel, setStockLevel] = useState<StockLevel>('full');
  const [addError, setAddError] = useState<string | null>(null);

  type SaveStep = 'idle' | 'looking-up' | 'saving' | 'done';
  const [saveStep, setSaveStep] = useState<SaveStep>('idle');

  const SAVE_STEP_LABEL: Record<SaveStep, string | null> = {
    'idle': null,
    'looking-up': 'Lumi is looking this up…',
    'saving': 'Saving…',
    'done': 'Done!',
  };

  function handleFormChange<K extends keyof ManualFragranceFormValues>(
    key: K,
    value: ManualFragranceFormValues[K]
  ) {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  const search = useCallback(async (text: string) => {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await (supabase as any)
        .from('fragrances')
        .select('*')
        .or(`name.ilike.%${text}%,house.ilike.%${text}%`)
        .limit(20);
      setResults(data ?? []);
    } finally {
      setSearching(false);
    }
  }, []);

  function selectFragrance(frag: Fragrance) {
    setSelected(frag);
    setManualMode(false);
    setStep('stock');
  }

  function goManual() {
    setSelected(null);
    setManualMode(true);
    setStep('stock');
  }

  async function addManualFragrance(
    house: string,
    name: string,
    userProvided: UserProvidedFragranceData
  ) {
    const { data: existing } = await (supabase as any)
      .from('fragrances')
      .select('id')
      .ilike('house', house)
      .ilike('name', name)
      .maybeSingle();

    if (existing) {
      await addBottleWithStock(existing.id);
      return;
    }

    setSaveStep('looking-up');
    const enriched = await enrichFragrance(house, name, userProvided);
    setSaveStep('saving');

    const { data: newFragrance, error } = await (supabase as any)
      .from('fragrances')
      .insert({
        house,
        name,
        concentration: userProvided.concentration ?? null,
        family: userProvided.family || enriched.family || 'Unknown',
        subfamily: enriched.subfamily,
        notes_top: userProvided.notesTop?.length ? userProvided.notesTop : enriched.notes_top,
        notes_heart: userProvided.notesHeart?.length ? userProvided.notesHeart : enriched.notes_heart,
        notes_base: userProvided.notesBase?.length ? userProvided.notesBase : enriched.notes_base,
        longevity: enriched.longevity,
        sillage: enriched.sillage,
        season_tags: enriched.season_tags,
        occasion_tags: enriched.occasion_tags,
        gender: normalizeGender(userProvided.gender ?? enriched.gender),
        year: userProvided.year ?? enriched.year,
        is_user_contributed: true,
        is_verified: false,
      })
      .select('id')
      .single();

    if (error) throw error;

    const userId = await getCurrentUserId();
    if (userId) {
      await (supabase as any).from('fragrance_contributions').insert({
        submitted_by: userId,
        house,
        name,
        raw_data: { input: userProvided, enriched },
        status: enriched.confidence === 'low' ? 'pending' : 'verified',
        merged_into: newFragrance.id,
      });
    }

    await addBottleWithStock(newFragrance.id);
  }

  async function confirm() {
    setAddError(null);
    setSaveStep('saving');
    try {
      if (manualMode) {
        const house = formValues.house.trim() || 'Unknown';
        const name = formValues.name.trim();
        const userProvided: UserProvidedFragranceData = {
          year: formValues.year.trim() ? parseInt(formValues.year.trim(), 10) : undefined,
          concentration: formValues.concentration?.value,
          notesTop: formValues.notesTop.trim() ? formValues.notesTop.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          notesHeart: formValues.notesHeart.trim() ? formValues.notesHeart.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          notesBase: formValues.notesBase.trim() ? formValues.notesBase.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
          family: formValues.family.trim() || undefined,
          gender: formValues.gender?.value,
        };
        await addManualFragrance(house, name, userProvided);
      } else if (selected) {
        await addBottleWithStock(selected.id);
      }
      setSaveStep('done');
      await new Promise((r) => setTimeout(r, 500));
      router.back();
    } catch (err: any) {
      console.error('confirm add bottle error:', err?.message ?? err);
      setSaveStep('idle');
      setAddError("Couldn't add bottle. Please try again.");
    }
  }

  async function addBottleWithStock(fragranceId: number) {
    if (stockLevel === 'full') {
      await addBottle(fragranceId);
      return;
    }
    const { data, error } = await (supabase as any)
      .from('user_collection')
      .insert({ fragrance_id: fragranceId, stock_level: stockLevel, is_wishlist: false })
      .select('*, fragrance:fragrances(*)')
      .single();

    if (error) throw error;
    if (data) useCollectionStore.getState().prependItem(data);
  }

  const canConfirm = manualMode ? formValues.name.trim().length > 0 : selected !== null;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BlurView intensity={20} tint="dark" className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={() => router.back()} />

        <View
          className="max-h-[90%] rounded-t-3xl px-6 pt-5"
          style={{ backgroundColor: COLORS.parchment, paddingBottom: insets.bottom + 16 }}>
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <Text style={{ fontFamily: FONTS.displayLightItalic, fontSize: 22, color: COLORS.ink }}>
              Add a bottle
            </Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <IconX size={20} color={COLORS.ash} strokeWidth={1.5} />
            </Pressable>
          </View>

          {step === 'search' && (
            <>
              <SearchInput
                className="mb-2"
                value={query}
                onChangeText={search}
                placeholder="Search by name or house…"
                autoFocus
                loading={searching}
              />

              <FlatList
                data={results}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 280 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    className="flex-row items-center border-b py-3"
                    style={{ borderBottomColor: COLORS.dust }}
                    onPress={() => selectFragrance(item)}>
                    <View className="flex-1">
                      <FragranceName house={item.house} name={item.name} />
                    </View>
                    <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                      {item.family}
                    </Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  query.length >= 2 && !searching ? (
                    <Text
                      className="py-4 text-center"
                      style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                      No results — add it manually below.
                    </Text>
                  ) : null
                }
              />

              <Pressable className="mt-4 items-center" onPress={goManual}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.amber }}>
                  Not in the database? Add manually →
                </Text>
              </Pressable>
            </>
          )}

          {step === 'stock' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}>
              <View className="mb-5 rounded-xl p-4" style={{ backgroundColor: COLORS.linen }}>
                {manualMode ? (
                  <ManualFragranceForm values={formValues} onChange={handleFormChange} />
                ) : (
                  <FragranceName house={selected?.house} name={selected?.name ?? ''} />
                )}
              </View>

              {/* Stock level picker */}
              <SectionLabel className="mb-2.5">Initial stock level</SectionLabel>
              <View className="mb-6">
                <StockLevelPicker value={stockLevel} onChange={setStockLevel} />
              </View>

              {/* Error */}
              {addError && (
                <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.red, marginBottom: 8, textAlign: 'center' }}>
                  {addError}
                </Text>
              )}

              {/* Actions */}
              <View className="flex-row gap-2.5">
                <Pressable
                  className="items-center justify-center rounded-xl px-5 py-3.5"
                  style={{ backgroundColor: COLORS.linen }}
                  onPress={() => setStep('search')}>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.ink }}>
                    Back
                  </Text>
                </Pressable>
                <Pressable
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3.5"
                  style={{ backgroundColor: COLORS.amber, opacity: !canConfirm ? OPACITY.disabled : 1 }}
                  onPress={confirm}
                  disabled={!canConfirm || saveStep !== 'idle'}>
                  {saveStep !== 'idle' ? (
                    <>
                      {saveStep === 'done' ? (
                        <IconCheck size={16} color={COLORS.parchment} strokeWidth={2.5} />
                      ) : (
                        <ActivityIndicator size="small" color={COLORS.parchment} />
                      )}
                      <Text style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.parchment }}>
                        {SAVE_STEP_LABEL[saveStep]}
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconCheck size={16} color={COLORS.parchment} strokeWidth={2} />
                      <Text
                        style={{
                          fontFamily: FONTS.uiMedium,
                          fontSize: 14,
                          color: COLORS.parchment,
                        }}>
                        Add to collection
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}
