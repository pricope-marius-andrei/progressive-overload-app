/**
 * Context Barrel Exports - Progressive Overload Gym App
 *
 * Centralized exports for all context providers and hooks
 */

// Home context
export { HomeProvider, useHome } from "./HomeContext";
export type { HomeContextType, User } from "./HomeContext";

// Workout context
export { WorkoutProvider, useWorkout } from "./WorkoutContext";
export type { WorkoutContextType } from "./WorkoutContext";

