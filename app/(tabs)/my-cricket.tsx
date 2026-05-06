import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
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
  const [activeTab, setActiveTab] = useState("matches");
  const [activeFilter, setActiveFilter] = useState("your");
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | null>(null);
  const [currentView, setCurrentView] = useState<
    "matches" | "teamSelection" | "selectTeam" | "createTeam"
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

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
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

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentView === "selectTeam" || currentView === "createTeam") {
          setCurrentView("teamSelection");
          return true;
        }
        if (currentView === "teamSelection") {
          setCurrentView("matches");
          setShowTeamSelection(false);
          setSelectedTeam(null);
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
    // Reset all form fields
    setCurrentTeamName("");
    setCurrentCity("");
    setCurrentMobile("");
    setCurrentCaptain("");
    setCurrentPlayers("");
    setCurrentView("createTeam");
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
    setCurrentView("teamSelection");
  };

  const handleBackToMatches = () => {
    setCurrentView("matches");
    setShowTeamSelection(false);
    setSelectedTeam(null);
  };

  const toggleAddPlayerModal = () => {
    if (showAddPlayerModal) {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowAddPlayerModal(false));
    } else {
      setShowAddPlayerModal(true);
      // Scroll to bottom to ensure modal is visible - increased delay for reliability
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
      Animated.spring(modalAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
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
      {/* Animated Header */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LinearGradient
          colors={["#E63946", "#C1121F", "#780000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft} />

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

      {/* Animated Tabs */}
      {!showTeamSelection && (
        <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
          {["matches", "tournaments", "teams"].map((tab, index) => (
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
        {currentView === "selectTeam" ? (
          /* Select Team View */
          <View style={styles.teamSelectionContainer}>
            <TouchableOpacity
              style={styles.backToMatches}
              onPress={handleBackToTeamSelection}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

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
            <TouchableOpacity
              style={styles.backToMatches}
              onPress={handleBackToTeamSelection}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.teamSelectionTitle}>
              Create Team {teamSlot}
            </Text>

            <View style={styles.createTeamForm}>
              {/* Big Card Container for Form Fields */}
              <View style={styles.formCard}>
                {/* Team Name */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Team Name *</Text>
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
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>City/Town *</Text>
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
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mobile Number *</Text>
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
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Team Captain Name *</Text>
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
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Number of Players *</Text>
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
            <TouchableOpacity
              style={styles.backToMatches}
              onPress={handleBackToMatches}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
              <Text style={styles.backText}>Back to Matches</Text>
            </TouchableOpacity>

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
          </View>
        ) : (
          /* Matches View */
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
              {["your", "played", "network", "all"].map((filter) => (
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  filterTab: {
    borderRadius: 22,
    overflow: "hidden",
  },
  activeFilterTab: {
    borderRadius: 22,
    overflow: "hidden",
  },
  filterGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#E5E5E5",
    borderRadius: 22,
  },
  activeFilterText: {
    fontSize: 14,
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
  formCard: {
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
  formGroup: {
    gap: 5,
  },
  formLabel: {
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
});
