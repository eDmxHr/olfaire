import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { DNARadarChart } from '@/components/dna-radar-chart';
import { useCollectionStore } from '@/store/Collectionstore';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS, TYPE, colorWithOpacity } from '@/lib/theme';

export default function DNAScreen() {
  const dna = useCollectionStore((s) => s.dna);
  const items = useCollectionStore((s) => s.items);

  const { animStyle, trigger } = useScreenAnimation(8);

  useEffect(() => {
    trigger();
  }, []);

  const hasDNA = dna && Object.keys(dna.families ?? {}).length > 0;
  const allFamilies = hasDNA
    ? (dna!.families as Record<string, number>)
    : {};
  const familyCount = Object.keys(allFamilies).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="Fragrance DNA" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={animStyle} className="overflow-visible">

          {hasDNA ? (
            <>
              {/* Dominant family hero */}
              <View className="mb-5 rounded-2xl p-5" style={{ backgroundColor: COLORS.ink }}>
                <SectionLabel style={{ color: colorWithOpacity(COLORS.parchment, 0.5) }}>Your signature</SectionLabel>
                <Text className="mt-1" style={[TYPE.displayL, { color: COLORS.parchment }]}>
                  {dna!.dominant_family}
                </Text>
                {dna!.lumi_insight ? (
                  <Text
                    className="mt-3"
                    style={{
                      fontFamily: FONTS.displayLightItalic,
                      fontSize: 17,
                      color: colorWithOpacity(COLORS.parchment, 0.8),
                      lineHeight: 24,
                    }}>
                    "{dna!.lumi_insight}"
                  </Text>
                ) : null}
              </View>

              {/* Radar chart */}
              <SectionLabel className="mb-4">Family breakdown</SectionLabel>
              <View className="mb-2 items-center">
                <DNARadarChart families={allFamilies} size={280} />
              </View>

              {/* Collection summary */}
              <Text
                className="mt-4 text-center"
                style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                {items.length} bottle{items.length !== 1 ? 's' : ''} across {familyCount} famil{familyCount !== 1 ? 'ies' : 'y'}
              </Text>
            </>
          ) : (
            <View className="items-center justify-center gap-4 pt-16">
              <Lumi size={48} />
              <Text style={[TYPE.displayM, { color: COLORS.ink, textAlign: 'center' }]}>
                Add 3+ bottles to unlock your DNA
              </Text>
              <Button variant="outline" onPress={() => router.back()}>
                <Text style={{ fontFamily: FONTS.ui }}>Go back</Text>
              </Button>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
