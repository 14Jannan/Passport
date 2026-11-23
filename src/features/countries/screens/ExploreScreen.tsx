import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/store';
import { AppButton } from '../../../components/AppButton';
import { AppHeader } from '../../../components/AppHeader';
import { FadeInView } from '../../../components/FadeInView';
import { ThemeToggleButton } from '../../../components/ThemeToggleButton';
import type { MainStackParams } from '../../../navigation/types';
import { AppThemeOverride } from '../../../theme/theme';
import { useGetCountriesQuery } from '../api/countriesApi';
import { CountryCard } from '../components/CountryCard';
import { CountryListState } from '../components/CountryListState';
import { CountrySearchBar } from '../components/CountrySearchBar';
import { CountrySortModal } from '../components/CountrySortModal';
import { RegionFilterChips } from '../components/RegionFilterChips';
import { TrendingCarousel } from '../components/TrendingCarousel';
import { useCountryTheme } from '../countryTheme';
import { destinationPhotos } from '../data/photography';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import {
  defaultSort,
  filterCountries,
  sortCountries,
  type CountrySort,
  type Region,
} from '../utils/discovery';

function greetingFor(hour: number) {
  if (hour < 5) {
    return 'Night owl';
  }
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 18) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

function CardGap() {
  return <View style={styles.gap} />;
}

export function ExploreScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const user = useAppSelector(state =>
    state.session.status === 'signedIn' ? state.session.user : null,
  );
  const firstName = user?.firstName?.trim() ?? '';
  const initials = `${user?.firstName?.[0] ?? ''}${
    user?.lastName?.[0] ?? ''
  }`.toUpperCase();

  const { theme, tint, strong } = useCountryTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const network = useNetInfo();
  const offline =
    (network.isInternetReachable ?? network.isConnected) === false;
  const { data, isLoading, isFetching, isError, refetch } =
    useGetCountriesQuery(undefined, {
      refetchOnReconnect: true,
      refetchOnMountOrArgChange: 300,
    });

  const search = useDebouncedSearch();
  const [region, setRegion] = useState<Region>('All');
  const [sort, setSort] = useState<CountrySort>(defaultSort);

  const countries = useMemo(
    () =>
      sortCountries(filterCountries(data ?? [], search.query, region), sort),
    [data, region, search.query, sort],
  );

  // Destinations with curated photography, in editorial order.
  const trending = useMemo(() => {
    if (!data) {
      return [];
    }
    const byCode = new Map(data.map(country => [country.cca3, country]));
    return Object.keys(destinationPhotos)
      .map(code => byCode.get(code))
      .filter((country): country is NonNullable<typeof country> => !!country);
  }, [data]);

  function clearFilters() {
    search.change('');
    setRegion('All');
  }

  function refresh() {
    if (!isFetching) {
      refetch();
    }
  }

  const showFeatured = trending.length > 0 && region === 'All' && !search.query;

  const header = (
    <View style={styles.header}>
      {/* Hero Welcome Header */}
      <View
        style={[
          styles.hero,
          { backgroundColor: tint, borderLeftColor: colors.accent },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greeting, { color: strong }]}>
              {greetingFor(new Date().getHours())}
              {firstName ? `, ${firstName}` : ''} ✈️
            </Text>
            <AppHeader title="Where to next?" />
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Discover your next destination
            </Text>
          </View>
          <View style={styles.heroActions}>
            <ThemeToggleButton />
            {initials ? (
              <View
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
                  {initials}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      {/* Featured Destination Hero Banner */}
      {showFeatured ? (
        <View style={styles.featuredSection}>
          <TrendingCarousel
            countries={trending}
            onOpen={country =>
              navigation.navigate('CountryDetails', {
                countryCode: country.cca3,
              })
            }
          />
        </View>
      ) : null}

      {/* Search and Filters */}
      <CountrySearchBar value={search.text} onChange={search.change} />
      <RegionFilterChips value={region} onChange={setRegion} />
      <CountrySortModal value={sort} onChange={setSort} />

      {isError && data ? (
        <View style={styles.notice}>
          <Text accessibilityLiveRegion="polite" style={{ color: colors.text }}>
            {offline
              ? 'You’re offline. Showing the last loaded countries.'
              : 'Could not refresh. Showing the last loaded countries.'}
          </Text>
          <AppButton
            label="Retry refresh"
            onPress={refresh}
            loading={isFetching}
          />
        </View>
      ) : null}

      {data ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.count, { color: colors.muted }]}
        >
          {countries.length} {countries.length === 1 ? 'country' : 'countries'}
        </Text>
      ) : null}
    </View>
  );

  return (
    <AppThemeOverride.Provider value={theme}>
      <FlatList
        testID="country-list"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        ListEmptyComponent={
          <CountryListState
            loading={!data && (isLoading || isFetching)}
            failed={!data && isError}
            offline={offline}
            retry={refresh}
            clearFilters={
              region !== 'All' || search.query ? clearFilters : undefined
            }
          />
        }
        ItemSeparatorComponent={CardGap}
        data={countries}
        keyExtractor={item => item.cca3}
        renderItem={({ item, index }) => (
          <FadeInView delay={index < 8 ? index * 45 : 0}>
            <CountryCard
              country={item}
              onPress={() =>
                navigation.navigate('CountryDetails', {
                  countryCode: item.cca3,
                })
              }
            />
          </FadeInView>
        )}
        refreshing={!!data && isFetching}
        onRefresh={refresh}
      />
    </AppThemeOverride.Provider>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 96, // Comfortable padding above floating bottom navigation
  },
  header: { gap: 14, paddingBottom: 12 },
  hero: {
    padding: 18,
    borderRadius: 20,
    borderLeftWidth: 4,
    gap: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
    gap: 4,
  },
  greeting: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  featuredSection: {
    marginVertical: 4,
  },
  notice: { gap: 8 },
  count: { fontSize: 14, fontWeight: '600', paddingHorizontal: 2 },
  gap: { height: 12 },
});
