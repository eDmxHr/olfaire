import { Tabs } from 'expo-router';
import { TabBar } from '@/components/navigation/tab-bar';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}>
      <Tabs.Screen name="today" />
      <Tabs.Screen name="layer" />
      <Tabs.Screen name="collection" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
