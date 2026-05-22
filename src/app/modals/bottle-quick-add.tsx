import { View, Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '@/lib/theme';

export default function BottleQuickAddModal() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.title}>Quick Add Bottle</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(28,26,24,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.parchment,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  title: { fontFamily: FONTS.display, fontSize: 22, color: COLORS.ink },
});
