import { Feather } from '@react-native-vector-icons/feather/static';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useCountryTheme } from '../countryTheme';

export function CountrySearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { theme, strong } = useCountryTheme();
  const { colors } = theme;
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.frame,
        {
          borderColor: focused ? colors.primary : colors.border,
          borderWidth: focused ? 1.5 : 1,
          backgroundColor: colors.surface,
        },
        theme.shadows.sm,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Feather name="search" size={20} color={strong} />
      </View>
      <TextInput
        accessibilityLabel="Search countries"
        placeholder="Search destinations by name or code..."
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={Keyboard.dismiss}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, { color: colors.text }]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChange('')}
          style={styles.clear}
        >
          <Feather name="x" color={strong} size={18} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
  },
  input: { flex: 1, minHeight: 50, paddingHorizontal: 10, fontSize: 16 },
  clear: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
