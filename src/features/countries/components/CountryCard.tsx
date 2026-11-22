import { Feather } from '@react-native-vector-icons/feather/static';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FavouriteButton } from '../../favourites/components/FavouriteButton';
import { useCountryTheme } from '../countryTheme';
import type { Country } from '../types';

const compactPopulation = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function CountryFlag({
  country,
  large = false,
}: {
  country: Country;
  large?: boolean;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const { theme, tint, strong } = useCountryTheme();
  const { flagUrl, flagAlt, commonName } = country;
  return (
    <View
      style={[
        styles.flag,
        large && styles.heroFlag,
        { backgroundColor: tint, borderColor: theme.colors.border },
      ]}
    >
      {flagUrl && flagUrl !== failedUrl ? (
        <Image
          accessible
          accessibilityLabel={flagAlt ?? `Flag of ${commonName}`}
          source={{ uri: flagUrl }}
          resizeMode="contain"
          style={styles.image}
          onError={() => setFailedUrl(flagUrl)}
        />
      ) : (
        <Feather name="flag" size={large ? 48 : 23} color={strong} />
      )}
    </View>
  );
}

export function CountryCard({
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
  const population =
    country.population === null
      ? null
      : compactPopulation.format(country.population);
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
        <Text style={{ color: strong }}>
          {region}
          {population !== null ? ` · ${population} people` : ''}
        </Text>
      </View>
      <FavouriteButton countryCode={country.cca3} size={17} />
      <Feather name="chevron-right" size={21} color={strong} />
    </Pressable>
  );
}

export const countryCardHeight = 104;

const styles = StyleSheet.create({
  card: {
    minHeight: countryCardHeight,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: 60,
    height: 42,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFlag: { width: '100%', height: 180 },
  image: { width: '100%', height: '100%' },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: '700' },
});
