import { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { IconArrowRight } from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { COLORS, FONTS } from '@/lib/theme';
import { RATINGS, RATING_CONFIG } from '@/data/ratings';

export default function WearingScreen() {
  const todayLog = useTodayStore((s) => s.todayLog);
  const suggestion = useTodayStore((s) => s.suggestion);
  const hasRated = useTodayStore((s) => s.hasRated());
  const { submitRating } = useToday();

  useEffect(() => {
    if (!todayLog?.worn_fragrance_id) router.replace('/(tabs)/today');
  }, [todayLog?.worn_fragrance_id]);

  if (!todayLog?.worn_fragrance_id) return null;

  const lumiLine = suggestion?.lumi_line ?? todayLog.lumi_suggestion_text;
  const house = suggestion?.fragrance_house ?? null;
  const name = suggestion?.fragrance_name ?? 'Unknown fragrance';
  const rating = todayLog.wear_rating;
  const ratingConfig = rating ? RATING_CONFIG[rating] : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader title="You're wearing" onBack={() => router.replace('/(tabs)/today')} />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}>
        {/* Fragrance */}
        <View className="mb-7 gap-1">
          {house ? (
            <Text
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
              {house}
            </Text>
          ) : null}
          <Text
            style={{
              fontFamily: FONTS.displayLightItalic,
              fontSize: 32,
              color: COLORS.ink,
              lineHeight: 38,
            }}>
            {name}
          </Text>
        </View>

        {/* Lumi tip card */}
        {lumiLine ? (
          <View className="mb-7 gap-2 rounded-2xl p-5" style={{ backgroundColor: COLORS.ink }}>
            <Text
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
              Lumi says
            </Text>
            <Text
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 18,
                color: COLORS.parchment,
                lineHeight: 26,
              }}>
              {lumiLine}
            </Text>
          </View>
        ) : null}

        {/* Micro-rating buttons */}
        {!hasRated && (
          <View className="mb-7 gap-2.5">
            <Text
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
              How did it wear?
            </Text>
            <View className="flex-row gap-2">
              {RATINGS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => submitRating(key)}
                  className="flex-1 items-center rounded-[10px] py-3 active:opacity-60"
                  style={{ backgroundColor: COLORS.linen }}>
                  <Text className="text-xs" style={{ fontFamily: FONTS.ui, color: COLORS.ink }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Rating confirmation */}
        {ratingConfig ? (
          <View className="flex-row items-center gap-2 border-t border-border py-4">
            <ratingConfig.Icon size={16} color={ratingConfig.color} strokeWidth={1.5} />
            <Text className="text-[13px]" style={{ fontFamily: FONTS.ui, color: COLORS.ash }}>
              {ratingConfig.label}
            </Text>
          </View>
        ) : null}

        {/* Layering teaser — only shown after rating */}
        {hasRated && (
          <Pressable
            onPress={() => router.push('/(tabs)/layer')}
            className="mt-6 gap-1.5 rounded-2xl p-4 active:opacity-70"
            style={{ backgroundColor: COLORS.linen }}>
            <Text
              className="text-[10px] uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
              Layer it
            </Text>
            <Text
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 17,
                color: COLORS.ink,
                lineHeight: 24,
              }}>
              Curious how this pairs with something else?
            </Text>
            <Text
              className="mt-0.5 text-[13px]"
              style={{ fontFamily: FONTS.ui, color: COLORS.amber }}>
              Open Layer →
            </Text>
          </Pressable>
        )}

        {/* This week link */}
        <Button
          variant="outline"
          className="mt-6"
          onPress={() => router.push('/(tabs)/today/week')}>
          <Text style={{ fontFamily: FONTS.ui }}>This week</Text>
          <IconArrowRight size={16} color={COLORS.ink} strokeWidth={1.5} />
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
