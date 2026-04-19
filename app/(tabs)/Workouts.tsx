import { AddWorkoutForm, WorkoutsList } from "@/components";
import { useWorkoutsList } from "@/contexts";
import React, { useCallback, useState } from "react";
import { RefreshControl, View } from "react-native";

function Workouts() {
  const { refreshWorkoutsList } = useWorkoutsList();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      <View className="flex-1">
        <WorkoutsList
          title="Workout Templates"
          ListHeaderComponent={<AddWorkoutForm />}
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
