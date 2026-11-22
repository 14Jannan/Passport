import { Feather } from '@react-native-vector-icons/feather/static';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/AppButton';
import { AppHeader } from '../../../components/AppHeader';
import { useCountryTheme } from '../countryTheme';
import type { CountryDetails } from '../types';
import {
  formatArea,
  formatCurrency,
  formatPopulation,
  safeMapUrl,
} from '../utils/countryDetails';
import { CountryFlag } from './CountryCard';

function DetailText({ children }: PropsWithChildren) {
  const { theme } = useCountryTheme();
  return (
    <Text style={[styles.body, { color: theme.colors.text }]}>{children}</Text>
  );
}

function CountrySection({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  const { theme } = useCountryTheme();
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Text
        accessibilityRole="header"
        style={[styles.heading, { color: theme.colors.text }]}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  const { theme, tint } = useCountryTheme();
  return (
    <View style={[styles.fact, { backgroundColor: tint }]}>
      <Text style={{ color: theme.colors.muted }}>{label}</Text>
      <DetailText>{value}</DetailText>
    </View>
  );
}

function Values({ values }: { values: string[] }) {
  return values.length ? (
    values.map(value => <DetailText key={value}>{value}</DetailText>)
  ) : (
    <DetailText>Unavailable</DetailText>
  );
}

export function CountryDetailsContent({
  country,
}: {
  country: CountryDetails;
}) {
  const { theme, tint, strong } = useCountryTheme();
  const [mapError, setMapError] = useState(false);
  const capital = country.capitals.join(', ');
  const mapUrl = safeMapUrl(country.mapUrl);

  async function openMap() {
    if (!mapUrl) {
      return;
    }
    setMapError(false);
    try {
      await Linking.openURL(mapUrl);
    } catch {
      setMapError(true);
    }
  }

  return (
    <>
      <View
        style={[
          styles.hero,
          { backgroundColor: tint, borderBottomColor: theme.colors.accent },
        ]}
      >
        <CountryFlag country={country} large />
        <Text style={[styles.code, { color: strong }]}>
          Country code: {country.cca3}
        </Text>
        <AppHeader title={country.commonName} />
        {country.officialName && (
          <DetailText>{country.officialName}</DetailText>
        )}
        <Text style={[styles.body, { color: strong }]}>
          {[capital, country.region].filter(Boolean).join(' · ') ||
            'Capital and region unavailable'}
        </Text>
      </View>
      <CountrySection title="Overview">
        <View style={styles.grid}>
          <Info
            label="Population"
            value={formatPopulation(country.population)}
          />
          <Info label="Area" value={formatArea(country.area)} />
          <Info label="Capital" value={capital || 'Unavailable'} />
          <Info label="Region" value={country.region ?? 'Unavailable'} />
          <Info label="Subregion" value={country.subregion ?? 'Unavailable'} />
        </View>
      </CountrySection>
      <CountrySection title="Geography">
        <DetailText>Region: {country.region ?? 'Unavailable'}</DetailText>
        <DetailText>Subregion: {country.subregion ?? 'Unavailable'}</DetailText>
        <DetailText>
          Continents: {country.continents.join(', ') || 'Unavailable'}
        </DetailText>
        {country.coordinates && (
          <DetailText>
            Latitude {country.coordinates[0]}°, longitude{' '}
            {country.coordinates[1]}°
          </DetailText>
        )}
        {mapUrl && <AppButton label="Open map" onPress={openMap} />}
        {mapError && (
          <Text accessibilityRole="alert" style={{ color: theme.colors.error }}>
            Could not open the map. Try again.
          </Text>
        )}
      </CountrySection>
      <CountrySection title="Languages">
        <Values values={country.languages} />
      </CountrySection>
      <CountrySection title="Currencies">
        <Values values={country.currencies.map(formatCurrency)} />
      </CountrySection>
      <CountrySection title="Time zones">
        <Values values={country.timezones} />
      </CountrySection>
      <CountrySection title="Travel planning">
        <View style={styles.planningRow}>
          <Feather name="heart" size={19} color={strong} />
          <DetailText>
            Save this country to your favourites from the header or the Explore
            screen.
          </DetailText>
        </View>
        <View style={styles.planningRow}>
          <Feather name="columns" size={19} color={strong} />
          <DetailText>
            Country comparison is coming in a later update.
          </DetailText>
        </View>
        <View style={styles.planningRow}>
          <Feather name="edit-3" size={19} color={strong} />
          <DetailText>
            Personal notes and photos will be available in the travel journal.
          </DetailText>
        </View>
      </CountrySection>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, borderBottomWidth: 3, padding: 16, gap: 8 },
  code: { fontWeight: '700' },
  panel: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  heading: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fact: { flexGrow: 1, flexBasis: 120, padding: 12, borderRadius: 10, gap: 4 },
  planningRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
});
