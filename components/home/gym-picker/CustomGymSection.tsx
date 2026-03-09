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
      <View className="mb-4 rounded-3xl border border-sky-100 bg-sky-50 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-sky-950">
            Use current location
          </Text>
          <View className="rounded-full bg-white px-2.5 py-1 border border-sky-200">
            <Text className="text-[10px] font-semibold tracking-wide text-sky-800">
              LIVE GPS
            </Text>
          </View>
        </View>

        <Text className="mt-2 text-xs leading-5 text-sky-800">
          Tap Current Location to fetch your exact coordinates, then add a gym
          name below and save it.
        </Text>
        <Text className="mt-1 text-xs leading-5 text-sky-700">
          You can also long-press on the map to pick a custom pin.
        </Text>

        <Pressable
          className={`mt-4 rounded-xl px-4 py-3 items-center justify-center ${isSaving ? "bg-slate-300" : "bg-slate-900"}`}
          onPress={onUseCurrentLocation}
          disabled={isSaving}
        >
          <Text
            className={`font-semibold ${isSaving ? "text-slate-500" : "text-white"}`}
          >
            {isSaving ? "Please wait..." : "Current Location"}
          </Text>
        </Pressable>

        {selectedMapCoordinates ? (
          <View className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
            <Text className="text-[10px] font-semibold tracking-wide text-emerald-800">
              SELECTED COORDINATES
            </Text>
            <Text className="mt-1 text-xs text-emerald-900">
              {selectedMapCoordinates.latitude.toFixed(5)},{" "}
              {selectedMapCoordinates.longitude.toFixed(5)}
            </Text>
          </View>
        ) : (
          <View className="mt-3 rounded-xl border border-dashed border-sky-200 bg-white px-3 py-3">
            <Text className="text-xs text-sky-700">
              No location selected yet.
            </Text>
          </View>
        )}
      </View>

      {selectedMapCoordinates ? (
        <View className="rounded-3xl border border-slate-200 bg-white px-4 py-4 mb-4">
          <View className="mb-3">
            <Text className="text-base font-extrabold text-slate-900">
              Name this gym
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              Choose any name you will recognize later.
            </Text>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <TextInput
              className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 flex-1"
              value={customGymName}
              onChangeText={onCustomGymNameChange}
              placeholder="Type a custom gym name"
            />

            <Pressable
              className={`rounded-xl px-4 py-3 items-center justify-center ${isSaving ? "bg-gray-300" : "bg-primary"}`}
              onPress={onSavePickedMapGym}
              disabled={isSaving}
            >
              <Text className="text-white font-semibold">
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
