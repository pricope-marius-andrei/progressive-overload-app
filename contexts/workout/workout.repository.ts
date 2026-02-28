import {
    ExerciseDailySnapshotInsert,
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

type SnapshotState = {
  name: string;
  sets: {
    reps: number;
    weight: number;
  }[];
};

export type SnapshotWriteResult = "inserted" | "updated" | "skipped";

function toSnapshotDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function toSnapshotState(
  exerciseName: string,
  sets: ExerciseSet[],
): SnapshotState {
  return {
    name: exerciseName,
    sets: sets.map((set) => ({
      reps: set.reps,
      weight: set.weight,
    })),
  };
}

function areSnapshotsEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function createDailySnapshotIfChanged(
  workoutId: number,
  exerciseId: number,
  exerciseName: string,
  sets: ExerciseSet[],
): Promise<SnapshotWriteResult> {
  const today = toSnapshotDate();
  const currentState = toSnapshotState(exerciseName, sets);

  const { data: latestSnapshot, error: latestSnapshotError } = await supabase
    .from("exercise_daily_snapshot")
    .select("id,snapshot_date,snapshot_state")
    .eq("workout_id", workoutId)
    .eq("exercise_id", exerciseId)
    .order("snapshot_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSnapshotError) {
    throw new Error(latestSnapshotError.message);
  }

  if (latestSnapshot?.snapshot_date === today) {
    if (
      latestSnapshot.snapshot_state &&
      areSnapshotsEqual(latestSnapshot.snapshot_state, currentState)
    ) {
      return "skipped";
    }

    const { error: updateSnapshotError } = await supabase
      .from("exercise_daily_snapshot")
      .update({ snapshot_state: currentState })
      .eq("id", latestSnapshot.id);

    if (updateSnapshotError) {
      throw new Error(updateSnapshotError.message);
    }

    return "updated";
  }

  if (
    latestSnapshot?.snapshot_state &&
    areSnapshotsEqual(latestSnapshot.snapshot_state, currentState)
  ) {
    return "skipped";
  }

  const payload: ExerciseDailySnapshotInsert = {
    workout_id: workoutId,
    exercise_id: exerciseId,
    snapshot_date: today,
    snapshot_state: currentState,
  };

  const { error: insertSnapshotError } = await supabase
    .from("exercise_daily_snapshot")
    .insert(payload);

  if (insertSnapshotError) {
    throw new Error(insertSnapshotError.message);
  }

  return "inserted";
}

async function createWorkoutDailySnapshotsIfChanged(
  workoutId: number,
  exercises: Exercise[],
): Promise<void> {
  if (exercises.length === 0) {
    return;
  }

  await Promise.all(
    exercises.map((exercise) =>
      createDailySnapshotIfChanged(
        workoutId,
        exercise.id,
        exercise.name,
        exercise.sets,
      ),
    ),
  );
}

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

  const exercises = exerciseRows.map((exerciseRow) => ({
    ...toExercise(exerciseRow),
    sets: setsByExerciseId.get(exerciseRow.id) || [],
  }));

  try {
    await createWorkoutDailySnapshotsIfChanged(workoutId, exercises);
  } catch (snapshotError) {
    console.error("Error storing daily snapshots:", snapshotError);
  }

  return exercises;
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
): Promise<SnapshotWriteResult> {
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
  return createDailySnapshotIfChanged(
    workoutId,
    insertedExercise.id,
    exerciseName,
    sets,
  );
}

export async function updateExerciseWithSets(
  exerciseId: number,
  exerciseName: string,
  sets: ExerciseSet[],
): Promise<SnapshotWriteResult> {
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

  const { data: exerciseRow, error: exerciseFetchError } = await supabase
    .from("exercise")
    .select("workout_id")
    .eq("id", exerciseId)
    .single();

  if (exerciseFetchError || !exerciseRow) {
    throw new Error(
      exerciseFetchError?.message || "Failed to resolve exercise workout",
    );
  }

  await replaceExerciseSets(exerciseId, sets);
  return createDailySnapshotIfChanged(
    exerciseRow.workout_id,
    exerciseId,
    exerciseName,
    sets,
  );
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
