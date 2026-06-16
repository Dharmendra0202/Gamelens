import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Dropdown } from "@/components/ui/dropdown";
import { useAuth } from "@/hooks/use-auth";
import type {
  BattingStyle,
  BowlingStyle,
  HeightUnit,
  PlayerRole,
} from "@/services/profile";
import { ProfileService } from "@/services/profile";

// ─── Options ────────────────────────────────────────────────────────────────────

const PLAYER_ROLES: PlayerRole[] = [
  "Batsman",
  "Bowler",
  "All-Rounder",
  "Wicket Keeper",
  "Wicket Keeper Batsman",
];

const BATTING_STYLES: BattingStyle[] = ["Right Hand Bat", "Left Hand Bat"];

const BOWLING_STYLES: BowlingStyle[] = [
  "Right Arm Fast",
  "Right Arm Medium",
  "Right Arm Off Spin",
  "Right Arm Leg Spin",
  "Left Arm Fast",
  "Left Arm Medium",
  "Left Arm Orthodox",
  "Left Arm Chinaman",
];

const HEIGHT_UNITS: HeightUnit[] = ["cm", "ft"];

const USERNAME_RE = /^[a-zA-Z0-9_]*$/;

// ─── Component ──────────────────────────────────────────────────────────────────

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, profile: existingProfile, refreshProfile } = useAuth();

  // ── Form state ──
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [weightKg, setWeightKg] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [avatarUri, setAvatarUri] = useState("");
  const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
  const [battingStyle, setBattingStyle] = useState<BattingStyle | null>(null);
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle | null>(null);

  // ── UI state ──
  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // ── Load existing profile ──
  useEffect(() => {
    if (!existingProfile) return;
    const p = existingProfile;
    setFullName(p.full_name);
    setUsername(p.username);
    setPhoneNumber(p.phone_number ?? "");
    setCountryCode(p.country_code ?? "+91");
    setLocation(p.location ?? "");
    setLatitude(p.latitude);
    setLongitude(p.longitude);
    setHeight(p.height != null ? String(p.height) : "");
    setHeightUnit(p.height_unit ?? "cm");
    setWeightKg(p.weight_kg != null ? String(p.weight_kg) : "");
    setDob(p.dob ? new Date(p.dob) : null);
    setAvatarUri(p.avatar_url ?? "");
    setPlayerRole(p.player_role);
    setBattingStyle(p.batting_style);
    setBowlingStyle(p.bowling_style);
  }, [existingProfile]);

  // ── Validation ──
  const canSave = useMemo(
    () => fullName.trim().length > 0 && username.trim().length > 0,
    [fullName, username],
  );

  // ── Determine if role involves batting ──
  const showBattingStyle = useMemo(
    () =>
      playerRole === "Batsman" ||
      playerRole === "All-Rounder" ||
      playerRole === "Wicket Keeper Batsman",
    [playerRole],
  );

  // ── Photo picker ──
  const pickPhoto = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  // ── Location detection ──
  const detectLocation = useCallback(async () => {
    setIsDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is needed to detect your area.",
        );
        return;
      }

      // Timeout after 10s to avoid hanging on emulators/weak GPS
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Location timeout")), 10000),
        ),
      ]);

      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);

      // Reverse geocode to get city/area
      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address) {
        const parts = [address.subregion, address.city, address.region].filter(
          Boolean,
        );
        setLocation(parts.join(", "));
      }
    } catch (err: any) {
      console.warn("[Profile] Location detection failed:", err?.message ?? err);
      Alert.alert(
        "Location unavailable",
        "Could not detect your location. Please type your city/area manually.",
      );
    } finally {
      setIsDetectingLocation(false);
    }
  }, []);

  // ── Username handler ──
  const handleUsernameChange = useCallback((value: string) => {
    if (USERNAME_RE.test(value)) {
      setUsername(value.toLowerCase());
    }
  }, []);

  // ── Save ──
  const handleSave = async () => {
    if (!canSave || !user) return;

    // Validate username uniqueness
    const available = await ProfileService.isUsernameAvailable(
      username.trim(),
      user.id,
    );
    if (!available) {
      Alert.alert(
        "Username taken",
        "That username is already in use. Pick another.",
      );
      return;
    }

    setIsSaving(true);
    try {
      // Upload avatar if it's a local file (non-blocking — save profile even if upload fails)
      let avatarUrl = existingProfile?.avatar_url ?? null;
      if (avatarUri && !avatarUri.startsWith("http")) {
        const { url, error: uploadErr } = await ProfileService.uploadAvatar(
          user.id,
          avatarUri,
        );
        if (uploadErr) {
          // Warn but don't block — profile data still saves
          console.warn("[Profile] Avatar upload failed:", uploadErr);
          Alert.alert(
            "Photo upload failed",
            "Your profile will be saved without the photo. You can try uploading again later.\n\nReason: " +
              uploadErr,
          );
          // Keep existing avatar URL if any
        } else {
          avatarUrl = url;
        }
      } else if (avatarUri && avatarUri.startsWith("http")) {
        avatarUrl = avatarUri;
      }

      const updates = {
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        phone_number: phoneNumber.trim() || null,
        country_code: countryCode,
        location: location.trim() || null,
        latitude,
        longitude,
        height: height ? parseFloat(height) : null,
        height_unit: heightUnit,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        dob: dob ? dob.toISOString().split("T")[0] : null,
        avatar_url: avatarUrl,
        player_role: playerRole,
        batting_style: showBattingStyle ? battingStyle : null,
        bowling_style: bowlingStyle,
      };

      const { error } = await ProfileService.update(user.id, updates);

      if (error) {
        Alert.alert("Error", error);
        return;
      }

      await refreshProfile();
      Alert.alert("Profile saved!", "Your cricket profile is ready.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Initials for avatar placeholder ──
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  // ── DOB display ──
  const dobDisplay = dob
    ? `${dob.getDate().toString().padStart(2, "0")}/${(dob.getMonth() + 1).toString().padStart(2, "0")}/${dob.getFullYear()}`
    : "";

  // ── Stats from existing profile ──
  const stats = existingProfile
    ? {
        friends: existingProfile.friends_count,
        posts: existingProfile.posts_count,
        matches: existingProfile.matches_played,
      }
    : { friends: 0, posts: 0, matches: 0 };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#00A66A", "#0F766E", "#064E3B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Setup</Text>
        <View style={{ width: 22 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar ── */}
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={pickPhoto}
            activeOpacity={0.85}
          >
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={15} color="#FFF" />
            </View>
          </TouchableOpacity>

          {/* ── Stats Row ── */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.friends}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.matches}</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
          </View>

          {/* ── Section: Personal Information ── */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Full Name<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Username<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="alphanumeric_underscore"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={handleUsernameChange}
              autoCapitalize="none"
              maxLength={20}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.input, styles.countryCodeInput]}
                value={countryCode}
                onChangeText={setCountryCode}
                keyboardType="phone-pad"
                maxLength={4}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="XXXXXXXXXX"
                placeholderTextColor="#94A3B8"
                value={phoneNumber}
                onChangeText={(t) => setPhoneNumber(t.replace(/[^0-9]/g, ""))}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="City / Area"
                placeholderTextColor="#94A3B8"
                value={location}
                onChangeText={setLocation}
              />
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={detectLocation}
                disabled={isDetectingLocation}
                activeOpacity={0.7}
              >
                {isDetectingLocation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="locate" size={18} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Height */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Height</Text>
            <View style={styles.phoneRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={heightUnit === "cm" ? "e.g. 175" : "e.g. 5.9"}
                placeholderTextColor="#94A3B8"
                value={height}
                onChangeText={(t) => setHeight(t.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
              />
              <Dropdown<HeightUnit>
                label=""
                value={heightUnit}
                options={HEIGHT_UNITS}
                onSelect={setHeightUnit}
              />
            </View>
          </View>

          {/* Weight */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 72"
              placeholderTextColor="#94A3B8"
              value={weightKg}
              onChangeText={(t) => setWeightKg(t.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Date of Birth */}
          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDobPicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.inputText, !dobDisplay && styles.placeholder]}
              >
                {dobDisplay || "DD/MM/YYYY"}
              </Text>
            </TouchableOpacity>
            {showDobPicker && (
              <DateTimePicker
                value={dob ?? new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                maximumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDobPicker(Platform.OS === "ios");
                  if (selected) setDob(selected);
                }}
              />
            )}
          </View>

          {/* ── Section: Cricket Profile ── */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
            Cricket Profile
          </Text>

          <Dropdown<PlayerRole>
            label="Player Role"
            value={playerRole}
            options={PLAYER_ROLES}
            onSelect={setPlayerRole}
          />

          {showBattingStyle && (
            <Dropdown<BattingStyle>
              label="Batting Style"
              value={battingStyle}
              options={BATTING_STYLES}
              onSelect={setBattingStyle}
            />
          )}

          <Dropdown<BowlingStyle>
            label="Bowling Style"
            value={bowlingStyle}
            options={BOWLING_STYLES}
            onSelect={setBowlingStyle}
          />
        </ScrollView>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!canSave || isSaving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!canSave || isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F7F4" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { padding: 2 },
  headerTitle: { color: "#FFF", fontSize: 18, fontWeight: "800" },
  content: { padding: 16, paddingBottom: 24 },

  // Avatar
  avatarWrap: { alignSelf: "center", marginBottom: 16 },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D1FAE5",
  },
  avatarPlaceholder: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 34, fontWeight: "800", color: "#00A66A" },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00A66A",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2EAE6",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },
  statDivider: { width: 1, height: 32, backgroundColor: "#E2EAE6" },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    marginTop: 4,
  },

  // Fields
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 8 },
  required: { color: "#DC2626" },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2EAE6",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  inputText: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  placeholder: { color: "#94A3B8" },
  phoneRow: { flexDirection: "row", gap: 10 },
  countryCodeInput: { width: 64, textAlign: "center" },
  locationRow: { flexDirection: "row", gap: 10 },
  gpsButton: {
    width: 48,
    borderRadius: 14,
    backgroundColor: "#00A66A",
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2EAE6",
    backgroundColor: "#FFF",
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00A66A",
    borderRadius: 18,
    paddingVertical: 16,
  },
  saveButtonDisabled: { backgroundColor: "#CBD5E1" },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
