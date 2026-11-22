import { Feather } from '@react-native-vector-icons/feather/static';
import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
  type ImageResizeMode,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useAppTheme } from '../../../theme/theme';

interface DestinationImageProps {
  uri: string | null | undefined;
  alt?: string;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  fallbackIcon?: string;
}

export function DestinationImage({
  uri,
  alt,
  style,
  resizeMode = 'cover',
  fallbackIcon = 'compass',
}: DestinationImageProps) {
  const { theme } = useAppTheme();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;

  function onLoad() {
    setLoaded(true);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  const showFallback = !uri || failed;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surfaceSecondary },
        style,
      ]}
    >
      {showFallback ? (
        <View style={styles.fallback}>
          <Feather
            name={fallbackIcon as any}
            size={36}
            color={theme.colors.muted}
          />
        </View>
      ) : (
        <>
          {!loaded && (
            <View
              style={[
                styles.skeleton,
                { backgroundColor: theme.colors.surfaceSecondary },
              ]}
            />
          )}
          <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
            <Image
              source={{ uri }}
              accessibilityLabel={alt}
              resizeMode={resizeMode}
              style={styles.image}
              onLoad={onLoad}
              onError={() => setFailed(true)}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeleton: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
