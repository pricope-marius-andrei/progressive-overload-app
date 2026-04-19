/**
 * AddWorkoutForm Component - Progressive Overload Gym App
 *
 * Form for adding new workouts with input field and add button
 */

import { useWorkoutsList } from "@/contexts";
import AntDesign from "@expo/vector-icons/AntDesign";
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
  }, [newWorkoutName, handleSaveNewWorkout]);

  return (
    <View className="mb-5 gap-3">
      <Text className="text-2xl font-black">Create workout</Text>

      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 rounded-xl border border-indigo-100 px-4 py-3 text-black"
          placeholder="e.g. Push Day"
          placeholderTextColor="gray"
          value={newWorkoutName}
          onChangeText={setNewWorkoutName}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <Pressable
          className={`items-center justify-center rounded-xl px-4 py-3 ${isDisabled ? "bg-status-default-bg border border-status-default-border" : "bg-status-selected-bg border-2 border-status-selected-border"}`}
          disabled={isDisabled}
          onPress={handleSubmit}
        >
          <AntDesign
            name="plus"
            size={16}
            color={isDisabled ? "gray" : "white"}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default AddWorkoutForm;
