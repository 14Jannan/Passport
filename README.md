# Passport

Passport is a React Native application with an Expo development build for travel discovery and a personal travel journal. Passport is developed for IN3210 Mobile Applications Development, Assignment 2 (234088L).

**Tagline:** Explore the World. Capture the Journey.

## Setup

1. Install Node.js 22.13 or newer (CI uses Node.js 24) and run `npm ci`.
2. For Android, install JDK 21 and Android Studio. Use SDK Manager to install Android SDK Platform 36, Build Tools 36.0.0, NDK 27.1.12297006, and CMake 3.22.1. Set `ANDROID_HOME` to the SDK directory and start an emulator or connect a device.
3. For iOS, use macOS with Xcode and its command-line tools. Run `bundle install` at the root, then run `bundle exec pod install` from `ios/`.
4. Run `npm run android` or `npm run ios` to build and install the Passport development app. After installation, use `npm start` to start Expo Metro for future sessions.
5. On a physical phone, join the same network as the development computer and scan the Expo terminal QR code with the installed Passport development build.

## Demo sign-in

On the login screen, select **Use demo credentials**, then select **Sign in**. The public DummyJSON example is username `emilys` and password `emilyspass`. An internet connection is required. After signing in, open **Profile** to see the authenticated profile and log out.

**Create a demo account** calls DummyJSON’s simulated registration endpoint. Use sample details and a unique dummy password. DummyJSON returns a temporary success response without saving the account, so the new credentials cannot authenticate. The app returns to login with a confirmation that explains this behavior. [DummyJSON users documentation](https://dummyjson.com/docs/users#users-add)

## Premium UI/UX & Design Identity

Passport uses the **Passport Explore — Premium Travel Editorial** visual identity, balancing adventurous exploration with sophisticated typography and rich destination photography.

### Color Tokens

Passport uses the **Passport Atlas** palette: warm parchment pages and ink-navy type in light mode ("Sunlit Atlas"), and a deep night-sky canvas with aurora teal and lantern gold in dark mode ("Midnight Atlas").

| Token             | Light Theme | Dark Theme | Purpose                                       |
| ----------------- | ----------- | ---------- | --------------------------------------------- |
| Background        | `#F6F0E4`   | `#0A0F1E`  | Parchment / midnight screen canvas            |
| Primary Surface   | `#FFFCF6`   | `#141B2E`  | Card backgrounds and sheets                   |
| Secondary Surface | `#EFE6D5`   | `#1E2740`  | Inset backgrounds, inputs and pills           |
| Primary Text      | `#13213C`   | `#F4EFE6`  | Headings and high-emphasis labels             |
| Secondary Text    | `#5E6B7E`   | `#9AA6BF`  | Subtitles, captions and metadata              |
| Primary           | `#0F766E`   | `#3DD9C1`  | Lagoon / aurora teal actions and active state |
| Primary Dark      | `#0B4F4A`   | `#22B3A0`  | High-contrast brand elements                  |
| Accent            | `#E5654A`   | `#FF8A6B`  | Passport-stamp coral, saved heart, badges     |
| Gold              | `#B7832A`   | `#F2C46D`  | Journal highlights, rank badges, kickers      |
| Stamp             | `#3B4CCA`   | `#8C9BFF`  | Passport-stamp ink for journal identity       |
| Soft Mint         | `#DCEEE6`   | `#16363A`  | Subtle highlights and tint surfaces           |
| Border            | `#E5DAC6`   | `#2A3452`  | Structural dividers and card borders          |
| Success           | `#2F855A`   | `#5FD3A0`  | Positive feedback and confirmations           |
| Error             | `#C53030`   | `#FF7A7A`  | Validation, destructive actions and failures  |

### Official Assignment Bonus Feature: Persistent Dark Mode & System Theme

Passport features complete **Light, Dark, and System appearance modes**:

- **Light:** Bright, clean, warm-neutral editorial aesthetic.
- **Dark:** Deep, immersive cinematic palette designed for low-light travel planning.
- **System:** Synchronizes automatically with the device's operating system color scheme using React Native's `Appearance` API.
- **Persistence:** Selected appearance mode is persisted across app restarts via `AsyncStorage` under `@passport/preferences/appearance`.

### Appearance Settings

Located in **Profile → Settings**:

- Segmented radio selector supporting Light, Dark, and System modes.
- Instant live updates across all mounted screens, navigation headers, floating tab bar, and system status bar without restarting the app or resetting navigation.
- A one-tap animated sun/moon toggle on the Explore hero switches between light and dark and persists the choice.

### Destination Photography & Attribution

Passport integrates curated travel photography from [Unsplash](https://unsplash.com) (licensed under the Unsplash License — free for commercial and non-commercial use):

- **Japan (`JPN`):** Chureito Pagoda & Mount Fuji by David Becker (`@becker_david`)
- **Sri Lanka (`LKA`):** Sigiriya Rock Fortress by Dylan Shaw (`@dylanshaw`)
- **France (`FRA`):** Eiffel Tower Twilight by Chris Karidis (`@chriskaridis`)
- **Canada (`CAN`):** Moraine Lake & Canadian Rockies by Kalep Tatu (`@kaleptatu`)
- **Australia (`AUS`):** Sydney Opera House by Dan Freeman (`@danfreemanphoto`)
- **Italy (`ITA`):** Roman Colosseum by David Kohler (`@dkohler`)
- **Switzerland (`CHE`):** Matterhorn Peak, Zermatt by Dino Reichmuth (`@dinoreichmuth`)
- **Brazil (`BRA`):** Christ the Redeemer & Sugarloaf by Agustin Diaz Gargiulo (`@agustindiazg`)
- **United States (`USA`):** Grand Canyon Sunset by Gerd Eichmann (`@gerdeichmann`)
- **United Kingdom (`GBR`):** Big Ben & Westminster by Eva Dang (`@evadan`)
- **Germany (`DEU`):** Neuschwanstein Castle by Daniel Seßler (`@danielsessler`)
- **Spain (`ESP`):** Sagrada Familia, Barcelona by Enes (`@enes`)
- **Egypt (`EGY`):** Great Pyramids of Giza by Simon Berger (`@simonberger`)
- **India (`IND`):** Taj Mahal Sunrise by Jovyn Chamb (`@jovynchamb`)
- **Greece (`GRC`):** Oia Santorini by Matthew Waring (`@matthewwaring`)
- **Iceland (`ISL`):** Aurora over Waterfalls by Jonatan Pie (`@jonatanpie`)
- **New Zealand (`NZL`):** Milford Sound by Tobias Keller (`@tobiasreich`)
- **Norway (`NOR`):** Fjord Reflections by Jarand K. Løkeland (`@jarand`)
- **Thailand (`THA`):** Phi Phi Islands by Sara Dubler (`@saradubler`)
- **South Africa (`ZAF`):** Table Mountain Sunset by Kobus van der Walt (`@kobus`)

For countries without curated photography, an elegant fallback combining the country's flag and thematic container is displayed.

### Famous places for every country

Country Details shows a **Famous places** gallery for all ~250 countries, not only the curated ones:

- Places come from English Wikipedia's `World Heritage Sites in …` and `Tourist attractions in …` categories via the MediaWiki search API (`src/features/countries/api/famousPlacesApi.ts`). A keyword search fills in countries with sparse categories. Lists, overview articles and the country's own article are filtered out, and only places with a lead photo are kept (up to 10, ranked by search relevance).
- Results are cached by RTK Query for an hour per country.
- Wikimedia rejects generic HTTP-client user agents with HTTP 403, so API calls send an identifying `User-Agent`. Photos are downloaded once into the app cache with the same header (`CommonsImage`) and displayed from disk.
- Cards snap horizontally; tapping one opens a full-screen, swipeable viewer with the description, a short Wikipedia extract, a "Read on Wikipedia" link and attribution (Wikimedia Commons / Wikipedia, CC BY-SA).
- Loading skeletons, a retry action on failure and a friendly empty state are included.

### Animations & Micro-Interactions

- **Trending carousel:** Explore opens with a snapping "Trending destinations" rail; the centred card scales up while neighbours shrink and dim, with animated progress dots.
- **Staggered entrances:** Country, journal and editor cards fade and lift into place (`FadeInView`).
- **Animated tab bar:** The focused tab icon springs up inside a tinted pill.
- **Reduced motion:** All new animations respect the OS reduce-motion setting (`useReducedMotion`).
- **Card Press Scale:** Spring micro-interaction (`Animated.spring`) providing tactile feedback on touch.
- **Heart Toggle Bounce:** Elastic sequence animation (`Animated.sequence`) when saving or removing favourites.
- **Image Fade-in:** Smooth opacity transition as destination photos resolve.
- **Floating Bottom Navigation:** Elevated navigation pill bar (`FloatingTabBar`) with safe-area spacing and active tab pill highlights.

## Authentication architecture

- React Hook Form and Zod validate input. The existing RTK Query service calls `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, and `POST /users/add` over HTTPS. The app parses responses and shows messages for validation, rejected credentials, and connectivity failures.
- `src/features/auth/services/authStorage.ts` stores tokens in iOS Keychain or Android Keystore-backed storage. Redux holds the profile and session status.
- Session lifecycle hook checks validity, refreshes tokens on startup or foreground transitions, and manages clean logout.

## Screens

| Screen              | Status      | Description                                                                        |
| ------------------- | ----------- | ---------------------------------------------------------------------------------- |
| **Session Splash**  | Implemented | Brand compass icon, wordmark, travel quote, session check                          |
| **Sign In**         | Implemented | Travel brand presentation, validated form, demo account helper                     |
| **Register**        | Implemented | DummyJSON registration simulation with validation feedback                         |
| **Explore**         | Implemented | Time-aware greeting, theme toggle, trending carousel, search, filters, photo cards |
| **Favourites**      | Implemented | Saved destinations wishlist, search, photo cards, remove action, empty states      |
| **Country Details** | Implemented | Hero photo, personal journal, famous places gallery, overview, geography, share    |
| **Profile**         | Implemented | Avatar, saved/journal/photo statistics, journal shortcut, settings, logout         |
| **Settings**        | Implemented | Appearance mode selector (Light/Dark/System), application credits                  |
| **Journal**         | Implemented | Stats, "start a journal" chips, photo-rich entry cards, empty state                |
| **Journal Editor**  | Implemented | Note with counter, camera/gallery photo, replace/remove, save, delete, guards      |
| **Bucket List**     | Foundation  | Scheduled for Prompt 7                                                             |

## Favourites

- Saved destinations are synchronized in Redux Toolkit (`favouritesSlice`) and persisted to AsyncStorage under user-scoped keys (`passport:favourites:<userId>`).
- Cross-user data isolation ensures switching accounts preserves independent wishlists.
- Removal policy: a favourite without journal content is removed immediately. If it has a journal note or photo, the user is asked to confirm, and removing it also deletes the journal entry and its stored photo (`removeFavouriteAndJournal`). Journal content is never deleted silently.

## Travel journal (Personal Notes & Photos)

Each favourite country can hold one journal entry with a short note, a photo, or both.

### Data model

```ts
interface JournalEntry {
  countryCode: string; // cca3
  note: string; // trimmed, max 500 characters
  photoUri: string | null; // file:// URI in app-private storage
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

No country metadata is stored; names and flags come from the countries cache.

### Architecture

- **State:** `journalSlice` (Redux Toolkit) keeps entries keyed by country code. Actions: `createJournalEntry`, `updateJournalEntry`, `setJournalPhoto`, `removeJournalPhoto`, `deleteJournalEntry`, `hydrateJournal`. Selectors: `selectJournalEntries` (newest first), `selectJournalEntryByCountry`, `selectJournalCount`. An entry left with neither note nor photo is pruned automatically.
- **Thunks:** `journalActions.ts` coordinates Redux, storage and files: `saveJournalEntry`, `deleteJournalEntryWithPhoto`, `removeFavouriteAndJournal` and `hydrateJournalForUser`. Every write is persisted before it counts as done; a failed write rolls Redux back to the previous snapshot and shows an error.
- **UI:** the Journal tab, the full-screen Journal Editor (`JournalEditor` route) and the Personal Journal panel on Country Details. Unsaved countries explain that they must be saved first and offer **Save to Favourites**.

### Persistence

- Metadata is stored in AsyncStorage under the per-user key `passport:journal:<userId>` as `{ "version": 1, "entries": [...] }`. The loader also accepts a bare array, drops invalid entries individually and treats corrupted JSON as an empty journal.
- Photo bytes are never stored in AsyncStorage. After the camera or gallery returns a temporary URI, the photo is validated and copied with `react-native-file-access` into `DocumentDir/journal/<userId>/` with a unique name such as `LKA-1732350000000-k3j9x2.jpg`. Only that persistent `file://` URI is saved.
- Replacement is safe: the new copy is written first, the entry is saved, and only then is the previous photo deleted. If saving fails, the old photo is kept.
- Unsaved copies are deleted when the editor closes without saving, and on every sign-in an orphan sweep removes files in the user's journal folder that no entry references.
- A missing photo file shows a theme-aware placeholder asking the user to replace it.

### Camera and gallery

- `react-native-image-picker` provides **Take Photo** (`launchCamera`) and **Choose from Gallery** (`launchImageLibrary`, one photo). Photos are resized on the picker side to at most 1600 px at 80% quality; files over 15 MB and non-image types are rejected.
- Cancellation returns to the editor quietly. Permission denial, missing camera hardware (for example emulators without a camera) and picker errors show clear messages instead of crashing.
- **Android:** the app does not declare `CAMERA`, so the picker uses the system camera intent and no runtime camera permission is requested. The gallery uses the system photo picker, so no broad storage permission is needed.
- **iOS:** `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` are set in `Info.plist`. The library picker uses PHPicker, which supports limited-library access.

### Editor states

Empty editor, character counter, unsaved-changes guard on back navigation, photo picking and copying progress, saving with double-submit protection, success and error banners, delete confirmation, and missing-photo handling.

## Checks

```sh
npm ci
npm run lint
npm run typecheck
npm run format:check
npm run test:ci
```

Native modules are mocked in `jest.setup.js` (`react-native-image-picker`, `react-native-file-access`). Journal behaviour is covered by `__tests__/journal.test.tsx`.

For Android build verification, run `./gradlew :app:assembleDebug` from `android/` on macOS or Linux, or `./gradlew.bat :app:assembleDebug` from PowerShell on Windows.

## Source layout

- `src/app/` owns the Redux store and application lifecycle integration.
- `src/features/` owns screens, components, services, and state by feature.
- `src/navigation/` owns typed routes and the custom floating bottom tab navigator.
- `src/components/` contains reusable buttons, inputs, headers, and empty states.
- `src/theme/` contains design tokens, light/dark themes, `ThemeProvider`, and `useAppTheme`.
- `src/services/` contains the API base query and storage adapters.
- `src/features/journal/` contains the journal model, slice, storage, photo services, thunks and screens.
- `src/hooks/` contains shared hooks such as `useReducedMotion`.
