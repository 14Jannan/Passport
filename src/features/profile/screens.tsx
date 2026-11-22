import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { EmptyState } from '../../components/EmptyState';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { MainStackParams } from '../../navigation/types';
import { useAppTheme } from '../../theme/theme';
import { leaveSession } from '../auth/session';

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.session);
  const { theme } = useAppTheme();
  if (session.status !== 'signedIn') {
    return null;
  }

  const { firstName, lastName, username } = session.user;
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  return (
    <ScreenLayout>
      <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
        <Text style={[styles.initials, { color: theme.colors.onPrimary }]}>
          {initials || username.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <AppHeader title={`${firstName} ${lastName}`.trim() || username} />
      <Text style={{ color: theme.colors.muted }}>@{username}</Text>
      <AppButton
        label="Settings"
        onPress={() => navigation.navigate('Settings')}
      />
      <EmptyState
        title="Travel statistics"
        description="Travel statistics will appear in a future update."
      />
      <AppButton label="Log out" onPress={() => dispatch(leaveSession())} />
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

const styles = StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontSize: 24, fontWeight: '700' },
});
