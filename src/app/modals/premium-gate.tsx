import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconCrown } from '@tabler/icons-react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { COLORS, FONTS, colorWithOpacity } from '@/lib/theme';

// ── Constants ─────────────────────────────────────────────────────

const FEATURES = [
  'Unlimited collection',
  'Unlimited layering chemistry',
  'Full chemistry breakdown + application guide',
  'Unlimited saved signatures',
  'Weekly rotation planner',
  'Fragrance DNA profile',
  'Morning ritual push notification',
  'Early access to new features',
];

const PKG_ORDER = ['LIFETIME', 'ANNUAL', 'MONTHLY'];

function sortPackages(pkgs: PurchasesPackage[]): PurchasesPackage[] {
  return [...pkgs].sort(
    (a, b) => PKG_ORDER.indexOf(a.packageType) - PKG_ORDER.indexOf(b.packageType)
  );
}

function packageLabel(pkg: PurchasesPackage): string {
  if (pkg.packageType === 'LIFETIME') return 'Lifetime';
  if (pkg.packageType === 'ANNUAL') return 'Annual';
  if (pkg.packageType === 'MONTHLY') return 'Monthly';
  return pkg.product.title;
}

function packageSubLabel(pkg: PurchasesPackage): string {
  if (pkg.packageType === 'LIFETIME') return `Own it forever — ${pkg.product.priceString}`;
  if (pkg.packageType === 'ANNUAL') return `Full access for just ${pkg.product.priceString}/yr`;
  if (pkg.packageType === 'MONTHLY') return `Full access for just ${pkg.product.priceString}/mo`;
  return pkg.product.priceString;
}

function packageBadge(pkg: PurchasesPackage): string | null {
  if (pkg.packageType === 'LIFETIME') return 'BEST VALUE';
  if (pkg.packageType === 'ANNUAL') return '33% OFF';
  return null;
}

// ── Component ─────────────────────────────────────────────────────

export default function PremiumGateModal() {
  const insets = useSafeAreaInsets();
  const { offering, isLoading, isPurchasing, isRestoring, purchase, restore } = useRevenueCat();

  const packages = sortPackages(offering?.availablePackages ?? []);
  const defaultPkg = packages.find((p) => p.packageType === 'ANNUAL') ?? packages[0] ?? null;
  const [selected, setSelected] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    if (defaultPkg && !selected) setSelected(defaultPkg);
  }, [defaultPkg]);

  const busy = isPurchasing || isRestoring;

  async function handlePurchase() {
    if (!selected || busy) return;
    const success = await purchase(selected);
    if (success) router.back();
  }

  async function handleRestore() {
    if (busy) return;
    const success = await restore();
    if (success) router.back();
  }

  return (
    <BlurView
      intensity={20}
      tint="dark"
      className="flex-1 justify-end"
      style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => !busy && router.back()} />

      <View
        style={{
          backgroundColor: COLORS.parchment,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingBottom: insets.bottom + 20,
          maxHeight: '92%',
        }}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8 }}>
          {/* ── Header ── */}
          <View className="mb-5 items-center">
            <View
              className="mb-4 items-center justify-center"
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colorWithOpacity(COLORS.amber, 0.12),
              }}>
              <IconCrown size={24} color={COLORS.amber} strokeWidth={1.5} />
            </View>
            <Text
              className="text-center"
              style={{
                fontFamily: FONTS.displayLightItalic,
                fontSize: 28,
                color: COLORS.ink,
                lineHeight: 34,
              }}>
              Your collection deserves more
            </Text>
            <View
              className="mt-2.5 rounded-full px-3 py-1"
              style={{ backgroundColor: colorWithOpacity(COLORS.amber, 0.12) }}>
              <Text
                style={{
                  fontFamily: FONTS.uiMedium,
                  fontSize: 12,
                  color: COLORS.amber,
                  letterSpacing: 1.9,
                }}>
                Olfaire Pro
              </Text>
            </View>
          </View>

          {/* ── Feature list ── */}
          <View className="mb-6 gap-2">
            {FEATURES.map((f) => (
              <View key={f} className="flex-row items-start gap-2.5">
                <Text
                  style={{
                    fontFamily: FONTS.ui,
                    fontSize: 15,
                    color: COLORS.amber,
                    lineHeight: 22,
                  }}>
                  ✦
                </Text>
                <Text
                  className="flex-1"
                  style={{ fontFamily: FONTS.ui, fontSize: 15, color: COLORS.ink, lineHeight: 22 }}>
                  {f}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Package selector ── */}
          {isLoading ? (
            <ActivityIndicator color={COLORS.amber} style={{ marginVertical: 24 }} />
          ) : (
            <View className="mb-6 gap-2.5">
              {packages.map((pkg) => {
                const isSelected = selected?.identifier === pkg.identifier;
                const badge = packageBadge(pkg);
                return (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => setSelected(pkg)}
                    style={{
                      borderRadius: 14,
                      borderWidth: isSelected ? 1.5 : 1,
                      borderColor: isSelected ? COLORS.amber : COLORS.dust,
                      backgroundColor: isSelected
                        ? colorWithOpacity(COLORS.amber, 0.06)
                        : COLORS.linen,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                    {/* Radio circle */}
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: isSelected ? 6 : 1.5,
                        borderColor: isSelected ? COLORS.amber : COLORS.dust,
                        backgroundColor: 'transparent',
                      }}
                    />

                    {/* Labels */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15, color: COLORS.ink }}>
                        {packageLabel(pkg)}
                      </Text>
                      <Text
                        className="mt-0.5"
                        style={{ fontFamily: FONTS.ui, fontSize: 12, color: COLORS.ash }}>
                        {packageSubLabel(pkg)}
                      </Text>
                    </View>

                    {/* Badge */}
                    {badge && (
                      <View
                        className="rounded-full px-2.5 py-1"
                        style={{
                          backgroundColor: colorWithOpacity(COLORS.amber, isSelected ? 0.15 : 0.08),
                        }}>
                        <Text
                          style={{
                            fontFamily: FONTS.uiMedium,
                            fontSize: 10,
                            color: COLORS.amber,
                            letterSpacing: 1.9,
                          }}>
                          {badge}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* ── CTA ── */}
          <Button disabled={!selected || busy} onPress={handlePurchase}>
            {isPurchasing ? (
              <ActivityIndicator size="small" color={COLORS.parchment} />
            ) : (
              <Text style={{ fontFamily: FONTS.uiMedium, fontSize: 15 }}>Start Premium</Text>
            )}
          </Button>

          {/* ── Restore ── */}
          <Pressable onPress={handleRestore} disabled={busy} className="mt-4 items-center">
            {isRestoring ? (
              <ActivityIndicator size="small" color={COLORS.ash} />
            ) : (
              <Text style={{ fontFamily: FONTS.ui, fontSize: 13, color: COLORS.ash }}>
                Restore purchases
              </Text>
            )}
          </Pressable>

          {/* ── Legal ── */}
          <View className="mt-4 flex-row justify-center gap-4">
            <Pressable onPress={() => Linking.openURL('https://olfaire.app/terms')}>
              <Text
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 12,
                  color: colorWithOpacity(COLORS.ash, 0.6),
                }}>
                Terms
              </Text>
            </Pressable>
            <Pressable onPress={() => Linking.openURL('https://olfaire.app/privacy')}>
              <Text
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 12,
                  color: colorWithOpacity(COLORS.ash, 0.6),
                }}>
                Privacy
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </BlurView>
  );
}
