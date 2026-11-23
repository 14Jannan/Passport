import { Feather } from '@react-native-vector-icons/feather/static';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useAppTheme } from '../../../theme/theme';
import {
  bucketStatusMeta,
  type BucketStatus,
} from '../../favourites/types/favourite.types';

/** Theme colour for a bucket status, valid in light and dark mode. */
export function useStatusColor(status: BucketStatus): string {
  const { theme } = useAppTheme();
  return theme.colors[bucketStatusMeta[status].tone];
}

/** Pill showing a bucket status; pops softly when the status changes. */
export function BucketStatusBadge({
  status,
  compact = false,
}: {
  status: BucketStatus;
  compact?: boolean;
}) {
  const { theme } = useAppTheme();
  const tone = useStatusColor(status);
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  const meta = bucketStatusMeta[status];

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) {
      return;
    }
    scale.setValue(0.8);
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [reduced, scale, status]);

  return (
    <Animated.View
      accessible
      accessibilityLabel={`Status: ${meta.label}`}
      style={[
        styles.badge,
        compact && styles.compact,
        {
          backgroundColor: tone + '24',
          borderColor: tone + '66',
          transform: [{ scale }],
        },
      ]}
    >
      <Feather name={meta.icon} size={compact ? 12 : 14} color={tone} />
      <Text
        style={[
          styles.label,
          compact && styles.compactLabel,
          { color: theme.colors.text },
        ]}
      >
        {meta.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  compact: { paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  label: { fontSize: 13, fontWeight: '700' },
  compactLabel: { fontSize: 12 },
});
