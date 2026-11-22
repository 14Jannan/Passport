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
import { useAppTheme } from '../../../theme/theme';

export function PassportMark({ onColor }: { onColor: string }) {
  const { theme } = useAppTheme();
  return (
    <View accessible accessibilityLabel="Passport" style={styles.brand}>
      <View
        style={[styles.icon, { backgroundColor: onColor }, theme.shadows.md]}
      >
        <Feather name="compass" size={26} color="#FFFFFF" />
      </View>
      <View style={styles.brandTextContainer}>
        <Text style={[styles.wordmark, { color: onColor }]}>Passport</Text>
        <Text style={[styles.tagline, { color: theme.colors.muted }]}>
          Explore the World. Capture the Journey.
        </Text>
      </View>
    </View>
  );
}

export function AuthForm({
  title,
  description,
  children,
}: PropsWithChildren<{ title: string; description: string }>) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;

  return (
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
            <PassportMark
              onColor={dark ? colors.primary : colors.primaryDark}
            />
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderTopColor: colors.accent,
                  borderColor: colors.border,
                },
                theme.shadows.lg,
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
      style={({ pressed }) => [
        styles.link,
        { opacity: pressed || disabled ? 0.6 : 1 },
      ]}
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
    <View
      style={[
        styles.messageBox,
        {
          backgroundColor: error
            ? theme.colors.error + '18'
            : theme.colors.softMint,
          borderColor: error ? theme.colors.error : theme.colors.primary,
        },
      ]}
    >
      <Feather
        name={error ? 'alert-circle' : 'info'}
        size={16}
        color={error ? theme.colors.error : theme.colors.primary}
      />
      <Text
        accessibilityRole={error ? 'alert' : undefined}
        accessibilityLiveRegion="polite"
        style={[
          styles.messageText,
          { color: error ? theme.colors.error : theme.colors.text },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  panel: { alignSelf: 'center', width: '100%', maxWidth: 480, gap: 24 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextContainer: { gap: 2 },
  wordmark: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 13, fontWeight: '500' },
  card: {
    borderRadius: 24,
    borderTopWidth: 4,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 22,
    gap: 16,
  },
  intro: { gap: 6 },
  description: { fontSize: 15, lineHeight: 22 },
  link: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  linkText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  messageText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
