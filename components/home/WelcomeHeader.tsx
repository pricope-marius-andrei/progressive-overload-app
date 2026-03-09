/**
 * WelcomeHeader Component - Progressive Overload Gym App
 *
 * Displays welcome message and daily streak information
 */

import { useHome } from "@/contexts";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type WelcomeHeaderProps = {
  onOpenGymPicker?: () => void;
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ onOpenGymPicker }) => {
  const { user } = useHome();
  const gymNameLabel = user.gymName?.trim() || "Go to the gym";

  return (
    <View className="mb-4 rounded-3xl border border-white/70 bg-white/65 px-5 py-5">
      <Text className="text-[11px] font-semibold uppercase tracking-[1.2px] text-indigo-500">
        Overview
      </Text>

      <View className="mt-2 flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-indigo-950">
            Welcome back
          </Text>
          <Text className="mt-1 text-sm text-indigo-700">{gymNameLabel}</Text>
        </View>

        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-500"
          onPress={onOpenGymPicker}
          disabled={!onOpenGymPicker}
        >
          <Ionicons name="map-outline" size={18} color="#ffffff" />
        </Pressable>
      </View>

      <View className="mt-4 flex-row flex-wrap items-center gap-2">
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1.5">
          <Text className="text-[12px] font-semibold text-indigo-700">
            {user.dailyStreak} day streak
          </Text>
        </View>
        <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1.5">
          <Text className="text-[12px] font-semibold text-indigo-700">
            {user.experienceScore} XP
          </Text>
        </View>
      </View>
    </View>
  );
};

export default WelcomeHeader;
