import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, TYPE } from '@/lib/theme';
import type { StyleProp, ViewStyle } from 'react-native';

interface StatCardProps {
  value: string | number;
  label: string;
  valueColor?: string;
  size?: 'default' | 'sm';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({ value, label, valueColor, size = 'default', onPress, style }: StatCardProps) {
  const valueStyle = size === 'sm' ? TYPE.displayM : TYPE.displayL;
  const Container = onPress ? Pressable : View;

  return (
    <Container
      onPress={onPress}
      className="flex-1 items-start rounded-2xl px-4 py-3.5"
      style={[{ backgroundColor: COLORS.linen }, style]}>
      <SectionLabel>{label}</SectionLabel>
      <Text style={[valueStyle, { color: valueColor ?? COLORS.ink, marginTop: 2 }]}>{value}</Text>
    </Container>
  );
}
