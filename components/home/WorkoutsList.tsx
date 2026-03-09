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
            <Text className="text-lg font-semibold text-indigo-950">
              Start a session
            </Text>
            <View className="rounded-full border border-indigo-100 bg-white/70 px-3 py-1">
              <Text className="text-sm font-semibold text-indigo-700">
                {workoutsList.length}
              </Text>
            </View>
          </View>
        </>
      }
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={refreshControl}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 28,
      }}
    />
  );
};

export default WorkoutsList;
