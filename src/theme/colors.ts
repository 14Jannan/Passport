/**
 * Passport Atlas palette.
 *
 * Light — "Sunlit Atlas": warm parchment pages, ink-navy type, lagoon teal
 * actions, passport-stamp coral and brass gold highlights.
 *
 * Dark — "Midnight Atlas": a deep night-sky canvas with aurora teal, ember
 * coral and lantern gold accents for low-light trip planning.
 */
export const lightColors = {
  background: '#F6F0E4',
  surface: '#FFFCF6',
  surfaceSecondary: '#EFE6D5',
  text: '#13213C',
  textPrimary: '#13213C',
  textSecondary: '#5E6B7E',
  muted: '#5E6B7E',
  primary: '#0F766E',
  primaryDark: '#0B4F4A',
  onPrimary: '#FFFFFF',
  accent: '#E5654A',
  gold: '#B7832A',
  stamp: '#3B4CCA',
  softMint: '#DCEEE6',
  border: '#E5DAC6',
  success: '#2F855A',
  error: '#C53030',
  cardShadow: 'rgba(19, 33, 60, 0.1)',
  overlay: 'rgba(12, 18, 34, 0.45)',
  heroOverlay: 'rgba(12, 18, 34, 0.55)',
};

export const darkColors: typeof lightColors = {
  background: '#0A0F1E',
  surface: '#141B2E',
  surfaceSecondary: '#1E2740',
  text: '#F4EFE6',
  textPrimary: '#F4EFE6',
  textSecondary: '#9AA6BF',
  muted: '#9AA6BF',
  primary: '#3DD9C1',
  primaryDark: '#22B3A0',
  onPrimary: '#06201D',
  accent: '#FF8A6B',
  gold: '#F2C46D',
  stamp: '#8C9BFF',
  softMint: '#16363A',
  border: '#2A3452',
  success: '#5FD3A0',
  error: '#FF7A7A',
  cardShadow: 'rgba(0, 0, 0, 0.45)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  heroOverlay: 'rgba(3, 6, 16, 0.7)',
};

export type ThemeColors = typeof lightColors;
