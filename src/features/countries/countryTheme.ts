import { lightTheme, useAppTheme } from '../../theme/theme';

export function useCountryTheme() {
  const { dark, theme } = useAppTheme();
  return {
    theme,
    tint: dark ? theme.colors.surface : theme.colors.softMint,
    strong: dark ? theme.colors.primary : theme.colors.primaryDark,
  };
}

export { lightTheme };
