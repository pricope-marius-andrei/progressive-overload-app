import { ExerciseRow, ExerciseSetRow, WorkoutRow } from "@/types/entities";

type WorkoutRowWithExercises = WorkoutRow & {
  exercise?: { id: number; deleted_at?: string | null }[];
};

export interface Workout {
  id: number;
  name: string;
  exercises: Exercise[];
}

export function toWorkout(workoutRow: WorkoutRowWithExercises): Workout {
  const exerciseCount = (workoutRow.exercise ?? []).filter(
    (exercise) => !exercise.deleted_at,
  ).length;

  return {
    id: workoutRow.id,
    name: workoutRow.name ?? "Unnamed Workout",
    // For list cards we only need count; create lightweight placeholders.
    exercises: Array.from({ length: exerciseCount }, (_, index) => ({
      id: index,
      name: "",
      sets: [],
    })),
  };
}

export interface Exercise {
  id: number;
  name: string;
  sets: ExerciseSet[];
}

export interface ExerciseSummary {
  id: number;
  name: string;
  setCount: number;
}

export function toExercise(exerciseRow: ExerciseRow): Exercise {
  return {
    id: exerciseRow.id,
    name: exerciseRow.name ?? "Unnamed Exercise",
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
    reps: exerciseSetRow.reps ?? 0,
    weight: exerciseSetRow.weight ?? 0.0,
  };
}
