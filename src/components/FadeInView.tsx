import { useEffect, useRef, type PropsWithChildren } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = PropsWithChildren<{
  /** Delay before the entrance starts, in ms. */
  delay?: number;
  /** Starting vertical offset. */
  offset?: number;
  style?: StyleProp<ViewStyle>;
}>;

/** Fades and lifts content into place once, respecting reduced motion. */
export function FadeInView({ delay = 0, offset = 14, style, children }: Props) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reduced ? 0 : 380,
      delay: reduced ? 0 : delay,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress, reduced]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [reduced ? 1 : 0, 1],
          }),
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [reduced ? 0 : offset, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
