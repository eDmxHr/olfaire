import { Text } from '@/components/ui/text';
import { COLORS, TYPE } from '@/lib/theme';
import type { StyleProp, TextStyle } from 'react-native';

interface SectionLabelProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  className?: string;
}

export function SectionLabel({ children, style, className }: SectionLabelProps) {
  return (
    <Text
      className={className}
      style={[TYPE.label, { color: COLORS.ash }, style]}>
      {children}
    </Text>
  );
}
