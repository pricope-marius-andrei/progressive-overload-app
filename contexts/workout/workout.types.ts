import {
    ApiExercise,
    Exercise,
    ExerciseSet,
    ExerciseSummary,
} from "@/types/mappers/workout.mapper";
import { ExercisePerformanceBadges } from "./performance.types";

export interface XpGainEvent {
  id: number;
  amount: number;
}

export interface WorkoutContextType {
  workoutId: string;
  workoutName: string;
  workoutExercises: ExerciseSummary[];
  refreshWorkoutState: () => Promise<void>;
  selectedSnapshotDate: string;
  selectableSnapshotDates: string[];
  getExercisePerformanceBadges: (
    exerciseId: number,
  ) => ExercisePerformanceBadges;
  loadExerciseDetails: (exerciseId: number) => Promise<Exercise | null>;
  getLoadedExerciseDetails: (exerciseId: number) => Exercise | null;
  isHistoryMode: boolean;
  isModalVisible: boolean;
  newExerciseName: string;
  newExerciseSets: ExerciseSet[];
  editingExercise: Exercise | null;
  isEditMode: boolean;
  searchQuery: string;
  searchResults: ApiExercise[];
  isSearching: boolean;
  showCustomEntry: boolean;
  selectedApiExercise: ApiExercise | null;
  xpGainEvent: XpGainEvent | null;
  setNewExerciseName: (name: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSnapshotDate: (date: string) => void;
  startCreatingExercise: () => void;
  startEditingExercise: (exerciseId: number) => Promise<void>;
  removeExercise: (exercise: ExerciseSummary) => Promise<void>;
  handleAddNewExercise: () => Promise<void>;
  cancelExerciseCreation: () => void;
  addNewSet: () => void;
  removeSet: (setId: number) => void;
  updateSetReps: (setId: number, reps: number) => void;
  updateSetWeight: (setId: number, weight: number) => void;
  handleSearchExercises: (query: string) => Promise<void>;
  selectApiExercise: (exercise: ApiExercise | null) => void;
  setShowCustomEntry: (show: boolean) => void;
}
