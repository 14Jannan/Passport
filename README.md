# Passport

Passport is a React Native CLI application for travel discovery and a personal travel journal. This branch adds authentication for IN3210 Mobile Applications Development, Assignment 2 (234088L).

## Setup

1. Install Node.js 22.11 or newer (CI uses Node.js 24) and run `npm ci`.
2. For Android, install JDK 21 and Android Studio. Use SDK Manager to install Android SDK Platform 36, Build Tools 36.0.0, NDK 27.1.12297006, and CMake 3.22.1. Set `ANDROID_HOME` to the SDK directory and start an emulator or connect a device.
3. For iOS, use macOS with Xcode and its command-line tools. Run `bundle install` at the root, then run `bundle exec pod install` from `ios/`.
4. Run `npm start` to start Metro. In a second terminal, run `npm run android` or `npm run ios`.

## Demo sign-in

On the login screen, select **Use demo credentials**, then select **Sign in**. The public DummyJSON example is username `emilys` and password `emilyspass`. An internet connection is required. After signing in, open **Profile** to see the authenticated profile and log out.

**Create a demo account** calls DummyJSON’s simulated registration endpoint. Use sample details and a unique dummy password. DummyJSON returns a temporary success response without saving the account, so the new credentials cannot authenticate. The app returns to login with a confirmation that explains this behavior. [DummyJSON users documentation](https://dummyjson.com/docs/users#users-add)

## Authentication architecture

- React Hook Form and Zod validate input. The existing RTK Query service calls `POST /auth/login`, `GET /auth/me`, `POST /auth/refresh`, and `POST /users/add` over HTTPS. The app parses responses and shows messages for validation, rejected credentials, and connectivity failures. [DummyJSON authentication documentation](https://dummyjson.com/docs/auth)
- `src/features/auth/services/authStorage.ts` stores the access token, refresh token, and estimated expiration in iOS Keychain or Android Keystore-backed storage. Redux holds the profile and session status. Authentication requests are untracked in RTK Query and Redux DevTools is disabled because request actions can carry credentials in memory. AsyncStorage is used for non-sensitive preferences.
- On launch, the splash screen stays visible while Passport reads and verifies the saved session. It refreshes a locally expired token or one rejected by the API, verifies the refreshed profile, and saves the rotated credentials before opening the protected tabs. Expired active sessions are also checked while the app is foregrounded. Rejected or malformed credentials are cleared. A temporary network failure keeps protected routes closed and lets the user retry.
- Logout clears secure storage, resets the RTK Query cache and returns to a fresh login stack. If the OS cannot delete the credentials, Passport closes the protected stack and offers a deletion retry. Complete the retry before closing the app to ensure the saved credentials are removed.

## Screens

| Area           | Screens                                                              |
| -------------- | -------------------------------------------------------------------- |
| Authentication | Session splash, Sign in, Create demo account                         |
| Protected tabs | Explore, Favourites, Journal, Profile                                |
| Stack screens  | Search, Destination details, Journal entry, New/edit entry, Settings |

DummyJSON is a public mock service. Logout is local and does not revoke tokens on the service. Travel statistics, the catalog, saved destinations, and journal editing retain their foundation placeholders.

## Checks

```sh
npm ci
npm run lint
npm run typecheck
npm run format:check
npm run test:ci
```

For Android build verification, run `./gradlew :app:assembleDebug` from `android/` on macOS or Linux, or `./gradlew.bat :app:assembleDebug` from PowerShell on Windows.

On an Android or iOS device, check sign-in, a cold restart, expired-session refresh, simulated registration, and logout followed by a cold restart. Verify keyboard layout, password visibility, color scheme, and back navigation with accessibility features enabled.

## Source layout

- `src/app/` owns the Redux store and application lifecycle integration.
- `src/features/` owns screens and state by feature.
- `src/navigation/` owns typed routes and navigators.
- `src/components/` and `src/theme/` contain reusable UI and appearance tokens.
- `src/services/` contains the API, preference storage, and local photo persistence adapters.
