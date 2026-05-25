import { View, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/theme';

export default function PremiumGateModal() {
  const insets = useSafeAreaInsets();
  return (
    <BlurView intensity={20} tint="dark" className="flex-1 justify-end" style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View
        className="rounded-t-3xl p-6"
        style={{ backgroundColor: COLORS.parchment, paddingBottom: insets.bottom + 16 }}>
        <Text style={{ fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink }}>
          Premium
        </Text>
      </View>
    </BlurView>
  );
}
