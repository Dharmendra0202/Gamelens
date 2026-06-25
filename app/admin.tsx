import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminScreen() {
  const router = useRouter();

  const handleMenuPress = (label: string) => {
    switch (label) {
      case "User Management":
        Alert.alert("User Management", "View and manage all registered users on the platform.");
        break;
      case "Turf Management":
        router.push("/turf-management" as never);
        break;
      case "Tournament Control":
        Alert.alert("Tournament Control", "Create, edit, and manage tournaments across the platform.");
        break;
      case "Reports & Analytics":
        Alert.alert("Reports & Analytics", "View platform usage stats, revenue reports, and engagement metrics.");
        break;
      case "Announcements":
        Alert.alert("Announcements", "Send announcements and notifications to all users.");
        break;
      case "Reported Content":
        Alert.alert("Reported Content", "Review and moderate flagged posts, comments, and profiles.");
        break;
      case "Payments":
        Alert.alert("Payments", "View all transactions, refunds, and payment history.");
        break;
      case "Platform Settings":
        Alert.alert("Platform Settings", "Configure app settings, feature flags, and maintenance mode.");
        break;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#1E293B", "#0F172A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>Platform control center</Text>
        </View>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={22} color="#F59E0B" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#1E293B" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="football-outline" size={24} color="#1E293B" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Total Turfs</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={24} color="#1E293B" />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
        </View>

        {/* Admin Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Administration</Text>

          {[
            { icon: "people", label: "User Management", color: "#B71C1C" },
            { icon: "football", label: "Turf Management", color: "#8B0000" },
            { icon: "trophy", label: "Tournament Control", color: "#D97706" },
            { icon: "bar-chart-outline", label: "Reports & Analytics", color: "#7C3AED" },
            { icon: "megaphone-outline", label: "Announcements", color: "#D32F2F" },
            { icon: "flag-outline", label: "Reported Content", color: "#E11D48" },
            { icon: "card-outline", label: "Payments", color: "#C62828" },
            { icon: "cog-outline", label: "Platform Settings", color: "#616161" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.label)}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: HEADER_PADDING_TOP + 10,
    paddingBottom: HEADER_PADDING_BOTTOM + 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  headerIcon: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#212121",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#616161",
    fontWeight: "500",
    marginTop: 4,
    textAlign: "center",
  },
  menuSection: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#212121",
    marginLeft: 12,
  },
});
