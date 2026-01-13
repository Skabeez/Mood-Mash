import { Stack } from 'expo-router';

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        title: 'Details',
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
