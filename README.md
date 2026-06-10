# CalorAI — Taste Profile

A React Native (Expo, managed workflow) app where a new CalorAI user swipes through foods to
build a personalised **taste profile** and a **nutrition analysis**. Built with a dark,
glassmorphism aesthetic to match the provided Figma, with smooth 60fps gesture-driven swiping
on **both iOS and Android**, all running in **Expo Go** with zero native build.

> Built as the CalorAI React Native developer test task.

---

## 1. Project overview

The app is a three-screen flow plus supporting tabs, all hosted under a glass bottom navigation:

- **Start** — an onboarding card ("Design Your Food Plan" → "Build Your Taste Profile") that
  launches the swipe flow.
- **Swipe** — a stack of **statement cards** ("I love eating &lt;food&gt;") you respond to with a
  **4-way swipe**:
  - **→ Right = Yes** (love it)  ·  **← Left = No**  ·  **↑ Up = Super Like**  ·  **↓ Down = Not Sure**
  - The same four verdicts are available as tap buttons (Swipe Left / Not Sure / Super Like /
    Swipe Right), driving the *exact same* card animation, so gesture and buttons are never two
    divergent code paths.
  - A top progress bar advances after every swipe; **undo** reverses the last one.
- **Taste Profile** — a generated summary: a taste archetype, **Key Highlights**, a **Nutrition
  Analysis** dashboard (calorie comfort zone, health balance, healthiest vs most-indulgent pick),
  and a swipeable **carousel** of your foods split by verdict — *Most Liked → Liked*, then
  *No → Not Sure*, then *Favorite Cuisines* — with pagination dots.
- **FAQ** — a short explainer of how the swiping and profile work.
- **Search** — a food lookup (filter the catalogue, tap any result to open a **detail view** with
  its photo, calories, health score, category and tags).

Every food carries an estimated **calorie** count and a **health score (0–100)**, surfaced on the
cards, in search, and across the profile — the "gives calorie info + analysis" angle of the brief.

---

## 2. Setup & running (Expo Go)

### Prerequisites

- **Node 18+**
- The **Expo Go** app on a phone running **Expo SDK 54** (iOS or Android), *or* an iOS Simulator /
  Android emulator. Expo Go only runs one SDK at a time — this project targets **SDK 54**, so use
  an Expo Go build that supports SDK 54.

```bash
# 1. Install dependencies
npm install            # an .npmrc sets legacy-peer-deps=true (needed for React 19 peers)

# 2. Start the dev server
npm start              # or: npx expo start

# 3. Run it
#  - Scan the QR with Expo Go (Android) or the Camera app (iOS), or
#  - press "a" for an Android emulator / "i" for an iOS simulator
```

### Connection tips

- Phone and computer must be on the **same Wi-Fi** for the default LAN mode. On restrictive
  networks (corporate/campus/public Wi-Fi that isolate devices), use your **phone's Personal
  Hotspot** (connect the Mac to it) — LAN then works directly.
- `npx expo start --tunnel` routes over the internet if you can't share a network (needs
  `@expo/ngrok`, included as a devDependency). Note some networks block ngrok.
- To preview **production performance** in Expo Go: `npx expo start --no-dev --minify`
  (dev mode is significantly heavier than a release build).

No environment variables, backend, or login — all data is local in `data/foods.json`.

---

## 3. Libraries used (and why)

| Library | Why |
| --- | --- |
| **expo** (SDK 54, managed) | Required run target; Expo Go on iOS + Android with no native build. |
| **@react-navigation/native** + **native-stack** | Stack of `Main` (tab host) + a full-screen `Swipe` route, with a transparent theme so the dark gradient never flashes white. |
| **react-native-gesture-handler** | The 4-direction pan gesture powering swiping; runs on the UI thread. |
| **react-native-reanimated** (v4) + **react-native-worklets** | All animations — card physics, verdict badges, progress, screen transitions — run on the UI thread for 60fps. Worklets is Reanimated 4's runtime peer. |
| **expo-image** | Cached, fast-decoding food photos, plus the **blurred-photo card backdrop** (`blurRadius`) so each card glows with the dish's own colour. |
| **expo-blur** | Real native frosted glass on iOS for the signature, non-scrolling cards (Android + scrolling surfaces use a solid fallback — see §5). |
| **expo-linear-gradient** | Dark backgrounds, the green CTA, card scrims and the progress fill. |
| **expo-haptics** | Distinct tactile feedback on like / dislike / super-like / undo / tap (native only). |
| **react-native-safe-area-context** | Keeps the glass nav and headers clear of the notch / home indicator / Android gesture bar. |
| **react-native-screens** | Native screen optimisation under React Navigation. |
| **@expo/vector-icons** (Ionicons) | Icons throughout, including the carrot ("nutrition") tab glyph. |
| **TypeScript** | Strict types across a small, shared `types/` module. |

