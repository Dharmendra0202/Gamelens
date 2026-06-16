// Profile service — handles all Supabase interactions for the profiles table.
import { supabase } from "@/lib/supabase";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type PlayerRole =
  | "Batsman"
  | "Bowler"
  | "All-Rounder"
  | "Wicket Keeper"
  | "Wicket Keeper Batsman";

export type BattingStyle = "Right Hand Bat" | "Left Hand Bat";

export type BowlingStyle =
  | "Right Arm Fast"
  | "Right Arm Medium"
  | "Right Arm Off Spin"
  | "Right Arm Leg Spin"
  | "Left Arm Fast"
  | "Left Arm Medium"
  | "Left Arm Orthodox"
  | "Left Arm Chinaman";

export type HeightUnit = "cm" | "ft";

export interface Profile {
  id: string;
  full_name: string;
  username: string;
  phone_number: string | null;
  country_code: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  height: number | null;
  height_unit: HeightUnit;
  weight_kg: number | null;
  dob: string | null; // ISO date string YYYY-MM-DD
  avatar_url: string | null;
  player_role: PlayerRole | null;
  batting_style: BattingStyle | null;
  bowling_style: BowlingStyle | null;
  matches_played: number;
  friends_count: number;
  posts_count: number;
  created_at: string;
  updated_at: string;
}

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;
export type ProfileUpdate = Partial<
  Omit<Profile, "id" | "created_at" | "updated_at">
>;

// ─── Service ────────────────────────────────────────────────────────────────────

export const ProfileService = {
  /**
   * Create a new profile row. Called once after signup.
   */
  async create(
    data: ProfileInsert,
  ): Promise<{ data: Profile | null; error: string | null }> {
    const { data: row, error } = await supabase
      .from("profiles")
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error("[ProfileService.create]", error.message);
      return { data: null, error: error.message };
    }

    return { data: row as Profile, error: null };
  },

  /**
   * Fetch profile by user ID.
   */
  async get(
    userId: string,
  ): Promise<{ data: Profile | null; error: string | null }> {
    const { data: row, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // PGRST116 = no rows found — not a real error, just means profile doesn't exist yet
      if (error.code === "PGRST116") {
        return { data: null, error: null };
      }
      console.error("[ProfileService.get]", error.message);
      return { data: null, error: error.message };
    }

    return { data: row as Profile, error: null };
  },

  /**
   * Update profile fields. Creates the row if it doesn't exist (upsert).
   */
  async update(
    userId: string,
    updates: ProfileUpdate,
  ): Promise<{ data: Profile | null; error: string | null }> {
    // Upsert: insert if missing, update if exists
    const { data: row, error } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, ...updates, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      )
      .select()
      .single();

    if (error) {
      console.error("[ProfileService.update]", error.message);
      return { data: null, error: error.message };
    }

    return { data: row as Profile, error: null };
  },

  /**
   * Upload avatar image to Supabase Storage and return public URL.
   * Uses React Native-compatible FormData approach.
   */
  async uploadAvatar(
    userId: string,
    uri: string,
  ): Promise<{ url: string | null; error: string | null }> {
    try {
      console.log("[ProfileService.uploadAvatar] Starting upload:", {
        userId,
        uri: uri.substring(0, 80),
        supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ? "set" : "MISSING",
      });

      const fileExt =
        uri.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "jpg";
      const filePath = `${userId}/avatar.${fileExt}`;
      const contentType = fileExt === "png" ? "image/png" : "image/jpeg";

      // React Native: read file as arraybuffer via fetch (works with file:// URIs)
      const response = await fetch(uri);
      if (!response.ok) {
        return {
          url: null,
          error: `Failed to read image file (status ${response.status})`,
        };
      }
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      console.log(
        "[ProfileService.uploadAvatar] File read OK, size:",
        fileData.byteLength,
      );

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("avatars")
        .upload(filePath, fileData, {
          cacheControl: "3600",
          upsert: true,
          contentType,
        });

      if (uploadError) {
        console.error(
          "[ProfileService.uploadAvatar] Supabase error:",
          uploadError.message,
          uploadError,
        );
        return { url: null, error: uploadError.message };
      }

      console.log("[ProfileService.uploadAvatar] Upload success:", uploadData);

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      return { url: publicUrlData.publicUrl, error: null };
    } catch (err: any) {
      console.error(
        "[ProfileService.uploadAvatar] Exception:",
        err?.message ?? err,
      );
      return {
        url: null,
        error: `Upload failed: ${err?.message ?? "Network error"}`,
      };
    }
  },

  /**
   * Increment a stat field (matches_played, friends_count, posts_count).
   */
  async incrementStat(
    userId: string,
    field: "matches_played" | "friends_count" | "posts_count",
    amount: number = 1,
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.rpc("increment_profile_stat", {
      user_id: userId,
      stat_field: field,
      amount,
    });

    if (error) {
      console.error("[ProfileService.incrementStat]", error.message);
      return { error: error.message };
    }

    return { error: null };
  },

  /**
   * Check if username is available.
   */
  async isUsernameAvailable(
    username: string,
    excludeUserId?: string,
  ): Promise<boolean> {
    let query = supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase());

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data } = await query;
    return !data || data.length === 0;
  },
};
