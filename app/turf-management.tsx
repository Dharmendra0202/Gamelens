import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type TurfView = "dashboard" | "bookings" | "turfs" | "slots" | "pricing" | "analytics" | "settings" | "addTurf";

export default function TurfManagementScreen() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<TurfView>("dashboard");
  const [showSidebar, setShowSidebar] = useState(false);

  // Add Turf form state
  const [turfName, setTurfName] = useState("");
  const [turfLocation, setTurfLocation] = useState("");
  const [turfSize, setTurfSize] = useState("");
  const [turfPrice, setTurfPrice] = useState("");
  const [turfContact, setTurfContact] = useState("");

  const menuItems: { key: TurfView; icon: string; label: string; color: string }[] = [
    { key: "dashboard", icon: "grid-outline", label: "Dashboard", color: "#8B0000" },
    { key: "turfs", icon: "football-outline", label: "My Turfs", color: "#B71C1C" },
    { key: "bookings", icon: "calendar-outline", label: "Bookings", color: "#7C3AED" },
    { key: "slots", icon: "time-outline", label: "Time Slots", color: "#D97706" },
    { key: "pricing", icon: "pricetag-outline", label: "Pricing", color: "#D32F2F" },
    { key: "analytics", icon: "stats-chart-outline", label: "Analytics", color: "#C62828" },
    { key: "settings", icon: "settings-outline", label: "Settings", color: "#616161" },
  ];

  const resetTurfForm = () => {
    setTurfName("");
    setTurfLocation("");
    setTurfSize("");
    setTurfPrice("");
    setTurfContact("");
  };

  // Handle Android hardware back button
  useEffect(() => {
    const backAction = () => {
      if (showSidebar) {
        setShowSidebar(false);
        return true;
      }
      if (currentView !== "dashboard") {
        setCurrentView("dashboard");
        return true;
      }
      // On dashboard, let it go back to login
      return false;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [currentView, showSidebar]);

  // ── Render Views ──

  const renderDashboard = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      {/* Overview Card — Key Metrics */}
      <LinearGradient
        colors={["#8B0000", "#8B0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overviewCard}
      >
        <Text style={styles.overviewTitle}>Today's Overview</Text>
        <View style={styles.overviewStats}>
          <TouchableOpacity style={styles.overviewStat} onPress={() => setCurrentView("bookings")}>
            <Text style={styles.overviewValue}>0</Text>
            <Text style={styles.overviewLabel}>Bookings</Text>
          </TouchableOpacity>
          <View style={styles.overviewDivider} />
          <TouchableOpacity style={styles.overviewStat} onPress={() => setCurrentView("analytics")}>
            <Text style={styles.overviewValue}>₹0</Text>
            <Text style={styles.overviewLabel}>Revenue</Text>
          </TouchableOpacity>
          <View style={styles.overviewDivider} />
          <TouchableOpacity style={styles.overviewStat} onPress={() => setCurrentView("turfs")}>
            <Text style={styles.overviewValue}>0</Text>
            <Text style={styles.overviewLabel}>Active Turfs</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.overviewCta} onPress={() => setCurrentView("addTurf")}>
          <Ionicons name="add-circle" size={18} color="#A7F3D0" />
          <Text style={styles.overviewCtaText}>Add New Turf</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Management Section */}
      <Text style={styles.dashSectionHeading}>Management</Text>
      <View style={styles.managementGrid}>
        <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("turfs")}>
          <View style={[styles.mgmtIconBg, { backgroundColor: "#FFCDD2" }]}>
            <Ionicons name="football-outline" size={24} color="#C62828" />
          </View>
          <Text style={styles.mgmtLabel}>My Turfs</Text>
          <Text style={styles.mgmtDesc}>View & manage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("bookings")}>
          <View style={[styles.mgmtIconBg, { backgroundColor: "#EDE9FE" }]}>
            <Ionicons name="calendar-outline" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.mgmtLabel}>Bookings</Text>
          <Text style={styles.mgmtDesc}>Track all</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("slots")}>
          <View style={[styles.mgmtIconBg, { backgroundColor: "#FEF3C7" }]}>
            <Ionicons name="time-outline" size={24} color="#D97706" />
          </View>
          <Text style={styles.mgmtLabel}>Time Slots</Text>
          <Text style={styles.mgmtDesc}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("pricing")}>
          <View style={[styles.mgmtIconBg, { backgroundColor: "#FFCDD2" }]}>
            <Ionicons name="pricetag-outline" size={24} color="#D32F2F" />
          </View>
          <Text style={styles.mgmtLabel}>Pricing</Text>
          <Text style={styles.mgmtDesc}>Set rates</Text>
        </TouchableOpacity>
      </View>

      {/* Insights & Tools */}
      <Text style={styles.dashSectionHeading}>Insights & Tools</Text>
      <View style={styles.insightsCard}>
        <TouchableOpacity style={styles.insightRow} onPress={() => setCurrentView("analytics")}>
          <View style={[styles.insightIcon, { backgroundColor: "#DBEAFE" }]}>
            <Ionicons name="stats-chart" size={20} color="#B71C1C" />
          </View>
          <View style={styles.insightText}>
            <Text style={styles.insightTitle}>Analytics & Reports</Text>
            <Text style={styles.insightSub}>Track revenue, bookings & performance</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
        </TouchableOpacity>

        <View style={styles.insightDivider} />

        <TouchableOpacity style={styles.insightRow} onPress={() => setCurrentView("settings")}>
          <View style={[styles.insightIcon, { backgroundColor: "#F1F5F9" }]}>
            <Ionicons name="settings-outline" size={20} color="#616161" />
          </View>
          <View style={styles.insightText}>
            <Text style={styles.insightTitle}>Settings</Text>
            <Text style={styles.insightSub}>Profile, notifications & preferences</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.dashSectionHeading}>Recent Activity</Text>
      <View style={styles.activityCard}>
        <View style={styles.emptyStateSmall}>
          <Ionicons name="time-outline" size={40} color="#BDBDBD" />
          <Text style={styles.emptySmallText}>No activity yet</Text>
          <Text style={styles.emptySmallSub}>Bookings and updates will show here</Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderMyTurfs = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>My Turfs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCurrentView("addTurf")}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add Turf</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="football-outline" size={56} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No turfs added yet</Text>
        <Text style={styles.emptySubtitle}>Add your first turf to start receiving bookings</Text>
        <TouchableOpacity style={styles.emptyAction} onPress={() => setCurrentView("addTurf")}>
          <Text style={styles.emptyActionText}>+ Add Your First Turf</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBookings = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Bookings</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="calendar-outline" size={56} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No bookings yet</Text>
        <Text style={styles.emptySubtitle}>When customers book your turf, they'll appear here</Text>
      </View>
    </ScrollView>
  );

  const renderSlots = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Time Slots</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="time-outline" size={56} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No time slots configured</Text>
        <Text style={styles.emptySubtitle}>Add a turf first, then configure available time slots</Text>
      </View>
    </ScrollView>
  );

  const renderPricing = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Pricing</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="pricetag-outline" size={56} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No pricing set</Text>
        <Text style={styles.emptySubtitle}>Add a turf first, then set pricing for different slots</Text>
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Analytics</Text>
      </View>
      <View style={styles.emptyState}>
        <Ionicons name="stats-chart-outline" size={56} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>No data available</Text>
        <Text style={styles.emptySubtitle}>Analytics will appear once you start receiving bookings</Text>
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Settings</Text>
      </View>
      <View style={styles.sectionCard}>
        {[
          { icon: "person-outline", label: "Profile", color: "#B71C1C" },
          { icon: "notifications-outline", label: "Notifications", color: "#7C3AED" },
          { icon: "card-outline", label: "Payment Methods", color: "#C62828" },
          { icon: "help-circle-outline", label: "Help & Support", color: "#D97706" },
          { icon: "document-text-outline", label: "Terms & Conditions", color: "#616161" },
          { icon: "log-out-outline", label: "Logout", color: "#D32F2F" },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.settingsItem, index === 5 && { borderBottomWidth: 0 }]}
            onPress={() => {
              if (item.label === "Profile") Alert.alert("Profile", "Edit your turf owner profile");
              else if (item.label === "Notifications") Alert.alert("Notifications", "Notification preferences coming soon");
              else if (item.label === "Payment Methods") router.push("/profile/payment-methods" as never);
              else if (item.label === "Help & Support") router.push("/profile/help-support" as never);
              else if (item.label === "Terms & Conditions") Alert.alert("Terms & Conditions", "Terms and conditions will open in browser");
              else if (item.label === "Logout") router.replace("/");
            }}
          >
            <View style={[styles.settingsIconBg, { backgroundColor: item.color + "15" }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={[styles.settingsLabel, item.label === "Logout" && { color: "#D32F2F" }]}>
              {item.label}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderAddTurf = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Add New Turf</Text>
      </View>
      <View style={styles.formCard}>
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Turf Name *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter turf name"
            placeholderTextColor="#9E9E9E"
            value={turfName}
            onChangeText={setTurfName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Location *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter full address"
            placeholderTextColor="#9E9E9E"
            value={turfLocation}
            onChangeText={setTurfLocation}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Turf Size</Text>
          <TextInput
            style={styles.formInput}
            placeholder="e.g. 5-a-side, 7-a-side, 11-a-side"
            placeholderTextColor="#9E9E9E"
            value={turfSize}
            onChangeText={setTurfSize}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Price per Hour (₹) *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter price"
            placeholderTextColor="#9E9E9E"
            keyboardType="numeric"
            value={turfPrice}
            onChangeText={setTurfPrice}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Contact Number *</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter phone number"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            value={turfContact}
            onChangeText={setTurfContact}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!turfName.trim() || !turfLocation.trim() || !turfPrice.trim() || !turfContact.trim()) && { opacity: 0.5 },
          ]}
          disabled={!turfName.trim() || !turfLocation.trim() || !turfPrice.trim() || !turfContact.trim()}
          onPress={() => {
            // TODO: Save to backend
            resetTurfForm();
            setCurrentView("turfs");
          }}
        >
          <LinearGradient colors={["#8B0000", "#8B0000"]} style={styles.submitBtnGrad}>
            <Text style={styles.submitBtnText}>Add Turf</Text>
            <Ionicons name="checkmark" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            resetTurfForm();
            setCurrentView("turfs");
          }}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard": return renderDashboard();
      case "turfs": return renderMyTurfs();
      case "bookings": return renderBookings();
      case "slots": return renderSlots();
      case "pricing": return renderPricing();
      case "analytics": return renderAnalytics();
      case "settings": return renderSettings();
      case "addTurf": return renderAddTurf();
      default: return renderDashboard();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#8B0000", "#8B0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.headerBtn} onPress={() => {
          if (currentView === "dashboard") {
            router.back();
          } else {
            setCurrentView("dashboard");
          }
        }}>
          <Ionicons
            name={currentView === "dashboard" ? "arrow-back" : "arrow-back"}
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {currentView === "dashboard" ? "Turf Management" : menuItems.find(m => m.key === currentView)?.label || "Add Turf"}
          </Text>
          {currentView === "dashboard" && (
            <Text style={styles.headerSubtitle}>Manage your turfs & bookings</Text>
          )}
        </View>

        <TouchableOpacity style={styles.headerBtn} onPress={() => setShowSidebar(true)}>
          <Ionicons name="menu" size={24} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      {renderCurrentView()}

      {/* Sidebar Modal */}
      <Modal visible={showSidebar} animationType="slide" transparent>
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity style={styles.sidebarDismiss} onPress={() => setShowSidebar(false)} />
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <LinearGradient colors={["#8B0000", "#8B0000"]} style={styles.sidebarHeaderGrad}>
                <Ionicons name="football" size={28} color="#FFF" />
                <Text style={styles.sidebarTitle}>Turf Manager</Text>
              </LinearGradient>
            </View>

            <ScrollView style={styles.sidebarMenu}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sidebarItem,
                    currentView === item.key && styles.sidebarItemActive,
                  ]}
                  onPress={() => {
                    setCurrentView(item.key);
                    setShowSidebar(false);
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={currentView === item.key ? "#8B0000" : "#616161"}
                  />
                  <Text
                    style={[
                      styles.sidebarItemText,
                      currentView === item.key && styles.sidebarItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.sidebarLogout} onPress={() => router.replace("/")}>
              <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
              <Text style={styles.sidebarLogoutText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FDF4" },
  header: {
    paddingTop: HEADER_PADDING_TOP + 8,
    paddingBottom: HEADER_PADDING_BOTTOM + 6,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: { padding: 8 },
  headerCenter: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFF", letterSpacing: 0.3 },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  viewContent: { flex: 1, padding: 16 },
  viewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  viewTitle: { fontSize: 22, fontWeight: "800", color: "#212121" },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 24, fontWeight: "800", color: "#212121" },
  statLabel: { fontSize: 12, color: "#616161", fontWeight: "500", marginTop: 4 },

  // Dashboard - Overview Card
  overviewCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  overviewTitle: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginBottom: 16 },
  overviewStats: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  overviewStat: { flex: 1, alignItems: "center" },
  overviewValue: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  overviewLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4, fontWeight: "500" },
  overviewDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)" },
  overviewCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  overviewCtaText: { fontSize: 13, fontWeight: "600", color: "#A7F3D0" },

  // Section Heading
  dashSectionHeading: { fontSize: 16, fontWeight: "700", color: "#212121", marginBottom: 12, marginTop: 4 },

  // Management Grid
  managementGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  mgmtCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mgmtIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  mgmtLabel: { fontSize: 14, fontWeight: "700", color: "#212121" },
  mgmtDesc: { fontSize: 11, color: "#9E9E9E", marginTop: 3 },

  // Insights Card
  insightsCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  insightIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  insightText: { flex: 1 },
  insightTitle: { fontSize: 14, fontWeight: "700", color: "#212121" },
  insightSub: { fontSize: 11, color: "#9E9E9E", marginTop: 2 },
  insightDivider: { height: 1, backgroundColor: "#F1F5F9", marginHorizontal: 16 },

  // Activity Card
  activityCard: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateSmall: { alignItems: "center", paddingVertical: 24 },
  emptySmallText: { fontSize: 14, fontWeight: "600", color: "#9E9E9E", marginTop: 10 },
  emptySmallSub: { fontSize: 12, color: "#BDBDBD", marginTop: 4 },

  // Section Card (for other views)
  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#212121", marginBottom: 16 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#424242", marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: "#9E9E9E", textAlign: "center", marginTop: 6, lineHeight: 20 },
  emptyAction: {
    marginTop: 20,
    backgroundColor: "#8B0000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: { fontSize: 14, fontWeight: "700", color: "#FFF" },

  // Add Button
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B0000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBtnText: { fontSize: 13, fontWeight: "600", color: "#FFF" },

  // Form
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  formGroup: { marginBottom: 18 },
  formLabel: { fontSize: 13, fontWeight: "600", color: "#424242", marginBottom: 8 },
  formInput: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#212121",
  },
  submitBtn: { width: "100%", borderRadius: 14, overflow: "hidden", marginTop: 8 },
  submitBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  cancelBtn: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: "600", color: "#616161" },

  // Settings
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingsIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: "600", color: "#212121", marginLeft: 12 },

  // Sidebar
  sidebarOverlay: { flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.4)" },
  sidebarDismiss: { flex: 1 },
  sidebar: {
    width: SCREEN_WIDTH * 0.72,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  sidebarHeader: { overflow: "hidden" },
  sidebarHeaderGrad: {
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sidebarTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  sidebarMenu: { flex: 1, paddingTop: 12 },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  sidebarItemActive: { backgroundColor: "#F0FDF4" },
  sidebarItemText: { fontSize: 15, fontWeight: "600", color: "#616161" },
  sidebarItemTextActive: { color: "#8B0000", fontWeight: "700" },
  sidebarLogout: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 12,
  },
  sidebarLogoutText: { fontSize: 15, fontWeight: "600", color: "#D32F2F" },
});
