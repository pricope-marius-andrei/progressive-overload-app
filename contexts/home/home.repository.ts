import { AppStateInsert, WorkoutInsert } from "@/types/entities";
import { Workout, toWorkout } from "@/types/mappers/workout.mapper";
import { supabase } from "@/utils/supabase";

const APP_STATE_SINGLETON_ID = 1;

const getTodayDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase.from("workout").select();

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map(toWorkout);
}

export async function createWorkout(workoutName: string): Promise<Workout> {
  const payload: WorkoutInsert = {
    name: workoutName,
  };

  const { data, error } = await supabase
    .from("workout")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toWorkout(data);
}

export async function deleteWorkout(workoutId: number): Promise<void> {
  const { error } = await supabase.from("workout").delete().eq("id", workoutId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchAndUpdateDailyStreak(): Promise<number> {
  const todayDateKey = getTodayDateKey();

  const { data: appState, error: fetchError } = await supabase
    .from("app_state")
    .select("id, daily_streak, last_open_date")
    .eq("id", APP_STATE_SINGLETON_ID)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!appState) {
    const payload: AppStateInsert = {
      id: APP_STATE_SINGLETON_ID,
      daily_streak: 1,
      last_open_date: todayDateKey,
    };

    const { data: createdAppState, error: createError } = await supabase
      .from("app_state")
      .insert(payload)
      .select("daily_streak")
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    return createdAppState.daily_streak;
  }

  if (appState.last_open_date === todayDateKey) {
    return appState.daily_streak;
  }

  const nextStreak = appState.daily_streak + 1;
  const { data: updatedAppState, error: updateError } = await supabase
    .from("app_state")
    .update({
      daily_streak: nextStreak,
      last_open_date: todayDateKey,
      updated_at: new Date().toISOString(),
    })
    .eq("id", APP_STATE_SINGLETON_ID)
    .select("daily_streak")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return updatedAppState.daily_streak;
}
