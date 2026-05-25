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
import { COLORS, FONTS } from '@/lib/theme';
import type { Fragrance, StockLevel } from '@/lib/supabase';

const GENDER_OPTIONS: Option[] = [
  { value: 'Unisex', label: 'Unisex' },
  { value: 'Women', label: 'Women' },
  { value: 'Men', label: 'Men' },
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

export default function BottleQuickAddModal() {
  const insets = useSafeAreaInsets();
  const { addBottle } = useCollection();

  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Fragrance[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Fragrance | null>(null);
  const [manualMode, setManualMode] = useState(false);

  // Manual form fields
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

  async function confirm() {
    setSaving(true);
    try {
      if (manualMode) {
        const notesTop = manualNotesTop
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const notesHeart = manualNotesHeart
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const notesBase = manualNotesBase
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const house = manualHouse.trim() || 'Unknown';
        const name = manualName.trim();

        const { data: newFrag, error } = await (supabase as any)
          .from('fragrances')
          .insert({
            house,
            name,
            concentration: manualConcentration?.value ?? null,
            family: manualFamily.trim() || 'Uncategorized',
            year: manualYear ? parseInt(manualYear, 10) : null,
            gender: manualGender?.value ?? null,
            notes_top: notesTop,
            notes_heart: notesHeart,
            notes_base: notesBase,
            season_tags: [],
            occasion_tags: [],
            is_user_contributed: true,
            is_verified: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Fire-and-forget contribution record for review queue
        getCurrentUserId().then((userId) => {
          if (userId) {
            (supabase as any).from('fragrance_contributions').insert({
              submitted_by: userId,
              house,
              name,
              raw_data: {
                concentration: manualConcentration?.value ?? null,
                family: manualFamily.trim() || null,
                year: manualYear ? parseInt(manualYear, 10) : null,
                gender: manualGender?.value ?? null,
                notes_top: notesTop,
                notes_heart: notesHeart,
                notes_base: notesBase,
              },
            });
          }
        });

        if (newFrag) await addBottleWithStock(newFrag.id);
      } else if (selected) {
        await addBottleWithStock(selected.id);
      }
      router.back();
    } catch (err) {
      console.error('confirm add bottle error:', err);
    } finally {
      setSaving(false);
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add a bottle</Text>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <IconX size={20} color={COLORS.ash} strokeWidth={1.5} />
            </Pressable>
          </View>

          {step === 'search' && (
            <>
              <View style={styles.searchRow}>
                <IconSearch size={16} color={COLORS.ash} strokeWidth={1.5} />
                <TextInput
                  style={styles.searchInput}
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
                style={{ maxHeight: 280 }}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable style={styles.resultRow} onPress={() => selectFragrance(item)}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultHouse}>{item.house}</Text>
                      <Text style={styles.resultName}>{item.name}</Text>
                    </View>
                    <Text style={styles.resultFamily}>{item.family}</Text>
                  </Pressable>
                )}
                ListEmptyComponent={
                  query.length >= 2 && !searching ? (
                    <Text style={styles.emptyHint}>No results — add it manually below.</Text>
                  ) : null
                }
              />

              <Pressable style={styles.manualBtn} onPress={goManual}>
                <Text style={styles.manualBtnText}>Not in the database? Add manually →</Text>
              </Pressable>
            </>
          )}

          {step === 'stock' && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}>
              {/* Fragrance fields */}
              <View style={styles.selectedCard}>
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
                    <Select
                      value={manualConcentration}
                      onValueChange={setManualConcentration}>
                      <SelectTrigger style={styles.concentrationTrigger}>
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

                    <Text style={styles.optionalLabel}>Optional</Text>

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
                    <Select
                      value={manualGender}
                      onValueChange={setManualGender}>
                      <SelectTrigger style={styles.concentrationTrigger}>
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
                    <Text style={styles.resultHouse}>{selected?.house}</Text>
                    <Text style={[styles.resultName, { fontSize: 18 }]}>{selected?.name}</Text>
                  </View>
                )}
              </View>

              {/* Stock level picker */}
              <Text style={styles.sectionLabel}>Initial stock level</Text>
              <View style={styles.stockRow}>
                {STOCK_LEVELS.map(({ value, label }) => {
                  const active = stockLevel === value;
                  return (
                    <Pressable
                      key={value}
                      style={[styles.stockChip, active && styles.stockChipActive]}
                      onPress={() => setStockLevel(value)}>
                      <Text style={[styles.stockChipLabel, active && styles.stockChipLabelActive]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable style={styles.backBtn} onPress={() => setStep('search')}>
                  <Text style={styles.backBtnText}>Back</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmBtn, !canConfirm && { opacity: 0.4 }]}
                  onPress={confirm}
                  disabled={!canConfirm || saving}>
                  {saving ? (
                    <ActivityIndicator size="small" color={COLORS.parchment} />
                  ) : (
                    <>
                      <IconCheck size={16} color={COLORS.parchment} strokeWidth={2} />
                      <Text style={styles.confirmBtnText}>Add to collection</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
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
        styles.manualInput,
        small && styles.manualInputSmall,
        last && { borderBottomWidth: 0, paddingBottom: 0 },
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

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,26,24,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.parchment,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.displayLightItalic,
    fontSize: 22,
    color: COLORS.ink,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.linen,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: COLORS.ink,
    padding: 0,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.dust,
  },
  resultHouse: {
    fontFamily: FONTS.uiMedium,
    fontSize: 10,
    color: COLORS.ash,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  resultName: {
    fontFamily: FONTS.displayLightItalic,
    fontSize: 16,
    color: COLORS.ink,
    lineHeight: 20,
  },
  resultFamily: {
    fontFamily: FONTS.ui,
    fontSize: 12,
    color: COLORS.ash,
  },
  emptyHint: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    color: COLORS.ash,
    paddingVertical: 16,
    textAlign: 'center',
  },
  manualBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  manualBtnText: {
    fontFamily: FONTS.uiMedium,
    fontSize: 13,
    color: COLORS.amber,
  },
  selectedCard: {
    backgroundColor: COLORS.linen,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  concentrationTrigger: {
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
  },
  manualInput: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: COLORS.ink,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.dust,
    paddingBottom: 8,
    marginBottom: 10,
    padding: 0,
  },
  manualInputSmall: {
    fontSize: 13,
    color: COLORS.ash,
  },
  optionalLabel: {
    fontFamily: FONTS.uiMedium,
    fontSize: 11,
    color: COLORS.ash,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: FONTS.uiMedium,
    fontSize: 10,
    color: COLORS.ash,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  stockRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  stockChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: COLORS.dust,
  },
  stockChipActive: {
    backgroundColor: COLORS.amber,
  },
  stockChipLabel: {
    fontFamily: FONTS.ui,
    fontSize: 13,
    color: COLORS.ink,
  },
  stockChipLabelActive: {
    fontFamily: FONTS.uiMedium,
    color: COLORS.parchment,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.linen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontFamily: FONTS.ui,
    fontSize: 14,
    color: COLORS.ink,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.amber,
  },
  confirmBtnText: {
    fontFamily: FONTS.uiMedium,
    fontSize: 14,
    color: COLORS.parchment,
  },
});
