import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../../app/store';
import { AppButton } from '../../components/AppButton';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { MainStackParams } from '../../navigation/types';
import { leaveSession } from '../auth/session';

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const dispatch = useAppDispatch();
  return (
    <ScreenLayout>
      <EmptyState title="Profile" description="You’re browsing as a guest." />
      <AppButton
        label="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
      <AppButton
        label="Exit guest mode"
        onPress={() => dispatch(leaveSession())}
      />
    </ScreenLayout>
  );
}

export function SettingsScreen() {
  return (
    <ScreenLayout>
      <EmptyState
        title="Settings"
        description="Passport follows the appearance selected on your device."
      />
    </ScreenLayout>
  );
}
