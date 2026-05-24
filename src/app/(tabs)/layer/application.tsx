import { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { BodyMap } from '@/components/layer/body-map';
import { useLayeringStore } from '@/store/LayeringStore';
import { COLORS, FONTS } from '@/lib/theme';

const INK_RAISED = '#2A2724';

function parseRatio(ratio: string): [number, number] {
  const colon = ratio.match(/(\d+)\s*:\s*(\d+)/);
  if (colon) return [+colon[1], +colon[2]];
  const nums = [...ratio.matchAll(/(\d+)/g)].map((m) => +m[1]);
  if (nums.length >= 2) return [nums[0], nums[1]];
  return [1, 1];
}

export default function ApplicationScreen() {
  const { analysis, selectedItems } = useLayeringStore();
  const { bottom: bottomInset } = useSafeAreaInsets();

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
    { num: 2, title: `Wait ${waitLabel}`, detail: 'Let the base settle before adding the next layer.' },
    { num: 3, title: `Apply ${application.second}`, detail: application.placement_second },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.ink }} edges={['top']}>
      <ScreenHeader title="Application guide" tint={COLORS.parchment} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 + bottomInset }}
        showsVerticalScrollIndicator={false}>

        {/* ── Section A: Body map ── */}
        <Text
          style={{
            fontFamily: FONTS.uiMedium,
            fontSize: 10,
            color: COLORS.ash,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 16,
            marginTop: 8,
          }}>
          Where to apply
        </Text>

        <BodyMap
          placementFirst={application.placement_first}
          placementSecond={application.placement_second}
        />

        {/* Legend */}
        <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'center', marginTop: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.amber }} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.parchment }}>
              {application.first}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.ash }} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
              {application.second}
            </Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: INK_RAISED, marginVertical: 20 }} />

        {/* ── Section B: Ratio bar ── */}
        <Text
          style={{
            fontFamily: FONTS.uiMedium,
            fontSize: 10,
            color: COLORS.ash,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
          Ratio
        </Text>
        <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash, marginBottom: 10 }}>
          {application.ratio}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            gap: 2,
          }}>
          <View style={{ flex: r1, backgroundColor: COLORS.amber, borderRadius: 4 }} />
          <View style={{ flex: r2, backgroundColor: INK_RAISED, borderRadius: 4 }} />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 6 }}>
          <View style={{ flex: r1 }}>
            <Text
              style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.parchment }}
              numberOfLines={1}>
              {application.first}
            </Text>
          </View>
          <View style={{ flex: r2, alignItems: 'flex-end' }}>
            <Text
              style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.ash }}
              numberOfLines={1}>
              {application.second}
            </Text>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: INK_RAISED, marginVertical: 20 }} />

        {/* ── Section C: Steps ── */}
        <Text
          style={{
            fontFamily: FONTS.uiMedium,
            fontSize: 10,
            color: COLORS.ash,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
          How to apply
        </Text>
        <View style={{ gap: 10 }}>
          {STEPS.map((step) => (
            <View
              key={step.num}
              style={{
                backgroundColor: INK_RAISED,
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                gap: 12,
                alignItems: 'flex-start',
              }}>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: COLORS.amber,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.ink }}>
                  {step.num}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.parchment }}>
                  {step.title}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: 13,
                    color: COLORS.ash,
                    marginTop: 3,
                    lineHeight: 18,
                  }}>
                  {step.detail}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: INK_RAISED, marginVertical: 20 }} />

        {/* ── Section D: Lumi tip ── */}
        <View style={{ backgroundColor: INK_RAISED, borderRadius: 16, padding: 16, gap: 6 }}>
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
            Lumi says
          </Text>
          <Text
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 17,
              color: COLORS.parchment,
              lineHeight: 26,
            }}>
            {analysis.lumi_summary}
          </Text>
        </View>
      </ScrollView>

      {/* ── Absolute CTA ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 6 + bottomInset,
          left: 24,
          right: 24,
        }}>
        <Pressable
          onPress={() => router.push('/(tabs)/layer/signature')}
          style={{
            backgroundColor: COLORS.amber,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
            Save as signature
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
