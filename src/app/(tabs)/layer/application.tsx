import { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { BodyMap } from '@/components/layer/body-map';
import { useLayeringStore } from '@/store/LayeringStore';
import { SectionLabel } from '@/components/ui/section-label';
import { COLORS, FONTS, TYPE } from '@/lib/theme';

function parseRatio(ratio: string): [number, number] {
  const colon = ratio.match(/(\d+)\s*:\s*(\d+)/);
  if (colon) return [+colon[1], +colon[2]];
  const nums = [...ratio.matchAll(/(\d+)/g)].map((m) => +m[1]);
  if (nums.length >= 2) return [nums[0], nums[1]];
  return [1, 1];
}

export default function ApplicationScreen() {
  const { analysis, selectedItems } = useLayeringStore();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();

  useEffect(() => {
    if (!analysis) router.back();
  }, []);

  if (!analysis) return null;

  const application = analysis.application;
  const [r1, r2] = parseRatio(application.ratio);

  const waitLabel =
    application.wait_seconds < 60
      ? `${application.wait_seconds}s`
      : `${Math.round(application.wait_seconds / 60)} min`;

  const STEPS = [
    { num: 1, title: `Apply ${application.first}`, detail: application.placement_first },
    {
      num: 2,
      title: `Wait ${waitLabel}`,
      detail: 'Let the base settle before adding the next layer.',
    },
    { num: 3, title: `Apply ${application.second}`, detail: application.placement_second },
  ];

  return (
    <View
      className="flex-1 overflow-hidden"
      style={{
        backgroundColor: COLORS.ink,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: topInset,
      }}>
      <ScreenHeader title="Application guide" tint={COLORS.parchment} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 + bottomInset }}
        showsVerticalScrollIndicator={false}>
        {/* ── Section A: Body map ── */}
        <SectionLabel className="mb-4 mt-2">Where to apply</SectionLabel>

        <BodyMap
          placementFirst={application.placement_first}
          placementSecond={application.placement_second}
        />

        {/* Legend */}
        <View className="items-center justify-center gap-1">
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.amber }} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.parchment }}>
              {application.first}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.ash }} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
              {application.second}
            </Text>
          </View>
        </View>

        <View className="my-5 h-px" style={{ backgroundColor: COLORS.inkRaised }} />

        {/* ── Section B: Ratio bar ── */}
        <SectionLabel className="mb-1.5">Ratio</SectionLabel>
        <Text className="mb-2.5" style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
          {application.ratio}
        </Text>
        <View className="h-2 flex-row gap-0.5 overflow-hidden rounded">
          <View className="rounded" style={{ flex: r1, backgroundColor: COLORS.amber }} />
          <View className="rounded" style={{ flex: r2, backgroundColor: COLORS.inkRaised }} />
        </View>
        <View className="mt-1.5 flex-row">
          <View className="flex-1" style={{ flex: r1 }}>
            <Text
              style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.parchment }}
              numberOfLines={1}>
              {application.first}
            </Text>
          </View>
          <View className="items-end" style={{ flex: r2 }}>
            <Text
              style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.ash }}
              numberOfLines={1}>
              {application.second}
            </Text>
          </View>
        </View>

        <View className="my-5 h-px" style={{ backgroundColor: COLORS.inkRaised }} />

        {/* ── Section C: Steps ── */}
        <SectionLabel className="mb-3">How to apply</SectionLabel>
        <View className="gap-2.5">
          {STEPS.map((step) => (
            <View
              key={step.num}
              className="flex-row items-start gap-3 rounded-xl p-4"
              style={{ backgroundColor: COLORS.inkRaised }}>
              <View
                className="mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.amber }}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.ink }}>
                  {step.num}
                </Text>
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.parchment }}>
                  {step.title}
                </Text>
                <Text
                  className="mt-0.5"
                  style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash, lineHeight: 18 }}>
                  {step.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="my-5 h-px" style={{ backgroundColor: COLORS.inkRaised }} />

        {/* ── Section D: Lumi tip ── */}
        <View className="gap-1.5 rounded-2xl p-4" style={{ backgroundColor: COLORS.inkRaised }}>
          <SectionLabel>Lumi says</SectionLabel>
          <Text style={[TYPE.displayS, { color: COLORS.parchment }]}>
            {analysis.lumi_summary}
          </Text>
        </View>
      </ScrollView>

      {/* ── Absolute CTA ── */}
      <View className="absolute left-6 right-6" style={{ bottom: 6 + bottomInset }}>
        <Pressable
          onPress={() => router.push('/(tabs)/layer/signature')}
          className="items-center rounded-xl py-3.5"
          style={{ backgroundColor: COLORS.amber }}>
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
            Save as signature
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
