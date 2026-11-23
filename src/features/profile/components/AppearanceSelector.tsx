import { Feather } from '@react-native-vector-icons/feather/static';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme, type AppearanceMode } from '../../../theme/theme';

interface Option {
  value: AppearanceMode;
  label: string;
  icon: 'sun' | 'moon' | 'smartphone';
  description: string;
}

const options: Option[] = [
  {
    value: 'light',
    label: 'Light',
    icon: 'sun',
    description: 'Bright and crisp warm-neutral palette',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: 'moon',
    description: 'Deep, cinematic dark mode for night travels',
  },
  {
    value: 'system',
    label: 'System',
    icon: 'smartphone',
    description: 'Automatically match your device appearance',
  },
];

export function AppearanceSelector() {
  const { appearance, setAppearance, theme, dark } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Appearance
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
        Customize the visual style of your passport journey
      </Text>

      <View style={styles.optionsList}>
        {options.map(option => {
          const selected = appearance === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityLabel={`${option.label} mode`}
              accessibilityState={{ checked: selected }}
              onPress={() => setAppearance(option.value)}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: selected
                    ? dark
                      ? colors.surfaceSecondary
                      : colors.softMint
                    : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
                theme.shadows.sm,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : dark
                      ? colors.surfaceSecondary
                      : colors.surfaceSecondary,
                  },
                ]}
              >
                <Feather
                  name={option.icon}
                  size={20}
                  color={selected ? colors.onPrimary : colors.muted}
                />
              </View>

              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: selected ? colors.primary : colors.text,
                      fontWeight: selected ? '700' : '600',
                    },
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={[styles.optionDesc, { color: colors.muted }]}>
                  {option.description}
                </Text>
              </View>

              <View
                style={[
                  styles.radio,
                  {
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.primary : 'transparent',
                  },
                ]}
              >
                {selected && (
                  <Feather name="check" size={14} color={colors.onPrimary} />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  optionsList: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    gap: 14,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
  },
  optionDesc: {
    fontSize: 13,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
