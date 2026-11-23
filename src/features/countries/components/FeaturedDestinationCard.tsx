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
import { useCountryTheme } from '../countryTheme';
import { getCountryPhotography } from '../data/photography';
import type { Country } from '../types';

interface FeaturedDestinationCardProps {
  country: Country;
  onPress: () => void;
}

export function FeaturedDestinationCard({
  country,
  onPress,
}: FeaturedDestinationCardProps) {
  const { theme } = useCountryTheme();
  const photo = getCountryPhotography(country.cca3);
  const scale = useRef(new Animated.Value(1)).current;

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

  const imageUrl = photo?.imageUrl ?? country.flagUrl;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Featured destination: ${country.commonName}, ${country.region}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
          theme.shadows.lg,
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            resizeMode="cover"
            style={styles.image}
          />
        ) : (
          <View
            style={[
              styles.fallback,
              { backgroundColor: theme.colors.primaryDark },
            ]}
          >
            <Feather name="compass" size={48} color="#FFFFFF" />
          </View>
        )}

        <View style={styles.gradientOverlay} />

        {/* Top Badges */}
        <View style={styles.topRow}>
          <View
            style={[styles.badge, { backgroundColor: theme.colors.accent }]}
          >
            <Feather name="star" size={12} color="#FFFFFF" />
            <Text style={styles.badgeText}>FEATURED</Text>
          </View>
          {country.flagUrl && (
            <View style={styles.flagBadge}>
              <Image
                source={{ uri: country.flagUrl }}
                resizeMode="cover"
                style={styles.flagIcon}
              />
              <Text style={styles.flagCode}>{country.cca3}</Text>
            </View>
          )}
        </View>

        {/* Bottom Content */}
        <View style={styles.content}>
          <Text style={styles.region}>{country.region?.toUpperCase()}</Text>
          <Text style={styles.title}>{country.commonName}</Text>
          {photo?.title && <Text style={styles.subtitle}>{photo.title}</Text>}

          <View style={styles.actionRow}>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>Explore Destination</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16, 27, 36, 0.45)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    zIndex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 27, 36, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  flagIcon: {
    width: 20,
    height: 14,
    borderRadius: 3,
  },
  flagCode: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 4,
    zIndex: 1,
  },
  region: {
    color: '#FFB49E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '400',
  },
  actionRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
