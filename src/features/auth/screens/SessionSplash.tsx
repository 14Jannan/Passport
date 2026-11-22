import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingView } from '../../../components/LoadingView';
import { useAppTheme } from '../../../theme/theme';
import { PassportMark } from '../components/AuthForm';

export function SessionSplash() {
  const { theme } = useAppTheme();
  return (
    <SafeAreaView
      style={[
        styles.page,
        {
          backgroundColor: theme.colors.background,
          paddingTop: theme.spacing.xl,
        },
      ]}
    >
      <PassportMark onColor={theme.colors.primary} />
      <LoadingView label="Checking your session…" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ page: { flex: 1, alignItems: 'center' } });
