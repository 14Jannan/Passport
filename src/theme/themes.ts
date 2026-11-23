import { darkColors, lightColors, type ThemeColors } from './colors';
import { radius, type Radius } from './radius';
import { shadows, type Shadows } from './shadows';
import { spacing, type Spacing } from './spacing';
import { typography, type Typography } from './typography';

export const palette = {
  lagoonTeal: '#0F766E',
  parchment: '#F6F0E4',
  stampCoral: '#E5654A',
  inkNavy: '#13213C',
  brassGold: '#B7832A',
  auroraTeal: '#3DD9C1',
  midnight: '#0A0F1E',
};

export interface AppTheme {
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  // Backward compatibility fields
  type: { body: number; title: number };
}

export const lightTheme: AppTheme = {
  colors: lightColors,
  typography,
  spacing,
  radius,
  shadows,
  type: { body: 16, title: 28 },
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  typography,
  spacing,
  radius,
  shadows,
  type: { body: 16, title: 28 },
};
