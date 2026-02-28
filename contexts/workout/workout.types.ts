import {
    ApiExercise,
    Exercise,
    ExerciseSet,
} from "@/types/mappers/workout.mapper";

export interface WorkoutContextType {
  workoutId: string;
  workoutName: string;
  workoutExercises: Exercise[];
  selectedSnapshotDate: string;
  selectableSnapshotDates: string[];
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
  setNewExerciseName: (name: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSnapshotDate: (date: string) => void;
  startCreatingExercise: () => void;
  startEditingExercise: (exercise: Exercise) => void;
  removeExercise: (exercise: Exercise) => Promise<void>;
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
