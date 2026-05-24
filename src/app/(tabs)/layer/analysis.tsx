import { useEffect } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconAlertTriangle } from '@tabler/icons-react-native';
import { Lumi } from '@/components/lumi';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SpinningLoader } from '@/components/spinning-loader';
import { Text } from '@/components/ui/text';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { COLORS, FONTS } from '@/lib/theme';

// ── Constants ────────────────────────────────────────────────────────────────

const INK_RAISED = '#2A2724';

type InteractionType = 'anchor' | 'amplify' | 'contrast' | 'neutral';

const INTERACTION_COLORS: Record<InteractionType, string> = {
  anchor: COLORS.amber,
  amplify: '#6B8F6B',
  contrast: '#8F6B6B',
  neutral: INK_RAISED,
};

// ── InteractionCard ──────────────────────────────────────────────────────────

interface NoteInteraction {
  note_a: string;
  note_b: string;
  type: InteractionType;
  explanation: string;
}

function InteractionCard({ interaction }: { interaction: NoteInteraction }) {
  const badgeColor = INTERACTION_COLORS[interaction.type];
  const isNeutral = interaction.type === 'neutral';

  return (
    <View className="mb-4">
      <View className="flex-row flex-wrap items-center gap-2">
        <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.parchment }}>
          {interaction.note_a}
        </Text>
        <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>×</Text>
        <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.parchment }}>
          {interaction.note_b}
        </Text>
        <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: badgeColor }}>
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: isNeutral ? COLORS.ash : '#fff',
            }}>
            {interaction.type}
          </Text>
        </View>
      </View>
      <Text
        className="mt-1"
        style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash, lineHeight: 18 }}>
        {interaction.explanation}
      </Text>
    </View>
  );
}

// ── AnalysisScreen ───────────────────────────────────────────────────────────

export default function AnalysisScreen() {
  const { selectedItems, analysis, isAnalysing, hasConflict } = useLayeringStore();
  const { analyse } = useLayering();

  useEffect(() => {
    if (selectedItems.length < 2) {
      router.back();
      return;
    }
    if (!analysis && !isAnalysing) analyse();
  }, []);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: COLORS.ink }} edges={['top']}>
      <ScreenHeader title="Chemistry" onBack={() => router.back()} tint={COLORS.parchment} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        {/* ── Loading ── */}
        {isAnalysing && (
          <View className="mt-16 items-center gap-5">
            <SpinningLoader size={24} color={COLORS.ash} />
            <Lumi size={48} wingColor={COLORS.parchment} veinColor={COLORS.ink} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
              Lumi is analysing…
            </Text>
          </View>
        )}

        {/* ── Results ── */}
        {analysis && !isAnalysing && (
          <>
            {/* Score block */}
            <View className="mb-8 mt-4 items-center gap-1">
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 80,
                  color: COLORS.parchment,
                  lineHeight: 88,
                }}>
                {analysis.compatibility_score}
              </Text>
              <Text
                className="uppercase tracking-widest"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 11,
                  color: COLORS.ash,
                  letterSpacing: 1.2,
                }}>
                {analysis.overall_character}
              </Text>
              {/* Amber accent line */}
              <View
                className="mt-3 rounded-full"
                style={{ width: 40, height: 2, backgroundColor: COLORS.amber }}
              />
            </View>

            {/* Lumi summary */}
            <View className="mb-6 gap-1.5">
              <Text
                className="uppercase tracking-widest"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 1,
                }}>
                Lumi says
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 18,
                  color: COLORS.parchment,
                  lineHeight: 26,
                }}>
                {analysis.lumi_summary}
              </Text>
            </View>

            {/* Divider */}
            <View className="my-6" style={{ height: 1, backgroundColor: INK_RAISED }} />

            {/* Note interactions */}
            <View className="mb-2">
              <Text
                className="mb-3 uppercase tracking-widest"
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 1,
                }}>
                Note interactions
              </Text>
              {analysis.interactions.slice(0, 4).map((interaction, i) => (
                <InteractionCard key={i} interaction={interaction} />
              ))}
            </View>

            {/* Divider */}
            <View className="my-6" style={{ height: 1, backgroundColor: INK_RAISED }} />

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
                style={{ backgroundColor: INK_RAISED }}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.parchment }}>
                  Save as signature
                </Text>
              </Pressable>

              {hasConflict() && (
                <Pressable
                  onPress={() => router.push('/(tabs)/layer/conflict')}
                  className="flex-row items-center justify-center gap-2 py-3">
                  <IconAlertTriangle size={14} color={COLORS.red} strokeWidth={1.5} />
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.red }}>
                    View conflict warning
                  </Text>
                </Pressable>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
