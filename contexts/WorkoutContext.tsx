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
  ExerciseSummary,
} from "@/types/mappers/workout.mapper";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { awardXpForNewPrs } from "./home/home.repository";
import { searchExercises } from "./workout/exercise-search.service";
import {
  EMPTY_EXERCISE_PERFORMANCE_BADGES,
  ExercisePerformanceBadges,
} from "./workout/performance.types";
import {
  createExerciseWithSets,
  deleteExerciseWithSets,
  fetchExercisePerformanceBadges,
  fetchWorkoutExerciseDetails,
  fetchWorkoutExerciseSummaries,
  fetchWorkoutExerciseSummariesByDate,
  fetchWorkoutName,
  fetchWorkoutSnapshotDatesWithExercises,
  getSnapshotDate,
  SnapshotWriteResult,
  updateExerciseWithSets,
} from "./workout/workout.repository";
import { WorkoutContextType } from "./workout/workout.types";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
  workoutId: string;
}

const HISTORY_DAYS_LIMIT = 7;
const SNAPSHOT_WINDOW_DAYS = HISTORY_DAYS_LIMIT + 1;

const countNewPrs = (badges: ExercisePerformanceBadges): number => {
  const repPrCount = Object.values(badges.repPrsByWeight).filter(
    Boolean,
  ).length;
  return Number(badges.totalVolume) + Number(badges.bestSetE1RM) + repPrCount;
};

