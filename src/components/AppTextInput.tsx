import { useId, useState, type ReactNode, type Ref } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useAppTheme } from '../theme/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  inputRef?: Ref<TextInput>;
  endAccessory?: ReactNode;
};

export function AppTextInput({
  label,
  error,
  style,
  inputRef,
  endAccessory,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text nativeID={id} style={[styles.label, { color: colors.text }]}>
        {label}
      </Text>
      <View
        style={[
          styles.frame,
          {
            borderColor: error
              ? colors.error
              : focused
              ? colors.primary
              : colors.border,
            borderWidth: focused || error ? 1.5 : 1,
            borderRadius: theme.radius.md,
            backgroundColor: colors.surface,
          },
          theme.shadows.sm,
        ]}
      >
        <TextInput
          {...props}
          ref={inputRef}
          accessibilityLabel={label}
          accessibilityLabelledBy={id}
          placeholderTextColor={colors.muted}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            {
              color: colors.text,
              fontSize: theme.type.body,
              paddingHorizontal: theme.spacing.md,
            },
            style,
          ]}
        />
        {endAccessory}
      </View>
      {error && (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.errorText, { color: colors.error }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600' },
  frame: { flexDirection: 'row', alignItems: 'center' },
  input: { minHeight: 50, flex: 1 },
  errorText: { fontSize: 13, marginTop: 2 },
});
