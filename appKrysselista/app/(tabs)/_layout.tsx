import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/authProvider';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { appUser } = useAuth();

  const isForesatt = appUser?.role === "foresatt";
  const homeScreen = appUser?.role === "foresatt" ? `[childId]?childId=${appUser.children[0]}` : "index";
  const initialRoutename = isForesatt ? "child/[childId]" : "index";
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      {isForesatt ? (
        <Tabs.Screen
          name="child/[childId]"
          options={{
            title: 'Mitt barn',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
            //initialParams: { childId: appUser.children[0] },
          }}
        />
      ) : (
        <Tabs.Screen
          name="index"
          options={{
            title: 'Krysselista',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          }}
        />
      )}
      {/*<Tabs.Screen
        name={homeScreen}
        options={{
          title: 'Hjem',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />*/}
      <Tabs.Screen
        name="kalender"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="message.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="varsling"
        options={{
          title: 'Varsling',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bell.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
