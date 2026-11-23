import { Feather } from '@react-native-vector-icons/feather/static';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch } from '../../../app/store';
import { useToast } from '../../../components/Toast';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { useAppTheme } from '../../../theme/theme';
import { useBucketStatus } from '../../favourites/hooks/useFavourites';
import {
  BucketStatusError,
  changeBucketStatus,
} from '../../favourites/services/favouritesActions';
import {
  BUCKET_STATUSES,
  bucketStatusMeta,
  type BucketStatus,
} from '../../favourites/types/favourite.types';
import { useStatusColor } from './BucketStatusBadge';

type Props = {
  countryCode: string;
  countryName: string;
  /** `segmented` for inline use, `list` for sheets with descriptions. */
  variant?: 'segmented' | 'list';
  /** Called after the new status was saved. */
  onChanged?: (status: BucketStatus) => void;
};

/**
 * Reusable bucket-list status control. Saves through `changeBucketStatus`
 * (Redux + user-scoped storage) and confirms with a toast; failures roll
 * back and show an error toast.
 */
export function BucketStatusSelector({
  countryCode,
  countryName,
  variant = 'segmented',
  onChanged,
}: Props) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const current = useBucketStatus(countryCode);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);

  if (!current) {
    return null;
  }

  async function select(status: BucketStatus) {
    if (busy.current || status === current) {
      return;
    }
    busy.current = true;
    setPending(true);
    try {
      await dispatch(changeBucketStatus(countryCode, status));
      toast(`${countryName} moved to ${bucketStatusMeta[status].label}`);
      onChanged?.(status);
    } catch (error) {
      toast(
        error instanceof BucketStatusError
          ? error.message
          : 'Could not update the status.',
        'error',
      );
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return variant === 'segmented' ? (
    <Segmented current={current} onSelect={select} disabled={pending} />
  ) : (
    <OptionList current={current} onSelect={select} disabled={pending} />
  );
}

type ControlProps = {
  current: BucketStatus;
  onSelect: (status: BucketStatus) => void;
  disabled: boolean;
};

function Segmented({ current, onSelect, disabled }: ControlProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const index = BUCKET_STATUSES.indexOf(current);
  const position = useRef(new Animated.Value(index)).current;
  const tone = useStatusColor(current);

  useEffect(() => {
    if (reduced) {
      position.setValue(index);
      return;
    }
    Animated.spring(position, {
      toValue: index,
      friction: 8,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [index, position, reduced]);

  const segment = width / BUCKET_STATUSES.length;

  return (
    <View
      accessibilityRole="radiogroup"
      onLayout={event => setWidth(event.nativeEvent.layout.width - 8)}
      style={[
        styles.segmented,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      {width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: segment,
              backgroundColor: colors.surface,
              borderColor: tone,
              transform: [
                {
                  translateX: position.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, segment],
                  }),
                },
              ],
            },
            theme.shadows.sm,
          ]}
        />
      )}
      {BUCKET_STATUSES.map(status => (
        <SegmentButton
          key={status}
          status={status}
          selected={status === current}
          disabled={disabled}
          onPress={() => onSelect(status)}
        />
      ))}
    </View>
  );
}

function SegmentButton({
  status,
  selected,
  disabled,
  onPress,
}: {
  status: BucketStatus;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const tone = useStatusColor(status);
  const meta = bucketStatusMeta[status];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={meta.label}
      accessibilityHint={meta.description}
      accessibilityState={{ checked: selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={styles.segment}
    >
      <Feather
        name={meta.icon}
        size={16}
        color={selected ? tone : theme.colors.muted}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.segmentLabel,
          selected ? styles.bold : styles.medium,
          { color: selected ? theme.colors.text : theme.colors.muted },
        ]}
      >
        {meta.label}
      </Text>
    </Pressable>
  );
}

function OptionList({ current, onSelect, disabled }: ControlProps) {
  return (
    <View accessibilityRole="radiogroup" style={styles.list}>
      {BUCKET_STATUSES.map(status => (
        <OptionRow
          key={status}
          status={status}
          selected={status === current}
          disabled={disabled}
          onPress={() => onSelect(status)}
        />
      ))}
    </View>
  );
}

function OptionRow({
  status,
  selected,
  disabled,
  onPress,
}: {
  status: BucketStatus;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const tone = useStatusColor(status);
  const meta = bucketStatusMeta[status];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={meta.label}
      accessibilityHint={meta.description}
      accessibilityState={{ checked: selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.option,
        {
          backgroundColor: selected ? tone + '1F' : colors.surface,
          borderColor: selected ? tone : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: tone + '2E' }]}>
        <Feather name={meta.icon} size={20} color={tone} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={[styles.optionLabel, { color: colors.text }]}>
          {meta.label}
        </Text>
        <Text style={[styles.optionDesc, { color: colors.muted }]}>
          {meta.description}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? tone : colors.border,
            backgroundColor: selected ? tone : colors.surface,
          },
        ]}
      >
        {selected && <Feather name="check" size={14} color={colors.surface} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  segment: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 4,
  },
  segmentLabel: { fontSize: 12 },
  bold: { fontWeight: '800' },
  medium: { fontWeight: '600' },
  list: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    minHeight: 64,
  },
  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCopy: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 16, fontWeight: '700' },
  optionDesc: { fontSize: 13 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
