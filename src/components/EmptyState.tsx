import { Text, View } from 'react-native';
import { useAppTheme } from '../theme/theme';
import { AppButton } from './AppButton';
import { AppHeader } from './AppHeader';

type Props = {
  title: string;
  description: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ title, description, action }: Props) {
  const { theme } = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppHeader title={title} />
      <Text style={{ color: theme.colors.muted, fontSize: theme.type.body }}>
        {description}
      </Text>
      {action && <AppButton {...action} />}
    </View>
  );
}
