import { Icon as TablerIcon, IconProps } from '@tabler/icons-react-native';
import { ColorValue } from 'react-native';
import { COLORS } from '@/lib/theme';

type Props = Omit<IconProps, 'strokeWidth'> & {
  icon: TablerIcon;
  color?: ColorValue;
};

export function Icon({ icon: IconComponent, color = COLORS.ash, ...props }: Props) {
  return <IconComponent strokeWidth={1} color={color} {...props} />;
}
