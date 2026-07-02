import { ScrollView, Text } from 'react-native';
import { useTheme, typeScale, space } from '@/theme';

/**
 * Coach — conversacional por IA ancorado nos dados reais do atleta (RF-9.x,
 * Fase 3). Até lá, central de explicações de métricas (RNF-4.2): toda métrica
 * avançada tem "o que é isso?" acessível.
 */
export default function CoachScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.surface }} contentContainerStyle={{ padding: space.s5 }}>
      <Text style={{ ...typeScale.h1, color: theme.text }}>Coach</Text>
      <Text style={{ ...typeScale.body, color: theme.textMuted, marginTop: space.s4 }}>
        Pergunte sobre seus treinos, seu plano e suas métricas.
      </Text>
    </ScrollView>
  );
}
