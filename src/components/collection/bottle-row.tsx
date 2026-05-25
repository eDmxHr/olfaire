import { View, Pressable, StyleSheet } from 'react-native';
import { IconChevronRight } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS } from '@/lib/theme';
import type { CollectionItem } from '@/lib/supabase';

interface Props {
  item: CollectionItem;
  onPress: () => void;
}

export function BottleRow({ item, onPress }: Props) {
  const frag = item.fragrance;

  const dotColor =
    item.stock_level === 'full' || item.stock_level === 'medium'
      ? COLORS.amber
      : item.stock_level === 'low'
        ? COLORS.red
        : COLORS.ash;

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.dust,
      }}
      className="flex-row items-center py-3.5 pl-4 pr-4">
      <View className="flex-1">
        {frag?.house ? (
          <SectionLabel>{frag.house}</SectionLabel>
        ) : null}
        <Text
          style={{
            fontFamily: FONTS.displayLightItalic,
            fontSize: 17,
            lineHeight: 22,
            color: COLORS.ink,
          }}>
          {frag?.name ?? '—'}
        </Text>
        {frag?.family ? (
          <Text
            className="mt-0.5"
            style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
            {frag.family}
          </Text>
        ) : null}
      </View>

      <View className="ml-3 flex-row items-center gap-2">
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
          }}
        />
        {item.wear_count > 0 ? (
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.ash }}>
            {item.wear_count}×
          </Text>
        ) : null}
        <IconChevronRight size={16} color={COLORS.ash} strokeWidth={1.5} />
      </View>
    </Pressable>
  );
}
