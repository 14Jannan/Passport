import { Feather } from '@react-native-vector-icons/feather/static';
import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FavouriteButton } from '../../favourites/components/FavouriteButton';
import { useCountryTheme } from '../countryTheme';
import { getCountryPhotography } from '../data/photography';
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
          resizeMode="cover"
          style={styles.image}
          onError={() => setFailedUrl(flagUrl)}
        />
      ) : (
        <Feather name="flag" size={large ? 48 : 22} color={strong} />
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
  const photo = getCountryPhotography(country.cca3);
  const scale = useRef(new Animated.Value(1)).current;

  const capital = country.capitals.join(', ') || 'Capital unavailable';
  const region = country.region ?? 'Region unavailable';
  const population =
    country.population === null
      ? null
      : compactPopulation.format(country.population);

  function handlePressIn() {
    Animated.timing(scale, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Opens country details"
        accessibilityLabel={`${country.commonName}, ${capital}, ${region}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.88 : 1,
          },
          theme.shadows.md,
        ]}
      >
        {photo?.thumbnailUrl ? (
          <View style={styles.photoContainer}>
            <Image
              source={{ uri: photo.thumbnailUrl }}
              resizeMode="cover"
              style={styles.photo}
            />
            <View style={styles.flagOverlay}>
              <CountryFlag country={country} />
            </View>
          </View>
        ) : (
          <CountryFlag country={country} />
        )}

        <View style={styles.copy}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {country.commonName}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.capital, { color: colors.muted }]}
          >
            {capital}
          </Text>
          <Text numberOfLines={1} style={[styles.meta, { color: strong }]}>
            {region}
            {population !== null ? ` · ${population} people` : ''}
          </Text>
        </View>

        <FavouriteButton countryCode={country.cca3} size={19} />
        <Feather name="chevron-right" size={20} color={strong} />
      </Pressable>
    </Animated.View>
  );
}

export const countryCardHeight = 112;

const styles = StyleSheet.create({
  card: {
    minHeight: countryCardHeight,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    width: 72,
    height: 72,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  flagOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    transform: [{ scale: 0.65 }],
    transformOrigin: 'bottom right',
  },
  flag: {
    width: 60,
    height: 42,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFlag: { width: '100%', height: 180 },
  image: { width: '100%', height: '100%' },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: '700' },
  capital: { fontSize: 14 },
  meta: { fontSize: 13, fontWeight: '600' },
});
