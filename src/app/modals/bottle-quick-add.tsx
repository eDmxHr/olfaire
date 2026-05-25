import { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSearch, IconX, IconCheck } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from '@/components/ui/select';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { supabase, getCurrentUserId } from '@/lib/supabase';
import { enrichFragrance } from '@/lib/claudeApi';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS } from '@/lib/theme';
import type { Fragrance, StockLevel } from '@/lib/supabase';

const GENDER_OPTIONS: Option[] = [
  { value: 'unisex', label: 'Unisex' },
  { value: 'women', label: 'Women' },
  { value: 'men', label: 'Men' },
];

const CONCENTRATION_OPTIONS: Option[] = [
  { value: 'Eau de Toilette', label: 'Eau de Toilette' },
  { value: 'Eau de Parfum', label: 'Eau de Parfum' },
  { value: 'Parfum', label: 'Parfum' },
];

const STOCK_LEVELS: { value: StockLevel; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'medium', label: 'Half' },
  { value: 'low', label: 'Low' },
  { value: 'empty', label: 'Empty' },
];

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

  const [manualHouse, setManualHouse] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualConcentration, setManualConcentration] = useState<Option | undefined>(undefined);
  const [manualNotesTop, setManualNotesTop] = useState('');
  const [manualNotesHeart, setManualNotesHeart] = useState('');
  const [manualNotesBase, setManualNotesBase] = useState('');
  const [manualFamily, setManualFamily] = useState('');
  const [manualYear, setManualYear] = useState('');
  const [manualGender, setManualGender] = useState<Option | undefined>(undefined);

  const [stockLevel, setStockLevel] = useState<StockLevel>('full');
  const [saving, setSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState<string | null>(null);

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
    concentration?: string,
    family?: string
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

    setSavingLabel('Lumi is looking this up...');
    const enriched = await enrichFragrance(house, name, concentration);
    setSavingLabel(null);

    const { data: newFragrance, error } = await (supabase as any)
      .from('fragrances')
      .insert({
        house,
        name,
        concentration: concentration ?? null,
        family: enriched.family || family || 'Unknown',
        subfamily: enriched.subfamily,
        notes_top: enriched.notes_top,
        notes_heart: enriched.notes_heart,
        notes_base: enriched.notes_base,
        longevity: enriched.longevity,
        sillage: enriched.sillage,
        season_tags: enriched.season_tags,
        occasion_tags: enriched.occasion_tags,
        gender: normalizeGender(enriched.gender),
        year: enriched.year,
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
        raw_data: { concentration, family, confidence: enriched.confidence },
        status: enriched.confidence === 'low' ? 'pending' : 'verified',
        merged_into: newFragrance.id,
      });
    }

    await addBottleWithStock(newFragrance.id);
  }

  async function confirm() {
    setSaving(true);
    try {
      if (manualMode) {
        const house = manualHouse.trim() || 'Unknown';
        const name = manualName.trim();
        await addManualFragrance(
          house,
          name,
          manualConcentration?.value,
          manualFamily.trim() || undefined
        );
      } else if (selected) {
        await addBottleWithStock(selected.id);
      }
      router.back();
    } catch (err: any) {
      console.error('confirm add bottle error:', err?.message ?? err);
    } finally {
      setSaving(false);
      setSavingLabel(null);
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

  const canConfirm = manualMode ? manualName.trim().length > 0 : selected !== null;

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
              <View
                className="mb-2 flex-row items-center gap-2.5 rounded-xl px-3.5 py-2.5"
                style={{ backgroundColor: COLORS.linen }}>
                <IconSearch size={16} color={COLORS.ash} strokeWidth={1.5} />
                <TextInput
                  className="flex-1"
                  style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, padding: 0 }}
                  placeholder="Search by name or house…"
                  placeholderTextColor={COLORS.ash}
                  value={query}
                  onChangeText={search}
                  autoFocus
                  returnKeyType="search"
                />
                {searching && <ActivityIndicator size="small" color={COLORS.ash} />}
              </View>

              <FlatList
                data={results}
                keyExtractor={(item) => String(item.id)}
                className="max-h-[280px]"
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    className="flex-row items-center border-b py-3"
                    style={{ borderBottomColor: COLORS.dust }}
                    onPress={() => selectFragrance(item)}>
                    <View className="flex-1">
                      <SectionLabel>{item.house}</SectionLabel>
                      <Text
                        style={{
                          fontFamily: FONTS.displayLightItalic,
                          fontSize: 16,
                          lineHeight: 20,
                          color: COLORS.ink,
                        }}>
                        {item.name}
                      </Text>
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
                  <>
                    <Field
                      placeholder="House (e.g. Chanel)"
                      value={manualHouse}
                      onChangeText={setManualHouse}
                    />
                    <Field
                      placeholder="Fragrance name"
                      value={manualName}
                      onChangeText={setManualName}
                      autoFocus
                    />
                    <Select value={manualConcentration} onValueChange={setManualConcentration}>
                      <SelectTrigger style={concentrationTriggerStyle}>
                        <SelectValue placeholder="Concentration" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONCENTRATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt!.value} label={opt!.label} value={opt!.value} />
                        ))}
                      </SelectContent>
                    </Select>
                    <Field
                      placeholder="Top notes (comma-separated)"
                      value={manualNotesTop}
                      onChangeText={setManualNotesTop}
                    />
                    <Field
                      placeholder="Heart notes (comma-separated)"
                      value={manualNotesHeart}
                      onChangeText={setManualNotesHeart}
                    />
                    <Field
                      placeholder="Base notes (comma-separated)"
                      value={manualNotesBase}
                      onChangeText={setManualNotesBase}
                    />

                    <Text
                      className="mb-2 mt-1.5 uppercase"
                      style={{
                        fontFamily: FONTS.uiMedium,
                        fontSize: 11,
                        letterSpacing: 0.6,
                        color: COLORS.ash,
                      }}>
                      Optional
                    </Text>

                    <Field
                      placeholder="Family (e.g. Floral, Woody)"
                      value={manualFamily}
                      onChangeText={setManualFamily}
                      small
                    />
                    <Field
                      placeholder="Year"
                      value={manualYear}
                      onChangeText={setManualYear}
                      keyboardType="numeric"
                      small
                    />
                    <Select value={manualGender} onValueChange={setManualGender}>
                      <SelectTrigger style={concentrationTriggerStyle}>
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((opt) => (
                          <SelectItem key={opt!.value} label={opt!.label} value={opt!.value} />
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <View>
                    <SectionLabel>{selected?.house}</SectionLabel>
                    <Text
                      style={{
                        fontFamily: FONTS.displayLightItalic,
                        fontSize: 18,
                        lineHeight: 20,
                        color: COLORS.ink,
                      }}>
                      {selected?.name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stock level picker */}
              <SectionLabel className="mb-2.5">Initial stock level</SectionLabel>
              <View className="mb-6 flex-row gap-2">
                {STOCK_LEVELS.map(({ value, label }) => {
                  const active = stockLevel === value;
                  return (
                    <Pressable
                      key={value}
                      className="flex-1 items-center rounded-full py-2.5"
                      style={{ backgroundColor: active ? COLORS.amber : COLORS.dust }}
                      onPress={() => setStockLevel(value)}>
                      <Text
                        style={{
                          fontFamily: active ? FONTS.uiMedium : FONTS.ui,
                          fontSize: 13,
                          color: active ? COLORS.parchment : COLORS.ink,
                        }}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

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
                  style={{ backgroundColor: COLORS.amber, opacity: !canConfirm ? 0.4 : 1 }}
                  onPress={confirm}
                  disabled={!canConfirm || saving}>
                  {saving ? (
                    <>
                      <ActivityIndicator size="small" color={COLORS.parchment} />
                      {savingLabel ? (
                        <Text
                          style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.parchment }}>
                          {savingLabel}
                        </Text>
                      ) : null}
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

// ── Field helper ──────────────────────────────────────────────────────────────

interface FieldProps {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  autoFocus?: boolean;
  keyboardType?: 'default' | 'numeric';
  small?: boolean;
  last?: boolean;
}

function Field({
  placeholder,
  value,
  onChangeText,
  autoFocus,
  keyboardType,
  small,
  last,
}: FieldProps) {
  return (
    <TextInput
      style={[
        {
          fontFamily: FONTS.ui,
          fontSize: small ? 13 : 15,
          color: small ? COLORS.ash : COLORS.ink,
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: COLORS.dust,
          paddingBottom: last ? 0 : 8,
          marginBottom: 10,
          padding: 0,
        },
      ]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.ash}
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      keyboardType={keyboardType ?? 'default'}
      autoCapitalize="none"
    />
  );
}

// SelectTrigger requires a style prop (not className) — kept as plain object
const concentrationTriggerStyle = {
  borderWidth: 0,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: COLORS.dust,
  borderRadius: 0,
  backgroundColor: 'transparent',
  paddingHorizontal: 0,
  paddingVertical: 0,
  height: 'auto' as any,
  marginBottom: 10,
  shadowOpacity: 0,
};
