import { useId } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useAppTheme } from '../theme/theme';

type Props = TextInputProps & { label: string; error?: string };

export function AppTextInput({ label, error, style, ...props }: Props) {
  const id = useId();
  const { theme } = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text nativeID={id} style={{ color: theme.colors.text }}>
        {label}
      </Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        accessibilityLabelledBy={id}
        placeholderTextColor={theme.colors.muted}
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: theme.type.body,
            paddingHorizontal: theme.spacing.md,
          },
          style,
        ]}
      />
      {error && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ color: theme.colors.error }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ input: { minHeight: 48, borderWidth: 1 } });
