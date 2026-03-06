import { ApiExercise } from "@/types/api.types";

interface ApiExerciseResult {
  id?: string;
  exerciseId?: string;
  name?: string;
  gifUrl?: string;
  imageUrl?: string;
}

const API_BASE_URL =
  "https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1";
const API_HOST = "edb-with-videos-and-images-by-ascendapi.p.rapidapi.com";

export async function searchExercises(
  query: string,
  signal?: AbortSignal,
): Promise<ApiExercise[]> {
  const rapidApiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!rapidApiKey) {
    throw new Error(
      "RapidAPI key is missing. Please set EXPO_PUBLIC_RAPIDAPI_KEY environment variable.",
    );
  }

  const url = `${API_BASE_URL}/exercises/search?search=${encodeURIComponent(query)}`;
  const options: RequestInit = {
    method: "GET",
    headers: {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": API_HOST,
    },
    signal,
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    console.error(`Exercise search API error: ${response.status}`);
    return [];
  }

  const result = await response.json();

  const rawResults = Array.isArray(result?.data)
    ? (result.data as ApiExerciseResult[])
    : [];

  if (!result?.success || rawResults.length === 0) {
    return [];
  }

  return rawResults
    .map((item) => ({
      exerciseId: item.exerciseId || item.id || "",
      name: item.name || "",
      imageUrl: item.imageUrl || item.gifUrl || "",
    }))
    .filter((item) => Boolean(item.exerciseId) && Boolean(item.name));
}
