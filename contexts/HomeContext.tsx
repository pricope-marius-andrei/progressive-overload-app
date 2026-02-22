/**
 * Home Context - Progressive Overload Gym App
 *
 * Provides state management for the home screen including workouts,
 * user data, and workout operations (add, delete, etc.)
 */

import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { Alert } from "react-native";

// Types
export interface User {
  username: string;
  dailyStreak: number;
}

export interface HomeContextType {
  // User data
  user: User;

  // Workouts state
  workoutsList: string[];
  newWorkoutName: string;

  // Actions
  setNewWorkoutName: (name: string) => void;
  handleSaveNewWorkout: () => void;
  handleDeleteWorkout: (workoutIndex: number, workoutName: string) => void;
  navigateToWorkout: (workout: string) => void;
}

// Create the context
const HomeContext = createContext<HomeContextType | undefined>(undefined);

// Provider component
interface HomeProviderProps {
  children: ReactNode;
}

export const HomeProvider: React.FC<HomeProviderProps> = ({ children }) => {
  const router = useRouter();

  // User state (in real app, this would come from user authentication/profile)
  const [user] = useState<User>({
    username: "Marius",
    dailyStreak: 5,
  });

  // Workouts state
  const [workoutsList, setWorkoutsList] = useState<string[]>([]);
  const [newWorkoutName, setNewWorkoutName] = useState("");

  // Actions
  const handleSaveNewWorkout = () => {
    if (newWorkoutName.trim() !== "") {
      setWorkoutsList([...workoutsList, newWorkoutName.trim()]);
      setNewWorkoutName("");
    } else {
      Alert.alert("Error", "Please enter a workout name.");
    }
  };

  const handleDeleteWorkout = (workoutIndex: number, workoutName: string) => {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${workoutName}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setWorkoutsList(
              workoutsList.filter((_, index) => index !== workoutIndex),
            );
          },
        },
      ],
    );
  };

  const navigateToWorkout = (workout: string) => {
    router.push(`/workouts/${workout}` as any);
  };

  const value: HomeContextType = {
    user,
    workoutsList,
    newWorkoutName,
    setNewWorkoutName,
    handleSaveNewWorkout,
    handleDeleteWorkout,
    navigateToWorkout,
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
