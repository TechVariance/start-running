import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';

// Cache-first: tolera conectividade intermitente (premissa 2.4 do SRS) —
// leitura sai do cache e revalida em background.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, gcTime: 24 * 60 * 60 * 1000, retry: 2 },
  },
});

export default function RootLayout() {
  const theme = useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.surface } }}>
        <Stack.Screen name="(tabs)" />
        {/* Onboarding: stack próprio, concluível em < 5 min (RN-1.1) */}
      </Stack>
    </QueryClientProvider>
  );
}
