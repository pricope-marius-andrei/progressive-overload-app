/**
 * AddWorkoutForm Component - Progressive Overload Gym App
 *
 * Form for adding new workouts with input field and add button
 */

import { useWorkoutsList } from "@/contexts";
import { COLORS } from "@/utils/theme";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const AddWorkoutForm: React.FC = () => {
  const { handleSaveNewWorkout } = useWorkoutsList();

  const [newWorkoutName, setNewWorkoutName] = useState("");
  const isDisabled = !newWorkoutName.trim();

  const handleSubmit = useCallback(async () => {
    if (!newWorkoutName.trim()) {
      return;
    }

    await handleSaveNewWorkout(newWorkoutName);
    setNewWorkoutName("");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newWorkoutName, handleSaveNewWorkout]);

  return (
    <View className="mb-5 gap-3">
      <Text className="text-2xl font-black text-indigo-950 dark:text-indigo-50">
        Create workout template
      </Text>

      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-slate-900/70 px-5 py-3 text-indigo-950 dark:text-indigo-50"
          placeholder="e.g. Push Day"
          placeholderTextColor={COLORS.muted}
          value={newWorkoutName}
          onChangeText={setNewWorkoutName}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Pressable
          className={`h-11 w-11 items-center justify-center rounded-xl border-2 ${isDisabled ? "bg-status-default-bg border-status-default-border" : "bg-status-selected-bg border-status-selected-border"}`}
          disabled={isDisabled}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Add workout template"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) =>
            !isDisabled && pressed
              ? { opacity: 0.8, transform: [{ scale: 0.98 }] }
              : undefined
          }
        >
          <AntDesign
            name="plus"
            size={16}
            color={isDisabled ? COLORS.muted : "white"}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default AddWorkoutForm;
