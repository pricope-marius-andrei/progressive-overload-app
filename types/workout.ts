/**
 * Workout Types - Progressive Overload Gym App
 *
 * Shared types for workout-related functionality
 */

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
}

export interface ApiExercise {
  exerciseId: string;
  name: string;
  imageUrl: string;
}

export interface WorkoutDetailsProps {
  id: string;
  exercises: Exercise[];
}
