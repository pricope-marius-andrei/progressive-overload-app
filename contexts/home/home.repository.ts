import {
    AppStateInsert,
    GymPlaceInsert,
    WorkoutInsert,
} from "@/types/entities";
import { Workout, toWorkout } from "@/types/mappers/workout.mapper";
import { supabase } from "@/utils/supabase";

const DAILY_LOGIN_XP = 100;
const XP_PER_NEW_PR = 5;
const MONTHLY_BONUS_XP = 200;
const DEFAULT_GYM_RADIUS_METERS = 120;
const MIN_GYM_RADIUS_METERS = 20;
const MAX_GYM_RADIUS_METERS = 1000;
const CONSECUTIVE_CHECKIN_GAP_DAYS = 1;
const KNOWN_GYM_MATCH_SEARCH_RADIUS_METERS = 250;
const KNOWN_GYM_MATCH_DISTANCE_METERS = 180;
let workoutActivitySchemaAvailable: boolean | null = null;

export type DeviceLocation = {
  latitude: number;
  longitude: number;
};

export type AppProgressState = {
  dailyStreak: number;
  experienceScore: number;
  currentGymName: string | null;
};

export type GymLocationSettings = {
  gymName: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  hasGymLocation: boolean;
  lastGymCheckinDate: string | null;
};

export type KnownGymPlace = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  source: "saved";
};

export type SavedGymPlace = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type AppStateRecord = {
  id: number;
  daily_streak: number;
  experience_score: number;
  last_open_date: string | null;
  last_monthly_bonus_period: string | null;
  gym_latitude: number | null;
  gym_longitude: number | null;
  gym_name: string | null;
  gym_radius_m: number;
  last_gym_checkin_date: string | null;
};

type AppStateMutation = Partial<AppStateInsert> & {
  gym_latitude?: number | null;
  gym_longitude?: number | null;
  gym_name?: string | null;
  gym_radius_m?: number;
  last_gym_checkin_date?: string | null;
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

const getDayDiff = (startDateKey: string, endDateKey: string): number => {
  const startDate = parseDateKey(startDateKey);
  const endDate = parseDateKey(endDateKey);

  const startUtc = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const endUtc = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((endUtc - startUtc) / ONE_DAY_MS));
};

const sortDateKeysDescending = (left: string, right: string): number => {
  if (left === right) {
    return 0;
  }

  return left < right ? 1 : -1;
};

async function hasWorkoutActivitySchema(): Promise<boolean> {
  if (workoutActivitySchemaAvailable !== null) {
    return workoutActivitySchemaAvailable;
  }

  const { error } = await supabase
    .from("workout")
    .select("id,activity_date,template_workout_id")
    .limit(1);

  if (!error) {
    workoutActivitySchemaAvailable = true;
    return true;
  }

  const message = error.message.toLowerCase();
  const missingColumnError =
    message.includes("activity_date") ||
    message.includes("template_workout_id") ||
    message.includes("schema cache");

  if (missingColumnError) {
    workoutActivitySchemaAvailable = false;
    return false;
  }

  throw new Error(error.message);
}

const normalizeGymName = (
  gymName: string | null | undefined,
): string | null => {
  if (typeof gymName !== "string") {
    return null;
  }

  const normalizedGymName = gymName.trim();
  return normalizedGymName.length > 0 ? normalizedGymName : null;
};

