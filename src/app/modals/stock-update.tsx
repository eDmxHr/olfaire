import { useState } from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconX } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { ModalShell } from '@/components/ui/modal-shell';
import { StockLevelPicker } from '@/components/ui/stock-level-picker';
import { FragranceName } from '@/components/ui/fragrance-name';
import { useCollection } from '@/hooks/useCollection';
import { useCollectionStore } from '@/store/Collectionstore';
import { COLORS, FONTS } from '@/lib/theme';
import type { StockLevel } from '@/lib/supabase';

export default function StockUpdateModal() {
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
    <ModalShell onDismiss={() => router.back()} maxHeight="60%">
      <View className="mb-6 flex-row items-start justify-between">
        <FragranceName
          house={item?.fragrance?.house}
          name={item?.fragrance?.name ?? 'Update Stock'}
          nameScale="M"
        />
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <IconX size={20} color={COLORS.ash} strokeWidth={1.5} />
        </Pressable>
      </View>

      <Text
        className="mb-2.5 uppercase"
        style={{ fontFamily: FONTS.uiMedium, fontSize: 10, letterSpacing: 2.4, color: COLORS.ash }}>
        Stock level
      </Text>
      <View className="mb-6">
        <StockLevelPicker value={stockLevel} onChange={setStockLevel} />
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
    </ModalShell>
  );
}
