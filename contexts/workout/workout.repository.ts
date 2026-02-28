import { getExerciseStats } from "@/components/workout/exercise-stats";
import {
    ExerciseDailySnapshotInsert,
    ExerciseInsert,
    ExercisePerformanceIndexInsert,
    ExercisePerformanceIndexUpdate,
    ExerciseSetInsert,
    ExerciseUpdate,
} from "@/types/entities";
import {
    Exercise,
    ExerciseSet,
    ExerciseSummary,
    toExercise,
    toExerciseSet,
} from "@/types/mappers/workout.mapper";
import { supabase } from "@/utils/supabase";
import {
    EMPTY_EXERCISE_PERFORMANCE_BADGES,
    ExercisePerformanceBadges,
} from "./performance.types";

type SnapshotState = {
  name: string;
  sets: {
    reps: number;
    weight: number;
  }[];
};

type SnapshotStateSet = {
  reps?: unknown;
  weight?: unknown;
};

type SnapshotStateLike = {
  name?: unknown;
  sets?: unknown;
};

type PerformanceIndexRowLike = {
  exercise_id: number;
  total_volume_pr: number | null;
  best_set_e1rm_pr: number | null;
  total_volume_pr_date: string | null;
  best_set_e1rm_pr_date: string | null;
  rep_prs: unknown;
  rep_pr_dates: unknown;
};

type ExercisePerformanceIndexState = {
  totalVolumePr: number;
  bestSetE1RMPr: number;
  totalVolumePrDate: string | null;
  bestSetE1RMPrDate: string | null;
  repPrs: Record<string, number>;
  repPrDates: Record<string, string>;
};

export type SnapshotWriteResult = "inserted" | "updated" | "skipped";

export type ExerciseSaveResult = {
  snapshotWriteResult: SnapshotWriteResult;
  performanceBadges: ExercisePerformanceBadges;
};

const FLOAT_COMPARISON_EPSILON = 0.0001;

function toSnapshotDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function parseSnapshotState(rawState: unknown): SnapshotState {
  const snapshotState = (rawState || {}) as SnapshotStateLike;
  const snapshotName =
    typeof snapshotState.name === "string" &&
    snapshotState.name.trim().length > 0
      ? snapshotState.name
      : "Unnamed Exercise";

  const snapshotSets = Array.isArray(snapshotState.sets)
    ? snapshotState.sets
    : [];

  return {
    name: snapshotName,
    sets: snapshotSets.map((set) => {
      const snapshotSet = (set || {}) as SnapshotStateSet;
      const reps = Number(snapshotSet.reps);
      const weight = Number(snapshotSet.weight);

      return {
        reps: Number.isFinite(reps) ? reps : 0,
        weight: Number.isFinite(weight) ? weight : 0,
      };
    }),
  };
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

function numberOrZero(value: unknown): number {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeRepPrMap(rawValue: unknown): Record<string, number> {
  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    return {};
  }

  return Object.entries(rawValue as Record<string, unknown>).reduce<
    Record<string, number>
  >((accumulator, [weightKey, repsValue]) => {
    const reps = Number(repsValue);
    if (Number.isFinite(reps) && reps > 0) {
      accumulator[weightKey] = reps;
    }

    return accumulator;
  }, {});
}

function normalizeRepPrDateMap(rawValue: unknown): Record<string, string> {
  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    return {};
  }

  return Object.entries(rawValue as Record<string, unknown>).reduce<
    Record<string, string>
  >((accumulator, [weightKey, dateValue]) => {
    if (typeof dateValue === "string" && dateValue.length > 0) {
      accumulator[weightKey] = dateValue;
    }

    return accumulator;
  }, {});
}

function toRepPrWeightKey(weight: number): string {
  return String(weight);
}

function parseExercisePerformanceIndexState(
  row: PerformanceIndexRowLike,
): ExercisePerformanceIndexState {
  return {
    totalVolumePr: numberOrZero(row.total_volume_pr),
    bestSetE1RMPr: numberOrZero(row.best_set_e1rm_pr),
    totalVolumePrDate: row.total_volume_pr_date,
    bestSetE1RMPrDate: row.best_set_e1rm_pr_date,
    repPrs: normalizeRepPrMap(row.rep_prs),
    repPrDates: normalizeRepPrDateMap(row.rep_pr_dates),
  };
}

