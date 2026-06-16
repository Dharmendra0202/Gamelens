# GameLens — Project Context

> Single source of truth. Update this file whenever project structure, architecture, or tech stack changes.

---

## 1. Project Overview

**App name:** GameLens (package: `gamelens`)  
**Purpose:** A grassroots cricket companion for India — lets players start & score matches, run tournaments, discover opponents, shop for gear, and connect with the cricket community.  
**Platform:** Android (primary), iOS-ready  
**Status:** Active development

---

## 2. Tech Stack

### Frontend

| Layer          | Technology                             | Version  |
| -------------- | -------------------------------------- | -------- |
| Framework      | React Native                           | 0.81.5   |
| UI Library     | React                                  | 19.1.0   |
| Dev toolchain  | Expo SDK                               | ~54.0.x  |
| Language       | TypeScript                             | ~5.9.2   |
| Navigation     | Expo Router (file-based)               | ~6.0.x   |
| Tab navigation | React Navigation Bottom Tabs           | ^7.4.0   |
| Animations     | React Native Reanimated + Animated API | ~4.1.1   |
| Gestures       | React Native Gesture Handler           | ~2.28.0  |
| Icons          | @expo/vector-icons (Ionicons)          | ^15.0.3  |
| Gradients      | expo-linear-gradient                   | ~15.0.8  |
| Images         | expo-image, ImageBackground            | ~3.0.11  |
| SVG            | react-native-svg                       | ^15.12.1 |

### Backend / Services

| Service           | Purpose                       |
| ----------------- | ----------------------------- |
| None currently    | All data is local/dummy       |
| expo-location     | GPS for nearby grounds        |
| expo-image-picker | Photo library access          |
| expo-linking      | Deep links, WhatsApp redirect |
| expo-haptics      | Haptic feedback               |

### Build & Distribution

| Tool                            | Purpose                |
| ------------------------------- | ---------------------- |
| EAS (Expo Application Services) | Cloud builds           |
| Gradle + Android SDK            | Local Android builds   |
| adb                             | Device install & debug |

### Accounts

| Service    | Account                                     |
| ---------- | ------------------------------------------- |
| Expo / EAS | `gamelens` — `gamelensdharmendra@gmail.com` |
| GitHub     | `Dharmendra0202/crickbuz`                   |

---

## 3. Folder Structure

```
/crickbuz (workspace root)
├── app/
│   ├── _layout.tsx          ← Root layout (Stack navigator, no headers)
│   ├── index.tsx            ← Auth flow: Splash → Login → Signup
│   ├── modal.tsx            ← Generic modal screen
│   └── (tabs)/
│       ├── _layout.tsx      ← Bottom tab bar config (5 tabs)
│       ├── home.tsx         ← Home feed, menu drawer, match cards
│       ├── looking.tsx      ← Looking for opponents / post feed
│       ├── my-cricket.tsx   ← Match start, tournament, scoring (3000+ lines)
│       ├── community.tsx    ← Social feed, groups, events
│       └── store.tsx        ← Cricket gear store
├── components/
│   ├── themed-text.tsx      ← Theme-aware Text (light/dark)
│   ├── themed-view.tsx      ← Theme-aware View (light/dark)
│   ├── external-link.tsx    ← Opens URLs in browser
│   ├── haptic-tab.tsx       ← Tab press with haptic feedback
│   ├── hello-wave.tsx       ← Animated waving hand
│   ├── parallax-scroll-view.tsx ← Scroll view with parallax header
│   ├── component.js         ← (legacy placeholder)
│   └── ui/
│       ├── collapsible.tsx  ← Expandable section
│       ├── icon-symbol.tsx  ← Cross-platform icon wrapper
│       └── icon-symbol.ios.tsx ← iOS-specific icon symbols
├── constants/
│   └── theme.ts             ← Colors (light/dark) + platform Fonts
├── hooks/
│   ├── use-color-scheme.ts      ← Android/iOS color scheme
│   ├── use-color-scheme.web.ts  ← Web color scheme (platform split)
│   └── use-theme-color.ts       ← Resolves color from theme + props
├── assets/images/           ← App icons, splash, favicons
├── scripts/
│   └── reset-project.js     ← Resets to blank Expo starter
├── android/                 ← Generated native Android project (via prebuild)
├── app.json                 ← Expo config (name, slug, scheme, EAS projectId)
├── eas.json                 ← EAS build profiles (development/preview/production)
├── package.json
├── tsconfig.json
├── TECHSTACK.md             ← Quick tech stack reference
└── PROJECT_CONTEXT.md       ← This file
```

