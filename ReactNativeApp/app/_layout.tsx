import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ChatProvider } from '@/context/ChatContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { supabase } from '@/services/api/supabase';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();

  // Check authentication state
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (!supabase) {
        console.log('Supabase not configured, auth disabled');
        if (mounted) {
          setIsAuthenticated(false);
          setIsReady(true);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session ? 'authenticated' : 'not authenticated');
        
        if (mounted) {
          setIsAuthenticated(!!session);
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsReady(true);
        }
      }
    };

    initAuth();

    // Subscribe to auth changes
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'authenticated' : 'not authenticated');
      if (mounted) {
        setIsAuthenticated(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isReady || isAuthenticated === null) return;

    const inAuthGroup = segments[0] === '(auth)';

    setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        console.log('Not authenticated, redirecting to auth');
        router.replace('/(auth)/splash');
      } else if (isAuthenticated && inAuthGroup) {
        console.log('Authenticated, redirecting to main app');
        router.replace('/(tabs)');
      }
    }, 100);
  }, [isAuthenticated, isReady, segments]);

  // Show nothing while checking auth
  if (!isReady || isAuthenticated === null) {
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
