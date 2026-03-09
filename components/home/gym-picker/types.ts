export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DiscoverableGym = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string | null;
  source: "openstreetmap" | "saved";
};

export type FocusedGym = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export const NEARBY_GYM_SEARCH_RADIUS_METERS = 3000;
export const FOCUSED_PIN_COLOR = "#6366f1";

export function dedupeGyms(gyms: DiscoverableGym[]): DiscoverableGym[] {
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
