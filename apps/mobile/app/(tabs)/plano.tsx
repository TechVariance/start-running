import { ScrollView, Text } from 'react-native';
import { useTheme, typeScale, space } from '@/theme';

/**
 * Plano — fases da periodização, calendário planejado × executado e ajustes
 * com raciocínio da IA (RF-4.x, RF-6.4, RF-15.3).
 */
export default function PlanoScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.surface }} contentContainerStyle={{ padding: space.s5 }}>
      <Text style={{ ...typeScale.h1, color: theme.text }}>Plano</Text>
      <Text style={{ ...typeScale.body, color: theme.textMuted, marginTop: space.s4 }}>
        Defina sua prova-alvo e gere seu plano periodizado.
      </Text>
    </ScrollView>
  );
}
