import { Feather } from '@react-native-vector-icons/feather/static';
import { useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '../../../components/AppHeader';
import { useCountryTheme } from '../countryTheme';
import { defaultSort, sortOptions, type CountrySort } from '../utils/discovery';

export function CountrySortModal({
  value,
  onChange,
}: {
  value: CountrySort;
  onChange: (value: CountrySort) => void;
}) {
  const [visible, setVisible] = useState(false);
  const { theme, strong, tint } = useCountryTheme();
  const { colors } = theme;
  const activeLabel = sortOptions.find(option => option.value === value)?.label;
  const close = () => setVisible(false);

  function choose(sort: CountrySort) {
    onChange(sort);
    close();
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Sort: ${activeLabel}`}
        onPress={() => {
          Keyboard.dismiss();
          setVisible(true);
        }}
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.8 : 1,
          },
          theme.shadows.sm,
        ]}
      >
        <Feather name="sliders" size={18} color={strong} />
        <Text style={[styles.text, { color: colors.text }]}>
          Sort · {activeLabel}
        </Text>
        <Feather name="chevron-down" size={18} color={strong} />
      </Pressable>

      <Modal
        visible={visible}
        animationType="fade"
        transparent
        onRequestClose={close}
      >
        <SafeAreaView style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={close} />
          <View
            accessibilityViewIsModal
            style={[
              styles.panel,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              theme.shadows.lg,
            ]}
          >
            <View style={styles.sheetHandle} />

            <View style={styles.heading}>
              <View style={styles.headingText}>
                <AppHeader title="Sort countries" />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close sort options"
                onPress={close}
                style={styles.close}
              >
                <Feather name="x" size={22} color={strong} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.options}
            >
              {sortOptions.map(option => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: selected }}
                    onPress={() => choose(option.value)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: selected ? tint : 'transparent',
                        borderColor: selected ? colors.primary : 'transparent',
                        borderWidth: selected ? 1 : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: selected ? strong : colors.text,
                          fontWeight: selected ? '700' : '500',
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selected && (
                      <Feather name="check" size={18} color={strong} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => choose(defaultSort)}
              style={styles.reset}
            >
              <Text style={[styles.resetText, { color: strong }]}>
                Reset sorting
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  panel: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#88888844',
    alignSelf: 'center',
    marginBottom: 4,
  },
  heading: { flexDirection: 'row', alignItems: 'center' },
  headingText: { flex: 1 },
  options: { flexGrow: 0, flexShrink: 1 },
  option: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 2,
  },
  optionText: { fontSize: 16 },
  close: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reset: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  resetText: { fontSize: 15, fontWeight: '700' },
  text: { flexShrink: 1, fontSize: 15, fontWeight: '600' },
});
