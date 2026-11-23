import { Feather } from '@react-native-vector-icons/feather/static';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../../../components/PressableScale';
import { useAppTheme } from '../../../theme/theme';
import { getCountryPhotography } from '../../countries/data/photography';
import type { Country } from '../../countries/types';
import type { BucketStatus } from '../../favourites/types/favourite.types';
import { useJournalEntry } from '../../journal/hooks/useJournal';
import { BucketStatusBadge } from './BucketStatusBadge';

type Props = {
  country: Country;
  status: BucketStatus;
  onOpenDetails: () => void;
  onChangeStatus: () => void;
  onOpenJournal: () => void;
};

/** Photo-rich bucket-list destination card. */
export function BucketCountryCard({
  country,
  status,
  onOpenDetails,
  onChangeStatus,
  onOpenJournal,
}: Props) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;
  const journal = useJournalEntry(country.cca3);
  const photo = getCountryPhotography(country.cca3);
  const heroUri = journal?.photoUri ?? photo?.thumbnailUrl ?? country.flagUrl;
  const capital = country.capitals.join(', ') || 'Capital unavailable';
  const region = country.region ?? 'Region unavailable';

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${country.commonName}, ${region}, ${capital}`}
      accessibilityHint="Opens country details"
      onPress={onOpenDetails}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        theme.shadows.md,
      ]}
    >
      <View
        style={[
          styles.hero,
          { backgroundColor: dark ? colors.surfaceSecondary : colors.softMint },
        ]}
      >
        {heroUri ? (
          <Image
            source={{ uri: heroUri }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Feather name="globe" size={36} color={colors.primary} />
        )}
        <View style={styles.shade} />
        <View style={styles.heroTop}>
          <View style={styles.flagBadge}>
            {country.flagUrl ? (
              <Image
                source={{ uri: country.flagUrl }}
                accessibilityLabel={
                  country.flagAlt ?? `Flag of ${country.commonName}`
                }
                style={styles.flag}
              />
            ) : (
              <Feather name="flag" size={14} color="#FFFFFF" />
            )}
            <Text style={styles.code}>{country.cca3}</Text>
          </View>
          {journal && (
            <View
              accessible
              accessibilityLabel="Has journal entry"
              style={styles.journalBadge}
            >
              <Feather
                name={journal.photoUri ? 'camera' : 'feather'}
                size={13}
                color="#FFFFFF"
              />
              <Text style={styles.code}>Journal</Text>
            </View>
          )}
        </View>
        <View style={styles.heroBottom}>
          <Text numberOfLines={1} style={styles.name}>
            {country.commonName}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {region} · {capital}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <BucketStatusBadge status={status} />
        <View style={styles.actions}>
          <ActionButton
            icon="refresh-cw"
            label="Change Status"
            onPress={onChangeStatus}
            primary
          />
          <ActionButton
            icon={journal ? 'book-open' : 'edit-3'}
            label={journal ? 'Journal' : 'Add Note'}
            onPress={onOpenJournal}
          />
          <ActionButton
            icon="arrow-right"
            label="Details"
            onPress={onOpenDetails}
          />
        </View>
      </View>
    </PressableScale>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: 'refresh-cw' | 'book-open' | 'edit-3' | 'arrow-right';
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: primary ? colors.primary : colors.surfaceSecondary,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather
        name={icon}
        size={14}
        color={primary ? colors.onPrimary : colors.primary}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.actionText,
          { color: primary ? colors.onPrimary : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  hero: {
    height: 170,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  shade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(6, 10, 22, 0.38)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  flagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 15, 30, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  journalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10, 15, 30, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flag: { width: 22, height: 15, borderRadius: 3 },
  code: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  heroBottom: { padding: 14, gap: 2 },
  name: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  meta: { color: 'rgba(255,255,255,0.88)', fontSize: 14, fontWeight: '600' },
  body: { padding: 14, gap: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 6,
  },
  actionText: { fontSize: 13, fontWeight: '700' },
});
