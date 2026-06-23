import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    GestureHandlerRootView,
    Swipeable,
} from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 15;
const MAX_TEAM_NAME = 30;

type TeamKey = "A" | "B";

interface PlayerRow {
  id: string;
  name: string;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function PlayerSetupScreen() {
  const router = useRouter();

  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [playersA, setPlayersA] = useState<PlayerRow[]>([]);
  const [playersB, setPlayersB] = useState<PlayerRow[]>([]);
  const [draftA, setDraftA] = useState("");
  const [draftB, setDraftB] = useState("");

  const addPlayer = useCallback(
    (team: TeamKey) => {
      const draft = (team === "A" ? draftA : draftB).trim();
      if (!draft) return;

      const list = team === "A" ? playersA : playersB;
      if (list.length >= MAX_PLAYERS) {
        Alert.alert("Limit reached", `Max ${MAX_PLAYERS} players per team.`);
        return;
      }
      const duplicate = list.some(
        (p) => p.name.toLowerCase() === draft.toLowerCase(),
      );
      if (duplicate) {
        Alert.alert("Duplicate name", "That player is already in this team.");
        return;
      }

      const next = [...list, { id: makeId(), name: draft }];
      if (team === "A") {
        setPlayersA(next);
        setDraftA("");
      } else {
        setPlayersB(next);
        setDraftB("");
      }
    },
    [draftA, draftB, playersA, playersB],
  );

  const removePlayer = useCallback((team: TeamKey, id: string) => {
    if (team === "A") {
      setPlayersA((prev) => prev.filter((p) => p.id !== id));
    } else {
      setPlayersB((prev) => prev.filter((p) => p.id !== id));
    }
  }, []);

  const canStart = useMemo(
    () =>
      teamAName.trim().length > 0 &&
      teamBName.trim().length > 0 &&
      playersA.length >= MIN_PLAYERS &&
      playersB.length >= MIN_PLAYERS,
    [teamAName, teamBName, playersA.length, playersB.length],
  );

  const handleStart = useCallback(() => {
    if (!canStart) return;
    router.push({
      pathname: "/setup/match",
      params: {
        teamA: teamAName.trim(),
        teamB: teamBName.trim(),
        playersA: JSON.stringify(playersA.map((p) => p.name)),
        playersB: JSON.stringify(playersB.map((p) => p.name)),
      },
    });
  }, [canStart, router, teamAName, teamBName, playersA, playersB]);

  const renderRightActions = useCallback(
    (team: TeamKey, id: string) => (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => removePlayer(team, id)}
        activeOpacity={0.85}
      >
        <Ionicons name="trash-outline" size={20} color="#FFF" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    ),
    [removePlayer],
  );

  const renderPlayerRow = useCallback(
    (team: TeamKey, item: PlayerRow, index: number) => (
      <Swipeable renderRightActions={() => renderRightActions(team, item.id)}>
        <View style={styles.playerRow}>
          <View style={styles.playerIndex}>
            <Text style={styles.playerIndexText}>{index + 1}</Text>
          </View>
          <Text style={styles.playerName}>{item.name}</Text>
          <Ionicons name="reorder-three-outline" size={20} color="#BDBDBD" />
        </View>
      </Swipeable>
    ),
    [renderRightActions],
  );

  const renderTeamSection = (
    team: TeamKey,
    name: string,
    setName: (v: string) => void,
    players: PlayerRow[],
    draft: string,
    setDraft: (v: string) => void,
  ) => (
    <View style={styles.teamCard}>
      <Text style={styles.teamLabel}>Team {team}</Text>
      <TextInput
        style={styles.teamNameInput}
        placeholder={`Team ${team} name`}
        placeholderTextColor="#9E9E9E"
        value={name}
        onChangeText={setName}
        maxLength={MAX_TEAM_NAME}
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          placeholder="Player name"
          placeholderTextColor="#9E9E9E"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => addPlayer(team)}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addPlayer(team)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderPlayerRow(team, item, index)}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyHint}>
            Add at least {MIN_PLAYERS} players (swipe a row to delete).
          </Text>
        }
      />
      <Text style={styles.countHint}>
        {players.length}/{MAX_PLAYERS} players
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <LinearGradient
          colors={["#B71C1C", "#8B0000", "#8B0000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player Setup</Text>
          <View style={{ width: 22 }} />
        </LinearGradient>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <FlatList
            data={[0]}
            keyExtractor={() => "setup"}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            renderItem={() => (
              <>
                {renderTeamSection(
                  "A",
                  teamAName,
                  setTeamAName,
                  playersA,
                  draftA,
                  setDraftA,
                )}
                {renderTeamSection(
                  "B",
                  teamBName,
                  setTeamBName,
                  playersB,
                  draftB,
                  setDraftB,
                )}
              </>
            )}
          />

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.startButton,
                !canStart && styles.startButtonDisabled,
              ]}
              onPress={handleStart}
              disabled={!canStart}
              activeOpacity={0.85}
            >
              <Text style={styles.startButtonText}>Start Match</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GestureHandlerRootView>
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
  teamCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  teamLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B71C1C",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  teamNameInput: {
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 14,
  },
  addRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#212121",
  },
  addButton: {
    width: 48,
    borderRadius: 14,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  playerIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  playerIndexText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#B71C1C",
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
  },
  deleteAction: {
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
    width: 88,
    borderRadius: 12,
    marginBottom: 8,
    gap: 2,
  },
  deleteText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyHint: {
    fontSize: 13,
    color: "#9E9E9E",
    fontStyle: "italic",
    paddingVertical: 4,
  },
  countHint: {
    fontSize: 12,
    fontWeight: "600",
    color: "#616161",
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#B71C1C",
    borderRadius: 18,
    paddingVertical: 16,
  },
  startButtonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
