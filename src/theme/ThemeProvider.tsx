import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, StatusBar, useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme } from './themes';

export type AppearanceMode = 'light' | 'dark' | 'system';

export const APPEARANCE_STORAGE_KEY = '@passport/preferences/appearance';

export interface ThemeContextValue {
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => Promise<void>;
  dark: boolean;
  theme: AppTheme;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const AppThemeOverride = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<AppearanceMode>('system');
  const [systemDark, setSystemDark] = useState<boolean>(
    systemColorScheme === 'dark' || Appearance.getColorScheme() === 'dark',
  );

  // Load saved appearance preference on startup
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(APPEARANCE_STORAGE_KEY)
      .then(saved => {
        if (
          mounted &&
          saved &&
          (saved === 'light' || saved === 'dark' || saved === 'system')
        ) {
          setAppearanceState(saved as AppearanceMode);
        }
      })
      .catch(() => {
        // Fallback to system default if storage read fails
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Listen to system appearance changes when in system mode
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemDark(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);

  // Sync with React Native useColorScheme
  useEffect(() => {
    setSystemDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const dark = useMemo(() => {
    if (appearance === 'light') {
      return false;
    }
    if (appearance === 'dark') {
      return true;
    }
    return systemDark;
  }, [appearance, systemDark]);

  const setAppearance = useCallback(async (mode: AppearanceMode) => {
    setAppearanceState(mode);
    try {
      await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
    } catch {
      // Storage failure handled quietly
    }
  }, []);

  const theme = dark ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
      dark,
      theme,
    }),
    [appearance, dark, setAppearance, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  const systemDark = useColorScheme() === 'dark';
  if (!context) {
    // Graceful fallback for tests or components rendered outside ThemeProvider
    return {
      appearance: 'system',
      setAppearance: async () => {},
      dark: systemDark,
      theme: systemDark ? darkTheme : lightTheme,
    };
  }
  return context;
}
