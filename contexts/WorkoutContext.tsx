/**
 * Workout Context - Progressive Overload Gym App
 *
 * Provides state management for workout screens including exercises,
 * sets, and exercise operations (add, edit, delete)
 */

import React, { createContext, ReactNode, useContext, useState } from "react";
import { Alert } from "react-native";
import { ApiExercise, Exercise, Set } from "../types/workout";

export interface WorkoutContextType {
  // Workout data
  workoutId: string;
  workoutExercises: Exercise[];

  // Modal state
  isModalVisible: boolean;
  newExerciseName: string;
  newExerciseSets: Set[];
  editingExercise: Exercise | null;
  isEditMode: boolean;

  // Search state
  searchQuery: string;
  searchResults: ApiExercise[];
  isSearching: boolean;
  showCustomEntry: boolean;
  selectedApiExercise: ApiExercise | null;

  // Actions
  setNewExerciseName: (name: string) => void;
  setSearchQuery: (query: string) => void;
  startCreatingExercise: () => void;
  startEditingExercise: (exercise: Exercise) => void;
  handleAddNewExercise: () => void;
  cancelExerciseCreation: () => void;
  addNewSet: () => void;
  removeSet: (setId: string) => void;
  updateSetReps: (setId: string, reps: number) => void;
  updateSetWeight: (setId: string, weight: number) => void;
  handleSearchExercises: (query: string) => void;
  selectApiExercise: (exercise: ApiExercise) => void;
  setShowCustomEntry: (show: boolean) => void;
}

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
  const [newExerciseSets, setNewExerciseSets] = useState<Set[]>([]);
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
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // API Configuration
  const API_BASE_URL =
    "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1";
  const API_HOST = "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com";

  // API Functions
  const searchExercises = async (query: string): Promise<ApiExercise[]> => {
    try {
      // Validate API credentials
      const rapidApiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
      if (!rapidApiKey) {
        console.error(
          "RapidAPI key is missing. Please set EXPO_PUBLIC_RAPIDAPI_KEY environment variable.",
        );
        return [];
      }

      const url = `${API_BASE_URL}/exercises/search?search=${encodeURIComponent(query)}`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": API_HOST,
        },
      };

      const response = await fetch(url, options);
      const result = await response.json();

      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching exercises:", error);
      return [];
    }
  };

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

  const selectApiExercise = (apiExercise: ApiExercise) => {
    setSelectedApiExercise(apiExercise);
    setNewExerciseName(apiExercise.name);
    setSearchQuery(apiExercise.name);
    setSearchResults([]);
  };

  // Set management
  const addNewSet = () => {
    const newSet: Set = {
      id: generateId(),
      reps: 10,
      weight: 50,
    };
    setNewExerciseSets([...newExerciseSets, newSet]);
  };

  const removeSet = (setId: string) => {
    setNewExerciseSets(newExerciseSets.filter((set) => set.id !== setId));
  };

  const updateSetReps = (setId: string, reps: number) => {
    setNewExerciseSets(
      newExerciseSets.map((set) => (set.id === setId ? { ...set, reps } : set)),
    );
  };

  const updateSetWeight = (setId: string, weight: number) => {
    setNewExerciseSets(
      newExerciseSets.map((set) =>
        set.id === setId ? { ...set, weight } : set,
      ),
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

  const handleAddNewExercise = () => {
    if (!newExerciseName.trim()) {
      Alert.alert("Error", "Please enter an exercise name");
      return;
    }

    if (isEditMode && editingExercise) {
      const updatedExercise: Exercise = {
        ...editingExercise,
        name: newExerciseName.trim(),
        sets: newExerciseSets,
      };

      setWorkoutExercises(
        workoutExercises.map((exercise) =>
          exercise.id === editingExercise.id ? updatedExercise : exercise,
        ),
      );
    } else {
      const newExercise: Exercise = {
        id: generateId(),
        name: newExerciseName.trim(),
        sets: newExerciseSets,
      };

      setWorkoutExercises([...workoutExercises, newExercise]);
    }

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
