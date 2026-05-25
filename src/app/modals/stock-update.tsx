import { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconX } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { COLORS, FONTS } from '@/lib/theme';
import type { StockLevel } from '@/lib/supabase';

const STOCK_LEVELS: { value: StockLevel; label: string }[] = [
  { value: 'full', label: 'Full' },
  { value: 'medium', label: 'Half' },
  { value: 'low', label: 'Low' },
  { value: 'empty', label: 'Empty' },
];

export default function StockUpdateModal() {
  const insets = useSafeAreaInsets();
  const { collectionId } = useLocalSearchParams<{ collectionId: string }>();
  const { updateStock } = useCollection();
  const item = useCollectionStore((s) => s.getById(collectionId));

  const [stockLevel, setStockLevel] = useState<StockLevel>(item?.stock_level ?? 'full');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!collectionId) return;
    setSaving(true);
    await updateStock(collectionId, stockLevel);
    setSaving(false);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BlurView
        intensity={20}
        tint="dark"
        className="flex-1 justify-end"
        style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
        <View
          className="rounded-t-3xl px-6 pt-5"
          style={{ backgroundColor: COLORS.parchment, paddingBottom: insets.bottom + 16 }}>
          <View className="mb-6 flex-row items-start justify-between">
            <View>
              {item?.fragrance?.house ? (
                <Text
                  className="mb-0.5 uppercase"
                  style={{
                    fontFamily: FONTS.uiMedium,
                    fontSize: 10,
                    letterSpacing: 0.8,
                    color: COLORS.ash,
                  }}>
                  {item.fragrance.house}
                </Text>
              ) : null}
              <Text
                style={{ fontFamily: FONTS.displayLightItalic, fontSize: 22, color: COLORS.ink }}>
                {item?.fragrance?.name ?? 'Update Stock'}
              </Text>
            </View>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <IconX size={20} color={COLORS.ash} strokeWidth={1.5} />
            </Pressable>
          </View>

          <Text
            className="mb-2.5 uppercase"
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              letterSpacing: 0.8,
              color: COLORS.ash,
            }}>
            Stock level
          </Text>
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

          <Pressable
            className="items-center justify-center rounded-xl py-3.5"
            style={{ backgroundColor: COLORS.amber, opacity: saving ? 0.6 : 1 }}
            onPress={save}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.parchment} />
            ) : (
              <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.parchment }}>
                Save
              </Text>
            )}
          </Pressable>
        </View>
      </BlurView>
    </KeyboardAvoidingView>
  );
}
