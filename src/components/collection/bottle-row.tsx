import { View, Pressable, StyleSheet, Image } from 'react-native';
import { IconChevronRight } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS } from '@/lib/theme';
import type { CollectionItem } from '@/lib/supabase';

interface Props {
  item: CollectionItem;
  onPress: () => void;
}

const BOTTLE_PLACEHOLDER = require('../../../assets/images/perume-bottle-circle.png');

export function BottleRow({ item, onPress }: Props) {
  const frag = item.fragrance;

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.dust,
      }}
      className="flex-row items-center py-3.5">
      <Image
        source={item.custom_image_url ? { uri: item.custom_image_url } : BOTTLE_PLACEHOLDER}
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          marginRight: 12,
          backgroundColor: COLORS.linen,
        }}
        resizeMode="contain"
      />
      <View className="flex-1">
        {frag?.house ? <SectionLabel>{frag.house}</SectionLabel> : null}
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

      <IconChevronRight size={16} color={COLORS.ash} strokeWidth={1.5} className="ml-3" />
    </Pressable>
  );
}
