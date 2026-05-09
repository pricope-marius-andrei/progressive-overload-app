import { COLORS } from "@/utils/theme";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Coordinates } from "./types";

type CustomGymSectionProps = {
  customGymName: string;
  isSaving: boolean;
  selectedMapCoordinates: Coordinates | null;
  onCustomGymNameChange: (value: string) => void;
  onUseCurrentLocation: () => void;
  onSavePickedMapGym: () => void;
};

const CustomGymSection: React.FC<CustomGymSectionProps> = ({
  customGymName,
  isSaving,
  selectedMapCoordinates,
  onCustomGymNameChange,
  onUseCurrentLocation,
  onSavePickedMapGym,
}) => {
  return (
    <>
      <View className="mb-4 rounded-3xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-indigo-950 dark:text-indigo-50">
            Use current location
          </Text>
          <View className="rounded-full border border-indigo-100 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-900/40 px-2.5 py-1">
            <Text className="text-[10px] font-semibold tracking-wide text-indigo-600 dark:text-indigo-200">
              LIVE GPS
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-xs leading-5 text-indigo-700 dark:text-indigo-200">
          Tap Current Location to fetch your exact coordinates, then add a gym
          name below and save it.
        </Text>
        <Text className="mt-1 text-xs leading-5 text-indigo-700 dark:text-indigo-200">
          You can also long-press on the map to pick a custom pin.
        </Text>

        <Pressable
          className={`mt-4 items-center justify-center rounded-xl px-4 h-11 ${isSaving ? "bg-indigo-300" : "bg-indigo-600"}`}
          onPress={onUseCurrentLocation}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Use current location"
          style={({ pressed }) =>
            !isSaving && pressed
              ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
              : undefined
          }
        >
          <Text
            className={`font-semibold ${isSaving ? "text-indigo-100" : "text-white"}`}
          >
            {isSaving ? "Please wait..." : "Current Location"}
          </Text>
        </Pressable>

        {selectedMapCoordinates ? (
          <View className="mt-3 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/40 px-3 py-3">
            <Text className="text-[10px] font-semibold tracking-wide text-indigo-600 dark:text-indigo-200">
              SELECTED COORDINATES
            </Text>
            <Text className="mt-1 text-xs text-indigo-800 dark:text-indigo-100">
              {selectedMapCoordinates.latitude.toFixed(5)},{" "}
              {selectedMapCoordinates.longitude.toFixed(5)}
            </Text>
          </View>
        ) : (
          <View className="mt-3 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-800 bg-white/70 dark:bg-slate-900/60 px-3 py-3">
            <Text className="text-xs text-indigo-700 dark:text-indigo-200">
              No location selected yet.
            </Text>
          </View>
        )}
      </View>

      {selectedMapCoordinates ? (
        <View className="mb-4 rounded-3xl border border-white/70 dark:border-indigo-900/60 bg-white/70 dark:bg-slate-900/70 px-4 py-4">
          <View className="mb-3">
            <Text className="text-base font-semibold text-indigo-950 dark:text-indigo-50">
              Name this gym
            </Text>
            <Text className="mt-1 text-xs text-indigo-700 dark:text-indigo-200">
              Choose any name you will recognize later.
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <TextInput
              className="flex-1 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/80 dark:bg-slate-900/60 px-4 py-3 text-indigo-950 dark:text-indigo-50"
              value={customGymName}
              onChangeText={onCustomGymNameChange}
              placeholder="Type a custom gym name"
              placeholderTextColor={COLORS.muted}
            />

            <Pressable
              className={`items-center justify-center rounded-xl px-4 h-11 ${isSaving ? "bg-indigo-300" : "bg-indigo-600"}`}
              onPress={onSavePickedMapGym}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Save custom gym"
              style={({ pressed }) =>
                !isSaving && pressed
                  ? { opacity: 0.85, transform: [{ scale: 0.99 }] }
                  : undefined
              }
            >
              <Text className="font-semibold text-white">
                {isSaving ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </>
  );
};

export default CustomGymSection;
