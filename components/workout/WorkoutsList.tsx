/**
 * WorkoutsList Component - Progressive Overload Gym App
 *
 * Virtualized list of all user workouts with empty state
 */

import { useWorkoutsList } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import React from "react";
import {
    FlatList,
    ListRenderItemInfo,
    RefreshControlProps,
    Text,
    View,
} from "react-native";
import WorkoutItem from "../home/WorkoutItem";

interface WorkoutsListProps {
  ListHeaderComponent?: React.ComponentType | React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  title?: string;
}

const renderWorkoutItem = ({ item }: ListRenderItemInfo<Workout>) => (
  <WorkoutItem workout={item} />
);

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

const WorkoutsList: React.FC<WorkoutsListProps> = ({
  ListHeaderComponent,
  refreshControl,
  title = "Workouts",
}) => {
  const { workoutsList } = useWorkoutsList();

  return (
    <FlatList
      data={workoutsList}
      renderItem={renderWorkoutItem}
      keyExtractor={keyExtractor}
      className="bg-white p-7"
      ListHeaderComponent={
        <>
          {ListHeaderComponent &&
            (React.isValidElement(ListHeaderComponent) ? (
              ListHeaderComponent
            ) : (
              <ListHeaderComponent />
            ))}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-2xl font-black text-indigo-950">{title}</Text>
            <View className="rounded-full px-3 py-1">
              <Text className="text-sm font-semibold text-indigo-700">
                {workoutsList.length}
              </Text>
            </View>
          </View>
        </>
      }
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
    />
  );
};

export default WorkoutsList;
