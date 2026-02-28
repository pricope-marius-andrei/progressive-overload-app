import { WorkoutProvider } from "@/contexts";
import { workoutExists } from "@/contexts/workout/workout.repository";
import { Slot, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const WorkoutIdLayout: React.FC = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const workoutId = Array.isArray(id) ? id[0] : id;
  const parsedWorkoutId = Number(workoutId);
  const [isValidWorkout, setIsValidWorkout] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!workoutId || !Number.isInteger(parsedWorkoutId)) {
      setIsValidWorkout(false);
      return;
    }

    const validateWorkout = async () => {
      try {
        const exists = await workoutExists(parsedWorkoutId);

        if (isMounted) {
          setIsValidWorkout(exists);
        }
      } catch (error) {
        if (isMounted) {
          setIsValidWorkout(false);
        }
        console.error("Error validating workout id:", error);
      }
    };

    setIsValidWorkout(null);
    validateWorkout();

    return () => {
      isMounted = false;
    };
  }, [parsedWorkoutId, workoutId]);

  if (isValidWorkout === null) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-gray-50">
        <View className="bg-white border border-gray-100 rounded-2xl p-6 items-center w-full max-w-sm">
          <ActivityIndicator size="small" color="#6366f1" />
          <Text className="mt-3 text-base text-gray-600">
            Loading workout...
          </Text>
        </View>
      </View>
    );
  }

  if (!workoutId || !isValidWorkout) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-gray-50">
        <View className="bg-white border border-gray-100 rounded-2xl p-6 items-center w-full max-w-sm">
          <Text className="text-base font-semibold text-gray-800 mb-1">
            Workout not found
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Go back to Home and open an existing workout.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <WorkoutProvider workoutId={workoutId}>
      <Slot />
    </WorkoutProvider>
  );
};

export default WorkoutIdLayout;
