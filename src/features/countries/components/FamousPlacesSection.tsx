import { Feather } from '@react-native-vector-icons/feather/static';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PressableScale } from '../../../components/PressableScale';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import {
  useGetFamousPlacesQuery,
  type FamousPlace,
} from '../api/famousPlacesApi';
import { useCountryTheme } from '../countryTheme';
import type { Country } from '../types';
import { CommonsImage } from './CommonsImage';
import { PlaceViewerModal } from './PlaceViewerModal';

const CARD_WIDTH = 210;
const CARD_GAP = 12;

function SkeletonTile() {
  const { tint } = useCountryTheme();
  const reduced = useReducedMotion();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (reduced) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  return (
    <Animated.View
      importantForAccessibility="no"
      style={[styles.card, { backgroundColor: tint, opacity: pulse }]}
    />
  );
}

function PlaceCard({
  place,
  position,
  onPress,
}: {
  place: FamousPlace;
  position: number;
  onPress: () => void;
}) {
  const { theme } = useCountryTheme();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${place.title}${
        place.description ? `, ${place.description}` : ''
      }`}
      accessibilityHint="Opens the photo in full screen"
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: theme.colors.surfaceSecondary },
        theme.shadows.md,
      ]}
    >
      <CommonsImage
        url={place.imageUrl}
        label={`Photo of ${place.title}`}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardShade} />
      <View style={[styles.rankBadge, { backgroundColor: theme.colors.gold }]}>
        <Text style={styles.rankText}>{String(position).padStart(2, '0')}</Text>
      </View>
      <View style={styles.cardCopy}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {place.title}
        </Text>
        {place.description && (
          <Text numberOfLines={1} style={styles.cardDesc}>
            {place.description}
          </Text>
        )}
      </View>
    </PressableScale>
  );
}

/**
 * Horizontal, snapping gallery of a country's famous places with a
 * full-screen swipeable viewer.
 */
export function FamousPlacesSection({ country }: { country: Country }) {
  const { theme, strong } = useCountryTheme();
  const { colors } = theme;
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const { data, isFetching, isError, refetch } = useGetFamousPlacesQuery({
    code: country.cca3,
    name: country.commonName,
  });
  const places = data ?? [];

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.surface, borderColor: colors.border },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.accent }]}>
          <Feather name="camera" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.headerCopy}>
          <Text
            accessibilityRole="header"
            style={[styles.heading, { color: colors.text }]}
          >
            Famous places
          </Text>
          <Text style={[styles.subheading, { color: colors.muted }]}>
            Iconic sights to discover in {country.commonName}
          </Text>
        </View>
      </View>

      {places.length > 0 ? (
        <FlatList
          horizontal
          data={places}
          keyExtractor={item => item.id}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={styles.rail}
          renderItem={({ item, index }) => (
            <PlaceCard
              place={item}
              position={index + 1}
              onPress={() => setViewerIndex(index)}
            />
          )}
        />
      ) : isFetching ? (
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading famous places"
          style={styles.rail}
        >
          <SkeletonTile />
          <SkeletonTile />
        </View>
      ) : isError ? (
        <View style={styles.message}>
          <Text style={{ color: colors.muted }}>
            Could not load famous places right now.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading famous places"
            onPress={refetch}
            style={[styles.retry, { borderColor: strong }]}
          >
            <Feather name="refresh-cw" size={14} color={strong} />
            <Text style={[styles.retryText, { color: strong }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={[styles.message, { color: colors.muted }]}>
          No landmark photos found for {country.commonName} yet.
        </Text>
      )}

      {places.length > 0 && (
        <Text style={[styles.credit, { color: colors.muted }]}>
          Photos via Wikimedia Commons · Tap a place to explore
        </Text>
      )}

      <PlaceViewerModal
        places={places}
        index={viewerIndex}
        countryName={country.commonName}
        onClose={() => setViewerIndex(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 18,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 2 },
  heading: { fontSize: 20, fontWeight: '800' },
  subheading: { fontSize: 13 },
  rail: { paddingHorizontal: 18, gap: CARD_GAP, flexDirection: 'row' },
  card: {
    width: CARD_WIDTH,
    height: 250,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  cardShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 8, 18, 0.32)',
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rankText: { color: '#1A1205', fontWeight: '800', fontSize: 12 },
  cardCopy: {
    padding: 14,
    gap: 2,
    backgroundColor: 'rgba(5, 8, 18, 0.45)',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  cardDesc: { color: 'rgba(255,255,255,0.82)', fontSize: 12 },
  message: { paddingHorizontal: 18, gap: 10 },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  retryText: { fontWeight: '700' },
  credit: { fontSize: 11, paddingHorizontal: 18 },
});
