import { Feather } from '@react-native-vector-icons/feather/static';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/theme';
import { AppButton } from './AppButton';
import { AppHeader } from './AppHeader';

type Props = {
  title: string;
  description: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({
  title,
  description,
  icon = 'compass',
  action,
}: Props) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        theme.shadows.sm,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: dark ? colors.surfaceSecondary : colors.softMint,
          },
        ]}
      >
        <Feather name={icon as any} size={36} color={colors.primary} />
      </View>
      <View style={styles.copy}>
        <AppHeader title={title} />
        <Text style={[styles.description, { color: colors.muted }]}>
          {description}
        </Text>
      </View>
      {action && (
        <View style={styles.actionContainer}>
          <AppButton {...action} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 28,
    alignItems: 'center',
    textAlign: 'center',
    gap: 16,
    marginVertical: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: 8,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 240,
    marginTop: 6,
  },
});
