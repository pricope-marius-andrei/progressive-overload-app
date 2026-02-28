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
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createWorkout,
  deleteWorkout,
  fetchWorkouts,
} from "./home/home.repository";
import { HomeContextType, User } from "./home/home.types";

// Create the context
const HomeContext = createContext<HomeContextType | undefined>(undefined);

// Provider component
interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const router = useRouter();

  // User state (in real app, this would come from user authentication/profile)
  const user: User = {
    username: "Marius",
    dailyStreak: 5,
  };

  // Workouts state
  const [workoutsList, setWorkoutsList] = useState<Workout[]>([]);

  const loadWorkouts = async () => {
    try {
      const workouts = await fetchWorkouts();
      setWorkoutsList(workouts);
    } catch (error: any) {
      console.error("Error fetching workouts:", error.message);
    }
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  // Actions
  const handleSaveNewWorkout = async (newWorkoutName: string) => {
    const trimmedWorkoutName = newWorkoutName.trim();
    if (!trimmedWorkoutName) {
      return;
    }

    try {
      const createdWorkout = await createWorkout(trimmedWorkoutName);
      setWorkoutsList((prev) => [...prev, createdWorkout]);
    } catch (error: any) {
      console.error("Error creating workout:", error.message);
      return;
    }
  };

  const handleDeleteWorkout = async (workout: Workout) => {
    const { id, name } = workout;

    // Optimistically update UI
    setWorkoutsList((prev) => prev.filter((item) => item.id !== id));

    // Delete from Supabase
    try {
      await deleteWorkout(id);
      console.log(`Workout "${name}" deleted successfully.`);
    } catch (error: any) {
      console.error("Error deleting workout:", error.message);
      await loadWorkouts();
    }
  };

  const navigateToWorkout = (workout: Workout) => {
    const workoutRoute: Href = {
      pathname: "/workouts/[id]",
      params: { id: String(workout.id) },
    };

    router.push(workoutRoute);
  };

  const value: HomeContextType = {
    handleDeleteWorkout,
    handleSaveNewWorkout,
    navigateToWorkout,
    user,
    workoutsList,
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
};

// Hook to use the context
export const useHome = (): HomeContextType => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
};

export default HomeContext;
