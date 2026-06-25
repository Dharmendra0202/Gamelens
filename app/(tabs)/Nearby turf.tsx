import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TurfFilter = "all" | "nearby" | "available";

export default function NearbyTurfScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TurfFilter>("all");
  const [locationGranted, setLocationGranted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const filters: { key: TurfFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "nearby", label: "Nearby" },
    { key: "available", label: "Available Now" },
  ];

  const requestLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationGranted(true);
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        Alert.alert(
          "Location Required",
          "Please enable location access in settings to find nearby cricket turfs.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (err) {
      Alert.alert("Error", "Could not get your location. Please try again.");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Check location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === "granted") {
        setLocationGranted(true);
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        } catch {}
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    if (locationGranted) {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch {}
    }
    // TODO: Refresh turf list from backend
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header — same as other tabs */}
      <LinearGradient
        colors={["#B71C1C", "#8B0000", "#8B0000"]}
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
          <TouchableOpacity style={styles.iconButton} onPress={requestLocation}>
            <Ionicons name="navigate-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Notifications", "No new notifications")}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B0000" />}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cricket turfs nearby..."
              placeholderTextColor="#9E9E9E"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color="#9E9E9E" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Location Status */}
        {locationGranted && userLocation && (
          <View style={styles.locationStatus}>
            <Ionicons name="location" size={14} color="#C62828" />
            <Text style={styles.locationStatusText}>
              Location active • Pull to refresh
            </Text>
          </View>
        )}

        {/* Location Access Card — shown when no permission */}
        {!locationGranted && (
          <View style={styles.locationCard}>
            <View style={styles.locationIconWrap}>
              <LinearGradient colors={["#FFCDD2", "#A7F3D0"]} style={styles.locationIconGrad}>
                <Ionicons name="location" size={32} color="#C62828" />
              </LinearGradient>
            </View>
            <Text style={styles.locationTitle}>Find Cricket Turfs Near You</Text>
            <Text style={styles.locationDesc}>
              Enable location to discover cricket grounds, practice nets, and turf facilities in your area
            </Text>
            <TouchableOpacity
              style={styles.locationBtn}
              onPress={requestLocation}
              activeOpacity={0.85}
              disabled={loadingLocation}
            >
              <LinearGradient colors={["#B71C1C", "#8B0000"]} style={styles.locationBtnGrad}>
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="navigate" size={18} color="#FFF" />
                    <Text style={styles.locationBtnText}>Enable Location</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State — No turfs found */}
        {locationGranted && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="baseball-outline" size={48} color="#BDBDBD" />
            </View>
            <Text style={styles.emptyTitle}>No cricket turfs found</Text>
            <Text style={styles.emptyDesc}>
              We're still building our turf network in your area. Check back soon or try a different location.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
              <Ionicons name="refresh" size={16} color="#8B0000" />
              <Text style={styles.retryBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FDF9" },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 2 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#FFF", letterSpacing: 1 },
  headerTitleAccent: { color: "#EF9A9A" },
  headerRight: { flexDirection: "row", gap: 1, marginRight: -4 },
  iconButton: { padding: 6 },

  content: { flex: 1 },

  // Search
  searchSection: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 4,
    gap: 10,
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 7,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#212121", fontWeight: "500" },

  // Filters
  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#FFCDD2",
  },
  filterChipActive: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#8B0000" },
  filterTextActive: { color: "#FFF" },

  // Location Status
  locationStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 6,
  },
  locationStatusText: { fontSize: 12, color: "#C62828", fontWeight: "500" },

  // Location Card
  locationCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  locationIconWrap: { marginBottom: 18 },
  locationIconGrad: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  locationTitle: { fontSize: 20, fontWeight: "800", color: "#212121", marginBottom: 10, textAlign: "center" },
  locationDesc: { fontSize: 14, color: "#616161", textAlign: "center", lineHeight: 22, marginBottom: 22, paddingHorizontal: 8 },
  locationBtn: { width: "100%", borderRadius: 16, overflow: "hidden" },
  locationBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  locationBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  // Empty Card
  emptyCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#424242", marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: "#9E9E9E", textAlign: "center", lineHeight: 20, marginBottom: 18 },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFCDD2",
    gap: 6,
  },
  retryBtnText: { fontSize: 13, fontWeight: "600", color: "#8B0000" },

  // Info Card
  infoCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: { fontSize: 16, fontWeight: "700", color: "#212121", marginBottom: 16 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  infoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 14, fontWeight: "600", color: "#212121" },
  infoDesc: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },

  // Tip Card
  tipCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  tipGrad: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: "700", color: "#C62828" },
  tipText: { fontSize: 12, color: "#424242", marginTop: 4, lineHeight: 18 },
});
