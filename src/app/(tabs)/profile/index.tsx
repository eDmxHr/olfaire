import { useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated from 'react-native-reanimated';
import { IconSettings, IconCheck } from '@tabler/icons-react-native';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/Collectionstore';
import { useLayeringStore } from '@/store/LayeringStore';
import { useTodayStore } from '@/store/TodayStore';
import { useCollection } from '@/hooks/useCollection';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { SectionLabel } from '@/components/ui/section-label';
import { SignatureCard } from '@/components/ui/signature-card';
import { COLORS, FONTS, colorWithOpacity } from '@/lib/theme';

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const dna = useCollectionStore((s) => s.dna);
  const items = useCollectionStore((s) => s.items);
  const signatures = useLayeringStore((s) => s.signatures);
  const todayLog = useTodayStore((s) => s.todayLog);
  const { fetchDNA, computeAndSaveDNA } = useCollection();

  const { animStyle, trigger } = useScreenAnimation(16);

  useEffect(() => {
    trigger();
    fetchDNA().then(() => {
      const currentDNA = useCollectionStore.getState().dna;
      const noFamilies = !currentDNA || Object.keys(currentDNA.families ?? {}).length === 0;
      const noInsight = !currentDNA?.lumi_insight;
      if (noFamilies || noInsight) computeAndSaveDNA();
    });
  }, []);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  const hasDNA = dna && Object.keys(dna.families ?? {}).length > 0;

  const topFamilies = useMemo(
    () =>
      hasDNA
        ? Object.entries(dna!.families).sort(([, a], [, b]) => b - a).slice(0, 3)
        : [],
    [dna, hasDNA]
  );

  const isNewUser = signatures.length === 0;

  const mostWorn = useMemo(
    () =>
      [...items]
        .filter((i) => i.wear_count > 0)
        .sort((a, b) => b.wear_count - a.wear_count)
        .slice(0, 3),
    [items]
  );

  const checklistItems = useMemo(
    () => [
      { label: 'Add your first bottle', done: items.length > 0, route: '/(tabs)/collection' as const },
      { label: 'Choose a mood', done: !!todayLog?.mood, route: '/(tabs)/today' as const },
      { label: 'Try layering', done: signatures.length > 0, route: '/(tabs)/layer' as const },
    ],
    [items.length, todayLog?.mood, signatures.length]
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={animStyle}>
          {/* ── Header row ── */}
          <View className="mt-5 flex-row items-center">
            <Avatar alt={profile?.display_name ?? 'Avatar'} className="size-12 rounded-full">
              {profile?.avatar_url ? <AvatarImage source={{ uri: profile.avatar_url }} /> : null}
              <AvatarFallback className="size-12 items-center justify-center rounded-full">
                <Text
                  style={{
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 22,
                    color: COLORS.amber,
                  }}>
                  {profile?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </AvatarFallback>
            </Avatar>

            <View className="ml-3 flex-1">
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 22,
                  color: COLORS.ink,
                  lineHeight: 28,
                }}>
                {profile?.display_name ?? ''}
              </Text>
              {memberSince && (
                <Text
                  className="mt-0.5 text-xs text-muted-foreground"
                  style={{ fontFamily: FONTS.ui }}>
                  Member since {memberSince}
                </Text>
              )}
            </View>

            <Pressable onPress={() => router.push('/(tabs)/profile/settings')} hitSlop={8}>
              <IconSettings size={24} color={COLORS.ash} strokeWidth={1.5} />
            </Pressable>
          </View>

          {/* ── DNA card (dark) ── */}
          <View className="mt-5 rounded-2xl p-4" style={{ backgroundColor: COLORS.ink }}>
            <SectionLabel>Fragrance DNA</SectionLabel>

            {hasDNA ? (
              <>
                <Text
                  className="mt-1"
                  style={{
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 20,
                    color: COLORS.parchment,
                  }}>
                  {dna!.dominant_family}
                </Text>

                {topFamilies.map(([family, score]) => (
                  <View key={family} className="mt-3">
                    <View className="mb-1.5 flex-row items-center justify-between">
                      <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                        {family}
                      </Text>
                      <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.ash }}>
                        {Math.round(score)}
                      </Text>
                    </View>
                    <View
                      className="rounded-full"
                      style={{ height: 3, backgroundColor: colorWithOpacity(COLORS.ash, 0.19) }}>
                      <View
                        className="rounded-full"
                        style={{
                          height: 3,
                          backgroundColor: COLORS.amber,
                          width: `${Math.min(score, 100)}%`,
                        }}
                      />
                    </View>
                  </View>
                ))}

                {dna!.lumi_insight ? (
                  <Text
                    className="mt-3"
                    style={{
                      fontFamily: FONTS.displayLightItalic,
                      fontSize: 17,
                      color: COLORS.parchment,
                      lineHeight: 24,
                    }}>
                    "{dna!.lumi_insight}"
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text
                  className="mt-1.5 text-sm leading-5"
                  style={{ fontFamily: FONTS.ui, color: COLORS.ash }}>
                  Add 3+ bottles to unlock your DNA profile
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/collection')}
                  className="mt-3 self-start rounded-full px-3.5 py-1.5"
                  style={{ backgroundColor: colorWithOpacity(COLORS.ash, 0.19) }}>
                  <Text
                    style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.parchment }}>
                    Build collection
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {/* ── Signatures header ── */}
          <View className="mb-2.5 mt-7 flex-row items-center justify-between">
            <SectionLabel>Signatures</SectionLabel>
            {signatures.length >= 3 && (
              <Pressable onPress={() => router.push('/(tabs)/profile/signatures')}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.amber }}>
                  View all
                </Text>
              </Pressable>
            )}
          </View>

          {!isNewUser ? (
            signatures
              .slice(0, 3)
              .map((sig) => (
                <SignatureCard
                  key={sig.id}
                  signature={sig}
                  nameSize={14}
                  onPress={() => router.push(`/modals/signature-share?signatureId=${sig.id}`)}
                />
              ))
          ) : (
            /* Getting started checklist */
            <View className="rounded-2xl p-4" style={{ backgroundColor: COLORS.linen }}>
              <Text
                className="mb-3.5"
                style={{ fontFamily: FONTS.displayLightItalic, fontSize: 18, color: COLORS.ink }}>
                Getting started
              </Text>
              {checklistItems.map((item) => (
                <Pressable
                  key={item.label}
                  onPress={() => router.push(item.route)}
                  className="mb-3 flex-row items-center gap-3">
                  <View
                    className="items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: item.done ? COLORS.amber : 'transparent',
                      borderWidth: item.done ? 0 : 1.5,
                      borderColor: COLORS.dust,
                    }}>
                    {item.done && (
                      <IconCheck size={12} color={COLORS.parchment} strokeWidth={2.5} />
                    )}
                  </View>
                  <Text
                    style={{
                      fontFamily: FONTS.ui,
                      fontSize: 14,
                      color: item.done ? COLORS.ink : COLORS.ash,
                    }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Most worn ── */}
          {mostWorn.length > 0 && (
            <>
              <SectionLabel className="mb-2.5 mt-7">Most worn</SectionLabel>
              <View className="overflow-hidden rounded-2xl bg-secondary">
                {mostWorn.map((item, index) => {
                  const frag = item.fragrance;
                  const isLast = index === mostWorn.length - 1;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push(`/collection/${item.id}` as any)}
                      className="flex-row items-center px-4 py-3.5"
                      style={{
                        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                        borderBottomColor: COLORS.dust,
                      }}>
                      <View className="flex-1">
                        <Text
                          style={{
                            fontFamily: FONTS.displayLightItalic,
                            fontSize: 16,
                            lineHeight: 20,
                            color: COLORS.ink,
                          }}>
                          {frag?.name ?? '—'}
                        </Text>
                        {frag?.house ? (
                          <Text
                            className="mt-0.5"
                            style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                            {frag.house}
                          </Text>
                        ) : null}
                      </View>
                      <View
                        className="rounded-full px-2.5 py-0.5"
                        style={{ backgroundColor: colorWithOpacity(COLORS.amber, 0.13) }}>
                        <Text
                          style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.amber }}>
                          {item.wear_count}×
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
