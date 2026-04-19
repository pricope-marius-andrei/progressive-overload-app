/**
 * Workouts List Context - Progressive Overload Gym App
 *
 * Provides state management for the workouts list tab including the list
 * of workouts and operations to create, delete, and navigate to workouts.
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
    fetchWorkouts,
} from "./home/home.repository";
import { WorkoutsListContextType } from "./home/home.types";

const WorkoutsListContext = createContext<WorkoutsListContextType | undefined>(
  undefined,
);

interface WorkoutsListProviderProps {
  children: ReactNode;
}

export const WorkoutsListProvider: React.FC<WorkoutsListProviderProps> = ({
  children,
}) => {
  const router = useRouter();

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

  const refreshWorkoutsList = useCallback(async () => {
    await loadWorkouts();
  }, [loadWorkouts]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

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

  const value: WorkoutsListContextType = useMemo(
    () => ({
      refreshWorkoutsList,
      handleDeleteWorkout,
      handleSaveNewWorkout,
      navigateToWorkout,
      workoutsList,
    }),
    [
      refreshWorkoutsList,
      handleDeleteWorkout,
      handleSaveNewWorkout,
      navigateToWorkout,
      workoutsList,
    ],
  );

  return (
    <WorkoutsListContext.Provider value={value}>
      {children}
    </WorkoutsListContext.Provider>
  );
};

export const useWorkoutsList = (): WorkoutsListContextType => {
  const context = useContext(WorkoutsListContext);
  if (context === undefined) {
    throw new Error(
      "useWorkoutsList must be used within a WorkoutsListProvider",
    );
  }
  return context;
};

export default WorkoutsListContext;
