import { Database } from "@/types/database.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

const fallbackSupabaseUrl = "https://placeholder.supabase.co";
const fallbackSupabaseKey = "missing-expo-public-supabase-key";

export const SUPABASE_CONFIG_ERROR =
  !supabaseUrl || !supabaseKey
    ? "Missing Supabase environment variables. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY are set for this build."
    : null;

if (SUPABASE_CONFIG_ERROR) {
  console.error(SUPABASE_CONFIG_ERROR);
}

export const supabase = createClient<Database>(
  supabaseUrl ?? fallbackSupabaseUrl,
  supabaseKey ?? fallbackSupabaseKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  },
);
