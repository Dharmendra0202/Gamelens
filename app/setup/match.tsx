import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import type { MatchType, TeamSide, TossChoice } from "@/types";

export default function MatchSetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    teamA?: string;
    teamB?: string;
    playersA?: string;
    playersB?: string;
  }>();

  const teamA = params.teamA ?? "Team A";
  const teamB = params.teamB ?? "Team B";

  const [overs, setOvers] = useState("");
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [tossChoice, setTossChoice] = useState<TossChoice | null>(null);
  const [venue, setVenue] = useState("");
  const [matchType, setMatchType] = useState<MatchType | null>(null);
  const [matchDate, setMatchDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const oversNum = parseInt(overs, 10);
  const oversValid =
    Number.isInteger(oversNum) && oversNum >= 1 && oversNum <= 50;

  const canProceed = useMemo(
    () => oversValid && !!tossWinner && !!tossChoice && !!matchType,
    [oversValid, tossWinner, tossChoice, matchType],
  );

  const handleSubmit = () => {
    if (!oversValid) {
      Alert.alert("Invalid overs", "Total overs must be a whole number 1-50.");
      return;
    }
    if (!tossWinner || !tossChoice || !matchType) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }

    const tossWinnerSide: TeamSide = tossWinner === teamA ? "teamA" : "teamB";

    router.push({
      pathname: "/(tabs)/my-cricket",
      params: {
        startScoring: "1",
        teamA,
        teamB,
        playersA: params.playersA ?? "[]",
        playersB: params.playersB ?? "[]",
        overs: String(oversNum),
        venue: venue.trim(),
        matchType,
        tossWinner: tossWinnerSide,
        tossChoice,
        matchDate: matchDate.toISOString(),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <LinearGradient
        colors={["#B71C1C", "#8B0000", "#8B0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Match Setup</Text>
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
          <View style={styles.matchupCard}>
            <Text style={styles.matchupText}>{teamA}</Text>
            <Text style={styles.vs}>vs</Text>
            <Text style={styles.matchupText}>{teamB}</Text>
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Total Overs<Text style={styles.required}> *</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                overs.length > 0 && !oversValid && styles.inputError,
              ]}
              placeholder="1 - 50"
              placeholderTextColor="#9E9E9E"
              keyboardType="number-pad"
              value={overs}
              onChangeText={(t) => setOvers(t.replace(/[^0-9]/g, ""))}
              maxLength={2}
            />
            {overs.length > 0 && !oversValid ? (
              <Text style={styles.errorText}>
                Enter a whole number between 1 and 50.
              </Text>
            ) : null}
          </View>

          <Dropdown
            label="Toss Winner"
            required
            value={tossWinner}
            options={[teamA, teamB]}
            onSelect={setTossWinner}
          />

          <Dropdown<TossChoice>
            label="Toss Choice"
            required
            value={tossChoice}
            options={["bat", "bowl"]}
            onSelect={setTossChoice}
          />

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Venue / Ground Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor="#9E9E9E"
              value={venue}
              onChangeText={setVenue}
            />
          </View>

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>
              Match Date<Text style={styles.required}> *</Text>
            </Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.dateText}>{matchDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker ? (
              <DateTimePicker
                value={matchDate}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, selected) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selected) setMatchDate(selected);
                }}
              />
            ) : null}
          </View>

          <Dropdown<MatchType>
            label="Match Type"
            required
            value={matchType}
            options={["friendly", "tournament", "practice"]}
            onSelect={setMatchType}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !canProceed && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canProceed}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>Continue to Scoring</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  matchupCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  matchupText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#212121",
    textAlign: "center",
  },
  vs: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B71C1C",
  },
  fieldWrap: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#424242",
    marginBottom: 8,
  },
  required: {
    color: "#D32F2F",
  },
  input: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  inputError: {
    borderColor: "#D32F2F",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#B71C1C",
    borderRadius: 18,
    paddingVertical: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
