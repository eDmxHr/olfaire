import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { FONTS } from '@/lib/theme';

export function OnboardingHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="gap-0">
      <Text
        style={{ fontFamily: FONTS.displayLight }}
        className="text-4xl tracking-tight text-foreground">
        {title}
      </Text>
      <Text style={{ fontFamily: FONTS.ui }} className="text-sm text-muted-foreground">
        {subtitle}
      </Text>
    </View>
  );
}
