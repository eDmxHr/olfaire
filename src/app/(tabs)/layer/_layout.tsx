import { Stack } from 'expo-router';

export default function LayerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="analysis" />
    </Stack>
  );
}
