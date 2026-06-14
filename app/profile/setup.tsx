import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
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
import { LocalStorage } from "@/services/storage";
import type { BattingPosition, BowlingStyle, User } from "@/types";

const BATTING_OPTIONS: BattingPosition[] = [
  "Opener",
  "Middle Order",
  "Lower Order",
  "Tailender",
];

const BOWLING_OPTIONS: BowlingStyle[] = [
  "Right Arm Fast",
  "Right Arm Medium",
  "Right Arm Off Spin",
  "Right Arm Leg Spin",
  "Left Arm Fast",
  "Left Arm Medium",
  "Left Arm Orthodox",
  "Left Arm Chinaman",
  "None",
];

const USERNAME_RE = /^[a-zA-Z0-9_]*$/;

export default function ProfileSetupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [battingStyle, setBattingStyle] = useState<BattingPosition | null>(
    null,
  );
  const [bowlingStyle, setBowlingStyle] = useState<BowlingStyle | null>(null);
  const [photo, setPhoto] = useState("");
  const [city, setCity] = useState("");

  // Load any existing profile so the form pre-fills.
  useEffect(() => {
    LocalStorage.getProfile().then((profile) => {
      if (!profile) return;
      setFullName(profile.fullName);
      setUsername(profile.username);
      setBattingStyle(profile.battingStyle ?? null);
      setBowlingStyle(profile.bowlingStyle ?? null);
      setPhoto(profile.profilePhoto ?? "");
      setCity(profile.city ?? "");
    });
  }, []);

  const canSave = useMemo(
    () => fullName.trim().length > 0 && username.trim().length > 0,
    [fullName, username],
  );

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleUsernameChange = (value: string) => {
    if (USERNAME_RE.test(value)) {
      setUsername(value);
    }
  };

  const handleSave = async () => {
    if (!canSave) return;

    const profile: User = {
      id: `local-${Date.now()}`,
      username: username.trim(),
      fullName: fullName.trim(),
      profilePhoto: photo || undefined,
      city: city.trim() || undefined,
      battingStyle: battingStyle ?? undefined,
      bowlingStyle: bowlingStyle ?? undefined,
      createdAt: new Date().toISOString(),
    };

    // TODO(backend): POST /api/users/profile — replace AsyncStorage with API call
    await LocalStorage.saveProfile(profile);
    Alert.alert("Profile saved", "Your cricket profile is ready.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

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
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={pickPhoto}
            activeOpacity={0.85}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={15} color="#FFF" />
            </View>
          </TouchableOpacity>

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

          <Dropdown<BattingPosition>
            label="Preferred Batting Position"
            value={battingStyle}
            options={BATTING_OPTIONS}
            onSelect={setBattingStyle}
          />

          <Dropdown<BowlingStyle>
            label="Preferred Bowling Style"
            value={bowlingStyle}
            options={BOWLING_OPTIONS}
            onSelect={setBowlingStyle}
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Location / City</Text>
            <TextInput
              style={styles.input}
              placeholder="Your city"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F7F4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    padding: 2,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  avatarWrap: {
    alignSelf: "center",
    marginBottom: 24,
  },
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
  avatarInitials: {
    fontSize: 34,
    fontWeight: "800",
    color: "#00A66A",
  },
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
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },
  required: {
    color: "#DC2626",
  },
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
  saveButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
