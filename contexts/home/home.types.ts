import { Workout } from "@/types/mappers/workout.mapper";

export interface User {
  username: string;
  gymName: string | null;
  dailyStreak: number;
  experienceScore: number;
}

export interface DashboardContextType {
  user: User;
  trainingDateKeys: string[];
  refreshDashboard: () => Promise<void>;
}

export interface WorkoutsListContextType {
  workoutsList: Workout[];
  refreshWorkoutsList: () => Promise<void>;
  handleSaveNewWorkout: (workoutName: string) => Promise<void>;
  handleDeleteWorkout: (workout: Workout) => Promise<void>;
  navigateToWorkout: (workout: Workout) => void;
}

/**
 * @deprecated Use DashboardContextType and WorkoutsListContextType instead
 */
export interface HomeContextType
  extends DashboardContextType, WorkoutsListContextType {}
