import { Feather } from '@react-native-vector-icons/feather/static';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ComponentProps } from 'react';
import { useAppSelector } from '../app/store';
import {
  ForgotPasswordScreen,
  RegisterScreen,
  SignInScreen,
  WelcomeScreen,
} from '../features/auth/screens';
import {
  DestinationDetailsScreen,
  DiscoverScreen,
  SearchScreen,
} from '../features/discover/screens';
import {
  EditJournalEntryScreen,
  JournalEntryScreen,
  JournalScreen,
} from '../features/journal/screens';
import { ProfileScreen, SettingsScreen } from '../features/profile/screens';
import { SavedScreen } from '../features/saved/screens';
import { useAppTheme } from '../theme/theme';
import type { AuthStackParams, MainStackParams, TabParams } from './types';

const Auth = createNativeStackNavigator<AuthStackParams>();
const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();

const icons: Record<keyof TabParams, ComponentProps<typeof Feather>['name']> = {
  Discover: 'compass',
  Saved: 'bookmark',
  Journal: 'book-open',
  Profile: 'user',
};

function tabOptions({ route }: { route: { name: keyof TabParams } }) {
  return {
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <Feather name={icons[route.name]} color={color} size={size} />
    ),
  };
}

function AppTabs() {
  return (
    <Tabs.Navigator screenOptions={tabOptions}>
      <Tabs.Screen name="Discover" component={DiscoverScreen} />
      <Tabs.Screen name="Saved" component={SavedScreen} />
      <Tabs.Screen name="Journal" component={JournalScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const isGuest = useAppSelector(state => state.session.isGuest);
  const { dark, theme } = useAppTheme();
  const base = dark ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer
      theme={{
        ...base,
        colors: {
          ...base.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.accent,
        },
      }}
    >
      {isGuest ? (
        <Main.Navigator>
          <Main.Screen
            name="Home"
            component={AppTabs}
            options={{ headerShown: false }}
          />
          <Main.Screen
            name="DestinationDetails"
            component={DestinationDetailsScreen}
            options={{ title: 'Destination' }}
          />
          <Main.Screen name="Search" component={SearchScreen} />
          <Main.Screen
            name="JournalEntry"
            component={JournalEntryScreen}
            options={{ title: 'Journal entry' }}
          />
          <Main.Screen
            name="EditJournalEntry"
            component={EditJournalEntryScreen}
            options={({ route }) => ({
              title: route.params?.entryId ? 'Edit entry' : 'New entry',
            })}
          />
          <Main.Screen name="Settings" component={SettingsScreen} />
        </Main.Navigator>
      ) : (
        <Auth.Navigator>
          <Auth.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ title: 'Passport' }}
          />
          <Auth.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: 'Sign in' }}
          />
          <Auth.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create account' }}
          />
          <Auth.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: 'Reset password' }}
          />
        </Auth.Navigator>
      )}
    </NavigationContainer>
  );
}
