import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { COLORS, TYPE, colorWithOpacity } from '@/lib/theme';
import type { StyleProp, ViewStyle } from 'react-native';

type TagChipVariant = 'default' | 'active' | 'muted' | 'dark';
type TagChipShape = 'pill' | 'rounded';

interface TagChipProps {
  label: string;
  variant?: TagChipVariant;
  shape?: TagChipShape;
  textColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const BG: Record<TagChipVariant, string> = {
  default: COLORS.linen,
  active: COLORS.amber,
  muted: colorWithOpacity(COLORS.ash, 0.19),
  dark: COLORS.inkRaised,
};

const TEXT_COLOR: Record<TagChipVariant, string> = {
  default: COLORS.ash,
  active: COLORS.parchment,
  muted: COLORS.ash,
  dark: COLORS.ash,
};

export function TagChip({
  label,
  variant = 'default',
  shape = 'pill',
  textColor,
  onPress,
  style,
}: TagChipProps) {
  const borderRadius = shape === 'pill' ? 99 : 6;
  const padding =
    shape === 'pill'
      ? { paddingHorizontal: 12, paddingVertical: 5 }
      : { paddingHorizontal: 10, paddingVertical: 4 };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      style={[{ backgroundColor: BG[variant], borderRadius, ...padding }, style]}>
      <Text style={[TYPE.caption, { color: textColor ?? TEXT_COLOR[variant] }]}>{label}</Text>
    </Container>
  );
}
