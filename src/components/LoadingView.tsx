import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/theme';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  const { theme } = useAppTheme();
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessibilityLabel={label}
      style={[
        styles.container,
        {
          gap: theme.spacing.sm,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={{ color: theme.colors.text }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
