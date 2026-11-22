import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/theme';

export function ScreenLayout({ children }: PropsWithChildren) {
  const { theme } = useAppTheme();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        },
      ]}
      style={{ backgroundColor: theme.colors.background }}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { flexGrow: 1 } });
