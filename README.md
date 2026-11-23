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

| Token             | Light Theme | Dark Theme | Purpose                                 |
| ----------------- | ----------- | ---------- | --------------------------------------- |
| Background        | `#F8F7F2`   | `#101B24`  | Primary screen canvas                   |
| Primary Surface   | `#FFFFFF`   | `#1C2A35`  | Card backgrounds and sheets             |
| Secondary Surface | `#F0F3F1`   | `#263844`  | Inset backgrounds and pill containers   |
| Primary Text      | `#172B3A`   | `#F3F6F7`  | Headings and high-emphasis labels       |
| Secondary Text    | `#667784`   | `#A8B7C2`  | Subtitles, captions and metadata        |
| Primary Button    | `#137C78`   | `#38B5AA`  | Primary actions and active highlights   |
| Primary Dark      | `#0B5957`   | `#28948A`  | High-contrast brand elements            |
| Accent            | `#E88C70`   | `#F09C81`  | Highlights, badges and saved heart icon |
| Soft Mint         | `#DDF1E9`   | `#1F3D39`  | Subtle highlights and tint surfaces     |
| Border            | `#E4E9E8`   | `#334550`  | Structural dividers and card borders    |
| Success           | `#27866F`   | `#55C49D`  | Positive feedback and confirmations     |
| Error             | `#C64242`   | `#FF7777`  | Form validation and connectivity errors |

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

### Animations & Micro-Interactions

- **Card Press Scale:** Spring micro-interaction (`Animated.spring`) providing tactile feedback on touch.
- **Heart Toggle Bounce:** Elastic sequence animation (`Animated.sequence`) when saving or removing favourites.
- **Image Fade-in:** Smooth opacity transition as destination photos resolve.
- **Floating Bottom Navigation:** Elevated navigation pill bar (`FloatingTabBar`) with safe-area spacing and active tab pill highlights.

## Authentication architecture

- React Hook Form and Zod validate input. The existing RTK Query service calls `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, and `POST /users/add` over HTTPS. The app parses responses and shows messages for validation, rejected credentials, and connectivity failures.
- `src/features/auth/services/authStorage.ts` stores tokens in iOS Keychain or Android Keystore-backed storage. Redux holds the profile and session status.
- Session lifecycle hook checks validity, refreshes tokens on startup or foreground transitions, and manages clean logout.

## Screens

| Screen                | Status      | Description                                                                        |
| --------------------- | ----------- | ---------------------------------------------------------------------------------- |
| **Session Splash**    | Implemented | Brand compass icon, wordmark, travel quote, session check                          |
| **Sign In**           | Implemented | Travel brand presentation, validated form, demo account helper                     |
| **Register**          | Implemented | DummyJSON registration simulation with validation feedback                         |
| **Explore**           | Implemented | Greeting, featured destination banner, search, region filters, sort, photo cards   |
| **Favourites**        | Implemented | Saved destinations wishlist, search, photo cards, remove action, empty states      |
| **Country Details**   | Implemented | Panoramic photography, flag badge, overview grid, geography, culture, native share |
| **Profile**           | Implemented | Initials avatar, username, saved places counter, settings entry, logout            |
| **Settings**          | Implemented | Appearance mode selector (Light/Dark/System), application credits                  |
| **Journal**           | Foundation  | Scheduled for Prompt 6 (notes & photos)                                            |
| **Journal Entry**     | Foundation  | Scheduled for Prompt 6                                                             |
| **New/Edit Entry**    | Foundation  | Scheduled for Prompt 6                                                             |
| **Bucket List**       | Foundation  | Scheduled for Prompt 7                                                             |
| **Travel Statistics** | Foundation  | Scheduled for future release                                                       |

## Favourites

- Saved destinations are synchronized in Redux Toolkit (`favouritesSlice`) and persisted to AsyncStorage under user-scoped keys (`passport:favourites:<userId>`).
- Cross-user data isolation ensures switching accounts preserves independent wishlists.
- Removal policy safely handles immediate removal when no notes exist, with confirmation hooks reserved for journal integration.

## Checks

```sh
npm ci
npm run lint
npm run typecheck
npm run format:check
npm run test:ci
```

For Android build verification, run `./gradlew :app:assembleDebug` from `android/` on macOS or Linux, or `./gradlew.bat :app:assembleDebug` from PowerShell on Windows.

## Source layout

- `src/app/` owns the Redux store and application lifecycle integration.
- `src/features/` owns screens, components, services, and state by feature.
- `src/navigation/` owns typed routes and the custom floating bottom tab navigator.
- `src/components/` contains reusable buttons, inputs, headers, and empty states.
- `src/theme/` contains design tokens, light/dark themes, `ThemeProvider`, and `useAppTheme`.
- `src/services/` contains API base queries, storage adapters, and photo persistence helpers.
