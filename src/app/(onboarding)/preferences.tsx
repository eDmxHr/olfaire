import { useState } from 'react';
import { router } from 'expo-router';
import { SpinningLoader } from '@/components/spinning-loader';
import { OnboardingScreen } from '@/components/onboarding/screen';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { OnboardingHeader } from '@/components/onboarding/header';
import { SelectionChips } from '@/components/onboarding/selection-chips';
import { TasteProfileChart } from '@/components/onboarding/taste-profile-chart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FONTS, COLORS } from '@/lib/theme';
import { FRAGRANCE_FAMILIES, type FragranceFamily } from '@/data/onboarding';
import { useProfile } from '@/hooks/useProfile';

export default function PreferencesScreen() {
  const [selected, setSelected] = useState<Set<FragranceFamily>>(new Set());
  const [saving, setSaving] = useState(false);
  const { updateProfile } = useProfile();

  function toggle(family: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(family as FragranceFamily)) {
        next.delete(family as FragranceFamily);
      } else {
        next.add(family as FragranceFamily);
      }
      return next;
    });
  }

  async function handleContinue() {
    setSaving(true);
    await updateProfile({ preferred_families: Array.from(selected) });
    setSaving(false);
    router.push('/(onboarding)/add-perfume');
  }

  return (
    <OnboardingScreen
      action={
        <Button
          size="lg"
          className="w-full"
          disabled={selected.size === 0 || saving}
          onPress={handleContinue}>
          {saving ? (
            <SpinningLoader size={18} color={COLORS.parchment} />
          ) : (
            <Text style={{ fontFamily: FONTS.uiMedium }}>Continue</Text>
          )}
        </Button>
      }>
      <ProgressDots current={2} />

      <OnboardingHeader
        title="What draws you in?"
        subtitle="Pick your favourites — or all of them."
      />

      <SelectionChips
        chips={FRAGRANCE_FAMILIES.map((f) => ({ value: f, label: f }))}
        multiSelect
        selected={selected as Set<string>}
        onSelect={toggle}
      />

      <Card className="gap-3 px-4 py-4">
        <Text
          style={{ fontFamily: FONTS.uiMedium }}
          className="text-xs uppercase tracking-widest text-muted-foreground">
          Your Taste Profile
        </Text>
        <TasteProfileChart families={Array.from(selected)} />
      </Card>
    </OnboardingScreen>
  );
}
