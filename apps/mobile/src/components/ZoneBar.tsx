import { View, Text } from 'react-native';
import type { TimeInZone } from '@startrunning/domain';
import { useTheme, zoneColor, radius, space, typeScale } from '@/theme';

const ZONE_COLORS = [zoneColor.z1, zoneColor.z2, zoneColor.z3, zoneColor.z4, zoneColor.z5];
const ZONE_LABELS = ['Recuperação', 'Endurance', 'Tempo', 'Limiar', 'Anaeróbico'];

interface ZoneBarProps {
  timeInZone: TimeInZone;
  /** Rótulos por zona quando o modelo não é o de 5 (PC-4). */
  labels?: string[];
  /** Dado de baixa confiança é sinalizado, nunca exibido como verdade (PC-5/DS §7.6). */
  lowConfidence?: boolean;
}

/**
 * Barra de zonas — componente-assinatura (DS §7.5): distribuição do tempo em
 * cada zona com legenda e percentuais. Estado nunca só por cor: cada segmento
 * tem rótulo textual e percentual (DS §2.6).
 */
export function ZoneBar({ timeInZone, labels = ZONE_LABELS, lowConfidence }: ZoneBarProps) {
  const theme = useTheme();
  const zones = Object.keys(timeInZone).map(Number).sort((a, b) => a - b);
  const total = zones.reduce((sum, z) => sum + (timeInZone[z] ?? 0), 0);
  if (total === 0) return null;

  return (
    <View style={{ opacity: lowConfidence ? 0.55 : 1 }}>
      <View style={{ flexDirection: 'row', height: 12, borderRadius: radius.sm, overflow: 'hidden' }}>
        {zones.map((z) => (
          <View
            key={z}
            style={{ flex: timeInZone[z] / total, backgroundColor: ZONE_COLORS[(z - 1) % ZONE_COLORS.length] }}
          />
        ))}
      </View>
      <View style={{ marginTop: space.s2, gap: space.s1 }}>
        {zones.map((z) => {
          const pct = Math.round((timeInZone[z] / total) * 100);
          return (
            <View key={z} style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: radius.pill,
                  backgroundColor: ZONE_COLORS[(z - 1) % ZONE_COLORS.length],
                }}
              />
              <Text style={{ ...typeScale.small, color: theme.textMuted }}>
                Z{z} {labels[z - 1] ?? ''} · {pct}%
              </Text>
            </View>
          );
        })}
        {lowConfidence ? (
          <Text style={{ ...typeScale.small, color: theme.warning }}>
            ⚠ Dado de baixa confiança nesta sessão
          </Text>
        ) : null}
      </View>
    </View>
  );
}
