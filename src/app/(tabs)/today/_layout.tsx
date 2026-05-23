import { Stack } from 'expo-router';

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="pick" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <Stack.Screen name="week" />
      <Stack.Screen name="wearing" />
    </Stack>
  );
}
