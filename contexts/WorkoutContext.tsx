/**
 * Workout Context - Progressive Overload Gym App
 *
 * Provides state management for workout screens including exercises,
 * sets, and exercise operations (add, edit, delete)
 */

import {
  ApiExercise,
  Exercise,
  ExerciseSet,
} from "@/types/mappers/workout.mapper";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import { searchExercises } from "./workout/exercise-search.service";
import {
  createExerciseWithSets,
  deleteExerciseWithSets,
  fetchWorkoutExercises,
  SnapshotWriteResult,
  updateExerciseWithSets,
} from "./workout/workout.repository";
import { WorkoutContextType } from "./workout/workout.types";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
  workoutId: string;
}

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({
  children,
  workoutId,
}) => {
  // Main workout state
  const [workoutExercises, setWorkoutExercises] = useState<Exercise[]>([]);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseSets, setNewExerciseSets] = useState<ExerciseSet[]>([]);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiExercise[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [selectedApiExercise, setSelectedApiExercise] =
    useState<ApiExercise | null>(null);

  // Generate unique ID
  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);
  const parsedWorkoutId = Number(workoutId);

  const loadWorkoutExercises = useCallback(async () => {
    if (!Number.isInteger(parsedWorkoutId)) {
      setWorkoutExercises([]);
      return;
    }

    try {
      const exercises = await fetchWorkoutExercises(parsedWorkoutId);
      setWorkoutExercises(exercises);
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error.message);
    }
  }, [parsedWorkoutId]);

  useEffect(() => {
    loadWorkoutExercises();
  }, [loadWorkoutExercises]);

  const handleSearchExercises = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchExercises(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching exercises:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectApiExercise = (apiExercise: ApiExercise | null) => {
    setSelectedApiExercise(apiExercise);
    setNewExerciseName(apiExercise?.name || "");
    setSearchQuery(apiExercise?.name || "");
    setSearchResults([]);
  };

  // Set management
  const addNewSet = () => {
    const newSet: ExerciseSet = {
      id: generateId(),
      reps: 10,
      weight: 50,
    };
    setNewExerciseSets((prev) => [...prev, newSet]);
  };

  const removeSet = (setId: number) => {
    setNewExerciseSets((prev) => prev.filter((set) => set.id !== setId));
  };

  const updateSetReps = (setId: number, reps: number) => {
    setNewExerciseSets((prev) =>
      prev.map((set) => (set.id === setId ? { ...set, reps } : set)),
    );
  };

  const updateSetWeight = (setId: number, weight: number) => {
    setNewExerciseSets((prev) =>
      prev.map((set) => (set.id === setId ? { ...set, weight } : set)),
    );
  };

  // Exercise management
  const startEditingExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsEditMode(true);
    setNewExerciseName(exercise.name);
    setNewExerciseSets([...exercise.sets]);
    setShowCustomEntry(true);
    setIsModalVisible(true);
  };

  const startCreatingExercise = () => {
    resetModalState();
    setIsModalVisible(true);
  };

  const removeExercise = async (exercise: Exercise) => {
    Alert.alert(
      "Remove Exercise",
      `Are you sure you want to remove ${exercise.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExerciseWithSets(exercise.id);
              await loadWorkoutExercises();
            } catch (error) {
              Alert.alert("Error", "Failed to remove exercise");
              console.error("Error removing exercise:", error);
            }
          },
        },
      ],
    );
  };

  const handleAddNewExercise = async () => {
    const trimmedExerciseName = newExerciseName.trim();
    let snapshotWriteResult: SnapshotWriteResult = "skipped";

    if (!trimmedExerciseName) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    if (!Number.isInteger(parsedWorkoutId)) {
      Alert.alert("Error", "Invalid workout id");
      return;
    }

    if (isEditMode && editingExercise) {
      try {
        snapshotWriteResult = await updateExerciseWithSets(
          editingExercise.id,
          trimmedExerciseName,
          newExerciseSets,
        );
      } catch (error) {
        Alert.alert("Error", "Failed to update exercise");
        console.error("Error updating exercise:", error);
        return;
      }
    } else {
      try {
        snapshotWriteResult = await createExerciseWithSets(
          parsedWorkoutId,
          trimmedExerciseName,
          newExerciseSets,
        );
      } catch (error) {
        Alert.alert("Error", "Failed to create exercise");
        console.error("Error creating exercise:", error);
        return;
      }
    }

    const snapshotMessages: Record<SnapshotWriteResult, string> = {
      inserted: "Snapshot inserted for today",
      updated: "Today's snapshot updated",
      skipped: "Snapshot unchanged (no write)",
    };
    const snapshotMessage = snapshotMessages[snapshotWriteResult];

    console.info(`[snapshot] ${snapshotMessage}`);

    if (__DEV__) {
      Alert.alert("Snapshot", snapshotMessage);
    }

    await loadWorkoutExercises();
    resetModalState();
  };

  const cancelExerciseCreation = () => {
    resetModalState();
  };

  const resetModalState = () => {
    setNewExerciseName("");
    setNewExerciseSets([]);
    setEditingExercise(null);
    setIsEditMode(false);
    setIsModalVisible(false);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
    setShowCustomEntry(false);
    setSelectedApiExercise(null);
  };

  const value: WorkoutContextType = {
    workoutId,
    workoutExercises,
    isModalVisible,
    newExerciseName,
    newExerciseSets,
    editingExercise,
    isEditMode,
    searchQuery,
    searchResults,
    isSearching,
    showCustomEntry,
    selectedApiExercise,
    setNewExerciseName,
    setSearchQuery,
    startCreatingExercise,
    startEditingExercise,
    removeExercise,
    handleAddNewExercise,
    cancelExerciseCreation,
    addNewSet,
    removeSet,
    updateSetReps,
    updateSetWeight,
    handleSearchExercises,
    selectApiExercise,
    setShowCustomEntry,
  };

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  );
};

export const useWorkout = (): WorkoutContextType => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
};

export default WorkoutContext;
