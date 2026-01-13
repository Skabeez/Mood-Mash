import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ChatProvider } from '@/context/ChatContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ChatProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="details/[id]"
            options={{
              title: 'Details',
              headerBackTitle: 'Back',
            }}
          />
        </Stack>
      </ChatProvider>
    </GestureHandlerRootView>
  );
}
