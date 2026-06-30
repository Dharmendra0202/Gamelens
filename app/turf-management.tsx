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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────────────────────
type TurfView = "dashboard" | "bookings" | "turfs" | "slots" | "pricing" | "reviews" | "customers" | "addTurf" | "editTurf";

type Turf = {
  id: string;
  name: string;
  location: string;
  size: string;
  surfaceType: string;
  facilities: string[];
  isActive: boolean;
  images: string[];
};

type TimeSlot = {
  id: string;
  turfId: string;
  turfName: string;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
};

type Booking = {
  id: string;
  turfId: string;
  turfName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  duration: number;
  amount: number;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  paymentStatus: "paid" | "pending" | "refunded";
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalBookings: number;
  totalSpent: number;
  lastVisit: string;
};

type Review = {
  id: string;
  turfId: string;
  turfName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
};

export default function TurfManagementScreen() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<TurfView>("dashboard");
  const [showSidebar, setShowSidebar] = useState(false);

  // Data state - TODO(backend): Replace with API calls
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Add/Edit Turf form state
  const [editingTurfId, setEditingTurfId] = useState<string | null>(null);
  const [turfName, setTurfName] = useState("");
  const [turfLocation, setTurfLocation] = useState("");
  const [turfSize, setTurfSize] = useState("");
  const [turfSurface, setTurfSurface] = useState("");
  const [turfPrice, setTurfPrice] = useState("");
  const [turfContact, setTurfContact] = useState("");
  const [turfFloodlights, setTurfFloodlights] = useState(false);
  const [turfParking, setTurfParking] = useState(false);
  const [turfChangingRoom, setTurfChangingRoom] = useState(false);
  const [turfWashroom, setTurfWashroom] = useState(false);

  // Filter states
  const [bookingFilter, setBookingFilter] = useState<"all" | "today" | "upcoming" | "completed">("all");
  const [selectedTurfForSlots, setSelectedTurfForSlots] = useState<string | null>(null);

  const surfaceTypes = ["Natural Grass", "Artificial Turf", "Cement", "Astroturf", "Matting"];
  const sizeOptions = ["5-a-side", "6-a-side", "7-a-side", "8-a-side", "11-a-side", "Full Size"];

  const menuItems: { key: TurfView; icon: string; label: string; color: string }[] = [
    { key: "dashboard", icon: "grid-outline", label: "Dashboard", color: "#8B0000" },
    { key: "turfs", icon: "football-outline", label: "My Turfs", color: "#B71C1C" },
    { key: "bookings", icon: "calendar-outline", label: "Bookings", color: "#7C3AED" },
    { key: "slots", icon: "time-outline", label: "Time Slots", color: "#D97706" },
    { key: "pricing", icon: "pricetag-outline", label: "Pricing", color: "#D32F2F" },
    { key: "customers", icon: "people-outline", label: "Customers", color: "#059669" },
    { key: "reviews", icon: "star-outline", label: "Reviews", color: "#F59E0B" },
  ];

  const resetTurfForm = () => {
    setEditingTurfId(null);
    setTurfName("");
    setTurfLocation("");
    setTurfSize("");
    setTurfSurface("");
    setTurfPrice("");
    setTurfContact("");
    setTurfFloodlights(false);
    setTurfParking(false);
    setTurfChangingRoom(false);
    setTurfWashroom(false);
  };

  const handleSaveTurf = () => {
    if (!turfName.trim() || !turfLocation.trim() || !turfPrice.trim() || !turfContact.trim()) {
      Alert.alert("Required Fields", "Please fill in all required fields");
      return;
    }

    const facilities: string[] = [];
    if (turfFloodlights) facilities.push("Floodlights");
    if (turfParking) facilities.push("Parking");
    if (turfChangingRoom) facilities.push("Changing Room");
    if (turfWashroom) facilities.push("Washroom");

    if (editingTurfId) {
      // Update existing turf
      setTurfs(turfs.map(t => 
        t.id === editingTurfId 
          ? { 
              ...t, 
              name: turfName,
              location: turfLocation,
              size: turfSize || "Not specified",
              surfaceType: turfSurface || "Not specified",
              facilities
            }
          : t
      ));
      Alert.alert("Success", "Turf updated successfully!");
    } else {
      // Add new turf
      const newTurf: Turf = {
        id: Date.now().toString(),
        name: turfName,
        location: turfLocation,
        size: turfSize || "Not specified",
        surfaceType: turfSurface || "Not specified",
        facilities,
        isActive: true,
        images: [],
      };
      setTurfs([...turfs, newTurf]);
      Alert.alert("Success", "Turf added successfully!");
    }

    resetTurfForm();
    setCurrentView("turfs");
  };

  const handleEditTurf = (turf: Turf) => {
    setEditingTurfId(turf.id);
    setTurfName(turf.name);
    setTurfLocation(turf.location);
    setTurfSize(turf.size);
    setTurfSurface(turf.surfaceType);
    setTurfFloodlights(turf.facilities.includes("Floodlights"));
    setTurfParking(turf.facilities.includes("Parking"));
    setTurfChangingRoom(turf.facilities.includes("Changing Room"));
    setTurfWashroom(turf.facilities.includes("Washroom"));
    setCurrentView("editTurf");
  };

  const handleDeleteTurf = (turfId: string) => {
    Alert.alert(
      "Delete Turf",
      "Are you sure you want to delete this turf? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTurfs(turfs.filter(t => t.id !== turfId));
            // Also delete related time slots
            setTimeSlots(timeSlots.filter(s => s.turfId !== turfId));
            Alert.alert("Deleted", "Turf has been deleted");
          },
        },
      ]
    );
  };

  const handleToggleTurfStatus = (turfId: string) => {
    setTurfs(turfs.map(t => 
      t.id === turfId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const handleBookingAction = (bookingId: string, action: "confirm" | "cancel" | "complete") => {
    setBookings(bookings.map(b => {
      if (b.id !== bookingId) return b;
      
      switch (action) {
        case "confirm":
          return { ...b, status: "confirmed" as const };
        case "cancel":
          return { ...b, status: "cancelled" as const };
        case "complete":
          return { ...b, status: "completed" as const, paymentStatus: "paid" as const };
        default:
          return b;
      }
    }));
    Alert.alert("Success", `Booking ${action}ed successfully`);
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today);
    const todayRevenue = todayBookings
      .filter(b => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + b.amount, 0);
    
    return {
      bookings: todayBookings.length,
      revenue: todayRevenue,
      activeTurfs: turfs.filter(t => t.isActive).length,
    };
  };

  const getFilteredBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (bookingFilter) {
      case "today":
        return bookings.filter(b => b.date === today);
      case "upcoming":
        return bookings.filter(b => b.date >= today && b.status !== "completed" && b.status !== "cancelled");
      case "completed":
        return bookings.filter(b => b.status === "completed");
      default:
        return bookings;
    }
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

  const renderDashboard = () => {
    const stats = getTodayStats();
    
    return (
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
              <Text style={styles.overviewValue}>{stats.bookings}</Text>
              <Text style={styles.overviewLabel}>Bookings</Text>
            </TouchableOpacity>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>₹{stats.revenue}</Text>
              <Text style={styles.overviewLabel}>Revenue</Text>
            </View>
            <View style={styles.overviewDivider} />
            <TouchableOpacity style={styles.overviewStat} onPress={() => setCurrentView("turfs")}>
              <Text style={styles.overviewValue}>{stats.activeTurfs}</Text>
              <Text style={styles.overviewLabel}>Active Turfs</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.overviewCta} onPress={() => setCurrentView("addTurf")}>
            <Ionicons name="add-circle" size={18} color="#A7F3D0" />
            <Text style={styles.overviewCtaText}>Add New Turf</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Stats Grid */}
        <Text style={styles.dashSectionHeading}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#EDE9FE" }]}>
              <Ionicons name="football-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.statValue}>{turfs.length}</Text>
            <Text style={styles.statLabel}>Total Turfs</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="calendar" size={20} color="#DC2626" />
            </View>
            <Text style={styles.statValue}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="people" size={20} color="#059669" />
            </View>
            <Text style={styles.statValue}>{customers.length}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="star" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{reviews.length}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        {/* Management Section */}
        <Text style={styles.dashSectionHeading}>Management</Text>
        <View style={styles.managementGrid}>
          <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("turfs")}>
            <View style={[styles.mgmtIconBg, { backgroundColor: "#FFCDD2" }]}>
              <Ionicons name="football-outline" size={24} color="#C62828" />
            </View>
            <Text style={styles.mgmtLabel}>My Turfs</Text>
            <Text style={styles.mgmtDesc}>{turfs.length} registered</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("bookings")}>
            <View style={[styles.mgmtIconBg, { backgroundColor: "#EDE9FE" }]}>
              <Ionicons name="calendar-outline" size={24} color="#7C3AED" />
            </View>
            <Text style={styles.mgmtLabel}>Bookings</Text>
            <Text style={styles.mgmtDesc}>{bookings.filter(b => b.status === "pending").length} pending</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("slots")}>
            <View style={[styles.mgmtIconBg, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="time-outline" size={24} color="#D97706" />
            </View>
            <Text style={styles.mgmtLabel}>Time Slots</Text>
            <Text style={styles.mgmtDesc}>{timeSlots.length} configured</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mgmtCard} onPress={() => setCurrentView("customers")}>
            <View style={[styles.mgmtIconBg, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="people-outline" size={24} color="#059669" />
            </View>
            <Text style={styles.mgmtLabel}>Customers</Text>
            <Text style={styles.mgmtDesc}>{customers.length} registered</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.dashSectionHeading}>Recent Bookings</Text>
              <TouchableOpacity onPress={() => setCurrentView("bookings")}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityCard}>
              {bookings.slice(0, 3).map((booking) => (
                <View key={booking.id} style={styles.bookingMiniCard}>
                  <View style={styles.bookingMiniLeft}>
                    <Text style={styles.bookingMiniTitle}>{booking.turfName}</Text>
                    <Text style={styles.bookingMiniInfo}>{booking.customerName} • {booking.timeSlot}</Text>
                  </View>
                  <View style={[
                    styles.bookingStatusBadge,
                    { backgroundColor: 
                      booking.status === "confirmed" ? "#D1FAE5" :
                      booking.status === "pending" ? "#FEF3C7" :
                      booking.status === "completed" ? "#DBEAFE" : "#FEE2E2"
                    }
                  ]}>
                    <Text style={[
                      styles.bookingStatusText,
                      { color:
                        booking.status === "confirmed" ? "#059669" :
                        booking.status === "pending" ? "#D97706" :
                        booking.status === "completed" ? "#2563EB" : "#DC2626"
                      }
                    ]}>{booking.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Empty state for no turfs */}
        {turfs.length === 0 && (
          <View style={styles.activityCard}>
            <View style={styles.emptyStateSmall}>
              <Ionicons name="football-outline" size={40} color="#BDBDBD" />
              <Text style={styles.emptySmallText}>No turfs added yet</Text>
              <Text style={styles.emptySmallSub}>Add your first turf to start receiving bookings</Text>
              <TouchableOpacity style={styles.emptySmallAction} onPress={() => setCurrentView("addTurf")}>
                <Text style={styles.emptySmallActionText}>+ Add Turf</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  const renderMyTurfs = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>My Turfs</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCurrentView("addTurf")}>
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add Turf</Text>
        </TouchableOpacity>
      </View>

      {turfs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="football-outline" size={56} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No turfs added yet</Text>
          <Text style={styles.emptySubtitle}>Add your first turf to start receiving bookings</Text>
          <TouchableOpacity style={styles.emptyAction} onPress={() => setCurrentView("addTurf")}>
            <Text style={styles.emptyActionText}>+ Add Your First Turf</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {turfs.map((turf) => (
            <View key={turf.id} style={styles.turfCard}>
              <View style={styles.turfCardHeader}>
                <View style={styles.turfCardLeft}>
                  <View style={[styles.turfIconCircle, { backgroundColor: turf.isActive ? "#D1FAE5" : "#FEE2E2" }]}>
                    <Ionicons 
                      name="football" 
                      size={20} 
                      color={turf.isActive ? "#059669" : "#DC2626"} 
                    />
                  </View>
                  <View style={styles.turfCardInfo}>
                    <Text style={styles.turfCardTitle}>{turf.name}</Text>
                    <Text style={styles.turfCardLocation}>
                      <Ionicons name="location" size={12} color="#9E9E9E" /> {turf.location}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => handleToggleTurfStatus(turf.id)}
                  style={styles.turfStatusToggle}
                >
                  <View style={[
                    styles.turfStatusBadge,
                    { backgroundColor: turf.isActive ? "#D1FAE5" : "#FEE2E2" }
                  ]}>
                    <Text style={[
                      styles.turfStatusText,
                      { color: turf.isActive ? "#059669" : "#DC2626" }
                    ]}>
                      {turf.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.turfCardDetails}>
                <View style={styles.turfDetailItem}>
                  <Ionicons name="resize-outline" size={14} color="#616161" />
                  <Text style={styles.turfDetailText}>{turf.size}</Text>
                </View>
                <View style={styles.turfDetailItem}>
                  <Ionicons name="layers-outline" size={14} color="#616161" />
                  <Text style={styles.turfDetailText}>{turf.surfaceType}</Text>
                </View>
              </View>

              {turf.facilities.length > 0 && (
                <View style={styles.turfFacilities}>
                  {turf.facilities.map((facility, idx) => (
                    <View key={idx} style={styles.facilityChip}>
                      <Text style={styles.facilityChipText}>{facility}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.turfCardActions}>
                <TouchableOpacity 
                  style={styles.turfActionBtn}
                  onPress={() => {
                    setSelectedTurfForSlots(turf.id);
                    setCurrentView("slots");
                  }}
                >
                  <Ionicons name="time-outline" size={16} color="#7C3AED" />
                  <Text style={[styles.turfActionText, { color: "#7C3AED" }]}>Time Slots</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.turfActionBtn}
                  onPress={() => handleEditTurf(turf)}
                >
                  <Ionicons name="create-outline" size={16} color="#D97706" />
                  <Text style={[styles.turfActionText, { color: "#D97706" }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.turfActionBtn}
                  onPress={() => handleDeleteTurf(turf.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#DC2626" />
                  <Text style={[styles.turfActionText, { color: "#DC2626" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderBookings = () => {
    const filteredBookings = getFilteredBookings();

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
        <View style={styles.viewHeader}>
          <Text style={styles.viewTitle}>Bookings</Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterChips}>
          {(["all", "today", "upcoming", "completed"] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                bookingFilter === filter && styles.filterChipActive
              ]}
              onPress={() => setBookingFilter(filter)}
            >
              <Text style={[
                styles.filterChipText,
                bookingFilter === filter && styles.filterChipTextActive
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>
              {bookingFilter === "all" 
                ? "When customers book your turf, they'll appear here"
                : `No ${bookingFilter} bookings at the moment`
              }
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingCardHeader}>
                  <View>
                    <Text style={styles.bookingCardTitle}>{booking.turfName}</Text>
                    <Text style={styles.bookingCardCustomer}>
                      <Ionicons name="person" size={12} color="#616161" /> {booking.customerName}
                    </Text>
                  </View>
                  <View style={[
                    styles.bookingCardStatusBadge,
                    { backgroundColor: 
                      booking.status === "confirmed" ? "#D1FAE5" :
                      booking.status === "pending" ? "#FEF3C7" :
                      booking.status === "completed" ? "#DBEAFE" : "#FEE2E2"
                    }
                  ]}>
                    <Text style={[
                      styles.bookingCardStatusText,
                      { color:
                        booking.status === "confirmed" ? "#059669" :
                        booking.status === "pending" ? "#D97706" :
                        booking.status === "completed" ? "#2563EB" : "#DC2626"
                      }
                    ]}>{booking.status.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.bookingCardDetails}>
                  <View style={styles.bookingDetailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#616161" />
                    <Text style={styles.bookingDetailText}>{booking.date}</Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Ionicons name="time-outline" size={14} color="#616161" />
                    <Text style={styles.bookingDetailText}>{booking.timeSlot}</Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Ionicons name="call-outline" size={14} color="#616161" />
                    <Text style={styles.bookingDetailText}>{booking.customerPhone}</Text>
                  </View>
                </View>

                <View style={styles.bookingCardFooter}>
                  <View style={styles.bookingAmount}>
                    <Text style={styles.bookingAmountLabel}>Amount:</Text>
                    <Text style={styles.bookingAmountValue}>₹{booking.amount}</Text>
                    <View style={[
                      styles.paymentStatusDot,
                      { backgroundColor: booking.paymentStatus === "paid" ? "#059669" : "#F59E0B" }
                    ]} />
                  </View>

                  {booking.status === "pending" && (
                    <View style={styles.bookingActions}>
                      <TouchableOpacity 
                        style={[styles.bookingActionBtn, { backgroundColor: "#D1FAE5" }]}
                        onPress={() => handleBookingAction(booking.id, "confirm")}
                      >
                        <Ionicons name="checkmark" size={16} color="#059669" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.bookingActionBtn, { backgroundColor: "#FEE2E2" }]}
                        onPress={() => handleBookingAction(booking.id, "cancel")}
                      >
                        <Ionicons name="close" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {booking.status === "confirmed" && (
                    <TouchableOpacity 
                      style={[styles.bookingActionBtn, { backgroundColor: "#DBEAFE", paddingHorizontal: 12 }]}
                      onPress={() => handleBookingAction(booking.id, "complete")}
                    >
                      <Text style={{ color: "#2563EB", fontSize: 12, fontWeight: "600" }}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  const renderSlots = () => {
    const relevantSlots = selectedTurfForSlots 
      ? timeSlots.filter(s => s.turfId === selectedTurfForSlots)
      : timeSlots;
    const selectedTurf = turfs.find(t => t.id === selectedTurfForSlots);

    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
        <View style={styles.viewHeader}>
          <Text style={styles.viewTitle}>Time Slots</Text>
        </View>

        {turfs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={56} color="#BDBDBD" />
            <Text style={styles.emptyTitle}>No turfs available</Text>
            <Text style={styles.emptySubtitle}>Add a turf first, then configure available time slots</Text>
          </View>
        ) : (
          <>
            {/* Turf Selector */}
            <View style={styles.turfSelectorCard}>
              <Text style={styles.selectorLabel}>Select Turf:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.turfSelector}>
                <TouchableOpacity
                  style={[
                    styles.turfSelectorChip,
                    !selectedTurfForSlots && styles.turfSelectorChipActive
                  ]}
                  onPress={() => setSelectedTurfForSlots(null)}
                >
                  <Text style={[
                    styles.turfSelectorChipText,
                    !selectedTurfForSlots && styles.turfSelectorChipTextActive
                  ]}>All Turfs</Text>
                </TouchableOpacity>
                {turfs.map((turf) => (
                  <TouchableOpacity
                    key={turf.id}
                    style={[
                      styles.turfSelectorChip,
                      selectedTurfForSlots === turf.id && styles.turfSelectorChipActive
                    ]}
                    onPress={() => setSelectedTurfForSlots(turf.id)}
                  >
                    <Text style={[
                      styles.turfSelectorChipText,
                      selectedTurfForSlots === turf.id && styles.turfSelectorChipTextActive
                    ]}>{turf.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {relevantSlots.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={56} color="#BDBDBD" />
                <Text style={styles.emptyTitle}>No time slots configured</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedTurf ? `Configure time slots for ${selectedTurf.name}` : "Configure time slots for your turfs"}
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAction}
                  onPress={() => Alert.alert("Coming Soon", "Time slot management will be available soon")}
                >
                  <Text style={styles.emptyActionText}>+ Add Time Slots</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {relevantSlots.map((slot) => (
                  <View key={slot.id} style={styles.slotCard}>
                    <View style={styles.slotCardLeft}>
                      <View style={[
                        styles.slotIconBg,
                        { backgroundColor: slot.isAvailable ? "#D1FAE5" : "#FEE2E2" }
                      ]}>
                        <Ionicons 
                          name="time" 
                          size={18} 
                          color={slot.isAvailable ? "#059669" : "#DC2626"} 
                        />
                      </View>
                      <View>
                        <Text style={styles.slotCardTitle}>{slot.turfName}</Text>
                        <Text style={styles.slotCardTime}>{slot.startTime} - {slot.endTime}</Text>
                      </View>
                    </View>
                    <View style={styles.slotCardRight}>
                      <Text style={styles.slotPrice}>₹{slot.price}</Text>
                      <View style={[
                        styles.slotAvailableBadge,
                        { backgroundColor: slot.isAvailable ? "#D1FAE5" : "#FEE2E2" }
                      ]}>
                        <Text style={[
                          styles.slotAvailableText,
                          { color: slot.isAvailable ? "#059669" : "#DC2626" }
                        ]}>{slot.isAvailable ? "Available" : "Booked"}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  const renderCustomers = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Customers</Text>
      </View>

      {customers.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={56} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No customers yet</Text>
          <Text style={styles.emptySubtitle}>Customer data will appear once you receive bookings</Text>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {customers.map((customer) => (
            <View key={customer.id} style={styles.customerCard}>
              <View style={styles.customerCardHeader}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {customer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{customer.name}</Text>
                  <Text style={styles.customerContact}>{customer.phone}</Text>
                  {customer.email && (
                    <Text style={styles.customerEmail}>{customer.email}</Text>
                  )}
                </View>
              </View>
              <View style={styles.customerStats}>
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatValue}>{customer.totalBookings}</Text>
                  <Text style={styles.customerStatLabel}>Bookings</Text>
                </View>
                <View style={styles.customerStatDivider} />
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatValue}>₹{customer.totalSpent}</Text>
                  <Text style={styles.customerStatLabel}>Total Spent</Text>
                </View>
                <View style={styles.customerStatDivider} />
                <View style={styles.customerStat}>
                  <Text style={styles.customerStatValue}>{customer.lastVisit}</Text>
                  <Text style={styles.customerStatLabel}>Last Visit</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderReviews = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Reviews & Ratings</Text>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={56} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptySubtitle}>Customer reviews will appear here once they rate your turfs</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {review.customerName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={styles.reviewCustomerName}>{review.customerName}</Text>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={14}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.date}</Text>
              </View>
              <Text style={styles.reviewTurfName}>{review.turfName}</Text>
              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderPricing = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>Pricing Management</Text>
      </View>

      {turfs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="pricetag-outline" size={56} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No turfs available</Text>
          <Text style={styles.emptySubtitle}>Add a turf first, then set pricing for different slots</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {turfs.map((turf) => (
            <View key={turf.id} style={styles.pricingCard}>
              <View style={styles.pricingCardHeader}>
                <View style={styles.pricingIconBg}>
                  <Ionicons name="football" size={20} color="#8B0000" />
                </View>
                <View style={styles.pricingInfo}>
                  <Text style={styles.pricingCardTitle}>{turf.name}</Text>
                  <Text style={styles.pricingCardLocation}>{turf.location}</Text>
                </View>
              </View>

              <View style={styles.pricingDetails}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Regular Hours (6 AM - 6 PM)</Text>
                  <TouchableOpacity 
                    style={styles.pricingEditBtn}
                    onPress={() => Alert.alert("Set Price", "Price management coming soon")}
                  >
                    <Text style={styles.pricingValue}>₹800/hr</Text>
                    <Ionicons name="create-outline" size={14} color="#D97706" />
                  </TouchableOpacity>
                </View>

                <View style={styles.pricingDivider} />

                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Peak Hours (6 PM - 11 PM)</Text>
                  <TouchableOpacity 
                    style={styles.pricingEditBtn}
                    onPress={() => Alert.alert("Set Price", "Price management coming soon")}
                  >
                    <Text style={styles.pricingValue}>₹1200/hr</Text>
                    <Ionicons name="create-outline" size={14} color="#D97706" />
                  </TouchableOpacity>
                </View>

                <View style={styles.pricingDivider} />

                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Weekend Rates</Text>
                  <TouchableOpacity 
                    style={styles.pricingEditBtn}
                    onPress={() => Alert.alert("Set Price", "Price management coming soon")}
                  >
                    <Text style={styles.pricingValue}>₹1500/hr</Text>
                    <Ionicons name="create-outline" size={14} color="#D97706" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderAddTurf = () => (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.viewContent}>
      <View style={styles.viewHeader}>
        <Text style={styles.viewTitle}>{editingTurfId ? "Edit Turf" : "Add New Turf"}</Text>
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
          <Text style={styles.formLabel}>Location / Address *</Text>
          <TextInput
            style={[styles.formInput, { height: 70 }]}
            placeholder="Enter full address"
            placeholderTextColor="#9E9E9E"
            value={turfLocation}
            onChangeText={setTurfLocation}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Turf Size</Text>
          <View style={styles.chipRow}>
            {sizeOptions.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeChip,
                  turfSize === size && styles.sizeChipActive
                ]}
                onPress={() => setTurfSize(size)}
              >
                <Text style={[
                  styles.sizeChipText,
                  turfSize === size && styles.sizeChipTextActive
                ]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Surface Type</Text>
          <View style={styles.chipRow}>
            {surfaceTypes.map((surface) => (
              <TouchableOpacity
                key={surface}
                style={[
                  styles.sizeChip,
                  turfSurface === surface && styles.sizeChipActive
                ]}
                onPress={() => setTurfSurface(surface)}
              >
                <Text style={[
                  styles.sizeChipText,
                  turfSurface === surface && styles.sizeChipTextActive
                ]}>{surface}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Base Price per Hour (₹) *</Text>
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

        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>Facilities</Text>
          <View style={styles.facilitiesGrid}>
            <TouchableOpacity
              style={styles.facilityToggle}
              onPress={() => setTurfFloodlights(!turfFloodlights)}
            >
              <View style={styles.facilityToggleLeft}>
                <Ionicons name="bulb-outline" size={18} color="#616161" />
                <Text style={styles.facilityToggleText}>Floodlights</Text>
              </View>
              <Switch
                value={turfFloodlights}
                onValueChange={setTurfFloodlights}
                trackColor={{ false: "#E0E0E0", true: "#8B0000" }}
                thumbColor="#FFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facilityToggle}
              onPress={() => setTurfParking(!turfParking)}
            >
              <View style={styles.facilityToggleLeft}>
                <Ionicons name="car-outline" size={18} color="#616161" />
                <Text style={styles.facilityToggleText}>Parking</Text>
              </View>
              <Switch
                value={turfParking}
                onValueChange={setTurfParking}
                trackColor={{ false: "#E0E0E0", true: "#8B0000" }}
                thumbColor="#FFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facilityToggle}
              onPress={() => setTurfChangingRoom(!turfChangingRoom)}
            >
              <View style={styles.facilityToggleLeft}>
                <Ionicons name="shirt-outline" size={18} color="#616161" />
                <Text style={styles.facilityToggleText}>Changing Room</Text>
              </View>
              <Switch
                value={turfChangingRoom}
                onValueChange={setTurfChangingRoom}
                trackColor={{ false: "#E0E0E0", true: "#8B0000" }}
                thumbColor="#FFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.facilityToggle}
              onPress={() => setTurfWashroom(!turfWashroom)}
            >
              <View style={styles.facilityToggleLeft}>
                <Ionicons name="water-outline" size={18} color="#616161" />
                <Text style={styles.facilityToggleText}>Washroom</Text>
              </View>
              <Switch
                value={turfWashroom}
                onValueChange={setTurfWashroom}
                trackColor={{ false: "#E0E0E0", true: "#8B0000" }}
                thumbColor="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!turfName.trim() || !turfLocation.trim() || !turfPrice.trim() || !turfContact.trim()) && { opacity: 0.5 },
          ]}
          disabled={!turfName.trim() || !turfLocation.trim() || !turfPrice.trim() || !turfContact.trim()}
          onPress={handleSaveTurf}
        >
          <LinearGradient colors={["#8B0000", "#8B0000"]} style={styles.submitBtnGrad}>
            <Text style={styles.submitBtnText}>{editingTurfId ? "Update Turf" : "Add Turf"}</Text>
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
      case "customers": return renderCustomers();
      case "reviews": return renderReviews();
      case "addTurf":
      case "editTurf":
        return renderAddTurf();
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
            {currentView === "dashboard" 
              ? "Turf Management" 
              : currentView === "editTurf"
              ? "Edit Turf"
              : menuItems.find(m => m.key === currentView)?.label || "Add Turf"
            }
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

  // Section Header Row
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  viewAllText: { fontSize: 13, fontWeight: "600", color: "#8B0000" },

  // Booking Mini Card (for dashboard)
  bookingMiniCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  bookingMiniLeft: { flex: 1 },
  bookingMiniTitle: { fontSize: 14, fontWeight: "600", color: "#212121" },
  bookingMiniInfo: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  bookingStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingStatusText: { fontSize: 11, fontWeight: "600" },
  emptySmallAction: {
    marginTop: 16,
    backgroundColor: "#8B0000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptySmallActionText: { fontSize: 13, fontWeight: "600", color: "#FFF" },

  // Turf Card
  turfCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  turfCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  turfCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  turfIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  turfCardInfo: { flex: 1 },
  turfCardTitle: { fontSize: 16, fontWeight: "700", color: "#212121" },
  turfCardLocation: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  turfStatusToggle: {},
  turfStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  turfStatusText: { fontSize: 11, fontWeight: "600" },
  turfCardDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  turfDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  turfDetailText: { fontSize: 12, color: "#616161", fontWeight: "500" },
  turfFacilities: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  facilityChip: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  facilityChipText: { fontSize: 11, fontWeight: "500", color: "#059669" },
  turfCardActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  turfActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  turfActionText: { fontSize: 12, fontWeight: "600" },

  // Filter Chips
  filterChips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
  },
  filterChipTextActive: {
    color: "#FFF",
  },

  // Booking Card
  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bookingCardTitle: { fontSize: 16, fontWeight: "700", color: "#212121" },
  bookingCardCustomer: { fontSize: 12, color: "#616161", marginTop: 4 },
  bookingCardStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingCardStatusText: { fontSize: 10, fontWeight: "700" },
  bookingCardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  bookingDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingDetailText: { fontSize: 13, color: "#616161" },
  bookingCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  bookingAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookingAmountLabel: { fontSize: 12, color: "#9E9E9E" },
  bookingAmountValue: { fontSize: 16, fontWeight: "700", color: "#212121" },
  paymentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bookingActions: {
    flexDirection: "row",
    gap: 8,
  },
  bookingActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  // Turf Selector for Slots
  turfSelectorCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorLabel: { fontSize: 13, fontWeight: "600", color: "#616161", marginBottom: 10 },
  turfSelector: {
    flexDirection: "row",
  },
  turfSelectorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  turfSelectorChipActive: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  turfSelectorChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
  },
  turfSelectorChipTextActive: {
    color: "#FFF",
  },

  // Slot Card
  slotCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  slotCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slotIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  slotCardTitle: { fontSize: 14, fontWeight: "600", color: "#212121" },
  slotCardTime: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  slotCardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  slotPrice: { fontSize: 16, fontWeight: "700", color: "#8B0000" },
  slotAvailableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotAvailableText: { fontSize: 10, fontWeight: "600" },

  // Customer Card
  customerCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  customerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#8B0000",
    alignItems: "center",
    justifyContent: "center",
  },
  customerAvatarText: { fontSize: 20, fontWeight: "700", color: "#FFF" },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 16, fontWeight: "700", color: "#212121" },
  customerContact: { fontSize: 12, color: "#616161", marginTop: 2 },
  customerEmail: { fontSize: 11, color: "#9E9E9E", marginTop: 1 },
  customerStats: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  customerStat: {
    flex: 1,
    alignItems: "center",
  },
  customerStatValue: { fontSize: 18, fontWeight: "700", color: "#212121" },
  customerStatLabel: { fontSize: 11, color: "#9E9E9E", marginTop: 2 },
  customerStatDivider: {
    width: 1,
    backgroundColor: "#F1F5F9",
  },

  // Review Card
  reviewCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  reviewInfo: { flex: 1 },
  reviewCustomerName: { fontSize: 14, fontWeight: "600", color: "#212121" },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  reviewDate: { fontSize: 11, color: "#9E9E9E" },
  reviewTurfName: { fontSize: 12, fontWeight: "500", color: "#616161", marginBottom: 6 },
  reviewComment: { fontSize: 13, color: "#424242", lineHeight: 18 },

  // Pricing Card
  pricingCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pricingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  pricingIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  pricingInfo: { flex: 1 },
  pricingCardTitle: { fontSize: 16, fontWeight: "700", color: "#212121" },
  pricingCardLocation: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  pricingDetails: {},
  pricingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  pricingLabel: { fontSize: 13, color: "#616161", flex: 1 },
  pricingEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pricingValue: { fontSize: 14, fontWeight: "700", color: "#212121" },
  pricingDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },

  // Form enhancements
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sizeChipActive: {
    backgroundColor: "#8B0000",
    borderColor: "#8B0000",
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#616161",
  },
  sizeChipTextActive: {
    color: "#FFF",
  },
  facilitiesGrid: {
    gap: 12,
  },
  facilityToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  facilityToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  facilityToggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#424242",
  },
});
