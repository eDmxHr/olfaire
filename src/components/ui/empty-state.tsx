import { View } from 'react-native';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { COLORS, TYPE, FONTS } from '@/lib/theme';

interface EmptyStateProps {
  icon?: React.ReactNode | 'lumi';
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon = 'lumi', title, subtitle, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      {icon === 'lumi' ? <Lumi size={48} /> : icon}
      <Text className="text-center" style={[TYPE.displayM, { color: COLORS.ink }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-center" style={[TYPE.bodyS, { color: COLORS.ash }]}>
          {subtitle}
        </Text>
      ) : null}
      {action ? (
        <Button variant="outline" onPress={action.onPress}>
          <Text style={{ fontFamily: FONTS.ui }}>{action.label}</Text>
        </Button>
      ) : null}
    </View>
  );
}
