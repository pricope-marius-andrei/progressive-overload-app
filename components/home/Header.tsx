/**
 * WelcomeHeader Component - Progressive Overload Gym App
 *
 * Displays welcome message and daily streak information
 */
import { useDashboard } from "@/contexts";
import { COLORS } from "@/utils/theme";
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
          color={COLORS.warning}
          accessibilityLabel="fire icon"
        />
        <Text className="text-2xl font-black text-indigo-950 dark:text-indigo-50">
          {streak}
        </Text>
      </View>

      <Pressable
        onPress={onOpenGymPicker}
        disabled={!onOpenGymPicker}
        className="flex-row items-center gap-1 px-2 py-2"
        accessibilityRole="button"
        accessibilityLabel="Open gym picker"
        accessibilityHint="Choose your gym for today"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={({ pressed }) =>
          pressed ? { opacity: 0.8, transform: [{ scale: 0.98 }] } : undefined
        }
      >
        <Text className="text-2xl font-black text-indigo-950 dark:text-indigo-50">
          {gymLabel}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
      </Pressable>
    </View>
  );
}

export default Header;