---

## 4. Architecture

```text
App.tsx                     # Navigation: Main (tab host) + full-screen Swipe route + providers
index.ts                    # Expo entry point
theme/theme.ts              # 🎯 Single source of truth: colours, gradients, spacing, radius, shadows, springs
data/foods.json             # Food catalogue (name, image, category, tags, calories, healthScore) + cuisines
types/index.ts              # Shared domain types (Food, Verdict, Decision, profile/analysis types)
context/
  TasteProfileContext.tsx   # App state: deck index + decisions; derives loves/superlikes/hates/unsures
utils/
  profile.ts                # Pure taste engine: traits, archetype, macros, cuisines, nutrition analysis
  nutrition.ts              # Pure health-score → label/colour mapping
  haptics.ts                # Guarded expo-haptics wrappers (no-op on web)
components/
  GlassView.tsx             # ⭐ Cross-platform frosted glass (blur on iOS, solid fallback elsewhere)
  GradientBackground.tsx    # Static near-black gradient + a soft green glow (perf-conscious, see §5)
  FoodCard.tsx              # ⭐ Statement card: 4-direction gesture, verdict badges, blurred-photo backdrop
  SwipeDeck.tsx             # Layered 3-card stack
  ActionButton.tsx          # The four circular verdict buttons
  PrimaryButton.tsx         # Green gradient CTA
  ProgressBar.tsx           # Spring-animated green progress (compact mode for the swipe header)
  BottomNav.tsx             # Glass bottom nav: Start / FAQ / Taste Profile + search
  SearchOverlay.tsx         # Food search + tap-through detail view
screens/
  IntroScreen.tsx           # "Start" tab (Design Your Food Plan)
  SwipeScreen.tsx           # The deck, progress and the 4 verdict buttons
  ResultsScreen.tsx         # Taste Profile: highlights, nutrition dashboard, verdict carousel
  FaqScreen.tsx             # FAQ tab
  MainScreen.tsx            # Tab host (Start / FAQ / Taste Profile) + nav + search overlay
```

**Separation of concerns:** state lives in a context; all derivation logic is pure and React-free
(`utils/profile.ts`, `utils/nutrition.ts`); every visual token lives in `theme/theme.ts`; screens
compose small, single-purpose components. Re-renders are kept tight with `useMemo`/`useCallback`,
and every per-frame animation runs on the UI thread via Reanimated worklets.

---

## 5. Handling iOS vs Android differences

- **Frosted glass — the big one.** `components/GlassView.tsx` is one component that `Platform`-splits:
  - **iOS + `blur`** → a real native `BlurView` (expo-blur) with a translucent fill + hairline border.
  - **Everything else** (Android, and any scrolling/iOS surface without `blur`) → a semi-transparent
    **solid** dark layer with the same border + radius, so it still reads as glass and never looks broken.
  - Native blur on Android is unreliable, *and* a live `BlurView` over a scrolling list re-blurs every
    frame (jank). So blur is **opt-in** and reserved for the few **static, signature** surfaces (the
    Start/completion/empty cards). The bottom nav — which floats over scrolling lists — deliberately
    uses the solid fallback on both platforms. This matches the flat Figma look *and* keeps 60fps.
- **Shadows.** Every elevation preset in `theme.ts` ships both iOS `shadow*` props and an Android
  `elevation`, so depth survives on both platforms.
