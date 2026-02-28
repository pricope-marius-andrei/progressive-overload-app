/**
 * Context Barrel Exports - Progressive Overload Gym App
 *
 * Centralized exports for all context providers and hooks
 */

// Home context
export type { HomeContextType, User } from "./home/home.types";
export { HomeProvider, useHome } from "./HomeContext";

// Workout context
export type { WorkoutContextType } from "./workout/workout.types";
export { useWorkout, WorkoutProvider } from "./WorkoutContext";

