import { skipToken } from '@reduxjs/toolkit/query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/AppButton';
import { EmptyState } from '../../../components/EmptyState';
import { ScreenLayout } from '../../../components/ScreenLayout';
import type { MainStackParams } from '../../../navigation/types';
import { AppThemeOverride } from '../../../theme/theme';
import { useGetCountryDetailsQuery } from '../api/countriesApi';
import { CountryDetailsContent } from '../components/CountryDetailsContent';
import { useCountryTheme } from '../countryTheme';
import { normalizeCountryCode } from '../utils/countryDetails';

export function CountryDetailsScreen({
  navigation,
  route,
}: NativeStackScreenProps<MainStackParams, 'CountryDetails'>) {
  const code = normalizeCountryCode(route.params?.countryCode);
  const { theme, tint } = useCountryTheme();
  const {
    currentData: country,
    isFetching,
    isError,
    refetch,
  } = useGetCountryDetailsQuery(code ?? skipToken, {
    refetchOnReconnect: true,
  });
  const title = country?.commonName ?? 'Country details';

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return (
    <AppThemeOverride.Provider value={theme}>
      <ScreenLayout>
        {!code ? (
          <EmptyState
            title="Invalid country code"
            description="Go back and choose a country from Explore."
          />
        ) : country ? (
          <>
            {isError && (
              <>
                <Text
                  accessibilityLiveRegion="polite"
                  style={{ color: theme.colors.text }}
                >
                  Could not refresh. Showing the last loaded details.
                </Text>
                <AppButton
                  label="Retry"
                  onPress={refetch}
                  loading={isFetching}
                />
              </>
            )}
            <CountryDetailsContent key={country.cca3} country={country} />
          </>
        ) : isFetching ? (
          <>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityState={{ busy: true }}
              accessibilityLabel="Loading country details"
              style={styles.loading}
            >
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text }}>
                Loading country details…
              </Text>
            </View>
            <View
              importantForAccessibility="no"
              style={[styles.heroSkeleton, { backgroundColor: tint }]}
            />
            <View
              importantForAccessibility="no"
              style={[styles.panelSkeleton, { backgroundColor: tint }]}
            />
          </>
        ) : isError ? (
          <EmptyState
            title="Could not load country details"
            description="Check your connection and try again."
            action={{ label: 'Retry', onPress: refetch }}
          />
        ) : (
          <EmptyState
            title="Country not found"
            description="Go back and choose another country."
          />
        )}
      </ScreenLayout>
    </AppThemeOverride.Provider>
  );
}

const styles = StyleSheet.create({
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroSkeleton: { height: 275, borderRadius: 20 },
  panelSkeleton: { height: 150, borderRadius: 16 },
});