export const WorkoutProvider: React.FC<WorkoutProviderProps> = ({
  children,
  workoutId,
}) => {
  const todaySnapshotDate = getSnapshotDate();

  // Main workout state
  const [workoutName, setWorkoutName] = useState("Workout");
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseSummary[]>(
    [],
  );
  const [exerciseSummariesByDate, setExerciseSummariesByDate] = useState<
    Record<string, ExerciseSummary[]>
  >({});
  const [exerciseDetailsById, setExerciseDetailsById] = useState<
    Record<number, Exercise>
  >({});
  const [selectableSnapshotDates, setSelectableSnapshotDates] = useState<
    string[]
  >([]);
  const [selectedSnapshotDate, setSelectedSnapshotDateState] =
    useState<string>(todaySnapshotDate);
  const [exercisePerformanceBadgesById, setExercisePerformanceBadgesById] =
    useState<Record<number, ExercisePerformanceBadges>>({});

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
  const [xpGainEvent, setXpGainEvent] = useState<{
    id: number;
    amount: number;
  } | null>(null);

  // Generate unique ID
  const generateId = () => Date.now() + Math.floor(Math.random() * 1000);
  const parsedWorkoutId = Number(workoutId);
  const isHistoryMode = selectedSnapshotDate !== todaySnapshotDate;

  const setSelectedSnapshotDate = useCallback(
    (date: string) => {
      if (!selectableSnapshotDates.includes(date)) {
        return;
      }

      const cachedSummaries = exerciseSummariesByDate[date];
      if (cachedSummaries) {
        setWorkoutExercises(cachedSummaries);
        setExerciseDetailsById({});
        setExercisePerformanceBadgesById({});
      }

      setSelectedSnapshotDateState(date);
    },
    [exerciseSummariesByDate, selectableSnapshotDates],
  );

  const loadWorkoutExercises = useCallback(async () => {
    if (!Number.isInteger(parsedWorkoutId)) {
      setWorkoutExercises([]);
      setExerciseDetailsById({});
      setExercisePerformanceBadgesById({});
      setExerciseSummariesByDate({});
      return;
    }

    try {
      const exercises =
        selectedSnapshotDate === todaySnapshotDate
          ? await fetchWorkoutExerciseSummaries(parsedWorkoutId)
          : await fetchWorkoutExerciseSummariesByDate(
              parsedWorkoutId,
              selectedSnapshotDate,
            );
      setWorkoutExercises(exercises);
      setExerciseSummariesByDate((previous) => ({
        ...previous,
        [selectedSnapshotDate]: exercises,
      }));
      setExerciseDetailsById({});
      setExercisePerformanceBadgesById({});

      const availableDates = await fetchWorkoutSnapshotDatesWithExercises(
        parsedWorkoutId,
        SNAPSHOT_WINDOW_DAYS,
      );
      const datesWithToday = availableDates.includes(todaySnapshotDate)
        ? availableDates
        : [todaySnapshotDate, ...availableDates];
      setSelectableSnapshotDates(datesWithToday);

      if (!datesWithToday.includes(selectedSnapshotDate)) {
        setSelectedSnapshotDateState(todaySnapshotDate);
      }

      if (
        datesWithToday.length === 0 &&
        selectedSnapshotDate !== todaySnapshotDate
      ) {
        setSelectedSnapshotDateState(todaySnapshotDate);
      }
    } catch (error: any) {
      console.error("Error fetching workout exercises:", error.message);
    }
  }, [parsedWorkoutId, selectedSnapshotDate, todaySnapshotDate]);

  const refreshWorkoutState = useCallback(async () => {
    await loadWorkoutExercises();
  }, [loadWorkoutExercises]);

  useEffect(() => {
    loadWorkoutExercises();
  }, [loadWorkoutExercises]);

  useEffect(() => {
    const loadWorkoutName = async () => {
      if (!Number.isInteger(parsedWorkoutId)) {
        setWorkoutName("Workout");
        return;
      }

      try {
        const name = await fetchWorkoutName(parsedWorkoutId);
        setWorkoutName(name);
      } catch (error: any) {
        console.error("Error fetching workout name:", error.message);
        setWorkoutName("Workout");
      }
    };

    loadWorkoutName();
  }, [parsedWorkoutId]);

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
  const startEditingExercise = async (exerciseId: number) => {
    if (isHistoryMode) {
      console.warn("History mode: switch to today to edit exercises.");
      return;
    }

    const exercise = await loadExerciseDetails(exerciseId);

    if (!exercise) {
      console.error("Failed to load exercise details");
      return;
    }

    setEditingExercise(exercise);
    setIsEditMode(true);
    setNewExerciseName(exercise.name);
    setNewExerciseSets([...exercise.sets]);
    setShowCustomEntry(true);
    setIsModalVisible(true);
  };

  const startCreatingExercise = () => {
    if (isHistoryMode) {
      console.warn("History mode: switch to today to add exercises.");
      return;
    }

    resetModalState();
    setIsModalVisible(true);
  };

  const removeExercise = async (exercise: ExerciseSummary) => {
    if (isHistoryMode) {
      console.warn("History mode: switch to today to remove exercises.");
      return;
    }

    try {
      await deleteExerciseWithSets(exercise.id);
      await loadWorkoutExercises();
    } catch (error) {
      console.error("Error removing exercise:", error);
    }
  };

  const handleAddNewExercise = async () => {
    const trimmedExerciseName = newExerciseName.trim();
    let snapshotWriteResult: SnapshotWriteResult = "skipped";
    let newPrCount = 0;

    if (isHistoryMode) {
      console.warn("History mode: switch to today to save exercise changes.");
      return;
    }

    if (!trimmedExerciseName) {
      console.warn("Please enter an exercise name");
      return;
    }

    if (!Number.isInteger(parsedWorkoutId)) {
      console.error("Invalid workout id");
      return;
    }

    if (isEditMode && editingExercise) {
      try {
        const saveResult = await updateExerciseWithSets(
          editingExercise.id,
          trimmedExerciseName,
          newExerciseSets,
        );
        snapshotWriteResult = saveResult.snapshotWriteResult;
        newPrCount = countNewPrs(saveResult.performanceBadges);
      } catch (error) {
        console.error("Error updating exercise:", error);
        return;
      }
    } else {
      try {
        const saveResult = await createExerciseWithSets(
          parsedWorkoutId,
          trimmedExerciseName,
          newExerciseSets,
        );
        snapshotWriteResult = saveResult.snapshotWriteResult;
        newPrCount = countNewPrs(saveResult.performanceBadges);
      } catch (error) {
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

    if (newPrCount > 0) {
      try {
        const awardedXp = await awardXpForNewPrs(newPrCount);
        if (awardedXp > 0) {
          setXpGainEvent({ id: Date.now(), amount: awardedXp });
        }
      } catch (error) {
        console.error("Error awarding PR XP:", error);
      }
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

  const getExercisePerformanceBadges = (
    exerciseId: number,
  ): ExercisePerformanceBadges => {
    return (
      exercisePerformanceBadgesById[exerciseId] ||
      EMPTY_EXERCISE_PERFORMANCE_BADGES
    );
  };

  const getLoadedExerciseDetails = (exerciseId: number): Exercise | null => {
    return exerciseDetailsById[exerciseId] || null;
  };

  const loadExerciseDetails = async (
    exerciseId: number,
  ): Promise<Exercise | null> => {
    const cachedExercise = exerciseDetailsById[exerciseId];
    if (cachedExercise) {
      return cachedExercise;
    }

    if (!Number.isInteger(parsedWorkoutId)) {
      return null;
    }

    try {
      const exercise = await fetchWorkoutExerciseDetails(
        parsedWorkoutId,
        exerciseId,
        selectedSnapshotDate,
      );

      if (!exercise) {
        return null;
      }

      setExerciseDetailsById((previous) => ({
        ...previous,
        [exerciseId]: exercise,
      }));

      try {
        const performanceBadges = await fetchExercisePerformanceBadges(
          parsedWorkoutId,
          [exercise],
          selectedSnapshotDate,
        );
        setExercisePerformanceBadgesById((previous) => ({
          ...previous,
          [exerciseId]:
            performanceBadges[exerciseId] || EMPTY_EXERCISE_PERFORMANCE_BADGES,
        }));
      } catch (performanceError) {
        console.error("Error loading performance badges:", performanceError);
      }

      return exercise;
    } catch (error) {
      console.error("Error loading exercise details:", error);
      return null;
    }
  };

  const value: WorkoutContextType = {
    workoutId,
    workoutName,
    workoutExercises,
    refreshWorkoutState,
    selectedSnapshotDate,
    selectableSnapshotDates,
    getExercisePerformanceBadges,
    loadExerciseDetails,
    getLoadedExerciseDetails,
    isHistoryMode,
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
    xpGainEvent,
    setNewExerciseName,
    setSearchQuery,
    setSelectedSnapshotDate,
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
