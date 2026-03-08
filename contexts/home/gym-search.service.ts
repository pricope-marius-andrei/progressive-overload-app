export type NearbyGym = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  address: string | null;
};

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string | undefined>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

const toRadians = (value: number): number => (value * Math.PI) / 180;

const calculateDistanceMeters = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number => {
  const EARTH_RADIUS_METERS = 6371000;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const latitudeARad = toRadians(latitudeA);
  const latitudeBRad = toRadians(latitudeB);

  const a =
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
    Math.cos(latitudeARad) *
      Math.cos(latitudeBRad) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

const formatAddress = (
  tags: Record<string, string | undefined>,
): string | null => {
  const street = tags["addr:street"];
  const houseNumber = tags["addr:housenumber"];
  const city = tags["addr:city"];

  const streetPart = [street, houseNumber].filter(Boolean).join(" ").trim();
  const address = [streetPart, city].filter(Boolean).join(", ").trim();

  return address || null;
};

function buildOverpassQuery(
  latitude: number,
  longitude: number,
  radiusMeters: number,
): string {
  return `
[out:json][timeout:25];
(
  node["amenity"="gym"](around:${radiusMeters},${latitude},${longitude});
  way["amenity"="gym"](around:${radiusMeters},${latitude},${longitude});
  relation["amenity"="gym"](around:${radiusMeters},${latitude},${longitude});
  node["leisure"="fitness_centre"](around:${radiusMeters},${latitude},${longitude});
  way["leisure"="fitness_centre"](around:${radiusMeters},${latitude},${longitude});
  relation["leisure"="fitness_centre"](around:${radiusMeters},${latitude},${longitude});
);
out center tags;
`;
}

export async function findNearbyGyms(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  signal?: AbortSignal;
}): Promise<NearbyGym[]> {
  const radiusMeters = Math.max(
    500,
    Math.min(5000, Math.round(input.radiusMeters ?? 3000)),
  );
  const query = buildOverpassQuery(
    input.latitude,
    input.longitude,
    radiusMeters,
  );

  const response = await fetch(OVERPASS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: query,
    signal: input.signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch nearby gyms. HTTP ${response.status}`);
  }

  const payload = (await response.json()) as OverpassResponse;
  const elements = Array.isArray(payload.elements) ? payload.elements : [];

  const gyms: NearbyGym[] = [];
  const dedupeKeys = new Set<string>();

  for (const element of elements) {
    const latitudeCandidate = element.lat ?? element.center?.lat;
    const longitudeCandidate = element.lon ?? element.center?.lon;

    if (
      typeof latitudeCandidate !== "number" ||
      !Number.isFinite(latitudeCandidate) ||
      typeof longitudeCandidate !== "number" ||
      !Number.isFinite(longitudeCandidate)
    ) {
      continue;
    }

    const latitude = latitudeCandidate;
    const longitude = longitudeCandidate;

    const tags = element.tags ?? {};
    const name = (tags.name || tags.brand || "Unnamed gym").trim();
    const dedupeKey = `${name.toLowerCase()}|${latitude.toFixed(5)}|${longitude.toFixed(5)}`;
    if (dedupeKeys.has(dedupeKey)) {
      continue;
    }

    dedupeKeys.add(dedupeKey);

    gyms.push({
      id: `${element.id}-${latitude}-${longitude}`,
      name,
      latitude,
      longitude,
      distanceMeters: Math.round(
        calculateDistanceMeters(
          input.latitude,
          input.longitude,
          latitude,
          longitude,
        ),
      ),
      address: formatAddress(tags),
    });
  }

  return gyms
    .sort((left, right) => left.distanceMeters - right.distanceMeters)
    .slice(0, 30);
}
