// Powered by OnSpace.AI
import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <ProfileProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="analysis"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </ProfileProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
