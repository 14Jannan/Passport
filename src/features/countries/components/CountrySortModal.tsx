import { Feather } from '@react-native-vector-icons/feather/static';
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
import { useState } from 'react';

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
        style={[
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Feather name="sliders" size={19} color={strong} />
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
          <View
            accessibilityViewIsModal
            style={[styles.panel, { backgroundColor: colors.surface }]}
          >
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
                      { backgroundColor: selected ? tint : colors.surface },
                    ]}
                  >
                    <Text style={[styles.text, { color: colors.text }]}>
                      {option.label}
                    </Text>
                    {selected && (
                      <Feather name="check" size={19} color={strong} />
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
              <Text style={[styles.text, { color: strong }]}>
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
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 12,
  },
  panel: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '100%',
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  heading: { flexDirection: 'row', alignItems: 'center' },
  headingText: { flex: 1 },
  options: { flexGrow: 0, flexShrink: 1 },
  option: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  close: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reset: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 12 },
  text: { flexShrink: 1, fontSize: 16, fontWeight: '600' },
});
