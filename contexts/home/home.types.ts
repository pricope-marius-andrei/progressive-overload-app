import { Workout } from "@/types/mappers/workout.mapper";

export interface User {
  username: string;
  dailyStreak: number;
  experienceScore: number;
}

export interface HomeContextType {
  user: User;
  workoutsList: Workout[];
  refreshHomeState: () => Promise<void>;
  handleSaveNewWorkout: (workoutName: string) => Promise<void>;
  handleDeleteWorkout: (workout: Workout) => Promise<void>;
  navigateToWorkout: (workout: Workout) => void;
}
