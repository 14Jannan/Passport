import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../../../app/store';
import { AppButton } from '../../../components/AppButton';
import { AppHeader } from '../../../components/AppHeader';
import type { MainStackParams } from '../../../navigation/types';
import { AppThemeOverride } from '../../../theme/theme';
import { useGetCountriesQuery } from '../api/countriesApi';
import { CountryCard } from '../components/CountryCard';
import { CountryListState } from '../components/CountryListState';
import { CountrySearchBar } from '../components/CountrySearchBar';
import { CountrySortModal } from '../components/CountrySortModal';
import { FeaturedDestinationCard } from '../components/FeaturedDestinationCard';
import { RegionFilterChips } from '../components/RegionFilterChips';
import { useCountryTheme } from '../countryTheme';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import {
  defaultSort,
  filterCountries,
  sortCountries,
  type CountrySort,
  type Region,
} from '../utils/discovery';

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

  // Pick a featured destination from the catalog (Japan or first available)
  const featuredCountry = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }
    return data.find(c => c.cca3 === 'JPN') ?? data[0];
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

  const showFeatured = featuredCountry && region === 'All' && !search.query;

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
            {firstName ? (
              <Text style={[styles.greeting, { color: strong }]}>
                Hello, {firstName} 👋
              </Text>
            ) : null}
            <AppHeader title="Where to next?" />
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Discover your next destination
            </Text>
          </View>
          {initials ? (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: colors.onPrimary }]}>
                {initials}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Featured Destination Hero Banner */}
      {showFeatured ? (
        <View style={styles.featuredSection}>
          <FeaturedDestinationCard
            country={featuredCountry}
            onPress={() =>
              navigation.navigate('CountryDetails', {
                countryCode: featuredCountry.cca3,
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
        contentContainerStyle={styles.content}
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
        renderItem={({ item }) => (
          <CountryCard
            country={item}
            onPress={() =>
              navigation.navigate('CountryDetails', { countryCode: item.cca3 })
            }
          />
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
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
