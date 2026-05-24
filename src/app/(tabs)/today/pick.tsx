import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { IconRefresh } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { NotesPyramid } from '@/components/today/notes-pyramid';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';
import { RATINGS } from '@/data/ratings';
import { SpinningLoader } from '@/components/spinning-loader';
import type { Fragrance } from '@/lib/supabase';

export default function PickScreen() {
  const suggestion = useTodayStore((s) => s.suggestion);
  const { confirmWearing, requestAnother, submitRating } = useToday();
  const [fragrance, setFragrance] = useState<Fragrance | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigatedBack, setNavigatedBack] = useState(false);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['92%'], []);

  useEffect(() => {
    if (!suggestion && !navigatedBack) router.back();
  }, [suggestion]);

  useEffect(() => {
    if (!suggestion) return;
    (async () => {
      setLoading(true);
      try {
        const { data } = await (supabase as any)
          .from('fragrances')
          .select('*')
          .eq('id', suggestion.fragrance_id)
          .single();
        if (data) setFragrance(data as Fragrance);
      } finally {
        setLoading(false);
      }
    })();
  }, [suggestion?.fragrance_id]);

  const handleSheetClose = useCallback(() => {
    if (!navigatedBack) router.back();
  }, [navigatedBack]);

  if (!suggestion) return null;

  async function handleWearThis() {
    await confirmWearing(suggestion!.fragrance_id);
  }

  async function handleSuggestAnother() {
    setNavigatedBack(true);
    sheetRef.current?.close();
    router.back();
    await requestAnother();
  }

  const isWearing = useTodayStore((s) => s.isWearing());
  const hasRated = useTodayStore((s) => s.hasRated());
  const wearRating = useTodayStore((s) => s.todayLog?.wear_rating ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      {/* Tappable backdrop */}
      <Pressable style={{ flex: 1 }} onPress={() => sheetRef.current?.close()} />
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={handleSheetClose}
        backgroundStyle={{ backgroundColor: COLORS.ink, borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: COLORS.ash }}>
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}>
          {/* House + Name + Identity metadata */}
          <View style={{ gap: 4, marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: FONTS.uiMedium,
                fontSize: 10,
                color: COLORS.ash,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
              }}>
              {suggestion.fragrance_house}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 30,
                color: COLORS.parchment,
                lineHeight: 36,
              }}>
              {suggestion.fragrance_name}
            </Text>

            {/* Family · concentration · longevity · sillage */}
            {fragrance && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 6,
                  flexWrap: 'wrap',
                }}>
                {[fragrance.family, fragrance.concentration].filter(Boolean).map((item, i) => (
                  <Text
                    key={item}
                    style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                    {i > 0 ? `· ${item}` : item}
                  </Text>
                ))}
                {(fragrance.longevity || fragrance.sillage) && (
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>·</Text>
                )}
                {fragrance.longevity != null && (
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                    Longevity {fragrance.longevity}/5
                  </Text>
                )}
                {fragrance.sillage != null && (
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                    · Sillage {fragrance.sillage}/5
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Lumi's line */}
          <Text
            style={{
              fontFamily: FONTS.ui,
              fontSize: 14,
              color: COLORS.amber,
              lineHeight: 22,
              marginBottom: 16,
            }}>
            {suggestion.lumi_line}
          </Text>

          {/* Reasoning tags */}
          {suggestion.reasoning_tags?.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
              {suggestion.reasoning_tags.map((tag) => (
                <View
                  key={tag}
                  style={{
                    backgroundColor: '#2A2724',
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}>
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                    {tag.replace(/-/g, ' ')}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#2A2724', marginBottom: 24 }} />

          {/* Notes pyramid */}
          {loading ? (
            <View style={{ alignItems: 'center', marginVertical: 24 }}>
              <SpinningLoader size={20} color={COLORS.ash} />
            </View>
          ) : fragrance ? (
            <>
              <NotesPyramid
                top={fragrance.notes_top ?? []}
                heart={fragrance.notes_heart ?? []}
                base={fragrance.notes_base ?? []}
              />
            </>
          ) : null}

          {/* CTAs */}
          <View style={{ gap: 12, marginTop: 36 }}>
            {!isWearing && !hasRated && (
              <>
                <Pressable
                  onPress={handleWearThis}
                  style={{
                    backgroundColor: COLORS.amber,
                    borderRadius: 10,
                    paddingVertical: 14,
                    alignItems: 'center',
                  }}>
                  <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
                    Wearing this today
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSuggestAnother}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 10,
                  }}>
                  <IconRefresh size={14} color={COLORS.ash} strokeWidth={1.5} />
                  <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                    Show me another
                  </Text>
                </Pressable>
              </>
            )}

            {isWearing && !hasRated && (
              <View style={{ gap: 10 }}>
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
                      onPress={async () => {
                        await submitRating(key);
                        setNavigatedBack(true);
                        sheetRef.current?.close();
                        router.replace('/(tabs)/today/wearing');
                      }}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderRadius: 10,
                        backgroundColor: '#2A2724',
                      }}>
                      <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.parchment }}>
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {hasRated && wearRating && (
              <Text
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 13,
                  color: COLORS.ash,
                  textAlign: 'center',
                }}>
                {wearRating === 'loved'
                  ? 'Logged as a favourite'
                  : wearRating === 'neutral'
                    ? 'Logged as neutral'
                    : 'Noted for next time'}
              </Text>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
