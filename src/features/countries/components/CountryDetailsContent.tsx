import { Feather } from '@react-native-vector-icons/feather/static';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Image, Linking, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/AppButton';
import { AppHeader } from '../../../components/AppHeader';
import { useCountryTheme } from '../countryTheme';
import { getCountryPhotography } from '../data/photography';
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
  icon,
  children,
}: PropsWithChildren<{ title: string; icon?: string }>) {
  const { theme, strong } = useCountryTheme();
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.sectionHeader}>
        {icon && <Feather name={icon as any} size={18} color={strong} />}
        <Text
          accessibilityRole="header"
          style={[styles.heading, { color: theme.colors.text }]}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Info({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: string;
}) {
  const { theme, tint, strong } = useCountryTheme();
  return (
    <View style={[styles.fact, { backgroundColor: tint }]}>
      <View style={styles.factHeader}>
        {icon && <Feather name={icon as any} size={13} color={strong} />}
        <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{label}</Text>
      </View>
      <Text style={[styles.factValue, { color: theme.colors.text }]}>
        {value}
      </Text>
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
  const photo = getCountryPhotography(country.cca3);

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
      {/* Hero Section */}
      <View
        style={[
          styles.hero,
          { backgroundColor: tint, borderBottomColor: theme.colors.accent },
          theme.shadows.md,
        ]}
      >
        {photo?.imageUrl ? (
          <View style={styles.scenicContainer}>
            <Image
              source={{ uri: photo.imageUrl }}
              resizeMode="cover"
              style={styles.scenicImage}
            />
            <View style={styles.scenicOverlay} />
            <View style={styles.scenicAttribution}>
              <Text style={styles.photoCredit}>
                Photo: {photo.photographer} · {photo.location}
              </Text>
            </View>
          </View>
        ) : null}

        <CountryFlag country={country} large />

        <Text style={[styles.code, { color: strong }]}>
          Country code: {country.cca3}
        </Text>
        <AppHeader title={country.commonName} />
        {country.officialName && (
          <DetailText>{country.officialName}</DetailText>
        )}
        <Text style={[styles.body, { color: strong, fontWeight: '600' }]}>
          {[capital, country.region].filter(Boolean).join(' · ') ||
            'Capital and region unavailable'}
        </Text>
      </View>

      {/* Overview Grid */}
      <CountrySection title="Overview" icon="globe">
        <View style={styles.grid}>
          <Info
            icon="users"
            label="Population"
            value={formatPopulation(country.population)}
          />
          <Info
            icon="maximize-2"
            label="Area"
            value={formatArea(country.area)}
          />
          <Info
            icon="map-pin"
            label="Capital"
            value={capital || 'Unavailable'}
          />
          <Info
            icon="compass"
            label="Region"
            value={country.region ?? 'Unavailable'}
          />
          <Info
            icon="map"
            label="Subregion"
            value={country.subregion ?? 'Unavailable'}
          />
        </View>
      </CountrySection>

      {/* Geography Section */}
      <CountrySection title="Geography" icon="navigation">
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

      {/* Languages Section */}
      <CountrySection title="Languages" icon="message-circle">
        <Values values={country.languages} />
      </CountrySection>

      {/* Currencies Section */}
      <CountrySection title="Currencies" icon="dollar-sign">
        <Values values={country.currencies.map(formatCurrency)} />
      </CountrySection>

      {/* Time zones Section */}
      <CountrySection title="Time zones" icon="clock">
        <Values values={country.timezones} />
      </CountrySection>

      {/* Travel Planning Section */}
      <CountrySection title="Travel planning" icon="bookmark">
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
  hero: {
    borderRadius: 24,
    borderBottomWidth: 3,
    padding: 18,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  scenicContainer: {
    height: 180,
    marginHorizontal: -18,
    marginTop: -18,
    marginBottom: 6,
    position: 'relative',
  },
  scenicImage: {
    width: '100%',
    height: '100%',
  },
  scenicOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  scenicAttribution: {
    position: 'absolute',
    bottom: 8,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  photoCredit: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  code: { fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  panel: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 12,
  },
  heading: { fontSize: 20, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fact: {
    flexGrow: 1,
    flexBasis: 130,
    padding: 12,
    borderRadius: 14,
    gap: 4,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  factValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  planningRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
});
