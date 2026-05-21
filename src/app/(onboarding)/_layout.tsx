import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="meet-lumi" options={{ gestureEnabled: false }} />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="add-perfume" />
      <Stack.Screen name="ready" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
