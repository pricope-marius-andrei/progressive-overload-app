/**
 * AddWorkoutForm Component - Progressive Overload Gym App
 *
 * Form for adding new workouts with input field and add button
 */

import { useHome } from "@/contexts";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

const AddWorkoutForm: React.FC = () => {
  const { handleSaveNewWorkout } = useHome();

  const [newWorkoutName, setNewWorkoutName] = useState("");
  const isDisabled = !newWorkoutName.trim();

  return (
    <View className="bg-white rounded-2xl p-4 border border-gray-100">
      <Text className="text-base font-semibold text-gray-900 mb-3">
        Create workout
      </Text>

      <View className="flex-row items-center gap-3">
        <TextInput
          className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3"
          placeholder="e.g. Push Day"
          value={newWorkoutName}
          onChangeText={setNewWorkoutName}
          returnKeyType="done"
          onSubmitEditing={async () => {
            if (isDisabled) {
              return;
            }

            await handleSaveNewWorkout(newWorkoutName);
            setNewWorkoutName("");
          }}
        />

        <Pressable
          className={`rounded-xl px-4 py-3 items-center justify-center ${isDisabled ? "bg-indigo-200" : "bg-primary"}`}
          disabled={isDisabled}
          onPress={async () => {
            await handleSaveNewWorkout(newWorkoutName);
            setNewWorkoutName("");
          }}
        >
          <AntDesign name="plus" size={16} color="white" />
        </Pressable>
      </View>

      <Text className="text-xs text-gray-500 mt-2">
        Add a workout, then tap it below to start logging exercises.
      </Text>
    </View>
  );
};

export default AddWorkoutForm;