function buildPerformanceBadgesForSnapshot(
  sets: ExerciseSet[],
  performanceState: ExercisePerformanceIndexState | null,
  snapshotDate: string,
): ExercisePerformanceBadges {
  if (!performanceState) {
    return EMPTY_EXERCISE_PERFORMANCE_BADGES;
  }

  const exerciseStats = getExerciseStats(sets);
  const totalVolumeIsPr =
    performanceState.totalVolumePrDate === snapshotDate &&
    exerciseStats.totalVolume >=
      performanceState.totalVolumePr - FLOAT_COMPARISON_EPSILON;
  const bestSetE1RMIsPr =
    performanceState.bestSetE1RMPrDate === snapshotDate &&
    exerciseStats.bestSetE1RM >=
      performanceState.bestSetE1RMPr - FLOAT_COMPARISON_EPSILON;

  const repPrsByWeight = exerciseStats.repPrMilestones.reduce<
    Record<string, boolean>
  >((accumulator, milestone) => {
    const weightKey = toRepPrWeightKey(milestone.weight);
    const repsPrDate = performanceState.repPrDates[weightKey];
    const repsPrValue = performanceState.repPrs[weightKey] ?? 0;

    accumulator[weightKey] =
      repsPrDate === snapshotDate && milestone.maxReps >= repsPrValue;

    return accumulator;
  }, {});

  return {
    totalVolume: totalVolumeIsPr,
    bestSetE1RM: bestSetE1RMIsPr,
    repPrsByWeight,
  };
}

async function fetchExistingPerformanceIndex(
  exerciseId: number,
): Promise<ExercisePerformanceIndexState | null> {
  const { data: row, error } = await supabase
    .from("exercise_performance_index")
    .select(
      "exercise_id,total_volume_pr,best_set_e1rm_pr,total_volume_pr_date,best_set_e1rm_pr_date,rep_prs,rep_pr_dates",
    )
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!row) {
    return null;
  }

  return parseExercisePerformanceIndexState(row as PerformanceIndexRowLike);
}

