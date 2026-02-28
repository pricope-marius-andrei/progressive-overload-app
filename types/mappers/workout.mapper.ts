import { ExerciseRow, ExerciseSetRow, WorkoutRow } from "../entities";

export interface ApiExercise {
  exerciseId: string;
  name: string;
  imageUrl: string;
}

export interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}

export function toWorkout(workoutRow: WorkoutRow): Workout {
  return {
    id: workoutRow.id,
    name: workoutRow.name || "Unnamed Workout",
    exercises: [], // Placeholder, as exercises would need to be fetched separately
  };
}

export interface Exercise {
  id: number;
  name: string;
  sets: ExerciseSet[];
}

export function toExercise(exerciseRow: ExerciseRow): Exercise {
  return {
    id: exerciseRow.id,
    name: exerciseRow.name || "Unnamed Exercise",
    sets: [], // Placeholder, as sets would need to be fetched separately
  };
}

export interface ExerciseSet {
  id: number;
  reps: number;
  weight: number;
}

export function toExerciseSet(exerciseSetRow: ExerciseSetRow): ExerciseSet {
  return {
    id: exerciseSetRow.id,
    reps: exerciseSetRow.reps || 0,
    weight: exerciseSetRow.weight || 0,
  };
}
