import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, TYPE } from '@/lib/theme';

// nameScale: 'S' = displayS (17/22), 'M' = displayM (22/28), 'L' = displayL (28/36), 'XL' = displayXL (32/40)
type NameScale = 'S' | 'M' | 'L' | 'XL';

const NAME_STYLE: Record<NameScale, object> = {
  S: TYPE.displayS,
  M: TYPE.displayM,
  L: TYPE.displayL,
  XL: TYPE.displayXL,
};

interface FragranceNameProps {
  house?: string | null;
  name: string;
  nameScale?: NameScale;
  nameColor?: string;
  subtitle?: string | null;
}

export function FragranceName({
  house,
  name,
  nameScale = 'S',
  nameColor = COLORS.ink,
  subtitle,
}: FragranceNameProps) {
  return (
    <View>
      {house ? <SectionLabel>{house}</SectionLabel> : null}
      <Text style={[NAME_STYLE[nameScale], { color: nameColor }]}>{name}</Text>
      {subtitle ? (
        <Text className="mt-0.5" style={[TYPE.caption, { color: COLORS.ash }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
