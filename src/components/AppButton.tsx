import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  loading = false,
}: Props) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
        minHeight: 48,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.primary,
        opacity: disabled || pressed ? 0.65 : 1,
      })}
    >
      {loading && <ActivityIndicator color={theme.colors.onPrimary} />}
      <Text style={[styles.label, { color: theme.colors.onPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({ label: { fontWeight: '600' } });
