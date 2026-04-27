/**
 * WorkoutsList Component - Progressive Overload Gym App
 *
 * Virtualized list of all user workouts with empty state
 */

import { useWorkoutsList } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControlProps, Text, View } from "react-native";
import WorkoutItem from "../home/WorkoutItem";

interface WorkoutsListProps {
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const keyExtractor = (item: Workout) => String(item.id);

const ListEmptyComponent = () => (
  <View className="mt-2 items-center rounded-3xl border border-white/70 bg-white/65 p-8">
    <Text className="mb-2 text-center text-lg font-semibold text-indigo-900">
      No workouts yet
    </Text>
    <Text className="text-center text-indigo-700">
      Create one above to start your first training session.
    </Text>
  </View>
);

const WorkoutsList: React.FC<WorkoutsListProps> = ({ refreshControl }) => {
  const { workoutsList } = useWorkoutsList();
  const [activeDeleteWorkoutId, setActiveDeleteWorkoutId] = useState<
    number | null
  >(null);

  const renderWorkoutItem = useCallback(
    ({ item }: { item: Workout }) => (
      <WorkoutItem
        workout={item}
        isDeleteMode={activeDeleteWorkoutId === item.id}
        hasAnyDeleteModeActive={activeDeleteWorkoutId !== null}
        onEnterDeleteMode={() => setActiveDeleteWorkoutId(item.id)}
        onExitDeleteMode={() => setActiveDeleteWorkoutId(null)}
        subtitle="Template workout"
      />
    ),
    [activeDeleteWorkoutId],
  );

  return (
    <FlatList
      data={workoutsList}
      renderItem={renderWorkoutItem}
      keyExtractor={keyExtractor}
      className="flex-1"
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 12,
      }}
      onScrollBeginDrag={() => {
        if (activeDeleteWorkoutId !== null) {
          setActiveDeleteWorkoutId(null);
        }
      }}
    />
  );
};

export default WorkoutsList;
