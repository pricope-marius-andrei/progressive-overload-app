import AsyncStorage from "@react-native-async-storage/async-storage";

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

const OVERPASS_API_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
] as const;

const OVERPASS_CACHE_KEY_PREFIX = "nearby-gyms-v1";
const OVERPASS_CACHE_TTL_MS = 1000 * 60 * 8;
const OVERPASS_CACHE_BUCKET_DECIMALS = 3;

type NearbyGymsCachePayload = {
  cachedAt: number;
  gyms: NearbyGym[];
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const buildNearbyGymsCacheKey = (input: {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}): string => {
  // Bucket coordinates so very small GPS jitter still maps to the same cache key.
  const latitudeBucket = input.latitude.toFixed(OVERPASS_CACHE_BUCKET_DECIMALS);
  const longitudeBucket = input.longitude.toFixed(
    OVERPASS_CACHE_BUCKET_DECIMALS,
  );

  return `${OVERPASS_CACHE_KEY_PREFIX}:${latitudeBucket}:${longitudeBucket}:${input.radiusMeters}`;
};

const isNearbyGym = (value: unknown): value is NearbyGym => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const gym = value as Record<string, unknown>;

  return (
    typeof gym.id === "string" &&
    typeof gym.name === "string" &&
    typeof gym.latitude === "number" &&
    Number.isFinite(gym.latitude) &&
    typeof gym.longitude === "number" &&
    Number.isFinite(gym.longitude) &&
    typeof gym.distanceMeters === "number" &&
    Number.isFinite(gym.distanceMeters) &&
    (gym.address === null || typeof gym.address === "string")
  );
};

async function readNearbyGymsCache(input: {
  cacheKey: string;
  allowExpired: boolean;
}): Promise<NearbyGym[] | null> {
  try {
    const rawValue = await AsyncStorage.getItem(input.cacheKey);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<NearbyGymsCachePayload>;
    if (
      typeof parsed.cachedAt !== "number" ||
      !Array.isArray(parsed.gyms) ||
      !parsed.gyms.every((item) => isNearbyGym(item))
    ) {
      return null;
    }

    const cacheAgeMs = Date.now() - parsed.cachedAt;
    const isExpired = cacheAgeMs > OVERPASS_CACHE_TTL_MS;

    if (isExpired && !input.allowExpired) {
      return null;
    }

    return parsed.gyms;
  } catch {
    return null;
  }
}

async function writeNearbyGymsCache(input: {
  cacheKey: string;
  gyms: NearbyGym[];
}): Promise<void> {
  try {
    const payload: NearbyGymsCachePayload = {
      cachedAt: Date.now(),
      gyms: input.gyms,
    };

    await AsyncStorage.setItem(input.cacheKey, JSON.stringify(payload));
  } catch {
    // Caching should never block or fail the nearby gyms flow.
  }
}

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

async function fetchOverpassWithFallback(input: {
  query: string;
  signal?: AbortSignal;
}): Promise<OverpassResponse> {
  let lastStatus: number | null = null;
  let lastErrorMessage = "Unable to fetch nearby gyms.";

  for (const endpoint of OVERPASS_API_URLS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: input.query,
        signal: input.signal,
      });

      if (response.ok) {
        return (await response.json()) as OverpassResponse;
      }

      lastStatus = response.status;
      lastErrorMessage = `Unable to fetch nearby gyms. HTTP ${response.status}`;

      // Retry with other Overpass mirrors for transient or rate-limit responses.
      if (
        response.status === 429 ||
        response.status === 504 ||
        response.status >= 500
      ) {
        continue;
      }

      throw new Error(lastErrorMessage);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      lastErrorMessage = message;
    }
  }

  if (lastStatus === 429) {
    throw new Error(
      "Nearby gyms service is rate-limited right now (HTTP 429). Please try again shortly.",
    );
  }

  if (lastStatus === 504) {
    throw new Error(
      "Nearby gyms service timed out (HTTP 504). Please try again shortly.",
    );
  }

  throw new Error(lastErrorMessage);
}

export async function findNearbyGyms(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  forceRefresh?: boolean;
  signal?: AbortSignal;
}): Promise<NearbyGym[]> {
  const radiusMeters = Math.max(
    500,
    Math.min(5000, Math.round(input.radiusMeters ?? 3000)),
  );
  const cacheKey = buildNearbyGymsCacheKey({
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMeters,
  });

  if (!input.forceRefresh) {
    const freshCache = await readNearbyGymsCache({
      cacheKey,
      allowExpired: false,
    });

    if (freshCache) {
      return freshCache;
    }
  }

  const query = buildOverpassQuery(
    input.latitude,
    input.longitude,
    radiusMeters,
  );

  try {
    const payload = await fetchOverpassWithFallback({
      query,
      signal: input.signal,
    });
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

    const normalizedGyms = gyms
      .sort((left, right) => left.distanceMeters - right.distanceMeters)
      .slice(0, 30);

    await writeNearbyGymsCache({
      cacheKey,
      gyms: normalizedGyms,
    });

    return normalizedGyms;
  } catch (error: unknown) {
    const staleCache = await readNearbyGymsCache({
      cacheKey,
      allowExpired: true,
    });

    if (staleCache) {
      return staleCache;
    }

    throw error;
  }
}
