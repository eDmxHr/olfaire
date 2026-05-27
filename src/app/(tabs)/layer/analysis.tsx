import { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconAlertTriangle } from '@tabler/icons-react-native';
import { LumiThinking } from '@/components/lumi-thinking';
import { CompatibilityMeter } from '@/components/layer/compatibility-meter';
import { InteractionCard } from '@/components/layer/interaction-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Text } from '@/components/ui/text';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS, TYPE } from '@/lib/theme';

export default function AnalysisScreen() {
  const { selectedItems, analysis, isAnalysing, hasConflict } = useLayeringStore();
  const { analyse } = useLayering();

  const { bottom: bottomInset } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);

  useEffect(() => {
    if (selectedItems.length < 2) {
      router.back();
      return;
    }
    if (!analysis && !isAnalysing) analyse();
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Pressable style={{ flex: 1 }} onPress={() => sheetRef.current?.close()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        enablePanDownToClose
        enableContentPanningGesture={false}
        onClose={handleClose}
        backgroundStyle={{ backgroundColor: COLORS.ink, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: COLORS.ash }}>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 48 + bottomInset,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}>
          {/* ── Loading ── */}
          {isAnalysing && (
            <View className="mt-16">
              <LumiThinking wingColor={COLORS.parchment} veinColor={COLORS.ink} />
            </View>
          )}

          {/* ── Results ── */}
          {analysis && !isAnalysing && (
            <>
              <CompatibilityMeter
                score={analysis.compatibility_score}
                label={analysis.overall_character}
                fragNames={
                  selectedItems[0]?.fragrance && selectedItems[1]?.fragrance
                    ? `${(selectedItems[0].fragrance as any).name} × ${(selectedItems[1].fragrance as any).name}`
                    : undefined
                }
              />

              {/* Lumi summary */}
              <View className="mb-4 gap-1.5">
                <SectionLabel>Lumi says</SectionLabel>
                <Text style={[TYPE.displayM, { color: COLORS.parchment }]}>
                  {analysis.lumi_summary}
                </Text>
              </View>

              {/* Conflict callout */}
              {hasConflict() && analysis.lumi_warning && (
                <View
                  className="mb-4 flex-row items-start gap-2 rounded-lg p-3"
                  style={{ backgroundColor: COLORS.inkRaised }}>
                  <IconAlertTriangle
                    size={13}
                    color={COLORS.amber}
                    strokeWidth={1.5}
                    style={{ marginTop: 2 }}
                  />
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: FONTS.ui,
                      fontSize: 12,
                      color: COLORS.ash,
                      lineHeight: 18,
                    }}>
                    {analysis.lumi_warning}
                  </Text>
                </View>
              )}

              <View className="mb-1 mt-2" style={{ height: 1, backgroundColor: COLORS.inkRaised }} />

              {/* Note interactions — collapsed by default */}
              <Accordion type="single" collapsible>
                <AccordionItem value="interactions" className="border-0">
                  <AccordionTrigger>
                    <View className="flex-row items-center gap-2">
                      <Text
                        style={{
                          fontFamily: FONTS.uiMedium,
                          fontSize: 13,
                          color: COLORS.parchment,
                        }}>
                        Note interactions
                      </Text>
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: COLORS.inkRaised }}>
                        <Text
                          style={{ fontFamily: FONTS.uiMedium, fontSize: 10, color: COLORS.ash }}>
                          {analysis.interactions.slice(0, 4).length}
                        </Text>
                      </View>
                    </View>
                  </AccordionTrigger>
                  <AccordionContent>
                    <View className="pt-2">
                      {analysis.interactions.slice(0, 4).map((interaction, i) => (
                        <InteractionCard key={i} interaction={interaction} />
                      ))}
                    </View>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <View className="mb-6 mt-1" style={{ height: 1, backgroundColor: COLORS.inkRaised }} />

              {/* CTAs */}
              <View className="gap-3">
                <Pressable
                  onPress={() => router.push('/(tabs)/layer/application')}
                  className="items-center rounded-[10px] py-3.5"
                  style={{ backgroundColor: COLORS.amber }}>
                  <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
                    Application guide
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/(tabs)/layer/signature')}
                  className="items-center rounded-[10px] py-3.5"
                  style={{ backgroundColor: COLORS.inkRaised }}>
                  <Text
                    style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.parchment }}>
                    Save as signature
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
