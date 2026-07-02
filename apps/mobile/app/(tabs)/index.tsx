import { ScrollView, Text, View } from 'react-native';
import { useTheme, typeScale, space } from '@/theme';

/**
 * Hoje — treino do dia, prontidão e alertas de carga (RF-6.2, RF-8.2, RF-14.x).
 * Composição-alvo: ReadinessCard, WorkoutCard do dia, AlertBanner de risco,
 * CTA primário único ("Bora pro treino de hoje").
 */
export default function HojeScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.surface }} contentContainerStyle={{ padding: space.s5 }}>
      <Text style={{ ...typeScale.h1, color: theme.text }}>Hoje</Text>
      <View style={{ marginTop: space.s4 }}>
        <Text style={{ ...typeScale.body, color: theme.textMuted }}>
          Conecte seu relógio e comece a ler seus treinos de verdade.
        </Text>
      </View>
    </ScrollView>
  );
}
