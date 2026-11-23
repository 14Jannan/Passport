import { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useCountryTheme } from '../countryTheme';
import type { Country } from '../types';
import { FeaturedDestinationCard } from './FeaturedDestinationCard';

const GAP = 12;

/**
 * Swipeable "Trending destinations" rail. Cards snap into place, the centred
 * card grows while its neighbours shrink and dim, and dots track progress.
 */
export function TrendingCarousel({
  countries,
  onOpen,
}: {
  countries: Country[];
  onOpen: (country: Country) => void;
}) {
  const { width } = useWindowDimensions();
  const { theme, strong } = useCountryTheme();
  const reduced = useReducedMotion();
  const scrollX = useRef(new Animated.Value(0)).current;
  const cardWidth = Math.min(width - 64, 560);
  const interval = cardWidth + GAP;

  if (countries.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: theme.colors.text }]}
        >
          Trending destinations
        </Text>
        <Text style={[styles.hint, { color: strong }]}>Swipe ›</Text>
      </View>
      <Animated.FlatList
        horizontal
        data={countries}
        keyExtractor={item => item.cca3}
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        contentContainerStyle={styles.rail}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * interval,
            index * interval,
            (index + 1) * interval,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: reduced ? [1, 1, 1] : [0.92, 1, 0.92],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: reduced ? [1, 1, 1] : [0.65, 1, 0.65],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              style={{ width: cardWidth, transform: [{ scale }], opacity }}
            >
              <FeaturedDestinationCard
                country={item}
                onPress={() => onOpen(item)}
              />
            </Animated.View>
          );
        }}
      />
      <View style={styles.dots} importantForAccessibility="no-hide-descendants">
        {countries.map((country, index) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [
              (index - 1) * interval,
              index * interval,
              (index + 1) * interval,
            ],
            outputRange: [1, 2.6, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={country.cca3}
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [{ scaleX: dotWidth }],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, marginHorizontal: -16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 18,
  },
  title: { fontSize: 20, fontWeight: '800' },
  hint: { fontSize: 13, fontWeight: '700' },
  rail: { paddingHorizontal: 16, gap: GAP },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
