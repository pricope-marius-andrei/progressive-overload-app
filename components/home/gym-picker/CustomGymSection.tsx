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
      <View className="mb-4 rounded-3xl border border-white/70 bg-white/65 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-indigo-950">
            Use current location
          </Text>
          <View className="rounded-full border border-indigo-100 bg-indigo-50/80 px-2.5 py-1">
            <Text className="text-[10px] font-semibold tracking-wide text-indigo-600">
              LIVE GPS
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-xs leading-5 text-indigo-700">
          Tap Current Location to fetch your exact coordinates, then add a gym
          name below and save it.
        </Text>
        <Text className="mt-1 text-xs leading-5 text-indigo-700">
          You can also long-press on the map to pick a custom pin.
        </Text>

        <Pressable
          className={`mt-4 items-center justify-center rounded-xl px-4 py-3 ${isSaving ? "bg-indigo-300" : "bg-indigo-500"}`}
          onPress={onUseCurrentLocation}
          disabled={isSaving}
        >
          <Text
            className={`font-semibold ${isSaving ? "text-indigo-100" : "text-white"}`}
          >
            {isSaving ? "Please wait..." : "Current Location"}
          </Text>
        </Pressable>

        {selectedMapCoordinates ? (
          <View className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-3">
            <Text className="text-[10px] font-semibold tracking-wide text-indigo-600">
              SELECTED COORDINATES
            </Text>
            <Text className="mt-1 text-xs text-indigo-800">
              {selectedMapCoordinates.latitude.toFixed(5)},{" "}
              {selectedMapCoordinates.longitude.toFixed(5)}
            </Text>
          </View>
        ) : (
          <View className="mt-3 rounded-xl border border-dashed border-indigo-200 bg-white/70 px-3 py-3">
            <Text className="text-xs text-indigo-700">
              No location selected yet.
            </Text>
          </View>
        )}
      </View>

      {selectedMapCoordinates ? (
        <View className="mb-4 rounded-3xl border border-white/70 bg-white/65 px-4 py-4">
          <View className="mb-3">
            <Text className="text-base font-semibold text-indigo-950">
              Name this gym
            </Text>
            <Text className="mt-1 text-xs text-indigo-700">
              Choose any name you will recognize later.
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <TextInput
              className="flex-1 rounded-xl border border-indigo-100 bg-white/80 px-4 py-3 text-indigo-950"
              value={customGymName}
              onChangeText={onCustomGymNameChange}
              placeholder="Type a custom gym name"
              placeholderTextColor="#6366F1"
            />

            <Pressable
              className={`items-center justify-center rounded-xl px-4 py-3 ${isSaving ? "bg-indigo-300" : "bg-indigo-500"}`}
              onPress={onSavePickedMapGym}
              disabled={isSaving}
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