const canonicalizeGymName = (
  gymName: string | null | undefined,
): string | null => {
  const normalizedGymName = normalizeGymName(gymName);
  if (!normalizedGymName) {
    return null;
  }

  return normalizedGymName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const normalizeGymRadiusMeters = (radiusMeters?: number | null): number => {
  if (!Number.isFinite(radiusMeters)) {
    return DEFAULT_GYM_RADIUS_METERS;
  }

  const rounded = Math.round(Number(radiusMeters));
  return Math.min(
    MAX_GYM_RADIUS_METERS,
    Math.max(MIN_GYM_RADIUS_METERS, rounded),
  );
};

const hasGymLocationConfigured = (appState: {
  gym_latitude: number | null;
  gym_longitude: number | null;
}): boolean =>
  Number.isFinite(appState.gym_latitude) &&
  Number.isFinite(appState.gym_longitude);

const calculateDistanceMeters = (
  from: DeviceLocation,
  to: DeviceLocation,
): number => {
  const EARTH_RADIUS_METERS = 6371000;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitudeRad = toRadians(from.latitude);
  const toLatitudeRad = toRadians(to.latitude);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(fromLatitudeRad) *
      Math.cos(toLatitudeRad) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

const isInsideGymRadius = (
  appState: {
    gym_latitude: number | null;
    gym_longitude: number | null;
    gym_radius_m: number;
  },
  deviceLocation: DeviceLocation | null,
): boolean => {
  if (!deviceLocation || !hasGymLocationConfigured(appState)) {
    return false;
  }

  const gymLocation: DeviceLocation = {
    latitude: appState.gym_latitude as number,
    longitude: appState.gym_longitude as number,
  };
  const distanceMeters = calculateDistanceMeters(deviceLocation, gymLocation);
  return distanceMeters <= normalizeGymRadiusMeters(appState.gym_radius_m);
};

const getNextGymStreak = (
  currentStreak: number,
  lastGymCheckinDate: string | null,
  todayDateKey: string,
): number => {
  if (!lastGymCheckinDate) {
    return 1;
  }

  const dayGap = getDayDiff(lastGymCheckinDate, todayDateKey);
  if (dayGap <= 0) {
    return currentStreak;
  }

  if (dayGap === CONSECUTIVE_CHECKIN_GAP_DAYS) {
    return currentStreak + 1;
  }

  return 1;
};

const toGymLocationSettings = (
  appState: {
    gym_latitude: number | null;
    gym_longitude: number | null;
    gym_name: string | null;
    gym_radius_m: number;
    last_gym_checkin_date: string | null;
  } | null,
): GymLocationSettings => {
  if (!appState) {
    return {
      gymName: null,
      latitude: null,
      longitude: null,
      radiusMeters: DEFAULT_GYM_RADIUS_METERS,
      hasGymLocation: false,
      lastGymCheckinDate: null,
    };
  }

  return {
    gymName: normalizeGymName(appState.gym_name),
    latitude: appState.gym_latitude,
    longitude: appState.gym_longitude,
    radiusMeters: normalizeGymRadiusMeters(appState.gym_radius_m),
    hasGymLocation: hasGymLocationConfigured(appState),
    lastGymCheckinDate: appState.last_gym_checkin_date,
  };
};

async function fetchAppState() {
  const { data, error } = await supabase
    .from("app_state")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as AppStateRecord | null) ?? null;
}

async function ensureAppState(
  overrides: Partial<AppStateMutation> = {},
): Promise<AppStateRecord> {
  const payload: AppStateMutation = {
    daily_streak: 0,
    experience_score: 0,
    last_open_date: null,
    last_monthly_bonus_period: getMonthPeriodKey(),
    gym_latitude: null,
    gym_longitude: null,
    gym_name: null,
    gym_radius_m: DEFAULT_GYM_RADIUS_METERS,
    last_gym_checkin_date: null,
    ...overrides,
  };

  const { data, error } = await supabase
    .from("app_state")
    .insert(payload as AppStateInsert)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AppStateRecord;
}

export async function fetchGymLocationSettings(): Promise<GymLocationSettings> {
  const appState = await fetchAppState();
  return toGymLocationSettings(appState);
}

export async function saveGymLocationSettings(input: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  gymName?: string | null;
}): Promise<GymLocationSettings> {
  const normalizedRadius = normalizeGymRadiusMeters(input.radiusMeters);
  const normalizedGymName = normalizeGymName(input.gymName);
  const nowIso = new Date().toISOString();
  const appState = await fetchAppState();
  const gymNamePatch: AppStateMutation =
    input.gymName === undefined
      ? {}
      : {
          gym_name: normalizedGymName,
        };

  if (!appState) {
    const createPayload: AppStateMutation = {
      gym_latitude: input.latitude,
      gym_longitude: input.longitude,
      ...gymNamePatch,
      gym_radius_m: normalizedRadius,
      updated_at: nowIso,
    };

    const created = await ensureAppState({
      ...createPayload,
    });

    return toGymLocationSettings(created);
  }

  const updatePayload: AppStateMutation = {
    gym_latitude: input.latitude,
    gym_longitude: input.longitude,
    ...gymNamePatch,
    gym_radius_m: normalizedRadius,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from("app_state")
    .update(updatePayload as AppStateInsert)
    .eq("id", appState.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toGymLocationSettings(data as AppStateRecord);
}

const getLatitudeDeltaForRadius = (radiusMeters: number): number =>
  radiusMeters / 111_320;

const getLongitudeDeltaForRadius = (
  radiusMeters: number,
  latitude: number,
): number => {
  const cosLatitude = Math.cos(toRadians(latitude));
  const metersPerLongitudeDegree =
    111_320 * Math.max(0.1, Math.abs(cosLatitude));
  return radiusMeters / metersPerLongitudeDegree;
};

export async function fetchNearbyKnownGyms(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}): Promise<KnownGymPlace[]> {
  const normalizedRadius = Math.max(
    MIN_GYM_RADIUS_METERS,
    Math.min(8000, Math.round(input.radiusMeters ?? 3000)),
  );
  const latitudeDelta = getLatitudeDeltaForRadius(normalizedRadius);
  const longitudeDelta = getLongitudeDeltaForRadius(
    normalizedRadius,
    input.latitude,
  );

  const minLatitude = input.latitude - latitudeDelta;
  const maxLatitude = input.latitude + latitudeDelta;
  const minLongitude = input.longitude - longitudeDelta;
  const maxLongitude = input.longitude + longitudeDelta;

  const { data, error } = await supabase
    .from("gym_place")
    .select("id, name, latitude, longitude")
    .gte("latitude", minLatitude)
    .lte("latitude", maxLatitude)
    .gte("longitude", minLongitude)
    .lte("longitude", maxLongitude)
    .limit(200);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  const gyms = rows
    .map((row) => ({
      id: row.id,
      name: normalizeGymName(row.name) ?? "Unnamed gym",
      latitude: row.latitude,
      longitude: row.longitude,
      distanceMeters: Math.round(
        calculateDistanceMeters(input, {
          latitude: row.latitude,
          longitude: row.longitude,
        }),
      ),
      source: "saved" as const,
    }))
    .filter((gym) => gym.distanceMeters <= normalizedRadius)
    .sort((left, right) => left.distanceMeters - right.distanceMeters)
    .slice(0, 50);

  return gyms;
}

export async function saveKnownGymPlace(input: {
  name: string;
  latitude: number;
  longitude: number;
}): Promise<KnownGymPlace> {
  const normalizedName = normalizeGymName(input.name);
  const canonicalName = canonicalizeGymName(input.name);
  if (!normalizedName) {
    throw new Error("Gym name is required.");
  }

  if (!canonicalName) {
    throw new Error("Gym name is invalid.");
  }

  const existingNearbyGyms = await fetchNearbyKnownGyms({
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMeters: KNOWN_GYM_MATCH_SEARCH_RADIUS_METERS,
  });
  const matchingGym = existingNearbyGyms.find(
    (gym) =>
      canonicalizeGymName(gym.name) === canonicalName &&
      gym.distanceMeters <= KNOWN_GYM_MATCH_DISTANCE_METERS,
  );

  if (matchingGym) {
    // Refresh recency so recently used gyms remain easy to find in My Gyms.
    await supabase
      .from("gym_place")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", matchingGym.id);

    return matchingGym;
  }

  const payload: GymPlaceInsert = {
    name: normalizedName,
    latitude: input.latitude,
    longitude: input.longitude,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("gym_place")
    .insert(payload)
    .select("id, name, latitude, longitude")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: normalizeGymName(data.name) ?? normalizedName,
    latitude: data.latitude,
    longitude: data.longitude,
    distanceMeters: 0,
    source: "saved",
  };
}

export async function fetchMyGyms(): Promise<SavedGymPlace[]> {
  const { data, error } = await supabase
    .from("gym_place")
    .select("id,name,latitude,longitude")
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: normalizeGymName(row.name) ?? "Unnamed gym",
    latitude: row.latitude,
    longitude: row.longitude,
  }));
}

