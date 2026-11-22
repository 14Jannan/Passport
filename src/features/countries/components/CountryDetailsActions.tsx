import { Feather } from '@react-native-vector-icons/feather/static';
import { useRef, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, View } from 'react-native';
import { FavouriteButton } from '../../favourites/components/FavouriteButton';
import { useCountryTheme } from '../countryTheme';
import type { Country } from '../types';
import { buildCountryShare } from '../utils/countryShare';

export function ShareCountryButton({ country }: { country: Country }) {
  const { strong } = useCountryTheme();
  const pending = useRef(false);
  const [sharing, setSharing] = useState(false);
  const content = buildCountryShare(country);

  async function shareCountry() {
    if (pending.current || !content) {
      return;
    }
    pending.current = true;
    setSharing(true);
    try {
      // Both platforms can share a URL as part of the message. iOS also
      // resolves when dismissed. Android cannot distinguish dismissal.
      await Share.share(content, {
        dialogTitle: content.title,
        subject: content.title,
      });
    } catch {
      Alert.alert(
        'Could not share country',
        'Try opening the share sheet again.',
      );
    } finally {
      pending.current = false;
      setSharing(false);
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Share ${country.commonName}`}
      accessibilityState={{ disabled: sharing || !content, busy: sharing }}
      disabled={sharing || !content}
      onPress={shareCountry}
      style={({ pressed }) => [
        styles.action,
        { opacity: pressed || sharing ? 0.65 : 1 },
      ]}
    >
      <Feather name="share-2" size={21} color={strong} />
    </Pressable>
  );
}

export function CountryDetailsActions({ country }: { country: Country }) {
  return (
    <View style={styles.row}>
      <FavouriteButton countryCode={country.cca3} />
      <ShareCountryButton country={country} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  action: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
