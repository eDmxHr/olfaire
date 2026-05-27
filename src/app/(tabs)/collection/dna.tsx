import { useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { Lumi } from '@/components/lumi';
import { Button } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
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
    ? Object.entries(dna!.families).sort(([, a], [, b]) => b - a)
    : [];
  const familyCount = allFamilies.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Fragrance DNA" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[animStyle, { overflow: 'visible' }]}>

          {hasDNA ? (
            <>
              {/* Dominant family hero */}
              <View style={{ backgroundColor: COLORS.ink, borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <SectionLabel>Your signature</SectionLabel>
                <Text style={[TYPE.displayL, { color: COLORS.parchment, marginTop: 4 }]}>
                  {dna!.dominant_family}
                </Text>
                {dna!.lumi_insight ? (
                  <Text
                    style={{
                      fontFamily: FONTS.displayLightItalic,
                      fontSize: 17,
                      color: COLORS.parchment,
                      lineHeight: 24,
                      marginTop: 12,
                      opacity: 0.8,
                    }}>
                    "{dna!.lumi_insight}"
                  </Text>
                ) : null}
              </View>

              {/* Section label */}
              <SectionLabel className="mb-4">Family breakdown</SectionLabel>

              {/* All family bars */}
              <View style={{ gap: 16 }}>
                {allFamilies.map(([family, score]) => (
                  <View key={family}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ink }}>
                        {family}
                      </Text>
                      <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.ash }}>
                        {Math.round(score)}
                      </Text>
                    </View>
                    <View style={{ height: 3, backgroundColor: colorWithOpacity(COLORS.ash, 0.19), borderRadius: 99 }}>
                      <View
                        style={{
                          height: 3,
                          backgroundColor: COLORS.amber,
                          borderRadius: 99,
                          width: `${Math.min(score, 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Collection summary */}
              <Text
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 13,
                  color: COLORS.ash,
                  marginTop: 24,
                  textAlign: 'center',
                }}>
                {items.length} bottle{items.length !== 1 ? 's' : ''} across {familyCount} famil{familyCount !== 1 ? 'ies' : 'y'}
              </Text>
            </>
          ) : (
            /* Empty state */
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 16 }}>
              <Lumi size={48} />
              <Text style={[TYPE.displayM, { color: COLORS.ink, textAlign: 'center' }]}>
                Add 3+ bottles to unlock your DNA
              </Text>
              <Button variant="outline" onPress={() => router.back()}>
                <Text style={{ fontFamily: FONTS.ui }}>Go to collection</Text>
              </Button>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
