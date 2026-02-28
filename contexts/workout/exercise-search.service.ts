import { ApiExercise } from "@/types/mappers/workout.mapper";

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

export async function searchExercises(query: string): Promise<ApiExercise[]> {
  const rapidApiKey = process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
  if (!rapidApiKey) {
    throw new Error(
      "RapidAPI key is missing. Please set EXPO_PUBLIC_RAPIDAPI_KEY environment variable.",
    );
  }

  const url = `${API_BASE_URL}/exercises/search?search=${encodeURIComponent(query)}`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": rapidApiKey,
      "x-rapidapi-host": API_HOST,
    },
  };

  const response = await fetch(url, options);
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
