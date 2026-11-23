import { Feather } from '@react-native-vector-icons/feather/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/store';
import { AppHeader } from '../../../components/AppHeader';
import { EmptyState } from '../../../components/EmptyState';
import { FadeInView } from '../../../components/FadeInView';
import type { MainStackParams } from '../../../navigation/types';
import { useAppTheme } from '../../../theme/theme';
import { useGetCountriesQuery } from '../../countries/api/countriesApi';
import type { Country } from '../../countries/types';
import {
  selectBucketStatusCounts,
  selectFavouriteCount,
  selectFavouritesByStatus,
} from '../../favourites/store/favouritesSelectors';
import {
  BUCKET_STATUSES,
  bucketStatusMeta,
  type BucketStatus,
} from '../../favourites/types/favourite.types';
import { BucketCountryCard } from '../components/BucketCountryCard';
import { useStatusColor } from '../components/BucketStatusBadge';
import {
  BucketStatusSheet,
  type StatusTarget,
} from '../components/BucketStatusSheet';

type Navigation = NativeStackNavigationProp<MainStackParams>;

const emptyCopy: Record<
  BucketStatus,
  { title: string; description: string; icon: string }
> = {
  want_to_visit: {
    title: 'No dream destinations yet',
    description:
      'Countries you save start here. Explore the world and save a place you would love to visit.',
    icon: 'star',
  },
  planning: {
    title: 'Nothing in planning',
    description:
      'Move a dream destination to Planning when you start organising the trip.',
    icon: 'map',
  },
  visited: {
    title: 'No visited countries yet',
    description:
      'Mark a country as Visited after your trip, then capture the memory in your journal.',
    icon: 'check-circle',
  },
};

function StatusChip({
  status,
  count,
  selected,
  onPress,
}: {
  status: BucketStatus;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const tone = useStatusColor(status);
  const meta = bucketStatusMeta[status];
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={`${meta.label}, ${count} ${
        count === 1 ? 'country' : 'countries'
      }`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? tone + '24' : colors.surface,
          borderColor: selected ? tone : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.chipTop}>
        <Feather name={meta.icon} size={16} color={tone} />
        <Text style={[styles.chipCount, { color: colors.text }]}>{count}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.chipLabel,
          { color: selected ? colors.text : colors.muted },
        ]}
      >
        {meta.label}
      </Text>
    </Pressable>
  );
}

function CardGap() {
  return <View style={styles.gap} />;
}

export function BucketListScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [status, setStatus] = useState<BucketStatus>('want_to_visit');
  const [sheet, setSheet] = useState<StatusTarget | null>(null);

  const counts = useAppSelector(selectBucketStatusCounts);
  const total = useAppSelector(selectFavouriteCount);
  const favourites = useAppSelector(state =>
    selectFavouritesByStatus(state, status),
  );
  const { data: countries, isLoading } = useGetCountriesQuery();

  const items = useMemo(() => {
    const byCode = new Map(
      (countries ?? []).map(country => [country.cca3, country]),
    );
    return favourites
      .map(favourite => byCode.get(favourite.countryCode))
      .filter((country): country is Country => !!country);
  }, [countries, favourites]);

  const visitedShare = total ? counts.visited / total : 0;

  const header = (
    <View style={styles.header}>
      <FadeInView
        style={[
          styles.hero,
          { backgroundColor: colors.surface, borderColor: colors.border },
          theme.shadows.sm,
        ]}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={[styles.kicker, { color: colors.gold }]}>
              BUCKET LIST
            </Text>
            <AppHeader title="My Travel Bucket List" />
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Dream it. Plan it. Explore it.
            </Text>
          </View>
          <View style={[styles.stamp, { borderColor: colors.stamp + '66' }]}>
            <Feather name="flag" size={22} color={colors.stamp} />
          </View>
        </View>
        <View
          accessible
          accessibilityLabel={`${counts.visited} of ${total} saved countries visited`}
          style={styles.progressBlock}
        >
          <View style={styles.progressLabels}>
            <Text style={[styles.progressText, { color: colors.text }]}>
              {counts.visited} of {total} visited
            </Text>
            <Text style={[styles.progressText, { color: colors.muted }]}>
              {Math.round(visitedShare * 100)}%
            </Text>
          </View>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.success,
                  width: `${visitedShare * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </FadeInView>

      <View accessibilityRole="tablist" style={styles.chips}>
        {BUCKET_STATUSES.map(option => (
          <StatusChip
            key={option}
            status={option}
            count={counts[option]}
            selected={option === status}
            onPress={() => setStatus(option)}
          />
        ))}
      </View>
    </View>
  );

  const goExplore = () => navigation.navigate('Home', { screen: 'Discover' });
  const goFavourites = () => navigation.navigate('Home', { screen: 'Saved' });
  const nextStatus: BucketStatus | null =
    status === 'want_to_visit' ? null : 'want_to_visit';

  const empty =
    total === 0 ? (
      <EmptyState
        icon="flag"
        title="Your bucket list is empty"
        description="Save countries to your favourites and they will appear here, ready to plan."
        action={{ label: 'Explore Countries', onPress: goExplore }}
      />
    ) : isLoading ? null : (
      <EmptyState
        icon={emptyCopy[status].icon}
        title={emptyCopy[status].title}
        description={emptyCopy[status].description}
        action={
          nextStatus
            ? {
                label: 'Change Status',
                onPress: () => setStatus(nextStatus),
              }
            : { label: 'Explore Countries', onPress: goExplore }
        }
        secondaryAction={{ label: 'View Favourites', onPress: goFavourites }}
      />
    );

  return (
    <>
      <FlatList
        testID="bucket-list"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        data={items}
        keyExtractor={item => item.cca3}
        extraData={status}
        ListHeaderComponent={header}
        ItemSeparatorComponent={CardGap}
        ListEmptyComponent={empty}
        renderItem={({ item, index }) => (
          <FadeInView
            key={`${status}-${item.cca3}`}
            delay={Math.min(index, 5) * 60}
          >
            <BucketCountryCard
              country={item}
              status={status}
              onOpenDetails={() =>
                navigation.navigate('CountryDetails', {
                  countryCode: item.cca3,
                })
              }
              onOpenJournal={() =>
                navigation.navigate('JournalEditor', {
                  countryCode: item.cca3,
                })
              }
              onChangeStatus={() =>
                setSheet({
                  countryCode: item.cca3,
                  countryName: item.commonName,
                })
              }
            />
          </FadeInView>
        )}
      />
      <BucketStatusSheet target={sheet} onClose={() => setSheet(null)} />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 110,
  },
  header: { gap: 14, paddingBottom: 14 },
  hero: {
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 16,
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroCopy: { flex: 1, gap: 4 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  subtitle: { fontSize: 16 },
  stamp: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBlock: { gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: { fontSize: 13, fontWeight: '700' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  chips: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 4,
    minHeight: 72,
  },
  chipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipCount: { fontSize: 22, fontWeight: '800' },
  chipLabel: { fontSize: 13, fontWeight: '700' },
  gap: { height: 14 },
});
