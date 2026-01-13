import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ChatProvider } from '@/context/ChatContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { supabase } from '@/services/api/supabase';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const segments = useSegments();

  // Check authentication state
  useEffect(() => {
    if (!supabase) {
      setIsAuthenticated(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isAuthenticated === null) return; // Still loading

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace('/(auth)/splash');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PlayerProvider>
        <ChatProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="details/[id]"
              options={{
                headerShown: true,
                title: 'Details',
                headerBackTitle: 'Back',
              }}
            />
          </Stack>
        </ChatProvider>
      </PlayerProvider>
    </GestureHandlerRootView>
  );
}
