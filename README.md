# Progressive Overload App

A React Native gym tracking application built with Expo that helps users track workouts, exercises, and sets with progressive overload methodology. The app features personal record (PR) detection, an XP/streak gamification system, and historical workout snapshots.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | React Native | 0.81.5 |
| Platform | Expo (New Architecture) | 54 |
| Language | TypeScript (strict) | 5.9 |
| Routing | Expo Router (typed routes) | 6.0 |
| Backend | Supabase (PostgreSQL) | 2.97 |
| Styling | NativeWind / Tailwind CSS | 4.2 / 3.4 |
| State | React Context API | - |
| Icons | @expo/vector-icons (Ionicons) | 15.0 |

Notable experiments enabled in `app.json`:
- `typedRoutes` - compile-time route safety
- `reactCompiler` - React Compiler (automatic memoization)

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Expo Router                    │
│          (file-based, typed routes)              │
├─────────────────────────────────────────────────┤
│                    Screens                       │
│    app/(tabs)/home  ·  app/(tabs)/profile        │
│           app/workouts/[id]                      │
├─────────────────────────────────────────────────┤
│                  Components                      │
│   components/home/*  ·  components/workout/*     │
│              components/ErrorBoundary            │
├─────────────────────────────────────────────────┤
│              Context Providers                   │
│       HomeContext  ·  WorkoutContext              │
│    (useCallback / useMemo memoized values)       │
├─────────────────────────────────────────────────┤
│                Repositories                      │
│   home.repository  ·  workout.repository         │
│         exercise-search.service                  │
├─────────────────────────────────────────────────┤
│              Type System                         │
│  database.types (auto-gen) → entities → mappers  │
├─────────────────────────────────────────────────┤
│            Supabase Client                       │
│    utils/supabase.ts (typed, validated)          │
└─────────────────────────────────────────────────┘
```

### Key Patterns

- **Repository pattern** - All Supabase queries live in `*.repository.ts` files, never in components or contexts directly.
- **Three-layer type system** - Auto-generated `database.types.ts` → convenience aliases in `entities.ts` → domain models in `mappers/*.ts` with mapping functions (`toWorkout`, `toExercise`, `toExerciseSet`).
- **Context with memoization** - Both `HomeContext` and `WorkoutContext` wrap all callbacks in `useCallback` and memoize the context value object with `useMemo` to prevent unnecessary re-renders.
- **Debounce + AbortController** - Exercise search API calls are debounced (300ms) and previous in-flight requests are aborted when new searches start.
- **PanResponder with useRef** - Swipe gesture handler is created once with empty deps; latest callback references are stored in refs to avoid PanResponder recreation.
- **Snapshot-based history** - Daily exercise snapshots are stored in `exercise_daily_snapshot`, enabling users to view past workout data by date. Swipe gestures navigate between snapshot dates.
- **PR detection** - When saving an exercise, the system compares current stats against `exercise_performance_index` to detect new personal records for total volume, best e1RM, and per-weight rep maxima.
- **XP gamification** - Users earn XP for daily logins (streaks), monthly bonuses, and new PRs. An animated popup (`XpGainPopup`) displays XP gains.

## Directory Structure

```
progressive-overload-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout (SafeAreaProvider + ErrorBoundary + Stack)
│   ├── global.css                # Tailwind CSS entry point
│   ├── (tabs)/                   # Bottom tab navigator group
│   │   ├── _layout.tsx           # Tab layout (Home + Profile tabs)
│   │   ├── home.tsx              # Home screen (workouts dashboard)
│   │   └── profile.tsx           # Profile screen (coming soon placeholder)
│   └── workouts/
│       ├── _layout.tsx           # Workouts stack layout (SafeAreaView)
│       └── [id]/
│           ├── _layout.tsx       # Workout ID validation + WorkoutProvider
│           └── index.tsx         # Workout detail screen (exercises, swipe navigation)
│
├── components/
│   ├── index.ts                  # Barrel export for all components
│   ├── ErrorBoundary.tsx         # Root-level error boundary with recovery UI
│   ├── home/
│   │   ├── index.ts              # Barrel export
│   │   ├── WelcomeHeader.tsx     # User greeting with streak/XP display
│   │   ├── AddWorkoutForm.tsx    # Text input + button to create workouts
│   │   ├── WorkoutItem.tsx       # Single workout card with delete action
│   │   └── WorkoutsList.tsx      # FlatList of WorkoutItem components
│   └── workout/
│       ├── index.ts              # Barrel export
│       ├── WorkoutHeader.tsx     # Workout name + back navigation
│       ├── WorkoutDatePicker.tsx  # Horizontal date selector for snapshots
│       ├── AddExerciseButton.tsx  # Button to open exercise creation modal
│       ├── ExerciseItem.tsx       # Expandable exercise card with sets
│       ├── ExercisePerformancePanel.tsx  # Stats panel (volume, e1RM, rep PRs)
│       ├── ExercisesList.tsx      # FlatList of ExerciseItem with pull-to-refresh
│       ├── ExerciseModal.tsx      # Modal for creating/editing exercises
│       ├── ExerciseSearchPanel.tsx # API exercise search with selection
│       ├── SetEditorRow.tsx       # Individual set editor (reps + weight inputs)
│       ├── XpGainPopup.tsx        # Animated XP gain notification
│       └── exercise-stats.ts     # Pure functions for volume/e1RM/rep PR calculation
│
├── contexts/
│   ├── index.ts                  # Barrel export (HomeProvider, WorkoutProvider, hooks)
│   ├── HomeContext.tsx            # Home screen state (user, workouts, navigation)
│   ├── WorkoutContext.tsx         # Workout screen state (exercises, sets, modal, search)
│   ├── home/
│   │   ├── home.types.ts         # HomeContextType, User interfaces
│   │   └── home.repository.ts    # Supabase queries: workouts CRUD, app state, XP
│   └── workout/
│       ├── workout.types.ts      # WorkoutContextType, XpGainEvent interfaces
│       ├── workout.repository.ts # Supabase queries: exercises, sets, snapshots, PRs
│       ├── performance.types.ts  # ExercisePerformanceBadges type + frozen empty default
│       └── exercise-search.service.ts  # RapidAPI exercise search integration
│
├── types/
│   ├── database.types.ts         # Auto-generated Supabase types (npx supabase gen types)
│   ├── entities.ts               # Row/Insert/Update type aliases per table
│   ├── api.types.ts              # ApiExercise interface (external API shape)
│   └── mappers/
│       └── workout.mapper.ts     # Domain types (Workout, Exercise, ExerciseSet, ExerciseSummary)
│
├── utils/
│   ├── supabase.ts               # Typed Supabase client with env validation
│   └── theme.ts                  # COLORS constant (primary, danger)
│
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript config (strict, @/* path alias)
├── tailwind.config.js            # Tailwind/NativeWind configuration
├── babel.config.js               # Babel config (expo preset)
├── metro.config.js               # Metro bundler config (NativeWind)
└── eslint.config.js              # ESLint config (expo preset)
```

## Database Schema

Six tables in Supabase PostgreSQL, auto-generated types in `types/database.types.ts`:

### `workout`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK, auto-increment |
| name | text | Workout name |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Nullable |

### `exercise`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK, auto-increment |
| workout_id | integer | FK → workout.id |
| name | text | Exercise name |
| deleted_at | timestamptz | Soft delete (nullable) |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `excercise_set`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK, auto-increment |
| exercise_id | integer | FK → exercise.id |
| reps | integer | Nullable |
| weight | numeric | Nullable (kg) |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

Note: The table name has a typo (`excercise_set` instead of `exercise_set`) inherited from the database schema.

### `exercise_daily_snapshot`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK, auto-increment |
| workout_id | integer | FK → workout.id |
| exercise_id | integer | FK → exercise.id |
| snapshot_date | date | Local date (YYYY-MM-DD) |
| snapshot_state | jsonb | Serialized exercise + sets state |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `exercise_performance_index`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK, auto-increment |
| workout_id | integer | FK → workout.id |
| exercise_id | integer | FK → exercise.id (unique) |
| total_volume_pr | numeric | All-time best total volume |
| total_volume_pr_date | date | When best volume was achieved |
| best_set_e1rm_pr | numeric | All-time best estimated 1RM |
| best_set_e1rm_pr_date | date | When best e1RM was achieved |
| rep_prs | jsonb | `{ "weight_key": max_reps }` |
| rep_pr_dates | jsonb | `{ "weight_key": "YYYY-MM-DD" }` |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

### `app_state`
| Column | Type | Notes |
|---|---|---|
| id | integer | PK (singleton, always 1) |
| daily_streak | integer | Consecutive login days |
| experience_score | integer | Total XP accumulated |
| last_open_date | date | Last date app was opened (nullable) |
| last_monthly_bonus_period | date | Month of last bonus award (nullable) |
| created_at | timestamptz | Auto-set |
| updated_at | timestamptz | Auto-set |

## Routing

Expo Router file-based routing with typed routes:

| Route | Screen | Context |
|---|---|---|
| `/(tabs)/home` | Home dashboard | `HomeProvider` |
| `/(tabs)/profile` | Profile (placeholder) | None |
| `/workouts/[id]` | Workout detail | `WorkoutProvider` (injected by `[id]/_layout.tsx`) |

The `[id]/_layout.tsx` validates the workout ID exists in the database before rendering the `WorkoutProvider`. Invalid IDs show an error state.

## Environment Variables

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
EXPO_PUBLIC_RAPIDAPI_KEY=your-rapidapi-key
```

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_KEY` | Supabase anonymous/public key |
| `EXPO_PUBLIC_RAPIDAPI_KEY` | RapidAPI key for exercise search API |

The Supabase client validates these at startup and throws if missing.

## Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Start on Android
npm run ios        # Start on iOS
npm run web        # Start on web
npm run lint       # Run ESLint (via expo lint)
npm run types:supabase  # Regenerate Supabase database types
```

## XP System

| Event | XP Awarded |
|---|---|
| Daily login | 100 XP |
| Monthly bonus (per completed month) | 200 XP |
| New personal record | 5 XP per PR |

PR types detected: total volume PR, best set e1RM PR, rep PR per weight bracket.

## Performance Calculations

Located in `components/workout/exercise-stats.ts`:

- **Total Volume**: `sum(weight * reps)` for all valid sets (reps > 0, weight >= 0)
- **Best Set e1RM** (Epley formula): `weight * (1 + reps / 30)` — highest across all sets
- **Rep PR Milestones**: Max reps achieved per unique weight value
