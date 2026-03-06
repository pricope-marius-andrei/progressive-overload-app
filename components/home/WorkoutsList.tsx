/**
 * WorkoutsList Component - Progressive Overload Gym App
 *
 * Virtualized list of all user workouts with empty state
 */

import { useHome } from "@/contexts";
import { Workout } from "@/types/mappers/workout.mapper";
import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControlProps,
  Text,
  View,
} from "react-native";
import WorkoutItem from "./WorkoutItem";

interface WorkoutsListProps {
  ListHeaderComponent?: React.ComponentType | React.ReactElement;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

const renderWorkoutItem = ({ item }: ListRenderItemInfo<Workout>) => (
  <WorkoutItem workout={item} />
);

const keyExtractor = (item: Workout) => String(item.id);

const ListEmptyComponent = () => (
  <View className="bg-white rounded-2xl border border-gray-100 p-8 items-center mt-2">
    <Text className="text-gray-700 text-center text-lg font-semibold mb-2">
      No workouts yet
    </Text>
    <Text className="text-gray-500 text-center">
      Create one above to start your first training session.
    </Text>
  </View>
);

const WorkoutsList: React.FC<WorkoutsListProps> = ({
  ListHeaderComponent,
  refreshControl,
}) => {
  const { workoutsList } = useHome();

  return (
    <FlatList
      data={workoutsList}
      renderItem={renderWorkoutItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={
        <>
          {ListHeaderComponent &&
            (React.isValidElement(ListHeaderComponent) ? (
              ListHeaderComponent
            ) : (
              <ListHeaderComponent />
            ))}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Start workout
            </Text>
            <View className="bg-white border border-gray-100 rounded-full px-3 py-1">
              <Text className="text-sm font-semibold text-gray-600">
                {workoutsList.length}
              </Text>
            </View>
          </View>
        </>
      }
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}
    />
  );
};

export default WorkoutsList;
