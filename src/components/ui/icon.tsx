import { Icon as TablerIcon, IconProps } from '@tabler/icons-react-native';
import { ColorValue } from 'react-native';

type Props = Omit<IconProps, 'strokeWidth'> & {
  icon: TablerIcon;
  color?: ColorValue;
};

export function Icon({ icon: IconComponent, color = '#8C8680', ...props }: Props) {
  return <IconComponent strokeWidth={1} color={color} {...props} />;
}
