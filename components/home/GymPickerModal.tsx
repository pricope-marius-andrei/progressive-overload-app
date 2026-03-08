import { findNearbyGyms, NearbyGym } from "@/contexts/home/gym-search.service";
import {
    deleteKnownGymPlace,
    fetchMyGyms,
    fetchNearbyKnownGyms,
    SavedGymPlace,
    saveKnownGymPlace,
} from "@/contexts/home/home.repository";
import { getCurrentDeviceCoordinates } from "@/utils/location";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    LayoutChangeEvent,
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

type DiscoverableGym = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string | null;
  source: "openstreetmap" | "saved";
};

type FocusedGym = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

const NEARBY_GYM_SEARCH_RADIUS_METERS = 3000;
const FOCUSED_PIN_COLOR = "#6366f1";

function dedupeGyms(gyms: DiscoverableGym[]): DiscoverableGym[] {
  const seen = new Set<string>();
  const deduped: DiscoverableGym[] = [];

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
  const [customGymName, setCustomGymName] = useState("");
  const [deviceCoordinates, setDeviceCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [nearbyGyms, setNearbyGyms] = useState<DiscoverableGym[]>([]);
  const [myGyms, setMyGyms] = useState<SavedGymPlace[]>([]);
  const [focusedGym, setFocusedGym] = useState<FocusedGym | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const mapSectionTopRef = useRef(0);

  const mapCenter = useMemo(() => {
    if (focusedGym) {
      return {
        latitude: focusedGym.latitude,
        longitude: focusedGym.longitude,
      };
    }

    if (deviceCoordinates) {
      return {
        latitude: deviceCoordinates.latitude,
        longitude: deviceCoordinates.longitude,
      };
    }

    return nearbyGyms[0]
      ? {
          latitude: nearbyGyms[0].latitude,
          longitude: nearbyGyms[0].longitude,
        }
      : null;
  }, [deviceCoordinates, focusedGym, nearbyGyms]);

  const focusMapOnGym = useCallback((gym: FocusedGym) => {
    const nextRegion = {
      latitude: gym.latitude,
      longitude: gym.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };

    setFocusedGym(gym);
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, mapSectionTopRef.current - 8),
      animated: true,
    });
    mapRef.current?.animateToRegion(nextRegion, 450);
  }, []);

  const handleMapSectionLayout = useCallback((event: LayoutChangeEvent) => {
    mapSectionTopRef.current = event.nativeEvent.layout.y;
  }, []);

  const loadNearbyGyms = useCallback(async () => {
    setIsLoading(true);
    try {
      const coordinates = await getCurrentDeviceCoordinates();
      if (!coordinates) {
        Alert.alert(
          "Location Required",
          "Please allow location access to discover gyms near you.",
        );
        return;
      }

      setDeviceCoordinates(coordinates);

      const [openStreetGyms, nearbySavedGyms, savedGymsList] =
        await Promise.all([
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
          fetchMyGyms(),
        ]);

      const normalizedOpenStreetGyms: DiscoverableGym[] = openStreetGyms.map(
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

      const normalizedSavedGyms: DiscoverableGym[] = nearbySavedGyms.map(
        (gym) => ({
          id: `saved:${gym.id}`,
          name: gym.name,
          latitude: gym.latitude,
          longitude: gym.longitude,
          distanceMeters: gym.distanceMeters,
          address: "Saved in your gyms list",
          source: "saved",
        }),
      );

      const dedupedGyms = dedupeGyms([
        ...normalizedSavedGyms,
        ...normalizedOpenStreetGyms,
      ]);

      setNearbyGyms(dedupedGyms);
      setMyGyms(savedGymsList);
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

  const handleAddGymToList = useCallback(
    async (gym: DiscoverableGym) => {
      if (gym.source === "saved") {
        return;
      }

      setIsSaving(true);
      try {
        await saveKnownGymPlace({
          name: gym.name,
          latitude: gym.latitude,
          longitude: gym.longitude,
        });

        if (onSaved) {
          await onSaved();
        }

        await loadNearbyGyms();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Error adding gym to list:", message);
        Alert.alert("Error", "Unable to add this gym to your list.");
      } finally {
        setIsSaving(false);
      }
    },
    [loadNearbyGyms, onSaved],
  );

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

      if (onSaved) {
        await onSaved();
      }

      await loadNearbyGyms();
      setCustomGymName("");
      Alert.alert("Saved", `${normalizedGymName} added to your gyms list.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Error saving current-location gym:", message);
      Alert.alert("Error", "Unable to save your current-location gym.");
    } finally {
      setIsSaving(false);
    }
  }, [customGymName, deviceCoordinates, loadNearbyGyms, onSaved]);

  const handleRemoveGym = useCallback(
    (gym: SavedGymPlace) => {
      Alert.alert("Remove gym", `Remove ${gym.name} from My Gyms?`, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsSaving(true);
              try {
                await deleteKnownGymPlace(gym.id);

                if (onSaved) {
                  await onSaved();
                }

                await loadNearbyGyms();
              } catch (error: unknown) {
                const message =
                  error instanceof Error ? error.message : String(error);
                console.error("Error removing gym:", message);
                Alert.alert("Error", "Unable to remove gym.");
              } finally {
                setIsSaving(false);
              }
            })();
          },
        },
      ]);
    },
    [loadNearbyGyms, onSaved],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50">
        <View className="px-5 pt-5 pb-3 flex-row items-center justify-between bg-white border-b border-gray-100">
          <Text className="text-xl font-bold text-gray-900">Nearby Gyms</Text>
          <Pressable onPress={onClose}>
            <Text className="text-primary font-semibold">Close</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {Platform.OS !== "web" ? (
            <View
              className="rounded-2xl overflow-hidden border border-gray-200 mb-4 bg-white"
              onLayout={handleMapSectionLayout}
            >
              {mapCenter ? (
                <MapView
                  ref={mapRef}
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
                        focusedGym?.id === gym.id
                          ? FOCUSED_PIN_COLOR
                          : gym.source === "saved"
                            ? "#16a34a"
                            : "#6366f1"
                      }
                    />
                  ))}

                  {focusedGym &&
                  !nearbyGyms.some((gym) => gym.id === focusedGym.id) ? (
                    <Marker
                      coordinate={{
                        latitude: focusedGym.latitude,
                        longitude: focusedGym.longitude,
                      }}
                      title={focusedGym.name}
                      description="Focused gym"
                      pinColor={FOCUSED_PIN_COLOR}
                    />
                  ) : null}
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
            <View
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 mb-4"
              onLayout={handleMapSectionLayout}
            >
              <Text className="text-sm text-gray-600">
                Map preview is available on iOS/Android. You can still browse
                nearby gyms below.
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

          <View className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              My Gyms
            </Text>

            {myGyms.length === 0 ? (
              <Text className="text-sm text-gray-600">
                No gyms saved yet. Add from nearby gyms or save your current
                location.
              </Text>
            ) : (
              myGyms.map((gym) => (
                <View
                  key={`my-gym:${gym.id}`}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 mb-2"
                >
                  <Pressable
                    onPress={() =>
                      focusMapOnGym({
                        id: `saved:${gym.id}`,
                        name: gym.name,
                        latitude: gym.latitude,
                        longitude: gym.longitude,
                      })
                    }
                  >
                    <Text className="font-semibold text-gray-900">
                      {gym.name}
                    </Text>
                    <Text className="text-xs text-primary mt-1">
                      Tap to focus on map
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      {gym.latitude.toFixed(5)}, {gym.longitude.toFixed(5)}
                    </Text>
                  </Pressable>

                  <Pressable
                    className={`mt-2 rounded-lg py-2 items-center justify-center ${isSaving ? "bg-gray-300" : "bg-gray-800"}`}
                    disabled={isSaving}
                    onPress={() => handleRemoveGym(gym)}
                  >
                    <Text className="text-white font-semibold text-xs">
                      Remove
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>

          {nearbyGyms.length > 0 ? (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-900 mb-2">
                Nearby gyms
              </Text>
              {nearbyGyms.slice(0, 14).map((gym) => {
                const isSavedGym = gym.source === "saved";

                return (
                  <View
                    key={gym.id}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-3 mb-2"
                  >
                    <Pressable
                      onPress={() =>
                        focusMapOnGym({
                          id: gym.id,
                          name: gym.name,
                          latitude: gym.latitude,
                          longitude: gym.longitude,
                        })
                      }
                    >
                      <Text className="font-semibold text-gray-900">
                        {gym.name}
                      </Text>
                      <Text className="text-xs text-primary mt-1">
                        Tap to focus on map
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {gym.address ?? "Address unavailable"}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1">
                        {isSavedGym ? "In your gyms list" : "Discovered nearby"}
                      </Text>
                      <Text className="text-xs text-gray-500 mt-1 mb-2">
                        {gym.distanceMeters} m away
                      </Text>
                    </Pressable>

                    <Pressable
                      className={`rounded-lg py-2 items-center justify-center ${isSavedGym || isSaving ? "bg-gray-300" : "bg-primary"}`}
                      disabled={isSavedGym || isSaving}
                      onPress={() => {
                        void handleAddGymToList(gym);
                      }}
                    >
                      <Text className="text-white font-semibold text-xs">
                        {isSavedGym ? "Saved" : "Add to My Gyms"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
              <Text className="text-sm text-gray-600">
                No gyms found nearby yet. Try refresh or save your current
                location as a gym.
              </Text>
            </View>
          )}

          <View className="bg-white rounded-2xl border border-gray-100 p-4">
            <Text className="text-sm font-semibold text-gray-900 mb-2">
              Add current location as gym
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
                {isSaving ? "Saving..." : "Save Current Location Gym"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default GymPickerModal;
