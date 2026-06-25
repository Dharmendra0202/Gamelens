import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
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
  const [notifications, setNotifications] = useState(true);
  const [biometricLock, setBiometricLock] = useState(false);

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
          <TouchableOpacity style={styles.googlePill} activeOpacity={0.75}>
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

        {/* Preferences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        <View style={styles.glassCard}>
          <View style={styles.prefRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
              <Ionicons name="notifications-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.prefLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#E2E8F0", true: "#7C3AED" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefRow}>
            <View style={[styles.menuIconWrap, { backgroundColor: "rgba(100,116,139,0.1)" }]}>
              <Ionicons name="finger-print-outline" size={20} color="#64748B" />
            </View>
            <Text style={styles.prefLabel}>Biometric lock</Text>
            <Switch
              value={biometricLock}
              onValueChange={setBiometricLock}
              trackColor={{ false: "#E2E8F0", true: "#7C3AED" }}
              thumbColor="#FFF"
            />
          </View>
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
    paddingTop: HEADER_PADDING_TOP + 12,
    paddingBottom: HEADER_PADDING_BOTTOM + 14,
    paddingHorizontal: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 21, fontWeight: "800", color: "#1E293B", letterSpacing: 0.3 },
  profileSub: { fontSize: 13, color: "#64748B", marginTop: 3 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(124,58,237,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: "#7C3AED" },

  // Google Pill
  googlePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 10,
  },
  googleG: { fontSize: 16, fontWeight: "800", color: "#1E293B" },
  googleText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#475569" },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  statChip: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 2,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: "#1E293B", marginTop: 2 },
  statLabel: { fontSize: 10, color: "#94A3B8", fontWeight: "500" },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#475569", letterSpacing: 0.3 },

  // Glass Card
  glassCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  // Menu Tiles
  menuTile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.04)",
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  menuDesc: { fontSize: 12, color: "#94A3B8", marginTop: 2 },

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
    borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    marginTop: 4,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#EF4444" },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "#CBD5E1",
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
