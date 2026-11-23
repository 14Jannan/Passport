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

## Prompt 6 — Travel journal, famous places and Passport Atlas redesign

AI assistance (Claude Code) implemented the Personal Notes & Photos feature, a famous-places gallery and a refreshed visual identity. Key decisions and real corrections:

- **Journal model and state:** One `JournalEntry` per favourite country keyed by `cca3`, stored per user under `passport:journal:<userId>` in a versioned `{ version, entries }` document. Thunks (`saveJournalEntry`, `deleteJournalEntryWithPhoto`, `removeFavouriteAndJournal`) persist before confirming and roll Redux back if AsyncStorage fails, so there is a single source of truth.
- **Photo safety:** Picker results are validated, copied into `DocumentDir/journal/<userId>/` and only the persistent URI is stored. The old photo is deleted only after a replacement is saved; unsaved copies are removed when the editor closes, and an orphan sweep runs at sign-in.
- **Permissions:** The merged Android manifest was inspected and does not declare `CAMERA`, so the camera intent works without a runtime permission and none was added. `NSCameraUsageDescription` was added for iOS.
- **Favourite removal policy:** Removing a favourite with journal content now asks for confirmation and deletes the entry and photo together. `FavouriteButton` was switched to a lightweight toggle hook so each button no longer runs its own hydration and save effects.
- **Famous places data source:** A Wikidata SPARQL query was tried first but timed out (over 60 s) for large countries such as the USA and France, so the app uses Wikipedia's search API with World Heritage / tourist-attraction categories instead. On the emulator, Wikimedia returned HTTP 403 ("Please set a user-agent") to the default OkHttp agent for both API calls and images; passing a `User-Agent` on the `Image` source still produced 403 under this setup, so photos are downloaded with `react-native-file-access` (which sends the header) into the cache and displayed from disk.
- **Design:** The palette was changed to "Passport Atlas" (parchment / ink navy / stamp coral / brass gold in light, midnight / aurora teal / lantern gold in dark), and the existing theme tests were updated to the new tokens. Interactive additions: trending carousel with scroll-driven scaling, one-tap theme toggle, staggered entrances, animated tab icons and reduced-motion support.
- **Testing:** `__tests__/journal.test.tsx` covers create/edit/remove note, add/replace/remove photo, delete, restore after restart, per-user isolation, corrupted storage, failed-write rollback, the favourites relationship, photo cleanup, picker result handling and famous-places normalization. Two existing tests that looked up "Sri Lanka" by text were scoped to the list card because the carousel now also shows that name.
- **Manual verification (Android emulator, Pixel 7):** camera capture through the system camera, private copy, save, Country Details and Journal tab display, persistence after force-stop, removal confirmation, light/dark toggle and the famous-places viewer were checked on device. Gallery selection was not exercised on the emulator.
