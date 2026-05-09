# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                # Start Expo dev server (Metro)
npm run android          # Run on Android device/emulator
npm run ios              # Run on iOS simulator
npm run web              # Run web build
npm run lint             # ESLint via `expo lint` (uses eslint-config-expo flat config)
npm run types:supabase   # Regenerate types/database.types.ts (requires SUPABASE_PROJECT_ID env var)
```

There is no test runner configured — do not assume Jest/Vitest is available.

To regenerate Supabase types in PowerShell: `$env:SUPABASE_PROJECT_ID='your_project_id'; npm run types:supabase`.

## Required environment variables

Place in `.env.local` (validated at startup in `utils/supabase.ts` — missing values produce an auth-config error rather than a silent failure):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_KEY`
- `EXPO_PUBLIC_RAPIDAPI_KEY` (RapidAPI exercise search)

## Architecture

Expo Router (file-based, **typed routes enabled**) on top of React Native 0.81 with the **React Compiler experiment enabled** (`app.json` → `experiments.reactCompiler: true`). Path alias `@/*` maps to repo root. TypeScript is strict.

The layered architecture (top to bottom):

1. **Screens** in `app/` — Expo Router. The root `_layout.tsx` wraps everything in `SafeAreaProvider → AuthProvider → ErrorBoundary → Stack`. Tab group `app/(tabs)/_layout.tsx` gates on `useAuth()` (redirects to `/auth/prerequisite` when unauthenticated) and wraps tabs in `DashboardProvider → WorkoutsListProvider → TodayActivityProvider`. The dynamic route `app/workouts/[id]/_layout.tsx` validates the workout id against the database before mounting `WorkoutProvider`.
2. **Contexts** in `contexts/` — one provider per screen-scope (`DashboardContext`, `WorkoutsListContext`, `TodayActivityContext`, `WorkoutContext`, `AuthContext`). All callbacks are wrapped in `useCallback` and the value object in `useMemo` so the React Compiler's memoization isn't undone by fresh references. **`HomeContext` is deprecated** — new home-screen state goes into the split Dashboard/WorkoutsList/TodayActivity providers. Always import contexts via the `@/contexts` barrel.
3. **Repositories** in `contexts/<feature>/<feature>.repository.ts` — the **only** place Supabase queries are allowed. Components and contexts call repositories; they never call `supabase` directly. Services like `exercise-search.service.ts` and `gym-search.service.ts` wrap external APIs (RapidAPI, etc.) the same way.
4. **Types** in `types/` — three layers, do not skip:
   - `database.types.ts` (auto-generated, don't hand-edit)
   - `entities.ts` (Row/Insert/Update aliases per table)
   - `mappers/*.ts` (domain types like `Workout`, `Exercise`, `ExerciseSet` plus `toWorkout`/`toExercise`/`toExerciseSet` mapping fns). Repository return values must be mapped to domain types before leaving the repository.
5. **Supabase client** in `utils/supabase.ts` — single typed instance with AsyncStorage-backed session persistence and env validation.

### Domain quirks worth knowing

- **Table name typo `excercise_set` is intentional** — it matches the existing schema; do not "fix" it without a migration.
- **Snapshot-based history**: each day's exercise state is stored as a JSON blob in `exercise_daily_snapshot` (date-keyed). Workout detail uses swipe gestures to navigate between dates. The PanResponder is created once with empty deps; current callbacks live in refs to avoid recreating the responder.
- **PR detection** runs in the workout repository when sets are saved: it diffs current stats against `exercise_performance_index` (total volume PR, best-set e1RM PR, per-weight rep PRs stored as `{ "weight_key": max_reps }` JSONB). Pure calculation lives in `components/workout/exercise-stats.ts` (Total Volume = Σ weight·reps; e1RM = Epley `weight·(1 + reps/30)`).
- **XP / streaks** are stored in the `app_state` singleton (id always `1`). Awarded for daily login (100), monthly bonus (200/month completed), and per PR (5). `XpGainPopup` animates on award.
- **Auth model**: Google OAuth via Supabase, scheme `progressiveoverloadapp://auth/callback`. Workout tables currently have **no `user_id`** — auth gates access flow but does not isolate rows per user. Don't assume RLS-style ownership when writing queries.
- **Exercise search** (`exercise-search.service.ts`): debounced 300ms, previous in-flight requests aborted via `AbortController`.

### Styling

NativeWind (Tailwind 3.4 → RN). `app/global.css` is the Tailwind entry, imported once from `app/_layout.tsx`. Use `className` on RN primitives. Theme constants (e.g. `COLORS.primary`, `COLORS.danger`) live in `utils/theme.ts` — prefer them over hardcoded hex.

## Design constraints

These rules apply to every screen and component. They are calibrated to the 2026 mobile design direction (dark-first, accessibility-first, functional micro-interactions, soft depth, performance as design). `app/(tabs)/home.tsx` is the closest reference but is **not yet fully compliant** — call-outs below cite its line numbers as either positive or negative examples.

### Color & dark mode (dark mode is a starting point, not a toggle)

- `app.json` sets `userInterfaceStyle: "automatic"` — this is a contract. Every screen must render correctly in dark mode.
- **Never hardcode hex** in `className` or `style`. The `bg-[#EEF2FF]` / `color="#6366F1"` pairs in `home.tsx:208-209` are violations — replace with `bg-indigo-50 dark:bg-indigo-950` and `COLORS.primary` from `utils/theme.ts`.
- Use Tailwind `dark:` variants on every surface, text, and border class. A screen with no `dark:` modifiers is incomplete.
- Don't simply invert: dark surfaces use `slate-900` / `indigo-950` bases; raise text contrast to `indigo-50`/`white`, not `indigo-200`. Verify ≥ 4.5:1 for body, ≥ 3:1 for large text.
- The indigo scale already in use (`indigo-950 / 700 / 500 / 50`) is the canonical light palette — pair each with a dark counterpart (`indigo-50 / 200 / 300 / 950`).

### Accessibility-first (not a checkbox)

- Every interactive element gets `accessibilityRole` + `accessibilityLabel`. The "+" `Pressable` at `home.tsx:160-169` has neither — fix when touched.
- **Never wrap `<Ionicons>` in `<Text>`** (`home.tsx:166-168`). Icons render themselves; nesting them inside `Text` breaks screen-reader semantics and produces undefined layout. Place icons as direct children of the `Pressable` and add `accessibilityLabel="Add selected template"`.
- Minimum touch target **44×44pt**. The 16px Ionicon inside `p-3` (~24px hit area) is below threshold — add `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` or increase padding.
- Respect Dynamic Type: use Tailwind `text-sm`/`text-base`/etc. (which scale) over fixed `style={{ fontSize: 14 }}`. Don't lock heights on text containers — `h-12` on the Picker wrapper at `home.tsx:138` will clip at large font sizes.
- Provide gesture alternatives: any swipe-only action (e.g. snapshot-date navigation in workout detail) must also be reachable by tap (date picker, prev/next buttons).

### Micro-interactions (functional, not decorative)

- Add **haptics on commits**, not on every tap. `expo-haptics` is already a dependency. Rule of thumb:
  - Mutation success → `Haptics.notificationAsync(Success)` (add template, save sets, sign in).
  - Destructive entry → `Haptics.impactAsync(Medium)` (entering delete mode).
  - Pure navigation → no haptic.
- Pressables must show **visual press feedback**. Use the function-child form: `<Pressable className={({ pressed }) => `... ${pressed ? "opacity-80 scale-[0.98]" : ""}`}>`. None of the Pressables in `home.tsx` do this yet.
- Animate state transitions with `react-native-reanimated` — entrance with `FadeIn`, removal with `FadeOut`/`Layout`. Avoid bouncy springs on confirmation; reserve them for playful wins (PR popup, XP gain — `XpGainPopup` is the right place).
- "A gentle shake says nope, try again": use `withSequence` shake on validation errors instead of a red toast where possible.

### Depth & elevation (soft 3D, used with restraint)

- Cards (`WorkoutItem`, panels, modals) use `rounded-2xl` + a single soft shadow. On RN, prefer NativeWind's `shadow-sm`/`shadow` plus explicit `elevation: 2` for Android parity. Don't stack multiple shadows.
- The flat white dashboard at `home.tsx:101` (`bg-white` with no elevation between sections) reads as a wireframe. Wrap each "section" (Today's Activity, Template selector, Workouts list) in a card with subtle elevation and `gap-4` between cards.
- The thick **dashed border** (`home.tsx:127`) is reserved for **empty/drop-target affordances** ("you can drop something here") — do not use it as a generic container. The current usage is borderline acceptable as a "select something" slot but should not propagate to other screens.

### Hierarchy & minimalism (every element earns its place)

- Section title cascade is fixed:
  1. Eyebrow: `text-xs font-black uppercase tracking-[1px] text-indigo-500`
  2. Title: `text-2xl font-black text-indigo-950`
  3. Body: `text-sm text-indigo-700`
  4. Counter pill: `rounded-full bg-indigo-50 px-3 py-1` + `text-sm font-semibold text-indigo-700`
- Don't add decorative dividers, redundant icons next to labels, or "(optional)" hints. If an element doesn't drive the user toward an action or convey state, delete it.
- One primary CTA per screen at most. Secondary actions use ghost/outline styling.

### Reduce clicks (zero-click defaults)

- Prefer **tap-to-commit** over **select-then-confirm**. The Picker + separate "+" button at `home.tsx:137-170` is the exact friction pattern to avoid for new flows: a single tap on a template chip should add it. Treat the current shape as legacy, not a template.
- Surface predictive defaults: pre-select the most-recently-used gym, the last-used template, today's date — never make the user re-pick what they already picked yesterday.
- Avoid confirmation dialogs for reversible actions; use undo (toast with "Undo") instead.

### Data viz as core UX

- Numeric state (streaks, XP, set counts, PR deltas) ships with a visual companion — pill, bar, sparkline, or calendar cell. Raw numbers in body text are a fallback, not the default.
- The count pill (`home.tsx:120-124`) and `TrainingCalendar` are the right idea; extend the same treatment to per-exercise volume trends and rep PR history (consider compact bar chart in `ExercisePerformancePanel`).
- `expo-symbols` and `react-native-svg` are available — use SVG for any chart, never `<View>` boxes sized by inline style.

### Gesture hints

- Whenever a swipe/long-press is the primary input (workout-detail snapshot navigation, delete-mode entry on `WorkoutItem`), render a **subtle hint** — a chevron, a 4×40 handle bar, a faint shadow on the swipe edge. `subtle hints, not tutorials`.

### Performance as design

- Lists that can grow past ~10 items must be `FlatList` (or `FlashList` if added). The `todaysWorkouts.map(...)` at `home.tsx:180-192` is acceptable while bounded by today's activity but should switch to `FlatList` if the cap is lifted.
- Images go through `expo-image` (already a dependency), not RN's `<Image>` — `expo-image` gives caching, blurhash placeholders, and faster decode.
- Don't create a new `PanResponder`, `Animated.Value`, or large array literal inside render. Memoize with `useRef`/`useMemo`.
- Inline arrow handlers on list items are tolerable under the React Compiler experiment, but extract them with `useCallback` keyed on the row id when the row is heavy (>1 child component, animated, or in a long list).

### Screen authoring checklist

When adding a new screen, verify before merging:

- [ ] Auth gate (`isLoading` spinner → `Redirect` → content) matches the `home.tsx:203-219` shape.
- [ ] Outer wrapper has `dark:` variants on every color class.
- [ ] All `Pressable`s have `accessibilityRole`, `accessibilityLabel`, ≥ 44pt touch target, and a `pressed` style.
- [ ] Mutations call `await action(); await refresh()` and trigger a haptic on success.
- [ ] Lists use `FlatList` if unbounded; bounded `.map()` is okay.
- [ ] Tab-area screens reserve `paddingBottom: 80 + insets.bottom`.
- [ ] No hardcoded hex; colors come from Tailwind tokens or `utils/theme.ts`.
- [ ] No `<Ionicons>` nested inside `<Text>`.
