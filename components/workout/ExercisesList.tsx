/**
 * ExercisesList Component - Progressive Overload Gym App
 *
 * Virtualized list of exercises with empty state and pull-to-refresh
 */

import { useWorkout } from "@/contexts/WorkoutContext";
import { ExerciseSummary } from "@/types/mappers/workout.mapper";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    ListRenderItemInfo,
    RefreshControl,
    Text,
    View,
} from "react-native";
import ExerciseItem from "./ExerciseItem";

const renderExerciseItem = ({ item }: ListRenderItemInfo<ExerciseSummary>) => (
  <ExerciseItem exercise={item} />
);

const keyExtractor = (item: ExerciseSummary) => String(item.id);

const ExercisesList: React.FC = () => {
  const { workoutExercises, selectedSnapshotDate, refreshWorkoutState } =
    useWorkout();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshWorkoutState();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshWorkoutState]);

  const ListEmptyComponent = useCallback(
    () => (
      <View className="items-center rounded-2xl border border-white/70 bg-white/65 p-8">
        <Text className="mb-1 text-center font-semibold text-indigo-900">
          No exercises yet
        </Text>
        <Text className="text-center text-indigo-700">
          No exercises found for {selectedSnapshotDate}.
        </Text>
      </View>
    ),
    [selectedSnapshotDate],
  );

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-lg font-semibold text-indigo-950">Exercises</Text>
        <View className="rounded-full border border-indigo-100 bg-white/70 px-3 py-1">
          <Text className="text-sm font-semibold text-indigo-700">
            {workoutExercises.length}
          </Text>
        </View>
      </View>
      <Text className="mb-3 text-sm text-indigo-700">
        {workoutExercises.length > 0
          ? "Tap an exercise to edit sets and load progression."
          : `No entries for ${selectedSnapshotDate} yet.`}
      </Text>

      <FlatList
        className="flex-1"
        data={workoutExercises}
        renderItem={renderExerciseItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />
    </View>
  );
};

export default ExercisesList;
