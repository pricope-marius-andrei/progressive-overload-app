/**
 * AddWorkoutForm Component - Progressive Overload Gym App
 *
 * Form for adding new workouts with input field and add button
 */

import { useHome } from "@/contexts";
import AntDesign from "@expo/vector-icons/AntDesign";
import React, { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

const AddWorkoutForm: React.FC = () => {
  const { handleSaveNewWorkout } = useHome();

  const [newWorkoutName, setNewWorkoutName] = useState("");

  return (
    <View className="flex-row items-center justify-between">
      <TextInput
        className="flex-1 border border-gray-300 bg-white rounded-lg px-4 mr-4"
        placeholder="Workout Name"
        value={newWorkoutName}
        onChangeText={setNewWorkoutName}
      />

      <Pressable
        className="flex-2 bg-primary rounded-lg p-2 justify-center items-center"
        onPress={async () => {
          await handleSaveNewWorkout(newWorkoutName);
          setNewWorkoutName("");
        }}
      >
        <AntDesign name="plus-circle" size={24} color="white" />
      </Pressable>
    </View>
  );
};

export default AddWorkoutForm;
