import { Feather } from '@react-native-vector-icons/feather/static';
import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import {
  AppThemeOverride,
  lightTheme,
  useAppTheme,
} from '../../../theme/theme';

const authLightTheme: typeof lightTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#137C78',
    background: '#F8F7F2',
    surface: '#FFFFFF',
    text: '#172B3A',
    muted: '#667784',
    accent: '#E88C70',
  },
};

export function PassportMark({ onColor }: { onColor: string }) {
  return (
    <View accessible accessibilityLabel="Passport" style={styles.brand}>
      <View style={[styles.icon, { backgroundColor: onColor }]}>
        <Feather name="compass" size={24} color="#FFFFFF" />
      </View>
      <Text style={[styles.wordmark, { color: onColor }]}>Passport</Text>
    </View>
  );
}

export function AuthForm({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  const { theme, dark } = useAppTheme();
  const formTheme = dark ? theme : authLightTheme;
  const { colors } = formTheme;

  return (
    <AppThemeOverride.Provider value={formTheme}>
      <SafeAreaView
        style={[styles.fill, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.panel}>
              <PassportMark onColor={dark ? colors.primary : '#0B5957'} />
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.accent,
                  },
                ]}
              >
                <View style={styles.intro}>
                  <AppHeader title={title} />
                  <Text style={[styles.description, { color: colors.muted }]}>
                    {description}
                  </Text>
                </View>
                {children}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppThemeOverride.Provider>
  );
}

export function AuthLink({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      style={styles.link}
    >
      <Text
        style={[
          styles.linkText,
          { color: disabled ? theme.colors.muted : theme.colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AuthMessage({
  message,
  error = false,
}: {
  message: string;
  error?: boolean;
}) {
  const { theme } = useAppTheme();
  return (
    <Text
      accessibilityRole={error ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[
        styles.description,
        { color: error ? theme.colors.error : theme.colors.text },
      ]}
    >
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  panel: { alignSelf: 'center', width: '100%', maxWidth: 480, gap: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { fontSize: 23, fontWeight: '700' },
  card: { borderRadius: 20, borderTopWidth: 3, padding: 20, gap: 16 },
  intro: { gap: 6 },
  description: { fontSize: 16, lineHeight: 23 },
  link: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  linkText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
