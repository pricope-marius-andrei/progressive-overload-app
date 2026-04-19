/**
 * Context Barrel Exports - Progressive Overload Gym App
 *
 * Centralized exports for all context providers and hooks
 */

// Home context (deprecated - use Dashboard and WorkoutsList instead)
export type { HomeContextType, User } from "./home/home.types";
export { HomeProvider, useHome } from "./HomeContext";

// Dashboard context (home screen)
export { DashboardProvider, useDashboard } from "./DashboardContext";
export type { DashboardContextType } from "./home/home.types";

// Workouts List context (workouts tab)
export type { WorkoutsListContextType } from "./home/home.types";
export { useWorkoutsList, WorkoutsListProvider } from "./WorkoutsListContext";

// Workout context (individual workout screen)
export type { WorkoutContextType } from "./workout/workout.types";
export { useWorkout, WorkoutProvider } from "./WorkoutContext";

// Auth context
export type { AuthContextType } from "./auth/auth.types";
export { AuthProvider, useAuth } from "./AuthContext";

