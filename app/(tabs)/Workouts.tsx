import { AddWorkoutForm, WorkoutsList } from "@/components";
import { useWorkoutsList } from "@/contexts";
import React, { useCallback, useState } from "react";
import { RefreshControl } from "react-native";

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
    <WorkoutsList
      title="Workouts"
      ListHeaderComponent={<AddWorkoutForm />}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    />
  );
}

export default Workouts;
