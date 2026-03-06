/**
 * Home Context - Progressive Overload Gym App
 *
 * Provides state management for the home screen including workouts,
 * user data, and workout operations (add, delete, etc.)
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
    createWorkout,
    deleteWorkout,
    fetchAndUpdateAppProgress,
    fetchWorkouts,
} from "./home/home.repository";
import { HomeContextType, User } from "./home/home.types";

const HomeContext = createContext<HomeContextType | undefined>(undefined);

interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User>({
    username: "Athlete",
    dailyStreak: 0,
    experienceScore: 0,
  });

  const [workoutsList, setWorkoutsList] = useState<Workout[]>([]);

  const loadWorkouts = useCallback(async () => {
    try {
      const workouts = await fetchWorkouts();
      setWorkoutsList(workouts);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error fetching workouts:", message);
    }
  }, []);

  const refreshHomeState = useCallback(async () => {
    try {
      const progress = await fetchAndUpdateAppProgress();
      setUser((prev) => ({
        ...prev,
        dailyStreak: progress.dailyStreak,
        experienceScore: progress.experienceScore,
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error refreshing app progress:", message);
    }

    await loadWorkouts();
  }, [loadWorkouts]);

  useEffect(() => {
    refreshHomeState();
  }, [refreshHomeState]);

  const handleSaveNewWorkout = useCallback(async (newWorkoutName: string) => {
    const trimmedWorkoutName = newWorkoutName.trim();
    if (!trimmedWorkoutName) {
      return;
    }

    try {
      const createdWorkout = await createWorkout(trimmedWorkoutName);
      setWorkoutsList((prev) => [...prev, createdWorkout]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error creating workout:", message);
      Alert.alert("Error", "Failed to create workout. Please try again.");
    }
  }, []);

  const handleDeleteWorkout = useCallback(
    async (workout: Workout) => {
      const { id, name } = workout;

      setWorkoutsList((prev) => prev.filter((item) => item.id !== id));

      try {
        await deleteWorkout(id);
        console.log(`Workout "${name}" deleted successfully.`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error deleting workout:", message);
        Alert.alert("Error", "Failed to delete workout. Please try again.");
        await loadWorkouts();
      }
    },
    [loadWorkouts],
  );

  const navigateToWorkout = useCallback(
    (workout: Workout) => {
      const workoutRoute: Href = {
        pathname: "/workouts/[id]",
        params: { id: String(workout.id) },
      };

      router.push(workoutRoute);
    },
    [router],
  );

  const value: HomeContextType = useMemo(
    () => ({
      refreshHomeState,
      handleDeleteWorkout,
      handleSaveNewWorkout,
      navigateToWorkout,
      user,
      workoutsList,
    }),
    [
      refreshHomeState,
      handleDeleteWorkout,
      handleSaveNewWorkout,
      navigateToWorkout,
      user,
      workoutsList,
    ],
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

export const useHome = (): HomeContextType => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
};

export default HomeContext;
