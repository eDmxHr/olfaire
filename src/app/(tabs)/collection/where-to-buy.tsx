import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Lumi } from '@/components/lumi';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS } from '@/lib/theme';

export default function WhereToBuyScreen() {
  const { name, house } = useLocalSearchParams<{ name: string; house: string }>();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="" />
      <View className="flex-1 px-5 pt-2 pb-12">

        {/* Fragrance hero card */}
        <View className="rounded-2xl p-5" style={{ backgroundColor: COLORS.ink }}>
          {house ? (
            <SectionLabel>{house}</SectionLabel>
          ) : null}
          <Text
            className="mt-1"
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 28,
              lineHeight: 34,
              color: COLORS.parchment,
            }}>
            {name || '—'}
          </Text>
        </View>

        {/* Coming soon content */}
        <View className="flex-1 items-center justify-center gap-4">
          <Lumi size={48} wingColor={COLORS.ink} />
          <Text
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 24,
              color: COLORS.ink,
            }}>
            Coming soon
          </Text>
          <Text
            className="text-center leading-6"
            style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.ash }}>
            We're curating the best places to find this.{'\n'}Check back soon.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}
