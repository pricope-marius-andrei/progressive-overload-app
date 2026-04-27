import { AddWorkoutForm, WorkoutsList } from "@/components";
import { useWorkoutsList } from "@/contexts";
import React, { useCallback, useState } from "react";
import { RefreshControl, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Workouts() {
  const { refreshWorkoutsList, workoutsList } = useWorkoutsList();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  // Floating tab bar is 60px tall and sits 20px from bottom.
  const tabBarOffset = 80 + insets.bottom;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshWorkoutsList();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshWorkoutsList]);

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-4">
        <AddWorkoutForm />
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-2xl font-black text-indigo-950">
            Workout Templates
          </Text>
          <View className="rounded-full px-3 py-1">
            <Text className="text-sm font-semibold text-indigo-700">
              {workoutsList.length}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="flex-1"
        style={{ paddingBottom: tabBarOffset, paddingHorizontal: 7 }}
      >
        <WorkoutsList
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      </View>
    </View>
  );
}

export default Workouts;
