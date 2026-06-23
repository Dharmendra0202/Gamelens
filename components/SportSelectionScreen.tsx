import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Sport Data ─────────────────────────────────────────────────────────────────

interface Sport {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

const SPORTS: Sport[] = [
  { id: "box_cricket", name: "Box Cricket", icon: "🏏", available: true },
  { id: "badminton", name: "Badminton", icon: "🏸", available: false },
  { id: "pickleball", name: "Pickleball", icon: "🥒", available: false },
  { id: "padel", name: "Padel", icon: "🎾", available: false },
  { id: "cricket", name: "Cricket", icon: "🏏", available: true },
  { id: "tennis", name: "Tennis", icon: "🎾", available: false },
  { id: "football", name: "Football", icon: "⚽", available: false },
  { id: "basketball", name: "Basketball", icon: "🏀", available: false },
];

// ─── Props ──────────────────────────────────────────────────────────────────────

interface SportSelectionScreenProps {
  onSelect: (sportId: string) => void;
  onSkip: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function SportSelectionScreen({
  onSelect,
  onSkip,
}: SportSelectionScreenProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filteredSports = useMemo(() => {
    const list = showAll ? SPORTS : SPORTS.slice(0, 6);
    if (!search.trim()) return list;
    return list.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase().trim()),
    );
  }, [search, showAll]);

  const handleContinue = useCallback(() => {
    if (selected) {
      onSelect(selected);
    }
  }, [selected, onSelect]);

  const renderSport = useCallback(
    ({ item }: { item: Sport }) => {
      const isSelected = selected === item.id;
      return (
        <TouchableOpacity
          style={[styles.sportCard, isSelected && styles.sportCardSelected]}
          onPress={() => setSelected(item.id)}
          activeOpacity={0.8}
        >
          <View
            style={[styles.sportIcon, isSelected && styles.sportIconSelected]}
          >
            <Text style={styles.sportEmoji}>{item.icon}</Text>
          </View>
          <Text
            style={[styles.sportName, isSelected && styles.sportNameSelected]}
          >
            {item.name}
          </Text>
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={22} color="#B71C1C" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [selected],
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏅 Select your Sport</Text>
        <Text style={styles.subtitle}>Let us know you better!</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color="#9E9E9E" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sports..."
          placeholderTextColor="#9E9E9E"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sports List */}
      <FlatList
        data={filteredSports}
        keyExtractor={(item) => item.id}
        renderItem={renderSport}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          !showAll && !search ? (
            <TouchableOpacity
              style={styles.seeMoreButton}
              onPress={() => setShowAll(true)}
            >
              <Text style={styles.seeMoreText}>See More</Text>
              <Ionicons name="chevron-down" size={16} color="#B71C1C" />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selected && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selected ? ["#D32F2F", "#B71C1C"] : ["#BDBDBD", "#9E9E9E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGradient}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#616161",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#212121",
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  sportCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sportCardSelected: {
    borderColor: "#B71C1C",
    backgroundColor: "#FBE9E7",
  },
  sportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  sportIconSelected: {
    backgroundColor: "#FFCDD2",
  },
  sportEmoji: {
    fontSize: 28,
  },
  sportName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#212121",
    textAlign: "center",
  },
  sportNameSelected: {
    color: "#B71C1C",
  },
  checkmark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  seeMoreText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B71C1C",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#616161",
  },
  continueButton: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
});
