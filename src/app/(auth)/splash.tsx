import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FONTS } from '@/lib/theme';
import { Lumi } from '@/components/Lumi';

export default function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center gap-8 px-8">
        {/* Mascot */}
        <Lumi size={80} />

        {/* Brand */}
        <View className="items-center gap-2">
          <Text
            style={{ fontFamily: FONTS.displayLight, fontSize: 48, letterSpacing: 6 }}
            className="text-foreground">
            olfaire
          </Text>
          <Text
            style={{ fontFamily: FONTS.ui, fontSize: 13, letterSpacing: 1.5 }}
            className="uppercase text-muted-foreground">
            your scent, understood
          </Text>
        </View>

        {/* CTAs */}
        <View className="w-full gap-4 pt-4">
          <Button size="lg" className="w-full" onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={{ fontFamily: FONTS.uiMedium }}>Begin</Text>
          </Button>

          <Pressable onPress={() => router.push('/(auth)/sign-in')} className="items-center py-2">
            <Text
              style={{ fontFamily: FONTS.ui, fontSize: 13 }}
              className="text-muted-foreground underline">
              Already have an account? Sign in
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
