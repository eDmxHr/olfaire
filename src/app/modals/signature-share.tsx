import { useRef, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Text } from '@/components/ui/text';
import { SpinningLoader } from '@/components/spinning-loader';
import { useLayeringStore } from '@/store/LayeringStore';
import { useAuthStore } from '@/store/authStore';
import { uploadSignatureCardImage } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { COLORS, FONTS } from '@/lib/theme';

export default function SignatureShareModal() {
  const { signatureId } = useLocalSearchParams<{ signatureId: string }>();
  const { analysis, selectedItems } = useLayeringStore();
  const profile = useAuthStore((s) => s.profile);
  const insets = useSafeAreaInsets();
  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);

  const fragA = selectedItems[0]?.fragrance as any;
  const fragB = selectedItems[1]?.fragrance as any;
  const blendName = fragA && fragB ? `${fragA.name} × ${fragB.name}` : 'My Signature';

  async function handleShare() {
    if (!cardRef.current || isSharing) return;
    setIsSharing(true);
    try {
      const localUri = await captureRef(cardRef, { format: 'jpg', quality: 0.92 });

      // Upload in background — don't block sharing on it
      const uploadPromise =
        profile?.id && signatureId
          ? uploadSignatureCardImage(profile.id, signatureId, localUri)
          : Promise.resolve(null);

      // Dismiss our modal first so the native share sheet has a clean window to present over
      router.back();
      await new Promise((r) => setTimeout(r, 150));
      await Sharing.shareAsync(localUri, { mimeType: 'image/jpeg' });

      // After share sheet closes, persist card url + increment share count
      const cardUrl = await uploadPromise;
      if (signatureId) {
        const { data: sig } = await (supabase as any)
          .from('signatures')
          .select('share_count')
          .eq('id', signatureId)
          .single();
        await (supabase as any)
          .from('signatures')
          .update({
            ...(cardUrl && { card_image_url: cardUrl }),
            share_count: (sig?.share_count ?? 0) + 1,
          })
          .eq('id', signatureId);
      }
    } catch (err) {
      console.error('handleShare error:', err);
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        {/* Dismiss handle */}
        <View className="mb-5 items-center">
          <View className="h-1 w-10 rounded-full" style={{ backgroundColor: COLORS.ash }} />
        </View>

        {/* Branded card — this is what gets captured */}
        <View
          ref={cardRef}
          collapsable={false}
          className="mb-6 rounded-2xl p-5 gap-3"
          style={{ backgroundColor: COLORS.ink }}>
          <Text
            className="uppercase tracking-widest"
            style={{ fontFamily: FONTS.uiMedium, fontSize: 9, color: COLORS.ash, letterSpacing: 1 }}>
            Olfaire
          </Text>
          <View className="flex-row items-end justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 22,
                  color: COLORS.parchment,
                  lineHeight: 28,
                }}>
                {blendName}
              </Text>
              {analysis?.overall_character ? (
                <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                  {analysis.overall_character}
                </Text>
              ) : null}
            </View>
            {analysis?.compatibility_score != null && (
              <Text
                style={{
                  fontFamily: FONTS.displayMedium,
                  fontSize: 48,
                  color: COLORS.amber,
                  lineHeight: 52,
                }}>
                {analysis.compatibility_score}
              </Text>
            )}
          </View>
          {analysis?.lumi_summary ? (
            <Text
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 15,
                color: COLORS.ash,
                lineHeight: 22,
              }}>
              "{analysis.lumi_summary}"
            </Text>
          ) : null}
        </View>

        {/* Share button */}
        <Pressable
          onPress={handleShare}
          disabled={isSharing}
          className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
          style={{ backgroundColor: COLORS.amber, opacity: isSharing ? 0.6 : 1 }}>
          {isSharing && <SpinningLoader size={14} color={COLORS.ink} />}
          <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
            {isSharing ? 'Preparing…' : 'Share'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(28,26,24,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.parchment,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
});
