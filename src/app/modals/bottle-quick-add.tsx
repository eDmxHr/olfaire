import { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSearch, IconX, IconCheck } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';
import type { Fragrance, StockLevel } from '@/lib/supabase';

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
  const [manualHouse, setManualHouse] = useState('');
  const [manualName, setManualName] = useState('');
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
        // Insert as user-contributed fragrance then add to collection
        const { data: newFrag, error } = await (supabase as any)
          .from('fragrances')
          .insert({
            house: manualHouse.trim() || 'Unknown',
            name: manualName.trim(),
            family: 'Uncategorized',
            notes_top: [],
            notes_heart: [],
            notes_base: [],
            season_tags: [],
            occasion_tags: [],
            is_user_contributed: true,
            is_verified: false,
          })
          .select()
          .single();

        if (error) throw error;
        if (newFrag) {
          await addBottleWithStock(newFrag.id);
        }
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
    // Insert directly with the chosen stock level (addBottle defaults to 'full')
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
              {/* Search input */}
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

              {/* Results */}
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

              {/* Manual fallback */}
              <Pressable style={styles.manualBtn} onPress={goManual}>
                <Text style={styles.manualBtnText}>Not in the database? Add manually →</Text>
              </Pressable>
            </>
          )}

          {step === 'stock' && (
            <>
              {/* Selected fragrance summary */}
              <View style={styles.selectedCard}>
                {manualMode ? (
                  <>
                    <TextInput
                      style={styles.manualInput}
                      placeholder="House (e.g. Chanel)"
                      placeholderTextColor={COLORS.ash}
                      value={manualHouse}
                      onChangeText={setManualHouse}
                    />
                    <TextInput
                      style={[styles.manualInput, { marginTop: 8 }]}
                      placeholder="Fragrance name *"
                      placeholderTextColor={COLORS.ash}
                      value={manualName}
                      onChangeText={setManualName}
                      autoFocus
                    />
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
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

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
  manualInput: {
    fontFamily: FONTS.ui,
    fontSize: 15,
    color: COLORS.ink,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.dust,
    paddingBottom: 6,
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
    backgroundColor: COLORS.linen,
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
