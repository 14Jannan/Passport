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
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { SessionSplash } from '../features/auth/screens/SessionSplash';
import { CountryDetailsScreen } from '../features/countries/screens/CountryDetailsScreen';
import { ExploreScreen } from '../features/countries/screens/ExploreScreen';
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
      <Tabs.Screen
        name="Discover"
        component={ExploreScreen}
        options={{ title: 'Explore' }}
      />
      <Tabs.Screen
        name="Saved"
        component={SavedScreen}
        options={{ title: 'Favourites' }}
      />
      <Tabs.Screen name="Journal" component={JournalScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const status = useAppSelector(state => state.session.status);
  const { dark, theme } = useAppTheme();
  const base = dark ? DarkTheme : DefaultTheme;
  if (status === 'starting' || status === 'checking') {
    return <SessionSplash />;
  }
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
      {status === 'signedIn' ? (
        <Main.Navigator key="authenticated">
          <Main.Screen
            name="Home"
            component={AppTabs}
            options={{ headerShown: false }}
          />
          <Main.Screen
            name="CountryDetails"
            component={CountryDetailsScreen}
            options={{ title: 'Country details' }}
          />
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
        <Auth.Navigator
          key="authentication"
          screenOptions={{ headerShown: false }}
        >
          <Auth.Screen name="SignIn" component={LoginScreen} />
          <Auth.Screen name="Register" component={RegisterScreen} />
        </Auth.Navigator>
      )}
    </NavigationContainer>
  );
}
