import { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { IconSettings, IconCheck } from '@tabler/icons-react-native';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/Collectionstore';
import { useLayeringStore } from '@/store/LayeringStore';
import { useTodayStore } from '@/store/TodayStore';
import { useCollection } from '@/hooks/useCollection';
import { COLORS, FONTS } from '@/lib/theme';

export default function ProfileScreen() {
  const profile = useAuthStore((s) => s.profile);
  const dna = useCollectionStore((s) => s.dna);
  const items = useCollectionStore((s) => s.items);
  const signatures = useLayeringStore((s) => s.signatures);
  const todayLog = useTodayStore((s) => s.todayLog);
  const { fetchDNA, computeAndSaveDNA } = useCollection();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
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
  const topFamilies = hasDNA
    ? Object.entries(dna!.families)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  const isNewUser = signatures.length === 0;

  const checklistItems = [
    {
      label: 'Add your first bottle',
      done: items.length > 0,
      route: '/(tabs)/collection' as const,
    },
    { label: 'Choose a mood', done: !!todayLog?.mood, route: '/(tabs)/today' as const },
    { label: 'Try layering', done: signatures.length > 0, route: '/(tabs)/layer' as const },
  ];

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
              <AvatarFallback className="size-12 items-center justify-center rounded-full bg-secondary">
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
            <Text
              className="uppercase tracking-widest"
              style={{
                fontFamily: FONTS.uiMedium,
                fontSize: 10,
                color: COLORS.ash,
                letterSpacing: 1,
              }}>
              Fragrance DNA
            </Text>

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
                      <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                        {family}
                      </Text>
                      <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 11, color: COLORS.ash }}>
                        {Math.round(score)}
                      </Text>
                    </View>
                    <View
                      className="rounded-full"
                      style={{ height: 3, backgroundColor: COLORS.ash + '30' }}>
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
                  style={{ backgroundColor: COLORS.ash + '30' }}>
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
            <Text
              className="uppercase tracking-widest"
              style={{
                fontFamily: FONTS.uiMedium,
                fontSize: 10,
                color: COLORS.ash,
                letterSpacing: 1,
              }}>
              Signatures
            </Text>
            {signatures.length >= 3 && (
              <Pressable onPress={() => router.push('/(tabs)/profile/signatures')}>
                <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 12, color: COLORS.amber }}>
                  View all
                </Text>
              </Pressable>
            )}
          </View>

          {!isNewUser ? (
            signatures.slice(0, 3).map((sig) => {
              const date = new Date(sig.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              return (
                <Pressable
                  key={sig.id}
                  onPress={() => router.push(`/modals/signature-share?signatureId=${sig.id}`)}
                  className="mb-2 rounded-[10px] px-3.5 py-3"
                  style={{ backgroundColor: COLORS.linen }}>
                  <View className="flex-row items-start justify-between">
                    <Text
                      className="flex-1"
                      style={{ fontFamily: FONTS.uiMedium, fontSize: 14, color: COLORS.ink }}>
                      {sig.name}
                    </Text>
                    <Text
                      className="ml-2"
                      style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                      {date}
                    </Text>
                  </View>
                  {sig.tags.length > 0 && (
                    <View className="mt-1.5 flex-row flex-wrap gap-1.5">
                      {sig.tags.map((tag) => (
                        <View
                          key={tag}
                          className="rounded-full px-2 py-0.5"
                          style={{ backgroundColor: COLORS.parchment }}>
                          <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })
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
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
