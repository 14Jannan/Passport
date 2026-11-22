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
            style={[
              styles.chip,
              {
                backgroundColor: selected ? colors.primary : colors.surface,
                borderColor: selected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: selected ? colors.onPrimary : colors.text },
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
  row: { gap: 8 },
  chip: {
    minHeight: 48,
    borderRadius: 25,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  text: { fontWeight: '600', fontSize: 15 },
});
