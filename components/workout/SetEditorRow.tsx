import { ExerciseSet } from "@/types/mappers/workout.mapper";
import { COLORS } from "@/utils/theme";
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
    <View className="mb-2 flex-row items-center justify-between rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-2 py-3">
      <View className="flex-row items-center flex-1">
        <Text className="w-12 font-medium text-indigo-700 dark:text-indigo-200">
          Set {index + 1}
        </Text>

        <View className="flex-1 mx-2">
          <Text className="mb-1 text-xs text-indigo-500">Reps</Text>
          <TextInput
            className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-900/60 px-3 py-2 text-center text-indigo-950 dark:text-indigo-50"
            value={set.reps.toString()}
            onChangeText={(text) => {
              const reps = parseInt(text) || 0;
              updateSetReps(set.id, reps);
            }}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={COLORS.muted}
          />
        </View>

        <View className="flex-1 mx-2">
          <Text className="mb-1 text-xs text-indigo-500">Weight (kg)</Text>
          <TextInput
            className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white dark:bg-slate-900/60 px-3 py-2 text-center text-indigo-950 dark:text-indigo-50"
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
            placeholderTextColor={COLORS.muted}
          />
        </View>
      </View>

      <TouchableOpacity
        className="rounded-lg bg-indigo-50/90 dark:bg-indigo-900/40 h-11 w-11 items-center justify-center"
        onPress={handleConfirmRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove set ${index + 1}`}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SetEditorRow;
