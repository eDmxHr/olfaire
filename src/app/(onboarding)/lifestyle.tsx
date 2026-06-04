import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { SpinningLoader } from '@/components/spinning-loader';
import { OnboardingScreen } from '@/components/onboarding/screen';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { OnboardingHeader } from '@/components/onboarding/header';
import { SelectionChips } from '@/components/onboarding/selection-chips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

import { useProfile } from '@/hooks/useProfile';
import { FONTS, COLORS } from '@/lib/theme';
import { LIFESTYLE_CHIPS, SKIN_CHIPS } from '@/data/onboarding';
import type { Lifestyle, SkinType } from '@/lib/supabase';

export default function LifestyleScreen() {
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [city, setCity] = useState('Malé');
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useProfile();

  const canContinue = lifestyle !== null && skinType !== null;

  async function handleContinue() {
    if (!canContinue) return;
    setSaving(true);
    await updateProfile({ lifestyle, skin_type: skinType, city: city.trim() || null });
    setSaving(false);
    router.push('/(onboarding)/preferences');
  }

  return (
    <OnboardingScreen
      action={
        <Button
          size="lg"
          className="w-full"
          disabled={!canContinue || saving}
          onPress={handleContinue}>
          {saving ? (
            <SpinningLoader size={18} color={COLORS.parchment} />
          ) : (
            <Text style={{ fontFamily: FONTS.uiMedium }}>Continue</Text>
          )}
        </Button>
      }>
      <ProgressDots current={1} />

      <OnboardingHeader
        title="Tell me about you"
        subtitle="This helps Lumi pick the right intensity and longevity."
      />

      <View className="gap-4">
        <Text
          style={{ fontFamily: FONTS.uiMedium }}
          className="text-xs uppercase tracking-widest text-muted-foreground">
          Your day
        </Text>
        <SelectionChips
          chips={LIFESTYLE_CHIPS}
          selected={lifestyle}
          onSelect={(v) => setLifestyle(v as Lifestyle)}
        />
      </View>

      <View className="gap-4">
        <Text
          style={{ fontFamily: FONTS.uiMedium }}
          className="text-xs uppercase tracking-widest text-muted-foreground">
          Skin type
        </Text>
        <SelectionChips
          chips={SKIN_CHIPS}
          selected={skinType}
          onSelect={(v) => setSkinType(v as SkinType)}
        />
      </View>

      <View className="gap-2">
        <Text
          style={{ fontFamily: FONTS.uiMedium }}
          className="text-xs uppercase tracking-widest text-muted-foreground">
          Your city
        </Text>
        <Input
          placeholder="e.g. London"
          value={city}
          onChangeText={setCity}
          autoCapitalize="words"
          returnKeyType="done"
          defaultValue={city}
        />
        <Text style={{ fontFamily: FONTS.ui, fontSize: 11, color: COLORS.ash }}>
          Helps Lumi factor in weather when choosing your scent.
        </Text>
      </View>
    </OnboardingScreen>
  );
}
