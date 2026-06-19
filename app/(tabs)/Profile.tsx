import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/hooks/use-auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
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
      case "Admin Dashboard":
        router.push("/admin" as never);
        break;
      case "My Bookings":
        Alert.alert("My Bookings", "No upcoming bookings yet.");
        break;
      case "Saved Addresses":
        Alert.alert("Saved Addresses", "No saved addresses yet. This feature is coming soon.");
        break;
      case "Payment Methods":
        Alert.alert("Payment Methods", "No payment methods saved. This feature is coming soon.");
        break;
      case "Help & Support":
        Alert.alert("Help & Support", "Need help?", [
          { text: "Cancel", style: "cancel" },
          { text: "Email Us", onPress: () => Linking.openURL("mailto:support@gamelens.app") },
        ]);
        break;
      case "Special Offers":
        Alert.alert("Special Offers", "No offers available right now. Check back soon!");
        break;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header Card */}
        <LinearGradient
          colors={["#0D9488", "#0F766E", "#064E3B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileEmail}>{userPhone}</Text>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={16} color="#0F766E" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Sign in with Google */}
          <TouchableOpacity style={styles.googleBtn} onPress={() => Alert.alert("Google Sign In", "Google authentication coming soon.")}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.matches_played || 0}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.friends_count || 0}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.posts_count || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.menuCard}>
          {[
            { icon: "shield-checkmark-outline", label: "Admin Dashboard", desc: "Manage bookings and services", color: "#0D9488" },
            { icon: "calendar-outline", label: "My Bookings", desc: "View your upcoming bookings", color: "#2563EB" },
            { icon: "location-outline", label: "Saved Addresses", desc: "Manage your locations", color: "#7C3AED" },
            { icon: "card-outline", label: "Payment Methods", desc: "Cards, UPI, and saved options", color: "#059669" },
            { icon: "headset-outline", label: "Help & Support", desc: "Call, chat, or raise a ticket", color: "#DC2626" },
            { icon: "gift-outline", label: "Special Offers", desc: "Explore available deals", color: "#D97706" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, index === 5 && { borderBottomWidth: 0 }]}
              onPress={() => handleMenuPress(item.label)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBg, { backgroundColor: item.color + "12" }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferences */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionSubtitle}>Control experience</Text>
        </View>
        <View style={styles.menuCard}>
          <View style={styles.prefItem}>
            <View style={[styles.menuIconBg, { backgroundColor: "#1E293B12" }]}>
              <Ionicons name="moon-outline" size={22} color="#1E293B" />
            </View>
            <Text style={styles.prefLabel}>Dark mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#E2E8F0", true: "#0D9488" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefItem}>
            <View style={[styles.menuIconBg, { backgroundColor: "#DC262612" }]}>
              <Ionicons name="notifications-outline" size={22} color="#DC2626" />
            </View>
            <Text style={styles.prefLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#E2E8F0", true: "#0D9488" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.prefDivider} />

          <View style={styles.prefItem}>
            <View style={[styles.menuIconBg, { backgroundColor: "#64748B12" }]}>
              <Ionicons name="finger-print-outline" size={22} color="#64748B" />
            </View>
            <Text style={styles.prefLabel}>Biometric lock</Text>
            <Switch
              value={biometricLock}
              onValueChange={setBiometricLock}
              trackColor={{ false: "#E2E8F0", true: "#0D9488" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  // Header Card
  headerCard: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  profileEmail: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#0F766E" },

  // Google Button
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  googleIcon: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  googleText: { flex: 1, fontSize: 14, fontWeight: "600", color: "#FFF" },

  // Stats Card
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: -1,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 4, fontWeight: "500" },
  statDivider: { width: 1, backgroundColor: "#E2E8F0" },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  sectionSubtitle: { fontSize: 12, color: "#64748B" },

  // Menu Card
  menuCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  menuIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  menuDesc: { fontSize: 12, color: "#94A3B8", marginTop: 2 },

  // Preferences
  prefItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  prefLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0F172A" },
  prefDivider: { height: 1, backgroundColor: "#F1F5F9" },

  // Logout
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    backgroundColor: "#FEE2E2",
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#DC2626" },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 16,
  },
});
