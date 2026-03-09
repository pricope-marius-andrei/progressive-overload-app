/**
 * AddWorkoutForm Component - Progressive Overload Gym App
 *
 * Form for adding new workouts with input field and add button
 */

import { useHome } from "@/contexts";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const AddWorkoutForm: React.FC = () => {
  const { handleSaveNewWorkout } = useHome();

  const [newWorkoutName, setNewWorkoutName] = useState("");
  const isDisabled = !newWorkoutName.trim();

  const handleSubmit = useCallback(async () => {
    if (!newWorkoutName.trim()) {
      return;
    }

    await handleSaveNewWorkout(newWorkoutName);
    setNewWorkoutName("");
  }, [newWorkoutName, handleSaveNewWorkout]);

  return (
    <View className="rounded-3xl border border-white/70 bg-white/65 p-4">
      <Text className="mb-1 text-[11px] font-semibold uppercase tracking-[1.2px] text-indigo-500">
        New Session
      </Text>
      <Text className="mb-3 text-base font-semibold text-indigo-950">
        Create workout
      </Text>

      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 rounded-xl border border-indigo-100 bg-white/80 px-4 py-3 text-indigo-950"
          placeholder="e.g. Push Day"
          placeholderTextColor="#6366F1"
          value={newWorkoutName}
          onChangeText={setNewWorkoutName}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Pressable
          className={`items-center justify-center rounded-xl px-4 py-3 ${isDisabled ? "bg-indigo-300" : "bg-indigo-500"}`}
          disabled={isDisabled}
          onPress={handleSubmit}
        >
          <AntDesign name="plus" size={16} color="white" />
        </Pressable>
      </View>

      <Text className="mt-2 text-xs text-indigo-700">
        Add a workout, then tap it below to start logging exercises.
      </Text>
    </View>
  );
};

export default AddWorkoutForm;
