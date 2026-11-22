import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

export const palette = {
  oceanTeal: '#087F79',
  warmIvory: '#FFF8EB',
  sunsetCoral: '#EF7867',
  deepNavy: '#102638',
};

const shared = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { md: 12, lg: 20 },
  type: { body: 16, title: 28 },
};

export const lightTheme = {
  ...shared,
  colors: {
    background: palette.warmIvory,
    surface: '#FFFFFF',
    text: palette.deepNavy,
    muted: '#485D6D',
    primary: '#076C67',
    onPrimary: '#FFFFFF',
    accent: palette.sunsetCoral,
    border: '#A3AAA9',
    error: '#A52E28',
  },
};

export const darkTheme: typeof lightTheme = {
  ...shared,
  colors: {
    background: palette.deepNavy,
    surface: '#19354A',
    text: palette.warmIvory,
    muted: '#B7C9D3',
    primary: '#67D5C8',
    onPrimary: palette.deepNavy,
    accent: palette.sunsetCoral,
    border: '#698291',
    error: '#FF9B8F',
  },
};

export const AppThemeOverride = createContext<typeof lightTheme | null>(null);

export function useAppTheme() {
  const dark = useColorScheme() === 'dark';
  const override = useContext(AppThemeOverride);
  return { dark, theme: override ?? (dark ? darkTheme : lightTheme) };
}
