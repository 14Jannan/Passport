import { Feather } from '@react-native-vector-icons/feather/static';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAppTheme } from '../theme/theme';

type ToastKind = 'success' | 'error';
type ToastMessage = { id: number; text: string; kind: ToastKind };
type ShowToast = (text: string, kind?: ToastKind) => void;

const ToastContext = createContext<ShowToast | null>(null);

/** Show a short, non-blocking confirmation. A no-op outside the provider. */
export function useToast(): ShowToast {
  return useContext(ToastContext) ?? noop;
}

function noop() {}

/** Hosts one floating toast above the tab bar for transient feedback. */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const counter = useRef(0);

  const show = useCallback<ShowToast>((text, kind = 'success') => {
    counter.current += 1;
    setToast({ id: counter.current, text, kind });
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <ToastView
          key={toast.id}
          toast={toast}
          onHidden={() =>
            setToast(current => (current?.id === toast.id ? null : current))
          }
        />
      )}
    </ToastContext.Provider>
  );
}

function ToastView({
  toast,
  onHidden,
}: {
  toast: ToastMessage;
  onHidden: () => void;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;
  const hide = useRef(onHidden);
  hide.current = onHidden;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: reduced ? 0 : 220,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(progress, {
        toValue: 0,
        duration: reduced ? 0 : 220,
        useNativeDriver: true,
      }),
    ]);
    animation.start(({ finished }) => {
      if (finished) {
        hide.current();
      }
    });
    return () => animation.stop();
  }, [progress, reduced]);

  const tint = toast.kind === 'error' ? colors.error : colors.success;
  const style = useMemo(
    () => ({
      opacity: progress,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [reduced ? 0 : 16, 0],
          }),
        },
      ],
    }),
    [progress, reduced],
  );

  return (
    <View
      pointerEvents="none"
      style={[styles.host, { bottom: Math.max(insets.bottom, 12) + 84 }]}
    >
      <Animated.View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          { backgroundColor: colors.text, borderLeftColor: tint },
          theme.shadows.lg,
          style,
        ]}
      >
        <Feather
          name={toast.kind === 'error' ? 'alert-circle' : 'check-circle'}
          size={18}
          color={tint}
        />
        <Text style={[styles.text, { color: colors.background }]}>
          {toast.text}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 520,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  text: { flexShrink: 1, fontSize: 14, fontWeight: '700' },
});
