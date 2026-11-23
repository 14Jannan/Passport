import { Feather } from '@react-native-vector-icons/feather/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/AppButton';
import type { MainStackParams } from '../../../navigation/types';
import { useCountryTheme } from '../../countries/countryTheme';
import type { Country } from '../../countries/types';
import { useFavouriteToggle } from '../../favourites/hooks/useFavouriteToggle';
import { useIsFavourite } from '../../favourites/hooks/useFavourites';
import { useJournalEntry } from '../hooks/useJournal';
import { formatJournalDate } from '../utils/formatJournalDate';
import { JournalPhoto } from './JournalPhoto';

/** Personal Journal panel on Country Details. */
export function CountryJournalSection({ country }: { country: Country }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const { theme, tint } = useCountryTheme();
  const { colors } = theme;
  const isFavourite = useIsFavourite(country.cca3);
  const entry = useJournalEntry(country.cca3);
  const toggle = useFavouriteToggle();

  function openEditor() {
    navigation.navigate('JournalEditor', { countryCode: country.cca3 });
  }

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: colors.gold,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: tint }]}>
          <Feather name="feather" size={18} color={colors.gold} />
        </View>
        <View style={styles.headerCopy}>
          <Text
            accessibilityRole="header"
            style={[styles.heading, { color: colors.text }]}
          >
            Personal journal
          </Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            {entry
              ? `Updated ${formatJournalDate(entry.updatedAt)}`
              : 'Your notes and photos for this place'}
          </Text>
        </View>
      </View>

      {!isFavourite ? (
        <>
          <Text style={[styles.body, { color: colors.text }]}>
            Save {country.commonName} to your favourites first, then attach a
            personal note and photo to it.
          </Text>
          <AppButton
            label="Save to Favourites"
            onPress={() => toggle(country.cca3, country.commonName)}
          />
        </>
      ) : entry ? (
        <>
          {entry.photoUri && (
            <JournalPhoto
              uri={entry.photoUri}
              label={`Your photo from ${country.commonName}`}
              style={styles.photo}
            />
          )}
          {entry.note ? (
            <Text style={[styles.note, { color: colors.text }]}>
              “{entry.note}”
            </Text>
          ) : (
            <Text style={[styles.body, { color: colors.muted }]}>
              No note yet — add your thoughts any time.
            </Text>
          )}
          <AppButton
            label="Edit Journal"
            variant="secondary"
            onPress={openEditor}
          />
        </>
      ) : (
        <>
          <Text style={[styles.body, { color: colors.muted }]}>
            Capture a memory, a plan or a photo for {country.commonName}.
          </Text>
          <AppButton label="Add Journal" onPress={openEditor} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 4,
    padding: 18,
    gap: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 2 },
  heading: { fontSize: 20, fontWeight: '800' },
  sub: { fontSize: 13 },
  body: { fontSize: 15, lineHeight: 22 },
  note: { fontSize: 17, lineHeight: 26, fontStyle: 'italic' },
  photo: { height: 210 },
});
