import { useEffect } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { IconCheck } from '@tabler/icons-react-native';
import { Lumi } from '@/components/lumi';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Text } from '@/components/ui/text';
import { useCollectionStore } from '@/store/Collectionstore';
import { useScreenAnimation } from '@/hooks/useScreenAnimation';
import { COLORS, FONTS, colorWithOpacity } from '@/lib/theme';
import type { StockLevel } from '@/lib/supabase';

const STOCK_FILL: Record<StockLevel, number> = {
  full: 100,
  medium: 60,
  low: 25,
  empty: 0,
};

const STOCK_LABEL: Record<StockLevel, string> = {
  full: 'Full',
  medium: 'Medium',
  low: 'Low',
  empty: 'Empty',
};

export default function LowStockScreen() {
  const lowStockItems = useCollectionStore((s) => s.lowStockItems);
  const items = lowStockItems();

  const { animStyle, trigger } = useScreenAnimation(8);

  useEffect(() => {
    trigger();
  }, []);

  async function handleWhereToBuy(sourceUrl: string | null | undefined) {
    if (sourceUrl) {
      await Linking.openURL(sourceUrl);
    } else {
      Alert.alert('Coming soon', 'Where to buy links will be available in a future update.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.parchment }} edges={['top']}>
      <ScreenHeader title="Low stock" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <Animated.View style={[animStyle, { overflow: 'visible' }]}>

          {items.length === 0 ? (
            /* All stocked up state */
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 16 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colorWithOpacity(COLORS.amber, 0.13),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconCheck size={24} color={COLORS.amber} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontFamily: FONTS.displayLightItalic,
                  fontSize: 20,
                  color: COLORS.ink,
                  lineHeight: 28,
                  textAlign: 'center',
                }}>
                All stocked up.
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.ui,
                  fontSize: 14,
                  color: COLORS.ash,
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                None of your bottles are running low right now.
              </Text>
            </View>
          ) : (
            <>
              {/* Lumi reassurance */}
              <View
                style={{
                  backgroundColor: COLORS.linen,
                  borderRadius: 16,
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginBottom: 20,
                }}>
                <View style={{ transform: [{ rotate: '12deg' }] }}>
                  <Lumi size={20} />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontFamily: FONTS.displayLightItalic,
                    fontSize: 16,
                    color: COLORS.ink,
                    lineHeight: 22,
                  }}>
                  Here's what's running low. Time to restock or discover something new.
                </Text>
              </View>

              {/* Low stock list */}
              <View>
                {items.map((item, index) => {
                  const frag = item.fragrance;
                  const fill = STOCK_FILL[item.stock_level];
                  const barColor = item.stock_level === 'empty' || item.stock_level === 'low'
                    ? COLORS.red
                    : COLORS.amber;
                  const isLast = index === items.length - 1;

                  return (
                    <View
                      key={item.id}
                      style={{
                        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                        borderBottomColor: COLORS.dust,
                        paddingVertical: 16,
                      }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <View style={{ flex: 1 }}>
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
                              fontSize: 17,
                              lineHeight: 22,
                              color: COLORS.ink,
                            }}>
                            {frag?.name ?? '—'}
                          </Text>
                        </View>

                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <View
                            style={{
                              backgroundColor: colorWithOpacity(COLORS.red, 0.13),
                              borderRadius: 99,
                              paddingHorizontal: 10,
                              paddingVertical: 3,
                            }}>
                            <Text
                              style={{
                                fontFamily: FONTS.uiMedium,
                                fontSize: 11,
                                color: COLORS.red,
                              }}>
                              {STOCK_LABEL[item.stock_level]}
                            </Text>
                          </View>
                          <Pressable onPress={() => handleWhereToBuy(frag?.source_url)}>
                            <Text
                              style={{
                                fontFamily: FONTS.uiMedium,
                                fontSize: 12,
                                color: COLORS.amber,
                              }}>
                              Where to buy →
                            </Text>
                          </Pressable>
                        </View>
                      </View>

                      {/* Stock bar */}
                      <View
                        style={{
                          height: 4,
                          backgroundColor: colorWithOpacity(COLORS.ash, 0.19),
                          borderRadius: 99,
                          marginTop: 10,
                        }}>
                        {fill > 0 ? (
                          <View
                            style={{
                              height: 4,
                              backgroundColor: barColor,
                              borderRadius: 99,
                              width: `${fill}%`,
                            }}
                          />
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
