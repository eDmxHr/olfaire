import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, FONTS } from '@/lib/theme';
import { TABS } from '@/data/navigation';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const routeKey = route.name.replace('/index', '');
        const tab = TABS.find((t) => t.name === routeKey);
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? COLORS.amber : COLORS.ash;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!event.defaultPrevented) {
                if (focused) {
                  navigation.reset({ index: 0, routes: [{ name: route.name }] });
                } else {
                  navigation.navigate(route.name, route.params);
                }
              }
            }}
            onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            style={styles.tab}>
            <tab.Icon size={24} color={color} strokeWidth={1} />
            <Text style={[styles.label, { color, fontFamily: FONTS.ui }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.parchment,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.dust,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3 },
  label: { fontFamily: FONTS.ui, fontSize: 12 },
});
