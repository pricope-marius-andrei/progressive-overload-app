/**
 * Today Activity Context - Progressive Overload Gym App
 *
 * Provides state management for daily activity workouts cloned from templates.
 */

import { Workout } from "@/types/mappers/workout.mapper";
import { Href, useRouter } from "expo-router";
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Alert } from "react-native";
import {
    addTemplateWorkoutToTodayActivity,
    deleteWorkout,
    fetchTodayActivityWorkouts,
} from "./home/home.repository";
import { TodayActivityContextType } from "./home/home.types";

const TodayActivityContext = createContext<
  TodayActivityContextType | undefined
>(undefined);

interface TodayActivityProviderProps {
  children: ReactNode;
}

const getTodayDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const TodayActivityProvider: React.FC<TodayActivityProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const [todaysWorkouts, setTodaysWorkouts] = useState<Workout[]>([]);
  const [selectedActivityDateKey, setSelectedActivityDateKey] =
    useState(getTodayDateKey());

  const loadTodayActivity = useCallback(
    async (dateKey?: string) => {
      try {
        const workouts = await fetchTodayActivityWorkouts(
          dateKey ?? selectedActivityDateKey,
        );
        setTodaysWorkouts(workouts);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error fetching today's workouts:", message);
      }
    },
    [selectedActivityDateKey],
  );

  useEffect(() => {
    loadTodayActivity(selectedActivityDateKey);
  }, [loadTodayActivity, selectedActivityDateKey]);

  const refreshTodayActivity = useCallback(async () => {
    await loadTodayActivity();
  }, [loadTodayActivity]);

  const addTemplateToTodayActivity = useCallback(
    async (templateWorkout: Workout) => {
      try {
        const createdWorkout = await addTemplateWorkoutToTodayActivity(
          templateWorkout.id,
          selectedActivityDateKey,
        );

        setTodaysWorkouts((previous) => {
          const alreadyExists = previous.some(
            (workout) => workout.id === createdWorkout.id,
          );

          if (alreadyExists) {
            return previous;
          }

          return [...previous, createdWorkout];
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error adding template to today's activity:", message);
        Alert.alert(
          "Error",
          "Failed to add this workout to today's activity. Please try again.",
        );
      }
    },
    [selectedActivityDateKey],
  );

  const removeTodayActivityWorkout = useCallback(
    async (workout: Workout) => {
      setTodaysWorkouts((previous) =>
        previous.filter((current) => current.id !== workout.id),
      );

      try {
        await deleteWorkout(workout.id);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error removing today's workout:", message);
        Alert.alert(
          "Error",
          "Failed to remove this workout from today's activity. Please try again.",
        );
        await loadTodayActivity(selectedActivityDateKey);
      }
    },
    [loadTodayActivity, selectedActivityDateKey],
  );

  const navigateToTodayWorkout = useCallback(
    (workout: Workout) => {
      const workoutRoute: Href = {
        pathname: "/workouts/[id]",
        params: { id: String(workout.id) },
      };

      router.push(workoutRoute);
    },
    [router],
  );

  const value: TodayActivityContextType = useMemo(
    () => ({
      todaysWorkouts,
      selectedActivityDateKey,
      setSelectedActivityDateKey,
      refreshTodayActivity,
      addTemplateToTodayActivity,
      removeTodayActivityWorkout,
      navigateToTodayWorkout,
    }),
    [
      todaysWorkouts,
      selectedActivityDateKey,
      setSelectedActivityDateKey,
      refreshTodayActivity,
      addTemplateToTodayActivity,
      removeTodayActivityWorkout,
      navigateToTodayWorkout,
    ],
  );

  return (
    <TodayActivityContext.Provider value={value}>
      {children}
    </TodayActivityContext.Provider>
  );
};

export const useTodayActivity = (): TodayActivityContextType => {
  const context = useContext(TodayActivityContext);
  if (context === undefined) {
    throw new Error(
      "useTodayActivity must be used within a TodayActivityProvider",
    );
  }
  return context;
};

export default TodayActivityContext;