async function upsertExercisePerformanceIndex(
  workoutId: number,
  exerciseId: number,
  sets: ExerciseSet[],
  snapshotDate: string = toSnapshotDate(),
): Promise<ExercisePerformanceBadges> {
  const exerciseStats = getExerciseStats(sets);
  const existingPerformance = await fetchExistingPerformanceIndex(exerciseId);

  const totalVolumeIsPr =
    !existingPerformance ||
    exerciseStats.totalVolume >
      existingPerformance.totalVolumePr + FLOAT_COMPARISON_EPSILON;
  const bestSetE1RMIsPr =
    !existingPerformance ||
    exerciseStats.bestSetE1RM >
      existingPerformance.bestSetE1RMPr + FLOAT_COMPARISON_EPSILON;

  const mergedRepPrs = existingPerformance
    ? { ...existingPerformance.repPrs }
    : {};
  const mergedRepPrDates = existingPerformance
    ? { ...existingPerformance.repPrDates }
    : {};
  const repPrsByWeight: Record<string, boolean> = {};

  for (const milestone of exerciseStats.repPrMilestones) {
    const weightKey = toRepPrWeightKey(milestone.weight);
    const existingRepPr = mergedRepPrs[weightKey] ?? 0;
    const isNewRepPr =
      !existingPerformance || milestone.maxReps > existingRepPr;

    if (isNewRepPr) {
      mergedRepPrs[weightKey] = milestone.maxReps;
      mergedRepPrDates[weightKey] = snapshotDate;
    }

    repPrsByWeight[weightKey] = isNewRepPr;
  }

  const nextPerformanceState:
    | ExercisePerformanceIndexInsert
    | ExercisePerformanceIndexUpdate = {
    workout_id: workoutId,
    exercise_id: exerciseId,
    total_volume_pr: existingPerformance
      ? Math.max(existingPerformance.totalVolumePr, exerciseStats.totalVolume)
      : exerciseStats.totalVolume,
    best_set_e1rm_pr: existingPerformance
      ? Math.max(existingPerformance.bestSetE1RMPr, exerciseStats.bestSetE1RM)
      : exerciseStats.bestSetE1RM,
    total_volume_pr_date: totalVolumeIsPr
      ? snapshotDate
      : (existingPerformance?.totalVolumePrDate ?? null),
    best_set_e1rm_pr_date: bestSetE1RMIsPr
      ? snapshotDate
      : (existingPerformance?.bestSetE1RMPrDate ?? null),
    rep_prs: mergedRepPrs,
    rep_pr_dates: mergedRepPrDates,
    updated_at: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase
    .from("exercise_performance_index")
    .upsert(nextPerformanceState, { onConflict: "exercise_id" });

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return {
    totalVolume: totalVolumeIsPr,
    bestSetE1RM: bestSetE1RMIsPr,
    repPrsByWeight,
  };
}

export async function fetchExercisePerformanceBadges(
  workoutId: number,
  exercises: Exercise[],
  snapshotDate: string,
): Promise<Record<number, ExercisePerformanceBadges>> {
  if (exercises.length === 0) {
    return {};
  }

  const exerciseIds = exercises.map((exercise) => exercise.id);
  const { data: rows, error } = await supabase
    .from("exercise_performance_index")
    .select(
      "exercise_id,total_volume_pr,best_set_e1rm_pr,total_volume_pr_date,best_set_e1rm_pr_date,rep_prs,rep_pr_dates",
    )
    .eq("workout_id", workoutId)
    .in("exercise_id", exerciseIds);

  if (error) {
    throw new Error(error.message);
  }

  const stateByExerciseId = new Map<number, ExercisePerformanceIndexState>();
  (rows || []).forEach((row) => {
    const parsedState = parseExercisePerformanceIndexState(
      row as PerformanceIndexRowLike,
    );
    stateByExerciseId.set(row.exercise_id, parsedState);
  });

  return exercises.reduce<Record<number, ExercisePerformanceBadges>>(
    (accumulator, exercise) => {
      accumulator[exercise.id] = buildPerformanceBadgesForSnapshot(
        exercise.sets,
        stateByExerciseId.get(exercise.id) || null,
        snapshotDate,
      );
      return accumulator;
    },
    {},
  );
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

export async function fetchWorkoutExerciseSummaries(
  workoutId: number,
): Promise<ExerciseSummary[]> {
  const { data: exerciseRows, error: exercisesError } = await supabase
    .from("exercise")
    .select("id,name")
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
    .select("exercise_id")
    .in("exercise_id", exerciseIds)
    .order("exercise_id", { ascending: true });

  if (setsError) {
    throw new Error(setsError.message);
  }

  const setCountsByExerciseId = new Map<number, number>();

  (exerciseSetRows || []).forEach((setRow) => {
    if (!setRow.exercise_id) {
      return;
    }

    const currentCount = setCountsByExerciseId.get(setRow.exercise_id) || 0;
    setCountsByExerciseId.set(setRow.exercise_id, currentCount + 1);
  });

  return exerciseRows.map((exerciseRow) => ({
    id: exerciseRow.id,
    name: exerciseRow.name || "Unnamed Exercise",
    setCount: setCountsByExerciseId.get(exerciseRow.id) || 0,
  }));
}

export function getSnapshotDate(date: Date = new Date()): string {
  return toSnapshotDate(date);
}

export async function fetchWorkoutSnapshotDatesWithExercises(
  workoutId: number,
  days: number,
): Promise<string[]> {
  const today = new Date();
  const oldestAllowedDate = new Date();
  oldestAllowedDate.setDate(today.getDate() - (days - 1));

  const newestDate = toSnapshotDate(today);
  const oldestDate = toSnapshotDate(oldestAllowedDate);

  const { data: snapshotRows, error: snapshotsError } = await supabase
    .from("exercise_daily_snapshot")
    .select("snapshot_date")
    .eq("workout_id", workoutId)
    .gte("snapshot_date", oldestDate)
    .lte("snapshot_date", newestDate)
    .order("snapshot_date", { ascending: false });

  if (snapshotsError) {
    throw new Error(snapshotsError.message);
  }

  if (!snapshotRows || snapshotRows.length === 0) {
    return [];
  }

  return [
    ...new Set(snapshotRows.map((snapshotRow) => snapshotRow.snapshot_date)),
  ];
}

export async function fetchWorkoutExerciseSummariesByDate(
  workoutId: number,
  snapshotDate: string,
): Promise<ExerciseSummary[]> {
  if (snapshotDate === toSnapshotDate()) {
    return fetchWorkoutExerciseSummaries(workoutId);
  }

  const { data: snapshotRows, error: snapshotsError } = await supabase
    .from("exercise_daily_snapshot")
    .select("exercise_id,snapshot_state")
    .eq("workout_id", workoutId)
    .eq("snapshot_date", snapshotDate)
    .order("exercise_id", { ascending: true });

  if (snapshotsError) {
    throw new Error(snapshotsError.message);
  }

  if (!snapshotRows || snapshotRows.length === 0) {
    return [];
  }

  return snapshotRows.map((snapshotRow) => {
    const snapshotState = parseSnapshotState(snapshotRow.snapshot_state);

    return {
      id: snapshotRow.exercise_id,
      name: snapshotState.name,
      setCount: snapshotState.sets.length,
    };
  });
}

export async function fetchWorkoutExerciseDetails(
  workoutId: number,
  exerciseId: number,
  snapshotDate: string,
): Promise<Exercise | null> {
  if (snapshotDate !== toSnapshotDate()) {
    const { data: snapshotRow, error: snapshotError } = await supabase
      .from("exercise_daily_snapshot")
      .select("exercise_id,snapshot_state")
      .eq("workout_id", workoutId)
      .eq("exercise_id", exerciseId)
      .eq("snapshot_date", snapshotDate)
      .maybeSingle();

    if (snapshotError) {
      throw new Error(snapshotError.message);
    }

    if (!snapshotRow) {
      return null;
    }

    const snapshotState = parseSnapshotState(snapshotRow.snapshot_state);
    return {
      id: snapshotRow.exercise_id,
      name: snapshotState.name,
      sets: snapshotState.sets.map((set, index) => ({
        id: index + 1,
        reps: set.reps,
        weight: set.weight,
      })),
    };
  }

  const { data: exerciseRow, error: exerciseError } = await supabase
    .from("exercise")
    .select()
    .eq("workout_id", workoutId)
    .eq("id", exerciseId)
    .maybeSingle();

  if (exerciseError) {
    throw new Error(exerciseError.message);
  }

  if (!exerciseRow) {
    return null;
  }

  const { data: setRows, error: setRowsError } = await supabase
    .from("excercise_set")
    .select()
    .eq("exercise_id", exerciseId)
    .order("id", { ascending: true });

  if (setRowsError) {
    throw new Error(setRowsError.message);
  }

  return {
    ...toExercise(exerciseRow),
    sets: (setRows || []).map(toExerciseSet),
  };
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

export async function fetchWorkoutName(workoutId: number): Promise<string> {
  const { data, error } = await supabase
    .from("workout")
    .select("name")
    .eq("id", workoutId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.name || "Workout";
}

export async function createExerciseWithSets(
  workoutId: number,
  exerciseName: string,
  sets: ExerciseSet[],
): Promise<ExerciseSaveResult> {
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

  const snapshotWriteResult = await createDailySnapshotIfChanged(
    workoutId,
    insertedExercise.id,
    exerciseName,
    sets,
  );

  const performanceBadges = await upsertExercisePerformanceIndex(
    workoutId,
    insertedExercise.id,
    sets,
  );

  return {
    snapshotWriteResult,
    performanceBadges,
  };
}

export async function updateExerciseWithSets(
  exerciseId: number,
  exerciseName: string,
  sets: ExerciseSet[],
): Promise<ExerciseSaveResult> {
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

  const snapshotWriteResult = await createDailySnapshotIfChanged(
    exerciseRow.workout_id,
    exerciseId,
    exerciseName,
    sets,
  );

  const performanceBadges = await upsertExercisePerformanceIndex(
    exerciseRow.workout_id,
    exerciseId,
    sets,
  );

  return {
    snapshotWriteResult,
    performanceBadges,
  };
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
