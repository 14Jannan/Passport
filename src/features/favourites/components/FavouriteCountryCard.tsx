import { Feather } from '@react-native-vector-icons/feather/static';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCountryTheme } from '../../countries/countryTheme';
import { CountryFlag } from '../../countries/components/CountryCard';
import type { Country } from '../../countries/types';
import { FavouriteButton } from './FavouriteButton';

/**
 * Compact country card for the Favourites screen.
 *
 * Shows flag, name, capital, region, a saved heart indicator, and a chevron
 * to open details. Reuses CountryFlag and the Passport design system.
 */
export function FavouriteCountryCard({
  country,
  onPress,
}: {
  country: Country;
  onPress: () => void;
}) {
  const { theme, strong } = useCountryTheme();
  const { colors } = theme;
  const capital = country.capitals.join(', ') || 'Capital unavailable';
  const region = country.region ?? 'Region unavailable';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Opens country details"
      accessibilityLabel={`${country.commonName}, ${capital}, ${region}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <CountryFlag country={country} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>
          {country.commonName}
        </Text>
        <Text style={{ color: colors.muted }}>{capital}</Text>
        <Text style={{ color: strong }}>{region}</Text>
      </View>
      <FavouriteButton countryCode={country.cca3} size={19} />
      <Feather name="chevron-right" size={21} color={strong} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: '700' },
});
