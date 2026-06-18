import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FilterType = "all" | "cricket" | "football" | "badminton" | "multi";

export default function NearbyTurfScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance");

  const filters: { key: FilterType; label: string; icon: string }[] = [
    { key: "all", label: "All", icon: "grid-outline" },
    { key: "cricket", label: "Cricket", icon: "baseball-outline" },
    { key: "football", label: "Football", icon: "football-outline" },
    { key: "badminton", label: "Badminton", icon: "tennisball-outline" },
    { key: "multi", label: "Multi-sport", icon: "fitness-outline" },
  ];

  return (
    <View style={styles.container}>
      {/* Header — same as other tabs */}
      <LinearGradient
        colors={["#00A66A", "#0F766E", "#064E3B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            GAME<Text style={styles.headerTitleAccent}>LENS</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="filter-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search turfs, locations..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* Sport Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={activeFilter === filter.key ? "#FFF" : "#0F766E"}
              />
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {(["distance", "price", "rating"] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.sortChip, sortBy === option && styles.sortChipActive]}
              onPress={() => setSortBy(option)}
            >
              <Text style={[styles.sortText, sortBy === option && styles.sortTextActive]}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Access Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationIconWrap}>
            <Ionicons name="location" size={28} color="#0F766E" />
          </View>
          <Text style={styles.locationTitle}>Enable Location</Text>
          <Text style={styles.locationDesc}>
            Allow location access to find turfs near you and get accurate distance info
          </Text>
          <TouchableOpacity style={styles.locationBtn} activeOpacity={0.8}>
            <LinearGradient
              colors={["#0F766E", "#064E3B"]}
              style={styles.locationBtnGrad}
            >
              <Ionicons name="navigate" size={16} color="#FFF" />
              <Text style={styles.locationBtnText}>Enable Location</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Empty State — No Turfs */}
        <View style={styles.emptySection}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="football-outline" size={52} color="#CBD5E1" />
          </View>
          <Text style={styles.emptyTitle}>No turfs found nearby</Text>
          <Text style={styles.emptyDesc}>
            Enable location or try searching for a specific area to discover available turfs
          </Text>
        </View>

        {/* How it works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.howTitle}>How it works</Text>
          {[
            { step: "1", icon: "search-outline", title: "Search", desc: "Find turfs by sport, location or name" },
            { step: "2", icon: "calendar-outline", title: "Book", desc: "Choose a time slot that suits you" },
            { step: "3", icon: "football-outline", title: "Play", desc: "Show up and enjoy your game" },
          ].map((item, index) => (
            <View key={index} style={styles.howStep}>
              <View style={styles.howStepNum}>
                <Text style={styles.howStepNumText}>{item.step}</Text>
              </View>
              <View style={styles.howStepContent}>
                <Text style={styles.howStepTitle}>{item.title}</Text>
                <Text style={styles.howStepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },

  // Header — matches home screen
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 40,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: 1 },
  headerTitleAccent: { color: "#6EE7B7" },
  headerRight: { flexDirection: "row", gap: 1, marginRight: -4 },
  iconButton: { padding: 6 },

  // Search
  searchSection: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#0F172A", fontWeight: "500" },

  // Content
  content: { flex: 1 },

  // Filters
  filterRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#D1FAE5",
    gap: 6,
  },
  filterChipActive: { backgroundColor: "#0F766E", borderColor: "#0F766E" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#0F766E" },
  filterTextActive: { color: "#FFF" },

  // Sort
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sortLabel: { fontSize: 12, color: "#64748B", fontWeight: "500" },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sortChipActive: { backgroundColor: "#064E3B", borderColor: "#064E3B" },
  sortText: { fontSize: 12, fontWeight: "600", color: "#64748B" },
  sortTextActive: { color: "#FFF" },

  // Location Card
  locationCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  locationIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  locationTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  locationDesc: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  locationBtn: { width: "100%", borderRadius: 14, overflow: "hidden" },
  locationBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  locationBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },

  // Empty State
  emptySection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#334155", marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: "#94A3B8", textAlign: "center", lineHeight: 20 },

  // How it works
  howItWorksCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  howTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  howStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 14,
  },
  howStepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  howStepNumText: { fontSize: 14, fontWeight: "800", color: "#0F766E" },
  howStepContent: { flex: 1 },
  howStepTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  howStepDesc: { fontSize: 12, color: "#64748B", marginTop: 2 },
});
