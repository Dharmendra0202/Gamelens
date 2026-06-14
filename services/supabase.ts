// Supabase client — single shared instance for the app.
// Credentials come from env (.env.local). See .env.example for keys.
//
// Auth session is persisted in AsyncStorage so the user stays logged in
// across app restarts. Realtime is available for live match scoring sync.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Whether the backend is configured. Until credentials are added, services
// fall back to LocalStorage so the app keeps working offline.
export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase = createClient(
  // Fall back to a harmless placeholder so createClient never throws at boot.
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "public-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
