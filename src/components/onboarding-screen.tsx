import { View, ScrollView } from 'react-native';
import { Screen } from '@/components/screen-wrapper';

interface OnboardingScreenProps {
  children: React.ReactNode;
  action: React.ReactNode;
  scrollable?: boolean;
}

export function OnboardingScreen({ children, action, scrollable = true }: OnboardingScreenProps) {
  return (
    <Screen noPadding>
      <View className="flex-1">
        {scrollable ? (
          <ScrollView
            contentContainerClassName="gap-6 px-4 py-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View className="flex-1 px-4 py-6">
            {children}
          </View>
        )}
        <View className="gap-3 px-4 pb-6 pt-2">
          {action}
        </View>
      </View>
    </Screen>
  );
}
