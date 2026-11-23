import { Feather } from '@react-native-vector-icons/feather/static';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../theme/theme';
import { BucketStatusSelector } from './BucketStatusSelector';

export type StatusTarget = { countryCode: string; countryName: string };

/** Bottom sheet for changing a country's bucket status. */
export function BucketStatusSheet({
  target,
  onClose,
}: {
  target: StatusTarget | null;
  onClose: () => void;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={target !== null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close status picker"
          onPress={onClose}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.kicker, { color: colors.gold }]}>
                TRAVEL STATUS
              </Text>
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                style={[styles.title, { color: colors.text }]}
              >
                {target?.countryName}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={[
                styles.close,
                { backgroundColor: colors.surfaceSecondary },
              ]}
            >
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>
          {target && (
            <BucketStatusSelector
              variant="list"
              countryCode={target.countryCode}
              countryName={target.countryName}
              onChanged={onClose}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerCopy: { flex: 1, gap: 2 },
  kicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.6 },
  title: { fontSize: 24, fontWeight: '800' },
  close: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
