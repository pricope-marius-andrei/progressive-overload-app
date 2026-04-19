/**
 * WelcomeHeader Component - Progressive Overload Gym App
 *
 * Displays welcome message and daily streak information
 */
import { useDashboard } from "@/contexts";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type HeaderProps = {
  onOpenGymPicker?: () => void;
};

function Header({ onOpenGymPicker }: HeaderProps) {
  const { user } = useDashboard();
  const streak = user.dailyStreak;
  const gymLabel = user.gymName ?? "No Gym Selected";

  return (
    <View className="flex-row justify-between items-center pb-10">
      <View className="flex-row items-center">
        <Ionicons
          name="flame"
          size={30}
          color="#f97316"
          accessibilityLabel="fire icon"
        />
        <Text className="text-2xl font-black">{streak}</Text>
      </View>

      <Pressable
        onPress={onOpenGymPicker}
        disabled={!onOpenGymPicker}
        className="flex-row items-center gap-1"
        accessibilityRole="button"
        accessibilityLabel="Open gym picker"
      >
        <Text className="text-2xl font-black text-gray-800">{gymLabel}</Text>
        <Ionicons name="chevron-down" size={20} color="black" />
      </Pressable>
    </View>
  );
}

export default Header;
