/**
 * Workout Context - Progressive Overload Gym App
 *
 * Provides state management for workout screens including exercises,
 * sets, and exercise operations (add, edit, delete)
 */

import { ApiExercise } from "@/types/api.types";
import {
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
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
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
import { WorkoutContextType, XpGainEvent } from "./workout/workout.types";

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

interface WorkoutProviderProps {
  children: ReactNode;
  workoutId: string;
}

const HISTORY_DAYS_LIMIT = 7;
const SNAPSHOT_WINDOW_DAYS = HISTORY_DAYS_LIMIT + 1;
const SEARCH_DEBOUNCE_MS = 300;

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
  const [xpGainEvent, setXpGainEvent] = useState<XpGainEvent | null>(null);

  // Refs for debounce/abort
  const searchDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  const generateId = useCallback(
    () => Date.now() + Math.floor(Math.random() * 1000),
    [],
  );
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error fetching workout exercises:", message);
    }
  }, [parsedWorkoutId, selectedSnapshotDate, todaySnapshotDate]);

  const refreshWorkoutState = useCallback(async () => {
    await loadWorkoutExercises();
  }, [loadWorkoutExercises]);

  useEffect(() => {
    loadWorkoutExercises();
  }, [loadWorkoutExercises]);

  useEffect(() => {
    const loadWorkoutNameAsync = async () => {
      if (!Number.isInteger(parsedWorkoutId)) {
        setWorkoutName("Workout");
        return;
      }

      try {
        const name = await fetchWorkoutName(parsedWorkoutId);
        setWorkoutName(name);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error fetching workout name:", message);
        setWorkoutName("Workout");
      }
    };

    loadWorkoutNameAsync();
  }, [parsedWorkoutId]);

  const handleSearchExercises = useCallback((query: string) => {
    // Cancel any pending debounce
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
      searchDebounceTimerRef.current = null;
    }

    // Abort any in-flight request
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
      searchAbortControllerRef.current = null;
    }

    if (query.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchDebounceTimerRef.current = setTimeout(async () => {
      const abortController = new AbortController();
      searchAbortControllerRef.current = abortController;

      try {
        const results = await searchExercises(query, abortController.signal);
        if (!abortController.signal.aborted) {
          setSearchResults(results);
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Error searching exercises:", error);
        setSearchResults([]);
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);
  }, []);

  // Cleanup debounce timer and abort controller on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  const selectApiExercise = useCallback((apiExercise: ApiExercise | null) => {
    setSelectedApiExercise(apiExercise);
    setNewExerciseName(apiExercise?.name ?? "");
    setSearchQuery(apiExercise?.name ?? "");
    setSearchResults([]);
  }, []);

  const addNewSet = useCallback(() => {
    const newSet: ExerciseSet = {
      id: generateId(),
      reps: 0,
      weight: 0.0,
    };
    setNewExerciseSets((prev) => [...prev, newSet]);
  }, [generateId]);

  const removeSet = useCallback((setId: number) => {
    setNewExerciseSets((prev) => prev.filter((set) => set.id !== setId));
  }, []);

  const updateSetReps = useCallback((setId: number, reps: number) => {
    setNewExerciseSets((prev) =>
      prev.map((set) => (set.id === setId ? { ...set, reps } : set)),
    );
  }, []);

  const updateSetWeight = useCallback((setId: number, weight: number) => {
    setNewExerciseSets((prev) =>
      prev.map((set) => (set.id === setId ? { ...set, weight } : set)),
    );
  }, []);

  const resetModalState = useCallback(() => {
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
  }, []);

  const getExercisePerformanceBadges = useCallback(
    (exerciseId: number): ExercisePerformanceBadges => {
      return (
        exercisePerformanceBadgesById[exerciseId] ??
        EMPTY_EXERCISE_PERFORMANCE_BADGES
      );
    },
    [exercisePerformanceBadgesById],
  );

  const getLoadedExerciseDetails = useCallback(
    (exerciseId: number): Exercise | null => {
      return exerciseDetailsById[exerciseId] ?? null;
    },
    [exerciseDetailsById],
  );

  const loadExerciseDetails = useCallback(
    async (exerciseId: number): Promise<Exercise | null> => {
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
              performanceBadges[exerciseId] ??
              EMPTY_EXERCISE_PERFORMANCE_BADGES,
          }));
        } catch (performanceError: unknown) {
          console.error("Error loading performance badges:", performanceError);
        }

        return exercise;
      } catch (error: unknown) {
        console.error("Error loading exercise details:", error);
        return null;
      }
    },
    [exerciseDetailsById, parsedWorkoutId, selectedSnapshotDate],
  );

  const startEditingExercise = useCallback(
    async (exerciseId: number) => {
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
    },
    [isHistoryMode, loadExerciseDetails],
  );

  const startCreatingExercise = useCallback(() => {
    if (isHistoryMode) {
      console.warn("History mode: switch to today to add exercises.");
      return;
    }

    resetModalState();
    setIsModalVisible(true);
  }, [isHistoryMode, resetModalState]);

  const removeExercise = useCallback(
    async (exercise: ExerciseSummary) => {
      if (isHistoryMode) {
        console.warn("History mode: switch to today to remove exercises.");
        return;
      }

      try {
        await deleteExerciseWithSets(exercise.id);
        await loadWorkoutExercises();
      } catch (error: unknown) {
        console.error("Error removing exercise:", error);
        Alert.alert("Error", "Failed to remove exercise. Please try again.");
      }
    },
    [isHistoryMode, loadWorkoutExercises],
  );

  const handleAddNewExercise = useCallback(async () => {
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
      } catch (error: unknown) {
        console.error("Error updating exercise:", error);
        Alert.alert("Error", "Failed to update exercise. Please try again.");
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
      } catch (error: unknown) {
        console.error("Error creating exercise:", error);
        Alert.alert("Error", "Failed to create exercise. Please try again.");
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
      } catch (error: unknown) {
        console.error("Error awarding PR XP:", error);
      }
    }

    await loadWorkoutExercises();
    resetModalState();
  }, [
    newExerciseName,
    isHistoryMode,
    parsedWorkoutId,
    isEditMode,
    editingExercise,
    newExerciseSets,
    loadWorkoutExercises,
    resetModalState,
  ]);

  const cancelExerciseCreation = useCallback(() => {
    resetModalState();
  }, [resetModalState]);

  const value: WorkoutContextType = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

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
