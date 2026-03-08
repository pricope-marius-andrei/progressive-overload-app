import { findNearbyGyms, NearbyGym } from "@/contexts/home/gym-search.service";
import {
    fetchGymLocationSettings,
    fetchNearbyKnownGyms,
    saveGymLocationSettings,
    saveKnownGymPlace,
} from "@/contexts/home/home.repository";
import { getCurrentDeviceCoordinates } from "@/utils/location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

type GymPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSaved?: () => Promise<void> | void;
};

type SelectableGym = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string | null;
  source: "openstreetmap" | "community";
};

const DEFAULT_RADIUS_METERS = 120;
const NEARBY_GYM_SEARCH_RADIUS_METERS = 3000;

function dedupeGyms(gyms: SelectableGym[]): SelectableGym[] {
  const seen = new Set<string>();
  const deduped: SelectableGym[] = [];

  for (const gym of gyms) {
    const key = `${gym.name.toLowerCase()}|${gym.latitude.toFixed(4)}|${gym.longitude.toFixed(4)}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(gym);
  }

  return deduped.sort(
    (left, right) => left.distanceMeters - right.distanceMeters,
  );
}

const GymPickerModal: React.FC<GymPickerModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRadiusMeters, setSavedRadiusMeters] = useState(
    DEFAULT_RADIUS_METERS,
  );
  const [customGymName, setCustomGymName] = useState("");
  const [deviceCoordinates, setDeviceCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyGyms, setNearbyGyms] = useState<SelectableGym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);

  const selectedGym = useMemo(
    () => nearbyGyms.find((gym) => gym.id === selectedGymId) ?? null,
    [nearbyGyms, selectedGymId],
  );

  const mapCenter = useMemo(() => {
    if (selectedGym) {
      return {
        latitude: selectedGym.latitude,
        longitude: selectedGym.longitude,
      };
    }

    return deviceCoordinates;
  }, [deviceCoordinates, selectedGym]);

  const loadNearbyGyms = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentGymSettings = await fetchGymLocationSettings();
      setSavedRadiusMeters(currentGymSettings.radiusMeters);
      setCustomGymName(currentGymSettings.gymName ?? "");

      const coordinates = await getCurrentDeviceCoordinates();
      if (!coordinates) {
        Alert.alert(
          "Location Required",
          "Please allow location access to discover gyms near you.",
        );
        return;
      }

      setDeviceCoordinates(coordinates);

      const [openStreetGyms, knownGyms] = await Promise.all([
        findNearbyGyms({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusMeters: NEARBY_GYM_SEARCH_RADIUS_METERS,
        }),
        fetchNearbyKnownGyms({
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          radiusMeters: NEARBY_GYM_SEARCH_RADIUS_METERS,
        }),
      ]);

      const normalizedOpenStreetGyms: SelectableGym[] = openStreetGyms.map(
        (gym: NearbyGym) => ({
          id: `osm:${gym.id}`,
          name: gym.name,
          latitude: gym.latitude,
          longitude: gym.longitude,
          distanceMeters: gym.distanceMeters,
          address: gym.address,
          source: "openstreetmap",
        }),
      );

      const normalizedKnownGyms: SelectableGym[] = knownGyms.map((gym) => ({
        id: `community:${gym.id}`,
        name: gym.name,
        latitude: gym.latitude,
        longitude: gym.longitude,
        distanceMeters: gym.distanceMeters,
        address: "Provided by app users",
        source: "community",
      }));

      const dedupedGyms = dedupeGyms([
        ...normalizedKnownGyms,
        ...normalizedOpenStreetGyms,
      ]);

      setNearbyGyms(dedupedGyms);
      setSelectedGymId((previousGymId) => {
        if (
          previousGymId &&
          dedupedGyms.some((gym) => gym.id === previousGymId)
        ) {
          return previousGymId;
        }

        if (
          Number.isFinite(currentGymSettings.latitude) &&
          Number.isFinite(currentGymSettings.longitude)
        ) {
          const matchedSavedGym = dedupedGyms.find(
            (gym) =>
              Math.abs(gym.latitude - (currentGymSettings.latitude as number)) <
                0.0002 &&
              Math.abs(
                gym.longitude - (currentGymSettings.longitude as number),
              ) < 0.0002,
          );

          if (matchedSavedGym) {
            return matchedSavedGym.id;
          }
        }

        return dedupedGyms[0]?.id ?? null;
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error loading nearby gyms:", message);
      Alert.alert("Error", "Unable to load nearby gyms right now.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    void loadNearbyGyms();
  }, [loadNearbyGyms, visible]);

  const handleSaveSelectedGym = useCallback(async () => {
    const selectedGymName = selectedGym?.name?.trim();

    if (!selectedGym || !selectedGymName) {
      Alert.alert("Select a Gym", "Select one gym from the map or list first.");
      return;
    }

    setIsSaving(true);
    try {
      await saveKnownGymPlace({
        name: selectedGymName,
        latitude: selectedGym.latitude,
        longitude: selectedGym.longitude,
      });

      await saveGymLocationSettings({
        latitude: selectedGym.latitude,
        longitude: selectedGym.longitude,
        radiusMeters: savedRadiusMeters,
        gymName: selectedGymName,
      });

      if (onSaved) {
        await onSaved();
      }

      Alert.alert("Saved", `Gym saved as ${selectedGymName}.`);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error saving selected gym:", message);
      Alert.alert("Error", "Unable to save selected gym.");
    } finally {
      setIsSaving(false);
    }
  }, [onClose, onSaved, savedRadiusMeters, selectedGym]);

  const handleSaveCurrentLocationGym = useCallback(async () => {
    const normalizedGymName = customGymName.trim();
    if (!normalizedGymName) {
      Alert.alert("Gym Name Required", "Please enter a name for your gym.");
      return;
    }

    setIsSaving(true);
    try {
      const latestCoordinates =
        deviceCoordinates ?? (await getCurrentDeviceCoordinates());

      if (!latestCoordinates) {
        Alert.alert(
          "Location Required",
          "Location permission is needed to save your current location as a gym.",
        );
        return;
      }

      setDeviceCoordinates(latestCoordinates);

      await saveKnownGymPlace({
        name: normalizedGymName,
        latitude: latestCoordinates.latitude,
        longitude: latestCoordinates.longitude,
      });

      await saveGymLocationSettings({
        latitude: latestCoordinates.latitude,
        longitude: latestCoordinates.longitude,
        radiusMeters: savedRadiusMeters,
        gymName: normalizedGymName,
      });

      if (onSaved) {
        await onSaved();
      }

      Alert.alert("Saved", `Gym saved as ${normalizedGymName}.`);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error saving current-location gym:", message);
      Alert.alert("Error", "Unable to save your current-location gym.");
    } finally {
      setIsSaving(false);
    }
  }, [customGymName, deviceCoordinates, onClose, onSaved, savedRadiusMeters]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <View className="px-5 pt-5 pb-3 flex-row items-center justify-between bg-white border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900">
            Select Your Gym
          </Text>
          <Pressable onPress={onClose}>
            <Text className="text-primary font-semibold">Close</Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
            <Text className="text-xs text-gray-500">
              Save any selected marker as your gym.
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              Community markers are gyms learned from previous users.
            </Text>
          </View>

          {Platform.OS !== "web" ? (
            <View className="rounded-2xl overflow-hidden border border-gray-200 mb-4 bg-white">
              {mapCenter ? (
                <MapView
                  style={{ width: "100%", height: 290 }}
                  region={{
                    latitude: mapCenter.latitude,
                    longitude: mapCenter.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                  }}
                >
                  {deviceCoordinates ? (
                    <Marker
                      coordinate={deviceCoordinates}
                      title="Your Location"
                      pinColor="#2563eb"
                    />
                  ) : null}

                  {nearbyGyms.map((gym) => (
                    <Marker
                      key={gym.id}
                      coordinate={{
                        latitude: gym.latitude,
                        longitude: gym.longitude,
                      }}
                      title={gym.name}
                      description={
                        gym.address ?? `${gym.distanceMeters} m away`
                      }
                      pinColor={
                        selectedGymId === gym.id
                          ? "#dc2626"
                          : gym.source === "community"
                            ? "#16a34a"
                            : "#f59e0b"
                      }
                      onPress={() => setSelectedGymId(gym.id)}
                    />
                  ))}
                </MapView>
              ) : (
                <View
                  style={{ height: 290 }}
                  className="items-center justify-center px-4"
                >
                  <Text className="text-gray-500 text-center">
                    Loading your location and nearby gyms...
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="rounded-2xl border border-gray-200 bg-white px-4 py-3 mb-4">
              <Text className="text-sm text-gray-600">
                Map preview is available on iOS/Android. You can still select
                from nearby gyms below.
              </Text>
            </View>
          )}

          <View className="flex-row mb-4">
            <Pressable
              className={`flex-1 rounded-xl py-3 items-center justify-center ${isLoading ? "bg-indigo-300" : "bg-primary"}`}
              onPress={loadNearbyGyms}
              disabled={isLoading || isSaving}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  Refresh Nearby Gyms
                </Text>
              )}
            </Pressable>
          </View>

          {nearbyGyms.length > 0 ? (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">
                Nearby gyms
              </Text>
              {nearbyGyms.slice(0, 14).map((gym) => {
                const isSelected = selectedGymId === gym.id;

                return (
                  <Pressable
                    key={gym.id}
                    className={`rounded-xl border px-4 py-3 mb-2 ${isSelected ? "border-primary bg-indigo-50" : "border-gray-200 bg-white"}`}
                    onPress={() => setSelectedGymId(gym.id)}
                  >
                    <Text
                      className={`font-semibold ${isSelected ? "text-primary" : "text-gray-900"}`}
                    >
                      {gym.name}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {gym.address ?? "Address unavailable"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Source:{" "}
                      {gym.source === "community"
                        ? "Community"
                        : "OpenStreetMap"}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {gym.distanceMeters} m away
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <Pressable
            className={`rounded-xl py-3 items-center justify-center mb-4 ${isSaving || !selectedGym ? "bg-indigo-300" : "bg-primary"}`}
            disabled={isSaving || !selectedGym}
            onPress={handleSaveSelectedGym}
          >
            <Text className="text-white font-semibold">
              {isSaving ? "Saving..." : "Save Selected Gym"}
            </Text>
          </Pressable>

          <View className="bg-white rounded-2xl border border-gray-100 p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Can&apos;t find your gym?
            </Text>
            <TextInput
              className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 mb-3"
              value={customGymName}
              onChangeText={setCustomGymName}
              placeholder="Type your gym name"
            />

            <Pressable
              className={`rounded-xl py-3 items-center justify-center ${isSaving ? "bg-indigo-300" : "bg-gray-800"}`}
              onPress={handleSaveCurrentLocationGym}
              disabled={isSaving}
            >
              <Text className="text-white font-semibold">
                {isSaving ? "Saving..." : "Use Current Location and Save Gym"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GymPickerModal;
