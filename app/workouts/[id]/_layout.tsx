import { useAuth, WorkoutProvider } from "@/contexts";
import { workoutExists } from "@/contexts/workout/workout.repository";
import { Redirect, Slot, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const WorkoutIdLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const workoutId = Array.isArray(id) ? id[0] : id;
  const parsedWorkoutId = Number(workoutId);
  const [isValidWorkout, setIsValidWorkout] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      setIsValidWorkout(null);
      return;
    }

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
  }, [isAuthenticated, parsedWorkoutId, workoutId]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF2FF] px-6">
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/prerequisite" />;
  }

  if (isValidWorkout === null) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF2FF] px-6">
        <View className="w-full max-w-sm items-center rounded-2xl border border-white/70 bg-white/65 p-6">
          <ActivityIndicator size="small" color="#6366f1" />
          <Text className="mt-3 text-base text-indigo-700">
            Loading workout...
          </Text>
        </View>
      </View>
    );
  }

  if (!workoutId || !isValidWorkout) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF2FF] px-6">
        <View className="w-full max-w-sm items-center rounded-2xl border border-white/70 bg-white/65 p-6">
          <Text className="mb-1 text-base font-semibold text-indigo-900">
            Workout not found
          </Text>
          <Text className="text-center text-sm text-indigo-700">
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
