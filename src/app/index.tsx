import { Stack } from 'expo-router';

import { ScreenContent } from '@/components/ScreenContent';

export default function HomeScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenContent title="Home" path="app/index.tsx" />
    </>
  );
}
