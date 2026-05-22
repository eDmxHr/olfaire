import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { IconLoader3 } from '@tabler/icons-react-native';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { ProgressDots } from '@/components/progress-dots';
import { OnboardingHeader } from '@/components/onboarding-header';
import { SelectionChips } from '@/components/selection-chips';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useProfile } from '@/hooks/useProfile';
import { FONTS, COLORS } from '@/lib/theme';
import type { Lifestyle, SkinType } from '@/lib/supabase';

const LIFESTYLE_CHIPS = [
  { value: 'office', label: 'Office' },
  { value: 'outdoor', label: 'Outdoors' },
  { value: 'creative', label: 'Creative' },
  { value: 'home', label: 'Home' },
];

const SKIN_CHIPS = [
  { value: 'dry', label: 'Dry' },
  { value: 'normal', label: 'Normal' },
  { value: 'oily', label: 'Oily' },
];

export default function LifestyleScreen() {
  const [lifestyle, setLifestyle] = useState<Lifestyle | null>(null);
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useProfile();

  const canContinue = lifestyle !== null && skinType !== null;

  async function handleContinue() {
    if (!canContinue) return;
    setSaving(true);
    await updateProfile({ lifestyle, skin_type: skinType });
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
            <Icon icon={IconLoader3} size={18} color={COLORS.parchment} />
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
    </OnboardingScreen>
  );
}
