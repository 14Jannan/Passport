export const typography = {
  hero: { fontSize: 34, fontWeight: '700' as const, lineHeight: 42 },
  screenHeading: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  sectionHeading: { fontSize: 21, fontWeight: '600' as const, lineHeight: 28 },
  cardHeading: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  supporting: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
};

export type Typography = typeof typography;