---

## 4. Screen Architecture & Features

### `app/index.tsx` — Auth Flow

State machine: `splash → login → signup`

| Screen     | Features                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| **Splash** | Animated logo, pitch lines, ring ripple, wordmark reveal, auto-transition                                         |
| **Login**  | Username + password inputs, focus states, green gradient CTA, social login (G/f/Twitter), screen fade transitions |
| **Signup** | Full Name + Email + Password + Confirm Password, hero card, animated screen transitions                           |

Both auth screens use `KeyboardAvoidingView` + `ScrollView` to prevent keyboard push-up.

---

### `app/(tabs)/home.tsx` — Home

- **Header:** Green gradient, menu button, search, chat, notifications
- **Profile card:** Editable — name, phone, role, location, batting/bowling style, avatar (image picker)
- **Quick actions bar:** Start Match, New Tourney, Find Players, Store
- **Match discovery:** Horizontal snap-scroll cards with live/upcoming scores
- **Banner:** IPL promo with image background
- **Popular Cricketers:** Ranked list, follow button, player modal
- **Cricket Store:** Horizontal product scroll
- **Community Feed:** Post cards with like/comment/share
- **Menu Drawer (Modal):** 14 navigation items:
  - Add Tournament, Start Match, Go Live, My Cricket, My Tournament, My Performance
  - CricHeroes Store, Leaderboards, CricHeroes Awards, Associations, Clubs, Contact, Share the App, Rate Us
- **Each drawer item opens a full-screen modal** with real dummy content

---

### `app/(tabs)/my-cricket.tsx` — My Cricket (most complex screen)

Multi-view state machine with 16 views:

```
matches → teamSelection → selectTeam / createTeam
                       → matchSetup → tossPage → playerSelection → matchSettings → scoringPage
tournaments → createTournament → tournamentTeamManagement / tournamentDetail → addTeamsPlayers
teams → teamsSelection / createTeam
search
```

**Key features:**

- **Matches tab:** Filter by your/participate/network/all, match cards, start match flow
- **Tournaments tab:** Create tournament form (banner+logo upload, dates, categories), tournament detail (matches/points table/leaderboard/teams), settings bottom sheet with 15 options
- **Teams tab:** Create team or select existing
- **Match flow:** Team selection → match setup (overs, location via GPS, pitch type, ball type, officials) → toss → player selection → match settings → live scoring
- **Live scoring:** Run buttons (0-6, extras, wicket, undo), bowler figures, batsman stats, score history stack for undo
- **Search modal:** Searches tournaments + matches simultaneously

---

### `app/(tabs)/looking.tsx` — Looking

- Composer for posting looking requests (opponent/tournament/player)
- Quick action cards with pre-filled templates
- Community post feed with reply + message actions

---

### `app/(tabs)/community.tsx` — Community

- 3 tabs: Feed / Groups / Events
- Post cards with like/comment/share
- Group list + join button
- Event cards with date, venue, attendees

---

### `app/(tabs)/store.tsx` — Store

- Header with cart badge
- Search bar
- Featured deals (horizontal scroll)
- Category filter chips
- Product grid with discount badges, ratings, add-to-cart

---

## 5. Navigation

Expo Router file-based routing:

