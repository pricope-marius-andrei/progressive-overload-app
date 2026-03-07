import { ExerciseSet } from "@/types/mappers/workout.mapper";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

interface SetEditorRowProps {
  set: ExerciseSet;
  index: number;
  updateSetReps: (setId: number, reps: number) => void;
  updateSetWeight: (setId: number, weight: number) => void;
  removeSet: (setId: number) => void;
}

const SetEditorRow: React.FC<SetEditorRowProps> = ({
  set,
  index,
  updateSetReps,
  updateSetWeight,
  removeSet,
}) => {
  const [weightInput, setWeightInput] = React.useState(set.weight.toString());

  React.useEffect(() => {
    setWeightInput(set.weight.toString());
  }, [set.weight]);

  const handleConfirmRemove = () => {
    Alert.alert("Remove set?", `Set ${index + 1} will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeSet(set.id),
      },
    ]);
  };

  return (
    <View className="flex-row items-center justify-between py-3 border border-gray-100 rounded-xl px-2 mb-2">
      <View className="flex-row items-center flex-1">
        <Text className="text-gray-600 w-12 font-medium">Set {index + 1}</Text>

        <View className="flex-1 mx-2">
          <Text className="text-xs text-gray-500 mb-1">Reps</Text>
          <TextInput
            className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-center"
            value={set.reps.toString()}
            onChangeText={(text) => {
              const reps = parseInt(text) || 0;
              updateSetReps(set.id, reps);
            }}
            keyboardType="numeric"
            placeholder="10"
          />
        </View>

        <View className="flex-1 mx-2">
          <Text className="text-xs text-gray-500 mb-1">Weight (kg)</Text>
          <TextInput
            className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-center"
            value={weightInput}
            onChangeText={(text) => {
              const normalizedText = text.replace(",", ".");

              // Keep typing natural while restricting invalid numeric characters.
              if (!/^\d*\.?\d*$/.test(normalizedText)) {
                return;
              }

              setWeightInput(normalizedText);

              if (normalizedText === "" || normalizedText === ".") {
                return;
              }

              updateSetWeight(set.id, parseFloat(normalizedText));
            }}
            onBlur={() => {
              const parsedWeight = parseFloat(weightInput);
              const nextWeight = Number.isFinite(parsedWeight)
                ? parsedWeight
                : 0;
              setWeightInput(nextWeight.toString());
              updateSetWeight(set.id, nextWeight);
            }}
            keyboardType="decimal-pad"
            placeholder="50"
          />
        </View>
      </View>

      <TouchableOpacity
        className="p-2 bg-red-50 rounded-lg"
        onPress={handleConfirmRemove}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};

export default SetEditorRow;
