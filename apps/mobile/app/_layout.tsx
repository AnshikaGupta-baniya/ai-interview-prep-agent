import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 2, staleTime: 1000 * 60 * 5 },
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading, checkFirstLaunch } = useAuthStore();
  const { theme, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme();
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthScreen = segments[0] === 'auth';
    const inTabs = segments[0] === '(tabs)';

    if (!user && !inAuthScreen) {
      router.replace('/auth');
    } else if (user && inAuthScreen) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme === 'dark' ? Colors.dark.bg : Colors.light.bg,
      }}>
        <ActivityIndicator
          color={Colors.indigo.DEFAULT}
          size="large"
        />
      </View>
    );
  }

  return null;
}

export default function RootLayout() {
  const { theme } = useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <AuthGate />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}