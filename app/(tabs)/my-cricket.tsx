import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function MyCricketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("matches");
  const [activeFilter, setActiveFilter] = useState("your");
  const [activeTournamentFilter, setActiveTournamentFilter] = useState("your");
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | null>(null);
  const [currentView, setCurrentView] = useState<
    "matches" | "teamSelection" | "selectTeam" | "createTeam" | "matchSetup" | "createTournament" | "tournamentTeamManagement" | "tournamentDashboard"
  >("matches");
  const [teamSlot, setTeamSlot] = useState<"A" | "B" | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  
  // Team data
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [currentTeamName, setCurrentTeamName] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentCaptain, setCurrentCaptain] = useState("");
  const [currentPlayers, setCurrentPlayers] = useState("");

  // Match Setup data
  const [matchType, setMatchType] = useState<string>("");
  const [numberOfOvers, setNumberOfOvers] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedGround, setSelectedGround] = useState("");
  const [pitchType, setPitchType] = useState<string>("");
  const [ballType, setBallType] = useState<string>("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [wagonWheelEnabled, setWagonWheelEnabled] = useState(false);
  const [umpire1, setUmpire1] = useState("");
  const [umpire2, setUmpire2] = useState("");
  const [scorer, setScorer] = useState("");
  const [liveStreamer, setLiveStreamer] = useState("");
  const [others, setOthers] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [nearbyGrounds, setNearbyGrounds] = useState<Array<{
    id: number;
    name: string;
    distance: string;
    city: string;
    pitchType: string;
  }>>([]);
  const [scrollIndicatorPosition, setScrollIndicatorPosition] = useState(0);
  const scrollViewRef2 = useRef<ScrollView>(null);

  // Tournament data
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentCity, setTournamentCity] = useState("");
  const [tournamentGround, setTournamentGround] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [organizerNumber, setOrganizerNumber] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [tournamentStartDate, setTournamentStartDate] = useState("");
  const [tournamentEndDate, setTournamentEndDate] = useState("");
  const [tournamentCategory, setTournamentCategory] = useState("");
  const [tournamentBallType, setTournamentBallType] = useState("");
  const [tournamentPitchType, setTournamentPitchType] = useState("");
  const [tournamentMatchType, setTournamentMatchType] = useState("");
  const [needMoreTeams, setNeedMoreTeams] = useState(false);
  const [needOfficials, setNeedOfficials] = useState(false);
  const [activeTournamentTab, setActiveTournamentTab] = useState("matches");

  // Reusable render functions
  const renderTextInput = (label: string, value: string, onChange: (text: string) => void, placeholder: string, required = false, keyboardType: any = "default") => (
    <View style={styles.formGroup}>
      <Text style={styles.formLabel}>{label} {required && "*"}</Text>
      <TextInput
        style={styles.formInput}
        placeholder={placeholder}
        placeholderTextColor="#CCC"
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderChipGroup = (items: string[], selected: string, onSelect: (item: string) => void, activeColor: string) => (
    <View style={styles.chipGrid}>
      {items.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.chip, selected === item && { backgroundColor: activeColor, borderColor: activeColor }]}
          onPress={() => onSelect(item)}
        >
          <Text style={[styles.chipText, selected === item && styles.chipTextActive]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const vsTeamAnim = useRef(new Animated.Value(0)).current;
  const vsTeamBanim = useRef(new Animated.Value(0)).current;
  const vsTextAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Stagger card animations
    Animated.stagger(
      150,
      cardAnimations.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, []);

  // Handle navigation parameters from home screen
  useFocusEffect(
    useCallback(() => {
      if (params.action === 'createTournament') {
        // Set to tournaments tab and keep currentView as "matches" so tabs are visible
        setActiveTab('tournaments');
        setCurrentView('matches');
      } else if (params.action === 'startMatch') {
        // Set to matches tab and show team selection
        setActiveTab('matches');
        setCurrentView('teamSelection');
        setShowTeamSelection(true);
      }
    }, [params.action])
  );

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentView === "matchSetup") {
          setCurrentView("teamSelection");
          vsTeamAnim.setValue(0);
          vsTeamBanim.setValue(0);
          vsTextAnim.setValue(0);
          return true;
        }
        if (currentView === "selectTeam" || currentView === "createTeam") {
          setCurrentView("teamSelection");
          setShowAddPlayerModal(false);
          return true;
        }
        if (currentView === "teamSelection") {
          setCurrentView("matches");
          setShowTeamSelection(false);
          setSelectedTeam(null);
          return true;
        }
        if (currentView === "createTournament") {
          setCurrentView("matches");
          return true;
        }
        if (currentView === "tournamentTeamManagement") {
          setCurrentView("createTournament");
          setShowAddPlayerModal(false);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [currentView]),
  );

  const handleStartMatch = () => {
    // Show team selection instead of navigating
    setCurrentView("teamSelection");
    setShowTeamSelection(true);
  };

  const handleSelectTeam = (slot: "A" | "B") => {
    setTeamSlot(slot);
    setCurrentView("selectTeam");
  };

  const handleCreateTeam = (slot: "A" | "B") => {
    setTeamSlot(slot);
    // Reset all form fields and close modal
    setCurrentTeamName("");
    setCurrentCity("");
    setCurrentMobile("");
    setCurrentCaptain("");
    setCurrentPlayers("");
    setShowAddPlayerModal(false);
    setCurrentView("createTeam");
    // Scroll to top when entering create team view
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    }, 100);
  };

  const handleSaveTeam = () => {
    // Validate all required fields
    if (!currentTeamName.trim()) {
      alert("Please enter team name");
      return;
    }
    if (!currentCity.trim()) {
      alert("Please enter city/town");
      return;
    }
    if (!currentMobile.trim() || currentMobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!currentCaptain.trim()) {
      alert("Please enter team captain name");
      return;
    }
    if (!currentPlayers.trim() || parseInt(currentPlayers) < 11 || parseInt(currentPlayers) > 20) {
      alert("Please enter number of players (11-20)");
      return;
    }

    // Save team name
    if (teamSlot === "A") {
      setTeamAName(currentTeamName);
    } else if (teamSlot === "B") {
      setTeamBName(currentTeamName);
    }
    
    // Reset form
    setCurrentTeamName("");
    setCurrentCity("");
    setCurrentMobile("");
    setCurrentCaptain("");
    setCurrentPlayers("");
    
    console.log(`Created team for Team ${teamSlot}: ${currentTeamName}`);
    handleBackToTeamSelection();
  };

  const handleBackToTeamSelection = () => {
    // Close modal and scroll to top when going back
    setShowAddPlayerModal(false);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setCurrentView("teamSelection");
    // Reset VS animations
    vsTeamAnim.setValue(0);
    vsTeamBanim.setValue(0);
    vsTextAnim.setValue(0);
  };

  const handleBackToMatches = () => {
    setCurrentView("matches");
    setShowTeamSelection(false);
    setSelectedTeam(null);
  };

  const handleLetsPlay = () => {
    console.log("Starting match setup...");
    console.log("Team A:", teamAName);
    console.log("Team B:", teamBName);
    setCurrentView("matchSetup");
    
    // Trigger VS animations
    setTimeout(() => {
      // Team A slides in from left
      Animated.spring(vsTeamAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 100);

    setTimeout(() => {
      // Team B slides in from right
      Animated.spring(vsTeamBanim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, 300);

    setTimeout(() => {
      // VS text appears with scale
      Animated.spring(vsTextAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 600);
  };

  const handleEnableLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to find nearby grounds. Please enable location access in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }

      // Show loading state
      setLocationEnabled(true);
      
      // Try to get location with timeout
      try {
        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Location timeout')), 10000)
          )
        ]) as Location.LocationObject;

        console.log("Current location:", location.coords);
      } catch (locationError) {
        console.log("Location fetch failed, using dummy data:", locationError);
        // Continue with dummy data even if location fetch fails
      }
      
      // Dummy data for nearby grounds (in real app, this would be an API call with lat/long)
      const dummyGrounds = [
        { id: 1, name: "Wankhede Stadium", distance: "1.2 km", city: "Mumbai", pitchType: "turf" },
        { id: 2, name: "Brabourne Stadium", distance: "2.5 km", city: "Mumbai", pitchType: "turf" },
        { id: 3, name: "DY Patil Stadium", distance: "3.8 km", city: "Mumbai", pitchType: "cement" },
        { id: 4, name: "Shivaji Park Ground", distance: "4.2 km", city: "Mumbai", pitchType: "rough" },
        { id: 5, name: "Marine Drive Ground", distance: "5.1 km", city: "Mumbai", pitchType: "matting" },
        { id: 6, name: "Azad Maidan", distance: "5.5 km", city: "Mumbai", pitchType: "rough" },
        { id: 7, name: "Cross Maidan", distance: "6.0 km", city: "Mumbai", pitchType: "cement" },
        { id: 8, name: "Oval Maidan", distance: "6.3 km", city: "Mumbai", pitchType: "turf" },
      ];
      
      setNearbyGrounds(dummyGrounds);
      
      // Auto-select the nearest ground
      const nearestGround = dummyGrounds[0];
      setSelectedGround(nearestGround.name);
      setSelectedCity(nearestGround.city);
      setPitchType(nearestGround.pitchType);
      
      Alert.alert(
        "Location Enabled!",
        `Found ${dummyGrounds.length} nearby grounds. Nearest: ${nearestGround.name}`,
        [{ text: "OK" }]
      );

      console.log("Location enabled, nearest ground:", nearestGround.name);
    } catch (error) {
      console.error("Error enabling location:", error);
      setLocationEnabled(false);
      Alert.alert(
        "Error",
        "Failed to enable location. Please make sure location services are enabled on your device and try again.",
        [{ text: "OK" }]
      );
    }
  };

  const toggleAddPlayerModal = () => {
    if (showAddPlayerModal) {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }).start(() => setShowAddPlayerModal(false));
    } else {
      setShowAddPlayerModal(true);
      // Scroll to bottom to ensure modal is visible
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 250);
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  const matches = [
    {
      id: 1,
      type: "Individual Match",
      status: "Upcoming",
      team: "Rhjvssst",
      date: "Yesterday",
      overs: "20 Ov.",
      format: "Box",
      location: "Mumbai, Bhayander West",
      time: "09:00 AM",
    },
    {
      id: 2,
      type: "Team Match",
      status: "Completed",
      team: "Warriors vs Strikers",
      date: "2 days ago",
      overs: "20 Ov.",
      format: "Box",
      location: "Wankhede Stadium",
      time: "06:00 PM",
      result: "Won by 6 wickets",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Animated Header - Always show */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LinearGradient
          colors={["#E63946", "#C1121F", "#780000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            {/* Show back button on non-matches views */}
            {currentView !== "matches" && (
              <TouchableOpacity
                style={styles.headerBackButton}
                onPress={() => {
                  if (currentView === "matchSetup") {
                    setCurrentView("teamSelection");
                    vsTeamAnim.setValue(0);
                    vsTeamBanim.setValue(0);
                    vsTextAnim.setValue(0);
                  } else if (currentView === "selectTeam" || currentView === "createTeam") {
                    setCurrentView("teamSelection");
                    setShowAddPlayerModal(false);
                  } else if (currentView === "teamSelection") {
                    setCurrentView("matches");
                    setShowTeamSelection(false);
                    setSelectedTeam(null);
                  } else if (currentView === "createTournament") {
                    setCurrentView("matches");
                  } else if (currentView === "tournamentTeamManagement") {
                    setCurrentView("createTournament");
                    setShowAddPlayerModal(false);
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.notificationDot} />
              <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="filter" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Animated Tabs - Only show on matches view */}
      {currentView === "matches" && (
        <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
          {["matches", "tournaments", "teams"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && (
                <Animated.View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {currentView === "createTournament" ? (
          /* Create Tournament Form View */
          <View style={styles.createTournamentFormContainer}>
            <Text style={styles.formTitle}>Add a tournament / series</Text>
            
            <View style={styles.formCard}>
              {/* Add Banner */}
              <TouchableOpacity style={styles.addMediaButton}>
                <View style={[styles.mediaPlaceholder, { height: 120 }]}>
                  <Ionicons name="image-outline" size={40} color="#CCC" />
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                </View>
                <Text style={styles.addMediaText}>Add banner</Text>
              </TouchableOpacity>

              {/* Add Logo */}
              <TouchableOpacity style={styles.addMediaButton}>
                <View style={[styles.mediaPlaceholder, { width: 80, height: 80, borderRadius: 40 }]}>
                  <Ionicons name="person-circle-outline" size={40} color="#CCC" />
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={12} color="#FFF" />
                  </View>
                </View>
                <Text style={styles.addMediaText}>Add logo</Text>
              </TouchableOpacity>

              {/* Form Fields */}
              {renderTextInput("Tournament / series name", tournamentName, setTournamentName, "Enter your tournament name", true)}
              {renderTextInput("City", tournamentCity, setTournamentCity, "Enter city", true)}
              {renderTextInput("Ground", tournamentGround, setTournamentGround, "Enter ground name", true)}
              {renderTextInput("Organiser name", organizerName, setOrganizerName, "Enter organiser name", true)}
              {renderTextInput("Organiser number", organizerNumber, setOrganizerNumber, "Enter phone number", true, "phone-pad")}
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Organiser email</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter email"
                  placeholderTextColor="#CCC"
                  keyboardType="email-address"
                  value={organizerEmail}
                  onChangeText={setOrganizerEmail}
                />
                <Text style={styles.emailHint}>*Get updated with CricHeroes offers and help videos on mail.</Text>
              </View>

              {/* Tournament Dates */}
              <Text style={styles.sectionHeading}>Tournament dates</Text>
              <View style={styles.dateRow}>
                {["Start date", "End date"].map((label, idx) => (
                  <View key={label} style={styles.dateField}>
                    <Text style={styles.formLabel}>{label} *</Text>
                    <TouchableOpacity style={styles.dateInput}>
                      <TextInput
                        style={styles.dateInputText}
                        placeholder="Select date"
                        placeholderTextColor="#CCC"
                        value={idx === 0 ? tournamentStartDate : tournamentEndDate}
                        editable={false}
                      />
                      <Ionicons name="calendar-outline" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Tournament Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tournament category *</Text>
                {renderChipGroup(
                  ["OPEN", "CORPORATE", "COMMUNITY", "SCHOOL", "OTHER", "SERIES", "COLLEGE", "UNIVERSITY"],
                  tournamentCategory,
                  setTournamentCategory,
                  "#E63946"
                )}
              </View>

              {/* Select Ball Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select ball type *</Text>
                <View style={styles.ballTypeRow}>
                  {[
                    { id: "tennis", label: "Tennis", color: "#4CAF50" },
                    { id: "leather", label: "Leather", color: "#E63946" },
                    { id: "other", label: "Other", color: "#FFA500" },
                  ].map((ball) => (
                    <TouchableOpacity
                      key={ball.id}
                      style={styles.ballTypeOption}
                      onPress={() => setTournamentBallType(ball.id)}
                    >
                      <View style={[
                        styles.ballTypeCircleLarge,
                        { backgroundColor: tournamentBallType === ball.id ? ball.color : "#F0F0F0" },
                      ]}>
                        {tournamentBallType === ball.id && (
                          <Ionicons name="checkmark" size={24} color="#FFF" />
                        )}
                      </View>
                      <Text style={styles.ballTypeLabel}>{ball.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Pitch Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Pitch type</Text>
                {renderChipGroup(
                  ["ROUGH", "CEMENT", "TURF", "ASTROTURF", "MATTING"],
                  tournamentPitchType,
                  setTournamentPitchType,
                  "#17A2B8"
                )}
              </View>

              {/* Match Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Match type *</Text>
                {renderChipGroup(
                  ["Limited Overs", "Box/Turf Cricket", "Pair Cricket", "Test Match", "The Hundred"],
                  tournamentMatchType,
                  setTournamentMatchType,
                  "#9D4EDD"
                )}
              </View>

              {/* Checkboxes */}
              {[
                { label: "Do you need more teams for your tournament?", value: needMoreTeams, setter: setNeedMoreTeams },
                { label: "Do you need officials? (e.g. Umpire, Scorer)", value: needOfficials, setter: setNeedOfficials },
              ].map((checkbox, idx) => (
                <TouchableOpacity 
                  key={idx}
                  style={styles.checkboxRow}
                  onPress={() => checkbox.setter(!checkbox.value)}
                >
                  <View style={[styles.checkbox, checkbox.value && styles.checkboxChecked]}>
                    {checkbox.value && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>{checkbox.label}</Text>
                </TouchableOpacity>
              ))}

              {/* Next Button */}
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={() => {
                  // Validate required fields
                  if (!tournamentName.trim()) {
                    Alert.alert("Required Field", "Please enter tournament name");
                    return;
                  }
                  if (!tournamentCity.trim()) {
                    Alert.alert("Required Field", "Please enter city");
                    return;
                  }
                  if (!tournamentGround.trim()) {
                    Alert.alert("Required Field", "Please enter ground name");
                    return;
                  }
                  if (!organizerName.trim()) {
                    Alert.alert("Required Field", "Please enter organiser name");
                    return;
                  }
                  if (!organizerNumber.trim()) {
                    Alert.alert("Required Field", "Please enter organiser number");
                    return;
                  }
                  if (!tournamentCategory) {
                    Alert.alert("Required Field", "Please select tournament category");
                    return;
                  }
                  if (!tournamentBallType) {
                    Alert.alert("Required Field", "Please select ball type");
                    return;
                  }
                  if (!tournamentMatchType) {
                    Alert.alert("Required Field", "Please select match type");
                    return;
                  }
                  
                  // Navigate to team management view
                  setCurrentView("tournamentTeamManagement");
                  setShowAddPlayerModal(true);
                }}
              >
                <LinearGradient
                  colors={["#E63946", "#C1121F", "#780000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>NEXT</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </View>
          </View>
        ) : currentView === "tournamentTeamManagement" ? (
          /* Tournament Team Management View */
          <View style={styles.teamSelectionContainer}>
            {/* Dashboard Header */}
            <View style={styles.dashboardHeader}>
              <Text style={styles.dashboardTitle}>{tournamentName}</Text>
              <Text style={styles.dashboardSubtitle}>Tournament Overview</Text>
            </View>

            {/* Dashboard Tabs */}
            <View style={styles.dashboardTabs}>
              {["matches", "points", "leaderboard", "teams"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.dashboardTab,
                    activeTournamentTab === tab && styles.dashboardTabActive,
                  ]}
                  onPress={() => setActiveTournamentTab(tab)}
                >
                  <Text
                    style={[
                      styles.dashboardTabText,
                      activeTournamentTab === tab && styles.dashboardTabTextActive,
                    ]}
                  >
                    {tab === "matches" && "Matches"}
                    {tab === "points" && "Points"}
                    {tab === "leaderboard" && "Leaderboard"}
                    {tab === "teams" && "Teams"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content based on active tab */}
            {activeTournamentTab === "matches" && (
              <ScrollView style={styles.dashboardTabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.dashboardSectionTitle}>Upcoming Matches</Text>
                {[
                  { id: 1, team1: "Team A", team2: "Team B", date: "Today, 6:00 PM", venue: "Ground 1" },
                  { id: 2, team1: "Team C", team2: "Team D", date: "Tomorrow, 7:00 PM", venue: "Ground 2" },
                ].map((match) => (
                  <TouchableOpacity key={match.id} style={styles.matchItem}>
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.matchItemGradient}
                    >
                      <View style={styles.matchTeams}>
                        <Text style={styles.matchTeamName}>{match.team1}</Text>
                        <Text style={styles.matchVs}>vs</Text>
                        <Text style={styles.matchTeamName}>{match.team2}</Text>
                      </View>
                      <View style={styles.matchDetails}>
                        <View style={styles.matchDetailRow}>
                          <Ionicons name="time-outline" size={14} color="#666" />
                          <Text style={styles.matchDetailText}>{match.date}</Text>
                        </View>
                        <View style={styles.matchDetailRow}>
                          <Ionicons name="location-outline" size={14} color="#666" />
                          <Text style={styles.matchDetailText}>{match.venue}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {activeTournamentTab === "points" && (
              <ScrollView style={styles.dashboardTabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.dashboardSectionTitle}>Points Table</Text>
                <View style={styles.pointsTable}>
                  <View style={styles.pointsTableHeader}>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>Team</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>P</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>W</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>L</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>Pts</Text>
                  </View>
                  {[
                    { team: "Team A", p: 5, w: 4, l: 1, pts: 8 },
                    { team: "Team B", p: 5, w: 3, l: 2, pts: 6 },
                    { team: "Team C", p: 4, w: 2, l: 2, pts: 4 },
                  ].map((row, idx) => (
                    <View key={idx} style={styles.pointsTableRow}>
                      <Text style={[styles.pointsTableCell, styles.pointsTableTeamCell]}>{row.team}</Text>
                      <Text style={styles.pointsTableCell}>{row.p}</Text>
                      <Text style={styles.pointsTableCell}>{row.w}</Text>
                      <Text style={styles.pointsTableCell}>{row.l}</Text>
                      <Text style={[styles.pointsTableCell, styles.pointsTablePtsCell]}>{row.pts}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {activeTournamentTab === "leaderboard" && (
              <ScrollView style={styles.dashboardTabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.dashboardSectionTitle}>Top Performers</Text>
                {[
                  { rank: 1, name: "Virat Kohli", team: "Team A", runs: 450, icon: "🥇" },
                  { rank: 2, name: "Rohit Sharma", team: "Team B", runs: 420, icon: "🥈" },
                  { rank: 3, name: "Suresh Raina", team: "Team C", runs: 380, icon: "🥉" },
                ].map((player) => (
                  <View key={player.rank} style={styles.leaderboardItem}>
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.leaderboardItemGradient}
                    >
                      <View style={styles.leaderboardRank}>
                        <Text style={styles.leaderboardRankText}>{player.icon}</Text>
                      </View>
                      <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>{player.name}</Text>
                        <Text style={styles.leaderboardTeam}>{player.team}</Text>
                      </View>
                      <View style={styles.leaderboardStats}>
                        <Text style={styles.leaderboardRuns}>{player.runs}</Text>
                        <Text style={styles.leaderboardRunsLabel}>Runs</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
            )}

            {activeTournamentTab === "teams" && (
              <ScrollView style={styles.dashboardTabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.dashboardSectionTitle}>Tournament Teams</Text>
                {[
                  { id: 1, name: "Team A", players: 11, captain: "Virat Kohli", status: "Active" },
                  { id: 2, name: "Team B", players: 11, captain: "Rohit Sharma", status: "Active" },
                  { id: 3, name: "Team C", players: 11, captain: "Suresh Raina", status: "Active" },
                  { id: 4, name: "Team D", players: 11, captain: "MS Dhoni", status: "Pending" },
                ].map((team) => (
                  <View key={team.id} style={styles.teamItemCard}>
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.teamItemGradient}
                    >
                      <View style={styles.teamItemHeader}>
                        <LinearGradient
                          colors={["#17A2B8", "#138496"]}
                          style={styles.teamItemIcon}
                        >
                          <Text style={styles.teamItemIconText}>{team.name.charAt(5)}</Text>
                        </LinearGradient>
                        <View style={styles.teamItemInfo}>
                          <Text style={styles.teamItemName}>{team.name}</Text>
                          <Text style={styles.teamItemCaptain}>Captain: {team.captain}</Text>
                        </View>
                        <LinearGradient
                          colors={
                            team.status === "Active"
                              ? ["#4CAF50", "#45A049"]
                              : ["#FFA500", "#FF8C00"]
                          }
                          style={styles.teamItemStatus}
                        >
                          <Text style={styles.teamItemStatusText}>{team.status}</Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.teamItemStats}>
                        <View style={styles.teamItemStat}>
                          <Ionicons name="people" size={14} color="#17A2B8" />
                          <Text style={styles.teamItemStatText}>{team.players} Players</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ))}

                <Text style={[styles.dashboardSectionTitle, { marginTop: 20 }]}>Add Teams & Players</Text>
                <Text style={styles.teamSelectionSubtitle}>
                  Choose how you want to add participants to your tournament
                </Text>

                {/* Add Players Modal Content - Always Visible */}
                <View style={styles.tournamentManagementContainer}>
              {/* Team Link Option */}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  console.log("Add via Team Link");
                  Alert.alert("Team Link", "Share invite link with teams and players");
                }}
              >
                <LinearGradient
                  colors={["#17A2B8", "#138496"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalOptionGradient}
                >
                  <View style={styles.modalOptionIconCircle}>
                    <Ionicons name="link" size={20} color="#FFF" />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>Team Link</Text>
                    <Text style={styles.modalOptionDescription}>
                      Share invite link with teams and players
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#FFF"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* QR Code Option */}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  console.log("Add via QR Code");
                  Alert.alert("QR Code", "Generate QR code for teams to scan and join");
                }}
              >
                <LinearGradient
                  colors={["#9D4EDD", "#7B2CBF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalOptionGradient}
                >
                  <View style={styles.modalOptionIconCircle}>
                    <Ionicons name="qr-code" size={20} color="#FFF" />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>QR Code</Text>
                    <Text style={styles.modalOptionDescription}>
                      Let teams scan to join tournament
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#FFF"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* From Contacts Option */}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  console.log("Add from Contacts");
                  Alert.alert("From Contacts", "Select teams and players from your contacts");
                }}
              >
                <LinearGradient
                  colors={["#4CAF50", "#45A049"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalOptionGradient}
                >
                  <View style={styles.modalOptionIconCircle}>
                    <Ionicons name="person-add" size={20} color="#FFF" />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>
                      From Contacts
                    </Text>
                    <Text style={styles.modalOptionDescription}>
                      Select teams and players from phone contacts
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#FFF"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Add Groups Option */}
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  console.log("Add Groups");
                  Alert.alert("Add Groups", "Organize teams into groups for tournament structure");
                }}
              >
                <LinearGradient
                  colors={["#FF6B6B", "#EE5A6F"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalOptionGradient}
                >
                  <View style={styles.modalOptionIconCircle}>
                    <Ionicons name="people" size={20} color="#FFF" />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={styles.modalOptionTitle}>
                      Add Groups
                    </Text>
                    <Text style={styles.modalOptionDescription}>
                      Create tournament groups and pools
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#FFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Complete Setup Button */}
            <TouchableOpacity
              style={styles.completeSetupButton}
              onPress={() => {
                // Navigate back to matches
                setCurrentView("matches");
                setActiveTab("tournaments");
              }}
            >
              <LinearGradient
                colors={["#E63946", "#C1121F", "#780000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.completeSetupButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.completeSetupButtonText}>Complete Setup</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
              </ScrollView>
            )}
          </View>
        ) : currentView === "matchSetup" ? (
          /* Match Setup View with VS Animation at top */
          <View style={styles.matchSetupContainer}>
            {/* VS Animation Section at Top */}
            <View style={styles.vsAnimationSection}>
              <View style={styles.vsTeamsRow}>
                {/* Team A */}
                <Animated.View
                  style={[
                    styles.vsTeamCardSmall,
                    {
                      opacity: vsTeamAnim,
                      transform: [
                        {
                          translateX: vsTeamAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-100, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#9D4EDD", "#7B2CBF"]}
                    style={styles.vsTeamCircleSmall}
                  >
                    <Text style={styles.vsTeamInitialSmall}>
                      {teamAName.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.vsTeamNameSmall}>{teamAName}</Text>
                </Animated.View>

                {/* VS Text */}
                <Animated.View
                  style={[
                    styles.vsTextContainerSmall,
                    {
                      opacity: vsTextAnim,
                      transform: [
                        {
                          scale: vsTextAnim,
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#E63946", "#C1121F"]}
                    style={styles.vsTextCircleSmall}
                  >
                    <Text style={styles.vsTextSmall}>VS</Text>
                  </LinearGradient>
                </Animated.View>

                {/* Team B */}
                <Animated.View
                  style={[
                    styles.vsTeamCardSmall,
                    {
                      opacity: vsTeamBanim,
                      transform: [
                        {
                          translateX: vsTeamBanim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [100, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#17A2B8", "#138496"]}
                    style={styles.vsTeamCircleSmall}
                  >
                    <Text style={styles.vsTeamInitialSmall}>
                      {teamBName.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <Text style={styles.vsTeamNameSmall}>{teamBName}</Text>
                </Animated.View>
              </View>
            </View>

            <Text style={styles.matchSetupTitle}>Match Setup</Text>
            <Text style={styles.matchSetupSubtitle}>
              Configure your match details
            </Text>

            {/* Match Type Selection */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Match Type *</Text>
              <LinearGradient
                colors={["#F0F9FF", "#E0F2FE", "#BAE6FD"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.matchTypeCubeContainer}
              >
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.matchTypeScrollContent}
                >
                  {[
                    { id: "limited", label: "Limited Overs" },
                    { id: "box", label: "Box/Turf" },
                    { id: "pair", label: "Pair Cricket" },
                    { id: "test", label: "Test Match" },
                    { id: "hundred", label: "The Hundred" },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.matchTypePill,
                        matchType === type.id && styles.matchTypePillActive,
                      ]}
                      onPress={() => setMatchType(type.id)}
                    >
                      <Text
                        style={[
                          styles.matchTypePillText,
                          matchType === type.id && styles.matchTypePillTextActive,
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </LinearGradient>
            </View>

            {/* Number of Overs */}
            {(matchType === "limited" || matchType === "box") && (
              <View style={styles.setupSection}>
                <Text style={styles.setupSectionTitle}>Number of Overs *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="timer-outline" size={18} color="#17A2B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter number of overs"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={numberOfOvers}
                    onChangeText={setNumberOfOvers}
                  />
                </View>
              </View>
            )}

            {/* Location - City & Ground */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Location *</Text>
              
              {!locationEnabled ? (
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={handleEnableLocation}
                >
                  <LinearGradient
                    colors={["#E63946", "#C1121F", "#780000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.locationButtonGradient}
                  >
                    <View style={styles.locationButtonContent}>
                      <View style={styles.locationIconCircle}>
                        <Ionicons name="location" size={24} color="#FFF" />
                      </View>
                      <View style={styles.locationButtonTextContainer}>
                        <Text style={styles.locationButtonTitle}>
                          Find Nearby Grounds
                        </Text>
                        <Text style={styles.locationButtonSubtitle}>
                          Enable location to discover cricket grounds
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#FFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.locationEnabledContainer}>
                  <LinearGradient
                    colors={["#E8F5E9", "#F1F8E9"]}
                    style={styles.locationEnabledHeader}
                  >
                    <View style={styles.locationEnabledBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                      <Text style={styles.locationEnabledText}>
                        Location Enabled
                      </Text>
                    </View>
                    <View style={styles.groundsCountBadge}>
                      <Text style={styles.groundsCountText}>
                        {nearbyGrounds.length} grounds nearby
                      </Text>
                    </View>
                  </LinearGradient>
                  
                  {/* Nearby Grounds List */}
                  <View style={styles.groundsListContainer}>
                    <Text style={styles.groundsListTitle}>Select Ground</Text>
                    <View style={styles.groundsScrollWrapper}>
                      <ScrollView 
                        ref={scrollViewRef2}
                        style={styles.groundsList}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                        onScroll={(event) => {
                          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                          const scrollPercentage = contentOffset.y / (contentSize.height - layoutMeasurement.height);
                          const indicatorHeight = 60; // Height of the scroll indicator
                          const trackHeight = 240 - indicatorHeight; // Max scroll area
                          setScrollIndicatorPosition(scrollPercentage * trackHeight);
                        }}
                        scrollEventThrottle={16}
                      >
                        {nearbyGrounds.map((ground, index) => (
                          <TouchableOpacity
                            key={ground.id}
                            style={[
                              styles.groundCard,
                              selectedGround === ground.name && styles.groundCardActive,
                            ]}
                            onPress={() => {
                              setSelectedGround(ground.name);
                              setSelectedCity(ground.city);
                              setPitchType(ground.pitchType);
                            }}
                          >
                            <LinearGradient
                              colors={
                                selectedGround === ground.name
                                  ? ["#E0F7FA", "#B2EBF2"]
                                  : ["#FFFFFF", "#F8F9FA"]
                              }
                              style={styles.groundCardGradient}
                            >
                              <View style={styles.groundCardLeft}>
                                <View style={[
                                  styles.groundNumberBadge,
                                  selectedGround === ground.name && styles.groundNumberBadgeActive,
                                ]}>
                                  <Text style={[
                                    styles.groundNumberText,
                                    selectedGround === ground.name && styles.groundNumberTextActive,
                                  ]}>
                                    {index + 1}
                                  </Text>
                                </View>
                                <View style={styles.groundInfo}>
                                  <Text style={[
                                    styles.groundName,
                                    selectedGround === ground.name && styles.groundNameActive,
                                  ]}>
                                    {ground.name}
                                  </Text>
                                  <View style={styles.groundMetaRow}>
                                    <View style={styles.groundMetaItem}>
                                      <Ionicons name="navigate" size={12} color="#666" />
                                      <Text style={styles.groundMetaText}>{ground.distance}</Text>
                                    </View>
                                    <View style={styles.groundMetaDivider} />
                                    <View style={styles.groundMetaItem}>
                                      <Ionicons name="layers" size={12} color="#666" />
                                      <Text style={styles.groundMetaText}>
                                        {ground.pitchType.toUpperCase()}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                              {selectedGround === ground.name && (
                                <View style={styles.selectedCheckmark}>
                                  <Ionicons name="checkmark-circle" size={24} color="#17A2B8" />
                                </View>
                              )}
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      
                      {/* Custom Scrollbar */}
                      <View style={styles.customScrollbarTrack}>
                        <Animated.View 
                          style={[
                            styles.customScrollbarThumb,
                            {
                              transform: [{ translateY: scrollIndicatorPosition }],
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={["#17A2B8", "#138496"]}
                            style={styles.customScrollbarThumbGradient}
                          >
                            <View style={styles.scrollbarGrip}>
                              <View style={styles.scrollbarGripLine} />
                              <View style={styles.scrollbarGripLine} />
                              <View style={styles.scrollbarGripLine} />
                            </View>
                          </LinearGradient>
                        </Animated.View>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {locationEnabled && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="business-outline" size={18} color="#17A2B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="City/Town"
                      placeholderTextColor="#999"
                      value={selectedCity}
                      onChangeText={setSelectedCity}
                      editable={false}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={18} color="#17A2B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ground Name"
                      placeholderTextColor="#999"
                      value={selectedGround}
                      onChangeText={setSelectedGround}
                      editable={false}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Pitch Type */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Pitch Type *</Text>
              <View style={styles.pitchTypeRow}>
                {[
                  { id: "rough", label: "Rough", icon: "trail-sign", color: "#8B4513" },
                  { id: "cement", label: "Cement", icon: "cube", color: "#95A5A6" },
                  { id: "turf", label: "Turf", icon: "leaf", color: "#27AE60" },
                  { id: "astroturf", label: "Astro", icon: "sparkles", color: "#3498DB" },
                  { id: "matting", label: "Matting", icon: "grid", color: "#E67E22" },
                ].map((pitch) => (
                  <TouchableOpacity
                    key={pitch.id}
                    style={styles.pitchTypeItem}
                    onPress={() => setPitchType(pitch.id)}
                  >
                    <View style={[
                      styles.pitchCircle,
                      { 
                        backgroundColor: pitchType === pitch.id ? pitch.color : "#F5F5F5",
                        borderColor: pitchType === pitch.id ? pitch.color : "#E5E5E5",
                      },
                    ]}>
                      <Ionicons
                        name={pitch.icon as any}
                        size={18}
                        color={pitchType === pitch.id ? "#FFF" : "#999"}
                      />
                    </View>
                    <Text style={[
                      styles.pitchLabel,
                      pitchType === pitch.id && { color: pitch.color, fontWeight: "800" },
                    ]}>
                      {pitch.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ball Type */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Ball Type *</Text>
              <View style={styles.ballTypeContainer}>
                {[
                  { id: "tennis", label: "Tennis", icon: "tennisball" },
                  { id: "leather", label: "Leather", icon: "baseball" },
                  { id: "other", label: "Other", icon: "ellipse" },
                ].map((ball) => (
                  <TouchableOpacity
                    key={ball.id}
                    style={[
                      styles.ballTypeCard,
                      ballType === ball.id && styles.ballTypeCardActive,
                    ]}
                    onPress={() => setBallType(ball.id)}
                  >
                    <View
                      style={[
                        styles.ballTypeCircle,
                        ballType === ball.id && styles.ballTypeCircleActive,
                      ]}
                    >
                      <Ionicons
                        name={ball.icon as any}
                        size={22}
                        color={ballType === ball.id ? "#FFF" : "#666"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.ballTypeText,
                        ballType === ball.id && styles.ballTypeTextActive,
                      ]}
                    >
                      {ball.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Date & Time *</Text>
              <View style={styles.dateTimeRow}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name="calendar-outline" size={18} color="#17A2B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={matchDate}
                    onChangeText={setMatchDate}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name="time-outline" size={18} color="#17A2B8" />
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    placeholderTextColor="#999"
                    value={matchTime}
                    onChangeText={setMatchTime}
                  />
                </View>
              </View>
            </View>

            {/* Wagon Wheel Toggle */}
            <View style={styles.setupSection}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setWagonWheelEnabled(!wagonWheelEnabled)}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="analytics-outline" size={20} color="#17A2B8" />
                  <Text style={styles.toggleLabel}>Enable Wagon Wheel</Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    wagonWheelEnabled && styles.toggleSwitchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      wagonWheelEnabled && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Match Officials */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Match Officials</Text>
              
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#17A2B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Umpire 1"
                  placeholderTextColor="#999"
                  value={umpire1}
                  onChangeText={setUmpire1}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#17A2B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Umpire 2"
                  placeholderTextColor="#999"
                  value={umpire2}
                  onChangeText={setUmpire2}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="create-outline" size={18} color="#17A2B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Scorer"
                  placeholderTextColor="#999"
                  value={scorer}
                  onChangeText={setScorer}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="videocam-outline" size={18} color="#17A2B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Live Streamer"
                  placeholderTextColor="#999"
                  value={liveStreamer}
                  onChangeText={setLiveStreamer}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={18} color="#17A2B8" />
                <TextInput
                  style={styles.input}
                  placeholder="Others"
                  placeholderTextColor="#999"
                  value={others}
                  onChangeText={setOthers}
                />
              </View>
            </View>

            {/* Start Match Button */}
            <TouchableOpacity
              style={styles.startMatchButton}
              onPress={() => {
                console.log("Starting match with:", {
                  teamA: teamAName,
                  teamB: teamBName,
                  matchType,
                  overs: numberOfOvers,
                  city: selectedCity,
                  ground: selectedGround,
                  pitchType,
                  ballType,
                  date: matchDate,
                  time: matchTime,
                  wagonWheel: wagonWheelEnabled,
                });
                // Navigate to match screen or show success
                alert("Match setup complete!");
              }}
            >
              <LinearGradient
                colors={["#17A2B8", "#138496", "#0E6674"]}
                style={styles.startMatchButtonGradient}
              >
                <Ionicons name="play-circle" size={28} color="#FFF" />
                <Text style={styles.startMatchButtonText}>Start Match</Text>
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </View>
        ) : currentView === "selectTeam" ? (
          /* Select Team View */
          <View style={styles.teamSelectionContainer}>
            <Text style={styles.teamSelectionTitle}>
              Select Team {teamSlot}
            </Text>

            {/* Teams List */}
            {[
              {
                id: 1,
                name: "Mumbai Warriors",
                players: 11,
                wins: 18,
                matches: 25,
              },
              {
                id: 2,
                name: "Delhi Strikers",
                players: 11,
                wins: 12,
                matches: 20,
              },
              {
                id: 3,
                name: "Bangalore Challengers",
                players: 11,
                wins: 10,
                matches: 18,
              },
            ].map((team) => (
              <TouchableOpacity
                key={team.id}
                style={styles.selectTeamCard}
                onPress={() => {
                  console.log(`Selected ${team.name} for Team ${teamSlot}`);
                  handleBackToTeamSelection();
                }}
              >
                <LinearGradient
                  colors={["#FFF", "#F8F8F8"]}
                  style={styles.selectTeamCardGradient}
                >
                  <LinearGradient
                    colors={["#17A2B8", "#138496"]}
                    style={styles.selectTeamIcon}
                  >
                    <Text style={styles.selectTeamInitial}>
                      {team.name.charAt(0)}
                    </Text>
                  </LinearGradient>

                  <View style={styles.selectTeamInfo}>
                    <Text style={styles.selectTeamName}>{team.name}</Text>
                    <View style={styles.selectTeamStats}>
                      <Ionicons name="people" size={12} color="#666" />
                      <Text style={styles.selectStatText}>
                        {team.players} Players
                      </Text>
                      <Ionicons
                        name="trophy"
                        size={12}
                        color="#666"
                        style={{ marginLeft: 12 }}
                      />
                      <Text style={styles.selectStatText}>
                        {team.wins}/{team.matches}
                      </Text>
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#17A2B8" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : currentView === "createTeam" ? (
          /* Create Team View */
          <View style={styles.teamSelectionContainer}>
            <Text style={styles.teamSelectionTitle}>
              Create Team {teamSlot}
            </Text>

            <View style={styles.createTeamForm}>
              {/* Big Card Container for Form Fields */}
              <View style={styles.formCard}>
                {/* Team Name */}
                <View style={styles.createTeamFormGroup}>
                  <Text style={styles.createTeamFormLabel}>Team Name *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="shield" size={18} color="#17A2B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter team name"
                      placeholderTextColor="#999"
                      value={currentTeamName}
                      onChangeText={setCurrentTeamName}
                    />
                  </View>
                </View>

                {/* City/Town */}
                <View style={styles.createTeamFormGroup}>
                  <Text style={styles.createTeamFormLabel}>City/Town *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location" size={18} color="#17A2B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter city or town"
                      placeholderTextColor="#999"
                      value={currentCity}
                      onChangeText={setCurrentCity}
                    />
                  </View>
                </View>

                {/* Mobile Number */}
                <View style={styles.createTeamFormGroup}>
                  <Text style={styles.createTeamFormLabel}>Mobile Number *</Text>
                  <View style={styles.mobileInputRow}>
                    {/* Country Code Picker */}
                    <TouchableOpacity 
                      style={styles.countryCodePicker}
                      onPress={() => setShowCountryPicker(!showCountryPicker)}
                    >
                      <Text style={styles.countryCodeText}>{countryCode}</Text>
                      <Ionicons name="chevron-down" size={14} color="#666" />
                    </TouchableOpacity>
                    
                    {/* Mobile Number Input */}
                    <View style={styles.mobileInputContainer}>
                      <Ionicons name="call" size={18} color="#17A2B8" />
                      <TextInput
                        style={styles.input}
                        placeholder="Enter 10 digit number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={currentMobile}
                        onChangeText={setCurrentMobile}
                      />
                    </View>
                  </View>
                  
                  {/* Country Code Dropdown */}
                  {showCountryPicker && (
                    <View style={styles.countryCodeDropdown}>
                      {[
                        { code: '+91', country: 'India' },
                        { code: '+1', country: 'USA/Canada' },
                        { code: '+44', country: 'UK' },
                        { code: '+61', country: 'Australia' },
                        { code: '+971', country: 'UAE' },
                        { code: '+65', country: 'Singapore' },
                        { code: '+60', country: 'Malaysia' },
                        { code: '+92', country: 'Pakistan' },
                        { code: '+880', country: 'Bangladesh' },
                        { code: '+94', country: 'Sri Lanka' },
                      ].map((item) => (
                        <TouchableOpacity
                          key={item.code}
                          style={styles.countryCodeOption}
                          onPress={() => {
                            setCountryCode(item.code);
                            setShowCountryPicker(false);
                          }}
                        >
                          <Text style={styles.countryCodeOptionText}>
                            {item.code} ({item.country})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Team Captain Name */}
                <View style={styles.createTeamFormGroup}>
                  <Text style={styles.createTeamFormLabel}>Team Captain Name *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-circle" size={18} color="#17A2B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter captain name"
                      placeholderTextColor="#999"
                      value={currentCaptain}
                      onChangeText={setCurrentCaptain}
                    />
                  </View>
                </View>

                {/* Number of Players */}
                <View style={styles.createTeamFormGroup}>
                  <Text style={styles.createTeamFormLabel}>Number of Players *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="people" size={18} color="#17A2B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter number (max 20)"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      maxLength={2}
                      value={currentPlayers}
                      onChangeText={setCurrentPlayers}
                    />
                  </View>
                </View>
              </View>

              {/* Add Players Button - Below the Card */}
              <TouchableOpacity
                style={styles.addPlayersButtonCard}
                onPress={toggleAddPlayerModal}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#9D4EDD", "#7B2CBF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addPlayersButtonCardGradient}
                >
                  <View style={styles.addPlayersButtonContent}>
                    <View style={styles.addPlayersButtonIconCircle}>
                      <Ionicons name="person-add" size={22} color="#FFF" />
                    </View>
                    <View style={styles.addPlayersButtonTextContainer}>
                      <Text style={styles.addPlayersButtonTitle}>
                        Add Team Players
                      </Text>
                      <Text style={styles.addPlayersButtonSubtitle}>
                        Invite via link, QR code, or contacts
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#FFF" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              {/* Create Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleSaveTeam}
              >
                <LinearGradient
                  colors={["#17A2B8", "#138496"]}
                  style={styles.createButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  <Text style={styles.createButtonText}>Create Team</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Bottom Spacing */}
              <View style={{ height: 80 }} />
            </View>

            {/* Add Players Modal */}
            {showAddPlayerModal && (
              <>
                {/* Backdrop */}
                <TouchableOpacity
                  style={styles.modalBackdrop}
                  activeOpacity={1}
                  onPress={toggleAddPlayerModal}
                >
                  <Animated.View
                    style={[
                      styles.modalBackdropOverlay,
                      { opacity: modalAnim },
                    ]}
                  />
                </TouchableOpacity>

                {/* Modal Content */}
                <Animated.View
                  style={[
                    styles.addPlayersModal,
                    {
                      opacity: modalAnim,
                      transform: [
                        {
                          translateY: modalAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [300, 0],
                          }),
                        },
                        {
                          scale: modalAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                      <LinearGradient
                        colors={["#9D4EDD", "#7B2CBF"]}
                        style={styles.modalHeaderIcon}
                      >
                        <Ionicons name="people" size={18} color="#FFF" />
                      </LinearGradient>
                      <View>
                        <Text style={styles.modalTitle}>Add Team Players</Text>
                        <Text style={styles.modalSubtitle}>
                          Choose your preferred method
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={toggleAddPlayerModal}
                      style={styles.modalCloseButton}
                    >
                      <Ionicons name="close-circle" size={28} color="#999" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalOptionsContainer}>
                    {/* Team Link Option */}
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        console.log("Add via Team Link");
                        toggleAddPlayerModal();
                      }}
                    >
                      <LinearGradient
                        colors={["#17A2B8", "#138496"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalOptionGradient}
                      >
                        <View style={styles.modalOptionIconCircle}>
                          <Ionicons name="link" size={20} color="#FFF" />
                        </View>
                        <View style={styles.modalOptionTextContainer}>
                          <Text style={styles.modalOptionTitle}>Team Link</Text>
                          <Text style={styles.modalOptionDescription}>
                            Share invite link with players
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="#FFF"
                        />
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* QR Code Option */}
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        console.log("Add via QR Code");
                        toggleAddPlayerModal();
                      }}
                    >
                      <LinearGradient
                        colors={["#9D4EDD", "#7B2CBF"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalOptionGradient}
                      >
                        <View style={styles.modalOptionIconCircle}>
                          <Ionicons name="qr-code" size={20} color="#FFF" />
                        </View>
                        <View style={styles.modalOptionTextContainer}>
                          <Text style={styles.modalOptionTitle}>QR Code</Text>
                          <Text style={styles.modalOptionDescription}>
                            Let players scan to join team
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="#FFF"
                        />
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* From Contacts Option */}
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => {
                        console.log("Add from Contacts");
                        toggleAddPlayerModal();
                      }}
                    >
                      <LinearGradient
                        colors={["#4CAF50", "#45A049"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.modalOptionGradient}
                      >
                        <View style={styles.modalOptionIconCircle}>
                          <Ionicons name="person-add" size={20} color="#FFF" />
                        </View>
                        <View style={styles.modalOptionTextContainer}>
                          <Text style={styles.modalOptionTitle}>
                            From Contacts
                          </Text>
                          <Text style={styles.modalOptionDescription}>
                            Select players from phone contacts
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={24}
                          color="#FFF"
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </>
            )}
          </View>
        ) : currentView === "teamSelection" ? (
          /* Team Selection View */
          <View style={styles.teamSelectionContainer}>
            <Text style={styles.teamSelectionTitle}>Select Your Team</Text>

            {/* Team A */}
            <View style={styles.teamCardContainer}>
              <LinearGradient
                colors={["#FFFFFF", "#F8FEFF"]}
                style={styles.teamCardGradient}
              >
                <View style={styles.teamHeaderRow}>
                  <LinearGradient
                    colors={["#17A2B8", "#0E6674"]}
                    style={styles.teamCircleLarge}
                  >
                    <Text style={styles.teamLetterLarge}>A</Text>
                  </LinearGradient>
                  <View style={styles.teamTitleContainer}>
                    <Text style={styles.teamTitle}>
                      {teamAName || "Team A"}
                    </Text>
                    <Text style={styles.teamDescription}>
                      {teamAName ? "Team created" : "Select or create your team"}
                    </Text>
                  </View>
                </View>

                <View style={styles.teamActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSelectTeam("A")}
                  >
                    <LinearGradient
                      colors={["#17A2B8", "#138496"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="people" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Select Team</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCreateTeam("A")}
                  >
                    <LinearGradient
                      colors={["#E63946", "#C1121F"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="add-circle" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Create Team</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* VS Divider */}
            <View style={styles.vsContainer}>
              <View style={styles.vsLine} />
              <View style={styles.vsCircle}>
                <Text style={styles.vsText}>VS</Text>
              </View>
              <View style={styles.vsLine} />
            </View>

            {/* Team B */}
            <View style={styles.teamCardContainer}>
              <LinearGradient
                colors={["#FFFFFF", "#F8FEFF"]}
                style={styles.teamCardGradient}
              >
                <View style={styles.teamHeaderRow}>
                  <LinearGradient
                    colors={["#17A2B8", "#0E6674"]}
                    style={styles.teamCircleLarge}
                  >
                    <Text style={styles.teamLetterLarge}>B</Text>
                  </LinearGradient>
                  <View style={styles.teamTitleContainer}>
                    <Text style={styles.teamTitle}>
                      {teamBName || "Team B"}
                    </Text>
                    <Text style={styles.teamDescription}>
                      {teamBName ? "Team created" : "Select or create your team"}
                    </Text>
                  </View>
                </View>

                <View style={styles.teamActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSelectTeam("B")}
                  >
                    <LinearGradient
                      colors={["#17A2B8", "#138496"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="people" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Select Team</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleCreateTeam("B")}
                  >
                    <LinearGradient
                      colors={["#E63946", "#C1121F"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="add-circle" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>Create Team</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            {/* Let's Play Button - Shows when both teams are created */}
            {teamAName && teamBName && (
              <TouchableOpacity
                style={styles.letsPlayButton}
                onPress={handleLetsPlay}
              >
                <LinearGradient
                  colors={["#17A2B8", "#138496", "#0E6674"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.letsPlayButtonGradient}
                >
                  <Ionicons name="play-circle" size={22} color="#FFF" />
                  <Text style={styles.letsPlayButtonText}>Let's Play!</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </View>
        ) : (
          /* Matches/Tournaments/Teams View */
          <>
            {activeTab === "matches" && (
              <>
            {/* Animated Start Match Card */}
            <Animated.View
              style={[
                styles.startMatchSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={["#17A2B8", "#138496", "#0E6674"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startMatchCard}
              >
                {/* Animated background circles */}
                <Animated.View
                  style={[
                    styles.bgCircle1,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.bgCircle2,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />

                <View style={styles.startMatchWrapper}>
                  <View style={styles.startMatchTop}>
                    <Animated.View
                      style={[
                        styles.startMatchIcon,
                        { transform: [{ scale: pulseAnim }] },
                      ]}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(255,255,255,0.3)",
                          "rgba(255,255,255,0.1)",
                        ]}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="add-circle" size={28} color="#FFF" />
                      </LinearGradient>
                    </Animated.View>
                    <View style={styles.startMatchText}>
                      <Text style={styles.startMatchTitle}>
                        Want to start a match?
                      </Text>
                      <Text style={styles.startMatchSubtitle}>
                        Create and manage your cricket matches
                      </Text>
                    </View>
                  </View>

                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={handleStartMatch}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={["#FFF", "#F0F0F0"]}
                        style={styles.startButtonGradient}
                      >
                        <Text style={styles.startButtonText}>Start</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#17A2B8"
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Animated Filter Tabs */}
            <Animated.View style={[styles.filterTabs, { opacity: fadeAnim }]}>
              {["your", "participate", "network", "all"].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    activeFilter === filter && styles.activeFilterTab,
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  {activeFilter === filter ? (
                    <LinearGradient
                      colors={["#17A2B8", "#138496"]}
                      style={styles.filterGradient}
                    >
                      <Text style={styles.activeFilterText}>
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <Text style={styles.filterText}>
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* Animated Matches List */}
            {matches.map((match, index) => (
              <Animated.View
                key={match.id}
                style={{
                  opacity: cardAnimations[index],
                  transform: [
                    {
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                    {
                      scale: cardAnimations[index],
                    },
                  ],
                }}
              >
                <TouchableOpacity style={styles.matchCard}>
                  <LinearGradient
                    colors={["#FFF", "#F8F8F8"]}
                    style={styles.matchCardGradient}
                  >
                    <View style={styles.matchHeader}>
                      <View style={styles.matchTypeContainer}>
                        <View style={styles.iconCircle}>
                          <Ionicons
                            name="baseball-outline"
                            size={10}
                            color="#17A2B8"
                          />
                        </View>
                        <Text style={styles.matchType}>{match.type}</Text>
                      </View>
                      <LinearGradient
                        colors={
                          match.status === "Upcoming"
                            ? ["#FFA500", "#FF8C00"]
                            : ["#4CAF50", "#45A049"]
                        }
                        style={styles.statusBadge}
                      >
                        <Text style={styles.statusText}>{match.status}</Text>
                      </LinearGradient>
                    </View>

                    <View style={styles.matchBody}>
                      <View style={styles.teamSection}>
                        <LinearGradient
                          colors={["#E63946", "#C1121F"]}
                          style={styles.teamInitial}
                        >
                          <Text style={styles.teamInitialText}>
                            {match.team.charAt(0)}
                          </Text>
                        </LinearGradient>
                        <View style={styles.teamInfo}>
                          <Text style={styles.teamName}>{match.team}</Text>
                          {match.result && (
                            <View style={styles.resultContainer}>
                              <Ionicons
                                name="trophy"
                                size={10}
                                color="#4CAF50"
                              />
                              <Text style={styles.matchResult}>
                                {match.result}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.matchDetails}>
                        <View style={styles.detailRow}>
                          <View style={styles.detailIcon}>
                            <Ionicons
                              name="calendar-outline"
                              size={9}
                              color="#17A2B8"
                            />
                          </View>
                          <Text style={styles.detailText}>
                            {match.date} | {match.overs} | {match.format}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <View style={styles.detailIcon}>
                            <Ionicons
                              name="location-outline"
                              size={9}
                              color="#17A2B8"
                            />
                          </View>
                          <Text style={styles.detailText}>
                            {match.location}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.scheduleContainer}>
                        <Ionicons name="time-outline" size={10} color="#999" />
                        <Text style={styles.matchSchedule}>
                          Match scheduled to begin on {match.date} at{" "}
                          {match.time}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.matchFooter}>
                      <TouchableOpacity style={styles.footerButton}>
                        <LinearGradient
                          colors={[
                            "rgba(23, 162, 184, 0.1)",
                            "rgba(23, 162, 184, 0.05)",
                          ]}
                          style={styles.footerButtonGradient}
                        >
                          <Ionicons
                            name="stats-chart-outline"
                            size={14}
                            color="#17A2B8"
                          />
                          <Text style={styles.footerButtonText}>Insights</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <View style={styles.footerDivider} />
                      <TouchableOpacity style={styles.footerButton}>
                        <LinearGradient
                          colors={[
                            "rgba(23, 162, 184, 0.1)",
                            "rgba(23, 162, 184, 0.05)",
                          ]}
                          style={styles.footerButtonGradient}
                        >
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color="#17A2B8"
                          />
                          <Text style={styles.footerButtonText}>Squads</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}

            <View style={{ height: 20 }} />
              </>
            )}

            {/* Tournaments Tab Content */}
            {activeTab === "tournaments" && (
              <View style={styles.tournamentsContainer}>
                {/* Create Tournament Card */}
                <TouchableOpacity 
                  style={styles.createTournamentCard}
                  onPress={() => setCurrentView("createTournament")}
                >
                  <LinearGradient
                    colors={["#9D4EDD", "#7B2CBF", "#5A189A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.createTournamentGradient}
                  >
                    <View style={styles.createTournamentIcon}>
                      <Ionicons name="trophy" size={32} color="#FFF" />
                    </View>
                    <View style={styles.createTournamentText}>
                      <Text style={styles.createTournamentTitle}>
                        Register Tournament
                      </Text>
                      <Text style={styles.createTournamentSubtitle}>
                        Add a tournament / series
                      </Text>
                    </View>
                    <Ionicons name="add-circle" size={28} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Tournament Filter Tabs */}
                <Animated.View style={[styles.filterTabs, { opacity: fadeAnim }]}>
                  {["your", "participate", "network", "all"].map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterTab,
                        activeTournamentFilter === filter && styles.activeFilterTab,
                      ]}
                      onPress={() => setActiveTournamentFilter(filter)}
                    >
                      {activeTournamentFilter === filter ? (
                        <LinearGradient
                          colors={["#17A2B8", "#138496"]}
                          style={styles.filterGradient}
                        >
                          <Text style={styles.activeFilterText}>
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                          </Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.filterText}>
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </Animated.View>

                {/* Tournaments List */}
                <Text style={styles.sectionTitle}>
                  {activeTournamentFilter === "your" && "Your Tournaments"}
                  {activeTournamentFilter === "participate" && "Tournaments to Participate"}
                  {activeTournamentFilter === "network" && "Network Tournaments"}
                  {activeTournamentFilter === "all" && "All Tournaments"}
                </Text>
                
                {activeTournamentFilter === "your" && [
                  {
                    id: 1,
                    name: "Mumbai Premier League 2024",
                    teams: 8,
                    matches: 24,
                    status: "Ongoing",
                    startDate: "May 15, 2024",
                    progress: 65,
                  },
                  {
                    id: 2,
                    name: "Summer Cricket Championship",
                    teams: 6,
                    matches: 15,
                    status: "Upcoming",
                    startDate: "June 1, 2024",
                    progress: 0,
                  },
                  {
                    id: 10,
                    name: "Monsoon T20 Series",
                    teams: 7,
                    matches: 18,
                    status: "Ongoing",
                    startDate: "May 20, 2024",
                    progress: 45,
                  },
                  {
                    id: 11,
                    name: "Weekend Cricket Fest",
                    teams: 5,
                    matches: 10,
                    status: "Upcoming",
                    startDate: "June 15, 2024",
                    progress: 0,
                  },
                  {
                    id: 12,
                    name: "Corporate League 2024",
                    teams: 9,
                    matches: 20,
                    status: "Ongoing",
                    startDate: "May 10, 2024",
                    progress: 80,
                  },
                  {
                    id: 13,
                    name: "Youth Cricket Academy",
                    teams: 4,
                    matches: 8,
                    status: "Upcoming",
                    startDate: "July 1, 2024",
                    progress: 0,
                  },
                ].map((tournament) => (
                  <TouchableOpacity
                    key={tournament.id}
                    style={styles.tournamentCard}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FFD60A", "#FFC300"]}
                            style={styles.tournamentIcon}
                          >
                            <Ionicons name="trophy" size={18} color="#FFF" />
                          </LinearGradient>
                          <View style={styles.tournamentHeaderInfo}>
                            <Text style={styles.tournamentName} numberOfLines={1}>
                              {tournament.name}
                            </Text>
                            <View style={styles.tournamentMeta}>
                              <Ionicons name="calendar-outline" size={11} color="#999" />
                              <Text style={styles.tournamentMetaText}>
                                {tournament.startDate}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <LinearGradient
                          colors={
                            tournament.status === "Ongoing"
                              ? ["#4CAF50", "#45A049"]
                              : ["#FFA500", "#FF8C00"]
                          }
                          style={styles.tournamentStatusBadge}
                        >
                          <Text style={styles.tournamentStatusText}>
                            {tournament.status}
                          </Text>
                        </LinearGradient>
                      </View>

                      <View style={styles.tournamentProgressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${tournament.progress}%`,
                                backgroundColor:
                                  tournament.progress > 70
                                    ? "#4CAF50"
                                    : tournament.progress > 40
                                    ? "#FFA500"
                                    : "#E63946",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {tournament.progress}% Complete
                        </Text>
                      </View>

                      <View style={styles.tournamentStats}>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="people" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#17A2B8", "#138496"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="eye-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>View</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.tournamentDivider} />
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#9D4EDD", "#7B2CBF"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="settings-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>Manage</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                {activeTournamentFilter === "participate" && [
                  {
                    id: 3,
                    name: "Delhi Cricket League 2024",
                    teams: 10,
                    matches: 32,
                    status: "Completed",
                    startDate: "Apr 10, 2024",
                    progress: 100,
                  },
                  {
                    id: 4,
                    name: "Bangalore T20 Blast",
                    teams: 7,
                    matches: 18,
                    status: "Completed",
                    startDate: "Mar 20, 2024",
                    progress: 100,
                  },
                  {
                    id: 5,
                    name: "Pune Cricket Festival",
                    teams: 5,
                    matches: 12,
                    status: "Completed",
                    startDate: "Feb 15, 2024",
                    progress: 100,
                  },
                ].map((tournament) => (
                  <TouchableOpacity
                    key={tournament.id}
                    style={styles.tournamentCard}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FFD60A", "#FFC300"]}
                            style={styles.tournamentIcon}
                          >
                            <Ionicons name="trophy" size={18} color="#FFF" />
                          </LinearGradient>
                          <View style={styles.tournamentHeaderInfo}>
                            <Text style={styles.tournamentName} numberOfLines={1}>
                              {tournament.name}
                            </Text>
                            <View style={styles.tournamentMeta}>
                              <Ionicons name="calendar-outline" size={11} color="#999" />
                              <Text style={styles.tournamentMetaText}>
                                {tournament.startDate}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <LinearGradient
                          colors={["#9D4EDD", "#7B2CBF"]}
                          style={styles.tournamentStatusBadge}
                        >
                          <Text style={styles.tournamentStatusText}>
                            {tournament.status}
                          </Text>
                        </LinearGradient>
                      </View>

                      <View style={styles.tournamentProgressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${tournament.progress}%`,
                                backgroundColor: "#9D4EDD",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {tournament.progress}% Complete
                        </Text>
                      </View>

                      <View style={styles.tournamentStats}>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="people" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#17A2B8", "#138496"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="eye-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>View</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.tournamentDivider} />
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#9D4EDD", "#7B2CBF"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="stats-chart-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>Stats</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                {activeTournamentFilter === "network" && [
                  {
                    id: 6,
                    name: "National Cricket Championship",
                    teams: 16,
                    matches: 48,
                    status: "Upcoming",
                    startDate: "Jul 1, 2024",
                    progress: 0,
                  },
                  {
                    id: 7,
                    name: "Inter-State T20 Series",
                    teams: 12,
                    matches: 36,
                    status: "Upcoming",
                    startDate: "Aug 15, 2024",
                    progress: 0,
                  },
                  {
                    id: 8,
                    name: "Corporate Cricket League",
                    teams: 9,
                    matches: 24,
                    status: "Ongoing",
                    startDate: "May 20, 2024",
                    progress: 55,
                  },
                ].map((tournament) => (
                  <TouchableOpacity
                    key={tournament.id}
                    style={styles.tournamentCard}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FFD60A", "#FFC300"]}
                            style={styles.tournamentIcon}
                          >
                            <Ionicons name="trophy" size={18} color="#FFF" />
                          </LinearGradient>
                          <View style={styles.tournamentHeaderInfo}>
                            <Text style={styles.tournamentName} numberOfLines={1}>
                              {tournament.name}
                            </Text>
                            <View style={styles.tournamentMeta}>
                              <Ionicons name="calendar-outline" size={11} color="#999" />
                              <Text style={styles.tournamentMetaText}>
                                {tournament.startDate}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <LinearGradient
                          colors={
                            tournament.status === "Ongoing"
                              ? ["#4CAF50", "#45A049"]
                              : ["#FFA500", "#FF8C00"]
                          }
                          style={styles.tournamentStatusBadge}
                        >
                          <Text style={styles.tournamentStatusText}>
                            {tournament.status}
                          </Text>
                        </LinearGradient>
                      </View>

                      <View style={styles.tournamentProgressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${tournament.progress}%`,
                                backgroundColor:
                                  tournament.progress > 70
                                    ? "#4CAF50"
                                    : tournament.progress > 40
                                    ? "#FFA500"
                                    : "#E63946",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {tournament.progress}% Complete
                        </Text>
                      </View>

                      <View style={styles.tournamentStats}>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="people" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#17A2B8", "#138496"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="eye-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>View</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.tournamentDivider} />
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#4CAF50", "#45A049"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="add-circle-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>Join</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                {activeTournamentFilter === "all" && [
                  {
                    id: 1,
                    name: "Mumbai Premier League 2024",
                    teams: 8,
                    matches: 24,
                    status: "Ongoing",
                    startDate: "May 15, 2024",
                    progress: 65,
                  },
                  {
                    id: 3,
                    name: "Delhi Cricket League 2024",
                    teams: 10,
                    matches: 32,
                    status: "Completed",
                    startDate: "Apr 10, 2024",
                    progress: 100,
                  },
                  {
                    id: 6,
                    name: "National Cricket Championship",
                    teams: 16,
                    matches: 48,
                    status: "Upcoming",
                    startDate: "Jul 1, 2024",
                    progress: 0,
                  },
                  {
                    id: 9,
                    name: "Youth Cricket Academy",
                    teams: 4,
                    matches: 8,
                    status: "Upcoming",
                    startDate: "Jun 10, 2024",
                    progress: 0,
                  },
                ].map((tournament) => (
                  <TouchableOpacity
                    key={tournament.id}
                    style={styles.tournamentCard}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FFD60A", "#FFC300"]}
                            style={styles.tournamentIcon}
                          >
                            <Ionicons name="trophy" size={18} color="#FFF" />
                          </LinearGradient>
                          <View style={styles.tournamentHeaderInfo}>
                            <Text style={styles.tournamentName} numberOfLines={1}>
                              {tournament.name}
                            </Text>
                            <View style={styles.tournamentMeta}>
                              <Ionicons name="calendar-outline" size={11} color="#999" />
                              <Text style={styles.tournamentMetaText}>
                                {tournament.startDate}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <LinearGradient
                          colors={
                            tournament.status === "Ongoing"
                              ? ["#4CAF50", "#45A049"]
                              : tournament.status === "Completed"
                              ? ["#9D4EDD", "#7B2CBF"]
                              : ["#FFA500", "#FF8C00"]
                          }
                          style={styles.tournamentStatusBadge}
                        >
                          <Text style={styles.tournamentStatusText}>
                            {tournament.status}
                          </Text>
                        </LinearGradient>
                      </View>

                      <View style={styles.tournamentProgressSection}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${tournament.progress}%`,
                                backgroundColor:
                                  tournament.progress > 70
                                    ? "#4CAF50"
                                    : tournament.progress > 40
                                    ? "#FFA500"
                                    : tournament.progress === 100
                                    ? "#9D4EDD"
                                    : "#E63946",
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {tournament.progress}% Complete
                        </Text>
                      </View>

                      <View style={styles.tournamentStats}>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="people" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#17A2B8" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#17A2B8", "#138496"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="eye-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>View</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <View style={styles.tournamentDivider} />
                        <TouchableOpacity style={styles.tournamentButton}>
                          <LinearGradient
                            colors={["#E63946", "#C1121F"]}
                            style={styles.tournamentButtonGradient}
                          >
                            <Ionicons name="share-social-outline" size={13} color="#FFF" />
                            <Text style={styles.tournamentButtonText}>Share</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                <View style={{ height: 20 }} />
              </View>
            )}

            {/* Teams Tab Content */}
            {activeTab === "teams" && (
              <View style={styles.teamsContainer}>
                <Text style={styles.emptyStateText}>Teams content coming soon...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBackButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD60A",
    zIndex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#E63946",
  },
  tabText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#E63946",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#E63946",
  },
  content: {
    flex: 1,
  },
  startMatchSection: {
    padding: 16,
  },
  startMatchCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    position: "relative",
  },
  bgCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  startMatchContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
    zIndex: 1,
  },
  startMatchIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  iconGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  startMatchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    gap: 12,
    zIndex: 1,
  },
  startMatchTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  startMatchText: {
    flex: 1,
  },
  startMatchTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  startMatchSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 16,
  },
  startButton: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1,
    alignSelf: "flex-start",
  },
  startButtonGradient: {
    flexDirection: "row",
    paddingHorizontal: 28,
    paddingVertical: 10,
    alignItems: "center",
    gap: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#17A2B8",
  },
  filterTabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  filterTab: {
    borderRadius: 20,
    overflow: "hidden",
  },
  activeFilterTab: {
    borderRadius: 20,
    overflow: "hidden",
  },
  filterGradient: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
  },
  activeFilterText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "700",
  },
  matchCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  matchCardGradient: {
    borderRadius: 12,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  matchTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(23, 162, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  matchType: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.2,
  },
  matchBody: {
    padding: 10,
  },
  teamSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  teamInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  teamInitialText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#333",
    marginBottom: 2,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  matchResult: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "700",
  },
  matchDetails: {
    gap: 5,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(23, 162, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  scheduleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    backgroundColor: "#F8F8F8",
    padding: 6,
    borderRadius: 6,
  },
  matchSchedule: {
    flex: 1,
    fontSize: 9,
    color: "#666",
    lineHeight: 13,
    fontWeight: "500",
  },
  matchFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  footerButton: {
    flex: 1,
  },
  footerButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  footerDivider: {
    width: 1,
    backgroundColor: "#F0F0F0",
  },
  footerButtonText: {
    fontSize: 11,
    color: "#17A2B8",
    fontWeight: "700",
  },
  // Team Selection Styles
  teamSelectionContainer: {
    padding: 16,
    paddingTop: 8,
  },
  backToMatches: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 18,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  teamSelectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  teamSelectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  tournamentManagementContainer: {
    gap: 12,
    paddingHorizontal: 12,
  },
  completeSetupButton: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeSetupButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  completeSetupButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Tournament Dashboard Styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  dashboardHeader: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  dashboardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  dashboardTabs: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingHorizontal: 12,
  },
  dashboardTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  dashboardTabActive: {
    borderBottomColor: "#17A2B8",
  },
  dashboardTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  dashboardTabTextActive: {
    color: "#17A2B8",
    fontWeight: "700",
  },
  dashboardContent: {
    flex: 1,
    padding: 16,
  },
  dashboardTabContent: {
    flex: 1,
    padding: 12,
  },
  dashboardSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  matchItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  matchItemGradient: {
    padding: 14,
  },
  matchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  matchTeamName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  matchVs: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginHorizontal: 8,
  },
  matchDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchDetailText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  pointsTable: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  pointsTableHeader: {
    flexDirection: "row",
    backgroundColor: "#17A2B8",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  pointsTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  pointsTableCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  pointsTableHeaderCell: {
    color: "#FFF",
    fontWeight: "700",
  },
  pointsTableTeamCell: {
    textAlign: "left",
    fontWeight: "700",
  },
  pointsTablePtsCell: {
    backgroundColor: "rgba(23, 162, 184, 0.1)",
    borderRadius: 6,
    paddingVertical: 4,
    fontWeight: "700",
    color: "#17A2B8",
  },
  leaderboardItem: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  leaderboardItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFD60A",
    justifyContent: "center",
    alignItems: "center",
  },
  leaderboardRankText: {
    fontSize: 18,
    fontWeight: "700",
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  leaderboardTeam: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  leaderboardStats: {
    alignItems: "center",
  },
  leaderboardRuns: {
    fontSize: 16,
    fontWeight: "800",
    color: "#17A2B8",
  },
  leaderboardRunsLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
  },
  teamCardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(23, 162, 184, 0.1)",
  },
  teamCardGradient: {
    padding: 18,
  },
  teamHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  teamCircleLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  teamLetterLarge: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  teamTitleContainer: {
    flex: 1,
  },
  teamTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#333",
    marginBottom: 3,
  },
  teamDescription: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  teamActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 7,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.2,
  },
  vsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  vsLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E5E5",
  },
  vsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E63946",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  vsText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFF",
  },
  // Let's Play Button
  letsPlayButton: {
    marginTop: 16,
    marginHorizontal: 32,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  letsPlayButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  letsPlayButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
  },
  // Select Team Styles
  selectTeamCard: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectTeamCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  selectTeamIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  selectTeamInitial: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
  },
  selectTeamInfo: {
    flex: 1,
  },
  selectTeamName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  selectTeamStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  selectStatText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  // Create Team Styles
  createTeamForm: {
    gap: 12,
  },
  createTeamFormCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(23, 162, 184, 0.1)",
  },
  createTeamFormGroup: {
    gap: 5,
  },
  createTeamFormLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  // Mobile Number with Country Code
  mobileInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  countryCodePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minWidth: 70,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
  },
  mobileInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  countryCodeDropdown: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  countryCodeOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  countryCodeOptionText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
  },
  typeOptions: {
    flexDirection: "row",
    gap: 10,
  },
  typeChip: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  formatOptions: {
    flexDirection: "row",
    gap: 10,
  },
  formatChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  formatChipText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
  },
  colorOptions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorChip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorCheckmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  createButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 10,
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },
  // Add Players Button Card (below form card)
  addPlayersButtonCard: {
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  addPlayersButtonCardGradient: {
    padding: 14,
  },
  addPlayersButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addPlayersButtonIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  addPlayersButtonTextContainer: {
    flex: 1,
  },
  addPlayersButtonTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 2,
  },
  addPlayersButtonSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
    lineHeight: 15,
  },
  // Modal Styles
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  modalBackdropOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  addPlayersModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 65,
    paddingHorizontal: 16,
    zIndex: 101,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#333",
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptionsContainer: {
    gap: 8,
  },
  modalOption: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  modalOptionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 2,
  },
  modalOptionDescription: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  // VS Animation Styles (Small version at top of match setup)
  vsAnimationSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  vsTeamsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  vsTeamCardSmall: {
    alignItems: "center",
    gap: 8,
  },
  vsTeamCircleSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  vsTeamInitialSmall: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  vsTeamNameSmall: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
  },
  vsTextContainerSmall: {
    alignItems: "center",
  },
  vsTextCircleSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  vsTextSmall: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 1,
  },
  // Old VS Animation Styles (kept for reference, can be removed)
  vsAnimationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F5F5",
    minHeight: 600,
  },
  vsBackButton: {
    position: "absolute",
    top: 50,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  vsTeamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
  },
  vsTeamCard: {
    alignItems: "center",
    gap: 16,
  },
  vsTeamCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  vsTeamInitial: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  vsTeamName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
  },
  vsTextContainer: {
    alignItems: "center",
  },
  vsTextCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  vsTextLarge: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 2,
  },
  vsContinueButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    width: "100%",
  },
  vsContinueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  vsContinueButtonText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  // Match Setup Styles
  matchSetupContainer: {
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  matchSetupTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#333",
    marginBottom: 2,
    textAlign: "center",
  },
  matchSetupSubtitle: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  setupSection: {
    marginBottom: 12,
  },
  setupSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  matchTypeCubeContainer: {
    borderRadius: 12,
    padding: 8,
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  matchTypeScroll: {
    flexGrow: 0,
  },
  matchTypeScrollContent: {
    paddingHorizontal: 4,
    gap: 6,
  },
  matchTypePill: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: "rgba(23, 162, 184, 0.3)",
  },
  matchTypePillActive: {
    borderColor: "#17A2B8",
    backgroundColor: "#17A2B8",
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  matchTypePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#17A2B8",
  },
  matchTypePillTextActive: {
    color: "#FFF",
  },
  matchTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  matchTypeCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  matchTypeCardActive: {
    borderColor: "#17A2B8",
    backgroundColor: "rgba(23, 162, 184, 0.05)",
  },
  matchTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    textAlign: "center",
  },
  matchTypeTextActive: {
    color: "#17A2B8",
  },
  locationButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  locationButtonGradient: {
    padding: 16,
  },
  locationButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationButtonTextContainer: {
    flex: 1,
  },
  locationButtonTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 2,
  },
  locationButtonSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
  },
  locationEnabledContainer: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  locationEnabledHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  locationEnabledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationEnabledText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4CAF50",
  },
  groundsCountBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groundsCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4CAF50",
  },
  groundsListContainer: {
    padding: 12,
    paddingTop: 0,
  },
  groundsListTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#666",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  groundsScrollWrapper: {
    position: "relative",
    flexDirection: "row",
    height: 240,
  },
  groundsList: {
    flex: 1,
    paddingRight: 8,
  },
  customScrollbarTrack: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 6,
    height: 240,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
  },
  customScrollbarThumb: {
    width: 6,
    height: 60,
    borderRadius: 3,
    overflow: "hidden",
  },
  customScrollbarThumbGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollbarGrip: {
    gap: 2,
  },
  scrollbarGripLine: {
    width: 3,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 0.5,
  },
  groundCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  groundCardActive: {
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  groundCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  groundCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  groundNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  groundNumberBadgeActive: {
    backgroundColor: "#17A2B8",
  },
  groundNumberText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#999",
  },
  groundNumberTextActive: {
    color: "#FFF",
  },
  groundInfo: {
    flex: 1,
  },
  groundName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    marginBottom: 4,
  },
  groundNameActive: {
    color: "#17A2B8",
  },
  groundMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  groundMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  groundMetaText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  groundMetaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#DDD",
  },
  groundDetails: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
  },
  selectedCheckmark: {
    marginLeft: 8,
  },
  pitchTypeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pitchTypeItem: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  pitchCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  pitchLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#666",
  },
  pitchTypeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pitchTypeCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  pitchTypeCardActive: {
    borderColor: "transparent",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  pitchIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  pitchTypeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  pitchSelectedDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pitchTypeCubeContainer: {
    borderRadius: 12,
    padding: 8,
    shadowColor: "#E67E22",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pitchTypeScrollContent: {
    paddingHorizontal: 4,
    gap: 6,
  },
  pitchTypePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 6,
    borderWidth: 1.5,
    borderColor: "rgba(230, 126, 34, 0.3)",
  },
  pitchTypePillActive: {
    borderColor: "#E67E22",
    backgroundColor: "#E67E22",
    shadowColor: "#E67E22",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pitchTypePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E67E22",
  },
  pitchTypePillTextActive: {
    color: "#FFF",
  },
  pitchTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pitchTypeChip: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  pitchTypeChipActive: {
    borderColor: "#17A2B8",
    backgroundColor: "rgba(23, 162, 184, 0.1)",
  },
  pitchTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  pitchTypeTextActive: {
    color: "#17A2B8",
  },
  ballTypeContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },
  ballTypeCard: {
    alignItems: "center",
    gap: 6,
  },
  ballTypeCardActive: {
    opacity: 1,
  },
  ballTypeCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  ballTypeCircleActive: {
    borderColor: "#17A2B8",
    backgroundColor: "#17A2B8",
  },
  ballTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  ballTypeTextActive: {
    color: "#17A2B8",
    fontWeight: "700",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E5E5",
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: "#4CAF50",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  startMatchButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  startMatchButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  startMatchButtonText: {
    fontSize: 20,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  backButton: {
    backgroundColor: "#17A2B8",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#17A2B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },
  // Tournaments Styles
  tournamentsContainer: {
    padding: 12,
  },
  createTournamentCard: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#9D4EDD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: "rgba(157, 78, 221, 0.3)",
  },
  createTournamentGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  createTournamentIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  createTournamentText: {
    flex: 1,
  },
  createTournamentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  createTournamentSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  tournamentCard: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  tournamentCardGradient: {
    padding: 14,
  },
  tournamentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  tournamentHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  tournamentHeaderInfo: {
    flex: 1,
  },
  tournamentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  tournamentMetaText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  tournamentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tournamentStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexShrink: 0,
  },
  tournamentStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  tournamentProgressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  tournamentName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  tournamentStats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 12,
  },
  tournamentStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(23, 162, 184, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  tournamentStatText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  tournamentFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 10,
  },
  tournamentButton: {
    flex: 1,
  },
  tournamentButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tournamentButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },
  tournamentDivider: {
    width: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 8,
  },
  teamsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  // Create Tournament Form Styles
  createTournamentFormContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
  },
  addMediaButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  mediaPlaceholder: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E63946",
    justifyContent: "center",
    alignItems: "center",
  },
  addMediaText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
  },
  formInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingVertical: 8,
    fontSize: 15,
    color: "#333",
  },
  emailHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingVertical: 8,
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  chipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  ballTypeRow: {
    flexDirection: "row",
    gap: 16,
  },
  ballTypeOption: {
    alignItems: "center",
    gap: 8,
  },
  ballTypeCircleLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  ballTypeLabel: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CCC",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#E63946",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 1,
  },
  // Team Item Card Styles
  teamItemCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  teamItemGradient: {
    padding: 12,
  },
  teamItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  teamItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  teamItemIconText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  teamItemInfo: {
    flex: 1,
  },
  teamItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  teamItemCaptain: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  teamItemStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  teamItemStatusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },
  teamItemStats: {
    flexDirection: "row",
    gap: 12,
  },
  teamItemStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  teamItemStatText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});

