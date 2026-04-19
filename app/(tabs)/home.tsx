/**
 * Home Screen Component - Progressive Overload Gym App
 *
 * Main dashboard featuring daily streaks, training modules, and workout access.
 * Users can view their progress, start workouts, and track different training types.
 *
 * Note: Wrapped with DashboardProvider at TabLayout level for state management
 */

import { GymPickerModal, Header, TrainingCalendar } from "@/components";
import WorkoutItem from "@/components/home/WorkoutItem";
import {
  useAuth,
  useDashboard,
  useTodayActivity,
  useWorkoutsList,
} from "@/contexts";
import { Redirect } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const getTodayDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type HomeHeaderProps = {
  onOpenGymPicker: () => void;
};

function HomeHeader({ onOpenGymPicker }: HomeHeaderProps) {
  return (
    <View className="mb-6">
      <Header onOpenGymPicker={onOpenGymPicker} />
      <TrainingCalendar />
    </View>
  );
}

function HomeContent() {
  const { refreshDashboard } = useDashboard();
  const { workoutsList: workoutTemplates } = useWorkoutsList();
  const {
    todaysWorkouts,
    selectedActivityDateKey,
    addTemplateToTodayActivity,
    removeTodayActivityWorkout,
    navigateToTodayWorkout,
  } = useTodayActivity();
  const [isGymPickerVisible, setIsGymPickerVisible] = useState(false);
  const [isTemplateSelectorVisible, setIsTemplateSelectorVisible] =
    useState(false);
  const [activeDeleteWorkoutId, setActiveDeleteWorkoutId] = useState<
    number | null
  >(null);

  const handleAddTemplateToToday = async (templateWorkoutId: number) => {
    const selectedTemplate = workoutTemplates.find(
      (workout) => workout.id === templateWorkoutId,
    );

    if (!selectedTemplate) {
      return;
    }

    await addTemplateToTodayActivity(selectedTemplate);
    await refreshDashboard();
    setIsTemplateSelectorVisible(false);
  };

  const handleRemoveTodayWorkout = async (
    workout: (typeof todaysWorkouts)[number],
  ) => {
    await removeTodayActivityWorkout(workout);
    await refreshDashboard();
  };

  return (
    <View className="p-5 relative flex-1 bg-white">
      <View className="flex-1" style={{ zIndex: 1 }}>
        <GymPickerModal
          visible={isGymPickerVisible}
          onClose={() => setIsGymPickerVisible(false)}
          onSaved={refreshDashboard}
        />

        <ScrollView className="flex-1">
          <HomeHeader onOpenGymPicker={() => setIsGymPickerVisible(true)} />

          <View className="rounded-3xl border border-white/70 bg-white/65 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-2xl font-black text-indigo-950">
                {getTodayDateKey(new Date()) === selectedActivityDateKey
                  ? "Today's Activity"
                  : `Activity - ${selectedActivityDateKey}`}
              </Text>
              <View className="rounded-full bg-indigo-50 px-3 py-1">
                <Text className="text-sm font-semibold text-indigo-700">
                  {todaysWorkouts.length}
                </Text>
              </View>
            </View>

            <Pressable
              className="mb-3 mt-1 rounded-xl bg-indigo-500 px-4 py-3 items-center"
              onPress={() =>
                setIsTemplateSelectorVisible((previous) => !previous)
              }
            >
              <Text className="font-semibold text-white">
                {isTemplateSelectorVisible
                  ? "Hide Templates"
                  : "Add Workout From Templates"}
              </Text>
            </Pressable>

            {isTemplateSelectorVisible ? (
              <View className="mb-3 gap-2 rounded-2xl border border-indigo-100 bg-white/80 p-3">
                {workoutTemplates.length === 0 ? (
                  <Text className="text-sm text-indigo-700">
                    No workout templates available. Create templates in Workouts
                    tab.
                  </Text>
                ) : (
                  workoutTemplates.map((templateWorkout) => (
                    <Pressable
                      key={templateWorkout.id}
                      className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2"
                      onPress={() => {
                        void handleAddTemplateToToday(templateWorkout.id);
                      }}
                    >
                      <Text className="text-sm font-semibold text-indigo-800">
                        + {templateWorkout.name}
                      </Text>
                    </Pressable>
                  ))
                )}
              </View>
            ) : null}

            <View className="gap-2">
              {todaysWorkouts.length === 0 ? (
                <Text className="text-sm text-indigo-700">
                  No workouts in today&apos;s activity yet. Add one from
                  templates.
                </Text>
              ) : (
                todaysWorkouts.map((workout) => (
                  <WorkoutItem
                    key={workout.id}
                    workout={workout}
                    isDeleteMode={activeDeleteWorkoutId === workout.id}
                    hasAnyDeleteModeActive={activeDeleteWorkoutId !== null}
                    onEnterDeleteMode={() =>
                      setActiveDeleteWorkoutId(workout.id)
                    }
                    onExitDeleteMode={() => setActiveDeleteWorkoutId(null)}
                    onOpenWorkout={navigateToTodayWorkout}
                    onDeleteWorkout={handleRemoveTodayWorkout}
                    subtitle="Tap to open today's workout"
                  />
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/**
 * Home screen component - Main dashboard
 */
function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#EEF2FF]">
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/prerequisite" />;
  }

  return <HomeContent />;
}

export default Home;
