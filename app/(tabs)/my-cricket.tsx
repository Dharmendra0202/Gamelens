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
  Modal,
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
    "matches" | "teamSelection" | "selectTeam" | "createTeam" | "matchSetup" | "tossPage" | "playerSelection" | "matchSettings" | "scoringPage" | "createTournament" | "tournamentTeamManagement" | "tournamentDashboard" | "tournamentDetail" | "addTeamsPlayers" | "teamsSelection" | "search"
  >("matches");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [activeTournamentDetailTab, setActiveTournamentDetailTab] = useState("matches");
  const [showTournamentSettings, setShowTournamentSettings] = useState(false);
  const [teamSlot, setTeamSlot] = useState<"A" | "B" | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ tournaments: any[], matches: any[] }>({ tournaments: [], matches: [] });
  const [showSearchModal, setShowSearchModal] = useState(false);
  
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
  const [activeTournamentDateField, setActiveTournamentDateField] = useState<"start" | "end" | null>(null);
  const [tournamentCalendarMonth, setTournamentCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [tournamentCategory, setTournamentCategory] = useState("");
  const [tournamentBallType, setTournamentBallType] = useState("");
  const [tournamentPitchType, setTournamentPitchType] = useState("");
  const [tournamentMatchType, setTournamentMatchType] = useState("");
  const [needMoreTeams, setNeedMoreTeams] = useState(false);
  const [needOfficials, setNeedOfficials] = useState(false);
  const [activeTournamentTab, setActiveTournamentTab] = useState("matches");

  // Toss data
  const [tossWinner, setTossWinner] = useState<"A" | "B" | null>(null);
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl" | null>(null);

  // Player selection data
  const [selectedStriker, setSelectedStriker] = useState<any>(null);
  const [selectedNonStriker, setSelectedNonStriker] = useState<any>(null);
  const [selectedBowler, setSelectedBowler] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerModalType, setPlayerModalType] = useState<"striker" | "nonStriker" | "bowler" | null>(null);

  // Match settings data
  const [wagonWheelDotBall, setWagonWheelDotBall] = useState(true);
  const [wagonWheel123s, setWagonWheel123s] = useState(true);
  const [shotSelection, setShotSelection] = useState(true);
  const [countWideAsLegal, setCountWideAsLegal] = useState(false);
  const [wideRuns, setWideRuns] = useState(1);
  const [countNoBallAsLegal, setCountNoBallAsLegal] = useState(false);
  const [noBallRuns, setNoBallRuns] = useState(1);
  const [ignoreRules, setIgnoreRules] = useState("A");

  // Scoring page data
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);
  const [totalRuns, setTotalRuns] = useState(0);
  const [totalWickets, setTotalWickets] = useState(0);
  const [strikerRuns, setStrikerRuns] = useState(0);
  const [strikerBalls, setStrikerBalls] = useState(0);
  const [nonStrikerRuns, setNonStrikerRuns] = useState(0);
  const [nonStrikerBalls, setNonStrikerBalls] = useState(0);
  const [bowlerOvers, setBowlerOvers] = useState("0-0-0-0");
  const [selectedWicketType, setSelectedWicketType] = useState<string | null>(null);

  // Dummy players data
  const battingTeamPlayers = [
    { id: 1, name: "Rohit Sharma", role: "Batsman", isOut: false },
    { id: 2, name: "Virat Kohli", role: "Batsman", isOut: false },
    { id: 3, name: "KL Rahul", role: "Wicket Keeper", isOut: false },
    { id: 4, name: "Hardik Pandya", role: "All Rounder", isOut: false },
    { id: 5, name: "Ravindra Jadeja", role: "All Rounder", isOut: false },
    { id: 6, name: "Suryakumar Yadav", role: "Batsman", isOut: false },
    { id: 7, name: "Rishabh Pant", role: "Wicket Keeper", isOut: false },
    { id: 8, name: "Axar Patel", role: "All Rounder", isOut: false },
    { id: 9, name: "Jasprit Bumrah", role: "Bowler", isOut: false },
    { id: 10, name: "Mohammed Shami", role: "Bowler", isOut: false },
    { id: 11, name: "Yuzvendra Chahal", role: "Bowler", isOut: false },
  ];

  const bowlingTeamPlayers = [
    { id: 12, name: "David Warner", role: "Batsman", isOut: false },
    { id: 13, name: "Aaron Finch", role: "Batsman", isOut: false },
    { id: 14, name: "Steve Smith", role: "Batsman", isOut: false },
    { id: 15, name: "Glenn Maxwell", role: "All Rounder", isOut: false },
    { id: 16, name: "Marcus Stoinis", role: "All Rounder", isOut: false },
    { id: 17, name: "Alex Carey", role: "Wicket Keeper", isOut: false },
    { id: 18, name: "Pat Cummins", role: "Bowler", isOut: false },
    { id: 19, name: "Mitchell Starc", role: "Bowler", isOut: false },
    { id: 20, name: "Josh Hazlewood", role: "Bowler", isOut: false },
    { id: 21, name: "Adam Zampa", role: "Bowler", isOut: false },
    { id: 22, name: "Nathan Lyon", role: "Bowler", isOut: false },
  ];

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

  const formatTournamentDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTournamentDateValue = (field: "start" | "end") =>
    field === "start" ? tournamentStartDate : tournamentEndDate;

  const isSameTournamentDate = (date: Date, value: string) =>
    value === formatTournamentDate(date);

  const selectTournamentDate = (date: Date) => {
    const selectedDate = formatTournamentDate(date);

    if (activeTournamentDateField === "start") {
      setTournamentStartDate(selectedDate);

      if (tournamentEndDate && selectedDate > tournamentEndDate) {
        setTournamentEndDate("");
      }
    }

    if (activeTournamentDateField === "end") {
      if (tournamentStartDate && selectedDate < tournamentStartDate) {
        Alert.alert("Invalid Date", "End date cannot be before start date");
        return;
      }

      setTournamentEndDate(selectedDate);
    }

    setActiveTournamentDateField(null);
  };

  const changeTournamentCalendarMonth = (offset: number) => {
    setTournamentCalendarMonth((currentMonth) => (
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1)
    ));
  };

  const renderTournamentDatePicker = () => {
    if (!activeTournamentDateField) {
      return null;
    }

    const monthLabel = tournamentCalendarMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const firstDay = tournamentCalendarMonth.getDay();
    const daysInMonth = new Date(
      tournamentCalendarMonth.getFullYear(),
      tournamentCalendarMonth.getMonth() + 1,
      0,
    ).getDate();
    const selectedValue = getTournamentDateValue(activeTournamentDateField);
    const calendarCells: { key: string; date?: Date }[] = [
      ...Array.from({ length: firstDay }, (_, index) => ({ key: `empty-${index}` })),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        return {
          key: `day-${day}`,
          date: new Date(
            tournamentCalendarMonth.getFullYear(),
            tournamentCalendarMonth.getMonth(),
            day,
          ),
        };
      }),
    ];

    return (
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.calendarNavButton}
            onPress={() => changeTournamentCalendarMonth(-1)}
          >
            <Ionicons name="chevron-back" size={18} color="#B91C1C" />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{monthLabel}</Text>
          <TouchableOpacity
            style={styles.calendarNavButton}
            onPress={() => changeTournamentCalendarMonth(1)}
          >
            <Ionicons name="chevron-forward" size={18} color="#B91C1C" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWeekRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.calendarWeekText}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarCells.map((cell) => {
            if (!cell.date) {
              return <View key={cell.key} style={styles.calendarDayPlaceholder} />;
            }

            const date = cell.date;
            const isSelected = isSameTournamentDate(date, selectedValue);

            return (
              <TouchableOpacity
                key={cell.key}
                style={[
                  styles.calendarDay,
                  isSelected && styles.calendarDaySelected,
                ]}
                onPress={() => selectTournamentDate(date)}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    isSelected && styles.calendarDayTextSelected,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

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
    new Animated.Value(0),
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
      if (params.source === 'drawer') {
        // Coming from drawer menu - show individual pages
        console.log("Coming from drawer - showing individual pages");
        setCurrentView('matches');
      } else if (params.action === 'createTournament') {
        setActiveTab('tournaments');
        setCurrentView('matches');
      } else if (params.action === 'startMatch') {
        setActiveTab('matches');
        setCurrentView('teamSelection');
        setShowTeamSelection(true);
      } else if (params.tab === 'tournaments') {
        setActiveTab('tournaments');
        setCurrentView('matches');
      } else if (params.tab === 'matches') {
        setActiveTab('matches');
        setCurrentView('matches');
      } else if (params.tab === 'teams') {
        setActiveTab('teams');
        setCurrentView('matches');
      } else {
        // Default: coming from footer tab - show individual pages directly
        setCurrentView('matches');
      }
    }, [params.action, params.tab, params.section, params.source])
  );

  // Handle hardware back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentView === "scoringPage") {
          setCurrentView("playerSelection");
          return true;
        }
        if (currentView === "matchSettings") {
          setCurrentView("playerSelection");
          return true;
        }
        if (currentView === "playerSelection") {
          setCurrentView("tossPage");
          return true;
        }
        if (currentView === "tossPage") {
          setCurrentView("matchSetup");
          return true;
        }
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
        if (currentView === "teamsSelection") {
          setCurrentView("matches");
          return true;
        }
        if (currentView === "addTeamsPlayers") {
          setCurrentView("tournamentDetail");
          return true;
        }
        if ((currentView as string) === "createTeam") {
          // Check if we came from addTeamsPlayers or from teamSelection
          if (teamSlot) {
            // Came from team selection flow
            setCurrentView("teamSelection");
          } else {
            // Came from addTeamsPlayers flow
            setCurrentView("addTeamsPlayers");
          }
          setShowAddPlayerModal(false);
          return true;
        }
        if (currentView === "tournamentDetail") {
          console.log("Back from tournamentDetail");
          setCurrentView("matches");
          setSelectedTournament(null);
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

  // Dummy data for different filter categories
  const getMatchesByFilter = (filter: string) => {
    switch (filter) {
      case "your":
        return [
          {
            id: 1,
            type: "Individual Match",
            status: "Upcoming",
            team: "Mumbai Warriors vs Delhi Capitals",
            date: "Today",
            overs: "20 Ov.",
            format: "T20",
            location: "Wankhede Stadium, Mumbai",
            time: "06:00 PM",
          },
          {
            id: 2,
            type: "Team Match",
            status: "Completed",
            team: "Chennai Kings vs Bangalore Riders",
            date: "Yesterday",
            overs: "50 Ov.",
            format: "ODI",
            location: "M.A. Chidambaram Stadium",
            time: "02:30 PM",
            result: "Won by 45 runs",
          },
          {
            id: 3,
            type: "Practice Match",
            status: "Live",
            team: "Kolkata Knights vs Rajasthan Royals",
            date: "Now",
            overs: "20 Ov.",
            format: "T20",
            location: "Eden Gardens, Kolkata",
            time: "07:30 PM",
            result: "15.2 Overs - 142/4",
          },
        ];
      
      case "participate":
        return [
          {
            id: 4,
            type: "Tournament Match",
            status: "Upcoming",
            team: "Hyderabad Heroes vs Pune Superstars",
            date: "Tomorrow",
            overs: "20 Ov.",
            format: "T20",
            location: "Rajiv Gandhi Stadium",
            time: "07:00 PM",
          },
          {
            id: 5,
            type: "League Match",
            status: "Completed",
            team: "Gujarat Giants vs Punjab Kings",
            date: "3 days ago",
            overs: "20 Ov.",
            format: "T20",
            location: "Narendra Modi Stadium",
            time: "08:00 PM",
            result: "Lost by 12 runs",
          },
          {
            id: 6,
            type: "Qualifier",
            status: "Upcoming",
            team: "Lucknow Legends vs Ahmedabad Aces",
            date: "Next Week",
            overs: "50 Ov.",
            format: "ODI",
            location: "Ekana Stadium, Lucknow",
            time: "02:00 PM",
          },
        ];
      
      case "network":
        return [
          {
            id: 7,
            type: "Friend's Match",
            status: "Live",
            team: "Rohit's XI vs Virat's XI",
            date: "Now",
            overs: "20 Ov.",
            format: "T20",
            location: "Local Ground, Bandra",
            time: "05:30 PM",
            result: "12.4 Overs - 98/3",
          },
          {
            id: 8,
            type: "Club Match",
            status: "Completed",
            team: "MCC vs DCC",
            date: "Last Week",
            overs: "40 Ov.",
            format: "List A",
            location: "Cross Maidan, Mumbai",
            time: "10:00 AM",
            result: "Won by 8 wickets",
          },
          {
            id: 9,
            type: "Corporate Match",
            status: "Upcoming",
            team: "TCS vs Infosys",
            date: "This Weekend",
            overs: "20 Ov.",
            format: "T20",
            location: "Corporate Ground",
            time: "04:00 PM",
          },
        ];
      
      case "all":
        return [
          {
            id: 10,
            type: "International",
            status: "Live",
            team: "India vs Australia",
            date: "Now",
            overs: "50 Ov.",
            format: "ODI",
            location: "MCG, Melbourne",
            time: "09:30 AM IST",
            result: "35.2 Overs - 287/4",
          },
          {
            id: 11,
            type: "IPL Match",
            status: "Completed",
            team: "MI vs CSK",
            date: "Yesterday",
            overs: "20 Ov.",
            format: "T20",
            location: "Wankhede Stadium",
            time: "07:30 PM",
            result: "CSK won by 4 runs",
          },
          {
            id: 12,
            type: "Local Tournament",
            status: "Upcoming",
            team: "North Zone vs South Zone",
            date: "Tomorrow",
            overs: "20 Ov.",
            format: "T20",
            location: "Feroz Shah Kotla",
            time: "06:00 PM",
          },
          {
            id: 13,
            type: "Women's Match",
            status: "Completed",
            team: "India Women vs England Women",
            date: "2 days ago",
            overs: "20 Ov.",
            format: "T20I",
            location: "Lord's, London",
            time: "08:00 PM IST",
            result: "India won by 7 wickets",
          },
        ];
      
      default:
        return [];
    }
  };

  const currentMatches = getMatchesByFilter(activeFilter);

  // All tournaments data for search
  const allTournaments = [
    // Your tournaments
    {
      id: 1,
      name: "Mumbai Premier League 2024",
      teams: 8,
      matches: 24,
      status: "Ongoing",
      startDate: "May 15, 2024",
      progress: 65,
      category: "your"
    },
    {
      id: 2,
      name: "Summer Cricket Championship",
      teams: 6,
      matches: 15,
      status: "Upcoming",
      startDate: "June 1, 2024",
      progress: 0,
      category: "your"
    },
    {
      id: 10,
      name: "Monsoon T20 Series",
      teams: 7,
      matches: 18,
      status: "Ongoing",
      startDate: "May 20, 2024",
      progress: 45,
      category: "your"
    },
    {
      id: 11,
      name: "Weekend Cricket Fest",
      teams: 5,
      matches: 10,
      status: "Upcoming",
      startDate: "June 15, 2024",
      progress: 0,
      category: "your"
    },
    {
      id: 12,
      name: "Corporate League 2024",
      teams: 9,
      matches: 20,
      status: "Ongoing",
      startDate: "May 10, 2024",
      progress: 80,
      category: "your"
    },
    {
      id: 13,
      name: "Youth Cricket Academy",
      teams: 4,
      matches: 8,
      status: "Upcoming",
      startDate: "July 1, 2024",
      progress: 0,
      category: "your"
    },
    // Participate tournaments
    {
      id: 3,
      name: "Delhi Cricket League 2024",
      teams: 10,
      matches: 32,
      status: "Completed",
      startDate: "Apr 10, 2024",
      progress: 100,
      category: "participate"
    },
    {
      id: 4,
      name: "Bangalore T20 Blast",
      teams: 7,
      matches: 18,
      status: "Completed",
      startDate: "Mar 20, 2024",
      progress: 100,
      category: "participate"
    },
    {
      id: 5,
      name: "Pune Cricket Festival",
      teams: 5,
      matches: 12,
      status: "Completed",
      startDate: "Feb 15, 2024",
      progress: 100,
      category: "participate"
    },
    // Network tournaments
    {
      id: 6,
      name: "National Cricket Championship",
      teams: 16,
      matches: 48,
      status: "Upcoming",
      startDate: "Jul 1, 2024",
      progress: 0,
      category: "network"
    },
    {
      id: 7,
      name: "Inter-State T20 Series",
      teams: 12,
      matches: 36,
      status: "Upcoming",
      startDate: "Aug 15, 2024",
      progress: 0,
      category: "network"
    },
    {
      id: 8,
      name: "Corporate Cricket League",
      teams: 9,
      matches: 24,
      status: "Ongoing",
      startDate: "May 20, 2024",
      progress: 55,
      category: "network"
    },
    // All tournaments
    {
      id: 9,
      name: "IPL 2024",
      teams: 10,
      matches: 74,
      status: "Ongoing",
      startDate: "Mar 22, 2024",
      progress: 85,
      category: "all"
    },
    {
      id: 14,
      name: "World Cup 2024",
      teams: 16,
      matches: 48,
      status: "Upcoming",
      startDate: "Oct 1, 2024",
      progress: 0,
      category: "all"
    },
    {
      id: 15,
      name: "Champions Trophy 2024",
      teams: 8,
      matches: 15,
      status: "Upcoming",
      startDate: "Sep 15, 2024",
      progress: 0,
      category: "all"
    }
  ];

  // All matches data for search
  const allMatches = [
    ...getMatchesByFilter("your"),
    ...getMatchesByFilter("participate"),
    ...getMatchesByFilter("network"),
    ...getMatchesByFilter("all")
  ];

  // Search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ tournaments: [], matches: [] });
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Search tournaments
    const filteredTournaments = allTournaments.filter(tournament =>
      tournament.name.toLowerCase().includes(searchTerm) ||
      tournament.status.toLowerCase().includes(searchTerm) ||
      tournament.category.toLowerCase().includes(searchTerm)
    );

    // Search matches
    const filteredMatches = allMatches.filter(match =>
      match.team.toLowerCase().includes(searchTerm) ||
      match.type.toLowerCase().includes(searchTerm) ||
      match.location.toLowerCase().includes(searchTerm) ||
      match.format.toLowerCase().includes(searchTerm) ||
      match.status.toLowerCase().includes(searchTerm)
    );

    setSearchResults({
      tournaments: filteredTournaments,
      matches: filteredMatches
    });
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  return (
    <View style={styles.container}>
      {/* Header - Always show except when specified */}
      <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              {currentView !== "matches" && (
                <TouchableOpacity
                  style={styles.headerBackButton}
                  onPress={() => {
                    if (currentView === "scoringPage") {
                      setCurrentView("playerSelection");
                    } else if (currentView === "matchSettings") {
                      setCurrentView("playerSelection");
                    } else if (currentView === "playerSelection") {
                      setCurrentView("tossPage");
                    } else if (currentView === "tossPage") {
                      setCurrentView("matchSetup");
                    } else if (currentView === "matchSetup") {
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
                    } else if (currentView === "teamsSelection") {
                      setCurrentView("matches");
                    } else if (currentView === "addTeamsPlayers") {
                      setCurrentView("tournamentDetail");
                    } else if ((currentView as string) === "createTeam") {
                      // Check if we came from addTeamsPlayers or from teamSelection
                      if (teamSlot) {
                        // Came from team selection flow
                        setCurrentView("teamSelection");
                      } else {
                        // Came from addTeamsPlayers flow
                        setCurrentView("addTeamsPlayers");
                      }
                      setShowAddPlayerModal(false);
                    } else if (currentView === "tournamentDetail") {
                      console.log("Header back from tournamentDetail");
                      setCurrentView("matches");
                      setSelectedTournament(null);
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
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setShowSearchModal(true)}
              >
                <Ionicons name="search" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <View style={styles.notificationDot} />
                <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
              </TouchableOpacity>
              {currentView === "tournamentDetail" ? (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowTournamentSettings(true)}
                >
                  <Ionicons name="settings-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="filter" size={24} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </Animated.View>

      {/* Animated Tabs - Always show when on matches view */}
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
        {/* Main Content Based on Current View */}
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
                {[
                  { label: "Start date", field: "start" as const },
                  { label: "End date", field: "end" as const },
                ].map(({ label, field }) => (
                  <View key={label} style={styles.dateField}>
                    <Text style={styles.formLabel}>{label} *</Text>
                    <TouchableOpacity 
                      style={[
                        styles.dateInput,
                        activeTournamentDateField === field && styles.dateInputActive,
                      ]}
                      onPress={() => {
                        setActiveTournamentDateField(
                          activeTournamentDateField === field ? null : field,
                        );
                      }}
                    >
                      <TextInput
                        style={styles.dateInputText}
                        placeholder="Select date"
                        placeholderTextColor="#CCC"
                        value={getTournamentDateValue(field)}
                        editable={false}
                        pointerEvents="none"
                      />
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={activeTournamentDateField === field ? "#B91C1C" : "#666"}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              {renderTournamentDatePicker()}

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
                    { id: "tennis", label: "Tennis", color: "#3DAA5C", darkColor: "#2A7A42" },
                    { id: "leather", label: "Leather", color: "#D32F2F", darkColor: "#9C1313" },
                    { id: "other", label: "Other", color: "#E07B00", darkColor: "#B85E00" },
                  ].map((ball) => (
                    <TouchableOpacity
                      key={ball.id}
                      style={styles.ballTypeOption}
                      onPress={() => setTournamentBallType(ball.id)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.ballTypeOuterRing,
                          tournamentBallType === ball.id && {
                            borderColor: ball.color,
                            borderWidth: 2.5,
                          },
                        ]}
                      >
                        <View style={[
                          styles.ballTypeCircleLarge,
                          {
                            backgroundColor: ball.color,
                            shadowColor: ball.color,
                          },
                          tournamentBallType === ball.id && styles.ballTypeCircleLargeSelected,
                        ]}>
                          {/* Seam lines for ball design */}
                          <View style={[styles.ballSeamH, { borderColor: ball.darkColor }]} />
                          <View style={[styles.ballSeamV, { borderColor: ball.darkColor }]} />
                          {tournamentBallType === ball.id && (
                            <View style={styles.ballCheckOverlay}>
                              <Ionicons name="checkmark-circle" size={26} color="#FFF" />
                            </View>
                          )}
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.ballTypeLabel,
                          tournamentBallType === ball.id && {
                            ...styles.ballTypeLabelSelected,
                            color: ball.color,
                          },
                        ]}
                      >
                        {ball.label}
                      </Text>
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
                  "#B91C1C"
                )}
              </View>

              {/* Match Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Match type *</Text>
                {renderChipGroup(
                  ["Limited Overs", "Box/Turf Cricket", "Pair Cricket", "Test Match", "The Hundred"],
                  tournamentMatchType,
                  setTournamentMatchType,
                  "#B91C1C"
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
                  if (!tournamentStartDate) {
                    Alert.alert("Required Field", "Please select start date");
                    return;
                  }
                  if (!tournamentEndDate) {
                    Alert.alert("Required Field", "Please select end date");
                    return;
                  }
                  if (tournamentEndDate < tournamentStartDate) {
                    Alert.alert("Invalid Date", "End date cannot be before start date");
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
                  colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
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
        ) : currentView === "tournamentDetail" && selectedTournament ? (
          /* ─────────── Tournament Detail View ─────────── */
          <View style={styles.tdContainer}>
            {/* Hero Banner */}
            <LinearGradient
              colors={["#7F1D1D", "#B91C1C", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tdHero}
            >
              {/* Decorative circles */}
              <View style={styles.tdHeroCircle1} />
              <View style={styles.tdHeroCircle2} />

              <View style={styles.tdHeroContent}>
                <View style={styles.tdHeroIcon}>
                  <Ionicons name="trophy" size={36} color="#FFD700" />
                </View>
                <Text style={styles.tdHeroTitle} numberOfLines={2}>
                  {selectedTournament.name}
                </Text>

                {/* Status pill */}
                <View style={[
                  styles.tdStatusPill,
                  { backgroundColor: selectedTournament.status === "Ongoing" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)" }
                ]}>
                  <View style={[
                    styles.tdStatusDot,
                    { backgroundColor: selectedTournament.status === "Ongoing" ? "#4CAF50" : "#FFA500" }
                  ]} />
                  <Text style={styles.tdStatusText}>{selectedTournament.status}</Text>
                </View>

                {/* Stats row */}
                <View style={styles.tdHeroStats}>
                  {[
                    { icon: "people", label: "Teams", value: selectedTournament.teams },
                    { icon: "baseball", label: "Matches", value: selectedTournament.matches },
                    { icon: "calendar-outline", label: "Start", value: selectedTournament.startDate.split(",")[0] },
                  ].map((stat, i) => (
                    <View key={i} style={styles.tdHeroStat}>
                      <Ionicons name={stat.icon as any} size={14} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.tdHeroStatValue}>{stat.value}</Text>
                      <Text style={styles.tdHeroStatLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Progress bar */}
                <View style={styles.tdProgressWrap}>
                  <View style={styles.tdProgressBg}>
                    <View style={[styles.tdProgressFill, { width: `${selectedTournament.progress}%` }]} />
                  </View>
                  <Text style={styles.tdProgressLabel}>{selectedTournament.progress}% Complete</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Detail Tabs */}
            <View style={styles.tdTabs}>
              {["matches", "points", "leaderboard", "teams"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tdTab, activeTournamentDetailTab === tab && styles.tdTabActive]}
                  onPress={() => setActiveTournamentDetailTab(tab)}
                >
                  <Text style={[styles.tdTabText, activeTournamentDetailTab === tab && styles.tdTabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                  {activeTournamentDetailTab === tab && <View style={styles.tdTabIndicator} />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.tdContent} showsVerticalScrollIndicator={false}>

              {/* ── Matches Tab ── */}
              {activeTournamentDetailTab === "matches" && (
                <View style={styles.tdSection}>
                  <Text style={styles.tdSectionTitle}>Upcoming Matches</Text>
                  {[
                    { id: 1, team1: "Warriors", team2: "Strikers", date: "Today", time: "6:00 PM", venue: "Ground A", status: "upcoming" },
                    { id: 2, team1: "Lions",    team2: "Tigers",   date: "Tomorrow", time: "5:00 PM", venue: "Ground B", status: "upcoming" },
                    { id: 3, team1: "Eagles",   team2: "Hawks",    date: "May 12",   time: "7:00 PM", venue: "Ground A", status: "scheduled" },
                  ].map((m) => (
                    <View key={m.id} style={styles.tdMatchCard}>
                      <View style={styles.tdMatchHeader}>
                        <View style={[styles.tdMatchBadge, { backgroundColor: m.status === "upcoming" ? "#FF9800" : "#17A2B8" }]}>
                          <Text style={styles.tdMatchBadgeText}>{m.status === "upcoming" ? "UPCOMING" : "SCHEDULED"}</Text>
                        </View>
                        <Text style={styles.tdMatchDate}>{m.date} · {m.time}</Text>
                      </View>
                      <View style={styles.tdMatchTeams}>
                        <View style={styles.tdTeamCol}>
                          <LinearGradient colors={["#B91C1C", "#7F1D1D"]} style={styles.tdTeamAvatar}>
                            <Text style={styles.tdTeamAvatarText}>{m.team1.charAt(0)}</Text>
                          </LinearGradient>
                          <Text style={styles.tdTeamName}>{m.team1}</Text>
                        </View>
                        <View style={styles.tdVsBox}>
                          <Text style={styles.tdVs}>VS</Text>
                        </View>
                        <View style={styles.tdTeamCol}>
                          <LinearGradient colors={["#1565C0", "#0D47A1"]} style={styles.tdTeamAvatar}>
                            <Text style={styles.tdTeamAvatarText}>{m.team2.charAt(0)}</Text>
                          </LinearGradient>
                          <Text style={styles.tdTeamName}>{m.team2}</Text>
                        </View>
                      </View>
                      <View style={styles.tdMatchFooter}>
                        <Ionicons name="location-outline" size={13} color="#999" />
                        <Text style={styles.tdMatchVenue}>{m.venue}</Text>
                      </View>
                    </View>
                  ))}

                  <Text style={[styles.tdSectionTitle, { marginTop: 20 }]}>Completed Matches</Text>
                  {[
                    { id: 4, team1: "Warriors", score1: "185/4", team2: "Strikers", score2: "172/8", winner: "Warriors", margin: "13 runs" },
                    { id: 5, team1: "Lions",    score1: "142/6", team2: "Eagles",   score2: "143/3", winner: "Eagles",   margin: "7 wkts" },
                  ].map((m) => (
                    <View key={m.id} style={[styles.tdMatchCard, { borderLeftColor: "#4CAF50", borderLeftWidth: 3 }]}>
                      <View style={styles.tdMatchHeader}>
                        <View style={[styles.tdMatchBadge, { backgroundColor: "#4CAF50" }]}>
                          <Text style={styles.tdMatchBadgeText}>COMPLETED</Text>
                        </View>
                      </View>
                      <View style={styles.tdMatchTeams}>
                        <View style={styles.tdTeamCol}>
                          <LinearGradient colors={["#B91C1C", "#7F1D1D"]} style={styles.tdTeamAvatar}>
                            <Text style={styles.tdTeamAvatarText}>{m.team1.charAt(0)}</Text>
                          </LinearGradient>
                          <Text style={styles.tdTeamName}>{m.team1}</Text>
                          <Text style={styles.tdScore}>{m.score1}</Text>
                        </View>
                        <View style={styles.tdVsBox}>
                          <Text style={styles.tdVs}>VS</Text>
                        </View>
                        <View style={styles.tdTeamCol}>
                          <LinearGradient colors={["#1565C0", "#0D47A1"]} style={styles.tdTeamAvatar}>
                            <Text style={styles.tdTeamAvatarText}>{m.team2.charAt(0)}</Text>
                          </LinearGradient>
                          <Text style={styles.tdTeamName}>{m.team2}</Text>
                          <Text style={styles.tdScore}>{m.score2}</Text>
                        </View>
                      </View>
                      <View style={[styles.tdMatchFooter, { backgroundColor: "rgba(76,175,80,0.08)", borderRadius: 8, padding: 6 }]}>
                        <Ionicons name="trophy" size={13} color="#4CAF50" />
                        <Text style={[styles.tdMatchVenue, { color: "#4CAF50", fontWeight: "700" }]}>
                          {m.winner} won by {m.margin}
                        </Text>
                      </View>
                    </View>
                  ))}
                  <View style={{ height: 80 }} />
                </View>
              )}

              {/* ── Points Tab ── */}
              {activeTournamentDetailTab === "points" && (
                <View style={styles.tdSection}>
                  <Text style={styles.tdSectionTitle}>Points Table</Text>
                  {/* Header */}
                  <LinearGradient colors={["#B91C1C", "#7F1D1D"]} style={styles.tdPtsHeader}>
                    {["#", "Team", "P", "W", "L", "NRR", "Pts"].map((h, i) => (
                      <Text key={i} style={[styles.tdPtsCell, styles.tdPtsHeaderCell, i === 1 && { flex: 2.5, textAlign: "left" }]}>{h}</Text>
                    ))}
                  </LinearGradient>
                  {[
                    { rank: 1, team: "Warriors", p: 6, w: 5, l: 1, nrr: "+1.42", pts: 10, q: true },
                    { rank: 2, team: "Lions",    p: 6, w: 4, l: 2, nrr: "+0.88", pts: 8, q: true },
                    { rank: 3, team: "Eagles",   p: 5, w: 3, l: 2, nrr: "+0.30", pts: 6, q: false },
                    { rank: 4, team: "Tigers",   p: 5, w: 2, l: 3, nrr: "-0.25", pts: 4, q: false },
                    { rank: 5, team: "Strikers", p: 6, w: 1, l: 5, nrr: "-1.10", pts: 2, q: false },
                    { rank: 6, team: "Hawks",    p: 6, w: 0, l: 6, nrr: "-1.80", pts: 0, q: false },
                  ].map((row, idx) => (
                    <View key={idx} style={[styles.tdPtsRow, row.q && styles.tdPtsRowQ, idx % 2 === 0 && { backgroundColor: "#FAFAFA" }]}>
                      <View style={[styles.tdPtsCell, { flex: 1 }]}>
                        <View style={[styles.tdRankBadge,
                          row.rank === 1 && { backgroundColor: "#FFD700" },
                          row.rank === 2 && { backgroundColor: "#C0C0C0" },
                          row.rank === 3 && { backgroundColor: "#CD7F32" },
                        ]}>
                          <Text style={[styles.tdRankText, row.rank <= 3 && { color: "#FFF" }]}>{row.rank}</Text>
                        </View>
                      </View>
                      <View style={[styles.tdPtsCell, { flex: 2.5, flexDirection: "row", alignItems: "center" }]}>
                        <LinearGradient colors={["#B91C1C", "#7F1D1D"]} style={styles.tdTeamDot}>
                          <Text style={styles.tdTeamDotText}>{row.team.charAt(0)}</Text>
                        </LinearGradient>
                        <Text style={styles.tdTeamLabel} numberOfLines={1}>{row.team}</Text>
                        {row.q && <Ionicons name="checkmark-circle" size={12} color="#4CAF50" style={{ marginLeft: 4 }} />}
                      </View>
                      <Text style={[styles.tdPtsCell, { flex: 1, textAlign: "center" }]}>{row.p}</Text>
                      <Text style={[styles.tdPtsCell, { flex: 1, textAlign: "center", color: "#4CAF50", fontWeight: "700" }]}>{row.w}</Text>
                      <Text style={[styles.tdPtsCell, { flex: 1, textAlign: "center", color: "#E63946", fontWeight: "700" }]}>{row.l}</Text>
                      <Text style={[styles.tdPtsCell, { flex: 1, textAlign: "center", color: row.nrr.startsWith("+") ? "#4CAF50" : "#E63946", fontSize: 11 }]}>{row.nrr}</Text>
                      <Text style={[styles.tdPtsCell, { flex: 1, textAlign: "center", fontWeight: "800", color: "#B91C1C" }]}>{row.pts}</Text>
                    </View>
                  ))}
                  <View style={styles.tdLegend}>
                    <View style={styles.tdLegendRow}>
                      <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
                      <Text style={styles.tdLegendText}>Qualified for playoffs</Text>
                    </View>
                    <Text style={styles.tdLegendNote}>P=Played · W=Won · L=Lost · NRR=Net Run Rate</Text>
                  </View>
                  <View style={{ height: 80 }} />
                </View>
              )}

              {/* ── Leaderboard Tab ── */}
              {activeTournamentDetailTab === "leaderboard" && (
                <View style={styles.tdSection}>
                  <Text style={styles.tdSectionTitle}>🏏 Top Batsmen</Text>
                  {[
                    { rank: 1, name: "Virat Kohli",   team: "Warriors", runs: 428, avg: "71.3", sr: "148.2", icon: "🥇" },
                    { rank: 2, name: "Rohit Sharma",  team: "Lions",    runs: 390, avg: "65.0", sr: "140.5", icon: "🥈" },
                    { rank: 3, name: "Suresh Raina",  team: "Eagles",   runs: 345, avg: "57.5", sr: "135.7", icon: "🥉" },
                  ].map((p) => (
                    <View key={p.rank} style={styles.tdPlayerCard}>
                      <Text style={styles.tdPlayerIcon}>{p.icon}</Text>
                      <View style={styles.tdPlayerInfo}>
                        <Text style={styles.tdPlayerName}>{p.name}</Text>
                        <Text style={styles.tdPlayerTeam}>{p.team}</Text>
                      </View>
                      <View style={styles.tdPlayerStats}>
                        <Text style={styles.tdPlayerStatMain}>{p.runs}</Text>
                        <Text style={styles.tdPlayerStatSub}>Runs</Text>
                        <View style={styles.tdPlayerMeta}>
                          <Text style={styles.tdPlayerMetaText}>Avg {p.avg}</Text>
                          <Text style={styles.tdPlayerMetaText}>SR {p.sr}</Text>
                        </View>
                      </View>
                    </View>
                  ))}

                  <Text style={[styles.tdSectionTitle, { marginTop: 20 }]}>🎯 Top Bowlers</Text>
                  {[
                    { rank: 1, name: "Jasprit Bumrah",    team: "Tigers",   wkts: 18, avg: "11.2", econ: "6.1", icon: "🥇" },
                    { rank: 2, name: "Rashid Khan",       team: "Strikers", wkts: 15, avg: "13.4", econ: "6.5", icon: "🥈" },
                    { rank: 3, name: "Yuzvendra Chahal",  team: "Hawks",    wkts: 13, avg: "15.8", econ: "7.0", icon: "🥉" },
                  ].map((p) => (
                    <View key={p.rank} style={styles.tdPlayerCard}>
                      <Text style={styles.tdPlayerIcon}>{p.icon}</Text>
                      <View style={styles.tdPlayerInfo}>
                        <Text style={styles.tdPlayerName}>{p.name}</Text>
                        <Text style={styles.tdPlayerTeam}>{p.team}</Text>
                      </View>
                      <View style={styles.tdPlayerStats}>
                        <Text style={styles.tdPlayerStatMain}>{p.wkts}</Text>
                        <Text style={styles.tdPlayerStatSub}>Wickets</Text>
                        <View style={styles.tdPlayerMeta}>
                          <Text style={styles.tdPlayerMetaText}>Avg {p.avg}</Text>
                          <Text style={styles.tdPlayerMetaText}>Econ {p.econ}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                  <View style={{ height: 80 }} />
                </View>
              )}

              {/* ── Teams Tab ── */}
              {activeTournamentDetailTab === "teams" && (
                <View style={styles.tdSection}>
                  {/* Simple Team Management Options */}
                  <View style={styles.simpleTeamMgmtContainer}>
                    
                    {/* Add Teams Button */}
                    <TouchableOpacity 
                      style={styles.simpleTeamMgmtButton}
                      onPress={() => {
                        console.log("Add Teams pressed - navigating to Add Teams & Players page");
                        setCurrentView("addTeamsPlayers");
                      }}
                    >
                      <LinearGradient
                        colors={["#B91C1C", "#991B1B"]}
                        style={styles.simpleTeamMgmtButtonGradient}
                      >
                        <Ionicons name="people-outline" size={24} color="#FFF" />
                        <Text style={styles.simpleTeamMgmtButtonText}>Add Teams</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Invite Teams via Link Button */}
                    <TouchableOpacity 
                      style={styles.simpleTeamMgmtButton}
                      onPress={() => Alert.alert("Invite Teams", "Tournament link will be generated and shared")}
                    >
                      <LinearGradient
                        colors={["#059669", "#047857"]}
                        style={styles.simpleTeamMgmtButtonGradient}
                      >
                        <Ionicons name="link-outline" size={24} color="#FFF" />
                        <Text style={styles.simpleTeamMgmtButtonText}>Invite Teams via Link</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                  </View>

                  <View style={{ height: 80 }} />
                </View>
              )}

            </ScrollView>

            {/* Fixed bottom CTA */}
            <View style={styles.tdBottomBar}>
              <TouchableOpacity
                style={styles.tdBottomBtn}
                onPress={() => {
                  setCurrentView("tournamentTeamManagement");
                  setShowAddPlayerModal(true);
                }}
              >
                <LinearGradient colors={["#B91C1C", "#7F1D1D"]} style={styles.tdBottomBtnGrad}>
                  <Ionicons name="settings-outline" size={18} color="#FFF" />
                  <Text style={styles.tdBottomBtnText}>Manage Tournament</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : currentView === "tournamentTeamManagement" ? (
          /* Tournament Team Management View */
          <View style={styles.tournamentDashboardContainer}>
            {/* Red Gradient Header with Tournament Info */}
            <LinearGradient
              colors={["#E63946", "#C1121F", "#780000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tournamentDashboardHeader}
            >
              {/* Trophy Icon */}
              <View style={styles.tournamentTrophyContainer}>
                <View style={styles.tournamentTrophyCircle}>
                  <Ionicons name="trophy" size={48} color="#FFD700" />
                </View>
              </View>

              {/* Tournament Name */}
              <Text style={styles.tournamentDashboardTitle}>{tournamentName || "Mumbai Premier League 2024"}</Text>
              
              {/* Status Badge */}
              <View style={styles.tournamentStatusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.tournamentStatusText}>Ongoing</Text>
              </View>

              {/* Stats Row */}
              <View style={styles.tournamentStatsRow}>
                <View style={styles.tournamentStatItem}>
                  <Ionicons name="people" size={20} color="#FFF" />
                  <Text style={styles.tournamentStatNumber}>8</Text>
                  <Text style={styles.tournamentStatLabel}>Teams</Text>
                </View>
                <View style={styles.tournamentStatItem}>
                  <Ionicons name="baseball" size={20} color="#FFF" />
                  <Text style={styles.tournamentStatNumber}>24</Text>
                  <Text style={styles.tournamentStatLabel}>Matches</Text>
                </View>
                <View style={styles.tournamentStatItem}>
                  <Ionicons name="calendar" size={20} color="#FFF" />
                  <Text style={styles.tournamentStatNumber}>May 15</Text>
                  <Text style={styles.tournamentStatLabel}>Start</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.tournamentProgressContainer}>
                <View style={styles.tournamentProgressBar}>
                  <View style={[styles.tournamentProgressFill, { width: "65%" }]} />
                </View>
                <Text style={styles.tournamentProgressText}>65% Complete</Text>
              </View>
            </LinearGradient>

            {/* Dashboard Tabs */}
            <View style={styles.tournamentTabsContainer}>
              {["matches", "points", "leaderboard", "teams"].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tournamentTab,
                    activeTournamentTab === tab && styles.tournamentTabActive,
                  ]}
                  onPress={() => setActiveTournamentTab(tab)}
                >
                  <Text
                    style={[
                      styles.tournamentTabText,
                      activeTournamentTab === tab && styles.tournamentTabTextActive,
                    ]}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                  {activeTournamentTab === tab && (
                    <View style={styles.tournamentTabIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Content based on active tab */}
            {activeTournamentTab === "matches" && (
              <ScrollView style={styles.tournamentTabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.tournamentSectionTitle}>Upcoming Matches</Text>
                
                {[
                  { id: 1, team1: "Warriors", team1Initial: "W", team1Color: "#B91C1C", team2: "Strikers", team2Initial: "S", team2Color: "#1E40AF", date: "Today", time: "6:00 PM", venue: "Ground A" },
                  { id: 2, team1: "Lions", team1Initial: "L", team1Color: "#B91C1C", team2: "Tigers", team2Initial: "T", team2Color: "#1E40AF", date: "Tomorrow", time: "5:00 PM", venue: "Ground B" },
                  { id: 3, team1: "Eagles", team1Initial: "E", team1Color: "#B91C1C", team2: "Hawks", team2Initial: "H", team2Color: "#1E40AF", date: "May 12", time: "7:00 PM", venue: "Ground A" },
                ].map((match) => (
                  <View key={match.id} style={styles.tournamentMatchCard}>
                    {/* Match Header */}
                    <View style={styles.tournamentMatchHeader}>
                      <View style={styles.upcomingBadge}>
                        <Text style={styles.upcomingBadgeText}>UPCOMING</Text>
                      </View>
                      <Text style={styles.tournamentMatchTime}>{match.date} · {match.time}</Text>
                    </View>

                    {/* Teams Row */}
                    <View style={styles.tournamentMatchTeams}>
                      {/* Team 1 */}
                      <View style={styles.tournamentTeamSection}>
                        <View style={[styles.tournamentTeamCircle, { backgroundColor: match.team1Color }]}>
                          <Text style={styles.tournamentTeamInitial}>{match.team1Initial}</Text>
                        </View>
                        <Text style={styles.tournamentTeamName}>{match.team1}</Text>
                      </View>

                      {/* VS */}
                      <View style={styles.tournamentVsContainer}>
                        <Text style={styles.tournamentVsText}>vs</Text>
                      </View>

                      {/* Team 2 */}
                      <View style={styles.tournamentTeamSection}>
                        <View style={[styles.tournamentTeamCircle, { backgroundColor: match.team2Color }]}>
                          <Text style={styles.tournamentTeamInitial}>{match.team2Initial}</Text>
                        </View>
                        <Text style={styles.tournamentTeamName}>{match.team2}</Text>
                      </View>

                      {/* Action Menu */}
                      <TouchableOpacity style={styles.tournamentMatchMenu}>
                        <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {/* Venue */}
                    <View style={styles.tournamentMatchVenue}>
                      <Ionicons name="location-outline" size={14} color="#999" />
                      <Text style={styles.tournamentMatchVenueText}>{match.venue}</Text>
                    </View>
                  </View>
                ))}

                <View style={{ height: 100 }} />
              </ScrollView>
            )}

            {activeTournamentTab === "points" && (
              <ScrollView style={styles.dashboardTabContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.dashboardSectionTitle}>Points Table</Text>
                <View style={styles.pointsTable}>
                  {/* Table Header */}
                  <LinearGradient
                    colors={["#E63946", "#C1121F"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pointsTableHeader}
                  >
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell, { flex: 0.8 }]}>#</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell, { flex: 2.5 }]}>Team</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>P</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>W</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>L</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell]}>NRR</Text>
                    <Text style={[styles.pointsTableCell, styles.pointsTableHeaderCell, { fontWeight: "bold" }]}>Pts</Text>
                  </LinearGradient>
                  
                  {/* Table Rows */}
                  {[
                    { rank: 1, team: "Team A", p: 6, w: 5, l: 1, nrr: "+1.25", pts: 10, qualified: true },
                    { rank: 2, team: "Team B", p: 6, w: 4, l: 2, nrr: "+0.85", pts: 8, qualified: true },
                    { rank: 3, team: "Team C", p: 5, w: 3, l: 2, nrr: "+0.45", pts: 6, qualified: false },
                    { rank: 4, team: "Team D", p: 5, w: 2, l: 3, nrr: "-0.32", pts: 4, qualified: false },
                    { rank: 5, team: "Team E", p: 6, w: 1, l: 5, nrr: "-1.15", pts: 2, qualified: false },
                  ].map((row, idx) => (
                    <View 
                      key={idx} 
                      style={[
                        styles.pointsTableRow,
                        row.qualified && styles.pointsTableRowQualified
                      ]}
                    >
                      <View style={[styles.pointsTableCell, { flex: 0.8 }]}>
                        <View style={[
                          styles.rankBadge,
                          row.rank === 1 && { backgroundColor: "#FFD700" },
                          row.rank === 2 && { backgroundColor: "#C0C0C0" },
                          row.rank === 3 && { backgroundColor: "#CD7F32" },
                        ]}>
                          <Text style={[
                            styles.rankText,
                            row.rank <= 3 && { color: "#FFF" }
                          ]}>{row.rank}</Text>
                        </View>
                      </View>
                      <View style={[styles.pointsTableCell, { flex: 2.5, flexDirection: "row", alignItems: "center" }]}>
                        <LinearGradient
                          colors={["#17A2B8", "#138496"]}
                          style={styles.teamIconSmall}
                        >
                          <Text style={styles.teamIconSmallText}>{row.team.charAt(5)}</Text>
                        </LinearGradient>
                        <Text style={styles.pointsTableTeamCell}>{row.team}</Text>
                      </View>
                      <Text style={styles.pointsTableCell}>{row.p}</Text>
                      <Text style={[styles.pointsTableCell, { color: "#4CAF50", fontWeight: "600" }]}>{row.w}</Text>
                      <Text style={[styles.pointsTableCell, { color: "#E63946", fontWeight: "600" }]}>{row.l}</Text>
                      <Text style={[styles.pointsTableCell, { color: row.nrr.startsWith("+") ? "#4CAF50" : "#E63946" }]}>{row.nrr}</Text>
                      <Text style={[styles.pointsTableCell, styles.pointsTablePtsCell]}>{row.pts}</Text>
                    </View>
                  ))}
                </View>

                {/* Legend */}
                <View style={styles.pointsLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: "#4CAF50" }]} />
                    <Text style={styles.legendText}>Qualified for playoffs</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Text style={styles.legendLabel}>P - Played | W - Won | L - Lost | NRR - Net Run Rate</Text>
                  </View>
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>
            )}

            {activeTournamentTab === "leaderboard" && (
              <ScrollView style={styles.dashboardTabContent} showsVerticalScrollIndicator={false}>
                {/* Top Batsmen */}
                <Text style={styles.dashboardSectionTitle}>🏏 Top Batsmen</Text>
                {[
                  { rank: 1, name: "Virat Kohli", team: "Team A", runs: 450, avg: "75.0", sr: "145.2", icon: "🥇" },
                  { rank: 2, name: "Rohit Sharma", team: "Team B", runs: 420, avg: "70.0", sr: "138.5", icon: "🥈" },
                  { rank: 3, name: "Suresh Raina", team: "Team C", runs: 380, avg: "63.3", sr: "142.1", icon: "🥉" },
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
                        <View style={styles.leaderboardSubStats}>
                          <Text style={styles.leaderboardSubStat}>Avg: {player.avg}</Text>
                          <Text style={styles.leaderboardSubStat}>SR: {player.sr}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ))}

                {/* Top Bowlers */}
                <Text style={[styles.dashboardSectionTitle, { marginTop: 24 }]}>🎯 Top Bowlers</Text>
                {[
                  { rank: 1, name: "Jasprit Bumrah", team: "Team D", wickets: 18, avg: "12.5", econ: "6.2", icon: "🥇" },
                  { rank: 2, name: "Rashid Khan", team: "Team E", wickets: 16, avg: "14.2", econ: "6.8", icon: "🥈" },
                  { rank: 3, name: "Yuzvendra Chahal", team: "Team F", wickets: 14, avg: "16.1", econ: "7.1", icon: "🥉" },
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
                        <Text style={styles.leaderboardRuns}>{player.wickets}</Text>
                        <Text style={styles.leaderboardRunsLabel}>Wickets</Text>
                        <View style={styles.leaderboardSubStats}>
                          <Text style={styles.leaderboardSubStat}>Avg: {player.avg}</Text>
                          <Text style={styles.leaderboardSubStat}>Econ: {player.econ}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ))}

                {/* Most Valuable Players */}
                <Text style={[styles.dashboardSectionTitle, { marginTop: 24 }]}>⭐ Most Valuable Players</Text>
                {[
                  { rank: 1, name: "MS Dhoni", team: "Team G", points: 850, role: "All-rounder" },
                  { rank: 2, name: "Hardik Pandya", team: "Team H", points: 780, role: "All-rounder" },
                ].map((player) => (
                  <View key={player.rank} style={styles.leaderboardItem}>
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.leaderboardItemGradient}
                    >
                      <View style={styles.leaderboardRank}>
                        <LinearGradient
                          colors={["#FFD700", "#FFA500"]}
                          style={styles.mvpBadge}
                        >
                          <Text style={styles.mvpBadgeText}>{player.rank}</Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.leaderboardInfo}>
                        <Text style={styles.leaderboardName}>{player.name}</Text>
                        <Text style={styles.leaderboardTeam}>{player.team} • {player.role}</Text>
                      </View>
                      <View style={styles.leaderboardStats}>
                        <Text style={styles.leaderboardRuns}>{player.points}</Text>
                        <Text style={styles.leaderboardRunsLabel}>Points</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
                <View style={{ height: 20 }} />
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
                          colors={["#B91C1C", "#991B1B"]}
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
                              ? ["#B91C1C", "#991B1B"]
                              : ["#DC2626", "#991B1B"]
                          }
                          style={styles.teamItemStatus}
                        >
                          <Text style={styles.teamItemStatusText}>{team.status}</Text>
                        </LinearGradient>
                      </View>
                      <View style={styles.teamItemStats}>
                        <View style={styles.teamItemStat}>
                          <Ionicons name="people" size={14} color="#B91C1C" />
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
                  colors={["#B91C1C", "#991B1B"]}
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
                  colors={["#B91C1C", "#991B1B"]}
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
                  colors={["#B91C1C", "#991B1B"]}
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
                  colors={["#DC2626", "#B91C1C"]}
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

            <View style={{ height: 100 }} />
              </ScrollView>
            )}
          </View>
        ) : currentView === "addTeamsPlayers" ? (
          /* Add Teams & Players View */
          <View style={styles.addTeamsPlayersContainer}>
            <Text style={styles.addTeamsPlayersTitle}>Add Teams & Players</Text>
            <Text style={styles.addTeamsPlayersSubtitle}>
              Choose how you want to add participants to your tournament
            </Text>

            <ScrollView style={styles.addTeamsPlayersContent} showsVerticalScrollIndicator={false}>
              {/* Team Link Option */}
              <TouchableOpacity
                style={styles.addTeamsOption}
                onPress={() => {
                  console.log("Add via Team Link");
                  // Generate tournament invite link
                  const tournamentLink = "https://crickbuz.app/join/MPL2024-8X7K";
                  Alert.alert(
                    "Tournament Link Generated",
                    `Your tournament invite link:\n\n${tournamentLink}\n\nShare this link with teams and players to let them join instantly!`,
                    [
                      { 
                        text: "Copy Link", 
                        onPress: () => {
                          // In a real app, this would copy to clipboard
                          Alert.alert("Copied!", "Tournament link copied to clipboard");
                        }
                      },
                      { 
                        text: "Share Link", 
                        onPress: () => {
                          Alert.alert("Share", "Link shared via WhatsApp, SMS, and social media!");
                        }
                      },
                      { text: "Close", style: "cancel" }
                    ]
                  );
                }}
              >
                <LinearGradient
                  colors={["#20B2AA", "#17A2B8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addTeamsOptionGradient}
                >
                  <View style={styles.addTeamsOptionIconCircle}>
                    <Ionicons name="link" size={24} color="#FFF" />
                  </View>
                  <View style={styles.addTeamsOptionTextContainer}>
                    <Text style={styles.addTeamsOptionTitle}>Team Link</Text>
                    <Text style={styles.addTeamsOptionDescription}>
                      Share invite link with teams and players
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* QR Code Option */}
              <TouchableOpacity
                style={styles.addTeamsOption}
                onPress={() => {
                  console.log("Add via QR Code");
                  // Generate dummy QR code
                  Alert.alert(
                    "QR Code Generated",
                    "Tournament QR Code has been generated!\n\nTournament ID: MPL2024-8X7K\nCode: QR-CRICKET-JOIN-789\n\nTeams can scan this code to join your tournament instantly.",
                    [
                      { text: "Share QR Code", onPress: () => {
                        Alert.alert("Share", "QR Code shared via WhatsApp, SMS, and Email!");
                      }},
                      { text: "Save to Gallery", onPress: () => {
                        Alert.alert("Saved", "QR Code saved to your photo gallery!");
                      }},
                      { text: "Close", style: "cancel" }
                    ]
                  );
                }}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#7C3AED"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addTeamsOptionGradient}
                >
                  <View style={styles.addTeamsOptionIconCircle}>
                    <Ionicons name="qr-code" size={24} color="#FFF" />
                  </View>
                  <View style={styles.addTeamsOptionTextContainer}>
                    <Text style={styles.addTeamsOptionTitle}>QR Code</Text>
                    <Text style={styles.addTeamsOptionDescription}>
                      Let teams scan to join tournament
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* From Contacts Option */}
              <TouchableOpacity
                style={styles.addTeamsOption}
                onPress={async () => {
                  console.log("Add from Contacts");
                  try {
                    // Request contacts permission (dummy implementation)
                    Alert.alert(
                      "Access Contacts",
                      "This feature would access your contacts to invite teams and players. Would you like to continue?",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Allow Access", 
                          onPress: () => {
                            // Simulate contact access
                            setTimeout(() => {
                              Alert.alert(
                                "Contacts Loaded",
                                "Found 25 contacts with cricket interests. You can now select and invite them to your tournament.",
                                [{ text: "OK" }]
                              );
                            }, 1000);
                          }
                        }
                      ]
                    );
                  } catch (error) {
                    Alert.alert("Error", "Unable to access contacts. Please check permissions.");
                  }
                }}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addTeamsOptionGradient}
                >
                  <View style={styles.addTeamsOptionIconCircle}>
                    <Ionicons name="person-add" size={24} color="#FFF" />
                  </View>
                  <View style={styles.addTeamsOptionTextContainer}>
                    <Text style={styles.addTeamsOptionTitle}>From Contacts</Text>
                    <Text style={styles.addTeamsOptionDescription}>
                      Select teams and players from phone contacts
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Add New Team Option */}
              <TouchableOpacity
                style={styles.addTeamsOption}
                onPress={() => {
                  console.log("Add New Team");
                  setCurrentView("createTeam");
                }}
              >
                <LinearGradient
                  colors={["#EF4444", "#DC2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.addTeamsOptionGradient}
                >
                  <View style={styles.addTeamsOptionIconCircle}>
                    <Ionicons name="add-circle" size={24} color="#FFF" />
                  </View>
                  <View style={styles.addTeamsOptionTextContainer}>
                    <Text style={styles.addTeamsOptionTitle}>Add New Team</Text>
                    <Text style={styles.addTeamsOptionDescription}>
                      Create a new team for your tournament
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        ) : currentView === "teamsSelection" ? (
          /* Teams Selection View */
          <View style={styles.teamsSelectionContainer}>
            <Text style={styles.teamsSelectionTitle}>Select Your Team</Text>
            <Text style={styles.teamsSelectionSubtitle}>
              Choose from your existing teams or recently played teams
            </Text>

            <ScrollView style={styles.teamsSelectionContent} showsVerticalScrollIndicator={false}>
              {/* My Teams Section */}
              <Text style={styles.teamsSectionTitle}>My Teams</Text>
              
              {[
                { id: 1, name: "Mumbai Warriors", players: 15, matches: 12, wins: 8, color: "#B91C1C" },
                { id: 2, name: "Delhi Capitals", players: 14, matches: 10, wins: 6, color: "#059669" },
                { id: 3, name: "Chennai Kings", players: 16, matches: 8, wins: 5, color: "#DC2626" },
                { id: 4, name: "Bangalore Riders", players: 13, matches: 6, wins: 4, color: "#7C3AED" },
                { id: 5, name: "Kolkata Knights", players: 15, matches: 9, wins: 7, color: "#F59E0B" }
              ].map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.teamSelectionCard}
                  onPress={() => {
                    Alert.alert(
                      "Team Selected",
                      `You selected ${team.name}\n\nPlayers: ${team.players}\nMatches Played: ${team.matches}\nWins: ${team.wins}`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Confirm Selection", onPress: () => {
                          Alert.alert("Success", `${team.name} has been selected for your match!`);
                          setCurrentView("matches");
                        }}
                      ]
                    );
                  }}
                >
                  <View style={[styles.teamSelectionIcon, { backgroundColor: team.color }]}>
                    <Text style={styles.teamSelectionInitial}>{team.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.teamSelectionInfo}>
                    <Text style={styles.teamSelectionName}>{team.name}</Text>
                    <Text style={styles.teamSelectionStats}>
                      {team.players} players • {team.matches} matches • {team.wins} wins
                    </Text>
                  </View>
                  <View style={styles.teamSelectionAction}>
                    <Ionicons name="checkmark-circle-outline" size={24} color="#B91C1C" />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Recently Played Teams Section */}
              <Text style={[styles.teamsSectionTitle, { marginTop: 30 }]}>Recently Played</Text>
              
              {[
                { id: 6, name: "Pune Superstars", players: 11, lastPlayed: "2 days ago", color: "#EF4444" },
                { id: 7, name: "Hyderabad Heroes", players: 13, lastPlayed: "1 week ago", color: "#10B981" },
                { id: 8, name: "Rajasthan Royals", players: 12, lastPlayed: "2 weeks ago", color: "#8B5CF6" }
              ].map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.teamSelectionCard}
                  onPress={() => {
                    Alert.alert(
                      "Select Opponent Team",
                      `Select ${team.name} as your opponent?\n\nPlayers: ${team.players}\nLast Played: ${team.lastPlayed}`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { text: "Select as Opponent", onPress: () => {
                          Alert.alert("Success", `${team.name} selected as opponent team!`);
                          setCurrentView("matches");
                        }}
                      ]
                    );
                  }}
                >
                  <View style={[styles.teamSelectionIcon, { backgroundColor: team.color }]}>
                    <Text style={styles.teamSelectionInitial}>{team.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.teamSelectionInfo}>
                    <Text style={styles.teamSelectionName}>{team.name}</Text>
                    <Text style={styles.teamSelectionStats}>
                      {team.players} players • Last played {team.lastPlayed}
                    </Text>
                  </View>
                  <View style={styles.teamSelectionAction}>
                    <Ionicons name="add-circle-outline" size={24} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}

              <View style={{ height: 100 }} />
            </ScrollView>
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
                    colors={["#B91C1C", "#991B1B"]}
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
                    colors={["#B91C1C", "#991B1B"]}
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
                    colors={["#B91C1C", "#991B1B"]}
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
                colors={["#FEF2F2", "#FEF2F2", "#FEE2E2"]}
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
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>
                Number of Overs {(matchType === "limited" || matchType === "box") && "*"}
              </Text>
              
              {/* Overs Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="timer-outline" size={18} color="#B91C1C" />
                <TextInput
                  style={styles.input}
                  placeholder="Type number of overs"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={numberOfOvers}
                  onChangeText={setNumberOfOvers}
                />
                {numberOfOvers && (
                  <TouchableOpacity onPress={() => setNumberOfOvers("")}>
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Location - City & Ground */}
            <View style={styles.setupSection}>
              <Text style={styles.setupSectionTitle}>Location *</Text>
              
              {!locationEnabled ? (
                <TouchableOpacity 
                  style={styles.locationButton}
                  onPress={handleEnableLocation}
                >
                  <LinearGradient
                    colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
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
                    colors={["#FEF2F2", "#FEE2E2"]}
                    style={styles.locationEnabledHeader}
                  >
                    <View style={styles.locationEnabledBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#B91C1C" />
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
                                  ? ["#FEE2E2", "#FCA5A5"]
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
                                  <Ionicons name="checkmark-circle" size={24} color="#B91C1C" />
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
                            colors={["#B91C1C", "#991B1B"]}
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
                    <Ionicons name="business-outline" size={18} color="#B91C1C" />
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
                    <Ionicons name="location-outline" size={18} color="#B91C1C" />
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
                  { id: "rough", label: "Rough", icon: "trail-sign", color: "#7F1D1D" },
                  { id: "cement", label: "Cement", icon: "cube", color: "#95A5A6" },
                  { id: "turf", label: "Turf", icon: "leaf", color: "#B91C1C" },
                  { id: "astroturf", label: "Astro", icon: "sparkles", color: "#B91C1C" },
                  { id: "matting", label: "Matting", icon: "grid", color: "#991B1B" },
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
                  <Ionicons name="calendar-outline" size={18} color="#B91C1C" />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#999"
                    value={matchDate}
                    onChangeText={setMatchDate}
                  />
                </View>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <Ionicons name="time-outline" size={18} color="#B91C1C" />
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
                  <Ionicons name="analytics-outline" size={20} color="#B91C1C" />
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
                <Ionicons name="person-outline" size={18} color="#B91C1C" />
                <TextInput
                  style={styles.input}
                  placeholder="Umpire 1"
                  placeholderTextColor="#999"
                  value={umpire1}
                  onChangeText={setUmpire1}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#B91C1C" />
                <TextInput
                  style={styles.input}
                  placeholder="Umpire 2"
                  placeholderTextColor="#999"
                  value={umpire2}
                  onChangeText={setUmpire2}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="create-outline" size={18} color="#B91C1C" />
                <TextInput
                  style={styles.input}
                  placeholder="Scorer"
                  placeholderTextColor="#999"
                  value={scorer}
                  onChangeText={setScorer}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="videocam-outline" size={18} color="#B91C1C" />
                <TextInput
                  style={styles.input}
                  placeholder="Live Streamer"
                  placeholderTextColor="#999"
                  value={liveStreamer}
                  onChangeText={setLiveStreamer}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={18} color="#B91C1C" />
                <TextInput
                  style={styles.input}
                  placeholder="Others"
                  placeholderTextColor="#999"
                  value={others}
                  onChangeText={setOthers}
                />
              </View>
            </View>

            {/* Let's Toss Button */}
            <TouchableOpacity
              style={styles.startMatchButton}
              onPress={() => {
                // Validation
                if (!matchType) {
                  Alert.alert("Required Field", "Please select match type");
                  return;
                }
                
                if ((matchType === "limited" || matchType === "box") && !numberOfOvers.trim()) {
                  Alert.alert("Required Field", "Please enter number of overs");
                  return;
                }
                
                if ((matchType === "limited" || matchType === "box") && numberOfOvers.trim()) {
                  const overs = parseInt(numberOfOvers);
                  if (isNaN(overs) || overs < 1 || overs > 50) {
                    Alert.alert("Invalid Input", "Please enter a valid number of overs (1-50)");
                    return;
                  }
                }
                
                if (!selectedCity.trim()) {
                  Alert.alert("Required Field", "Please select a city");
                  return;
                }
                
                if (!selectedGround.trim()) {
                  Alert.alert("Required Field", "Please select a ground");
                  return;
                }

                console.log("Match setup complete, proceeding to toss:", {
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
                
                // Navigate to toss page
                setCurrentView("tossPage");
              }}
            >
              <LinearGradient
                colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
                style={styles.startMatchButtonGradient}
              >
                <Ionicons name="disc" size={28} color="#FFF" />
                <Text style={styles.startMatchButtonText}>Let's Toss</Text>
                <Ionicons name="arrow-forward" size={24} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </View>
        ) : currentView === "tossPage" ? (
          /* Toss Page View */
          <View style={styles.tossContainer}>
            <Text style={styles.tossTitle}>Who won the toss?</Text>
            
            {/* Team Selection for Toss Winner */}
            <View style={styles.tossTeamsContainer}>
              <TouchableOpacity
                style={[
                  styles.tossTeamCard,
                  tossWinner === "A" && styles.tossTeamCardSelected,
                ]}
                onPress={() => setTossWinner("A")}
              >
                <View style={[
                  styles.tossTeamIcon,
                  { backgroundColor: tossWinner === "A" ? "#B91C1C" : "#E5E5E5" }
                ]}>
                  <Text style={[
                    styles.tossTeamInitial,
                    { color: tossWinner === "A" ? "#FFF" : "#666" }
                  ]}>
                    {teamAName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.tossTeamName,
                  tossWinner === "A" && styles.tossTeamNameSelected,
                ]}>
                  {teamAName}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tossTeamCard,
                  tossWinner === "B" && styles.tossTeamCardSelected,
                ]}
                onPress={() => setTossWinner("B")}
              >
                <View style={[
                  styles.tossTeamIcon,
                  { backgroundColor: tossWinner === "B" ? "#B91C1C" : "#E5E5E5" }
                ]}>
                  <Text style={[
                    styles.tossTeamInitial,
                    { color: tossWinner === "B" ? "#FFF" : "#666" }
                  ]}>
                    {teamBName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={[
                  styles.tossTeamName,
                  tossWinner === "B" && styles.tossTeamNameSelected,
                ]}>
                  {teamBName}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Toss Decision Section */}
            {tossWinner && (
              <View style={styles.tossDecisionSection}>
                <Text style={styles.tossDecisionTitle}>
                  Winner of the toss elected to?
                </Text>
                
                <View style={styles.tossDecisionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tossDecisionCard,
                      tossDecision === "bat" && styles.tossDecisionCardSelected,
                    ]}
                    onPress={() => setTossDecision("bat")}
                  >
                    <View style={[
                      styles.tossDecisionIcon,
                      { backgroundColor: tossDecision === "bat" ? "#B91C1C" : "#E5E5E5" }
                    ]}>
                      <Ionicons 
                        name="baseball" 
                        size={32} 
                        color={tossDecision === "bat" ? "#FFF" : "#666"} 
                      />
                    </View>
                    <Text style={[
                      styles.tossDecisionText,
                      tossDecision === "bat" && styles.tossDecisionTextSelected,
                    ]}>
                      BAT
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tossDecisionCard,
                      tossDecision === "bowl" && styles.tossDecisionCardSelected,
                    ]}
                    onPress={() => setTossDecision("bowl")}
                  >
                    <View style={[
                      styles.tossDecisionIcon,
                      { backgroundColor: tossDecision === "bowl" ? "#B91C1C" : "#E5E5E5" }
                    ]}>
                      <Ionicons 
                        name="fitness" 
                        size={32} 
                        color={tossDecision === "bowl" ? "#FFF" : "#666"} 
                      />
                    </View>
                    <Text style={[
                      styles.tossDecisionText,
                      tossDecision === "bowl" && styles.tossDecisionTextSelected,
                    ]}>
                      BOWL
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Start Match Button */}
            {tossWinner && tossDecision && (
              <TouchableOpacity
                style={styles.startMatchButton}
                onPress={() => {
                  const winnerTeam = tossWinner === "A" ? teamAName : teamBName;
                  console.log(`${winnerTeam} won the toss and elected to ${tossDecision.toUpperCase()} first.`);
                  
                  // Navigate to player selection
                  setCurrentView("playerSelection");
                }}
              >
                <LinearGradient
                  colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
                  style={styles.startMatchButtonGradient}
                >
                  <Ionicons name="play-circle" size={28} color="#FFF" />
                  <Text style={styles.startMatchButtonText}>Start Match</Text>
                  <Ionicons name="arrow-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </View>
        ) : currentView === "playerSelection" ? (
          /* Player Selection Page */
          <ScrollView style={styles.playerSelectionContainer} showsVerticalScrollIndicator={false}>
            {/* Batting Team Section */}
            <View style={styles.playerSection}>
              <Text style={styles.playerSectionTitle}>
                Batting - {tossDecision === "bat" ? (tossWinner === "A" ? teamAName : teamBName) : (tossWinner === "A" ? teamBName : teamAName)}
              </Text>
              
              {/* Striker Selection */}
              <View style={styles.playerSelectionRow}>
                <TouchableOpacity 
                  style={[styles.playerSelectionCard, selectedStriker && styles.playerSelectionCardSelected]}
                  onPress={() => {
                    setPlayerModalType("striker");
                    setShowPlayerModal(true);
                  }}
                >
                  <View style={styles.playerIconContainer}>
                    <Ionicons name="baseball" size={40} color="#666" />
                  </View>
                  <Text style={styles.playerSelectionLabel}>Select Striker</Text>
                  {selectedStriker && (
                    <Text style={styles.selectedPlayerName}>{selectedStriker.name}</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.playerSelectionCard, selectedNonStriker && styles.playerSelectionCardSelected]}
                  onPress={() => {
                    setPlayerModalType("nonStriker");
                    setShowPlayerModal(true);
                  }}
                >
                  <View style={styles.playerIconContainer}>
                    <Ionicons name="walk" size={40} color="#666" />
                  </View>
                  <Text style={styles.playerSelectionLabel}>Select Non-striker</Text>
                  {selectedNonStriker && (
                    <Text style={styles.selectedPlayerName}>{selectedNonStriker.name}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Bowling Team Section */}
            <View style={styles.playerSection}>
              <Text style={styles.playerSectionTitle}>
                Bowling - {tossDecision === "bowl" ? (tossWinner === "A" ? teamAName : teamBName) : (tossWinner === "A" ? teamBName : teamAName)}
              </Text>
              
              {/* Bowler Selection */}
              <View style={styles.playerSelectionRow}>
                <TouchableOpacity 
                  style={[styles.playerSelectionCard, styles.bowlerCard, selectedBowler && styles.playerSelectionCardSelected]}
                  onPress={() => {
                    setPlayerModalType("bowler");
                    setShowPlayerModal(true);
                  }}
                >
                  <View style={styles.playerIconContainer}>
                    <Ionicons name="fitness" size={40} color="#666" />
                  </View>
                  <Text style={styles.playerSelectionLabel}>Select Bowler</Text>
                  {selectedBowler && (
                    <Text style={styles.selectedPlayerName}>{selectedBowler.name}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.playerActionButtons}>
              <TouchableOpacity 
                style={styles.matchSettingsButton}
                onPress={() => setCurrentView("matchSettings")}
              >
                <LinearGradient
                  colors={["#666", "#555"]}
                  style={styles.matchSettingsButtonGradient}
                >
                  <Ionicons name="settings-outline" size={20} color="#FFF" />
                  <Text style={styles.matchSettingsButtonText}>Match Settings</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.startScoringButton}
                onPress={() => {
                  // Validation: Check if all players are selected
                  if (!selectedStriker) {
                    Alert.alert("Missing Selection", "Please select a striker before starting the match.");
                    return;
                  }
                  if (!selectedNonStriker) {
                    Alert.alert("Missing Selection", "Please select a non-striker before starting the match.");
                    return;
                  }
                  if (!selectedBowler) {
                    Alert.alert("Missing Selection", "Please select a bowler before starting the match.");
                    return;
                  }

                  // Navigate to scoring page
                  setCurrentView("scoringPage");
                }}
              >
                <LinearGradient
                  colors={["#B91C1C", "#991B1B"]}
                  style={styles.startScoringButtonGradient}
                >
                  <Ionicons name="play-circle" size={20} color="#FFF" />
                  <Text style={styles.startScoringButtonText}>Start Scoring</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        ) : currentView === "matchSettings" ? (
          /* Match Settings Page */
          <ScrollView style={styles.matchSettingsContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.matchSettingsTitle}>Match Settings</Text>

            {/* Wagon Wheel Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>WAGON WHEEL</Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Disable Wagon Wheel for DOT Ball</Text>
                <TouchableOpacity 
                  style={[styles.toggle, wagonWheelDotBall && styles.toggleActive]}
                  onPress={() => setWagonWheelDotBall(!wagonWheelDotBall)}
                >
                  <View style={[styles.toggleThumb, wagonWheelDotBall && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Disable Wagon Wheel for 1s, 2s and 3s</Text>
                <TouchableOpacity 
                  style={[styles.toggle, wagonWheel123s && styles.toggleActive]}
                  onPress={() => setWagonWheel123s(!wagonWheel123s)}
                >
                  <View style={[styles.toggleThumb, wagonWheel123s && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Disable Shot Selection</Text>
                <TouchableOpacity 
                  style={[styles.toggle, shotSelection && styles.toggleActive]}
                  onPress={() => setShotSelection(!shotSelection)}
                >
                  <View style={[styles.toggleThumb, shotSelection && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.settingNote}>
                *WW and Shot Selection won't be disabled for boundaries and wickets.
              </Text>
            </View>

            {/* Wide/No Ball Rules Section */}
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>WIDE/NO BALL RULES</Text>
              
              <View style={styles.ruleItem}>
                <View style={styles.ruleHeader}>
                  <Text style={styles.ruleLabel}>A</Text>
                  <Text style={styles.ruleText}>Count Wide as a legal delivery</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.toggle, countWideAsLegal && styles.toggleActive]}
                  onPress={() => setCountWideAsLegal(!countWideAsLegal)}
                >
                  <View style={[styles.toggleThumb, countWideAsLegal && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.ruleItem}>
                <View style={styles.ruleHeader}>
                  <Text style={styles.ruleLabel}>B</Text>
                  <Text style={styles.ruleText}>Wide Runs</Text>
                </View>
                <View style={styles.runsCounter}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setWideRuns(Math.max(0, wideRuns - 1))}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{wideRuns}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setWideRuns(wideRuns + 1)}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.ruleItem}>
                <View style={styles.ruleHeader}>
                  <Text style={styles.ruleLabel}>C</Text>
                  <Text style={styles.ruleText}>Count No Ball as a legal delivery</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.toggle, countNoBallAsLegal && styles.toggleActive]}
                  onPress={() => setCountNoBallAsLegal(!countNoBallAsLegal)}
                >
                  <View style={[styles.toggleThumb, countNoBallAsLegal && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.ruleItem}>
                <View style={styles.ruleHeader}>
                  <Text style={styles.ruleLabel}>D</Text>
                  <Text style={styles.ruleText}>No Ball Runs</Text>
                </View>
                <View style={styles.runsCounter}>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setNoBallRuns(Math.max(0, noBallRuns - 1))}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color="#666" />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{noBallRuns}</Text>
                  <TouchableOpacity 
                    style={styles.counterButton}
                    onPress={() => setNoBallRuns(noBallRuns + 1)}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Ignore Rules */}
              <View style={styles.ignoreRulesContainer}>
                <Text style={styles.ignoreRulesLabel}>Ignore Rules</Text>
                <View style={styles.ignoreRulesOptions}>
                  {["A", "B", "C", "D"].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.ignoreRuleOption,
                        ignoreRules === option && styles.ignoreRuleOptionActive,
                      ]}
                      onPress={() => setIgnoreRules(option)}
                    >
                      <Text style={[
                        styles.ignoreRuleOptionText,
                        ignoreRules === option && styles.ignoreRuleOptionTextActive,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Save Settings Button */}
            <TouchableOpacity 
              style={styles.saveSettingsButton}
              onPress={() => {
                Alert.alert(
                  "Settings Saved",
                  "Match settings have been saved successfully!",
                  [{ text: "OK", onPress: () => setCurrentView("playerSelection") }]
                );
              }}
            >
              <LinearGradient
                colors={["#B91C1C", "#991B1B"]}
                style={styles.saveSettingsButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <Text style={styles.saveSettingsButtonText}>Save Settings</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Spacing */}
            <View style={{ height: 100 }} />
          </ScrollView>
        ) : currentView === "scoringPage" ? (
          /* Cricket Scoring Page */
          <View style={styles.scoringContainer}>
            {/* Match Header */}
            <View style={styles.scoringHeader}>
              <Text style={styles.matchHeaderText}>
                {tossDecision === "bat" ? (tossWinner === "A" ? teamAName : teamBName) : (tossWinner === "A" ? teamBName : teamAName)} won the toss and elected to field
              </Text>
            </View>

            {/* Batsmen Section */}
            <View style={styles.batsmenSection}>
              <View style={styles.batsmanCard}>
                <View style={styles.batsmanIcon}>
                  <Ionicons name="flash" size={16} color="#FF9500" />
                </View>
                <Text style={styles.batsmanName}>{selectedStriker?.name || "Aniket"}</Text>
                <Text style={styles.batsmanScore}>{strikerRuns}({strikerBalls})</Text>
              </View>

              <View style={styles.batsmanCard}>
                <View style={styles.batsmanIcon}>
                  <Ionicons name="person" size={16} color="#666" />
                </View>
                <Text style={styles.batsmanName}>{selectedNonStriker?.name || "Deepu"}</Text>
                <Text style={styles.batsmanScore}>{nonStrikerRuns}({nonStrikerBalls})</Text>
              </View>
            </View>

            {/* Bowler Section */}
            <View style={styles.bowlerSection}>
              <View style={styles.bowlerIcon}>
                <Ionicons name="baseball" size={16} color="#666" />
              </View>
              <Text style={styles.bowlerName}>{selectedBowler?.name || "Kapil Jangir"}</Text>
              <View style={styles.bowlerStats}>
                <Ionicons name="stats-chart" size={12} color="#4CAF50" />
              </View>
              <Text style={styles.bowlerFigures}>{bowlerOvers}</Text>
            </View>

            {/* Wicket Type Selection */}
            <View style={styles.wicketTypeSection}>
              <TouchableOpacity 
                style={[styles.wicketTypeButton, selectedWicketType === "overWicket" && styles.wicketTypeButtonActive]}
                onPress={() => setSelectedWicketType(selectedWicketType === "overWicket" ? null : "overWicket")}
              >
                <View style={styles.wicketIcon}>
                  <Ionicons name="stats-chart" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.wicketTypeText}>Over the Wicket</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.wicketTypeButton, selectedWicketType === "betweenWicket" && styles.wicketTypeButtonActive]}
                onPress={() => setSelectedWicketType(selectedWicketType === "betweenWicket" ? null : "betweenWicket")}
              >
                <View style={styles.wicketIcon}>
                  <Ionicons name="stats-chart" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.wicketTypeText}>Between the Wicket</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.wicketTypeButton, selectedWicketType === "roundWicket" && styles.wicketTypeButtonActive]}
                onPress={() => setSelectedWicketType(selectedWicketType === "roundWicket" ? null : "roundWicket")}
              >
                <View style={styles.wicketIcon}>
                  <Ionicons name="stats-chart" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.wicketTypeText}>Round the Wicket</Text>
              </TouchableOpacity>
            </View>

            {/* Scoring Buttons */}
            <View style={styles.scoringGrid}>
              {/* First Row */}
              <View style={styles.scoringRow}>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("0 runs")}>
                  <Text style={styles.scoreButtonText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("1 run")}>
                  <Text style={styles.scoreButtonText}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("2 runs")}>
                  <Text style={styles.scoreButtonText}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.scoreButton, styles.undoButton]} onPress={() => console.log("Undo")}>
                  <Text style={[styles.scoreButtonText, styles.undoButtonText]}>UNDO</Text>
                </TouchableOpacity>
              </View>

              {/* Second Row */}
              <View style={styles.scoringRow}>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("3 runs")}>
                  <Text style={styles.scoreButtonText}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("4 runs")}>
                  <Text style={styles.scoreButtonText}>4</Text>
                  <Text style={styles.scoreButtonSubText}>FOUR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("6 runs")}>
                  <Text style={styles.scoreButtonText}>6</Text>
                  <Text style={styles.scoreButtonSubText}>SIX</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("5,7 runs")}>
                  <Text style={styles.scoreButtonText}>5, 7</Text>
                </TouchableOpacity>
              </View>

              {/* Third Row */}
              <View style={styles.scoringRow}>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("Wide")}>
                  <Text style={styles.scoreButtonText}>WD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("No Ball")}>
                  <Text style={styles.scoreButtonText}>NB</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("Bye")}>
                  <Text style={styles.scoreButtonText}>BYE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.scoreButton, styles.outButton]} onPress={() => console.log("Out")}>
                  <Text style={[styles.scoreButtonText, styles.outButtonText]}>OUT</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.scoreButton} onPress={() => console.log("Leg Bye")}>
                <Text style={styles.scoreButtonText}>LB</Text>
              </TouchableOpacity>
            </View>
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
                    colors={["#B91C1C", "#991B1B"]}
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

                  <Ionicons name="chevron-forward" size={20} color="#B91C1C" />
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
                    <Ionicons name="shield" size={18} color="#B91C1C" />
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
                    <Ionicons name="location" size={18} color="#B91C1C" />
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
                      <Ionicons name="call" size={18} color="#B91C1C" />
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
                    <Ionicons name="person-circle" size={18} color="#B91C1C" />
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
                    <Ionicons name="people" size={18} color="#B91C1C" />
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
                  colors={["#B91C1C", "#991B1B"]}
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
                  colors={["#B91C1C", "#991B1B"]}
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
                        colors={["#B91C1C", "#991B1B"]}
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
                        colors={["#B91C1C", "#991B1B"]}
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
                        colors={["#B91C1C", "#991B1B"]}
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
                        colors={["#B91C1C", "#991B1B"]}
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
                colors={["#FFFFFF", "#FEF2F2"]}
                style={styles.teamCardGradient}
              >
                <View style={styles.teamHeaderRow}>
                  <LinearGradient
                    colors={["#B91C1C", "#7F1D1D"]}
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
                      colors={["#B91C1C", "#991B1B"]}
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
                      colors={["#B91C1C", "#991B1B"]}
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
                colors={["#FFFFFF", "#FEF2F2"]}
                style={styles.teamCardGradient}
              >
                <View style={styles.teamHeaderRow}>
                  <LinearGradient
                    colors={["#B91C1C", "#7F1D1D"]}
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
                      colors={["#B91C1C", "#991B1B"]}
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
                      colors={["#B91C1C", "#991B1B"]}
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
                  colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.letsPlayButtonGradient}
                >
                  <Ionicons name="play-circle" size={22} color="#FFF" />
                  <Text style={styles.letsPlayButtonText}>{"Let's Play!"}</Text>
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
                colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
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
                          color="#B91C1C"
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
                      colors={["#B91C1C", "#991B1B"]}
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
            {currentMatches.map((match, index) => (
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
                <TouchableOpacity 
                  style={styles.matchCard}
                  onPress={() => {
                    Alert.alert(
                      match.team,
                      `${match.type}\nStatus: ${match.status}\nDate: ${match.date}\nTime: ${match.time}\nLocation: ${match.location}\nFormat: ${match.format} (${match.overs})${match.result ? `\nResult: ${match.result}` : ''}`,
                      [
                        { text: "Close", style: "cancel" },
                        match.status === "Live" ? 
                          { text: "Watch Live", onPress: () => Alert.alert("Live Match", "Opening live match view...") } :
                        match.status === "Upcoming" ?
                          { text: "Set Reminder", onPress: () => Alert.alert("Reminder Set", "You'll be notified before the match starts!") } :
                          { text: "View Scorecard", onPress: () => Alert.alert("Scorecard", "Opening detailed scorecard...") }
                      ]
                    );
                  }}
                >
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
                            color="#B91C1C"
                          />
                        </View>
                        <Text style={styles.matchType}>{match.type}</Text>
                      </View>
                      <LinearGradient
                        colors={
                          match.status === "Live"
                            ? ["#EF4444", "#DC2626"]
                            : match.status === "Upcoming"
                            ? ["#F59E0B", "#D97706"]
                            : match.status === "Completed"
                            ? ["#10B981", "#059669"]
                            : ["#B91C1C", "#991B1B"]
                        }
                        style={styles.statusBadge}
                      >
                        {match.status === "Live" && (
                          <View style={styles.liveIndicator} />
                        )}
                        <Text style={styles.statusText}>{match.status}</Text>
                      </LinearGradient>
                    </View>

                    <View style={styles.matchBody}>
                      <View style={styles.teamSection}>
                        <LinearGradient
                          colors={["#B91C1C", "#991B1B"]}
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
                                color="#B91C1C"
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
                              color="#B91C1C"
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
                              color="#B91C1C"
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
                            "rgba(185, 28, 28, 0.1)",
                            "rgba(185, 28, 28, 0.05)",
                          ]}
                          style={styles.footerButtonGradient}
                        >
                          <Ionicons
                            name="stats-chart-outline"
                            size={14}
                            color="#B91C1C"
                          />
                          <Text style={styles.footerButtonText}>Insights</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <View style={styles.footerDivider} />
                      <TouchableOpacity style={styles.footerButton}>
                        <LinearGradient
                          colors={[
                            "rgba(185, 28, 28, 0.1)",
                            "rgba(185, 28, 28, 0.05)",
                          ]}
                          style={styles.footerButtonGradient}
                        >
                          <Ionicons
                            name="people-outline"
                            size={14}
                            color="#B91C1C"
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
                    colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
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
                          colors={["#B91C1C", "#991B1B"]}
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
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedTournament(tournament);
                      setActiveTournamentDetailTab("matches");
                      setCurrentView("tournamentDetail");
                    }}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FCA5A5", "#DC2626"]}
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
                              ? ["#B91C1C", "#991B1B"]
                              : ["#DC2626", "#991B1B"]
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
                                    ? "#B91C1C"
                                    : tournament.progress > 40
                                    ? "#DC2626"
                                    : "#B91C1C",
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
                            <Ionicons name="people" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity 
                          style={[styles.tournamentButton, { flex: 1 }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            setSelectedTournament(tournament);
                            setShowTournamentSettings(true);
                          }}
                        >
                          <LinearGradient
                            colors={["#B91C1C", "#991B1B"]}
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
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedTournament(tournament);
                      setActiveTournamentDetailTab("matches");
                      setCurrentView("tournamentDetail");
                    }}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FCA5A5", "#DC2626"]}
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
                          colors={["#B91C1C", "#991B1B"]}
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
                                backgroundColor: "#B91C1C",
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
                            <Ionicons name="people" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity 
                          style={[styles.tournamentButton, { flex: 1 }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            setSelectedTournament(tournament);
                            setShowTournamentSettings(true);
                          }}
                        >
                          <LinearGradient
                            colors={["#B91C1C", "#991B1B"]}
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
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedTournament(tournament);
                      setActiveTournamentDetailTab("matches");
                      setCurrentView("tournamentDetail");
                    }}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FCA5A5", "#DC2626"]}
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
                              ? ["#B91C1C", "#991B1B"]
                              : ["#DC2626", "#991B1B"]
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
                                    ? "#B91C1C"
                                    : tournament.progress > 40
                                    ? "#DC2626"
                                    : "#B91C1C",
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
                            <Ionicons name="people" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity 
                          style={[styles.tournamentButton, { flex: 1 }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            Alert.alert(
                              "Join Tournament",
                              `Would you like to join ${tournament.name}?`,
                              [
                                { text: "Cancel", style: "cancel" },
                                { text: "Join", onPress: () => console.log("Joined tournament") }
                              ]
                            );
                          }}
                        >
                          <LinearGradient
                            colors={["#B91C1C", "#991B1B"]}
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
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedTournament(tournament);
                      setActiveTournamentDetailTab("matches");
                      setCurrentView("tournamentDetail");
                    }}
                  >
                    <LinearGradient
                      colors={["#FFF", "#F8F8F8"]}
                      style={styles.tournamentCardGradient}
                    >
                      <View style={styles.tournamentHeader}>
                        <View style={styles.tournamentHeaderLeft}>
                          <LinearGradient
                            colors={["#FCA5A5", "#DC2626"]}
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
                              ? ["#B91C1C", "#991B1B"]
                              : tournament.status === "Completed"
                              ? ["#B91C1C", "#991B1B"]
                              : ["#DC2626", "#991B1B"]
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
                                    ? "#B91C1C"
                                    : tournament.progress > 40
                                    ? "#DC2626"
                                    : tournament.progress === 100
                                    ? "#B91C1C"
                                    : "#B91C1C",
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
                            <Ionicons name="people" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.teams} Teams
                          </Text>
                        </View>
                        <View style={styles.tournamentStat}>
                          <View style={styles.statIcon}>
                            <Ionicons name="baseball" size={12} color="#B91C1C" />
                          </View>
                          <Text style={styles.tournamentStatText}>
                            {tournament.matches} Matches
                          </Text>
                        </View>
                      </View>

                      <View style={styles.tournamentFooter}>
                        <TouchableOpacity 
                          style={[styles.tournamentButton, { flex: 1 }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            Alert.alert(
                              "Share Tournament",
                              `Share ${tournament.name} with others`,
                              [
                                { text: "Cancel", style: "cancel" },
                                { text: "Share", onPress: () => console.log("Shared tournament") }
                              ]
                            );
                          }}
                        >
                          <LinearGradient
                            colors={["#B91C1C", "#991B1B"]}
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
              <ScrollView 
                style={styles.teamsContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.teamsTitle}>My Teams</Text>
                <Text style={styles.teamsSubtitle}>Create or select teams for your matches</Text>
                
                {/* Team Options */}
                <View style={styles.teamOptionsContainer}>
                  
                  {/* Select Team Option */}
                  <TouchableOpacity
                    style={styles.teamOption}
                    onPress={() => {
                      console.log("Select Team pressed - navigating to team selection");
                      setCurrentView("teamsSelection");
                    }}
                  >
                    <LinearGradient
                      colors={["#059669", "#047857"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.teamOptionGradient}
                    >
                      <View style={styles.teamOptionIconContainer}>
                        <Ionicons name="people" size={32} color="#FFF" />
                      </View>
                      <View style={styles.teamOptionContent}>
                        <Text style={styles.teamOptionTitle}>Select Team</Text>
                        <Text style={styles.teamOptionDescription}>
                          Choose from existing teams
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Create Team Option */}
                  <TouchableOpacity
                    style={styles.teamOption}
                    onPress={() => {
                      console.log("Create Team pressed");
                      setCurrentView("createTeam");
                      setTeamSlot(null); // Clear team slot since this is not from team selection flow
                    }}
                  >
                    <LinearGradient
                      colors={["#B91C1C", "#991B1B"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.teamOptionGradient}
                    >
                      <View style={styles.teamOptionIconContainer}>
                        <Ionicons name="add-circle" size={32} color="#FFF" />
                      </View>
                      <View style={styles.teamOptionContent}>
                        <Text style={styles.teamOptionTitle}>Create Team</Text>
                        <Text style={styles.teamOptionDescription}>
                          Build a new team from scratch
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={24} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>

                </View>

                {/* Recent Teams Section */}
                <View style={styles.recentTeamsSection}>
                  <Text style={styles.recentTeamsTitle}>Recent Teams</Text>
                  
                  {/* Sample Recent Teams */}
                  {[
                    { name: "Mumbai Warriors", players: 15, lastUsed: "2 days ago", color: "#B91C1C" },
                    { name: "Delhi Capitals", players: 12, lastUsed: "1 week ago", color: "#059669" },
                    { name: "Chennai Kings", players: 18, lastUsed: "2 weeks ago", color: "#DC2626" }
                  ].map((team, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentTeamCard}
                      onPress={() => {
                        Alert.alert(
                          team.name,
                          `Players: ${team.players}\nLast Used: ${team.lastUsed}\n\nWhat would you like to do?`,
                          [
                            { text: "View Details", onPress: () => Alert.alert("Team Details", `Showing details for ${team.name}`) },
                            { text: "Edit Team", onPress: () => Alert.alert("Edit Team", `Editing ${team.name}`) },
                            { text: "Cancel", style: "cancel" }
                          ]
                        );
                      }}
                    >
                      <View style={[styles.recentTeamIcon, { backgroundColor: team.color }]}>
                        <Text style={styles.recentTeamInitial}>{team.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.recentTeamInfo}>
                        <Text style={styles.recentTeamName}>{team.name}</Text>
                        <Text style={styles.recentTeamMeta}>{team.players} players • {team.lastUsed}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#999" />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Bottom spacing for scroll */}
                <View style={{ height: 100 }} />
              </ScrollView>
            )}
          </>
        )}
      </ScrollView>

      {/* ───── Tournament Settings Bottom Sheet Modal ───── */}
      <Modal
        visible={showTournamentSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTournamentSettings(false)}
      >
        <TouchableOpacity
          style={styles.tsOverlay}
          activeOpacity={1}
          onPress={() => setShowTournamentSettings(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.tsSheet}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <View style={styles.tsDragHandle} />

            {/* Sheet title */}
            <View style={styles.tsHeader}>
              <Text style={styles.tsTitle}>Tournament Settings</Text>
              <TouchableOpacity onPress={() => setShowTournamentSettings(false)}>
                <Ionicons name="close-circle" size={26} color="#CCC" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { label: "Add Teams",                          icon: "people-outline",           danger: false, badge: null },
                { label: "Rounds (League Matches, Final, etc.)", icon: "git-branch-outline",     danger: false, badge: null },
                { label: "Groups (Group A, Group B, etc.)",    icon: "grid-outline",             danger: false, badge: null },
                { label: "Start A Match",                      icon: "baseball-outline",         danger: false, badge: null },
                { label: "Schedule Matches",                   icon: "calendar-outline",         danger: false, badge: null },
                { label: "Delete Schedule",                    icon: "trash-bin-outline",        danger: false, badge: null },
                { label: "Add/Remove Scorers (Admins)",        icon: "person-add-outline",       danger: false, badge: null },
                { label: "Tournament Officials",               icon: "shield-checkmark-outline", danger: false, badge: null },
                { label: "Add Live Streamer",                  icon: "videocam-outline",         danger: false, badge: null },
                { label: "Tournament Awards",                  icon: "ribbon-outline",           danger: false, badge: null },
                { label: "Tournament Settings",                icon: "settings-outline",         danger: false, badge: "NEW" },
                { label: "Premium Features",                   icon: "star-outline",             danger: false, badge: null },
                { label: "Find Scorers / Umpires",             icon: "search-outline",           danger: false, badge: null },
                { label: "Smart NRR Calculator",               icon: "calculator-outline",       danger: false, badge: null },
                { label: "Edit/Delete Tournament",             icon: "create-outline",           danger: true,  badge: null },
              ].map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.tsMenuItem,
                    item.danger && styles.tsMenuItemDanger,
                  ]}
                  onPress={() => {
                    setShowTournamentSettings(false);
                    setTimeout(() => {
                      if (item.label === "Edit/Delete Tournament") {
                        Alert.alert(
                          "Edit / Delete Tournament",
                          "What would you like to do?",
                          [
                            { text: "Edit Tournament", onPress: () => {} },
                            { text: "Delete Tournament", style: "destructive", onPress: () => {} },
                            { text: "Cancel", style: "cancel" },
                          ]
                        );
                      } else {
                        Alert.alert(item.label, `Opening ${item.label}…`);
                      }
                    }, 300);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.tsMenuIcon, item.danger && { backgroundColor: "#FEE2E2" }]}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.danger ? "#DC2626" : "#555"}
                    />
                  </View>
                  <Text style={[styles.tsMenuLabel, item.danger && styles.tsMenuLabelDanger]}>
                    {item.label}
                  </Text>
                  <View style={styles.tsMenuRight}>
                    {item.badge === "NEW" && (
                      <View style={styles.tsNewBadge}>
                        <Text style={styles.tsNewBadgeText}>NEW</Text>
                      </View>
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={item.danger ? "#DC2626" : "#CCC"}
                    />
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 24 }} />
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.searchModalContainer}>
          <View style={styles.searchModalHeader}>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.searchModalTitle}>Search</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tournaments, matches..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResults({ tournaments: [], matches: [] });
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
            {searchQuery.length === 0 ? (
              <>
                <Text style={styles.searchResultsTitle}>Recent Searches</Text>
                <TouchableOpacity style={styles.searchResultItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.searchResultText}>Mumbai Premier League</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchResultItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.searchResultText}>T20 Match</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchResultItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.searchResultText}>Wankhede Stadium</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Tournament Results */}
                {searchResults.tournaments.length > 0 && (
                  <>
                    <Text style={styles.searchResultsTitle}>
                      Tournaments ({searchResults.tournaments.length})
                    </Text>
                    {searchResults.tournaments.map((tournament: any) => (
                      <TouchableOpacity
                        key={tournament.id}
                        style={styles.tournamentCard}
                        activeOpacity={0.85}
                        onPress={() => {
                          setSelectedTournament(tournament);
                          setActiveTournamentDetailTab("matches");
                          setCurrentView("tournamentDetail");
                          setShowSearchModal(false);
                        }}
                      >
                        <LinearGradient
                          colors={["#FFF", "#F8F8F8"]}
                          style={styles.tournamentCardGradient}
                        >
                          <View style={styles.tournamentHeader}>
                            <View style={styles.tournamentHeaderLeft}>
                              <LinearGradient
                                colors={["#FCA5A5", "#DC2626"]}
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
                                  ? ["#B91C1C", "#991B1B"]
                                  : ["#DC2626", "#991B1B"]
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
                                        ? "#B91C1C"
                                        : tournament.progress > 40
                                        ? "#DC2626"
                                        : "#B91C1C",
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
                                <Ionicons name="people" size={12} color="#B91C1C" />
                              </View>
                              <Text style={styles.tournamentStatText}>
                                {tournament.teams} Teams
                              </Text>
                            </View>
                            <View style={styles.tournamentStat}>
                              <View style={styles.statIcon}>
                                <Ionicons name="baseball" size={12} color="#B91C1C" />
                              </View>
                              <Text style={styles.tournamentStatText}>
                                {tournament.matches} Matches
                              </Text>
                            </View>
                          </View>

                          <View style={styles.tournamentFooter}>
                            <TouchableOpacity 
                              style={[styles.tournamentButton, { flex: 1 }]}
                              onPress={(e) => {
                                e.stopPropagation();
                                setSelectedTournament(tournament);
                                setActiveTournamentDetailTab("matches");
                                setCurrentView("tournamentDetail");
                                setShowSearchModal(false);
                              }}
                            >
                              <LinearGradient
                                colors={["#B91C1C", "#991B1B"]}
                                style={styles.tournamentButtonGradient}
                              >
                                <Ionicons name="eye-outline" size={13} color="#FFF" />
                                <Text style={styles.tournamentButtonText}>View Details</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Match Results */}
                {searchResults.matches.length > 0 && (
                  <>
                    <Text style={[styles.searchResultsTitle, { marginTop: searchResults.tournaments.length > 0 ? 20 : 0 }]}>
                      Matches ({searchResults.matches.length})
                    </Text>
                    {searchResults.matches.map((match: any) => (
                      <TouchableOpacity
                        key={match.id}
                        style={styles.searchMatchItem}
                        onPress={() => {
                          console.log(`Viewing match: ${match.team}`);
                          setShowSearchModal(false);
                        }}
                      >
                        <LinearGradient
                          colors={["#FFF", "#F8F8F8"]}
                          style={styles.searchMatchGradient}
                        >
                          <View style={styles.searchMatchHeader}>
                            <View style={[
                              styles.searchMatchStatus,
                              { backgroundColor: match.status === "Live" ? "#B91C1C" : match.status === "Upcoming" ? "#DC2626" : "#666" }
                            ]}>
                              <Text style={styles.searchMatchStatusText}>
                                {match.status}
                              </Text>
                            </View>
                            <Text style={styles.searchMatchType}>{match.type}</Text>
                          </View>
                          <Text style={styles.searchMatchTeam} numberOfLines={1}>
                            {match.team}
                          </Text>
                          <View style={styles.searchMatchMeta}>
                            <View style={styles.searchMatchMetaItem}>
                              <Ionicons name="calendar-outline" size={12} color="#999" />
                              <Text style={styles.searchMatchMetaText}>{match.date} • {match.time}</Text>
                            </View>
                            <View style={styles.searchMatchMetaItem}>
                              <Ionicons name="location-outline" size={12} color="#999" />
                              <Text style={styles.searchMatchMetaText} numberOfLines={1}>{match.location}</Text>
                            </View>
                            <View style={styles.searchMatchMetaItem}>
                              <Ionicons name="baseball-outline" size={12} color="#999" />
                              <Text style={styles.searchMatchMetaText}>{match.format} • {match.overs}</Text>
                            </View>
                          </View>
                          {match.result && (
                            <Text style={styles.searchMatchResult}>{match.result}</Text>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* No Results */}
                {searchResults.tournaments.length === 0 && searchResults.matches.length === 0 && searchQuery.length > 0 && (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={48} color="#CCC" />
                    <Text style={styles.noResultsTitle}>No results found</Text>
                    <Text style={styles.noResultsText}>
                      Try searching for tournament names, match teams, or locations
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Player Selection Modal */}
      <Modal
        visible={showPlayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPlayerModal(false)}
      >
        <View style={styles.playerModalContainer}>
          <View style={styles.playerModalHeader}>
            <TouchableOpacity onPress={() => setShowPlayerModal(false)}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.playerModalTitle}>
              {playerModalType === "striker" && "Select Striker"}
              {playerModalType === "nonStriker" && "Select Non-striker"}
              {playerModalType === "bowler" && "Select Bowler"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
            {(playerModalType === "striker" || playerModalType === "nonStriker" ? battingTeamPlayers : bowlingTeamPlayers).map((player) => (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.playerItem,
                  (playerModalType === "striker" && selectedStriker?.id === player.id) ||
                  (playerModalType === "nonStriker" && selectedNonStriker?.id === player.id) ||
                  (playerModalType === "bowler" && selectedBowler?.id === player.id)
                    ? styles.playerItemSelected : null
                ]}
                onPress={() => {
                  // Validation: Don't allow same player for striker and non-striker
                  if (playerModalType === "striker" && selectedNonStriker?.id === player.id) {
                    Alert.alert("Invalid Selection", "This player is already selected as Non-striker. Please choose a different player.");
                    return;
                  }
                  if (playerModalType === "nonStriker" && selectedStriker?.id === player.id) {
                    Alert.alert("Invalid Selection", "This player is already selected as Striker. Please choose a different player.");
                    return;
                  }

                  if (playerModalType === "striker") {
                    setSelectedStriker(player);
                  } else if (playerModalType === "nonStriker") {
                    setSelectedNonStriker(player);
                  } else if (playerModalType === "bowler") {
                    setSelectedBowler(player);
                  }
                  setShowPlayerModal(false);
                }}
              >
                <View style={styles.playerItemContent}>
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>
                      {player.name.split(' ').map((n: string) => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{player.name}</Text>
                    <Text style={styles.playerRole}>{player.role}</Text>
                  </View>
                  {((playerModalType === "striker" && selectedStriker?.id === player.id) ||
                    (playerModalType === "nonStriker" && selectedNonStriker?.id === player.id) ||
                    (playerModalType === "bowler" && selectedBowler?.id === player.id)) && (
                    <Ionicons name="checkmark-circle" size={24} color="#B91C1C" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
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
    backgroundColor: "#FCA5A5",
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
    borderBottomColor: "#B91C1C",
  },
  tabText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#B91C1C",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    color: "#B91C1C",
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
    backgroundColor: "rgba(185, 28, 28, 0.1)",
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
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFF",
    marginRight: 4,
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
    shadowColor: "#B91C1C",
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
    color: "#B91C1C",
    fontWeight: "700",
  },
  matchDetailsOld: {
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
    backgroundColor: "rgba(185, 28, 28, 0.1)",
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
    color: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    borderBottomColor: "#B91C1C",
  },
  dashboardTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  dashboardTabTextActive: {
    color: "#B91C1C",
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
    backgroundColor: "#B91C1C",
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
    backgroundColor: "rgba(185, 28, 28, 0.1)",
    borderRadius: 6,
    paddingVertical: 4,
    fontWeight: "700",
    color: "#B91C1C",
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
    backgroundColor: "#FCA5A5",
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
    color: "#B91C1C",
  },
  leaderboardRunsLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
  },
  leaderboardSubStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  leaderboardSubStat: {
    fontSize: 10,
    color: "#666",
    fontWeight: "500",
  },
  addMatchButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  addMatchButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  addMatchButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  matchItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matchStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  matchDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  matchTeamContainer: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  matchTeamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  matchTeamIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
  },
  matchVsContainer: {
    paddingHorizontal: 12,
  },
  matchDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  matchResultContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 8,
  },
  matchResultText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  pointsTableRowQualified: {
    backgroundColor: "rgba(76, 175, 80, 0.05)",
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  teamIconSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  teamIconSmallText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  pointsLegend: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  legendLabel: {
    fontSize: 11,
    color: "#999",
    fontWeight: "500",
  },
  mvpBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  mvpBadgeText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
  },
  // New Tournament Dashboard Styles
  tournamentDashboardContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  tournamentDashboardHeader: {
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  tournamentTrophyContainer: {
    marginBottom: 16,
  },
  tournamentTrophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 215, 0, 0.5)",
  },
  tournamentDashboardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 12,
  },
  tournamentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  tournamentStatusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  tournamentStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  tournamentStatItem: {
    alignItems: "center",
    gap: 4,
  },
  tournamentStatNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  tournamentStatLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.9)",
  },
  tournamentProgressContainer: {
    width: "100%",
    alignItems: "flex-end",
  },
  tournamentProgressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 6,
  },
  tournamentProgressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 3,
  },
  tournamentProgressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
  },
  tournamentTabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tournamentTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  tournamentTabActive: {
    // Active tab styling
  },
  tournamentTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  tournamentTabTextActive: {
    color: "#E63946",
    fontWeight: "700",
  },
  tournamentTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#E63946",
  },
  tournamentTabContent: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  tournamentSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  tournamentMatchCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tournamentMatchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  upcomingBadge: {
    backgroundColor: "#FFA500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
  },
  tournamentMatchTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  tournamentMatchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tournamentTeamSection: {
    alignItems: "center",
    flex: 1,
  },
  tournamentTeamCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  tournamentTeamInitial: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
  },
  tournamentTeamName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  tournamentVsContainer: {
    paddingHorizontal: 16,
  },
  tournamentVsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#999",
  },
  tournamentMatchMenu: {
    position: "absolute",
    right: 0,
    top: 0,
    padding: 8,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
  },
  tournamentMatchVenue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tournamentMatchVenueText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  teamCardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#B91C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(185, 28, 28, 0.1)",
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
    shadowColor: "#B91C1C",
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
    backgroundColor: "#B91C1C",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    borderColor: "rgba(185, 28, 28, 0.1)",
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
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    borderColor: "rgba(185, 28, 28, 0.3)",
  },
  matchTypePillActive: {
    borderColor: "#B91C1C",
    backgroundColor: "#B91C1C",
    shadowColor: "#B91C1C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  matchTypePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B91C1C",
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
    borderColor: "#B91C1C",
    backgroundColor: "rgba(185, 28, 28, 0.05)",
  },
  matchTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    textAlign: "center",
  },
  matchTypeTextActive: {
    color: "#B91C1C",
  },
  locationButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#B91C1C",
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
    color: "#B91C1C",
  },
  groundsCountBadge: {
    backgroundColor: "rgba(185, 28, 28, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groundsCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B91C1C",
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
    shadowColor: "#B91C1C",
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
    backgroundColor: "#B91C1C",
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
    color: "#B91C1C",
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
    shadowColor: "#991B1B",
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
    borderColor: "rgba(185, 28, 28, 0.3)",
  },
  pitchTypePillActive: {
    borderColor: "#991B1B",
    backgroundColor: "#991B1B",
    shadowColor: "#991B1B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pitchTypePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#991B1B",
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
    borderColor: "#B91C1C",
    backgroundColor: "rgba(185, 28, 28, 0.1)",
  },
  pitchTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  pitchTypeTextActive: {
    color: "#B91C1C",
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
    borderColor: "#B91C1C",
    backgroundColor: "#B91C1C",
  },
  ballTypeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
  },
  ballTypeTextActive: {
    color: "#B91C1C",
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
    backgroundColor: "#B91C1C",
  },
  startMatchButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#B91C1C",
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
    backgroundColor: "#B91C1C",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
    borderWidth: 1.5,
    borderColor: "rgba(185, 28, 28, 0.3)",
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
    backgroundColor: "rgba(185, 28, 28, 0.1)",
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  teamsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  teamsSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 22,
  },
  teamOptionsContainer: {
    gap: 16,
    marginBottom: 30,
  },
  teamOption: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  teamOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  teamOptionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  teamOptionContent: {
    flex: 1,
  },
  teamOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  teamOptionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },
  recentTeamsSection: {
    marginTop: 10,
  },
  recentTeamsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  recentTeamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentTeamIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentTeamInitial: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  recentTeamInfo: {
    flex: 1,
  },
  recentTeamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  recentTeamMeta: {
    fontSize: 12,
    color: "#666",
  },
  // Teams Selection View Styles
  teamsSelectionContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  teamsSelectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  teamsSelectionSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  teamsSelectionContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  teamsSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  teamSelectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamSelectionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  teamSelectionInitial: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  teamSelectionInfo: {
    flex: 1,
  },
  teamSelectionName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  teamSelectionStats: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  teamSelectionAction: {
    paddingLeft: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  // Team Management Styles (Teams tab in tournament detail)
  teamMgmtLanguageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    marginBottom: 20,
  },
  teamMgmtLanguageLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  teamMgmtLanguageDropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  teamMgmtLanguageText: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  teamMgmtVideoContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  teamMgmtVideoPlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  teamMgmtDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
    lineHeight: 20,
  },
  teamMgmtButtonsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  teamMgmtInviteButton: {
    flex: 1,
    backgroundColor: "#20B2AA",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  teamMgmtInviteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  teamMgmtAddButton: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#20B2AA",
  },
  teamMgmtAddButtonText: {
    color: "#20B2AA",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // Simple Team Management Styles (Simplified Teams tab)
  simpleTeamMgmtContainer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 20,
  },
  simpleTeamMgmtButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  simpleTeamMgmtButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
  },
  simpleTeamMgmtButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  // Add Teams & Players View Styles
  addTeamsPlayersContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  addTeamsPlayersTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  addTeamsPlayersSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  addTeamsPlayersContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  addTeamsOption: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addTeamsOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  addTeamsOptionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  addTeamsOptionTextContainer: {
    flex: 1,
  },
  addTeamsOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  addTeamsOptionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
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
    backgroundColor: "#B91C1C",
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
  dateInputActive: {
    borderBottomColor: "#B91C1C",
  },
  dateInputText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  calendarCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F3D1D1",
    borderRadius: 12,
    padding: 12,
    marginTop: -8,
    marginBottom: 20,
    shadowColor: "#B91C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },
  calendarWeekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  calendarWeekText: {
    width: "14.285%",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarDayPlaceholder: {
    width: "14.285%",
    aspectRatio: 1,
  },
  calendarDay: {
    width: "14.285%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: "#B91C1C",
  },
  calendarDayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  calendarDayTextSelected: {
    color: "#FFF",
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
    gap: 20,
    justifyContent: "flex-start",
    flexWrap: "wrap",
  },
  ballTypeOption: {
    alignItems: "center",
    gap: 10,
    minWidth: 72,
  },
  ballTypeCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 5,
  },
  ballTypeCircleLargeSelected: {
    borderWidth: 3,
    borderColor: "#FFF",
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  ballTypeOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    padding: 4,
  },
  ballSeamH: {
    position: "absolute",
    width: "80%",
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: "dotted",
    borderColor: "rgba(0,0,0,0.25)",
    top: "48%",
  },
  ballSeamV: {
    position: "absolute",
    width: 0,
    height: "80%",
    borderLeftWidth: 1.5,
    borderStyle: "dotted",
    borderColor: "rgba(0,0,0,0.25)",
    left: "48%",
  },
  ballCheckOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 32,
  },
  ballTypeLabel: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  ballTypeLabelSelected: {
    color: "#B91C1C",
    fontWeight: "800",
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
    backgroundColor: "#B91C1C",
    borderColor: "#B91C1C",
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
    shadowColor: "#B91C1C",
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

  // ── Tournament Detail (td*) styles ──────────────────────────────
  tdContainer: {
    flex: 1,
  },
  tdHero: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 16,
    overflow: "hidden",
    position: "relative",
  },
  tdHeroCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -60,
  },
  tdHeroCircle2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: -30,
    left: -20,
  },
  tdHeroContent: {
    alignItems: "center",
  },
  tdHeroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.4)",
  },
  tdHeroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  tdStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
  },
  tdStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tdStatusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  tdHeroStats: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 16,
  },
  tdHeroStat: {
    alignItems: "center",
    gap: 3,
  },
  tdHeroStatValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
  },
  tdHeroStatLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  tdProgressWrap: {
    width: "100%",
    gap: 6,
  },
  tdProgressBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  tdProgressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 3,
  },
  tdProgressLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    textAlign: "right",
  },
  tdTabs: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },
  tdTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  tdTabActive: {},
  tdTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
  },
  tdTabTextActive: {
    color: "#B91C1C",
    fontWeight: "800",
  },
  tdTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 3,
    backgroundColor: "#B91C1C",
    borderRadius: 2,
  },
  tdContent: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  tdSection: {
    padding: 14,
  },
  tdSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  tdMatchCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },
  tdMatchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tdMatchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tdMatchBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  tdMatchDate: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
  },
  tdMatchTeams: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tdTeamCol: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  tdTeamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tdTeamAvatarText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
  },
  tdTeamName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
  },
  tdScore: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  tdVsBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F3F3",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  tdVs: {
    fontSize: 11,
    fontWeight: "900",
    color: "#B91C1C",
  },
  tdMatchFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tdMatchVenue: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  // Points table
  tdPtsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  tdPtsHeaderCell: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.3,
  },
  tdPtsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
    backgroundColor: "#FFF",
  },
  tdPtsRowQ: {
    borderLeftWidth: 3,
    borderLeftColor: "#4CAF50",
  },
  tdPtsCell: {
    flex: 1,
    fontSize: 12,
    color: "#333",
    fontWeight: "600",
  },
  tdRankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
  },
  tdRankText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#666",
  },
  tdTeamDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  tdTeamDotText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
  },
  tdTeamLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  tdLegend: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    gap: 6,
  },
  tdLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tdLegendText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
  },
  tdLegendNote: {
    fontSize: 10,
    color: "#999",
    fontWeight: "500",
  },
  // Player cards
  tdPlayerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  tdPlayerIcon: {
    fontSize: 24,
  },
  tdPlayerInfo: {
    flex: 1,
  },
  tdPlayerName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  tdPlayerTeam: {
    fontSize: 11,
    color: "#888",
    fontWeight: "500",
    marginTop: 2,
  },
  tdPlayerStats: {
    alignItems: "flex-end",
  },
  tdPlayerStatMain: {
    fontSize: 20,
    fontWeight: "900",
    color: "#B91C1C",
  },
  tdPlayerStatSub: {
    fontSize: 10,
    color: "#888",
    fontWeight: "500",
  },
  tdPlayerMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  tdPlayerMetaText: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
  // Team cards
  tdTeamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    gap: 14,
  },
  tdTeamCardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  tdTeamCardAvatarText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFF",
  },
  tdTeamCardInfo: {
    flex: 1,
  },
  tdTeamCardName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
    marginBottom: 2,
  },
  tdTeamCardCaptain: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
    marginBottom: 6,
  },
  tdTeamCardMeta: {
    flexDirection: "row",
    gap: 10,
  },
  tdTeamMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tdTeamMetaText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "600",
  },
  // Bottom bar
  tdBottomBar: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EFEFEF",
    padding: 12,
    paddingBottom: 20,
  },
  tdBottomBtn: {
    borderRadius: 12,
    overflow: "hidden",
  },
  tdBottomBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    gap: 10,
  },
  tdBottomBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.3,
  },

  // ── Settings icon button in hero ────────────────────────────────
  tdSettingsBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: 10,
  },

  // ── Tournament Settings bottom sheet (ts*) ──────────────────────
  tsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  tsSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 0,
    paddingTop: 10,
    maxHeight: "85%",
  },
  tsDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#DDD",
    alignSelf: "center",
    marginBottom: 12,
  },
  tsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 4,
  },
  tsTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#333",
  },
  tsMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 14,
  },
  tsMenuItemDanger: {
    borderBottomColor: "#FEF2F2",
  },
  tsMenuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  tsMenuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
  },
  tsMenuLabelDanger: {
    color: "#DC2626",
    fontWeight: "600",
  },
  tsMenuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tsNewBadge: {
    backgroundColor: "#DC2626",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tsNewBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  // Search Modal Styles
  searchModalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 8,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  searchResultText: {
    fontSize: 16,
    color: "#666",
  },
  // Match Search Results
  searchMatchItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchMatchGradient: {
    padding: 16,
  },
  searchMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  searchMatchStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  searchMatchStatusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  searchMatchType: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  searchMatchTeam: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  searchMatchMeta: {
    gap: 4,
  },
  searchMatchMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  searchMatchMetaText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  searchMatchResult: {
    fontSize: 12,
    color: "#B91C1C",
    fontWeight: "600",
    marginTop: 8,
  },
  // No Results
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  // Toss Page Styles
  tossContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  tossTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  tossTeamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    gap: 16,
  },
  tossTeamCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tossTeamCardSelected: {
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  tossTeamIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tossTeamInitial: {
    fontSize: 32,
    fontWeight: "700",
  },
  tossTeamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  tossTeamNameSelected: {
    color: "#B91C1C",
  },
  tossDecisionSection: {
    marginBottom: 40,
  },
  tossDecisionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  tossDecisionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  tossDecisionCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tossDecisionCardSelected: {
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  tossDecisionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  tossDecisionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
  },
  tossDecisionTextSelected: {
    color: "#B91C1C",
  },
  // Player Selection Page Styles
  playerSelectionContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  playerSection: {
    marginBottom: 30,
  },
  playerSectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
  },
  playerSelectionRow: {
    flexDirection: "row",
    gap: 16,
  },
  playerSelectionCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerSelectionCardSelected: {
    borderColor: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  bowlerCard: {
    maxWidth: "48%",
  },
  playerIconContainer: {
    marginBottom: 12,
  },
  playerSelectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  selectedPlayerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#B91C1C",
    textAlign: "center",
  },
  playerActionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  matchSettingsButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  matchSettingsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  matchSettingsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  startScoringButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  startScoringButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  startScoringButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  // Match Settings Page Styles
  matchSettingsContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  matchSettingsTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
  },
  settingsSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5E5E5",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#4CAF50",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  settingNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ruleHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ruleLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#B91C1C",
    marginRight: 12,
    width: 20,
  },
  ruleText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  runsCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  counterButton: {
    padding: 4,
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    minWidth: 30,
    textAlign: "center",
  },
  ignoreRulesContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  ignoreRulesLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  ignoreRulesOptions: {
    flexDirection: "row",
    gap: 12,
  },
  ignoreRuleOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  ignoreRuleOptionActive: {
    backgroundColor: "#B91C1C",
    borderColor: "#B91C1C",
  },
  ignoreRuleOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  ignoreRuleOptionTextActive: {
    color: "#FFF",
  },
  saveSettingsButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 20,
  },
  saveSettingsButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  saveSettingsButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
  // Player Selection Modal Styles
  playerModalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  playerModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  playerModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  playersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playerItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playerItemSelected: {
    backgroundColor: "#FEF2F2",
    borderWidth: 2,
    borderColor: "#B91C1C",
  },
  playerItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#B91C1C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playerAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  playerRole: {
    fontSize: 14,
    color: "#666",
  },
  // Cricket Scoring Page Styles
  scoringContainer: {
    flex: 1,
    backgroundColor: "#2C3E50",
  },
  scoringHeader: {
    backgroundColor: "#34495E",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  matchHeaderText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    opacity: 0.9,
  },
  batsmenSection: {
    flexDirection: "row",
    backgroundColor: "#34495E",
    borderBottomWidth: 1,
    borderBottomColor: "#2C3E50",
  },
  batsmanCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: "#2C3E50",
  },
  batsmanIcon: {
    marginRight: 8,
  },
  batsmanName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    flex: 1,
  },
  batsmanScore: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  bowlerSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34495E",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2C3E50",
  },
  bowlerIcon: {
    marginRight: 8,
  },
  bowlerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    flex: 1,
  },
  bowlerStats: {
    marginRight: 8,
  },
  bowlerFigures: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  wicketTypeSection: {
    flexDirection: "row",
    backgroundColor: "#34495E",
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  wicketTypeButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#4A5F7A",
    marginHorizontal: 4,
  },
  wicketTypeButtonActive: {
    borderColor: "#4CAF50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  wicketIcon: {
    marginBottom: 8,
  },
  wicketTypeText: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
    fontWeight: "500",
  },
  scoringGrid: {
    flex: 1,
    backgroundColor: "#ECF0F1",
    padding: 1,
  },
  scoringRow: {
    flexDirection: "row",
    flex: 1,
  },
  scoreButton: {
    flex: 1,
    backgroundColor: "#FFF",
    margin: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  scoreButtonText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2C3E50",
  },
  scoreButtonSubText: {
    fontSize: 12,
    color: "#7F8C8D",
    marginTop: 2,
  },
  undoButton: {
    backgroundColor: "#3498DB",
  },
  undoButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
  outButton: {
    backgroundColor: "#E74C3C",
  },
  outButtonText: {
    color: "#FFF",
  },
});

