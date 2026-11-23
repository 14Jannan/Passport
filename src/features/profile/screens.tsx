import { Feather } from '@react-native-vector-icons/feather/static';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { AppButton } from '../../components/AppButton';
import { AppHeader } from '../../components/AppHeader';
import { ScreenLayout } from '../../components/ScreenLayout';
import type { MainStackParams } from '../../navigation/types';
import { useAppTheme } from '../../theme/theme';
import { logoutSession } from '../auth/services/sessionActions';
import { selectFavouriteCount } from '../favourites/store/favouritesSelectors';
import {
  selectJournalCount,
  selectJournalPhotoCount,
} from '../journal/store/journalSelectors';
import { AppearanceSelector } from './components/AppearanceSelector';

export function ProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.session);
  const favouriteCount = useAppSelector(selectFavouriteCount);
  const journalCount = useAppSelector(selectJournalCount);
  const photoCount = useAppSelector(selectJournalPhotoCount);
  const { theme, dark } = useAppTheme();
  const { colors } = theme;

  if (session.status !== 'signedIn') {
    return null;
  }

  const { firstName, lastName, username } = session.user;
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  const fullName = `${firstName} ${lastName}`.trim() || username;

  return (
    <ScreenLayout safeTop>
      {/* Profile Header Card */}
      <View
        style={[
          styles.profileHero,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          theme.shadows.md,
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.initials, { color: colors.onPrimary }]}>
            {initials || username.slice(0, 2).toUpperCase()}
          </Text>
        </View>

        <View style={styles.nameSection}>
          <AppHeader title={fullName} />
          <Text style={[styles.usernameText, { color: colors.muted }]}>
            @{username}
          </Text>
        </View>

        {/* Favourites Quick Pill */}
        <View
          style={[
            styles.statPill,
            {
              backgroundColor: dark ? colors.surfaceSecondary : colors.softMint,
            },
          ]}
        >
          <Feather name="bookmark" size={16} color={colors.primary} />
          <Text style={[styles.statText, { color: colors.primary }]}>
            {favouriteCount} {favouriteCount === 1 ? 'country' : 'countries'}{' '}
            saved
          </Text>
        </View>
      </View>

      {/* Menu / Settings Entry Card */}
      <View
        style={[
          styles.menuCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => navigation.navigate('Settings')}
          style={({ pressed }) => [
            styles.menuItem,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View
            style={[
              styles.menuIcon,
              { backgroundColor: colors.primary + '22' },
            ]}
          >
            <Feather name="settings" size={20} color={colors.primary} />
          </View>
          <View style={styles.menuCopy}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>
              Settings & Appearance
            </Text>
            <Text style={[styles.menuSubtitle, { color: colors.muted }]}>
              Theme, display modes and preferences
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.muted} />
        </Pressable>
      </View>

      {/* Travel Statistics Foundation Card */}
      <View
        style={[
          styles.statsCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        <View style={styles.statsHeader}>
          <Feather name="bar-chart-2" size={20} color={colors.accent} />
          <Text style={[styles.statsTitle, { color: colors.text }]}>
            Your travel story
          </Text>
        </View>
        <View style={styles.statsRow}>
          {[
            { label: 'Saved', value: favouriteCount, icon: 'heart' as const },
            { label: 'Journal', value: journalCount, icon: 'book' as const },
            { label: 'Photos', value: photoCount, icon: 'image' as const },
          ].map(stat => (
            <View
              key={stat.label}
              accessible
              accessibilityLabel={`${stat.value} ${stat.label}`}
              style={[
                styles.statTile,
                {
                  backgroundColor: dark
                    ? colors.surfaceSecondary
                    : colors.softMint,
                },
              ]}
            >
              <Feather name={stat.icon} size={16} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statsDesc, { color: colors.muted }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open travel journal"
          onPress={() => navigation.navigate('Home', { screen: 'Journal' })}
          style={({ pressed }) => [
            styles.journalLink,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.journalLinkText, { color: colors.primary }]}>
            Open travel journal
          </Text>
          <Feather name="arrow-right" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {/* Primary Actions */}
      <View style={styles.actionSection}>
        <AppButton
          label="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <AppButton label="Log out" onPress={() => dispatch(logoutSession())} />
      </View>
    </ScreenLayout>
  );
}

export function SettingsScreen() {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <ScreenLayout>
      <View style={styles.settingsHeader}>
        <AppHeader title="Settings" />
        <Text style={[styles.settingsSubtitle, { color: colors.muted }]}>
          Manage your theme, display options and application preferences.
        </Text>
      </View>

      {/* Appearance Selector */}
      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        <AppearanceSelector />
      </View>

      {/* Application Details Card */}
      <View
        style={[
          styles.settingsCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        <Text style={[styles.cardHeading, { color: colors.text }]}>
          About Passport
        </Text>
        <Text style={[styles.aboutText, { color: colors.muted }]}>
          Passport Travel Journal · Version 1.0.0
        </Text>
        <Text style={[styles.aboutText, { color: colors.muted }]}>
          IN3210 Mobile Applications Development — Assignment 2 (234088L)
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: { fontSize: 28, fontWeight: '800' },
  nameSection: {
    alignItems: 'center',
    gap: 4,
  },
  usernameText: {
    fontSize: 15,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    minHeight: 56,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 13,
  },
  statsCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  statsDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: { flexDirection: 'row', gap: 10 },
  statTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  journalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  journalLinkText: { fontSize: 15, fontWeight: '700' },
  actionSection: {
    gap: 12,
    marginTop: 4,
  },
  settingsHeader: {
    gap: 6,
    paddingBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 15,
  },
  settingsCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