```
/                 → app/index.tsx        (auth)
/(tabs)/home      → app/(tabs)/home.tsx
/(tabs)/looking   → app/(tabs)/looking.tsx
/(tabs)/my-cricket → app/(tabs)/my-cricket.tsx
/(tabs)/community → app/(tabs)/community.tsx
/(tabs)/store     → app/(tabs)/store.tsx
/modal            → app/modal.tsx
```

**Cross-tab deep linking** via `router.push` with params:

```ts
router.push({
  pathname: "/(tabs)/my-cricket",
  params: { action: "startMatch" },
});
router.push({ pathname: "/(tabs)/my-cricket", params: { tab: "tournaments" } });
```

Tab bar: `position: absolute`, height 60, white bg, red active tint (`#B91C1C`).

---

## 6. Components

| Component            | Props                                                                              | Purpose                                    |
| -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `ThemedText`         | `lightColor?`, `darkColor?`, `type?` (default/title/defaultSemiBold/subtitle/link) | Text that respects color scheme            |
| `ThemedView`         | `lightColor?`, `darkColor?`                                                        | View that respects color scheme            |
| `ExternalLink`       | `href`                                                                             | Opens URL in in-app browser                |
| `HapticTab`          | (tab button props)                                                                 | Tab press triggers haptic                  |
| `Collapsible`        | `title`                                                                            | Expand/collapse section                    |
| `IconSymbol`         | `name`, `size`, `color`                                                            | SF Symbols (iOS) / MaterialIcons (Android) |
| `ParallaxScrollView` | `headerImage`, `headerBackgroundColor`                                             | Parallax header scroll                     |

---

## 7. Hooks

| Hook             | File                            | Purpose                                                           |
| ---------------- | ------------------------------- | ----------------------------------------------------------------- |
| `useColorScheme` | `hooks/use-color-scheme.ts`     | Returns `'light'` or `'dark'` (native)                            |
| `useColorScheme` | `hooks/use-color-scheme.web.ts` | Web-specific override                                             |
| `useThemeColor`  | `hooks/use-theme-color.ts`      | Resolves color from `Colors[theme][colorName]` with prop override |

**Platform file split pattern:** `.web.ts` variant auto-used on web by Metro.

---

## 8. Theme & Styling

### Colors (`constants/theme.ts`)

```ts
Colors.light = { text: '#11181C', background: '#fff', tint: '#B91C1C', ... }
Colors.dark  = { text: '#ECEDEE', background: '#151718', tint: '#fff', ... }
```

### Home screen uses green theme (`#00A66A / #0F766E / #064E3B`)

### Auth, my-cricket, community, store use red theme (`#B91C1C / #991B1B / #7F1D1D`)

All styles use `StyleSheet.create()`. No external CSS-in-JS library. Responsive sizing uses `Dimensions.get('window')` for splash/auth screens.

---

## 9. Key Architectural Patterns

### View State Machine

`my-cricket.tsx` manages 16 views via `currentView` state instead of navigation routes — avoids deep nesting and preserves all match state in memory.

### Score History / Undo Stack

```ts
const [scoreHistory, setScoreHistory] = useState([]);
// push snapshot before each action
const saveScoreSnapshot = () => setScoreHistory((h) => [...h, currentState]);
// undo restores last snapshot
const undoScore = () => {
  restore(scoreHistory.at(-1));
  setScoreHistory((h) => h.slice(0, -1));
};
```

### Cross-Tab Deep Linking

Home drawer triggers `my-cricket` screen with `params` via Expo Router. `useFocusEffect` in `my-cricket` reads params on every focus event.

### Reusable Render Helpers (in `my-cricket.tsx`)

```ts
const renderTextInput = (label, value, onChange, placeholder, required, keyboardType) => (...)
const renderChipGroup = (items, selected, onSelect, activeColor) => (...)
const renderBallTypeSelector = (selected, onSelect) => (...)
const renderPitchTypeSelector = () => (...)
```

