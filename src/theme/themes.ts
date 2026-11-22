import { darkColors, lightColors, type ThemeColors } from './colors';
import { radius, type Radius } from './radius';
import { shadows, type Shadows } from './shadows';
import { spacing, type Spacing } from './spacing';
import { typography, type Typography } from './typography';

export const palette = {
  oceanTeal: '#087F79',
  warmIvory: '#FFF8EB',
  sunsetCoral: '#EF7867',
  deepNavy: '#102638',
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
