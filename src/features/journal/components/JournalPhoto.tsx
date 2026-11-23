import { Feather } from '@react-native-vector-icons/feather/static';
import { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme';

type Props = {
  uri: string | null;
  label: string;
  style?: StyleProp<ViewStyle>;
  /** Text shown when there is no photo at all. */
  emptyLabel?: string;
};

/**
 * Displays a stored journal photo. If the file has gone missing (e.g. app
 * data was partially cleared) a theme-aware placeholder explains it instead
 * of rendering a broken image.
 */
export function JournalPhoto({ uri, label, style, emptyLabel }: Props) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const missing = !!uri && failedUri === uri;

  return (
    <View
      style={[
        styles.frame,
        { backgroundColor: colors.surfaceSecondary },
        style,
      ]}
    >
      {uri && !missing ? (
        <Image
          source={{ uri }}
          accessibilityLabel={label}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
          onError={() => setFailedUri(uri)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Feather
            name={missing ? 'alert-triangle' : 'image'}
            size={28}
            color={missing ? colors.accent : colors.muted}
          />
          <Text
            style={[styles.placeholderText, { color: colors.muted }]}
            accessibilityLiveRegion={missing ? 'polite' : 'none'}
          >
            {missing
              ? 'Photo file is missing. Replace it to restore this memory.'
              : emptyLabel ?? 'No photo yet'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', borderRadius: 20 },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  placeholderText: { fontSize: 13, textAlign: 'center' },
});
