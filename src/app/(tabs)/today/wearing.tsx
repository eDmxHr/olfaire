import { useEffect } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/ui/text';
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
  const house = suggestion?.fragrance_house ?? '';
  const name = suggestion?.fragrance_name ?? '';
  const rating = todayLog.wear_rating;
  const ratingConfig = rating ? RATING_CONFIG[rating] : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScreenHeader
        title="You're wearing"
        onBack={() => router.replace('/(tabs)/today')}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-12"
        showsVerticalScrollIndicator={false}>

        {/* Fragrance */}
        <View className="mb-7 gap-1">
          {house ? (
            <Text
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash, letterSpacing: 1.2 }}>
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
              style={{ fontFamily: FONTS.uiMedium, color: COLORS.ash, letterSpacing: 1 }}>
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
          <View style={{ gap: 10, marginBottom: 28 }}>
            <Text
              style={{
                fontFamily: FONTS.uiMedium,
                fontSize: 10,
                color: COLORS.ash,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
              How did it wear?
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {RATINGS.map(({ key, label }) => (
                <Pressable
                  key={key}
                  onPress={() => submitRating(key)}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: COLORS.linen,
                  }}>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ink }}>
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
            <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
              {ratingConfig.label}
            </Text>
          </View>
        ) : null}

        {/* Layering teaser */}
        <Pressable
          onPress={() => router.push('/(tabs)/layer')}
          style={{
            marginTop: 24,
            marginBottom: 8,
            padding: 16,
            borderRadius: 16,
            backgroundColor: COLORS.linen,
            gap: 6,
          }}>
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
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
          <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.amber, marginTop: 2 }}>
            Open Layer →
          </Text>
        </Pressable>

        {/* This week link */}
        <Pressable
          onPress={() => router.push('/(tabs)/today/week')}
          className="mt-6 items-center py-2">
          <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
            This week →
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
