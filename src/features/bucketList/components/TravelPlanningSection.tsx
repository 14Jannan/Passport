import { Feather } from '@react-native-vector-icons/feather/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../../../components/AppButton';
import type { MainStackParams } from '../../../navigation/types';
import { useAppTheme } from '../../../theme/theme';
import type { Country } from '../../countries/types';
import { useFavouriteToggle } from '../../favourites/hooks/useFavouriteToggle';
import { useBucketStatus } from '../../favourites/hooks/useFavourites';
import { bucketStatusMeta } from '../../favourites/types/favourite.types';
import { BucketStatusBadge } from './BucketStatusBadge';
import { BucketStatusSelector } from './BucketStatusSelector';

/** Travel Planning panel on Country Details. */
export function TravelPlanningSection({ country }: { country: Country }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const status = useBucketStatus(country.cca3);
  const toggle = useFavouriteToggle();

  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderLeftColor: colors.primary,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: colors.primary + '22' }]}>
          <Feather name="flag" size={18} color={colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text
            accessibilityRole="header"
            style={[styles.heading, { color: colors.text }]}
          >
            Travel planning
          </Text>
          <Text style={[styles.sub, { color: colors.muted }]}>
            {status
              ? bucketStatusMeta[status].description
              : 'Track this destination on your bucket list'}
          </Text>
        </View>
        {status && <BucketStatusBadge status={status} compact />}
      </View>

      {status ? (
        <>
          <BucketStatusSelector
            countryCode={country.cca3}
            countryName={country.commonName}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Bucket List"
            onPress={() => navigation.navigate('Home', { screen: 'Bucket' })}
            style={({ pressed }) => [
              styles.link,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Open Bucket List
            </Text>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </Pressable>
        </>
      ) : (
        <>
          <Text style={[styles.body, { color: colors.text }]}>
            Save {country.commonName} to your favourites to mark it as Want to
            Visit, Planning or Visited.
          </Text>
          <AppButton
            label="Add to Favourites"
            onPress={() => toggle(country.cca3, country.commonName)}
          />
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
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
    alignSelf: 'flex-start',
  },
  linkText: { fontSize: 15, fontWeight: '700' },
});
