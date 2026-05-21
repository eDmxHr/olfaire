import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Screen } from '@/components/screen-wrapper';
import { Lumi } from '@/components/lumi';
import { FONTS } from '@/lib/theme';

export default function SplashScreen() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-8">
        <Lumi size={80} />

        <View className="items-center gap-2">
          <Text
            style={{ fontFamily: FONTS.displayLight }}
            className="text-5xl tracking-widest text-foreground">
            olfaire
          </Text>
          <Text
            style={{ fontFamily: FONTS.ui }}
            className="text-xs uppercase tracking-widest text-muted-foreground">
            your scent, understood
          </Text>
        </View>

        <View className="w-full gap-4 pt-4">
          <Button size="lg" className="w-full" onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={{ fontFamily: FONTS.uiMedium }}>Get started</Text>
          </Button>

          <Pressable onPress={() => router.push('/(auth)/sign-in')} className="items-center py-2">
            <Text
              style={{ fontFamily: FONTS.ui }}
              className="text-sm text-muted-foreground underline">
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
