import { StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme/theme';

export function AppHeader({ title }: { title: string }) {
  const { theme } = useAppTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[
        styles.title,
        { color: theme.colors.text, fontSize: theme.type.title },
      ]}
    >
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({ title: { fontWeight: '700' } });