export async function deleteKnownGymPlace(gymId: number): Promise<void> {
  const { error } = await supabase.from("gym_place").delete().eq("id", gymId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function detectCurrentGymName(
  deviceLocation: DeviceLocation | null,
): Promise<string | null> {
  if (!deviceLocation) {
    return null;
  }

  const gymSettings = await fetchGymLocationSettings();
  const nearbyKnownGyms = await fetchNearbyKnownGyms({
    latitude: deviceLocation.latitude,
    longitude: deviceLocation.longitude,
    radiusMeters: gymSettings.radiusMeters,
  });

  return nearbyKnownGyms[0]?.name ?? null;
}

export async function fetchWorkouts(): Promise<Workout[]> {
  const supportsActivitySchema = await hasWorkoutActivitySchema();
  const baseQuery = supabase
    .from("workout")
    .select("*, exercise(id, deleted_at)")
    .is("deleted_at", null);
  const { data, error } = supportsActivitySchema
    ? await baseQuery.is("activity_date", null)
    : await baseQuery;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toWorkout);
}

export async function fetchTodayActivityWorkouts(
  dateKey: string = getTodayDateKey(),
): Promise<Workout[]> {
  const supportsActivitySchema = await hasWorkoutActivitySchema();
  if (!supportsActivitySchema) {
    return [];
  }

  const { data, error } = await supabase
    .from("workout")
    .select("*, exercise(id, deleted_at)")
    .eq("activity_date", dateKey)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(toWorkout);
}

export async function addTemplateWorkoutToTodayActivity(
  templateWorkoutId: number,
  dateKey: string = getTodayDateKey(),
): Promise<Workout> {
  const supportsActivitySchema = await hasWorkoutActivitySchema();
  if (!supportsActivitySchema) {
    throw new Error(
      "Daily activity requires migration: missing workout.activity_date/template_workout_id columns.",
    );
  }

  const { data: existingDailyWorkout } = await supabase
    .from("workout")
    .select("id")
    .eq("template_workout_id", templateWorkoutId)
    .eq("activity_date", dateKey)
    .is("deleted_at", null)
    .maybeSingle();

  if (existingDailyWorkout) {
    const { data, error } = await supabase
      .from("workout")
      .select("*, exercise(id, deleted_at)")
      .eq("id", existingDailyWorkout.id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return toWorkout(data);
  }

  const { data: templateWorkout, error: templateError } = await supabase
    .from("workout")
    .select("id, name")
    .eq("id", templateWorkoutId)
    .is("activity_date", null)
    .is("deleted_at", null)
    .single();

  if (templateError) {
    throw new Error(templateError.message);
  }

  const { data: createdDailyWorkout, error: createDailyWorkoutError } =
    await supabase
      .from("workout")
      .insert({
        name: templateWorkout.name,
        activity_date: dateKey,
        template_workout_id: templateWorkout.id,
      })
      .select("*, exercise(id, deleted_at)")
      .single();

  if (createDailyWorkoutError) {
    throw new Error(createDailyWorkoutError.message);
  }

  const { data: templateExercises, error: templateExercisesError } =
    await supabase
      .from("exercise")
      .select("id, name")
      .eq("workout_id", templateWorkoutId)
      .is("deleted_at", null);

  if (templateExercisesError) {
    throw new Error(templateExercisesError.message);
  }

  for (const templateExercise of templateExercises ?? []) {
    const { data: createdExercise, error: createdExerciseError } =
      await supabase
        .from("exercise")
        .insert({
          workout_id: createdDailyWorkout.id,
          name: templateExercise.name,
        })
        .select("id")
        .single();

    if (createdExerciseError) {
      throw new Error(createdExerciseError.message);
    }

    const { data: templateSets, error: templateSetsError } = await supabase
      .from("excercise_set")
      .select("reps, weight")
      .eq("exercise_id", templateExercise.id);

    if (templateSetsError) {
      throw new Error(templateSetsError.message);
    }

    if ((templateSets ?? []).length === 0) {
      continue;
    }

    const { error: copySetsError } = await supabase
      .from("excercise_set")
      .insert(
        (templateSets ?? []).map((set) => ({
          exercise_id: createdExercise.id,
          reps: set.reps,
          weight: set.weight,
        })),
      );

    if (copySetsError) {
      throw new Error(copySetsError.message);
    }
  }

  return toWorkout(createdDailyWorkout);
}

export async function fetchTrainingDateKeys(): Promise<string[]> {
  const { data: snapshotData, error: snapshotError } = await supabase
    .from("exercise_daily_snapshot")
    .select("snapshot_date")
    .order("snapshot_date", { ascending: false });

  if (snapshotError) {
    throw new Error(snapshotError.message);
  }

  const supportsActivitySchema = await hasWorkoutActivitySchema();
  let activityDates: string[] = [];

  if (supportsActivitySchema) {
    const { data: activityData, error: activityError } = await supabase
      .from("workout")
      .select("activity_date")
      .not("activity_date", "is", null)
      .is("deleted_at", null)
      .order("activity_date", { ascending: false });

    if (activityError) {
      throw new Error(activityError.message);
    }

    activityDates = (activityData ?? [])
      .map((row) => row.activity_date)
      .filter((date): date is string => typeof date === "string");
  }

  const snapshotDates = (snapshotData ?? []).map((row) => row.snapshot_date);

  return [...new Set([...snapshotDates, ...activityDates])].sort(
    sortDateKeysDescending,
  );
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
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("workout")
    .update({ deleted_at: nowIso, updated_at: nowIso })
    .eq("id", workoutId)
    .is("deleted_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchAndUpdateAppProgress(
  deviceLocation: DeviceLocation | null,
): Promise<AppProgressState> {
  const todayDateKey = getTodayDateKey();
  const currentMonthPeriodKey = getMonthPeriodKey();
  const nowIso = new Date().toISOString();
  const currentGymName = await detectCurrentGymName(deviceLocation);

  const appState = await fetchAppState();

  if (!appState) {
    const created = await ensureAppState({
      daily_streak: 0,
      experience_score: DAILY_LOGIN_XP,
      last_open_date: todayDateKey,
      last_monthly_bonus_period: currentMonthPeriodKey,
      updated_at: nowIso,
    });

    return {
      dailyStreak: created.daily_streak,
      experienceScore: created.experience_score,
      currentGymName,
    };
  }

  let nextStreak = appState.daily_streak;
  let nextLastGymCheckinDate = appState.last_gym_checkin_date;

  if (appState.last_gym_checkin_date) {
    const inactivityDays = getDayDiff(
      appState.last_gym_checkin_date,
      todayDateKey,
    );

    if (inactivityDays > CONSECUTIVE_CHECKIN_GAP_DAYS) {
      nextStreak = 0;
    }
  }

  const isAtTrackedGymToday = Boolean(currentGymName);
  if (isAtTrackedGymToday && appState.last_gym_checkin_date !== todayDateKey) {
    nextStreak = getNextGymStreak(
      appState.daily_streak,
      appState.last_gym_checkin_date,
      todayDateKey,
    );
    nextLastGymCheckinDate = todayDateKey;
  }

  if (appState.last_open_date === todayDateKey) {
    if (
      appState.daily_streak !== nextStreak ||
      appState.last_gym_checkin_date !== nextLastGymCheckinDate
    ) {
      const { data: syncedAppState, error: syncError } = await supabase
        .from("app_state")
        .update({
          daily_streak: nextStreak,
          last_gym_checkin_date: nextLastGymCheckinDate,
          gym_name: currentGymName,
          updated_at: nowIso,
        })
        .eq("id", appState.id)
        .select("daily_streak, experience_score")
        .single();

      if (syncError) {
        throw new Error(syncError.message);
      }

      return {
        dailyStreak: syncedAppState.daily_streak,
        experienceScore: syncedAppState.experience_score,
        currentGymName,
      };
    }

    return {
      dailyStreak: appState.daily_streak,
      experienceScore: appState.experience_score,
      currentGymName,
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

  const nextExperienceScore =
    (appState.experience_score ?? 0) + DAILY_LOGIN_XP + monthlyBonusXp;
  const { data: updatedAppState, error: updateError } = await supabase
    .from("app_state")
    .update({
      daily_streak: nextStreak,
      last_gym_checkin_date: nextLastGymCheckinDate,
      gym_name: currentGymName,
      experience_score: nextExperienceScore,
      last_open_date: todayDateKey,
      last_monthly_bonus_period:
        completedMonths > 0
          ? currentMonthPeriodKey
          : appState.last_monthly_bonus_period,
      updated_at: nowIso,
    })
    .eq("id", appState.id)
    .select("daily_streak, experience_score")
    .single();

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    dailyStreak: updatedAppState.daily_streak,
    experienceScore: updatedAppState.experience_score,
    currentGymName,
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
    .eq("id", appState.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return xpToAward;
}
