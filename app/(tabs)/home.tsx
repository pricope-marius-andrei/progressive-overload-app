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
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [activeDeleteWorkoutId, setActiveDeleteWorkoutId] = useState<
    number | null
  >(null);

  const handleAddTemplateToToday = async (templateWorkoutId: number) => {
    const selectedTemplate = workoutTemplates.find(
      (workout) => workout.id === templateWorkoutId,
    );

    // Keep add flow stable even if template list is temporarily stale/reloading.
    await addTemplateToTodayActivity(
      selectedTemplate ?? {
        id: templateWorkoutId,
        name: "Workout Template",
        exercises: [],
      },
    );
    await refreshDashboard();
  };

  const handleRemoveTodayWorkout = async (
    workout: (typeof todaysWorkouts)[number],
  ) => {
    await removeTodayActivityWorkout(workout);
    await refreshDashboard();
  };

  const handleAddSelectedTemplate = async () => {
    if (selectedTemplateId === null) {
      return;
    }

    await handleAddTemplateToToday(selectedTemplateId);
  };

  return (
    <ScrollView
      className="flex-1 p-6 relative bg-white"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <GymPickerModal
        visible={isGymPickerVisible}
        onClose={() => setIsGymPickerVisible(false)}
        onSaved={refreshDashboard}
      />
      <HomeHeader onOpenGymPicker={() => setIsGymPickerVisible(true)} />

      <View className="flex justify-center items-center gap-5">
        <View className="flex-1 flex-row items-center justify-center gap-3">
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

        <View className="h-32 w-full gap-2 rounded-2xl border-4 border-dashed border-status-selected-text p-6 flexjustify-center">
          <Text className="w-full text-xs font-black uppercase tracking-[1px] text-indigo-500">
            Select from your workout templates
          </Text>

          {workoutTemplates.length === 0 ? (
            <Text className="text-sm text-indigo-700">
              No workout templates available. Create templates in Workouts tab.
            </Text>
          ) : (
            <View className="flex-1 flex-row items-center gap-3">
              <View className="flex-1 border border-status-selected-text rounded-xl h-12 justify-center">
                <Picker
                  selectedValue={selectedTemplateId ?? ""}
                  onValueChange={(value) => {
                    if (typeof value === "number") {
                      setSelectedTemplateId(value);
                      return;
                    }
                    setSelectedTemplateId(null);
                  }}
                  mode="dropdown"
                >
                  {workoutTemplates.map((templateWorkout) => (
                    <Picker.Item
                      key={templateWorkout.id}
                      label={templateWorkout.name}
                      value={templateWorkout.id}
                    />
                  ))}
                </Picker>
              </View>

              <Pressable
                className="items-center rounded-full p-3 bg-status-selected-bg border-2 border-status-selected-border"
                onPress={() => {
                  void handleAddSelectedTemplate();
                }}
              >
                <Text className="m-auto font-semibold">
                  <Ionicons name="add" size={16} color="white" />
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="flex flex-1 w-full gap-3 justify-center">
          {todaysWorkouts.length === 0 ? (
            <Text className="text-sm text-indigo-700 text-center">
              No workouts in today&apos;s activity yet. Add one from templates.
            </Text>
          ) : (
            todaysWorkouts.map((workout) => (
              <WorkoutItem
                key={workout.id}
                workout={workout}
                isDeleteMode={activeDeleteWorkoutId === workout.id}
                hasAnyDeleteModeActive={activeDeleteWorkoutId !== null}
                onEnterDeleteMode={() => setActiveDeleteWorkoutId(workout.id)}
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
