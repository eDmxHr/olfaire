import { View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FONTS } from '@/lib/theme';

export default function MeetLumiScreen() {
  return (
    <OnboardingScreen
      scrollable={false}
      action={
        <Button size="lg" className="w-full" onPress={() => router.push('/(onboarding)/lifestyle')}>
          <Text style={{ fontFamily: FONTS.uiMedium }}>Get started</Text>
        </Button>
      }>
      <View className="flex-1 items-center justify-center gap-10">
        <Lumi size={65} />

        <View className="w-full gap-6">
          <View className="rounded-2xl border border-border bg-card px-5 py-4">
            <Text
              style={{ fontFamily: FONTS.displayItalic }}
              className="text-center text-2xl leading-relaxed text-ring">
              "Tell me about yourself and the right scent will follow."
            </Text>
          </View>

          <Text
            style={{ fontFamily: FONTS.ui }}
            className="text-center text-sm text-muted-foreground">
            Three quick questions. That's all.
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}
