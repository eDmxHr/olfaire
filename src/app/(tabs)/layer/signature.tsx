import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useLayeringStore } from '@/store/LayeringStore';
import { useLayering } from '@/hooks/useLayering';
import { fetchSignatureNames } from '@/lib/claudeApi';
import { SpinningLoader } from '@/components/spinning-loader';
import { COLORS, FONTS } from '@/lib/theme';

const PRESET_TAGS = ['Daytime', 'Evening', 'Work', 'Date night', 'Weekend', 'Seasonal'];

export default function SignatureScreen() {
  const { analysis, selectedItems, cacheId, isSaving } = useLayeringStore();
  const { saveSignature } = useLayering();
  const { bottom: bottomInset } = useSafeAreaInsets();

  const fragA = selectedItems[0]?.fragrance as any;
  const fragB = selectedItems[1]?.fragrance as any;

  const defaultName = fragA && fragB ? `${fragA.name} × ${fragB.name}` : 'My Signature';

  const [name, setName] = useState(defaultName);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingNames, setIsFetchingNames] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!analysis || !cacheId) {
      router.back();
      return;
    }
    loadSuggestions();
  }, []);

  if (!analysis || !cacheId) return null;

  async function loadSuggestions() {
    if (!fragA || !fragB || !analysis) return;
    setIsFetchingNames(true);
    try {
      const result = await fetchSignatureNames({
        bottleAName: fragA.name,
        bottleANotes: fragA.notes_top ?? [],
        bottleBName: fragB.name,
        bottleBNotes: fragB.notes_top ?? [],
        overallCharacter: analysis.overall_character,
      });
      setSuggestions(result.suggestions);
    } catch {
      // silently fail — user can still type manually
    } finally {
      setIsFetchingNames(false);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function getOrSave(): Promise<string | null> {
    if (savedId) return savedId;
    const id = await saveSignature(name.trim() || 'Untitled', selectedTags);
    if (id) setSavedId(id);
    return id;
  }

  async function handleSave() {
    await getOrSave();
    router.back();
  }

  async function handleShare() {
    const id = await getOrSave();
    if (id) router.push(`/modals/signature-share?signatureId=${id}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Signature" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 + bottomInset }}
        showsVerticalScrollIndicator={false}>
        {/* ── Preview card ── */}
        <View
          style={{
            backgroundColor: COLORS.ink,
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
            marginBottom: 24,
          }}>
          <View className="flex-row items-center gap-4">
            <View className="flex-1">
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 22,
                  color: COLORS.parchment,
                  lineHeight: 28,
                }}>
                {fragA && fragB ? `${fragA.name} × ${fragB.name}` : defaultName}
              </Text>
              <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash, marginTop: 4 }}>
                {analysis.overall_character}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: FONTS.displayMedium,
                fontSize: 40,
                color: COLORS.amber,
                lineHeight: 44,
              }}>
              {analysis.compatibility_score}
            </Text>
          </View>
        </View>

        {/* ── Name your blend ── */}
        <View className="mb-2 flex-row items-center justify-between">
          <Text
            style={{
              fontFamily: FONTS.uiMedium,
              fontSize: 10,
              color: COLORS.ash,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
            Name your blend
          </Text>
          {isFetchingNames && <SpinningLoader size={14} color={COLORS.ash} />}
          {!isFetchingNames && suggestions.length > 0 && (
            <Text
              style={{
                fontFamily: FONTS.uiMedium,
                fontSize: 10,
                color: COLORS.ash,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
              Lumi suggests
            </Text>
          )}
        </View>
        {!isFetchingNames && suggestions.length > 0 && (
          <View className="mb-3 flex-row flex-wrap gap-2">
            {suggestions.map((s) => (
              <Pressable
                key={s}
                onPress={() => setName(s)}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: name === s ? COLORS.ink : COLORS.linen }}>
                <Text
                  style={{
                    fontFamily: FONTS.uiMedium,
                    fontSize: 12,
                    color: name === s ? COLORS.parchment : COLORS.ink,
                  }}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Sunday Morning"
          placeholderTextColor={COLORS.ash}
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 10,
            padding: 14,
            fontFamily: FONTS.ui,
            fontSize: 15,
            color: COLORS.ink,
            marginBottom: 24,
          }}
        />

        {/* ── Tags ── */}
        <Text
          style={{
            fontFamily: FONTS.uiMedium,
            fontSize: 10,
            color: COLORS.ash,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
          Tags
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {PRESET_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                className="rounded-full px-3.5 py-1.5"
                style={{ backgroundColor: active ? COLORS.ink : COLORS.linen }}>
                <Text
                  style={{
                    fontFamily: FONTS.uiMedium,
                    fontSize: 13,
                    color: active ? COLORS.parchment : COLORS.ash,
                  }}>
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Absolute CTAs ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 6 + bottomInset,
          left: 24,
          right: 24,
          gap: 10,
        }}>
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: COLORS.amber,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: isSaving ? 0.6 : 1,
          }}>
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.parchment }}>
            {isSaving ? 'Saving…' : 'Save signature'}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={{
            backgroundColor: COLORS.linen,
            borderRadius: 10,
            paddingVertical: 14,
            alignItems: 'center',
          }}>
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>Share</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
