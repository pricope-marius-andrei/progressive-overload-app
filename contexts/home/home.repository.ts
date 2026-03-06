import { AppStateInsert, WorkoutInsert } from "@/types/entities";
import { Workout, toWorkout } from "@/types/mappers/workout.mapper";
import { supabase } from "@/utils/supabase";

const APP_STATE_SINGLETON_ID = 1;
const DAILY_LOGIN_XP = 100;
const XP_PER_NEW_PR = 5;
const MONTHLY_BONUS_XP = 200;

export type AppProgressState = {
  dailyStreak: number;
  experienceScore: number;
};

const getTodayDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getMonthPeriodKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
};

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const getMonthDiff = (startDateKey: string, endDateKey: string): number => {
  const startDate = parseDateKey(startDateKey);
  const endDate = parseDateKey(endDateKey);

  const startMonthIndex = startDate.getFullYear() * 12 + startDate.getMonth();
  const endMonthIndex = endDate.getFullYear() * 12 + endDate.getMonth();

  return Math.max(0, endMonthIndex - startMonthIndex);
};

async function fetchAppState() {
  const { data, error } = await supabase
    .from("app_state")
    .select(
      "id, daily_streak, experience_score, last_open_date, last_monthly_bonus_period",
    )
    .eq("id", APP_STATE_SINGLETON_ID)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function ensureAppState(
  overrides: Partial<AppStateInsert> = {},
): Promise<{ daily_streak: number; experience_score: number }> {
  const payload: AppStateInsert = {
    id: APP_STATE_SINGLETON_ID,
    daily_streak: 0,
    experience_score: 0,
    last_open_date: null,
    last_monthly_bonus_period: getMonthPeriodKey(),
    ...overrides,
  };

  const { data, error } = await supabase
    .from("app_state")
    .insert(payload)
    .select("daily_streak, experience_score")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data, error } = await supabase.from("workout").select();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toWorkout);
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

export async function fetchAndUpdateAppProgress(): Promise<AppProgressState> {
  const todayDateKey = getTodayDateKey();
  const currentMonthPeriodKey = getMonthPeriodKey();

  const appState = await fetchAppState();

  if (!appState) {
    const created = await ensureAppState({
      daily_streak: 1,
      experience_score: DAILY_LOGIN_XP,
      last_open_date: todayDateKey,
      last_monthly_bonus_period: currentMonthPeriodKey,
    });

    return {
      dailyStreak: created.daily_streak,
      experienceScore: created.experience_score,
    };
  }

  if (appState.last_open_date === todayDateKey) {
    return {
      dailyStreak: appState.daily_streak,
      experienceScore: appState.experience_score,
    };
  }

  const previousBonusPeriodKey =
    appState.last_monthly_bonus_period ??
    getMonthPeriodKey(
      appState.last_open_date
        ? parseDateKey(appState.last_open_date)
        : new Date(),
    );
  const completedMonths = getMonthDiff(
    previousBonusPeriodKey,
    currentMonthPeriodKey,
  );
  const monthlyBonusXp = completedMonths * MONTHLY_BONUS_XP;

  const nextStreak = appState.daily_streak + 1;
  const nextExperienceScore =
    (appState.experience_score ?? 0) + DAILY_LOGIN_XP + monthlyBonusXp;
  const { data: updatedAppState, error: updateError } = await supabase
    .from("app_state")
    .update({
      daily_streak: nextStreak,
      experience_score: nextExperienceScore,
      last_open_date: todayDateKey,
      last_monthly_bonus_period:
        completedMonths > 0
          ? currentMonthPeriodKey
          : appState.last_monthly_bonus_period,
      updated_at: new Date().toISOString(),
    })
    .eq("id", APP_STATE_SINGLETON_ID)
    .select("daily_streak, experience_score")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    dailyStreak: updatedAppState.daily_streak,
    experienceScore: updatedAppState.experience_score,
  };
}

export async function awardXpForNewPrs(newPrCount: number): Promise<number> {
  const normalizedPrCount = Math.max(0, Math.floor(newPrCount));
  if (normalizedPrCount === 0) {
    return 0;
  }

  const xpToAward = normalizedPrCount * XP_PER_NEW_PR;
  const nowIsoString = new Date().toISOString();

  const appState = await fetchAppState();

  if (!appState) {
    await ensureAppState({
      experience_score: xpToAward,
      updated_at: nowIsoString,
    });

    return xpToAward;
  }

  const nextExperienceScore = (appState.experience_score ?? 0) + xpToAward;
  const { error: updateError } = await supabase
    .from("app_state")
    .update({
      experience_score: nextExperienceScore,
      updated_at: nowIsoString,
    })
    .eq("id", APP_STATE_SINGLETON_ID);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return xpToAward;
}
