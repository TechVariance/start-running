import { ScrollView, Text } from 'react-native';
import { useTheme, typeScale, space } from '@/theme';

/**
 * Perfil — Camada 0, zonas configuráveis (PC-4), integrações, assinatura e
 * consentimentos LGPD (Módulos 1, 16, 18).
 */
export default function PerfilScreen() {
  const theme = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.surface }} contentContainerStyle={{ padding: space.s5 }}>
      <Text style={{ ...typeScale.h1, color: theme.text }}>Perfil</Text>
      <Text style={{ ...typeScale.body, color: theme.textMuted, marginTop: space.s4 }}>
        Seus dados, zonas, integrações e privacidade.
      </Text>
    </ScrollView>
  );
}
