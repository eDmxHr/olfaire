import { useEffect } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { OnboardingScreen } from '@/components/onboarding/screen';
import { TasteProfileChart } from '@/components/onboarding/taste-profile-chart';
import { Lumi } from '@/components/lumi';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useProfile } from '@/hooks/useProfile';
import { useCollection } from '@/hooks/useCollection';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/Collectionstore';
import { LIFESTYLE_CHIPS, SKIN_CHIPS } from '@/data/onboarding';
import { FONTS, COLORS } from '@/lib/theme';

export default function ReadyScreen() {
  const { skipped } = useLocalSearchParams<{ skipped?: string }>();
  const isSkipped = skipped === 'true';
  const { completeOnboarding } = useProfile();
  const { fetchCollection } = useCollection();
  const profile = useAuthStore((s) => s.profile);
  const items = useCollectionStore((s) => s.items);

  const lifestyleLabel =
    LIFESTYLE_CHIPS.find((c) => c.value === profile?.lifestyle)?.label ?? profile?.lifestyle ?? '—';
  const skinLabel =
    SKIN_CHIPS.find((c) => c.value === profile?.skin_type)?.label ?? profile?.skin_type ?? '—';

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    fetchCollection();
    opacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(100, withTiming(0, { duration: 500 }));
  }, []);

  return (
    <OnboardingScreen
      scrollable
      action={
        <Button size="lg" className="w-full" onPress={completeOnboarding}>
          <Text style={{ fontFamily: FONTS.uiMedium }}>Start exploring</Text>
        </Button>
      }>
      <Animated.View style={animatedStyle} className="w-full gap-6">
        <View className="items-center gap-4">
          <Lumi size={65} />
          <Text
            style={{ fontFamily: FONTS.displayLight }}
            className="text-center text-4xl tracking-tight text-foreground">
            {isSkipped ? 'Almost there.' : "You're all set."}
          </Text>
        </View>

        <Card className="gap-4 px-5 py-4">
          <SummaryRow label="Lifestyle" value={lifestyleLabel} />
          <SummaryRow label="Skin type" value={skinLabel} />

          <Separator />

          <View className="gap-2">
            <Text
              style={{ fontFamily: FONTS.uiMedium }}
              className="text-xs uppercase tracking-widest text-muted-foreground">
              Taste Profile
            </Text>
            <TasteProfileChart families={profile?.preferred_families ?? []} />
          </View>

          {!isSkipped && items.length > 0 && (
            <>
              <Separator />
              <Text
                style={{ fontFamily: FONTS.uiMedium }}
                className="text-xs uppercase tracking-widest text-muted-foreground">
                {items.length === 1 ? 'Your bottle' : 'Your bottles'}
              </Text>
              {items.map((item) =>
                item.fragrance ? (
                  <SummaryRow
                    key={item.id}
                    label={item.fragrance.house}
                    value={item.fragrance.name}
                  />
                ) : null
              )}
            </>
          )}
        </Card>
      </Animated.View>
    </OnboardingScreen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Text style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>{label}</Text>
      <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 13, color: COLORS.ink }}>{value}</Text>
    </View>
  );
}
