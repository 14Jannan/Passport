# Passport

Passport is a React Native CLI application for travel discovery and a personal travel journal. The foundation includes a guest preview, a typed navigation structure, light and dark themes, and shared UI components.

## Setup

1. Install Node.js 22.11 or newer (CI uses Node.js 24) and run `npm ci`.
2. For Android, install JDK 21 and Android Studio. Use SDK Manager to install Android SDK Platform 36, Build Tools 36.0.0, NDK 27.1.12297006, and CMake 3.22.1. Set `ANDROID_HOME` to the SDK directory and start an emulator or connect a device.
3. For iOS, use macOS with Xcode and its command-line tools. Run `bundle install` at the root, then run `bundle exec pod install` from `ios/`.
4. Run `npm start` to start Metro. In a second terminal, run `npm run android` or `npm run ios`.

## Screens

| Area           | Screens                                                              |
| -------------- | -------------------------------------------------------------------- |
| Authentication | Welcome, Sign in, Create account, Reset password                     |
| Main tabs      | Discover, Saved destinations, Travel journal, Profile                |
| Stack screens  | Search, Destination details, Journal entry, New/edit entry, Settings |

Select **Continue as guest** to explore the four tabs. The guest session is kept in memory. The account forms, catalog, and journal screens are placeholders. The services under `src/services/` provide RTK Query, storage, and journal photo infrastructure for future features.

## Checks

```sh
npm run lint
npm run typecheck
npm run format:check
npm run test:ci
```

For Android build verification, run `./gradlew :app:assembleDebug` from `android/` on macOS or Linux, or `./gradlew.bat :app:assembleDebug` from PowerShell on Windows.

## Source layout

- `src/app/` owns the Redux store and app lifecycle integration.
- `src/features/` owns screens and state by feature.
- `src/navigation/` owns typed routes and navigators.
- `src/components/` and `src/theme/` contain reusable UI and appearance tokens.
- `src/services/` contains API, secure and non-sensitive storage, and local photo persistence adapters.
