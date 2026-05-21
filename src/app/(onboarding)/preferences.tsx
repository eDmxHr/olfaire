import { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Screen } from '@/components/screen-wrapper';
import { ProgressDots } from '@/components/progress-dots';
import { OnboardingHeader } from '@/components/onboarding-header';
import { SelectionChips } from '@/components/selection-chips';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { FONTS, COLORS } from '@/lib/theme';

const FAMILIES = [
  'Floral',
  'Woody',
  'Oriental',
  'Fresh',
  'Gourmand',
  'Musky',
  'Citrus',
  'Aquatic',
] as const;

type Family = (typeof FAMILIES)[number];

function DNABar({ label, value }: { label: string; value: number }) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${value}%`, { duration: 300 }),
  }));

  return (
    <View className="flex-row items-center gap-3">
      <Text style={{ fontFamily: FONTS.ui, width: 80, fontSize: 12, color: COLORS.ash }}>
        {label}
      </Text>
      <View
        className="h-1.5 flex-1 overflow-hidden rounded-full"
        style={{ backgroundColor: COLORS.dust }}>
        <Animated.View
          style={[
            { height: '100%', borderRadius: 999, backgroundColor: COLORS.amber },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}

export default function PreferencesScreen() {
  const [selected, setSelected] = useState<Set<Family>>(new Set());

  function toggle(family: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(family as Family)) {
        next.delete(family as Family);
      } else {
        next.add(family as Family);
      }
      return next;
    });
  }

  const canContinue = selected.size > 0;

  return (
    <Screen noPadding>
      <View className="flex-1">
        <ScrollView
          contentContainerClassName="gap-8 px-4 py-6"
          showsVerticalScrollIndicator={false}>
          <ProgressDots current={2} />

          <OnboardingHeader
            title="What draws you in?"
            subtitle="Pick your favourites — or all of them."
          />

          <SelectionChips
            chips={FAMILIES.map((f) => ({ value: f, label: f }))}
            multiSelect
            selected={selected as Set<string>}
            onSelect={toggle}
          />

          {selected.size > 0 && (
            <Card className="gap-3 px-4 py-4">
              <Text
                style={{ fontFamily: FONTS.uiMedium }}
                className="text-xs uppercase tracking-widest text-muted-foreground">
                Your DNA preview
              </Text>
              <View className="gap-2.5">
                {FAMILIES.map((family) => (
                  <DNABar
                    key={family}
                    label={family}
                    value={selected.has(family) ? Math.round(100 / selected.size) : 0}
                  />
                ))}
              </View>
            </Card>
          )}
        </ScrollView>

        <View className="px-4 pb-6 pt-2">
          <Button
            size="lg"
            className="w-full"
            disabled={!canContinue}
            onPress={() => router.push('/(onboarding)/add-perfume')}>
            <Text style={{ fontFamily: FONTS.uiMedium }}>Continue</Text>
          </Button>
        </View>
      </View>
    </Screen>
  );
}
