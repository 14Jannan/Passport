import { Feather } from '@react-native-vector-icons/feather/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { EmptyState } from '../../../components/EmptyState';
import type { MainStackParams } from '../../../navigation/types';
import { AppThemeOverride } from '../../../theme/theme';
import {
  BucketStatusSheet,
  type StatusTarget,
} from '../../bucketList/components/BucketStatusSheet';
import { useGetCountriesQuery } from '../../countries/api/countriesApi';
import { useCountryTheme } from '../../countries/countryTheme';
import type { Country } from '../../countries/types';
import { FavouriteCountryCard } from '../components/FavouriteCountryCard';
import { useFavourites } from '../hooks/useFavourites';

function CardGap() {
  return <View style={styles.gap} />;
}

export function FavouritesScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const insets = useSafeAreaInsets();
  const { theme, tint, strong } = useCountryTheme();
  const { colors } = theme;

  const { favourites, count, error } = useFavourites();
  const { data: allCountries } = useGetCountriesQuery();

  const [searchText, setSearchText] = useState('');
  const [focused, setFocused] = useState(false);
  const [statusTarget, setStatusTarget] = useState<StatusTarget | null>(null);
  const query = searchText.trim().toLowerCase();

  // Build the list of favourite countries using the API data for rendering.
  const favouriteCountries = useMemo(() => {
    if (!allCountries) {
      return [];
    }
    const countryMap = new Map<string, Country>();
    for (const c of allCountries) {
      countryMap.set(c.cca3, c);
    }
    const result: Country[] = [];
    for (const fav of favourites) {
      const country = countryMap.get(fav.countryCode);
      if (country) {
        result.push(country);
      }
    }
    return result;
  }, [allCountries, favourites]);

  // Apply search filter.
  const filteredCountries = useMemo(() => {
    if (!query) {
      return favouriteCountries;
    }
    return favouriteCountries.filter(
      c =>
        c.commonName.toLowerCase().includes(query) ||
        c.officialName?.toLowerCase().includes(query),
    );
  }, [favouriteCountries, query]);

  function clearSearch() {
    setSearchText('');
  }

  const noFavourites = count === 0;
  const noSearchResults = !noFavourites && filteredCountries.length === 0;

  const header = (
    <View style={styles.headerBlock}>
      <View
        style={[
          styles.hero,
          { backgroundColor: tint, borderLeftColor: colors.accent },
          theme.shadows.sm,
        ]}
      >
        <View style={styles.heroTop}>
          <View style={styles.heroTitles}>
            <AppHeader title="My Favourites" />
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Your personal travel wishlist
            </Text>
          </View>
          <View
            style={[styles.countBadge, { backgroundColor: colors.primary }]}
          >
            <Feather name="bookmark" size={14} color={colors.onPrimary} />
            <Text style={[styles.countText, { color: colors.onPrimary }]}>
              {count}
            </Text>
          </View>
        </View>
      </View>

      {error && (
        <View
          accessibilityRole="alert"
          style={[styles.errorBanner, { backgroundColor: colors.error + '18' }]}
        >
          <Feather name="alert-circle" size={16} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Search bar — only shown when there are favourites */}
      {!noFavourites && (
        <View
          style={[
            styles.searchFrame,
            {
              borderColor: focused ? colors.primary : colors.border,
              backgroundColor: colors.surface,
            },
            theme.shadows.sm,
          ]}
        >
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Feather name="search" size={20} color={strong} />
          </View>
          <TextInput
            accessibilityLabel="Search saved countries"
            placeholder="Search saved countries..."
            placeholderTextColor={colors.muted}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={Keyboard.dismiss}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchText.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={clearSearch}
              style={styles.clearButton}
            >
              <Feather name="x" color={strong} size={20} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  const emptyContent = noFavourites ? (
    <EmptyState
      title="No favourite countries yet"
      description="Explore the world and save places you would love to visit."
      action={{
        label: 'Explore Countries',
        onPress: () => navigation.navigate('Home', { screen: 'Discover' }),
      }}
    />
  ) : noSearchResults ? (
    <EmptyState
      title="No saved countries found"
      description={`No results for "${searchText.trim()}".`}
      action={{ label: 'Clear Search', onPress: clearSearch }}
    />
  ) : null;

  return (
    <AppThemeOverride.Provider value={theme}>
      <FlatList
        testID="favourites-list"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={header}
        ListEmptyComponent={emptyContent}
        ItemSeparatorComponent={CardGap}
        data={filteredCountries}
        keyExtractor={item => item.cca3}
        renderItem={({ item }) => (
          <FavouriteCountryCard
            country={item}
            onPress={() =>
              navigation.navigate('CountryDetails', {
                countryCode: item.cca3,
              })
            }
            onChangeStatus={() =>
              setStatusTarget({
                countryCode: item.cca3,
                countryName: item.commonName,
              })
            }
          />
        )}
      />
      <BucketStatusSheet
        target={statusTarget}
        onClose={() => setStatusTarget(null)}
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
    paddingBottom: 96,
  },
  headerBlock: { gap: 14, paddingBottom: 12 },
  hero: {
    padding: 18,
    borderRadius: 20,
    borderLeftWidth: 4,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitles: {
    flex: 1,
    gap: 4,
  },
  subtitle: { fontSize: 16 },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorText: { flex: 1, fontSize: 14 },
  searchFrame: {
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  clearButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gap: { height: 12 },
});
