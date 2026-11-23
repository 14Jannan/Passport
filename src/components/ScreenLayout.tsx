import type { PropsWithChildren } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/theme';

export function ScreenLayout({
  children,
  safeTop = false,
}: PropsWithChildren<{
  /** Pad below the status bar on screens without a navigation header. */
  safeTop?: boolean;
}>) {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.content,
        {
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
          paddingBottom: 96, // Safe space above floating bottom tab bar
          ...(safeTop ? { paddingTop: insets.top + theme.spacing.md } : null),
        },
      ]}
      style={{ backgroundColor: theme.colors.background }}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { flexGrow: 1 } });
