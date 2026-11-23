import { Feather } from '@react-native-vector-icons/feather/static';
import { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CountryFlag } from '../../countries/components/CountryCard';
import { useCountryTheme } from '../../countries/countryTheme';
import { getCountryPhotography } from '../../countries/data/photography';
import type { Country } from '../../countries/types';
import { FavouriteButton } from './FavouriteButton';

/**
 * Premium country card for the Favourites wishlist screen.
 *
 * Shows destination photography, flag, name, capital, region,
 * an animated heart indicator, and a chevron to open details.
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
  const photo = getCountryPhotography(country.cca3);
  const scale = useRef(new Animated.Value(1)).current;

  const capital = country.capitals.join(', ') || 'Capital unavailable';
  const region = country.region ?? 'Region unavailable';

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
          <Text numberOfLines={1} style={{ color: colors.muted }}>
            {capital}
          </Text>
          <Text numberOfLines={1} style={{ color: strong, fontWeight: '600' }}>
            {region}
          </Text>
        </View>

        <FavouriteButton
          countryCode={country.cca3}
          countryName={country.commonName}
          size={20}
        />
        <Feather name="chevron-right" size={20} color={strong} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 96,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    width: 64,
    height: 64,
    borderRadius: 14,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 17, fontWeight: '700' },
});
