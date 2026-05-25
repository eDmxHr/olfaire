import { useEffect, useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { router, useLocalSearchParams } from 'expo-router';
import { cacheDirectory, downloadAsync } from 'expo-file-system/legacy';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Text } from '@/components/ui/text';
import { SpinningLoader } from '@/components/spinning-loader';
import { useAuthStore } from '@/store/authStore';
import { uploadSignatureCardImage } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS, TYPE } from '@/lib/theme';

interface CardData {
  blendName: string;
  overallCharacter: string | null;
  compatibilityScore: number | null;
  lumiSummary: string | null;
  cardImageUrl: string | null;
}

export default function SignatureShareModal() {
  const { signatureId } = useLocalSearchParams<{ signatureId: string }>();
  const profile = useAuthStore((s) => s.profile);
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [cardData, setCardData] = useState<CardData | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: sig } = await (supabase as any)
          .from('signatures')
          .select('name, layering_cache_id, card_image_url')
          .eq('id', signatureId)
          .single();

        if (!sig) return;

        const { data: cache } = await (supabase as any)
          .from('layering_cache')
          .select(
            'fragrance_a_id, fragrance_b_id, compatibility_score, overall_character, analysis_json'
          )
          .eq('id', sig.layering_cache_id)
          .single();

        const fragIds = [cache?.fragrance_a_id, cache?.fragrance_b_id].filter(Boolean);
        const { data: frags } = fragIds.length
          ? await (supabase as any).from('fragrances').select('id, name').in('id', fragIds)
          : { data: [] };

        const fragMap = Object.fromEntries((frags ?? []).map((f: any) => [f.id, f.name]));
        const nameA = fragMap[cache?.fragrance_a_id] ?? '';
        const nameB = fragMap[cache?.fragrance_b_id] ?? '';

        setCardData({
          blendName: nameA && nameB ? `${nameA} × ${nameB}` : sig.name,
          overallCharacter: cache?.overall_character ?? null,
          compatibilityScore: cache?.compatibility_score ?? null,
          lumiSummary: (cache?.analysis_json as any)?.lumi_summary ?? null,
          cardImageUrl: sig.card_image_url ?? null,
        });
      } finally {
        setIsLoadingData(false);
      }
    })();
  }, [signatureId]);

  async function handleShare() {
    if (isSharing || isLoadingData) return;
    setIsSharing(true);
    try {
      let localUri: string;

      if (cardData?.cardImageUrl) {
        const fileUri = (cacheDirectory ?? '') + 'signature-card.jpg';
        await downloadAsync(cardData.cardImageUrl, fileUri);
        localUri = fileUri;
      } else {
        if (!cardRef.current) return;
        localUri = await captureRef(cardRef, { format: 'jpg', quality: 0.92 });
        if (profile?.id && signatureId) {
          uploadSignatureCardImage(profile.id, signatureId, localUri).then((cardUrl) => {
            if (cardUrl && signatureId) {
              (supabase as any)
                .from('signatures')
                .update({ card_image_url: cardUrl })
                .eq('id', signatureId);
            }
          });
        }
      }

      await Sharing.shareAsync(localUri, { mimeType: 'image/jpeg' });

      if (signatureId) {
        const { data: sig } = await (supabase as any)
          .from('signatures')
          .select('share_count')
          .eq('id', signatureId)
          .single();
        await (supabase as any)
          .from('signatures')
          .update({ share_count: (sig?.share_count ?? 0) + 1 })
          .eq('id', signatureId);
      }

      router.back();
    } catch (err) {
      console.error('handleShare error:', err);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <BlurView
      intensity={20}
      tint="dark"
      className="flex-1 justify-end"
      style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View
        className="rounded-t-3xl p-6"
        style={{ backgroundColor: COLORS.parchment, paddingBottom: insets.bottom + 16 }}>
        {/* Dismiss handle */}
        <View className="mb-5 items-center">
          <View className="h-1 w-10 rounded-full" style={{ backgroundColor: COLORS.ash }} />
        </View>

        {/* Branded card — captured as image */}
        <View
          ref={cardRef}
          collapsable={false}
          className="mb-6 gap-3 rounded-2xl p-5"
          style={{ backgroundColor: COLORS.ink }}>
          {isLoadingData ? (
            <View className="items-center py-8">
              <SpinningLoader size={20} color={COLORS.ash} />
            </View>
          ) : (
            <>
              <Text
                className="uppercase tracking-widest"
                style={[TYPE.label, { color: COLORS.ash }]}>
                Olfaire
              </Text>
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Text
                    style={{
                      fontFamily: FONTS.displayLightItalic,
                      fontSize: 22,
                      color: COLORS.parchment,
                      lineHeight: 28,
                    }}>
                    {cardData?.blendName ?? 'My Signature'}
                  </Text>
                  {cardData?.overallCharacter ? (
                    <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                      {cardData.overallCharacter}
                    </Text>
                  ) : null}
                </View>
                {cardData?.compatibilityScore != null && (
                  <Text
                    style={{
                      fontFamily: FONTS.displayMedium,
                      fontSize: 48,
                      color: COLORS.amber,
                      lineHeight: 52,
                    }}>
                    {cardData.compatibilityScore}
                  </Text>
                )}
              </View>
              {cardData?.lumiSummary ? (
                <Text
                  style={{
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 15,
                    color: COLORS.ash,
                    lineHeight: 22,
                  }}>
                  "{cardData.lumiSummary}"
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* Share button */}
        <Pressable
          onPress={handleShare}
          disabled={isSharing || isLoadingData}
          className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
          style={{ backgroundColor: COLORS.amber, opacity: isSharing || isLoadingData ? 0.6 : 1 }}>
          {isSharing && <SpinningLoader size={14} color={COLORS.ink} />}
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
            {isSharing ? 'Preparing…' : 'Share'}
          </Text>
        </Pressable>
      </View>
    </BlurView>
  );
}
