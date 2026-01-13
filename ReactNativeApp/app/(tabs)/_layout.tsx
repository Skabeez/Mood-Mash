import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PlayerProvider } from '@/context/PlayerContext';
import { designSystem } from '@/constants/designSystem';

export default function TabLayout() {
  return (
    <PlayerProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#C084FC', // purple-400 from Figma
          tabBarInactiveTintColor: '#9CA3AF', // gray-400
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#1F2937', // gray-800
            backgroundColor: '#111827', // gray-900
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null, // Hide explore tab from Figma design
          }}
        />
      </Tabs>
    </PlayerProvider>
  );
}
