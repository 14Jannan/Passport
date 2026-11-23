import { Feather } from '@react-native-vector-icons/feather/static';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAppTheme } from '../theme/theme';

/**
 * One-tap light/dark switch. The icon spins and swaps between a sun and a
 * moon; the choice is persisted by the theme provider.
 */
export function ThemeToggleButton() {
  const { dark, setAppearance, theme } = useAppTheme();
  const { colors } = theme;
  const reduced = useReducedMotion();
  const spin = useRef(new Animated.Value(dark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(spin, {
      toValue: dark ? 1 : 0,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [dark, spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', reduced ? '0deg' : '360deg'],
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onPress={() => setAppearance(dark ? 'light' : 'dark')}
      hitSlop={6}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: dark ? colors.surfaceSecondary : colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Feather
          name={dark ? 'moon' : 'sun'}
          size={20}
          color={dark ? colors.gold : colors.accent}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
