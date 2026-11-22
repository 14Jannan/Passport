# AI usage

## Prompt 3 — Country discovery

AI assistance was used to inspect the existing React Native app, implement the country catalog and controls, write tests, and verify builds. The original REST Countries v3.1 route was checked before implementation. Its live response reported deprecation, and the official v5 public demo returned a sample record instead of a catalog. The implementation uses a verified public v3.1-compatible mirror of the original REST Countries dataset. The README records this decision and the mirror’s limits.

The development checks caught a malformed URL validation expression and a test mock that referenced an undeclared request parameter. Both were corrected before committing the catalog. The existing authentication smoke test was updated to assert the new Explore screen and to mock the auth and country responses separately.

## Prompt 4 — Country details

AI assistance extended the existing RTK Query API and country normalization. A live endpoint check showed that the unfiltered alpha request returns an array and a field-filtered request returns an object. The adapter handles both shapes and validates the returned country code. Native Share behavior was checked against the React Native documentation before implementing quiet cancellation and explicit error feedback.

## Prompt 5 — Persistent favourites

AI assistance was used to design and implement the favourites feature. Key decisions:

- The `FavouriteCountry` data model uses `cca3` as the unique identifier and avoids duplicating country metadata. Country data is resolved from the existing RTK Query cache at render time.
- Storage keys are scoped per user (`passport:favourites:<userId>`) to ensure data isolation between accounts. The storage service handles corrupted JSON by filtering invalid entries rather than discarding the entire list.
- Hydration runs once per sign-in and uses a ref guard to prevent the initial empty Redux state from overwriting persisted data. Subsequent writes go through a serialized save queue so rapid toggles are persisted in the correct order.
- The FavouriteButton component is shared between Explore cards and the Country Details header. Formatting fixes were applied to files from the Prompt 4 merge that had CRLF line endings.
- The `bucketStatus` field and removal policy helpers are designed for forward compatibility with Bucket List (Prompt 7) and Journal (Prompt 6) features without implementing those features prematurely.

## Prompt 5B — Complete Premium UI/UX Redesign & Persistent Themes

AI assistance guided the complete visual redesign and theme architecture of Passport:

- **Theme Architecture:** Designed centralized theme modules (`colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `shadows.ts`, `themes.ts`, `ThemeProvider.tsx`, and `useAppTheme.ts`). Configured exact color tokens for Light (`#F8F7F2` canvas, `#FFFFFF` cards, `#137C78` teal) and Dark (`#101B24` canvas, `#1C2A35` cards, `#38B5AA` cyan) modes.
- **Appearance Persistence & Bonus Feature:** Implemented Light, Dark, and System appearance modes persisted in `AsyncStorage` (`@passport/preferences/appearance`). Documented persistent dark mode as the official assignment bonus feature. Subscribed to native `Appearance.addChangeListener` for live OS theme switching when in System mode.
- **Destination Photography:** Curated a structured photography directory for 20+ top destination countries with Unsplash license attribution. Built `DestinationImage` with smooth loading fade-in and resilient fallback.
- **Micro-Interactions & Floating Navigation:** Engineered spring bounce interactions on country cards and animated favourite toggle buttons using React Native's native-driven `Animated` API without heavy native animation dependencies. Created a floating bottom tab bar (`FloatingTabBar`) that respects device safe areas.
- **Testing & Verification:** Authored unit and integration test suite (`__tests__/themeAndRedesign.test.tsx`) asserting light/dark/system mode selection, storage persistence, token resolution, appearance selector interactions, photography fallbacks, and favourite button animations. Verified zero regression on all 84 existing tests across 10 previous test suites.
