import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconChevronLeft, IconRefresh } from '@tabler/icons-react-native';
import { Text } from '@/components/ui/text';
import { NotesPyramid } from '@/components/today/notes-pyramid';
import { useTodayStore } from '@/store/TodayStore';
import { useToday } from '@/hooks/useToday';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';
import type { Fragrance } from '@/lib/supabase';

export default function PickScreen() {
  const suggestion = useTodayStore((s) => s.suggestion);
  const { confirmWearing, requestAnother } = useToday();
  const [fragrance, setFragrance] = useState<Fragrance | null>(null);
  const [loading, setLoading] = useState(true);

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

  const [navigatedBack, setNavigatedBack] = useState(false);

  useEffect(() => {
    if (!suggestion && !navigatedBack) router.back();
  }, [suggestion]);

  if (!suggestion) return null;

  async function handleWearThis() {
    await confirmWearing(suggestion!.fragrance_id);
    setNavigatedBack(true);
    router.back();
  }

  async function handleSuggestAnother() {
    setNavigatedBack(true);
    router.back();
    await requestAnother();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.ink }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>

        {/* Back */}
        <Pressable
          onPress={() => router.back()}
          style={{ marginTop: 12, marginBottom: 24, alignSelf: 'flex-start', padding: 4 }}>
          <IconChevronLeft size={22} color={COLORS.ash} strokeWidth={1.5} />
        </Pressable>

        {/* House + Name */}
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
          <ActivityIndicator color={COLORS.ash} style={{ marginVertical: 24 }} />
        ) : fragrance ? (
          <>
            <NotesPyramid
              top={fragrance.notes_top ?? []}
              heart={fragrance.notes_heart ?? []}
              base={fragrance.notes_base ?? []}
            />

            {/* Metadata row */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 24,
              }}>
              {[
                fragrance.family,
                fragrance.concentration,
                fragrance.longevity ? `Longevity ${fragrance.longevity}/5` : null,
                fragrance.sillage ? `Sillage ${fragrance.sillage}/5` : null,
              ]
                .filter(Boolean)
                .map((item) => (
                  <View
                    key={item}
                    style={{
                      borderWidth: 1,
                      borderColor: '#2A2724',
                      borderRadius: 6,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
                      {item}
                    </Text>
                  </View>
                ))}
            </View>
          </>
        ) : null}

        {/* CTAs */}
        <View style={{ gap: 12, marginTop: 36 }}>
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
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 }}>
            <IconRefresh size={14} color={COLORS.ash} strokeWidth={1.5} />
            <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
              Show me another
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
