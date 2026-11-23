import { Feather } from '@react-native-vector-icons/feather/static';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef, type ComponentProps } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../app/store';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { SessionSplash } from '../features/auth/screens/SessionSplash';
import { CountryDetailsScreen } from '../features/countries/screens/CountryDetailsScreen';
import { ExploreScreen } from '../features/countries/screens/ExploreScreen';
import { useFavourites } from '../features/favourites/hooks/useFavourites';
import { useJournalHydration } from '../features/journal/hooks/useJournal';
import { JournalEditorScreen } from '../features/journal/screens/JournalEditorScreen';
import { JournalScreen } from '../features/journal/screens/JournalScreen';
import { ProfileScreen, SettingsScreen } from '../features/profile/screens';
import { SavedScreen } from '../features/saved/screens';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAppTheme } from '../theme/theme';
import type { AuthStackParams, MainStackParams, TabParams } from './types';

const Auth = createNativeStackNavigator<AuthStackParams>();
const Main = createNativeStackNavigator<MainStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();

const tabMeta: Record<
  keyof TabParams,
  { label: string; icon: ComponentProps<typeof Feather>['name'] }
> = {
  Discover: { label: 'Explore', icon: 'compass' },
  Saved: { label: 'Favourites', icon: 'bookmark' },
  Journal: { label: 'Journal', icon: 'book-open' },
  Profile: { label: 'Profile', icon: 'user' },
};

/** Tab icon that pops and gains a tinted pill when its tab is focused. */
function TabIcon({
  icon,
  focused,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  focused: boolean;
}) {
  const { theme, dark } = useAppTheme();
  const { colors } = theme;
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View
      style={[
        styles.iconWrap,
        focused && {
          backgroundColor: dark ? colors.surfaceSecondary : colors.softMint,
        },
        {
          transform: [
            {
              scale: scale.interpolate({
                inputRange: [0, 1],
                outputRange: [1, reduced ? 1 : 1.12],
              }),
            },
          ],
        },
      ]}
    >
      <Feather
        name={icon}
        size={20}
        color={focused ? colors.primary : colors.muted}
      />
    </Animated.View>
  );
}

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.floatingContainer,
        { bottom: Math.max(insets.bottom, 12) },
      ]}
    >
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          theme.shadows.floatingNav,
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const routeName = route.name as keyof TabParams;
          const meta = tabMeta[routeName];
          const label =
            options.title !== undefined ? options.title : meta.label;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
              onPress={onPress}
              style={styles.tabButton}
            >
              <TabIcon icon={meta.icon} focused={isFocused} />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.muted,
                    fontWeight: isFocused ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function renderFloatingTabBar(props: BottomTabBarProps) {
  return <FloatingTabBar {...props} />;
}

function AppTabs() {
  useFavourites();
  useJournalHydration();
  return (
    <Tabs.Navigator
      tabBar={renderFloatingTabBar}
      screenOptions={{ headerShown: false }}
    >
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
        <Main.Navigator
          key="authenticated"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.text,
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
          }}
        >
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
            name="JournalEditor"
            component={JournalEditorScreen}
            options={{ headerShown: false, title: 'Journal' }}
          />
          <Main.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
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

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 99,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: 500,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
    gap: 3,
  },
  iconWrap: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
