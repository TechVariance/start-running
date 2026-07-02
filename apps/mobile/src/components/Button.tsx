import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme, radius, space, typeScale, elevation, touchTargetMin, color } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const HEIGHT: Record<Size, number> = { sm: 36, md: touchTargetMin, lg: 52 };

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Botão pill (DS §7.1). O primário carrega o glow Ignite e deve ser único
 * por tela — a "ação principal" da hierarquia.
 */
export function Button({ label, onPress, variant = 'primary', size = 'md', disabled, loading }: ButtonProps) {
  const theme = useTheme();

  const byVariant: Record<Variant, { container: ViewStyle; text: string; pressedBg?: string }> = {
    primary: {
      container: { backgroundColor: theme.primary, ...elevation.glowIgnite },
      text: color.n0,
      pressedBg: theme.primaryPressed,
    },
    secondary: {
      container: { backgroundColor: theme.name === 'dark' ? color.n0 : color.ink },
      text: theme.name === 'dark' ? color.ink : color.n0,
    },
    outline: {
      container: { borderWidth: 1, borderColor: theme.border, backgroundColor: 'transparent' },
      text: theme.text,
    },
    ghost: { container: { backgroundColor: 'transparent' }, text: theme.accent },
    danger: { container: { backgroundColor: theme.danger }, text: color.n0 },
  };

  const v = byVariant[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          height: HEIGHT[size],
          minWidth: touchTargetMin,
          borderRadius: radius.pill,
          paddingHorizontal: space.s6,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          opacity: disabled ? 0.4 : 1,
        },
        v.container,
        pressed && v.pressedBg ? { backgroundColor: v.pressedBg } : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <Text style={{ ...typeScale.title, color: v.text }}>{label}</Text>
      )}
    </Pressable>
  );
}
