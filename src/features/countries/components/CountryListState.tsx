import { Feather } from '@react-native-vector-icons/feather/static';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { EmptyState } from '../../../components/EmptyState';
import { useCountryTheme } from '../countryTheme';
import { countryCardHeight } from './CountryCard';

type Props = {
  loading: boolean;
  failed: boolean;
  offline: boolean;
  retry: () => void;
  clearFilters?: () => void;
};

export function CountryListState({
  loading,
  failed,
  offline,
  retry,
  clearFilters,
}: Props) {
  const { theme, tint } = useCountryTheme();

  if (loading) {
    return (
      <View style={styles.panel}>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Loading countries"
          accessibilityState={{ busy: true }}
          style={styles.progress}
        >
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={{ color: theme.colors.text }}>Loading countries…</Text>
        </View>
        {[0, 1, 2].map(index => (
          <View
            key={index}
            importantForAccessibility="no"
            style={[styles.skeleton, { backgroundColor: theme.colors.surface }]}
          >
            <View style={[styles.flag, { backgroundColor: tint }]} />
            <View style={styles.lines}>
              <View style={[styles.longLine, { backgroundColor: tint }]} />
              <View style={[styles.shortLine, { backgroundColor: tint }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (failed) {
    return (
      <View style={styles.panel}>
        <Feather
          name={offline ? 'wifi-off' : 'alert-circle'}
          size={30}
          color={theme.colors.primary}
        />
        <EmptyState
          title="Could not load countries"
          description={
            offline
              ? 'You’re offline. Reconnect to the internet and try again.'
              : 'The country catalog is unavailable right now. Try again.'
          }
          action={{ label: 'Retry', onPress: retry }}
        />
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Feather name="search" size={30} color={theme.colors.primary} />
      <EmptyState
        title="No countries found"
        description={
          clearFilters
            ? 'Try a different country name or select another region.'
            : 'Pull to refresh and try again.'
        }
        action={
          clearFilters
            ? { label: 'Clear Filters', onPress: clearFilters }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12, paddingVertical: 8 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skeleton: {
    minHeight: countryCardHeight,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  flag: { width: 60, height: 42, borderRadius: 7 },
  lines: { flex: 1, gap: 9 },
  longLine: { height: 12, width: '72%', borderRadius: 6 },
  shortLine: { height: 12, width: '45%', borderRadius: 6 },
});
