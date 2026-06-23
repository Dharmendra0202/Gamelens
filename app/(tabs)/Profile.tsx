import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    Animated,
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
        router.push("/admin" as never);
        break;
      case "My Bookings":
        router.push("/my-bookings" as never);
        break;
      case "Saved Addresses":
        router.push("/saved-addresses" as never);
        break;
      case "Payment Methods":
        router.push("/payment-methods" as never);
        break;
      case "Help & Support":
        router.push("/help-support" as never);
        break;
    }
  };

  // Animated press scale for menu items
  const createPressAnim = () => {
    const scale = useRef(new Animated.Value(1)).current;
    const onPressIn = () =>
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }).start();
    const onPressOut = () =>
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }).start();
    return { scale, onPressIn, onPressOut };
  };

  const menuItems = [
    {
      icon: "shield-checkmark-outline",
      label: "Your Dashboard",
      desc: "Manage your bookings and services",
      color: "#0D9488",
    },
    {
      icon: "calendar-outline",
      label: "My Bookings",
      desc: "View your upcoming bookings",
      color: "#2563EB",
    },
    {
      icon: "location-outline",
      label: "Saved Addresses",
      desc: "Manage your locations",
      color: "#7C3AED",
    },
    {
      icon: "card-outline",
      label: "Payment Methods",
      desc: "Cards, UPI, and saved options",
      color: "#059669",
    },
    {
      icon: "headset-outline",
      label: "Help & Support",
      desc: "Call, chat, or raise a ticket",
      color: "#DC2626",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Background gradient overlay */}
      <LinearGradient
        colors={["#0F766E", "#064E3B", "#0B3D2E", "#091E1A"]}
        locations={[0, 0.3, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        {/* Profile Header */}
        <View style={styles.headerSection}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <LinearGradient
                colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
                style={styles.avatarInner}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileSub}>{userPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={15} color="#A7F3D0" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Google Sign-in Glass Pill */}
          <TouchableOpacity style={styles.googlePill} activeOpacity={0.75}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Sign in with Google</Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color="rgba(255,255,255,0.5)"
            />
          </TouchableOpacity>
        </View>

        {/* Stats Glass Chips */}
        <View style={styles.statsRow}>
          {[
            {
              value: profile?.matches_played || 0,
              label: "Matches",
              icon: "baseball-outline",
            },
            {
              value: profile?.friends_count || 0,
              label: "Friends",
              icon: "people-outline",
            },
            {
              value: profile?.posts_count || 0,
              label: "Posts",
              icon: "chatbubble-outline",
            },
          ].map((stat, i) => (
            <View key={i} style={styles.statChip}>
              <LinearGradient
                colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.04)"]}
                style={styles.statChipGrad}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={16}
                  color="rgba(167,243,208,0.7)"
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Quick Actions — Glass Tiles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.glassCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
            style={styles.glassCardInner}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuTile,
                  index === menuItems.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleMenuPress(item.label)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.menuIconWrap,
                    { backgroundColor: item.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                  />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color="rgba(255,255,255,0.25)"
                />
              </TouchableOpacity>
            ))}
          </LinearGradient>
        </View>

        {/* Preferences — Glass */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text style={styles.sectionSub}>Control experience</Text>
        </View>
        <View style={styles.glassCard}>
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
            style={styles.glassCardInner}
          >
            <View style={styles.prefRow}>
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: "rgba(220,38,38,0.15)" },
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#F87171"
                />
              </View>
              <Text style={styles.prefLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "#0D9488" }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.prefDivider} />

            <View style={styles.prefRow}>
              <View
                style={[
                  styles.menuIconWrap,
                  { backgroundColor: "rgba(100,116,139,0.15)" },
                ]}
              >
                <Ionicons
                  name="finger-print-outline"
                  size={20}
                  color="#94A3B8"
                />
              </View>
              <Text style={styles.prefLabel}>Biometric lock</Text>
              <Switch
                value={biometricLock}
                onValueChange={setBiometricLock}
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "#0D9488" }}
                thumbColor="#FFF"
              />
            </View>
          </LinearGradient>
        </View>

        {/* Logout — Premium Red Glass */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["rgba(220,38,38,0.2)", "rgba(185,28,28,0.12)"]}
            style={styles.logoutGrad}
          >
            <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
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
    paddingTop: 52,
    paddingBottom: 24,
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
    borderWidth: 2,
    borderColor: "rgba(167,243,208,0.3)",
    overflow: "hidden",
  },
  avatarInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  profileSub: { fontSize: 13, color: "rgba(167,243,208,0.6)", marginTop: 3 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(167,243,208,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 5,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: "#A7F3D0" },

  // Google Pill
  googlePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 16,
    gap: 10,
  },
  googleG: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  googleText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  statChip: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  statChipGrad: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 4,
  },
  statValue: { fontSize: 22, fontWeight: "800", color: "#FFF", marginTop: 4 },
  statLabel: {
    fontSize: 11,
    color: "rgba(167,243,208,0.5)",
    fontWeight: "500",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.5,
  },
  sectionSub: { fontSize: 11, color: "rgba(167,243,208,0.4)" },

  // Glass Card
  glassCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 24,
  },
  glassCardInner: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },

  // Menu Tiles
  menuTile: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
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
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  menuDesc: { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 },

  // Preferences
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    gap: 12,
  },
  prefLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  prefDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.05)" },

  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(220,38,38,0.2)",
    overflow: "hidden",
    marginTop: 4,
  },
  logoutGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#FCA5A5" },

  // Version
  versionText: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
