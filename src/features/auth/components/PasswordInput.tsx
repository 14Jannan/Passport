import { Feather } from '@react-native-vector-icons/feather/static';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppTextInput } from '../../../components/AppTextInput';
import { useAppTheme } from '../../../theme/theme';

type Props = Omit<
  ComponentProps<typeof AppTextInput>,
  'endAccessory' | 'secureTextEntry'
>;

export function PasswordInput(props: Props) {
  const [visible, setVisible] = useState(false);
  const { theme } = useAppTheme();
  const label = `${visible ? 'Hide' : 'Show'} ${props.label.toLowerCase()}`;
  return (
    <AppTextInput
      {...props}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={!visible}
      endAccessory={
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled: props.editable === false }}
          disabled={props.editable === false}
          onPress={() => setVisible(value => !value)}
          style={styles.toggle}
        >
          <Feather
            name={visible ? 'eye-off' : 'eye'}
            color={theme.colors.primary}
            size={21}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  toggle: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
