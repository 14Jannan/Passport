import { useRef, type ComponentProps } from 'react';
import {
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';

type Props = Omit<ComponentProps<typeof Pressable>, 'style'> & {
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  /** Scale applied while pressed. */
  pressedScale?: number;
};

/** Pressable with a soft spring "squish" used by cards and tiles. */
export function PressableScale({
  style,
  containerStyle,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  children,
  ...props
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  function animate(toValue: number) {
    if (reduced) {
      return;
    }
    Animated.spring(scale, {
      toValue,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Animated.View style={[containerStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        onPressIn={event => {
          animate(pressedScale);
          onPressIn?.(event);
        }}
        onPressOut={event => {
          animate(1);
          onPressOut?.(event);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