- **Safe areas & edge-to-edge.** `react-native-safe-area-context` insets keep the nav and headers off
  the notch / home indicator / Android gesture bar; `android.edgeToEdgeEnabled` is set in `app.json`.
- **Haptics.** Guarded so they're a no-op (and never throw) on web; native-only on iOS/Android.
- **Status bar / dark theme.** Forced dark `userInterfaceStyle` + a light status bar on both platforms,
  so the UI never renders with light system chrome.
- **120Hz / ProMotion.** `CADisableMinimumFrameDurationOnPhone` is set in `ios.infoPlist` so the
  swipe animation can run at the display's full refresh rate on supporting iPhones.

---

## 6. Assumptions & trade-offs

- **Statement cards use real food photos.** The Figma cards are statements ("I love eating salads")
  with a small image. Because the catalogue has real photos, the card shows the food's photo (with a
  blurred copy as its coloured backdrop) — a small, deliberate deviation that keeps the imagery rich.
- **Calorie + health values are representative estimates.** They're sensible per-serving figures baked
  into `foods.json` to power the analysis, not a nutrition database. Easy to swap for real data later.
- **Profile + nutrition engines are heuristic and deterministic.** Tag/category based, designed to
  always produce a sensible, non-empty result for any subset of swipes (with a "balanced" fallback
  archetype). Pure and React-free, so they're trivial to reason about and test.
- **No persistence (yet).** State lives in memory for the session; reloading starts fresh. AsyncStorage
  persistence is the obvious next step for a product that "stores the data".
- **Figma "Lifestyle & Goals" section omitted.** It shows data the app doesn't collect (Active,
  Gym-Goer, PCOS & GI Diet…). Rather than fake it, it's left out; it would need a short goals
  questionnaire to populate for real.
- **Search is a quick filter + detail view**, not a full catalogue browser — enough to look a food up.
- **SDK pinned to 54** to match the target Expo Go. Expo Go runs exactly one SDK, so the project SDK
  must match the installed app; bumping later is a one-command `expo install` away.
- **A few provided image URLs were corrected** where they were broken or mismatched; all names,
  categories and tags are used as-is.
- **Remote images** load from Unsplash and are cached on-device by expo-image, so swiping is instant
  after first load; a dark card shows during the initial fetch.

---

## 7. Time breakdown (~7h)

| Area | Time |
| --- | --- |
| Project setup, SDK-correct deps, theme/design tokens | 0.5h |
| Food data + state + taste/nutrition engine | 1.0h |
| Cross-platform `GlassView` + UI primitives | 0.5h |
| Swipe card — 4-direction gesture, fling physics, verdict badges, deck | 1.5h |
| Screens (Start, Taste Profile, FAQ) + navigation + search | 1.5h |
| Figma alignment (near-black palette, layout fidelity) | 0.75h |
| Performance pass + cross-platform polish & device testing | 0.75h |
| README | 0.5h |

---

## 8. AI tool usage

I used an AI coding assistant the way I normally would day-to-day — as a helper to move a bit
faster, not to do the thinking for me. Mainly for:

- speeding up boilerplate and repetitive styling,
- sanity-checking the Expo SDK 54 / Reanimated setup (for example, confirming that
  `babel-preset-expo` already injects the worklets plugin — a common Expo Go gotcha),
- talking through a couple of approaches (the 4-direction gesture math and the cross-platform glass
  fallback) and spotting issues a little quicker.

The architecture and the decisions are my own, every file was written and reviewed by me, and
everything was version-checked against Expo SDK 54. AI helped me work faster — the structure, the
trade-offs and the polish are mine.

---

## ✅ Definition of done

- [x] Runs in Expo Go (iOS + Android), SDK 54
- [x] Start, Swipe and Taste Profile screens implemented
- [x] 4-direction swipe (Yes / No / Super Like / Not Sure) + matching tap buttons
- [x] Progress bar updates after every swipe; undo supported
- [x] Glassmorphism with a graceful Android / scrolling fallback
- [x] Glass bottom navigation + search with food detail
- [x] Generated taste profile + nutrition analysis
- [x] Consistent dark theme driven from one token file
- [x] TypeScript throughout; both platforms bundle clean
