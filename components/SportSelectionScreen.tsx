import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Sport Data ─────────────────────────────────────────────────────────────────

interface Sport {
  id: string;
  name: string;
  icon: string;
  available: boolean;
}

const SPORTS: Sport[] = [
  { id: "box_cricket", name: "Box Cricket", icon: "🏏", available: true },
  { id: "cricket", name: "Cricket", icon: "🏏", available: true },
  { id: "badminton", name: "Badminton", icon: "🏸", available: false },
  { id: "football", name: "Football", icon: "⚽", available: false },
  { id: "pickleball", name: "Pickleball", icon: "🥒", available: false },
  { id: "padel", name: "Padel", icon: "🎾", available: false },
  { id: "tennis", name: "Tennis", icon: "🎾", available: false },
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

  const filteredSports = useMemo(() => {
    if (!search.trim()) return SPORTS;
    return SPORTS.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase().trim()),
    );
  }, [search]);

  const handleContinue = useCallback(() => {
    if (selected) {
      onSelect(selected);
    }
  }, [selected, onSelect]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pick your sport</Text>
        <Text style={styles.subtitle}>Choose what you love to play</Text>
      </View>

      {/* Search Bar — slim and rounded */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sports..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sports List — horizontal chips for available, vertical list for all */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {/* Featured / Available */}
        <Text style={styles.sectionLabel}>Available Now</Text>
        <View style={styles.featuredRow}>
          {filteredSports
            .filter((s) => s.available)
            .map((sport) => {
              const isSelected = selected === sport.id;
              return (
                <TouchableOpacity
                  key={sport.id}
                  style={[styles.featuredCard, isSelected && styles.featuredCardSelected]}
                  onPress={() => setSelected(sport.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.featuredEmoji}>{sport.icon}</Text>
                  <Text style={[styles.featuredName, isSelected && styles.featuredNameSelected]}>
                    {sport.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
        </View>

        {/* All Sports — list style */}
        <Text style={styles.sectionLabel}>All Sports</Text>
        {filteredSports.map((sport) => {
          const isSelected = selected === sport.id;
          return (
            <TouchableOpacity
              key={sport.id}
              style={[styles.sportRow, isSelected && styles.sportRowSelected]}
              onPress={() => setSelected(sport.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.sportIconCircle, isSelected && styles.sportIconCircleSelected]}>
                <Text style={styles.sportEmoji}>{sport.icon}</Text>
              </View>
              <View style={styles.sportInfo}>
                <Text style={[styles.sportName, isSelected && styles.sportNameSelected]}>
                  {sport.name}
                </Text>
                {!sport.available && (
                  <Text style={styles.comingSoon}>Coming soon</Text>
                )}
              </View>
              {isSelected ? (
                <View style={styles.radioSelected}>
                  <View style={styles.radioInner} />
                </View>
              ) : (
                <View style={styles.radioEmpty} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selected ? ["#B71C1C", "#8B0000"] : ["#E5E7EB", "#D1D5DB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueGrad}
          >
            <Text style={[styles.continueText, !selected && { color: "#9CA3AF" }]}>
              Continue
            </Text>
            <Ionicons name="arrow-forward" size={16} color={selected ? "#FFF" : "#9CA3AF"} />
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
    backgroundColor: "#FAFAFA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    marginBottom: 18,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    paddingVertical: 0,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },

  // Featured cards (horizontal)
  featuredRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  featuredCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  featuredCardSelected: {
    borderColor: "#B71C1C",
    backgroundColor: "#FEF2F2",
  },
  featuredEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  featuredNameSelected: {
    color: "#B71C1C",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
  },

  // Sport rows (list)
  sportRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  sportRowSelected: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FECACA",
  },
  sportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  sportIconCircleSelected: {
    backgroundColor: "#FECACA",
  },
  sportEmoji: {
    fontSize: 22,
  },
  sportInfo: {
    flex: 1,
  },
  sportName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  sportNameSelected: {
    color: "#B71C1C",
  },
  comingSoon: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  radioEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#B71C1C",
  },

  // Footer
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  skipBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  skipText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
  },
  continueBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  continueBtnDisabled: {},
  continueGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  continueText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
  },
});
