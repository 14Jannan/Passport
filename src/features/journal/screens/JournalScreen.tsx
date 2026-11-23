import { Feather } from '@react-native-vector-icons/feather/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../app/store';
import { AppHeader } from '../../../components/AppHeader';
import { EmptyState } from '../../../components/EmptyState';
import { FadeInView } from '../../../components/FadeInView';
import { PressableScale } from '../../../components/PressableScale';
import type { MainStackParams } from '../../../navigation/types';
import { useAppTheme } from '../../../theme/theme';
import { useGetCountriesQuery } from '../../countries/api/countriesApi';
import type { Country } from '../../countries/types';
import { selectAllFavourites } from '../../favourites/store/favouritesSelectors';
import { JournalPhoto } from '../components/JournalPhoto';
import {
  selectJournalEntries,
  selectJournalError,
  selectJournalPhotoCount,
} from '../store/journalSelectors';
import type { JournalEntry } from '../types';
import { formatJournalDate } from '../utils/formatJournalDate';

type Navigation = NativeStackNavigationProp<MainStackParams>;

function Stat({
  icon,
  value,
  label,
}: {
  icon: any;
  value: number;
  label: string;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[
        styles.stat,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Feather name={icon} size={16} color={colors.gold} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

function JournalEntryCard({
  entry,
  country,
  onOpen,
  onEdit,
}: {
  entry: JournalEntry;
  country: Country | undefined;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;
  const name = country?.commonName ?? entry.countryCode;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`${name} journal entry, updated ${formatJournalDate(
        entry.updatedAt,
      )}`}
      accessibilityHint="Opens country details"
      onPress={onOpen}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        theme.shadows.md,
      ]}
    >
      {entry.photoUri ? (
        <JournalPhoto
          uri={entry.photoUri}
          label={`Your photo from ${name}`}
          style={styles.cardPhoto}
        />
      ) : (
        <View
          style={[
            styles.cardPhoto,
            styles.fallback,
            {
              backgroundColor: dark ? colors.surfaceSecondary : colors.softMint,
            },
          ]}
        >
          <Feather name="feather" size={30} color={colors.primary} />
          <Text style={[styles.fallbackText, { color: colors.primary }]}>
            A story in words
          </Text>
        </View>
      )}
      <View style={styles.flagBadge}>
        {country?.flagUrl ? (
          <Image source={{ uri: country.flagUrl }} style={styles.flag} />
        ) : (
          <Feather name="flag" size={14} color="#FFFFFF" />
        )}
        <Text style={styles.flagCode}>{entry.countryCode}</Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTitleRow}>
          <Text
            numberOfLines={1}
            style={[styles.cardTitle, { color: colors.text }]}
          >
            {name}
          </Text>
          <Text style={[styles.date, { color: colors.muted }]}>
            {formatJournalDate(entry.updatedAt)}
          </Text>
        </View>
        {entry.note ? (
          <Text numberOfLines={3} style={[styles.note, { color: colors.text }]}>
            {entry.note}
          </Text>
        ) : (
          <Text style={[styles.note, { color: colors.muted }]}>
            Photo memory — no note yet.
          </Text>
        )}
        <View style={styles.cardActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${name} journal`}
            onPress={onEdit}
            style={({ pressed }) => [
              styles.editButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="edit-2" size={14} color={colors.onPrimary} />
            <Text style={[styles.editText, { color: colors.onPrimary }]}>
              Edit
            </Text>
          </Pressable>
          <View style={styles.openHint}>
            <Text style={[styles.openText, { color: colors.primary }]}>
              Open
            </Text>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

function CardGap() {
  return <View style={styles.gap} />;
}

export function JournalScreen() {
  const navigation = useNavigation<Navigation>();
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const entries = useAppSelector(selectJournalEntries);
  const photoCount = useAppSelector(selectJournalPhotoCount);
  const favourites = useAppSelector(selectAllFavourites);
  const error = useAppSelector(selectJournalError);
  const { data: countries } = useGetCountriesQuery();

  const countryMap = useMemo(
    () => new Map((countries ?? []).map(country => [country.cca3, country])),
    [countries],
  );
  const withoutEntry = useMemo(() => {
    const written = new Set(entries.map(entry => entry.countryCode));
    return favourites
      .filter(fav => !written.has(fav.countryCode))
      .map(fav => countryMap.get(fav.countryCode))
      .filter((country): country is Country => !!country);
  }, [countryMap, entries, favourites]);

  const openEditor = (countryCode: string) =>
    navigation.navigate('JournalEditor', { countryCode });

  const header = (
    <View style={styles.header}>
      <FadeInView
        style={[
          styles.hero,
          { backgroundColor: colors.surface, borderColor: colors.border },
          theme.shadows.sm,
        ]}
      >
        <View style={[styles.stampRing, { borderColor: colors.stamp + '55' }]}>
          <Feather name="book-open" size={22} color={colors.stamp} />
        </View>
        <Text style={[styles.kicker, { color: colors.gold }]}>
          TRAVEL JOURNAL
        </Text>
        <AppHeader title="My journeys" />
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Your journeys, your memories
        </Text>
        <View style={styles.stats}>
          <Stat
            icon="book"
            value={entries.length}
            label={entries.length === 1 ? 'entry' : 'entries'}
          />
          <Stat
            icon="image"
            value={photoCount}
            label={photoCount === 1 ? 'photo' : 'photos'}
          />
          <Stat icon="heart" value={favourites.length} label="saved" />
        </View>
      </FadeInView>

      {error && (
        <View
          accessibilityRole="alert"
          style={[styles.error, { backgroundColor: colors.error + '1F' }]}
        >
          <Feather name="alert-circle" size={16} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      )}

      {withoutEntry.length > 0 && (
        <View style={styles.startBlock}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Start a journal for
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {withoutEntry.map(country => (
              <Pressable
                key={country.cca3}
                accessibilityRole="button"
                accessibilityLabel={`Add journal for ${country.commonName}`}
                onPress={() => openEditor(country.cca3)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                {country.flagUrl ? (
                  <Image
                    source={{ uri: country.flagUrl }}
                    style={styles.chipFlag}
                  />
                ) : null}
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {country.commonName}
                </Text>
                <Feather name="plus" size={14} color={colors.primary} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {entries.length > 0 && (
        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          Latest memories
        </Text>
      )}
    </View>
  );

  return (
    <FlatList
      testID="journal-list"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      data={entries}
      keyExtractor={entry => entry.countryCode}
      ListHeaderComponent={header}
      ItemSeparatorComponent={CardGap}
      ListEmptyComponent={
        <EmptyState
          icon="feather"
          title="No travel memories yet"
          description="Save a country and start capturing your travel story."
          action={{
            label: 'Explore Countries',
            onPress: () => navigation.navigate('Home', { screen: 'Discover' }),
          }}
          secondaryAction={{
            label: 'View Favourites',
            onPress: () => navigation.navigate('Home', { screen: 'Saved' }),
          }}
        />
      }
      renderItem={({ item, index }) => (
        <FadeInView delay={Math.min(index, 6) * 70}>
          <JournalEntryCard
            entry={item}
            country={countryMap.get(item.countryCode)}
            onOpen={() =>
              navigation.navigate('CountryDetails', {
                countryCode: item.countryCode,
              })
            }
            onEdit={() => openEditor(item.countryCode)}
          />
        </FadeInView>
      )}
    />
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
  header: { gap: 16, paddingBottom: 14 },
  hero: {
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 6,
  },
  stampRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  subtitle: { fontSize: 16 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
  },
  errorText: { flex: 1, fontSize: 14 },
  startBlock: { gap: 10 },
  sectionLabel: { fontSize: 18, fontWeight: '800' },
  chips: { gap: 10, paddingRight: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
  },
  chipFlag: { width: 22, height: 15, borderRadius: 3 },
  chipText: { fontSize: 14, fontWeight: '600' },
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardPhoto: { height: 190, borderRadius: 0 },
  fallback: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  fallbackText: { fontSize: 14, fontWeight: '700', fontStyle: 'italic' },
  flagBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 15, 30, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flag: { width: 22, height: 15, borderRadius: 3 },
  flagCode: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  cardBody: { padding: 16, gap: 8 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', flexShrink: 1 },
  date: { fontSize: 12, fontWeight: '600' },
  note: { fontSize: 15, lineHeight: 22 },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  editText: { fontWeight: '700', fontSize: 14 },
  openHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  openText: { fontWeight: '700', fontSize: 14 },
  gap: { height: 14 },
});
