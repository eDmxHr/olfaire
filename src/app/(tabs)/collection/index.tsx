import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '@/lib/theme';

export default function CollectionScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: FONTS.ui, fontSize: 16, color: COLORS.ash }}>Collection</Text>
      </View>
    </SafeAreaView>
  );
}
