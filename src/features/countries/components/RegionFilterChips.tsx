import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useCountryTheme } from '../countryTheme';
import { regions, type Region } from '../utils/discovery';

export function RegionFilterChips({
  value,
  onChange,
}: {
  value: Region;
  onChange: (region: Region) => void;
}) {
  const { theme } = useCountryTheme();
  const { colors } = theme;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {regions.map(region => {
        const selected = value === region;
        return (
          <Pressable
            key={region}
            accessibilityRole="button"
            accessibilityLabel={`${region} region`}
            accessibilityState={{ selected }}
            onPress={() => {
              Keyboard.dismiss();
              onChange(region);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
                opacity: pressed ? 0.8 : 1,
              },
              theme.shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.text,
                {
                  color: selected ? colors.onPrimary : colors.text,
                  fontWeight: selected ? '700' : '600',
                },
              ]}
            >
              {region}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  chip: {
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: { fontSize: 14 },
});
