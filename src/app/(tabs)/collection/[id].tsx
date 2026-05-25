import { useEffect } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import {
  IconSparkles,
  IconLayersIntersect,
  IconDroplet,
} from '@tabler/icons-react-native';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { NotesPyramid } from '@/components/today/notes-pyramid';
import { useCollectionStore } from '@/store/Collectionstore';
import { useCollection } from '@/hooks/useCollection';
import { COLORS, FONTS } from '@/lib/theme';

export default function BottleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const getById = useCollectionStore((s) => s.getById);
  const item = getById(id);
  const { removeBottle } = useCollection();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);
  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    opacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  if (!item) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
        <ScreenHeader title="" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: FONTS.ui, fontSize: 14, color: COLORS.ash }}>
            Bottle not found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const frag = item.fragrance;

  const lastWorn = item.last_worn_at
    ? new Date(item.last_worn_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Never';

  const ratingLabel = item.personal_rating ? `${item.personal_rating} / 5` : '—';

  function confirmRemove() {
    Alert.alert('Remove bottle?', 'This will remove it from your collection.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeBottle(item.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[animStyle, { overflow: 'visible' }]}>

          {/* Dark hero card */}
          <View style={{ backgroundColor: COLORS.ink, borderRadius: 16, padding: 20 }}>
            {frag?.house ? (
              <Text
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                }}>
                {frag.house}
              </Text>
            ) : null}
            <Text
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 28,
                lineHeight: 34,
                color: COLORS.parchment,
                marginTop: 2,
              }}>
              {frag?.name ?? '—'}
            </Text>

            {(frag?.concentration || frag?.year) ? (
              <Text
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 12,
                  color: COLORS.ash,
                  marginTop: 6,
                }}>
                {[frag.concentration, frag.year].filter(Boolean).join(' · ')}
              </Text>
            ) : null}

            {(frag?.family || frag?.subfamily) ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {[frag.family, frag.subfamily].filter(Boolean).map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: COLORS.ash + '30',
                      borderRadius: 99,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Wear stats row */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {[
              { label: 'Worn', value: String(item.wear_count) },
              { label: 'Last worn', value: lastWorn },
              { label: 'Rating', value: ratingLabel },
            ].map(({ label, value }) => (
              <View
                key={label}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.linen,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 20,
                    lineHeight: 24,
                    color: COLORS.ink,
                  }}>
                  {value}
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.uiMedium,
                    fontSize: 10,
                    color: COLORS.ash,
                    letterSpacing: 0.8,
                    textTransform: 'uppercase',
                    marginTop: 2,
                  }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>

          {/* Notes pyramid */}
          {frag && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}>
                Notes
              </Text>
              <NotesPyramid
                top={frag.notes_top ?? []}
                heart={frag.notes_heart ?? []}
                base={frag.notes_base ?? []}
              />
            </View>
          )}

          {/* Season tags */}
          {frag?.season_tags && frag.season_tags.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              <Text
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                Season
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {frag.season_tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: COLORS.linen,
                      borderRadius: 99,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}>
                    <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Occasion tags */}
          {frag?.occasion_tags && frag.occasion_tags.length > 0 ? (
            <View style={{ marginTop: 16 }}>
              <Text
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 10,
                  color: COLORS.ash,
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                Occasion
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {frag.occasion_tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      backgroundColor: COLORS.linen,
                      borderRadius: 99,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                    }}>
                    <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Quick actions */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 24 }}>
            <Pressable
              onPress={() => router.push('/(tabs)/today')}
              style={{
                flex: 1,
                backgroundColor: COLORS.linen,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                gap: 6,
              }}>
              <IconSparkles size={20} color={COLORS.ink} strokeWidth={1.5} />
              <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ink }}>
                Wear
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push({ pathname: '/(tabs)/layer', params: { preselect: item.id } })}
              style={{
                flex: 1,
                backgroundColor: COLORS.linen,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                gap: 6,
              }}>
              <IconLayersIntersect size={20} color={COLORS.ink} strokeWidth={1.5} />
              <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ink }}>
                Layer
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push(`/modals/stock-update?collectionId=${item.id}` as any)}
              style={{
                flex: 1,
                backgroundColor: COLORS.linen,
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                gap: 6,
              }}>
              <IconDroplet size={20} color={COLORS.ink} strokeWidth={1.5} />
              <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ink }}>
                Stock
              </Text>
            </Pressable>
          </View>

          {/* Remove */}
          <Pressable
            onPress={confirmRemove}
            style={{ alignItems: 'center', marginTop: 28, paddingVertical: 8 }}>
            <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.red }}>
              Remove from collection
            </Text>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