### Platform File Split

```
hooks/use-color-scheme.ts      ← iOS + Android
hooks/use-color-scheme.web.ts  ← Web (auto-resolved by Metro)
```

---

## 10. Coding Standards

### Naming

- **Files:** kebab-case (`my-cricket.tsx`, `use-color-scheme.ts`)
- **Components:** PascalCase (`ThemedText`, `HomeScreen`)
- **Hooks:** camelCase with `use` prefix
- **State vars:** camelCase (`showPlayerModal`, `activeTab`, `currentView`)
- **Style keys:** camelCase matching component name (`drawerMenuItem`, `lbRankBadge`)
- **Constants:** SCREAMING_SNAKE (`SCREEN_WIDTH`, `CARD_MARGIN`)

### TypeScript

- Explicit types for all state: `useState<ScreenType>('splash')`
- Union types for view states: `type ScreenType = 'splash' | 'login' | 'signup'`
- `as const` for readonly tuples
- `any` cast for Ionicons names: `name={icon as any}`

### Component structure

1. Imports
2. Constants (SCREEN_WIDTH, colors)
3. Type definitions
4. Default export (component)
5. Inline sub-components (if small)
6. `const styles = StyleSheet.create({...})` at bottom

### No external state management (Redux, Zustand, etc.) — all state is local `useState`.

---

## 11. Environment & Config

### `app.json` (key fields)

```json
{
  "name": "gamelens",
  "slug": "gamelens",
  "scheme": "gamelens",
  "android": { "package": "com.gamelens.app" },
  "extra": { "eas": { "projectId": "35999324-116c-41f1-a7d2-2b6d68e9c943" } }
}
```

### `eas.json` (build profiles)

```json
{
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {}
  }
}
```

No `.env` file — no secrets currently in the codebase.

---

## 12. Development Workflow

### Start dev server

```bash
npm start
# or
npx expo start
```

### Build APK locally (Android)

```bash
npx expo prebuild --platform android   # generates android/ folder (one-time)
cd android
./gradlew assembleRelease              # ~20 min first build
adb install app/build/outputs/apk/release/app-release.apk
```

### Cloud build (EAS)

```bash
eas build -p android --profile preview   # queued on Expo servers
```

Monitor at: `expo.dev/accounts/gamelens/projects/gamelens`

### Lint

```bash
npm run lint
```

### Reset to blank Expo starter

```bash
npm run reset-project
```

---

## 13. Important Dependencies

| Package                   | Why it matters                                                   |
| ------------------------- | ---------------------------------------------------------------- |
| `expo-router`             | All navigation — changing routing approach would require rewrite |
| `expo-linear-gradient`    | Used heavily in headers, buttons, cards                          |
| `@expo/vector-icons`      | Ionicons used on every screen                                    |
| `expo-image-picker`       | Tournament banner/logo + profile photo                           |
| `expo-location`           | GPS-based nearby grounds in match setup                          |
| `react-native-reanimated` | Required by gesture handler; used for complex animations         |
| `expo-linking`            | WhatsApp auth redirect                                           |

---

## 14. Known Issues / Tech Debt

- Dummy/hardcoded data **removed** — all lists now start empty with `// TODO(backend):` markers (see `DUMMY_DATA_AUDIT.md`)
- Backend target is **Supabase** — client in `services/supabase.ts`, stubs in `services/api.ts`, AsyncStorage bridge in `services/storage.ts` (see `BACKEND_SPEC.md`)
- New input flow: `app/setup/players.tsx` → `app/setup/match.tsx` → scoring; profile at `app/profile/setup.tsx`
- Live scoring auto-saves to AsyncStorage; "Resume Match?" prompt on open (my-cricket.tsx)
- `my-cricket.tsx` is 3000+ lines — candidate for splitting into sub-screens
- No authentication logic yet — login/signup navigates directly to home (Supabase Auth pending)
