import { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ScreenHeader } from '@/components/ui/screen-header';
import { LumiQuote } from '@/components/ui/lumi-quote';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { COLORS, FONTS, TYPE } from '@/lib/theme';
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
        {/* Fragrance name */}
        <View className="mb-6 gap-1">
          {house ? (
            <Text
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
              {house}
            </Text>
          ) : null}
          <Text style={[TYPE.displayXL, { color: COLORS.ink }]}>
            {name}
          </Text>
        </View>

        {/* Lumi tip — wearing context */}
        {lumiLine ? (
          <View className="mb-6">
            <LumiQuote body={lumiLine} />
          </View>
        ) : null}

        {/* Rating — hero element */}
        <View className="mb-6 gap-3">
          <Text
            className="text-[10px] uppercase tracking-widest"
            style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
            How did it wear?
          </Text>
          {!hasRated ? (
            <View className="flex-row gap-2">
              {RATINGS.map(({ key, label, Icon }) => (
                <Pressable
                  key={key}
                  onPress={() => submitRating(key)}
                  className="flex-1 items-center gap-2 rounded-2xl py-5 active:opacity-60"
                  style={{ backgroundColor: COLORS.linen }}>
                  <Icon size={20} color={COLORS.ink} strokeWidth={1.5} />
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ink }}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : ratingConfig ? (
            <View
              className="flex-row items-center justify-center gap-2.5 rounded-2xl px-4 py-5"
              style={{ backgroundColor: COLORS.linen }}>
              <ratingConfig.Icon size={18} color={ratingConfig.color} strokeWidth={1.5} />
              <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.ink }}>
                {ratingConfig.label}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Layering teaser */}
        <Pressable
          onPress={() => router.push('/(tabs)/layer')}
          className="gap-1.5 rounded-2xl p-4 active:opacity-70"
          style={{ backgroundColor: COLORS.linen }}>
          <Text
            className="text-[10px] uppercase tracking-widest"
            style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash }}>
            Layer it
          </Text>
          <Text style={[TYPE.displayS, { color: COLORS.ink }]}>
            Curious how this pairs with something else?
          </Text>
          <Text
            className="mt-0.5 text-[13px]"
            style={{ fontFamily: FONTS.ui, color: COLORS.ink }}>
            Open Layer
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
