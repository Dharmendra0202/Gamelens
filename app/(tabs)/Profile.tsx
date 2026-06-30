import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/hooks/use-auth";
import { useTabNavigator } from "@/contexts/TabNavigatorContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const { activeMainTab } = useTabNavigator();
  const isActive = activeMainTab === 4; // Profile is the 5th tab (index 4)

  const userName = profile?.full_name || "Guest User";
  const userPhone = profile?.phone_number || "Not set";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push("/profile/setup" as never);
  };

  const handleMenuPress = (label: string) => {
    switch (label) {
      case "Your Dashboard":
        router.push("/user-dashboard" as never);
        break;
      case "My Bookings":
        router.push("/profile/my-bookings" as never);
        break;
      case "Saved Addresses":
        router.push("/profile/saved-addresses" as never);
        break;
      case "Payment Methods":
        router.push("/profile/payment-methods" as never);
        break;
      case "Help & Support":
        router.push("/profile/help-support" as never);
        break;
    }
  };

  const menuItems = [
    { icon: "grid-outline", label: "Your Dashboard", desc: "Manage your bookings and services", color: "#7C3AED" },
    { icon: "calendar-outline", label: "My Bookings", desc: "View your upcoming bookings", color: "#2563EB" },
    { icon: "location-outline", label: "Saved Addresses", desc: "Manage your locations", color: "#059669" },
    { icon: "card-outline", label: "Payment Methods", desc: "Cards, UPI, and saved options", color: "#D97706" },
    { icon: "headset-outline", label: "Help & Support", desc: "Call, chat, or raise a ticket", color: "#DC2626" },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isActive ? "dark-content" : "light-content"} backgroundColor={isActive ? "#F1F5F9" : "transparent"} />
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, backgroundColor: "#F1F5F9" }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={["#7C3AED", "#5B21B6"]}
                style={styles.avatarInner}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileSub}>{userPhone}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={15} color="#7C3AED" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Google Sign-in Pill */}
          <TouchableOpacity style={styles.googlePill} activeOpacity={0.75} onPress={() => Alert.alert("Google Sign-in", "Google authentication coming soon")}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
            <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Stats Chips */}
        <View style={styles.statsRow}>
          {[
            { value: profile?.matches_played || 0, label: "Matches", icon: "baseball-outline", color: "#7C3AED" },
            { value: profile?.friends_count || 0, label: "Friends", icon: "people-outline", color: "#2563EB" },
            { value: profile?.posts_count || 0, label: "Posts", icon: "chatbubble-outline", color: "#059669" },
          ].map((stat, i) => (
            <View key={i} style={styles.statChip}>
              <Ionicons name={stat.icon as any} size={16} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.glassCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuTile, index === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => handleMenuPress(item.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: item.color + "12" }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerSection: {
    paddingTop: HEADER_PADDING_TOP + 16,
    paddingBottom: HEADER_PADDING_BOTTOM + 18,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#FFF", letterSpacing: 1 },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 22, fontWeight: "800", color: "#1E293B", letterSpacing: 0.4 },
  profileSub: { fontSize: 14, color: "#64748B", marginTop: 4, fontWeight: "500" },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  editBtnText: { fontSize: 13, fontWeight: "700", color: "#7C3AED" },

  // Google Pill
  googlePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  googleG: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: "#1E293B",
    backgroundColor: "#FFFFFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: "center",
    lineHeight: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#475569" },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 20,
    marginBottom: 32,
  },
  statChip: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.08)",
  },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1E293B", marginTop: 2 },
  statLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600", letterSpacing: 0.3 },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#475569", letterSpacing: 0.4 },

  // Glass Card
  glassCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    marginBottom: 28,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(124, 58, 237, 0.06)",
  },

  // Menu Tiles
  menuTile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
    gap: 14,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "700", color: "#1E293B", letterSpacing: 0.2 },
  menuDesc: { fontSize: 12, color: "#94A3B8", marginTop: 3, lineHeight: 16 },

  // Preferences
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  prefLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#1E293B" },
  prefDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.04)" },

  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.15)",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: { fontSize: 16, fontWeight: "800", color: "#EF4444", letterSpacing: 0.3 },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#CBD5E1",
    marginTop: 24,
    letterSpacing: 0.8,
    fontWeight: "500",
  },
});
