import { Stack } from 'expo-router';

export default function CollectionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="add" />
      <Stack.Screen name="low-stock" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="where-to-buy" />
    </Stack>
  );
}
