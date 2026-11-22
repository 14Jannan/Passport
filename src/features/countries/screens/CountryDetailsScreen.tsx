import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { AppHeader } from '../../../components/AppHeader';
import { ScreenLayout } from '../../../components/ScreenLayout';
import type { MainStackParams } from '../../../navigation/types';
import { useAppTheme } from '../../../theme/theme';
import { useGetCountriesQuery } from '../api/countriesApi';
import { CountryFlag } from '../components/CountryCard';

export function CountryDetailsScreen({
  route,
}: NativeStackScreenProps<MainStackParams, 'CountryDetails'>) {
  const { countryCode } = route.params;
  const { country } = useGetCountriesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      country: data?.find(item => item.cca3 === countryCode),
    }),
  });
  const { theme } = useAppTheme();

  return (
    <ScreenLayout>
      {country && <CountryFlag country={country} />}
      <AppHeader title={country?.commonName ?? 'Country details'} />
      <Text style={{ color: theme.colors.text }}>
        Country code: {countryCode}
      </Text>
      {country?.officialName && country.officialName !== country.commonName && (
        <Text style={{ color: theme.colors.text }}>{country.officialName}</Text>
      )}
      {country?.capitals.length ? (
        <Text style={{ color: theme.colors.text }}>
          Capital: {country.capitals.join(', ')}
        </Text>
      ) : null}
      {country?.region && (
        <Text style={{ color: theme.colors.text }}>{country.region}</Text>
      )}
    </ScreenLayout>
  );
}
