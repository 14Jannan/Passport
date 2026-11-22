import { useContext } from 'react';
import { AppThemeOverride, useThemeContext } from './ThemeProvider';
import type { AppTheme } from './themes';

export function useAppTheme(): {
  dark: boolean;
  theme: AppTheme;
  appearance: 'light' | 'dark' | 'system';
  setAppearance: (mode: 'light' | 'dark' | 'system') => Promise<void>;
} {
  const context = useThemeContext();
  const override = useContext(AppThemeOverride);
  return {
    dark: override ? override === context.theme && context.dark : context.dark,
    theme: override ?? context.theme,
    appearance: context.appearance,
    setAppearance: context.setAppearance,
  };
}
