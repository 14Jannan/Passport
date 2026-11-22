import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}: Props) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;

  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';

  const backgroundColor = isOutline
    ? 'transparent'
    : isSecondary
    ? dark
      ? colors.surfaceSecondary
      : colors.softMint
    : colors.primary;

  const textColor = isOutline
    ? colors.primary
    : isSecondary
    ? colors.primary
    : colors.onPrimary;

  const borderColor = isOutline ? colors.primary : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: isOutline ? 1.5 : 0,
          borderRadius: theme.radius.md,
          opacity: disabled || pressed ? 0.7 : 1,
        },
        variant === 'primary' && !disabled ? theme.shadows.sm : undefined,
      ]}
    >
      {loading && <ActivityIndicator color={textColor} size="small" />}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
});
