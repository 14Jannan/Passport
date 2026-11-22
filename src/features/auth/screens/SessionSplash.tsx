import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingView } from '../../../components/LoadingView';
import { useAppTheme } from '../../../theme/theme';
import { PassportMark } from '../components/AuthForm';

export function SessionSplash() {
  const { theme, dark } = useAppTheme();
  return (
    <SafeAreaView
      style={[
        styles.page,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.centerContainer}>
        <PassportMark
          onColor={dark ? theme.colors.primary : theme.colors.primaryDark}
        />
        <View style={styles.quoteBox}>
          <Text style={[styles.tagline, { color: theme.colors.text }]}>
            “The world is a book and those who do not travel read only one
            page.”
          </Text>
          <Text style={[styles.author, { color: theme.colors.muted }]}>
            — Saint Augustine
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <LoadingView label="Checking your session…" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    maxWidth: 400,
  },
  quoteBox: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  tagline: {
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
});
