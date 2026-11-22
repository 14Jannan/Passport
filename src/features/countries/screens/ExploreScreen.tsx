import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAppSelector } from '../../../app/store';
import { AppButton } from '../../../components/AppButton';
import { AppHeader } from '../../../components/AppHeader';
import type { MainStackParams } from '../../../navigation/types';
import { AppThemeOverride } from '../../../theme/theme';
import { useGetCountriesQuery } from '../api/countriesApi';
import { CountryCard } from '../components/CountryCard';
import { CountryListState } from '../components/CountryListState';
import { useCountryTheme } from '../countryTheme';

function CardGap() {
  return <View style={styles.gap} />;
}

export function ExploreScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const firstName = useAppSelector(state =>
    state.session.status === 'signedIn'
      ? state.session.user.firstName.trim()
      : '',
  );
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

  function refresh() {
    if (!isFetching) {
      refetch();
    }
  }

  const header = (
    <View style={styles.header}>
      <View
        style={[
          styles.hero,
          { backgroundColor: tint, borderLeftColor: colors.accent },
        ]}
      >
        {firstName ? (
          <Text style={[styles.greeting, { color: strong }]}>
            Hello, {firstName}
          </Text>
        ) : null}
        <AppHeader title="Where to next?" />
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Discover your next destination
        </Text>
      </View>
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
          {data.length} {data.length === 1 ? 'country' : 'countries'}
        </Text>
      ) : null}
    </View>
  );

  return (
    <AppThemeOverride.Provider value={theme}>
      <FlatList
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
          />
        }
        ItemSeparatorComponent={CardGap}
        data={data}
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
    paddingBottom: 24,
  },
  header: { gap: 14, paddingBottom: 12 },
  hero: { padding: 18, borderRadius: 16, borderLeftWidth: 3, gap: 5 },
  greeting: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 16 },
  notice: { gap: 8 },
  count: { fontSize: 14, fontWeight: '600' },
  gap: { height: 10 },
});
