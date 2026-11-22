import { lightTheme, useAppTheme } from '../../theme/theme';

const exploreLight: typeof lightTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: '#137C78',
    background: '#F8F7F2',
    surface: '#FFFFFF',
    text: '#172B3A',
    muted: '#667784',
    accent: '#E88C70',
  },
};

export function useCountryTheme() {
  const { dark, theme } = useAppTheme();
  return {
    theme: dark ? theme : exploreLight,
    tint: dark ? theme.colors.surface : '#DDF1E9',
    strong: dark ? theme.colors.primary : '#0B5957',
  };
}
