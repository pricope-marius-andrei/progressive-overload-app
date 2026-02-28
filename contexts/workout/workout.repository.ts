import {
    ExerciseInsert,
    ExerciseSetInsert,
    ExerciseUpdate,
} from "@/types/entities";
import {
    Exercise,
    ExerciseSet,
    toExercise,
    toExerciseSet,
} from "@/types/mappers/workout.mapper";
import { supabase } from "@/utils/supabase";

async function replaceExerciseSets(
  exerciseId: number,
  sets: ExerciseSet[],
): Promise<void> {
  const { error: deleteSetsError } = await supabase
    .from("excercise_set")
    .delete()
    .eq("exercise_id", exerciseId);

  if (deleteSetsError) {
    throw new Error(deleteSetsError.message);
  }

  if (sets.length === 0) {
    return;
  }

  const insertSetsPayload: ExerciseSetInsert[] = sets.map((set) => ({
    exercise_id: exerciseId,
    reps: set.reps,
    weight: set.weight,
  }));

  const { error: insertSetsError } = await supabase
    .from("excercise_set")
    .insert(insertSetsPayload);

  if (insertSetsError) {
    throw new Error(insertSetsError.message);
  }
}

export async function fetchWorkoutExercises(
  workoutId: number,
): Promise<Exercise[]> {
  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("exercise")
    .select()
    .eq("workout_id", workoutId)
    .order("id", { ascending: true });

  if (exercisesError) {
    throw new Error(exercisesError.message);
  }

  if (!exerciseRows || exerciseRows.length === 0) {
    return [];
  }

  const exerciseIds = exerciseRows.map((exercise) => exercise.id);

  const { data: exerciseSetRows, error: setsError } = await supabase
    .from("excercise_set")
    .select()
    .in("exercise_id", exerciseIds)
    .order("id", { ascending: true });

  if (setsError) {
    throw new Error(setsError.message);
  }

  const setsByExerciseId = new Map<number, ExerciseSet[]>();

  (exerciseSetRows || []).forEach((setRow) => {
    if (!setRow.exercise_id) {
      return;
    }

    const currentSets = setsByExerciseId.get(setRow.exercise_id) || [];
    setsByExerciseId.set(setRow.exercise_id, [
      ...currentSets,
      toExerciseSet(setRow),
    ]);
  });

  return exerciseRows.map((exerciseRow) => ({
    ...toExercise(exerciseRow),
    sets: setsByExerciseId.get(exerciseRow.id) || [],
  }));
}

export async function workoutExists(workoutId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from("workout")
    .select("id")
    .eq("id", workoutId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}

export async function createExerciseWithSets(
  workoutId: number,
  exerciseName: string,
  sets: ExerciseSet[],
): Promise<void> {
  const insertPayload: ExerciseInsert = {
    name: exerciseName,
    workout_id: workoutId,
  };

  const { data: insertedExercise, error: insertExerciseError } = await supabase
    .from("exercise")
    .insert(insertPayload)
    .select()
    .single();

  if (insertExerciseError || !insertedExercise) {
    throw new Error(
      insertExerciseError?.message || "Failed to create exercise",
    );
  }

  await replaceExerciseSets(insertedExercise.id, sets);
}

export async function updateExerciseWithSets(
  exerciseId: number,
  exerciseName: string,
  sets: ExerciseSet[],
): Promise<void> {
  const updatePayload: ExerciseUpdate = {
    name: exerciseName,
  };

  const { error: updateExerciseError } = await supabase
    .from("exercise")
    .update(updatePayload)
    .eq("id", exerciseId);

  if (updateExerciseError) {
    throw new Error(updateExerciseError.message);
  }

  await replaceExerciseSets(exerciseId, sets);
}

export async function deleteExerciseWithSets(
  exerciseId: number,
): Promise<void> {
  const { error: deleteSetsError } = await supabase
    .from("excercise_set")
    .delete()
    .eq("exercise_id", exerciseId);

  if (deleteSetsError) {
    throw new Error(deleteSetsError.message);
  }

  const { error: deleteExerciseError } = await supabase
    .from("exercise")
    .delete()
    .eq("id", exerciseId);

  if (deleteExerciseError) {
    throw new Error(deleteExerciseError.message);
  }
}
