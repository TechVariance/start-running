import { Tabs } from 'expo-router';
import { useTheme, typeScale } from '@/theme';

/**
 * Tab bar inferior — 5 destinos (DS §7.7): Hoje, Plano, Treinos, Coach, Perfil.
 * Ícone outline → filled no ativo, rótulo Label, indicador Ignite.
 */
export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: {
          fontFamily: typeScale.label.fontFamily,
          fontSize: typeScale.label.fontSize,
          fontWeight: typeScale.label.fontWeight,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="plano" options={{ title: 'Plano' }} />
      <Tabs.Screen name="treinos" options={{ title: 'Treinos' }} />
      <Tabs.Screen name="coach" options={{ title: 'Coach' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}
