import { Feather } from '@react-native-vector-icons/feather/static';
import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useCountryTheme } from '../../countries/countryTheme';
import { useFavourites, useIsFavourite } from '../hooks/useFavourites';

type Props = {
  countryCode: string;
  /** Size of the heart icon. Defaults to 21. */
  size?: number;
};

/**
 * Reusable animated favourite toggle button with Feather heart icons.
 *
 * - Spring bounce scale micro-interaction when pressed.
 * - Outlined heart when not saved.
 * - Filled/emphasized heart in accent color when saved.
 * - Large accessible touch target (48 dp minimum).
 * - Immediate visual and animated feedback.
 */
export function FavouriteButton({ countryCode, size = 21 }: Props) {
  const isFavourite = useIsFavourite(countryCode);
  const { toggle } = useFavourites();
  const { theme } = useCountryTheme();
  const pending = useRef(false);
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    if (pending.current) {
      return;
    }
    pending.current = true;

    // Micro-interaction spring bounce
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.25,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    toggle(countryCode);
    setTimeout(() => {
      pending.current = false;
    }, 200);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        isFavourite ? 'Remove from favourites' : 'Add to favourites'
      }
      accessibilityState={{ selected: isFavourite }}
      onPress={handlePress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isFavourite
            ? theme.colors.accent + '22'
            : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Feather
          name="heart"
          size={size}
          color={isFavourite ? theme.colors.accent : theme.colors.muted}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
