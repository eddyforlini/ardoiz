import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { LessonsProvider } from '@/content/LessonsProvider';
import { ProfileProvider } from '@/profile/ProfileProvider';
import { ProgressProvider } from '@/profile/ProgressProvider';
import { UniversProvider, useUnivers } from '@/univers/UniversProvider';

SplashScreen.preventAutoHideAsync();

function Root() {
  const { univers, loading } = useUnivers();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  const dark = ['espace', 'gaming'].includes(univers.id);

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: univers.colors.bg },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="univers"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Choisis ton univers',
            headerStyle: { backgroundColor: univers.colors.card },
            headerTintColor: univers.colors.ink,
          }}
        />
        <Stack.Screen
          name="ajouter"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Dictée ou poésie',
            headerStyle: { backgroundColor: univers.colors.card },
            headerTintColor: univers.colors.ink,
          }}
        />
        <Stack.Screen
          name="niveau"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Choisis ton niveau',
            headerStyle: { backgroundColor: univers.colors.card },
            headerTintColor: univers.colors.ink,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <UniversProvider>
      <ProfileProvider>
        <ProgressProvider>
          <LessonsProvider>
            <Root />
          </LessonsProvider>
        </ProgressProvider>
      </ProfileProvider>
    </UniversProvider>
  );
}
