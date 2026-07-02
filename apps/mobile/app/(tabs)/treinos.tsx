import { ScrollView, Text } from 'react-native';
import { useTheme, typeScale, space } from '@/theme';

/**
 * Treinos — histórico e leitura da sessão: splits, barra de zonas (DS §7.5),
 * comparação planejado × executado e nível de confiança do dado (RF-5.x).
 */
export default function TreinosScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.surface }} contentContainerStyle={{ padding: space.s5 }}>
      <Text style={{ ...typeScale.h1, color: theme.text }}>Treinos</Text>
      <Text style={{ ...typeScale.body, color: theme.textMuted, marginTop: space.s4 }}>
        Seus treinos sincronizados aparecem aqui com a leitura completa.
      </Text>
    </ScrollView>
  );
}
