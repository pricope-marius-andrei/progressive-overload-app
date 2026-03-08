import * as Location from "expo-location";

export type DeviceCoordinates = {
  latitude: number;
  longitude: number;
};

export async function getCurrentDeviceCoordinates(): Promise<DeviceCoordinates | null> {
  try {
    const existingPermission = await Location.getForegroundPermissionsAsync();
    let permissionStatus = existingPermission.status;

    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
      const requestedPermission =
        await Location.requestForegroundPermissionsAsync();
      permissionStatus = requestedPermission.status;
    }

    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
      return null;
    }

    const lastKnownPosition = await Location.getLastKnownPositionAsync();
    if (lastKnownPosition) {
      return {
        latitude: lastKnownPosition.coords.latitude,
        longitude: lastKnownPosition.coords.longitude,
      };
    }

    const currentPosition = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving device coordinates:", message);
    return null;
  }
}
