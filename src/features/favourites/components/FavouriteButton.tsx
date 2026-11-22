import { Feather } from '@react-native-vector-icons/feather/static';
import { useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useCountryTheme } from '../../countries/countryTheme';
import { useIsFavourite, useFavourites } from '../hooks/useFavourites';

type Props = {
  countryCode: string;
  /** Size of the heart icon. Defaults to 21. */
  size?: number;
};

/**
 * Reusable favourite toggle button with Feather heart icons.
 *
 * - Outlined heart when not saved.
 * - Filled/emphasized heart in accent color when saved.
 * - Large enough touch target (48 dp minimum).
 * - Accessible labels.
 * - Prevents accidental navigation (stopPropagation).
 */
export function FavouriteButton({ countryCode, size = 21 }: Props) {
  const isFavourite = useIsFavourite(countryCode);
  const { toggle } = useFavourites();
  const { theme } = useCountryTheme();
  const pending = useRef(false);

  function handlePress() {
    if (pending.current) {
      return;
    }
    pending.current = true;
    toggle(countryCode);
    // Reset after a short delay to prevent accidental rapid double-tap.
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
      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Feather
        name={isFavourite ? 'heart' : 'heart'}
        size={size}
        color={isFavourite ? theme.colors.accent : theme.colors.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
