import { Stack } from 'expo-router';

export default function LayerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="application" />
      <Stack.Screen name="signature" />
      <Stack.Screen name="analysis" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}
