import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** Tracks the OS "reduce motion" accessibility preference. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(value => {
        if (mounted) {
          setReduced(!!value);
        }
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      value => setReduced(!!value),
    );
    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return reduced;
}
