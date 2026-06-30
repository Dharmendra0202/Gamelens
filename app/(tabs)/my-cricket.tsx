import { AnimatedViewTransition } from "@/components/ui/animated-view-transition";
import { ChipGroup } from "@/components/ui/chip-group";
import { CitySearchDropdown } from "@/components/ui/city-search-dropdown";
import { FormTextInput } from "@/components/ui/form-text-input";
import { SquadSizePicker } from "@/components/ui/squad-size-picker";
import { TabScreenWrapper } from "@/components/ui/tab-screen-wrapper";
import { useSwipeableTabs } from "@/hooks/use-swipeable-tabs";
import { LocalStorage } from "@/services/storage";
import type { Match } from "@/types";
import { shareContent } from "@/utils/share";
import { Ionicons } from "@expo/vector-icons";

import { ComingSoonScreen } from "@/components/ComingSoonScreen";
import { SportSelectionScreen } from "@/components/SportSelectionScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Sport Selection Key ────────────────────────────────────────────────────────
const SPORT_STORAGE_KEY = "gamelens:selected_sport";

// Sport name mapping for display
const SPORT_NAMES: Record<string, string> = {
  box_cricket: "Box Cricket",
  badminton: "Badminton",
  pickleball: "Pickleball",
  padel: "Padel",
  cricket: "Cricket",
  tennis: "Tennis",
  football: "Football",
  basketball: "Basketball",
};

// Sports that are available (open existing screen)
const AVAILABLE_SPORTS = new Set(["cricket", "box_cricket"]);

export default function MyCricketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ─── Sport Gateway State ──────────────────────────────────────────────────────
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [sportLoaded, setSportLoaded] = useState(false);
  const [showSelection, setShowSelection] = useState(false);

  // Load saved sport preference on mount
  useEffect(() => {
    AsyncStorage.getItem(SPORT_STORAGE_KEY).then((saved) => {
      if (saved) {
        setSelectedSport(saved);
      } else {
        setShowSelection(true);
      }
      setSportLoaded(true);
    });
  }, []);

  // Handle sport selection
  const handleSportSelect = async (sportId: string) => {
    await AsyncStorage.setItem(SPORT_STORAGE_KEY, sportId);
    setSelectedSport(sportId);
    setShowSelection(false);
  };

  // Handle skip — default to cricket
  const handleSkip = async () => {
    await AsyncStorage.setItem(SPORT_STORAGE_KEY, "cricket");
    setSelectedSport("cricket");
    setShowSelection(false);
  };

  // Handle back from Coming Soon
  const handleBackToSelection = async () => {
    await AsyncStorage.removeItem(SPORT_STORAGE_KEY);
    setSelectedSport(null);
    setShowSelection(true);
  };

  // ─── Gate: Show Sport Selection or Coming Soon if needed ──────────────────────
  if (!sportLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#F5F5F5" }} />;
  }

  if (showSelection || !selectedSport) {
    return (
      <SportSelectionScreen onSelect={handleSportSelect} onSkip={handleSkip} />
    );
  }

  if (selectedSport && !AVAILABLE_SPORTS.has(selectedSport)) {
    return (
      <ComingSoonScreen
        sportName={SPORT_NAMES[selectedSport] ?? selectedSport}
        onBack={handleBackToSelection}
      />
    );
  }

  // ─── Existing Sports Screen (Cricket) ─────────────────────────────────────────
  return <MyCricketContent onChangeSport={handleBackToSelection} />;
}

// ─── Original Screen Content (extracted into a sub-component) ───────────────────
function MyCricketContent({ onChangeSport }: { onChangeSport: () => void }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  // useSwipeableTabs provides goToMainTab internally via useTabNavigator
  const {
    activeTab,
    scrollRef: horizontalScrollRef,
    scrollX,
    goToTab: handleTabPress,
    handleScroll,
    handleScrollEnd: handleHorizontalScrollEnd,
    handleScrollEndDrag: handleMainScrollEndDrag,
  } = useSwipeableTabs({
    tabs: ["matches", "tournaments", "teams"],
    prevMainTab: 1, // Looking
    nextMainTab: 3, // Community
  });
  // useTabNavigator not needed directly — hook handles edge swipe internally
  const [activeFilter, setActiveFilter] = useState("your");
  const [activeTournamentFilter, setActiveTournamentFilter] = useState("your");
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<"A" | "B" | null>(null);
  const [currentView, setCurrentView] = useState<
    | "matches"
    | "teamSelection"
    | "selectTeam"
    | "createTeam"
    | "matchSetup"
    | "tossPage"
    | "playerSelection"
    | "matchSettings"
    | "scoringPage"
    | "createTournament"
    | "tournamentTeamManagement"
    | "tournamentDashboard"
    | "tournamentDetail"
    | "addTeamsPlayers"
    | "teamsSelection"
    | "search"
  >("matches");
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [activeTournamentDetailTab, setActiveTournamentDetailTab] =
    useState("matches");
  const [showTournamentSettings, setShowTournamentSettings] = useState(false);
  const [teamSlot, setTeamSlot] = useState<"A" | "B" | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    tournaments: any[];
    matches: any[];
  }>({ tournaments: [], matches: [] });
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Team data
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [currentTeamName, setCurrentTeamName] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentMobile, setCurrentMobile] = useState("");
  const [currentCaptain, setCurrentCaptain] = useState("");
  const [currentPlayers, setCurrentPlayers] = useState("");

  // TODO(dev-only): Temporary manual player list for testing team creation flow.
  // Remove this entire block when backend player invites are implemented.
  const [manualPlayers, setManualPlayers] = useState<string[]>([]);
  const [manualPlayerName, setManualPlayerName] = useState("");
  const [showManualPlayerModal, setShowManualPlayerModal] = useState(false);

  // Match Setup data
  const [matchType, setMatchType] = useState<string>("");
  const [numberOfOvers, setNumberOfOvers] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedGround, setSelectedGround] = useState("");
  const [ballType, setBallType] = useState<string>("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [matchDuration, setMatchDuration] = useState("");
  const [matchDateObj, setMatchDateObj] = useState(new Date());
  const [matchTimeObj, setMatchTimeObj] = useState(new Date());
  const [durationObj, setDurationObj] = useState(new Date(0, 0, 0, 2, 0));
  const [showMatchDatePicker, setShowMatchDatePicker] = useState(false);
  const [showMatchTimePicker, setShowMatchTimePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [umpire1, setUmpire1] = useState("");
  const [locationMode, setLocationMode] = useState<"gps" | "manual" | null>(
    null,
  );
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [nearbyGrounds, setNearbyGrounds] = useState<
    Array<{
      id: number;
      name: string;
      distance: string;
      city: string;
      pitchType: string;
    }>
  >([]);
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
  const [activeTournamentDateField, setActiveTournamentDateField] = useState<
    "start" | "end" | null
  >(null);
  const [tournamentCalendarMonth, setTournamentCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [tournamentCategory, setTournamentCategory] = useState("");
  const [tournamentBallType, setTournamentBallType] = useState("");
  const [tournamentPitchType, setTournamentPitchType] = useState("");
  const [tournamentMatchType, setTournamentMatchType] = useState("");
  const [tournamentBannerUri, setTournamentBannerUri] = useState("");
  const [tournamentLogoUri, setTournamentLogoUri] = useState("");
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
  const [playerModalType, setPlayerModalType] = useState<
    "striker" | "nonStriker" | "bowler" | null
  >(null);

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
  const [bowlerOvers, setBowlerOvers] = useState("0.0-0-0-0");
  const [bowlerRuns, setBowlerRuns] = useState(0);
  const [bowlerWickets, setBowlerWickets] = useState(0);
  const [selectedWicketType, setSelectedWicketType] = useState<string | null>(
    null,
  );
  const [scoreHistory, setScoreHistory] = useState<
    {
      totalRuns: number;
      totalWickets: number;
      currentBall: number;
      currentOver: number;
      strikerRuns: number;
      strikerBalls: number;
      nonStrikerRuns: number;
      nonStrikerBalls: number;
      bowlerOvers: string;
      bowlerRuns: number;
      bowlerWickets: number;
      selectedStriker: any;
      selectedNonStriker: any;
    }[]
  >([]);

  const ballOptions = [
    {
      id: "tennis",
      label: "Tennis",
      color: "#C6F05B",
      seamColor: "#F7FBC8",
      shadowColor: "#7BAF1C",
    },
    {
      id: "leather",
      label: "Leather",
      color: "#B71C1C",
      seamColor: "#FFCDD2",
      shadowColor: "#8B0000",
    },
    {
      id: "other",
      label: "Other",
      color: "#F59E0B",
      seamColor: "#FFE8B8",
      shadowColor: "#B45309",
    },
  ];

  const pitchOptions = [
    {
      id: "rough",
      label: "Rough",
      baseColor: "#B8793B",
      laneColor: "#8A4B1F",
      stripeColor: "rgba(255, 255, 255, 0.18)",
    },
    {
      id: "cement",
      label: "Cement",
      baseColor: "#B8BEC3",
      laneColor: "#8F989F",
      stripeColor: "rgba(255, 255, 255, 0.24)",
    },
    {
      id: "turf",
      label: "Turf",
      baseColor: "#318C4B",
      laneColor: "#1F6D38",
      stripeColor: "rgba(255, 255, 255, 0.18)",
    },
    {
      id: "astroturf",
      label: "Astro",
      baseColor: "#188B72",
      laneColor: "#0E6C59",
      stripeColor: "rgba(255, 255, 255, 0.2)",
    },
    {
      id: "matting",
      label: "Matting",
      baseColor: "#9B5F34",
      laneColor: "#6F3D1D",
      stripeColor: "rgba(255, 255, 255, 0.22)",
    },
  ];

  // Squad rosters for the active match.
  // TODO(backend): load from match setup params / MatchService
  // Populated from manually added players (dev testing) until backend is connected
  const battingTeamPlayers: {
    id: number;
    name: string;
    role: string;
    isOut: boolean;
    image: string;
  }[] = manualPlayers.map((name, i) => ({
    id: i + 1,
    name,
    role: "Player",
    isOut: false,
    image: "",
  }));

  const bowlingTeamPlayers: {
    id: number;
    name: string;
    role: string;
    isOut: boolean;
    image: string;
  }[] = manualPlayers.map((name, i) => ({
    id: i + 100,
    name,
    role: "Player",
    isOut: false,
    image: "",
  }));

  // Reusable render functions
  const renderTextInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    required = false,
    keyboardType: any = "default",
  ) => (
    <FormTextInput
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      required={required}
      keyboardType={keyboardType}
    />
  );

  const renderChipGroup = (
    items: string[],
    selected: string,
    onSelect: (item: string) => void,
    activeColor: string,
  ) => (
    <ChipGroup
      items={items}
      selected={selected}
      onSelect={onSelect}
      activeColor={activeColor}
    />
  );

  const renderBallTypeSelector = (
    selected: string,
    onSelect: (ballId: string) => void,
  ) => (
    <View style={styles.ballTypeGrid}>
      {ballOptions.map((ball) => {
        const isSelected = selected === ball.id;

        return (
          <TouchableOpacity
            key={ball.id}
            style={[
              styles.realBallOption,
              isSelected && styles.realBallOptionSelected,
            ]}
            onPress={() => onSelect(ball.id)}
            activeOpacity={0.84}
          >
            <View
              style={[
                styles.realBall,
                {
                  backgroundColor: ball.color,
                  shadowColor: ball.shadowColor,
                },
              ]}
            >
              <View
                style={[
                  styles.realBallHighlight,
                  { backgroundColor: ball.seamColor },
                ]}
              />
              <View
                style={[
                  styles.realBallSeamLeft,
                  { borderColor: ball.seamColor },
                ]}
              />
              <View
                style={[
                  styles.realBallSeamRight,
                  { borderColor: ball.seamColor },
                ]}
              />
              <View
                style={[
                  styles.realBallStitchLine,
                  { backgroundColor: ball.seamColor },
                ]}
              />
              {isSelected && (
                <View style={styles.realBallCheck}>
                  <Ionicons name="checkmark" size={18} color="#FFF" />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.realBallLabel,
                isSelected && styles.realBallLabelSelected,
              ]}
            >
              {ball.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // Pitch type selector (kept for backward compat, no longer displayed in match setup)
  const pitchType = "";
  const setPitchType = (_: string) => {};
  const renderPitchTypeSelector = () => (
    <View style={styles.realPitchGrid}>
      {pitchOptions.map((pitch) => {
        const isSelected = pitchType === pitch.id;

        return (
          <TouchableOpacity
            key={pitch.id}
            style={[
              styles.realPitchOption,
              isSelected && styles.realPitchOptionSelected,
            ]}
            onPress={() => setPitchType(pitch.id)}
            activeOpacity={0.84}
          >
            <View
              style={[
                styles.pitchSurface,
                { backgroundColor: pitch.baseColor },
              ]}
            >
              <View
                style={[styles.pitchLane, { backgroundColor: pitch.laneColor }]}
              >
                <View
                  style={[
                    styles.pitchCrease,
                    { backgroundColor: pitch.stripeColor },
                  ]}
                />
                <View style={styles.pitchStumpsRow}>
                  <View style={styles.pitchStump} />
                  <View style={styles.pitchStump} />
                  <View style={styles.pitchStump} />
                </View>
                <View style={styles.pitchCenterLine} />
                <View style={styles.pitchStumpsRow}>
                  <View style={styles.pitchStump} />
                  <View style={styles.pitchStump} />
                  <View style={styles.pitchStump} />
                </View>
                <View
                  style={[
                    styles.pitchCrease,
                    { backgroundColor: pitch.stripeColor },
                  ]}
                />
              </View>
              {pitch.id === "matting" && (
                <View style={styles.pitchMattingLines}>
                  <View style={styles.pitchMattingLine} />
                  <View style={styles.pitchMattingLine} />
                  <View style={styles.pitchMattingLine} />
                </View>
              )}
              {isSelected && (
                <View style={styles.pitchSelectedBadge}>
                  <Ionicons name="checkmark" size={13} color="#FFF" />
                </View>
              )}
            </View>
            <Text
              style={[
                styles.realPitchLabel,
                isSelected && styles.realPitchLabelSelected,
              ]}
            >
              {pitch.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const pickTournamentImage = async (imageType: "banner" | "logo") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload tournament images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: imageType === "banner" ? [16, 7] : [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      if (imageType === "banner") {
        setTournamentBannerUri(result.assets[0].uri);
      } else {
        setTournamentLogoUri(result.assets[0].uri);
      }
    }
  };

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

  const getTossWinnerName = () =>
    tossWinner === "A" ? teamAName : tossWinner === "B" ? teamBName : "";

  const getBattingTeamName = () => {
    if (!tossWinner || !tossDecision) {
      return "";
    }

    const winnerName = tossWinner === "A" ? teamAName : teamBName;
    const loserName = tossWinner === "A" ? teamBName : teamAName;
    return tossDecision === "bat" ? winnerName : loserName;
  };

  const getBowlingTeamName = () => {
    if (!tossWinner || !tossDecision) {
      return "";
    }

    const winnerName = tossWinner === "A" ? teamAName : teamBName;
    const loserName = tossWinner === "A" ? teamBName : teamAName;
    return tossDecision === "bowl" ? winnerName : loserName;
  };

  const getOverLabel = (over: number, ball: number) => `${over}.${ball}`;

  const saveScoreSnapshot = () => {
    setScoreHistory((currentHistory) => [
      ...currentHistory,
      {
        totalRuns,
        totalWickets,
        currentBall,
        currentOver,
        strikerRuns,
        strikerBalls,
        nonStrikerRuns,
        nonStrikerBalls,
        bowlerOvers,
        bowlerRuns,
        bowlerWickets,
        selectedStriker,
        selectedNonStriker,
      },
    ]);
  };

  const rotateStrike = () => {
    const currentStriker = selectedStriker;
    setSelectedStriker(selectedNonStriker);
    setSelectedNonStriker(currentStriker);

    const currentRuns = strikerRuns;
    const currentBalls = strikerBalls;
    setStrikerRuns(nonStrikerRuns);
    setStrikerBalls(nonStrikerBalls);
    setNonStrikerRuns(currentRuns);
    setNonStrikerBalls(currentBalls);
  };

  const advanceBall = () => {
    if (currentBall >= 6) {
      setCurrentBall(1);
      setCurrentOver((over) => over + 1);
      rotateStrike();
      return;
    }

    setCurrentBall((ball) => ball + 1);
  };

  const updateBowlerFigures = (
    runsAdded: number,
    wicketAdded = 0,
    legalBall = true,
  ) => {
    const nextRuns = bowlerRuns + runsAdded;
    const nextWickets = bowlerWickets + wicketAdded;
    const currentLegalBalls = (currentOver - 1) * 6 + (currentBall - 1);
    const nextLegalBalls = currentLegalBalls + (legalBall ? 1 : 0);
    const fullOvers = Math.floor(nextLegalBalls / 6);
    const balls = nextLegalBalls % 6;
    const overText = `${fullOvers}.${balls}`;

    setBowlerRuns(nextRuns);
    setBowlerWickets(nextWickets);
    setBowlerOvers(`${overText}-0-${nextRuns}-${nextWickets}`);
  };

  const applyLegalRun = (runs: number) => {
    saveScoreSnapshot();
    setTotalRuns((score) => score + runs);
    const nextStrikerRuns = strikerRuns + runs;
    const nextStrikerBalls = strikerBalls + 1;
    setStrikerRuns(nextStrikerRuns);
    setStrikerBalls(nextStrikerBalls);
    updateBowlerFigures(runs, 0, true);
    advanceBall();

    if (runs % 2 === 1) {
      const currentStriker = selectedStriker;
      setSelectedStriker(selectedNonStriker);
      setSelectedNonStriker(currentStriker);
      setStrikerRuns(nonStrikerRuns);
      setStrikerBalls(nonStrikerBalls);
      setNonStrikerRuns(nextStrikerRuns);
      setNonStrikerBalls(nextStrikerBalls);
    }
  };

  const applyExtra = (kind: "WD" | "NB" | "BYE" | "LB") => {
    saveScoreSnapshot();
    const isLegal = kind === "BYE" || kind === "LB";
    const runsAdded = kind === "WD" ? wideRuns : kind === "NB" ? noBallRuns : 1;

    setTotalRuns((score) => score + runsAdded);
    updateBowlerFigures(
      kind === "BYE" || kind === "LB" ? 0 : runsAdded,
      0,
      isLegal,
    );

    if (isLegal) {
      setStrikerBalls((balls) => balls + 1);
      advanceBall();
      if (runsAdded % 2 === 1) {
        rotateStrike();
      }
    }
  };

  const applyWicket = () => {
    saveScoreSnapshot();
    setTotalWickets((wickets) => wickets + 1);
    setStrikerBalls((balls) => balls + 1);
    updateBowlerFigures(0, 1, true);
    advanceBall();
  };

  const undoScore = () => {
    const previous = scoreHistory[scoreHistory.length - 1];

    if (!previous) {
      return;
    }

    setTotalRuns(previous.totalRuns);
    setTotalWickets(previous.totalWickets);
    setCurrentBall(previous.currentBall);
    setCurrentOver(previous.currentOver);
    setStrikerRuns(previous.strikerRuns);
    setStrikerBalls(previous.strikerBalls);
    setNonStrikerRuns(previous.nonStrikerRuns);
    setNonStrikerBalls(previous.nonStrikerBalls);
    setBowlerOvers(previous.bowlerOvers);
    setBowlerRuns(previous.bowlerRuns);
    setBowlerWickets(previous.bowlerWickets);
    setSelectedStriker(previous.selectedStriker);
    setSelectedNonStriker(previous.selectedNonStriker);
    setScoreHistory((currentHistory) => currentHistory.slice(0, -1));
  };

  const changeTournamentCalendarMonth = (offset: number) => {
    setTournamentCalendarMonth(
      (currentMonth) =>
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + offset,
          1,
        ),
    );
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
      ...Array.from({ length: firstDay }, (_, index) => ({
        key: `empty-${index}`,
      })),
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
            <Ionicons name="chevron-back" size={18} color="#B71C1C" />
          </TouchableOpacity>
          <Text style={styles.calendarTitle}>{monthLabel}</Text>
          <TouchableOpacity
            style={styles.calendarNavButton}
            onPress={() => changeTournamentCalendarMonth(1)}
          >
            <Ionicons name="chevron-forward" size={18} color="#B71C1C" />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarWeekRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} style={styles.calendarWeekText}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarCells.map((cell) => {
            if (!cell.date) {
              return (
                <View key={cell.key} style={styles.calendarDayPlaceholder} />
              );
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
  const tournamentDetailHorizontalScrollRef = useRef<ScrollView>(null);

  // Tournament detail sub-pager (no main-tab edge needed — nested within my-cricket)
  const handleTournamentDetailTabPress = (tabName: string) => {
    setActiveTournamentDetailTab(tabName);
    const tabs = ["matches", "points", "leaderboard", "teams"];
    const index = tabs.indexOf(tabName);
    if (index !== -1) {
      tournamentDetailHorizontalScrollRef.current?.scrollTo({
        x: index * SCREEN_WIDTH,
        animated: true,
      });
    }
  };

  const handleTournamentDetailHorizontalScrollEnd = (e: any) => {
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    const tabs = ["matches", "points", "leaderboard", "teams"];
    if (pageIndex >= 0 && pageIndex < tabs.length) {
      setActiveTournamentDetailTab(tabs[pageIndex]);
    }
  };
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

  // Handle navigation parameters
  useEffect(() => {
    if (params.startScoring === "1") {
      // Coming from the new setup flow (app/setup/players → match).
      if (typeof params.teamA === "string") setTeamAName(params.teamA);
      if (typeof params.teamB === "string") setTeamBName(params.teamB);
      if (typeof params.overs === "string") setNumberOfOvers(params.overs);
      if (typeof params.venue === "string") setSelectedGround(params.venue);
      if (typeof params.matchDate === "string") setMatchDate(params.matchDate);
      if (params.tossWinner === "teamA") setTossWinner("A");
      if (params.tossWinner === "teamB") setTossWinner("B");
      if (params.tossChoice === "bat" || params.tossChoice === "bowl") {
        setTossDecision(params.tossChoice);
      }
      activeMatchId.current = `match-${Date.now()}`;
      handleTabPress("matches");
      setCurrentView("scoringPage");
      return;
    }
    if (params.source === "drawer") {
      console.log("Coming from drawer - showing individual pages");
      setCurrentView("matches");
    } else if (params.action === "createTournament") {
      handleTabPress("tournaments");
      setCurrentView("matches");
    } else if (params.action === "startMatch") {
      handleTabPress("matches");
      setCurrentView("teamSelection");
      setShowTeamSelection(true);
    } else if (params.tab === "tournaments") {
      handleTabPress("tournaments");
      setCurrentView("matches");
    } else if (params.tab === "matches") {
      handleTabPress("matches");
      setCurrentView("matches");
    } else if (params.tab === "teams") {
      handleTabPress("teams");
      setCurrentView("matches");
    }
  }, [
    params.action,
    params.tab,
    params.section,
    params.source,
    params.startScoring,
  ]);

  // ───── Active match auto-save (pre-backend persistence) ─────
  // A stable id for the in-progress match so saves overwrite the same record.
  const activeMatchId = useRef<string>(`match-${Date.now()}`);

  // Build a Match object from the current scoring state.
  const buildMatchSnapshot = (status: Match["status"]): Match => ({
    id: activeMatchId.current,
    teamA: { id: "teamA", name: teamAName, players: [] },
    teamB: { id: "teamB", name: teamBName, players: [] },
    overs: parseInt(numberOfOvers, 10) || 0,
    venue: selectedGround || undefined,
    matchDate: matchDate || new Date().toISOString(),
    matchType: "friendly",
    tossWinner: tossWinner === "B" ? "teamB" : "teamA",
    tossChoice: tossDecision === "bowl" ? "bowl" : "bat",
    status,
    innings: [
      {
        battingTeam:
          tossDecision === "bat" && tossWinner === "B" ? "teamB" : "teamA",
        balls: [],
        totalRuns,
        totalWickets,
        overs: currentOver - 1 + (currentBall - 1) / 10,
      },
    ],
    createdBy: "local-user",
  });

  // Save the completed match to history and clear the resumable active match.
  // TODO(backend): replace with MatchService.createMatch / saveInningsState
  const endMatchAndSave = () => {
    Alert.alert("End Match", "Save this match to your history and exit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save & End",
        onPress: async () => {
          try {
            await LocalStorage.saveMatch(buildMatchSnapshot("completed"));
            await LocalStorage.clearActiveMatch();
          } catch {
            // Non-fatal: still exit even if persistence fails.
          }
          activeMatchId.current = `match-${Date.now()}`;
          setCurrentView("matches");
        },
      },
    ]);
  };

  // Auto-save after every recorded ball while on the scoring page.
  // TODO(backend): replace LocalStorage.saveActiveMatch with
  // MatchService.saveInningsState(matchId, innings)
  useEffect(() => {
    if (currentView !== "scoringPage") {
      return;
    }
    LocalStorage.saveActiveMatch(buildMatchSnapshot("live")).catch(() => {
      // Non-fatal: scoring continues even if persistence fails.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, totalRuns, totalWickets, currentOver, currentBall]);

  // On first mount, offer to resume a previously saved active match.
  useEffect(() => {
    let cancelled = false;
    LocalStorage.getActiveMatch().then((saved) => {
      if (cancelled || !saved || !saved.teamA?.name || !saved.teamB?.name) {
        return;
      }
      Alert.alert(
        "Resume Match?",
        `You have an unfinished match: ${saved.teamA.name} vs ${saved.teamB.name}. Resume scoring?`,
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => LocalStorage.clearActiveMatch(),
          },
          {
            text: "Resume",
            onPress: () => {
              if (saved.id) {
                activeMatchId.current = saved.id;
              }
              setTeamAName(saved.teamA?.name ?? "");
              setTeamBName(saved.teamB?.name ?? "");
              const innings = saved.innings?.[0];
              if (innings) {
                setTotalRuns(innings.totalRuns ?? 0);
                setTotalWickets(innings.totalWickets ?? 0);
              }
              handleTabPress("matches");
              setCurrentView("scoringPage");
            },
          },
        ],
      );
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle hardware back button
  useEffect(() => {
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
        if (teamSlot) {
          setCurrentView("teamSelection");
        } else {
          setCurrentView("addTeamsPlayers");
        }
        setShowAddPlayerModal(false);
        return true;
      }
      if (currentView === "tournamentDetail") {
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
  }, [currentView]);

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
    if (
      !currentPlayers.trim() ||
      parseInt(currentPlayers) < 1 ||
      parseInt(currentPlayers) > 20
    ) {
      alert("Please select number of players (1-20)");
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
          [{ text: "OK" }],
        );
        return;
      }

      // Show loading state
      setLocationEnabled(true);

      // Try to get location with timeout
      try {
        const location = (await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Location timeout")), 10000),
          ),
        ])) as Location.LocationObject;

        console.log("Current location:", location.coords);
      } catch (locationError) {
        console.log("Location fetch failed:", locationError);
      }

      // TODO(backend): fetch nearby grounds from API using lat/long
      const grounds: typeof nearbyGrounds = [];

      setNearbyGrounds(grounds);

      if (grounds.length > 0) {
        const nearestGround = grounds[0];
        setSelectedGround(nearestGround.name);
        setSelectedCity(nearestGround.city);

        Alert.alert(
          "Location Enabled!",
          `Found ${grounds.length} nearby grounds. Nearest: ${nearestGround.name}`,
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Location Enabled",
          "No nearby grounds found yet. Enter your ground manually.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.error("Error enabling location:", error);
      setLocationEnabled(false);
      Alert.alert(
        "Error",
        "Failed to enable location. Please make sure location services are enabled on your device and try again.",
        [{ text: "OK" }],
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

  // TODO(backend): fetch user matches from MatchService.getMatchHistory()
  type MatchItem = {
    id: number;
    type: string;
    status: string;
    team: string;
    date: string;
    overs: string;
    format: string;
    location: string;
    time: string;
    result?: string;
  };
  const matches: MatchItem[] = [];

  // TODO(backend): fetch matches by filter from API (your / participate / network / all)
  const getMatchesByFilter = (filter: string): MatchItem[] => {
    switch (filter) {
      case "your":
        // TODO(backend): fetch user's matches from API
        return [];

      case "participate":
        // TODO(backend): fetch matches the user participates in from API
        return [];

      case "network":
        // TODO(backend): fetch matches from the user's network from API
        return [];

      case "all":
        // TODO(backend): fetch all public matches from API
        return [];

      default:
        return [];
    }
  };

  const currentMatches = getMatchesByFilter(activeFilter);

  // All tournaments data for search
  // TODO(backend): fetch tournaments for search from TournamentService.list()
  type TournamentItem = {
    id: number;
    name: string;
    teams: number;
    matches: number;
    status: string;
    startDate: string;
    progress: number;
    category: string;
  };
  const allTournaments: TournamentItem[] = [];

  // All matches data for search
  const allMatches = [
    ...getMatchesByFilter("your"),
    ...getMatchesByFilter("participate"),
    ...getMatchesByFilter("network"),
    ...getMatchesByFilter("all"),
  ];

  // Search function
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ tournaments: [], matches: [] });
      return;
    }

    const searchTerm = query.toLowerCase().trim();

    // Search tournaments
    const filteredTournaments = allTournaments.filter(
      (tournament) =>
        tournament.name.toLowerCase().includes(searchTerm) ||
        tournament.status.toLowerCase().includes(searchTerm) ||
        tournament.category.toLowerCase().includes(searchTerm),
    );

    // Search matches
    const filteredMatches = allMatches.filter(
      (match) =>
        match.team.toLowerCase().includes(searchTerm) ||
        match.type.toLowerCase().includes(searchTerm) ||
        match.location.toLowerCase().includes(searchTerm) ||
        match.format.toLowerCase().includes(searchTerm) ||
        match.status.toLowerCase().includes(searchTerm),
    );

    setSearchResults({
      tournaments: filteredTournaments,
      matches: filteredMatches,
    });
  };

  // Handle search query change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  return (
    <TabScreenWrapper swipeEnabled={false}>
      <View style={styles.container}>
        {/* Header - Always show except when specified */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={["#B71C1C", "#8B0000", "#8B0000"]}
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
                    } else if (
                      currentView === "selectTeam" ||
                      currentView === "createTeam"
                    ) {
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
              <Text style={styles.headerTitle}>My Sports</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onChangeSport}
              >
                <Ionicons name="swap-horizontal" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSearchModal(true)}
              >
                <Ionicons name="search" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Chat", "Chat feature coming soon")}>
                <Ionicons name="chatbubble-outline" size={22} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => Alert.alert("Notifications", "No new notifications")}>
                <Ionicons name="notifications-outline" size={22} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Animated Tabs - Always show when on matches view */}
        {currentView === "matches" && (
          <Animated.View style={[styles.tabsContainer, { opacity: fadeAnim }]}>
            {/* Real-time sliding indicator line */}
            <Animated.View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: SCREEN_WIDTH / 3 - 32,
                height: 3,
                backgroundColor: "#B71C1C",
                transform: [
                  {
                    translateX: scrollX.interpolate({
                      inputRange: [0, SCREEN_WIDTH * 2],
                      outputRange: [16, 16 + (SCREEN_WIDTH / 3) * 2],
                    }),
                  },
                ],
                zIndex: 10,
              }}
            />
            {["matches", "tournaments", "teams"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={styles.tab}
                onPress={() => handleTabPress(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <AnimatedViewTransition transitionKey={currentView} type="slideUp">
            {/* Main Content Based on Current View */}
            {currentView === "createTournament" ? (
              /* Create Tournament Form View */
              <View style={styles.createTournamentFormContainer}>
                <View style={styles.formHeaderBlock}>
                  <Text style={styles.formTitle}>
                    Add a tournament / series
                  </Text>
                  <Text style={styles.formSubtitle}>
                    Set up your tournament profile, match rules, and public
                    listing.
                  </Text>
                </View>

                <View style={styles.formCard}>
                  <View style={styles.mediaUploadStage}>
                    <TouchableOpacity
                      style={styles.bannerUploadButton}
                      onPress={() => pickTournamentImage("banner")}
                      activeOpacity={0.85}
                    >
                      <View style={styles.bannerMediaPlaceholder}>
                        {tournamentBannerUri ? (
                          <Image
                            source={{ uri: tournamentBannerUri }}
                            style={styles.tournamentBannerPreview}
                          />
                        ) : (
                          <View style={styles.emptyBannerContent}>
                            <Ionicons
                              name="image-outline"
                              size={34}
                              color="#B71C1C"
                            />
                            <Text style={styles.emptyBannerTitle}>
                              Tournament banner
                            </Text>
                            <Text style={styles.emptyBannerSubtitle}>
                              Tap to upload from device
                            </Text>
                          </View>
                        )}
                        <View style={styles.cameraIconBadge}>
                          <Ionicons name="camera" size={16} color="#FFF" />
                        </View>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.logoUploadButton}
                      onPress={() => pickTournamentImage("logo")}
                      activeOpacity={0.85}
                    >
                      <View style={styles.logoMediaPlaceholder}>
                        {tournamentLogoUri ? (
                          <Image
                            source={{ uri: tournamentLogoUri }}
                            style={styles.tournamentLogoPreview}
                          />
                        ) : (
                          <Ionicons
                            name="shield-outline"
                            size={34}
                            color="#B71C1C"
                          />
                        )}
                        <View style={styles.logoCameraBadge}>
                          <Ionicons name="camera" size={12} color="#FFF" />
                        </View>
                      </View>
                      <Text style={styles.logoUploadText}>
                        {tournamentLogoUri ? "Change logo" : "Add logo"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Form Fields */}
                  {renderTextInput(
                    "Tournament / series name",
                    tournamentName,
                    setTournamentName,
                    "Enter your tournament name",
                    true,
                  )}
                  {renderTextInput(
                    "City",
                    tournamentCity,
                    setTournamentCity,
                    "Enter city",
                    true,
                  )}
                  {renderTextInput(
                    "Ground",
                    tournamentGround,
                    setTournamentGround,
                    "Enter ground name",
                    true,
                  )}
                  {renderTextInput(
                    "Organiser name",
                    organizerName,
                    setOrganizerName,
                    "Enter organiser name",
                    true,
                  )}
                  {renderTextInput(
                    "Organiser number",
                    organizerNumber,
                    setOrganizerNumber,
                    "Enter phone number",
                    true,
                    "phone-pad",
                  )}

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
                    <Text style={styles.emailHint}>
                      *Get updated with CricHeroes offers and help videos on
                      mail.
                    </Text>
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
                            activeTournamentDateField === field &&
                              styles.dateInputActive,
                          ]}
                          onPress={() => {
                            setActiveTournamentDateField(
                              activeTournamentDateField === field
                                ? null
                                : field,
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
                            color={
                              activeTournamentDateField === field
                                ? "#B71C1C"
                                : "#666"
                            }
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
                      [
                        "OPEN",
                        "CORPORATE",
                        "COMMUNITY",
                        "SCHOOL",
                        "OTHER",
                        "SERIES",
                        "COLLEGE",
                        "UNIVERSITY",
                      ],
                      tournamentCategory,
                      setTournamentCategory,
                      "#E63946",
                    )}
                  </View>

                  {/* Select Ball Type */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Select ball type *</Text>
                    {renderBallTypeSelector(
                      tournamentBallType,
                      setTournamentBallType,
                    )}
                  </View>

                  {/* Pitch Type */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Pitch type</Text>
                    {renderChipGroup(
                      ["ROUGH", "CEMENT", "TURF", "ASTROTURF", "MATTING"],
                      tournamentPitchType,
                      setTournamentPitchType,
                      "#B71C1C",
                    )}
                  </View>

                  {/* Match Type */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Match type *</Text>
                    {renderChipGroup(
                      [
                        "Limited Overs",
                        "Box/Turf Cricket",
                        "Pair Cricket",
                        "Test Match",
                        "The Hundred",
                      ],
                      tournamentMatchType,
                      setTournamentMatchType,
                      "#B71C1C",
                    )}
                  </View>

                  {/* Checkboxes */}
                  {[
                    {
                      label: "Do you need more teams for your tournament?",
                      value: needMoreTeams,
                      setter: setNeedMoreTeams,
                    },
                    {
                      label: "Do you need officials? (e.g. Umpire, Scorer)",
                      value: needOfficials,
                      setter: setNeedOfficials,
                    },
                  ].map((checkbox, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.checkboxRow}
                      onPress={() => checkbox.setter(!checkbox.value)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          checkbox.value && styles.checkboxChecked,
                        ]}
                      >
                        {checkbox.value && (
                          <Ionicons name="checkmark" size={16} color="#FFF" />
                        )}
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
                        Alert.alert(
                          "Required Field",
                          "Please enter tournament name",
                        );
                        return;
                      }
                      if (!tournamentBannerUri) {
                        Alert.alert(
                          "Required Field",
                          "Please add tournament banner",
                        );
                        return;
                      }
                      if (!tournamentLogoUri) {
                        Alert.alert(
                          "Required Field",
                          "Please add tournament logo",
                        );
                        return;
                      }
                      if (!tournamentCity.trim()) {
                        Alert.alert("Required Field", "Please enter city");
                        return;
                      }
                      if (!tournamentGround.trim()) {
                        Alert.alert(
                          "Required Field",
                          "Please enter ground name",
                        );
                        return;
                      }
                      if (!organizerName.trim()) {
                        Alert.alert(
                          "Required Field",
                          "Please enter organiser name",
                        );
                        return;
                      }
                      if (!organizerNumber.trim()) {
                        Alert.alert(
                          "Required Field",
                          "Please enter organiser number",
                        );
                        return;
                      }
                      if (!tournamentStartDate) {
                        Alert.alert(
                          "Required Field",
                          "Please select start date",
                        );
                        return;
                      }
                      if (!tournamentEndDate) {
                        Alert.alert("Required Field", "Please select end date");
                        return;
                      }
                      if (tournamentEndDate < tournamentStartDate) {
                        Alert.alert(
                          "Invalid Date",
                          "End date cannot be before start date",
                        );
                        return;
                      }
                      if (!tournamentCategory) {
                        Alert.alert(
                          "Required Field",
                          "Please select tournament category",
                        );
                        return;
                      }
                      if (!tournamentBallType) {
                        Alert.alert(
                          "Required Field",
                          "Please select ball type",
                        );
                        return;
                      }
                      if (!tournamentMatchType) {
                        Alert.alert(
                          "Required Field",
                          "Please select match type",
                        );
                        return;
                      }

                      // Navigate to team management view
                      setCurrentView("tournamentTeamManagement");
                      setShowAddPlayerModal(true);
                    }}
                  >
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000", "#8B0000"]}
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
                  colors={["#8B0000", "#B71C1C", "#C62828"]}
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
                    <View
                      style={[
                        styles.tdStatusPill,
                        {
                          backgroundColor:
                            selectedTournament.status === "Ongoing"
                              ? "rgba(255,255,255,0.25)"
                              : "rgba(255,255,255,0.15)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.tdStatusDot,
                          {
                            backgroundColor:
                              selectedTournament.status === "Ongoing"
                                ? "#10B981"
                                : "#FFA500",
                          },
                        ]}
                      />
                      <Text style={styles.tdStatusText}>
                        {selectedTournament.status}
                      </Text>
                    </View>

                    {/* Stats row */}
                    <View style={styles.tdHeroStats}>
                      {[
                        {
                          icon: "people",
                          label: "Teams",
                          value: selectedTournament.teams,
                        },
                        {
                          icon: "baseball",
                          label: "Matches",
                          value: selectedTournament.matches,
                        },
                        {
                          icon: "calendar-outline",
                          label: "Start",
                          value: selectedTournament.startDate.split(",")[0],
                        },
                      ].map((stat, i) => (
                        <View key={i} style={styles.tdHeroStat}>
                          <Ionicons
                            name={stat.icon as any}
                            size={14}
                            color="rgba(255,255,255,0.8)"
                          />
                          <Text style={styles.tdHeroStatValue}>
                            {stat.value}
                          </Text>
                          <Text style={styles.tdHeroStatLabel}>
                            {stat.label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Progress bar */}
                    <View style={styles.tdProgressWrap}>
                      <View style={styles.tdProgressBg}>
                        <View
                          style={[
                            styles.tdProgressFill,
                            { width: `${selectedTournament.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.tdProgressLabel}>
                        {selectedTournament.progress}% Complete
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Detail Tabs */}
                <View style={styles.tdTabs}>
                  {["matches", "points", "leaderboard", "teams"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tdTab,
                        activeTournamentDetailTab === tab && styles.tdTabActive,
                      ]}
                      onPress={() => handleTournamentDetailTabPress(tab)}
                    >
                      <Text
                        style={[
                          styles.tdTabText,
                          activeTournamentDetailTab === tab &&
                            styles.tdTabTextActive,
                        ]}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Text>
                      {activeTournamentDetailTab === tab && (
                        <View style={styles.tdTabIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tab Content */}
                <ScrollView
                  ref={tournamentDetailHorizontalScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={
                    handleTournamentDetailHorizontalScrollEnd
                  }
                  style={styles.tdContent}
                  scrollEventThrottle={16}
                  nestedScrollEnabled
                >
                  {/* Slide 1: Matches */}
                  <ScrollView
                    style={{ width: SCREEN_WIDTH }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.tdSection}>
                      <Text style={styles.tdSectionTitle}>
                        Upcoming Matches
                      </Text>
                      {/* TODO(backend): fetch upcoming tournament matches from API */}
                      {(
                        [] as {
                          id: number;
                          team1: string;
                          team2: string;
                          date: string;
                          time: string;
                          venue: string;
                          status: string;
                        }[]
                      ).map((m) => (
                        <View key={m.id} style={styles.tdMatchCard}>
                          <View style={styles.tdMatchHeader}>
                            <View
                              style={[
                                styles.tdMatchBadge,
                                {
                                  backgroundColor:
                                    m.status === "upcoming"
                                      ? "#F59E0B"
                                      : "#B71C1C",
                                },
                              ]}
                            >
                              <Text style={styles.tdMatchBadgeText}>
                                {m.status === "upcoming"
                                  ? "UPCOMING"
                                  : "SCHEDULED"}
                              </Text>
                            </View>
                            <Text style={styles.tdMatchDate}>
                              {m.date} · {m.time}
                            </Text>
                          </View>
                          <View style={styles.tdMatchTeams}>
                            <View style={styles.tdTeamCol}>
                              <LinearGradient
                                colors={["#B71C1C", "#8B0000"]}
                                style={styles.tdTeamAvatar}
                              >
                                <Text style={styles.tdTeamAvatarText}>
                                  {m.team1.charAt(0)}
                                </Text>
                              </LinearGradient>
                              <Text style={styles.tdTeamName}>{m.team1}</Text>
                            </View>
                            <View style={styles.tdVsBox}>
                              <Text style={styles.tdVs}>VS</Text>
                            </View>
                            <View style={styles.tdTeamCol}>
                              <LinearGradient
                                colors={["#1565C0", "#0D47A1"]}
                                style={styles.tdTeamAvatar}
                              >
                                <Text style={styles.tdTeamAvatarText}>
                                  {m.team2.charAt(0)}
                                </Text>
                              </LinearGradient>
                              <Text style={styles.tdTeamName}>{m.team2}</Text>
                            </View>
                          </View>
                          <View style={styles.tdMatchFooter}>
                            <Ionicons
                              name="location-outline"
                              size={13}
                              color="#999"
                            />
                            <Text style={styles.tdMatchVenue}>{m.venue}</Text>
                          </View>
                        </View>
                      ))}

                      <Text style={[styles.tdSectionTitle, { marginTop: 20 }]}>
                        Completed Matches
                      </Text>
                      {/* TODO(backend): fetch completed tournament matches from API */}
                      {(
                        [] as {
                          id: number;
                          team1: string;
                          score1: string;
                          team2: string;
                          score2: string;
                          winner: string;
                          margin: string;
                        }[]
                      ).map((m) => (
                        <View
                          key={m.id}
                          style={[
                            styles.tdMatchCard,
                            { borderLeftColor: "#10B981", borderLeftWidth: 3 },
                          ]}
                        >
                          <View style={styles.tdMatchHeader}>
                            <View
                              style={[
                                styles.tdMatchBadge,
                                { backgroundColor: "#10B981" },
                              ]}
                            >
                              <Text style={styles.tdMatchBadgeText}>
                                COMPLETED
                              </Text>
                            </View>
                          </View>
                          <View style={styles.tdMatchTeams}>
                            <View style={styles.tdTeamCol}>
                              <LinearGradient
                                colors={["#B71C1C", "#8B0000"]}
                                style={styles.tdTeamAvatar}
                              >
                                <Text style={styles.tdTeamAvatarText}>
                                  {m.team1.charAt(0)}
                                </Text>
                              </LinearGradient>
                              <Text style={styles.tdTeamName}>{m.team1}</Text>
                              <Text style={styles.tdScore}>{m.score1}</Text>
                            </View>
                            <View style={styles.tdVsBox}>
                              <Text style={styles.tdVs}>VS</Text>
                            </View>
                            <View style={styles.tdTeamCol}>
                              <LinearGradient
                                colors={["#1565C0", "#0D47A1"]}
                                style={styles.tdTeamAvatar}
                              >
                                <Text style={styles.tdTeamAvatarText}>
                                  {m.team2.charAt(0)}
                                </Text>
                              </LinearGradient>
                              <Text style={styles.tdTeamName}>{m.team2}</Text>
                              <Text style={styles.tdScore}>{m.score2}</Text>
                            </View>
                          </View>
                          <View style={styles.tdMatchFooter}>
                            <Ionicons
                              name="trophy-outline"
                              size={13}
                              color="#10B981"
                            />
                            <Text
                              style={[
                                styles.tdMatchVenue,
                                { color: "#10B981", fontWeight: "700" },
                              ]}
                            >
                              {m.winner} won by {m.margin}
                            </Text>
                          </View>
                        </View>
                      ))}
                      <View style={{ height: 80 }} />
                    </View>
                  </ScrollView>

                  {/* Slide 2: Points */}
                  <ScrollView
                    style={{ width: SCREEN_WIDTH }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.tdSection}>
                      <Text style={styles.tdSectionTitle}>Points Table</Text>
                      {/* Header */}
                      <LinearGradient
                        colors={["#B71C1C", "#8B0000"]}
                        style={styles.tdPtsHeader}
                      >
                        {["#", "Team", "P", "W", "L", "NRR", "Pts"].map(
                          (h, i) => (
                            <Text
                              key={i}
                              style={[
                                styles.tdPtsCell,
                                styles.tdPtsHeaderCell,
                                i === 1 && { flex: 2.5, textAlign: "left" },
                              ]}
                            >
                              {h}
                            </Text>
                          ),
                        )}
                      </LinearGradient>
                      {/* TODO(backend): fetch points table from API */}
                      {(
                        [] as {
                          rank: number;
                          team: string;
                          p: number;
                          w: number;
                          l: number;
                          nrr: string;
                          pts: number;
                          q: boolean;
                        }[]
                      ).map((row, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.tdPtsRow,
                            row.q && styles.tdPtsRowQ,
                            idx % 2 === 0 && { backgroundColor: "#FAFAFA" },
                          ]}
                        >
                          <View style={[styles.tdPtsCell, { flex: 1 }]}>
                            <View
                              style={[
                                styles.tdRankBadge,
                                row.rank === 1 && {
                                  backgroundColor: "#FFD700",
                                },
                                row.rank === 2 && {
                                  backgroundColor: "#C0C0C0",
                                },
                                row.rank === 3 && {
                                  backgroundColor: "#CD7F32",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.tdRankText,
                                  row.rank <= 3 && { color: "#FFF" },
                                ]}
                              >
                                {row.rank}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.tdPtsCell,
                              {
                                flex: 2.5,
                                flexDirection: "row",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <LinearGradient
                              colors={["#B71C1C", "#8B0000"]}
                              style={styles.tdTeamDot}
                            >
                              <Text style={styles.tdTeamDotText}>
                                {row.team.charAt(0)}
                              </Text>
                            </LinearGradient>
                            <Text style={styles.tdTeamLabel} numberOfLines={1}>
                              {row.team}
                            </Text>
                            {row.q && (
                              <Ionicons
                                name="checkmark-circle"
                                size={12}
                                color="#10B981"
                                style={{ marginLeft: 4 }}
                              />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.tdPtsCell,
                              { flex: 1, textAlign: "center" },
                            ]}
                          >
                            {row.p}
                          </Text>
                          <Text
                            style={[
                              styles.tdPtsCell,
                              {
                                flex: 1,
                                textAlign: "center",
                                color: "#10B981",
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {row.w}
                          </Text>
                          <Text
                            style={[
                              styles.tdPtsCell,
                              {
                                flex: 1,
                                textAlign: "center",
                                color: "#E63946",
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {row.l}
                          </Text>
                          <Text
                            style={[
                              styles.tdPtsCell,
                              {
                                flex: 1,
                                textAlign: "center",
                                color: row.nrr.startsWith("+")
                                  ? "#10B981"
                                  : "#E63946",
                                fontSize: 11,
                              },
                            ]}
                          >
                            {row.nrr}
                          </Text>
                          <Text
                            style={[
                              styles.tdPtsCell,
                              {
                                flex: 1,
                                textAlign: "center",
                                fontWeight: "800",
                                color: "#B71C1C",
                              },
                            ]}
                          >
                            {row.pts}
                          </Text>
                        </View>
                      ))}
                      <View style={styles.tdLegend}>
                        <View style={styles.tdLegendRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#10B981"
                          />
                          <Text style={styles.tdLegendText}>
                            Qualified for playoffs
                          </Text>
                        </View>
                        <Text style={styles.tdLegendNote}>
                          P=Played · W=Won · L=Lost · NRR=Net Run Rate
                        </Text>
                      </View>
                      <View style={{ height: 80 }} />
                    </View>
                  </ScrollView>

                  {/* Slide 3: Leaderboard */}
                  <ScrollView
                    style={{ width: SCREEN_WIDTH }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.tdSection}>
                      <Text style={styles.tdSectionTitle}>🏏 Top Batsmen</Text>
                      {/* TODO(backend): fetch top batsmen leaderboard from API */}
                      {(
                        [] as {
                          rank: number;
                          name: string;
                          team: string;
                          runs: number;
                          avg: string;
                          sr: string;
                          icon: string;
                        }[]
                      ).map((p) => (
                        <View key={p.rank} style={styles.tdPlayerCard}>
                          <Text style={styles.tdPlayerIcon}>{p.icon}</Text>
                          <View style={styles.tdPlayerInfo}>
                            <Text style={styles.tdPlayerName}>{p.name}</Text>
                            <Text style={styles.tdPlayerTeam}>{p.team}</Text>
                          </View>
                          <View style={styles.tdPlayerStats}>
                            <Text style={styles.tdPlayerStatMain}>
                              {p.runs}
                            </Text>
                            <Text style={styles.tdPlayerStatSub}>Runs</Text>
                            <View style={styles.tdPlayerMeta}>
                              <Text style={styles.tdPlayerMetaText}>
                                Avg {p.avg}
                              </Text>
                              <Text style={styles.tdPlayerMetaText}>
                                SR {p.sr}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}

                      <Text style={[styles.tdSectionTitle, { marginTop: 20 }]}>
                        🎯 Top Bowlers
                      </Text>
                      {/* TODO(backend): fetch top bowlers leaderboard from API */}
                      {(
                        [] as {
                          rank: number;
                          name: string;
                          team: string;
                          wkts: number;
                          avg: string;
                          econ: string;
                          icon: string;
                        }[]
                      ).map((p) => (
                        <View key={p.rank} style={styles.tdPlayerCard}>
                          <Text style={styles.tdPlayerIcon}>{p.icon}</Text>
                          <View style={styles.tdPlayerInfo}>
                            <Text style={styles.tdPlayerName}>{p.name}</Text>
                            <Text style={styles.tdPlayerTeam}>{p.team}</Text>
                          </View>
                          <View style={styles.tdPlayerStats}>
                            <Text style={styles.tdPlayerStatMain}>
                              {p.wkts}
                            </Text>
                            <Text style={styles.tdPlayerStatSub}>Wickets</Text>
                            <View style={styles.tdPlayerMeta}>
                              <Text style={styles.tdPlayerMetaText}>
                                Avg {p.avg}
                              </Text>
                              <Text style={styles.tdPlayerMetaText}>
                                Econ {p.econ}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))}
                      <View style={{ height: 80 }} />
                    </View>
                  </ScrollView>

                  {/* Slide 4: Teams */}
                  <ScrollView
                    style={{ width: SCREEN_WIDTH }}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.tdSection}>
                      {/* Simple Team Management Options */}
                      <View style={styles.simpleTeamMgmtContainer}>
                        {/* Add Teams Button */}
                        <TouchableOpacity
                          style={styles.simpleTeamMgmtButton}
                          onPress={() => {
                            console.log(
                              "Add Teams pressed - navigating to Add Teams & Players page",
                            );
                            setCurrentView("addTeamsPlayers");
                          }}
                        >
                          <LinearGradient
                            colors={["#B71C1C", "#8B0000"]}
                            style={styles.simpleTeamMgmtButtonGradient}
                          >
                            <Ionicons
                              name="people-outline"
                              size={24}
                              color="#FFF"
                            />
                            <Text style={styles.simpleTeamMgmtButtonText}>
                              Add Teams
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>

                        {/* Invite Teams via Link Button */}
                        <TouchableOpacity
                          style={styles.simpleTeamMgmtButton}
                          onPress={() =>
                            Alert.alert(
                              "Invite Teams",
                              "Tournament link will be generated and shared",
                            )
                          }
                        >
                          <LinearGradient
                            colors={["#C62828", "#047857"]}
                            style={styles.simpleTeamMgmtButtonGradient}
                          >
                            <Ionicons
                              name="link-outline"
                              size={24}
                              color="#FFF"
                            />
                            <Text style={styles.simpleTeamMgmtButtonText}>
                              Invite Teams via Link
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>

                      <View style={{ height: 80 }} />
                    </View>
                  </ScrollView>
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
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000"]}
                      style={styles.tdBottomBtnGrad}
                    >
                      <Ionicons
                        name="settings-outline"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.tdBottomBtnText}>
                        Manage Tournament
                      </Text>
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
                  <Text style={styles.tournamentDashboardTitle}>
                    {tournamentName || "Mumbai Premier League 2024"}
                  </Text>

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
                      <View
                        style={[
                          styles.tournamentProgressFill,
                          { width: "65%" },
                        ]}
                      />
                    </View>
                    <Text style={styles.tournamentProgressText}>
                      65% Complete
                    </Text>
                  </View>
                </LinearGradient>

                {/* Dashboard Tabs */}
                <View style={styles.tournamentTabsContainer}>
                  {["matches", "points", "leaderboard", "teams"].map((tab) => (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tournamentTab,
                        activeTournamentTab === tab &&
                          styles.tournamentTabActive,
                      ]}
                      onPress={() => setActiveTournamentTab(tab)}
                    >
                      <Text
                        style={[
                          styles.tournamentTabText,
                          activeTournamentTab === tab &&
                            styles.tournamentTabTextActive,
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
                  <ScrollView
                    style={styles.tournamentTabContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.tournamentSectionTitle}>
                      Upcoming Matches
                    </Text>

                    {/* TODO(backend): fetch upcoming tournament matches from API */}
                    {(
                      [] as {
                        id: number;
                        team1: string;
                        team1Initial: string;
                        team1Color: string;
                        team2: string;
                        team2Initial: string;
                        team2Color: string;
                        date: string;
                        time: string;
                        venue: string;
                      }[]
                    ).map((match) => (
                      <View key={match.id} style={styles.tournamentMatchCard}>
                        {/* Match Header */}
                        <View style={styles.tournamentMatchHeader}>
                          <View style={styles.upcomingBadge}>
                            <Text style={styles.upcomingBadgeText}>
                              UPCOMING
                            </Text>
                          </View>
                          <Text style={styles.tournamentMatchTime}>
                            {match.date} · {match.time}
                          </Text>
                        </View>

                        {/* Teams Row */}
                        <View style={styles.tournamentMatchTeams}>
                          {/* Team 1 */}
                          <View style={styles.tournamentTeamSection}>
                            <View
                              style={[
                                styles.tournamentTeamCircle,
                                { backgroundColor: match.team1Color },
                              ]}
                            >
                              <Text style={styles.tournamentTeamInitial}>
                                {match.team1Initial}
                              </Text>
                            </View>
                            <Text style={styles.tournamentTeamName}>
                              {match.team1}
                            </Text>
                          </View>

                          {/* VS */}
                          <View style={styles.tournamentVsContainer}>
                            <Text style={styles.tournamentVsText}>vs</Text>
                          </View>

                          {/* Team 2 */}
                          <View style={styles.tournamentTeamSection}>
                            <View
                              style={[
                                styles.tournamentTeamCircle,
                                { backgroundColor: match.team2Color },
                              ]}
                            >
                              <Text style={styles.tournamentTeamInitial}>
                                {match.team2Initial}
                              </Text>
                            </View>
                            <Text style={styles.tournamentTeamName}>
                              {match.team2}
                            </Text>
                          </View>

                          {/* Action Menu */}
                          <TouchableOpacity style={styles.tournamentMatchMenu} onPress={() => Alert.alert("Match Options", "Edit, reschedule, or cancel this match")}>
                            <Ionicons
                              name="ellipsis-vertical"
                              size={20}
                              color="#666"
                            />
                          </TouchableOpacity>
                        </View>

                        {/* Venue */}
                        <View style={styles.tournamentMatchVenue}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#999"
                          />
                          <Text style={styles.tournamentMatchVenueText}>
                            {match.venue}
                          </Text>
                        </View>
                      </View>
                    ))}

                    <View style={{ height: 100 }} />
                  </ScrollView>
                )}

                {activeTournamentTab === "points" && (
                  <ScrollView
                    style={styles.dashboardTabContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.dashboardSectionTitle}>
                      Points Table
                    </Text>
                    <View style={styles.pointsTable}>
                      {/* Table Header */}
                      <LinearGradient
                        colors={["#E63946", "#C1121F"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.pointsTableHeader}
                      >
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                            { flex: 0.8 },
                          ]}
                        >
                          #
                        </Text>
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                            { flex: 2.5 },
                          ]}
                        >
                          Team
                        </Text>
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                          ]}
                        >
                          P
                        </Text>
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                          ]}
                        >
                          W
                        </Text>
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                          ]}
                        >
                          L
                        </Text>
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                          ]}
                        >
                          NRR
                        </Text>
                        <Text
                          style={[
                            styles.pointsTableCell,
                            styles.pointsTableHeaderCell,
                            { fontWeight: "bold" },
                          ]}
                        >
                          Pts
                        </Text>
                      </LinearGradient>

                      {/* Table Rows */}
                      {/* TODO(backend): fetch points table from API */}
                      {(
                        [] as {
                          rank: number;
                          team: string;
                          p: number;
                          w: number;
                          l: number;
                          nrr: string;
                          pts: number;
                          qualified: boolean;
                        }[]
                      ).map((row, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.pointsTableRow,
                            row.qualified && styles.pointsTableRowQualified,
                          ]}
                        >
                          <View style={[styles.pointsTableCell, { flex: 0.8 }]}>
                            <View
                              style={[
                                styles.rankBadge,
                                row.rank === 1 && {
                                  backgroundColor: "#FFD700",
                                },
                                row.rank === 2 && {
                                  backgroundColor: "#C0C0C0",
                                },
                                row.rank === 3 && {
                                  backgroundColor: "#CD7F32",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.rankText,
                                  row.rank <= 3 && { color: "#FFF" },
                                ]}
                              >
                                {row.rank}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.pointsTableCell,
                              {
                                flex: 2.5,
                                flexDirection: "row",
                                alignItems: "center",
                              },
                            ]}
                          >
                            <LinearGradient
                              colors={["#B71C1C", "#138496"]}
                              style={styles.teamIconSmall}
                            >
                              <Text style={styles.teamIconSmallText}>
                                {row.team.charAt(5)}
                              </Text>
                            </LinearGradient>
                            <Text style={styles.pointsTableTeamCell}>
                              {row.team}
                            </Text>
                          </View>
                          <Text style={styles.pointsTableCell}>{row.p}</Text>
                          <Text
                            style={[
                              styles.pointsTableCell,
                              { color: "#10B981", fontWeight: "600" },
                            ]}
                          >
                            {row.w}
                          </Text>
                          <Text
                            style={[
                              styles.pointsTableCell,
                              { color: "#E63946", fontWeight: "600" },
                            ]}
                          >
                            {row.l}
                          </Text>
                          <Text
                            style={[
                              styles.pointsTableCell,
                              {
                                color: row.nrr.startsWith("+")
                                  ? "#10B981"
                                  : "#E63946",
                              },
                            ]}
                          >
                            {row.nrr}
                          </Text>
                          <Text
                            style={[
                              styles.pointsTableCell,
                              styles.pointsTablePtsCell,
                            ]}
                          >
                            {row.pts}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Legend */}
                    <View style={styles.pointsLegend}>
                      <View style={styles.legendItem}>
                        <View
                          style={[
                            styles.legendDot,
                            { backgroundColor: "#10B981" },
                          ]}
                        />
                        <Text style={styles.legendText}>
                          Qualified for playoffs
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <Text style={styles.legendLabel}>
                          P - Played | W - Won | L - Lost | NRR - Net Run Rate
                        </Text>
                      </View>
                    </View>
                    <View style={{ height: 20 }} />
                  </ScrollView>
                )}

                {activeTournamentTab === "leaderboard" && (
                  <ScrollView
                    style={styles.dashboardTabContent}
                    showsVerticalScrollIndicator={false}
                  >
                    {/* Top Batsmen */}
                    <Text style={styles.dashboardSectionTitle}>
                      🏏 Top Batsmen
                    </Text>
                    {/* TODO(backend): fetch top batsmen from API */}
                    {(
                      [] as {
                        rank: number;
                        name: string;
                        team: string;
                        runs: number;
                        avg: string;
                        sr: string;
                        icon: string;
                      }[]
                    ).map((player) => (
                      <View key={player.rank} style={styles.leaderboardItem}>
                        <LinearGradient
                          colors={["#FFF", "#F8F8F8"]}
                          style={styles.leaderboardItemGradient}
                        >
                          <View style={styles.leaderboardRank}>
                            <Text style={styles.leaderboardRankText}>
                              {player.icon}
                            </Text>
                          </View>
                          <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardName}>
                              {player.name}
                            </Text>
                            <Text style={styles.leaderboardTeam}>
                              {player.team}
                            </Text>
                          </View>
                          <View style={styles.leaderboardStats}>
                            <Text style={styles.leaderboardRuns}>
                              {player.runs}
                            </Text>
                            <Text style={styles.leaderboardRunsLabel}>
                              Runs
                            </Text>
                            <View style={styles.leaderboardSubStats}>
                              <Text style={styles.leaderboardSubStat}>
                                Avg: {player.avg}
                              </Text>
                              <Text style={styles.leaderboardSubStat}>
                                SR: {player.sr}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}

                    {/* Top Bowlers */}
                    <Text
                      style={[styles.dashboardSectionTitle, { marginTop: 24 }]}
                    >
                      🎯 Top Bowlers
                    </Text>
                    {/* TODO(backend): fetch top bowlers from API */}
                    {(
                      [] as {
                        rank: number;
                        name: string;
                        team: string;
                        wickets: number;
                        avg: string;
                        econ: string;
                        icon: string;
                      }[]
                    ).map((player) => (
                      <View key={player.rank} style={styles.leaderboardItem}>
                        <LinearGradient
                          colors={["#FFF", "#F8F8F8"]}
                          style={styles.leaderboardItemGradient}
                        >
                          <View style={styles.leaderboardRank}>
                            <Text style={styles.leaderboardRankText}>
                              {player.icon}
                            </Text>
                          </View>
                          <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardName}>
                              {player.name}
                            </Text>
                            <Text style={styles.leaderboardTeam}>
                              {player.team}
                            </Text>
                          </View>
                          <View style={styles.leaderboardStats}>
                            <Text style={styles.leaderboardRuns}>
                              {player.wickets}
                            </Text>
                            <Text style={styles.leaderboardRunsLabel}>
                              Wickets
                            </Text>
                            <View style={styles.leaderboardSubStats}>
                              <Text style={styles.leaderboardSubStat}>
                                Avg: {player.avg}
                              </Text>
                              <Text style={styles.leaderboardSubStat}>
                                Econ: {player.econ}
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}

                    {/* Most Valuable Players */}
                    <Text
                      style={[styles.dashboardSectionTitle, { marginTop: 24 }]}
                    >
                      ⭐ Most Valuable Players
                    </Text>
                    {/* TODO(backend): fetch MVP leaderboard from API */}
                    {(
                      [] as {
                        rank: number;
                        name: string;
                        team: string;
                        points: number;
                        role: string;
                      }[]
                    ).map((player) => (
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
                              <Text style={styles.mvpBadgeText}>
                                {player.rank}
                              </Text>
                            </LinearGradient>
                          </View>
                          <View style={styles.leaderboardInfo}>
                            <Text style={styles.leaderboardName}>
                              {player.name}
                            </Text>
                            <Text style={styles.leaderboardTeam}>
                              {player.team} • {player.role}
                            </Text>
                          </View>
                          <View style={styles.leaderboardStats}>
                            <Text style={styles.leaderboardRuns}>
                              {player.points}
                            </Text>
                            <Text style={styles.leaderboardRunsLabel}>
                              Points
                            </Text>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}
                    <View style={{ height: 20 }} />
                  </ScrollView>
                )}

                {activeTournamentTab === "teams" && (
                  <ScrollView
                    style={styles.dashboardTabContent}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.dashboardSectionTitle}>
                      Tournament Teams
                    </Text>
                    {[
                      {
                        id: 1,
                        name: "Team A",
                        players: 11,
                        captain: "Virat Kohli",
                        status: "Active",
                      },
                      {
                        id: 2,
                        name: "Team B",
                        players: 11,
                        captain: "Rohit Sharma",
                        status: "Active",
                      },
                      {
                        id: 3,
                        name: "Team C",
                        players: 11,
                        captain: "Suresh Raina",
                        status: "Active",
                      },
                      {
                        id: 4,
                        name: "Team D",
                        players: 11,
                        captain: "MS Dhoni",
                        status: "Pending",
                      },
                    ].map((team) => (
                      <View key={team.id} style={styles.teamItemCard}>
                        <LinearGradient
                          colors={["#FFF", "#F8F8F8"]}
                          style={styles.teamItemGradient}
                        >
                          <View style={styles.teamItemHeader}>
                            <LinearGradient
                              colors={["#B71C1C", "#8B0000"]}
                              style={styles.teamItemIcon}
                            >
                              <Text style={styles.teamItemIconText}>
                                {team.name.charAt(5)}
                              </Text>
                            </LinearGradient>
                            <View style={styles.teamItemInfo}>
                              <Text style={styles.teamItemName}>
                                {team.name}
                              </Text>
                              <Text style={styles.teamItemCaptain}>
                                Captain: {team.captain}
                              </Text>
                            </View>
                            <LinearGradient
                              colors={
                                team.status === "Active"
                                  ? ["#B71C1C", "#8B0000"]
                                  : ["#C62828", "#8B0000"]
                              }
                              style={styles.teamItemStatus}
                            >
                              <Text style={styles.teamItemStatusText}>
                                {team.status}
                              </Text>
                            </LinearGradient>
                          </View>
                          <View style={styles.teamItemStats}>
                            <View style={styles.teamItemStat}>
                              <Ionicons
                                name="people"
                                size={14}
                                color="#B71C1C"
                              />
                              <Text style={styles.teamItemStatText}>
                                {team.players} Players
                              </Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    ))}

                    <Text
                      style={[styles.dashboardSectionTitle, { marginTop: 20 }]}
                    >
                      Add Teams & Players
                    </Text>
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
                          Alert.alert(
                            "Team Link",
                            "Share invite link with teams and players",
                          );
                        }}
                      >
                        <LinearGradient
                          colors={["#B71C1C", "#8B0000"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.modalOptionGradient}
                        >
                          <View style={styles.modalOptionIconCircle}>
                            <Ionicons name="link" size={20} color="#FFF" />
                          </View>
                          <View style={styles.modalOptionTextContainer}>
                            <Text style={styles.modalOptionTitle}>
                              Team Link
                            </Text>
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
                          Alert.alert(
                            "QR Code",
                            "Generate QR code for teams to scan and join",
                          );
                        }}
                      >
                        <LinearGradient
                          colors={["#B71C1C", "#8B0000"]}
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
                          Alert.alert(
                            "From Contacts",
                            "Select teams and players from your contacts",
                          );
                        }}
                      >
                        <LinearGradient
                          colors={["#B71C1C", "#8B0000"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.modalOptionGradient}
                        >
                          <View style={styles.modalOptionIconCircle}>
                            <Ionicons
                              name="person-add"
                              size={20}
                              color="#FFF"
                            />
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
                          Alert.alert(
                            "Add Groups",
                            "Organize teams into groups for tournament structure",
                          );
                        }}
                      >
                        <LinearGradient
                          colors={["#C62828", "#B71C1C"]}
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
                <Text style={styles.addTeamsPlayersTitle}>
                  Add Teams & Players
                </Text>
                <Text style={styles.addTeamsPlayersSubtitle}>
                  Choose how you want to add participants to your tournament
                </Text>

                <ScrollView
                  style={styles.addTeamsPlayersContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Team Link Option */}
                  <TouchableOpacity
                    style={styles.addTeamsOption}
                    onPress={() => {
                      console.log("Add via Team Link");
                      // Generate tournament invite link
                      const tournamentLink =
                        "https://crickbuz.app/join/MPL2024-8X7K";
                      Alert.alert(
                        "Tournament Link Generated",
                        `Your tournament invite link:\n\n${tournamentLink}\n\nShare this link with teams and players to let them join instantly!`,
                        [
                          {
                            text: "Copy Link",
                            onPress: () => {
                              // In a real app, this would copy to clipboard
                              Alert.alert(
                                "Copied!",
                                "Tournament link copied to clipboard",
                              );
                            },
                          },
                          {
                            text: "Share Link",
                            onPress: () => {
                              Alert.alert(
                                "Share",
                                "Link shared via WhatsApp, SMS, and social media!",
                              );
                            },
                          },
                          { text: "Close", style: "cancel" },
                        ],
                      );
                    }}
                  >
                    <LinearGradient
                      colors={["#20B2AA", "#B71C1C"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.addTeamsOptionGradient}
                    >
                      <View style={styles.addTeamsOptionIconCircle}>
                        <Ionicons name="link" size={24} color="#FFF" />
                      </View>
                      <View style={styles.addTeamsOptionTextContainer}>
                        <Text style={styles.addTeamsOptionTitle}>
                          Team Link
                        </Text>
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
                          {
                            text: "Share QR Code",
                            onPress: () => {
                              Alert.alert(
                                "Share",
                                "QR Code shared via WhatsApp, SMS, and Email!",
                              );
                            },
                          },
                          {
                            text: "Save to Gallery",
                            onPress: () => {
                              Alert.alert(
                                "Saved",
                                "QR Code saved to your photo gallery!",
                              );
                            },
                          },
                          { text: "Close", style: "cancel" },
                        ],
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
                                    [{ text: "OK" }],
                                  );
                                }, 1000);
                              },
                            },
                          ],
                        );
                      } catch (error) {
                        Alert.alert(
                          "Error",
                          "Unable to access contacts. Please check permissions.",
                        );
                      }
                    }}
                  >
                    <LinearGradient
                      colors={["#10B981", "#C62828"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.addTeamsOptionGradient}
                    >
                      <View style={styles.addTeamsOptionIconCircle}>
                        <Ionicons name="person-add" size={24} color="#FFF" />
                      </View>
                      <View style={styles.addTeamsOptionTextContainer}>
                        <Text style={styles.addTeamsOptionTitle}>
                          From Contacts
                        </Text>
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
                      colors={["#EF4444", "#C62828"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.addTeamsOptionGradient}
                    >
                      <View style={styles.addTeamsOptionIconCircle}>
                        <Ionicons name="add-circle" size={24} color="#FFF" />
                      </View>
                      <View style={styles.addTeamsOptionTextContainer}>
                        <Text style={styles.addTeamsOptionTitle}>
                          Add New Team
                        </Text>
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

                <ScrollView
                  style={styles.teamsSelectionContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* My Teams Section */}
                  <Text style={styles.teamsSectionTitle}>My Teams</Text>

                  {[
                    {
                      id: 1,
                      name: "Mumbai Warriors",
                      players: 15,
                      matches: 12,
                      wins: 8,
                      color: "#B71C1C",
                    },
                    {
                      id: 2,
                      name: "Delhi Capitals",
                      players: 14,
                      matches: 10,
                      wins: 6,
                      color: "#C62828",
                    },
                    {
                      id: 3,
                      name: "Chennai Kings",
                      players: 16,
                      matches: 8,
                      wins: 5,
                      color: "#C62828",
                    },
                    {
                      id: 4,
                      name: "Bangalore Riders",
                      players: 13,
                      matches: 6,
                      wins: 4,
                      color: "#7C3AED",
                    },
                    {
                      id: 5,
                      name: "Kolkata Knights",
                      players: 15,
                      matches: 9,
                      wins: 7,
                      color: "#F59E0B",
                    },
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
                            {
                              text: "Confirm Selection",
                              onPress: () => {
                                Alert.alert(
                                  "Success",
                                  `${team.name} has been selected for your match!`,
                                );
                                setCurrentView("matches");
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <View
                        style={[
                          styles.teamSelectionIcon,
                          { backgroundColor: team.color },
                        ]}
                      >
                        <Text style={styles.teamSelectionInitial}>
                          {team.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.teamSelectionInfo}>
                        <Text style={styles.teamSelectionName}>
                          {team.name}
                        </Text>
                        <Text style={styles.teamSelectionStats}>
                          {team.players} players • {team.matches} matches •{" "}
                          {team.wins} wins
                        </Text>
                      </View>
                      <View style={styles.teamSelectionAction}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={24}
                          color="#B71C1C"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Recently Played Teams Section */}
                  <Text style={[styles.teamsSectionTitle, { marginTop: 30 }]}>
                    Recently Played
                  </Text>

                  {[
                    {
                      id: 6,
                      name: "Pune Superstars",
                      players: 11,
                      lastPlayed: "2 days ago",
                      color: "#EF4444",
                    },
                    {
                      id: 7,
                      name: "Hyderabad Heroes",
                      players: 13,
                      lastPlayed: "1 week ago",
                      color: "#10B981",
                    },
                    {
                      id: 8,
                      name: "Rajasthan Royals",
                      players: 12,
                      lastPlayed: "2 weeks ago",
                      color: "#8B5CF6",
                    },
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
                            {
                              text: "Select as Opponent",
                              onPress: () => {
                                Alert.alert(
                                  "Success",
                                  `${team.name} selected as opponent team!`,
                                );
                                setCurrentView("matches");
                              },
                            },
                          ],
                        );
                      }}
                    >
                      <View
                        style={[
                          styles.teamSelectionIcon,
                          { backgroundColor: team.color },
                        ]}
                      >
                        <Text style={styles.teamSelectionInitial}>
                          {team.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.teamSelectionInfo}>
                        <Text style={styles.teamSelectionName}>
                          {team.name}
                        </Text>
                        <Text style={styles.teamSelectionStats}>
                          {team.players} players • Last played {team.lastPlayed}
                        </Text>
                      </View>
                      <View style={styles.teamSelectionAction}>
                        <Ionicons
                          name="add-circle-outline"
                          size={24}
                          color="#666"
                        />
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
                        colors={["#B71C1C", "#8B0000"]}
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
                        colors={["#B71C1C", "#8B0000"]}
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
                        colors={["#B71C1C", "#8B0000"]}
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
                    colors={["#FBE9E7", "#FBE9E7", "#FFCDD2"]}
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
                              matchType === type.id &&
                                styles.matchTypePillTextActive,
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
                    Number of Overs{" "}
                    {(matchType === "limited" || matchType === "box") && "*"}
                  </Text>

                  {/* Overs Input */}
                  <View style={styles.inputContainer}>
                    <Ionicons name="timer-outline" size={18} color="#B71C1C" />
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
                        colors={["#B71C1C", "#8B0000", "#8B0000"]}
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
                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#FFF"
                          />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.locationEnabledContainer}>
                      <LinearGradient
                        colors={["#FBE9E7", "#FFCDD2"]}
                        style={styles.locationEnabledHeader}
                      >
                        <View style={styles.locationEnabledBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#B71C1C"
                          />
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
                        <Text style={styles.groundsListTitle}>
                          Select Ground
                        </Text>
                        <View style={styles.groundsScrollWrapper}>
                          <ScrollView
                            ref={scrollViewRef2}
                            style={styles.groundsList}
                            showsVerticalScrollIndicator={false}
                            nestedScrollEnabled={true}
                            onScroll={(event) => {
                              const {
                                contentOffset,
                                contentSize,
                                layoutMeasurement,
                              } = event.nativeEvent;
                              const scrollPercentage =
                                contentOffset.y /
                                (contentSize.height - layoutMeasurement.height);
                              const indicatorHeight = 60; // Height of the scroll indicator
                              const trackHeight = 240 - indicatorHeight; // Max scroll area
                              setScrollIndicatorPosition(
                                scrollPercentage * trackHeight,
                              );
                            }}
                            scrollEventThrottle={16}
                          >
                            {nearbyGrounds.map((ground, index) => (
                              <TouchableOpacity
                                key={ground.id}
                                style={[
                                  styles.groundCard,
                                  selectedGround === ground.name &&
                                    styles.groundCardActive,
                                ]}
                                onPress={() => {
                                  setSelectedGround(ground.name);
                                  setSelectedCity(ground.city);
                                }}
                              >
                                <LinearGradient
                                  colors={
                                    selectedGround === ground.name
                                      ? ["#FFCDD2", "#EF9A9A"]
                                      : ["#FFFFFF", "#F8F9FA"]
                                  }
                                  style={styles.groundCardGradient}
                                >
                                  <View style={styles.groundCardLeft}>
                                    <View
                                      style={[
                                        styles.groundNumberBadge,
                                        selectedGround === ground.name &&
                                          styles.groundNumberBadgeActive,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.groundNumberText,
                                          selectedGround === ground.name &&
                                            styles.groundNumberTextActive,
                                        ]}
                                      >
                                        {index + 1}
                                      </Text>
                                    </View>
                                    <View style={styles.groundInfo}>
                                      <Text
                                        style={[
                                          styles.groundName,
                                          selectedGround === ground.name &&
                                            styles.groundNameActive,
                                        ]}
                                      >
                                        {ground.name}
                                      </Text>
                                      <View style={styles.groundMetaRow}>
                                        <View style={styles.groundMetaItem}>
                                          <Ionicons
                                            name="navigate"
                                            size={12}
                                            color="#666"
                                          />
                                          <Text style={styles.groundMetaText}>
                                            {ground.distance}
                                          </Text>
                                        </View>
                                        <View
                                          style={styles.groundMetaDivider}
                                        />
                                        <View style={styles.groundMetaItem}>
                                          <Ionicons
                                            name="layers"
                                            size={12}
                                            color="#666"
                                          />
                                          <Text style={styles.groundMetaText}>
                                            {ground.pitchType.toUpperCase()}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                  {selectedGround === ground.name && (
                                    <View style={styles.selectedCheckmark}>
                                      <Ionicons
                                        name="checkmark-circle"
                                        size={24}
                                        color="#B71C1C"
                                      />
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
                                  transform: [
                                    { translateY: scrollIndicatorPosition },
                                  ],
                                },
                              ]}
                            >
                              <LinearGradient
                                colors={["#B71C1C", "#8B0000"]}
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
                      <CitySearchDropdown
                        value={selectedCity}
                        onSelect={setSelectedCity}
                        placeholder="Select City/Town"
                      />

                      <View style={[styles.inputContainer, { marginTop: 10 }]}>
                        <Ionicons
                          name="location-outline"
                          size={18}
                          color="#B71C1C"
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Ground Name"
                          placeholderTextColor="#999"
                          value={selectedGround}
                          onChangeText={setSelectedGround}
                        />
                      </View>
                    </>
                  )}
                </View>

                {/* Date & Time */}
                <View style={styles.setupSection}>
                  <Text style={styles.setupSectionTitle}>Date & Time *</Text>
                  <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                      style={[styles.inputContainer, { flex: 1 }]}
                      onPress={() => setShowMatchDatePicker(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={18}
                        color="#B71C1C"
                      />
                      <Text
                        style={[styles.input, !matchDate && { color: "#999" }]}
                      >
                        {matchDate || "DD/MM/YYYY"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.inputContainer, { flex: 1 }]}
                      onPress={() => setShowMatchTimePicker(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="time-outline" size={18} color="#B71C1C" />
                      <Text
                        style={[styles.input, !matchTime && { color: "#999" }]}
                      >
                        {matchTime || "HH:MM"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {/* Match Duration */}
                  <Text
                    style={[
                      styles.setupSectionTitle,
                      { marginTop: 12, fontSize: 14 },
                    ]}
                  >
                    Match Duration *
                  </Text>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowDurationPicker(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="hourglass-outline"
                      size={18}
                      color="#B71C1C"
                    />
                    <Text
                      style={[
                        styles.input,
                        !matchDuration && { color: "#999" },
                      ]}
                    >
                      {matchDuration || "HH:MM"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {showMatchDatePicker && (
                  <DateTimePicker
                    value={matchDateObj}
                    mode="date"
                    display="default"
                    onChange={(_, selected) => {
                      setShowMatchDatePicker(false);
                      if (selected) {
                        setMatchDateObj(selected);
                        const d = selected
                          .getDate()
                          .toString()
                          .padStart(2, "0");
                        const m = (selected.getMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const y = selected.getFullYear();
                        setMatchDate(`${d}/${m}/${y}`);
                      }
                    }}
                  />
                )}

                {showMatchTimePicker && (
                  <DateTimePicker
                    value={matchTimeObj}
                    mode="time"
                    is24Hour
                    display="spinner"
                    onChange={(_, selected) => {
                      setShowMatchTimePicker(false);
                      if (selected) {
                        setMatchTimeObj(selected);
                        const h = selected
                          .getHours()
                          .toString()
                          .padStart(2, "0");
                        const min = selected
                          .getMinutes()
                          .toString()
                          .padStart(2, "0");
                        setMatchTime(`${h}:${min}`);
                      }
                    }}
                  />
                )}

                {showDurationPicker && (
                  <DateTimePicker
                    value={durationObj}
                    mode="time"
                    is24Hour
                    display="spinner"
                    onChange={(_, selected) => {
                      setShowDurationPicker(false);
                      if (selected) {
                        setDurationObj(selected);
                        const h = selected
                          .getHours()
                          .toString()
                          .padStart(2, "0");
                        const min = selected
                          .getMinutes()
                          .toString()
                          .padStart(2, "0");
                        setMatchDuration(`${h}:${min}`);
                      }
                    }}
                  />
                )}

                {/* Match Officials */}
                <View style={styles.setupSection}>
                  <Text style={styles.setupSectionTitle}>Match Officials</Text>
                  <Text
                    style={{ fontSize: 12, color: "#9E9E9E", marginBottom: 8 }}
                  >
                    Optional
                  </Text>

                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={18} color="#B71C1C" />
                    <TextInput
                      style={styles.input}
                      placeholder="Umpire Name"
                      placeholderTextColor="#999"
                      value={umpire1}
                      onChangeText={setUmpire1}
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

                    if (
                      (matchType === "limited" || matchType === "box") &&
                      !numberOfOvers.trim()
                    ) {
                      Alert.alert(
                        "Required Field",
                        "Please enter number of overs",
                      );
                      return;
                    }

                    if (
                      (matchType === "limited" || matchType === "box") &&
                      numberOfOvers.trim()
                    ) {
                      const overs = parseInt(numberOfOvers);
                      if (isNaN(overs) || overs < 1 || overs > 50) {
                        Alert.alert(
                          "Invalid Input",
                          "Please enter a valid number of overs (1-50)",
                        );
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
                      ballType,
                      date: matchDate,
                      time: matchTime,
                      duration: matchDuration,
                    });

                    // Navigate to toss page
                    setCurrentView("tossPage");
                  }}
                >
                  <LinearGradient
                    colors={["#B71C1C", "#8B0000", "#8B0000"]}
                    style={styles.startMatchButtonGradient}
                  >
                    <Ionicons name="disc" size={28} color="#FFF" />
                    <Text style={styles.startMatchButtonText}>
                      {"Let's Toss"}
                    </Text>
                    <Ionicons name="arrow-forward" size={24} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
              </View>
            ) : currentView === "tossPage" ? (
              /* Toss Page View */
              <ScrollView
                style={styles.tossContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.tossHero}>
                  <View style={styles.coinStage}>
                    <View style={styles.coinOuter}>
                      <View style={styles.coinInner}>
                        <Ionicons name="disc" size={38} color="#FDE68A" />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.tossTitle}>Match toss</Text>
                  <Text style={styles.tossSubtitle}>
                    Select the toss winner and their first innings choice.
                  </Text>
                </View>

                {/* Team Selection for Toss Winner */}
                <View style={styles.tossTeamsContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tossTeamCard,
                      tossWinner === "A" && styles.tossTeamCardSelected,
                    ]}
                    onPress={() => setTossWinner("A")}
                  >
                    <View style={styles.tossTeamJersey}>
                      <Ionicons
                        name="shirt"
                        size={38}
                        color={tossWinner === "A" ? "#B71C1C" : "#777"}
                      />
                      {tossWinner === "A" && (
                        <View style={styles.tossCheckBadge}>
                          <Ionicons name="checkmark" size={13} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.tossTeamName,
                        tossWinner === "A" && styles.tossTeamNameSelected,
                      ]}
                    >
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
                    <View style={styles.tossTeamJersey}>
                      <Ionicons
                        name="shirt"
                        size={38}
                        color={tossWinner === "B" ? "#B71C1C" : "#777"}
                      />
                      {tossWinner === "B" && (
                        <View style={styles.tossCheckBadge}>
                          <Ionicons name="checkmark" size={13} color="#FFF" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.tossTeamName,
                        tossWinner === "B" && styles.tossTeamNameSelected,
                      ]}
                    >
                      {teamBName}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Toss Decision Section */}
                {tossWinner && (
                  <View style={styles.tossDecisionSection}>
                    <Text style={styles.tossDecisionTitle}>
                      {getTossWinnerName()} elected to
                    </Text>

                    <View style={styles.tossDecisionContainer}>
                      <TouchableOpacity
                        style={[
                          styles.tossDecisionCard,
                          tossDecision === "bat" &&
                            styles.tossDecisionCardSelected,
                        ]}
                        onPress={() => setTossDecision("bat")}
                      >
                        <View style={styles.cricketActionFigure}>
                          <View style={styles.figureHead} />
                          <View style={styles.figureBody} />
                          <View style={styles.figureLegs} />
                          <View style={styles.batHandle} />
                        </View>
                        <Text
                          style={[
                            styles.tossDecisionText,
                            tossDecision === "bat" &&
                              styles.tossDecisionTextSelected,
                          ]}
                        >
                          BAT
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.tossDecisionCard,
                          tossDecision === "bowl" &&
                            styles.tossDecisionCardSelected,
                        ]}
                        onPress={() => setTossDecision("bowl")}
                      >
                        <View style={styles.cricketActionFigure}>
                          <View style={styles.figureHead} />
                          <View
                            style={[styles.figureBody, styles.bowlerFigureBody]}
                          />
                          <View style={styles.figureLegs} />
                          <View style={styles.bowlingArm} />
                          <View style={styles.bowlingBall} />
                        </View>
                        <Text
                          style={[
                            styles.tossDecisionText,
                            tossDecision === "bowl" &&
                              styles.tossDecisionTextSelected,
                          ]}
                        >
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
                      const winnerTeam =
                        tossWinner === "A" ? teamAName : teamBName;
                      console.log(
                        `${winnerTeam} won the toss and elected to ${tossDecision.toUpperCase()} first.`,
                      );

                      // Navigate to player selection
                      setCurrentView("playerSelection");
                    }}
                  >
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000", "#8B0000"]}
                      style={styles.startMatchButtonGradient}
                    >
                      <Ionicons name="play-circle" size={28} color="#FFF" />
                      <Text style={styles.startMatchButtonText}>
                        Start Match
                      </Text>
                      <Ionicons name="arrow-forward" size={24} color="#FFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
              </ScrollView>
            ) : currentView === "playerSelection" ? (
              /* Player Selection Page */
              <ScrollView
                style={styles.playerSelectionContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.playerSelectionHero}>
                  <Text style={styles.playerSelectionTitle}>
                    Opening lineup
                  </Text>
                  <Text style={styles.playerSelectionSubtitle}>
                    Confirm the two batters and the bowler before scoring
                    starts.
                  </Text>
                </View>

                {/* Batting Team Section */}
                <View style={styles.playerSection}>
                  <Text style={styles.playerSectionTitle}>
                    Batting - {getBattingTeamName()}
                  </Text>

                  {/* Striker Selection */}
                  <View style={styles.playerSelectionRow}>
                    <TouchableOpacity
                      style={[
                        styles.playerSelectionCard,
                        selectedStriker && styles.playerSelectionCardSelected,
                      ]}
                      onPress={() => {
                        setPlayerModalType("striker");
                        setShowPlayerModal(true);
                      }}
                    >
                      {selectedStriker?.image ? (
                        <Image
                          source={{ uri: selectedStriker.image }}
                          style={styles.selectionPlayerImage}
                        />
                      ) : (
                        <View style={styles.playerRoleFigure}>
                          <View style={styles.figureHead} />
                          <View style={styles.figureBody} />
                          <View style={styles.batHandle} />
                        </View>
                      )}
                      <Text style={styles.playerSelectionLabel}>
                        Select Striker
                      </Text>
                      {selectedStriker && (
                        <Text style={styles.selectedPlayerName}>
                          {selectedStriker.name}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.playerSelectionCard,
                        selectedNonStriker &&
                          styles.playerSelectionCardSelected,
                      ]}
                      onPress={() => {
                        setPlayerModalType("nonStriker");
                        setShowPlayerModal(true);
                      }}
                    >
                      {selectedNonStriker?.image ? (
                        <Image
                          source={{ uri: selectedNonStriker.image }}
                          style={styles.selectionPlayerImage}
                        />
                      ) : (
                        <View style={styles.playerRoleFigure}>
                          <View style={styles.figureHead} />
                          <View style={styles.figureBody} />
                          <View style={styles.figureLegs} />
                        </View>
                      )}
                      <Text style={styles.playerSelectionLabel}>
                        Select Non-striker
                      </Text>
                      {selectedNonStriker && (
                        <Text style={styles.selectedPlayerName}>
                          {selectedNonStriker.name}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Bowling Team Section */}
                <View style={styles.playerSection}>
                  <Text style={styles.playerSectionTitle}>
                    Bowling - {getBowlingTeamName()}
                  </Text>

                  {/* Bowler Selection */}
                  <View style={styles.playerSelectionRow}>
                    <TouchableOpacity
                      style={[
                        styles.playerSelectionCard,
                        styles.bowlerCard,
                        selectedBowler && styles.playerSelectionCardSelected,
                      ]}
                      onPress={() => {
                        setPlayerModalType("bowler");
                        setShowPlayerModal(true);
                      }}
                    >
                      {selectedBowler?.image ? (
                        <Image
                          source={{ uri: selectedBowler.image }}
                          style={styles.selectionPlayerImage}
                        />
                      ) : (
                        <View style={styles.playerRoleFigure}>
                          <View style={styles.figureHead} />
                          <View
                            style={[styles.figureBody, styles.bowlerFigureBody]}
                          />
                          <View style={styles.bowlingArm} />
                          <View style={styles.bowlingBall} />
                        </View>
                      )}
                      <Text style={styles.playerSelectionLabel}>
                        Select Bowler
                      </Text>
                      {selectedBowler && (
                        <Text style={styles.selectedPlayerName}>
                          {selectedBowler.name}
                        </Text>
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
                      <Ionicons
                        name="settings-outline"
                        size={20}
                        color="#FFF"
                      />
                      <Text style={styles.matchSettingsButtonText}>
                        Match Settings
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.startScoringButton}
                    onPress={() => {
                      // Validation: Check if all players are selected
                      if (!selectedStriker) {
                        Alert.alert(
                          "Missing Selection",
                          "Please select a striker before starting the match.",
                        );
                        return;
                      }
                      if (!selectedNonStriker) {
                        Alert.alert(
                          "Missing Selection",
                          "Please select a non-striker before starting the match.",
                        );
                        return;
                      }
                      if (!selectedBowler) {
                        Alert.alert(
                          "Missing Selection",
                          "Please select a bowler before starting the match.",
                        );
                        return;
                      }

                      // Navigate to scoring page
                      setCurrentOver(1);
                      setCurrentBall(1);
                      setTotalRuns(0);
                      setTotalWickets(0);
                      setStrikerRuns(0);
                      setStrikerBalls(0);
                      setNonStrikerRuns(0);
                      setNonStrikerBalls(0);
                      setBowlerRuns(0);
                      setBowlerWickets(0);
                      setBowlerOvers("0.0-0-0-0");
                      setScoreHistory([]);
                      setCurrentView("scoringPage");
                    }}
                  >
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000"]}
                      style={styles.startScoringButtonGradient}
                    >
                      <Ionicons name="play-circle" size={20} color="#FFF" />
                      <Text style={styles.startScoringButtonText}>
                        Start Scoring
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
              </ScrollView>
            ) : currentView === "matchSettings" ? (
              /* Match Settings Page */
              <ScrollView
                style={styles.matchSettingsContainer}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.matchSettingsTitle}>Match Settings</Text>

                {/* Wagon Wheel Section */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>WAGON WHEEL</Text>

                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>
                      Disable Wagon Wheel for DOT Ball
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.toggle,
                        wagonWheelDotBall && styles.toggleActive,
                      ]}
                      onPress={() => setWagonWheelDotBall(!wagonWheelDotBall)}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          wagonWheelDotBall && styles.toggleThumbActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>
                      Disable Wagon Wheel for 1s, 2s and 3s
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.toggle,
                        wagonWheel123s && styles.toggleActive,
                      ]}
                      onPress={() => setWagonWheel123s(!wagonWheel123s)}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          wagonWheel123s && styles.toggleThumbActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>
                      Disable Shot Selection
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.toggle,
                        shotSelection && styles.toggleActive,
                      ]}
                      onPress={() => setShotSelection(!shotSelection)}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          shotSelection && styles.toggleThumbActive,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.settingNote}>
                    {
                      "*WW and Shot Selection won't be disabled for boundaries and wickets."
                    }
                  </Text>
                </View>

                {/* Wide/No Ball Rules Section */}
                <View style={styles.settingsSection}>
                  <Text style={styles.settingsSectionTitle}>
                    WIDE/NO BALL RULES
                  </Text>

                  <View style={styles.ruleItem}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleLabel}>A</Text>
                      <Text style={styles.ruleText}>
                        Count Wide as a legal delivery
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.toggle,
                        countWideAsLegal && styles.toggleActive,
                      ]}
                      onPress={() => setCountWideAsLegal(!countWideAsLegal)}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          countWideAsLegal && styles.toggleThumbActive,
                        ]}
                      />
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
                        <Ionicons size={24} color="#666" />
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{wideRuns}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setWideRuns(wideRuns + 1)}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={24}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.ruleItem}>
                    <View style={styles.ruleHeader}>
                      <Text style={styles.ruleLabel}>C</Text>
                      <Text style={styles.ruleText}>
                        Count No Ball as a legal delivery
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.toggle,
                        countNoBallAsLegal && styles.toggleActive,
                      ]}
                      onPress={() => setCountNoBallAsLegal(!countNoBallAsLegal)}
                    >
                      <View
                        style={[
                          styles.toggleThumb,
                          countNoBallAsLegal && styles.toggleThumbActive,
                        ]}
                      />
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
                        onPress={() =>
                          setNoBallRuns(Math.max(0, noBallRuns - 1))
                        }
                      >
                        <Ionicons
                          name="remove-circle-outline"
                          size={24}
                          color="#666"
                        />
                      </TouchableOpacity>
                      <Text style={styles.counterValue}>{noBallRuns}</Text>
                      <TouchableOpacity
                        style={styles.counterButton}
                        onPress={() => setNoBallRuns(noBallRuns + 1)}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={24}
                          color="#666"
                        />
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
                            ignoreRules === option &&
                              styles.ignoreRuleOptionActive,
                          ]}
                          onPress={() => setIgnoreRules(option)}
                        >
                          <Text
                            style={[
                              styles.ignoreRuleOptionText,
                              ignoreRules === option &&
                                styles.ignoreRuleOptionTextActive,
                            ]}
                          >
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
                      [
                        {
                          text: "OK",
                          onPress: () => setCurrentView("playerSelection"),
                        },
                      ],
                    );
                  }}
                >
                  <LinearGradient
                    colors={["#B71C1C", "#8B0000"]}
                    style={styles.saveSettingsButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.saveSettingsButtonText}>
                      Save Settings
                    </Text>
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
                  <Text style={styles.scoringTeamName}>
                    {getBattingTeamName()}
                  </Text>
                  <Text style={styles.scoringTotal}>
                    {totalRuns}/{totalWickets}
                  </Text>
                  <Text style={styles.matchHeaderText}>
                    Overs {getOverLabel(currentOver - 1, currentBall - 1)} /{" "}
                    {numberOfOvers || "?"}
                  </Text>
                  <TouchableOpacity
                    style={styles.endMatchButton}
                    onPress={endMatchAndSave}
                  >
                    <Ionicons name="flag" size={14} color="#FFF" />
                    <Text style={styles.endMatchButtonText}>End Match</Text>
                  </TouchableOpacity>
                </View>

                {/* Batsmen Section */}
                <View style={styles.batsmenSection}>
                  <View style={styles.batsmanCard}>
                    {selectedStriker?.image && (
                      <Image
                        source={{ uri: selectedStriker.image }}
                        style={styles.scoringPlayerImage}
                      />
                    )}
                    <Text style={styles.batsmanName}>
                      {selectedStriker?.name || "Aniket"}
                    </Text>
                    <Text style={styles.batsmanScore}>
                      {strikerRuns}({strikerBalls})
                    </Text>
                  </View>

                  <View style={styles.batsmanCard}>
                    {selectedNonStriker?.image && (
                      <Image
                        source={{ uri: selectedNonStriker.image }}
                        style={styles.scoringPlayerImage}
                      />
                    )}
                    <Text style={styles.batsmanName}>
                      {selectedNonStriker?.name || "Deepu"}
                    </Text>
                    <Text style={styles.batsmanScore}>
                      {nonStrikerRuns}({nonStrikerBalls})
                    </Text>
                  </View>
                </View>

                {/* Bowler Section */}
                <View style={styles.bowlerSection}>
                  {selectedBowler?.image && (
                    <Image
                      source={{ uri: selectedBowler.image }}
                      style={styles.scoringPlayerImage}
                    />
                  )}
                  <Text style={styles.bowlerName}>
                    {selectedBowler?.name || "Kapil Jangir"}
                  </Text>
                  <View style={styles.bowlerStats}>
                    <Ionicons name="stats-chart" size={12} color="#10B981" />
                  </View>
                  <Text style={styles.bowlerFigures}>{bowlerOvers}</Text>
                </View>

                {/* Wicket Type Selection */}
                <View style={styles.wicketTypeSection}>
                  <TouchableOpacity
                    style={[
                      styles.wicketTypeButton,
                      selectedWicketType === "overWicket" &&
                        styles.wicketTypeButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedWicketType(
                        selectedWicketType === "overWicket"
                          ? null
                          : "overWicket",
                      )
                    }
                  >
                    <View style={styles.wicketIcon}>
                      <Ionicons name="stats-chart" size={20} color="#10B981" />
                    </View>
                    <Text style={styles.wicketTypeText}>Over the Wicket</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.wicketTypeButton,
                      selectedWicketType === "betweenWicket" &&
                        styles.wicketTypeButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedWicketType(
                        selectedWicketType === "betweenWicket"
                          ? null
                          : "betweenWicket",
                      )
                    }
                  >
                    <View style={styles.wicketIcon}>
                      <Ionicons name="stats-chart" size={20} color="#10B981" />
                    </View>
                    <Text style={styles.wicketTypeText}>
                      Between the Wicket
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.wicketTypeButton,
                      selectedWicketType === "roundWicket" &&
                        styles.wicketTypeButtonActive,
                    ]}
                    onPress={() =>
                      setSelectedWicketType(
                        selectedWicketType === "roundWicket"
                          ? null
                          : "roundWicket",
                      )
                    }
                  >
                    <View style={styles.wicketIcon}>
                      <Ionicons name="stats-chart" size={20} color="#10B981" />
                    </View>
                    <Text style={styles.wicketTypeText}>Round the Wicket</Text>
                  </TouchableOpacity>
                </View>

                {/* Scoring Buttons */}
                <View style={styles.scoringGrid}>
                  {/* First Row */}
                  <View style={styles.scoringRow}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(0)}
                    >
                      <Text style={styles.scoreButtonText}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(1)}
                    >
                      <Text style={styles.scoreButtonText}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(2)}
                    >
                      <Text style={styles.scoreButtonText}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.scoreButton, styles.undoButton]}
                      onPress={undoScore}
                    >
                      <Text
                        style={[styles.scoreButtonText, styles.undoButtonText]}
                      >
                        UNDO
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Second Row */}
                  <View style={styles.scoringRow}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(3)}
                    >
                      <Text style={styles.scoreButtonText}>3</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(4)}
                    >
                      <Text style={styles.scoreButtonText}>4</Text>
                      <Text style={styles.scoreButtonSubText}>FOUR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(6)}
                    >
                      <Text style={styles.scoreButtonText}>6</Text>
                      <Text style={styles.scoreButtonSubText}>SIX</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyLegalRun(5)}
                    >
                      <Text style={styles.scoreButtonText}>5, 7</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Third Row */}
                  <View style={styles.scoringRow}>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyExtra("WD")}
                    >
                      <Text style={styles.scoreButtonText}>WD</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyExtra("NB")}
                    >
                      <Text style={styles.scoreButtonText}>NB</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.scoreButton}
                      onPress={() => applyExtra("BYE")}
                    >
                      <Text style={styles.scoreButtonText}>BYE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.scoreButton, styles.outButton]}
                      onPress={applyWicket}
                    >
                      <Text
                        style={[styles.scoreButtonText, styles.outButtonText]}
                      >
                        OUT
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => applyExtra("LB")}
                  >
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
                        colors={["#B71C1C", "#8B0000"]}
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

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#B71C1C"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            ) : currentView === "createTeam" ? (
              /* ── Create Team — Premium Redesign ── */
              <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1, backgroundColor: "#FAFAFA" }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* ── Header ── */}
                <LinearGradient
                  colors={["#B71C1C", "#8B0000", "#8B0000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={ctStyles.header}
                >
                  <View style={ctStyles.headerDeco1} />
                  <View style={ctStyles.headerDeco2} />
                  <View style={ctStyles.headerTop}>
                    <View style={ctStyles.headerSlotBadge}>
                      <Ionicons name="shield-half" size={12} color="#FFF" />
                      <Text style={ctStyles.headerSlotTxt}>
                        TEAM {teamSlot}
                      </Text>
                    </View>
                  </View>
                  <Text style={ctStyles.headerTitle}>Create Your Team</Text>
                  <Text style={ctStyles.headerSub}>
                    Fill in team details to set up your squad
                  </Text>

                  {/* Progress bar */}
                  <View style={ctStyles.progressBar}>
                    {[
                      !!currentTeamName.trim(),
                      !!currentCity.trim(),
                      !!currentMobile && currentMobile.length === 10,
                      !!currentCaptain.trim(),
                      !!currentPlayers && parseInt(currentPlayers) >= 11,
                    ].map((done, i) => (
                      <View
                        key={i}
                        style={[
                          ctStyles.progressSlot,
                          done && ctStyles.progressSlotDone,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={ctStyles.progressLabel}>
                    {
                      [
                        currentTeamName,
                        currentCity,
                        currentMobile,
                        currentCaptain,
                        currentPlayers,
                      ].filter(Boolean).length
                    }
                    /5 fields filled
                  </Text>
                </LinearGradient>

                <View style={ctStyles.body}>
                  {/* ── Team Identity ── */}
                  <View style={ctStyles.sectionCard}>
                    <View style={ctStyles.sectionHeader}>
                      <View style={ctStyles.sectionIconWrap}>
                        <Ionicons name="shield" size={16} color="#B71C1C" />
                      </View>
                      <Text style={ctStyles.sectionTitle}>Team Identity</Text>
                    </View>

                    {/* Team Name */}
                    <View style={ctStyles.fieldGroup}>
                      <Text style={ctStyles.fieldLabel}>
                        Team Name <Text style={ctStyles.req}>*</Text>
                      </Text>
                      <View
                        style={[
                          ctStyles.fieldInput,
                          currentTeamName.trim() && ctStyles.fieldInputDone,
                        ]}
                      >
                        <Ionicons
                          name="shield-outline"
                          size={18}
                          color={currentTeamName.trim() ? "#B71C1C" : "#9E9E9E"}
                        />
                        <TextInput
                          style={ctStyles.fieldText}
                          placeholder="e.g. Mumbai Warriors"
                          placeholderTextColor="#9E9E9E"
                          value={currentTeamName}
                          onChangeText={setCurrentTeamName}
                        />
                        {currentTeamName.trim() && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#22C55E"
                          />
                        )}
                      </View>
                    </View>

                    {/* City */}
                    <View style={ctStyles.fieldGroup}>
                      <Text style={ctStyles.fieldLabel}>
                        City / Town <Text style={ctStyles.req}>*</Text>
                      </Text>
                      <CitySearchDropdown
                        value={currentCity}
                        onSelect={setCurrentCity}
                      />
                    </View>

                    {/* Mobile */}
                    <View style={ctStyles.fieldGroup}>
                      <Text style={ctStyles.fieldLabel}>
                        Contact Number <Text style={ctStyles.req}>*</Text>
                      </Text>
                      <View style={ctStyles.mobileRow}>
                        <TouchableOpacity
                          style={ctStyles.dialCodeBtn}
                          onPress={() =>
                            setShowCountryPicker(!showCountryPicker)
                          }
                        >
                          <Text style={ctStyles.dialCodeTxt}>
                            {countryCode}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={12}
                            color="#616161"
                          />
                        </TouchableOpacity>
                        <View
                          style={[
                            ctStyles.fieldInput,
                            { flex: 1 },
                            currentMobile.length === 10 &&
                              ctStyles.fieldInputDone,
                          ]}
                        >
                          <Ionicons
                            name="call-outline"
                            size={18}
                            color={
                              currentMobile.length === 10
                                ? "#B71C1C"
                                : "#9E9E9E"
                            }
                          />
                          <TextInput
                            style={ctStyles.fieldText}
                            placeholder="10 digit number"
                            placeholderTextColor="#9E9E9E"
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={currentMobile}
                            onChangeText={setCurrentMobile}
                          />
                          {currentMobile.length === 10 && (
                            <Ionicons
                              name="checkmark-circle"
                              size={18}
                              color="#22C55E"
                            />
                          )}
                        </View>
                      </View>
                      {showCountryPicker && (
                        <View style={ctStyles.dialDropdown}>
                          {[
                            { code: "+91", flag: "🇮🇳", country: "India" },
                            { code: "+1", flag: "🇺🇸", country: "USA/Canada" },
                            { code: "+44", flag: "🇬🇧", country: "UK" },
                            { code: "+61", flag: "🇦🇺", country: "Australia" },
                            { code: "+971", flag: "🇦🇪", country: "UAE" },
                            { code: "+65", flag: "🇸🇬", country: "Singapore" },
                            { code: "+92", flag: "🇵🇰", country: "Pakistan" },
                            { code: "+880", flag: "🇧🇩", country: "Bangladesh" },
                            { code: "+94", flag: "🇱🇰", country: "Sri Lanka" },
                          ].map((item) => (
                            <TouchableOpacity
                              key={item.code}
                              style={ctStyles.dialOption}
                              onPress={() => {
                                setCountryCode(item.code);
                                setShowCountryPicker(false);
                              }}
                            >
                              <Text style={ctStyles.dialFlag}>{item.flag}</Text>
                              <Text style={ctStyles.dialCountry}>
                                {item.country}
                              </Text>
                              <Text style={ctStyles.dialCode}>{item.code}</Text>
                              {countryCode === item.code && (
                                <Ionicons
                                  name="checkmark"
                                  size={14}
                                  color="#B71C1C"
                                />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* ── Leadership ── */}
                  <View style={ctStyles.sectionCard}>
                    <View style={ctStyles.sectionHeader}>
                      <View style={ctStyles.sectionIconWrap}>
                        <Ionicons name="star" size={16} color="#B71C1C" />
                      </View>
                      <Text style={ctStyles.sectionTitle}>Leadership</Text>
                    </View>

                    {/* Captain */}
                    <View style={ctStyles.fieldGroup}>
                      <Text style={ctStyles.fieldLabel}>
                        Captain Name <Text style={ctStyles.req}>*</Text>
                      </Text>
                      <View
                        style={[
                          ctStyles.fieldInput,
                          currentCaptain.trim() && ctStyles.fieldInputDone,
                        ]}
                      >
                        <Ionicons
                          name="person-circle-outline"
                          size={18}
                          color={currentCaptain.trim() ? "#B71C1C" : "#9E9E9E"}
                        />
                        <TextInput
                          style={ctStyles.fieldText}
                          placeholder="e.g. Rohit Sharma"
                          placeholderTextColor="#9E9E9E"
                          value={currentCaptain}
                          onChangeText={setCurrentCaptain}
                        />
                        {currentCaptain.trim() && (
                          <View style={ctStyles.captainBadge}>
                            <Text style={ctStyles.captainBadgeTxt}>C</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* ── Squad Size ── */}
                  <View style={ctStyles.sectionCard}>
                    <View style={ctStyles.sectionHeader}>
                      <View style={ctStyles.sectionIconWrap}>
                        <Ionicons name="people" size={16} color="#B71C1C" />
                      </View>
                      <Text style={ctStyles.sectionTitle}>Squad Size</Text>
                    </View>

                    <View style={ctStyles.fieldGroup}>
                      <Text style={ctStyles.fieldLabel}>
                        Number of Players <Text style={ctStyles.req}>*</Text>
                      </Text>
                      <Text style={ctStyles.fieldHint}>
                        Min 1 · Max 20 players
                      </Text>
                      <SquadSizePicker
                        value={currentPlayers}
                        onChange={setCurrentPlayers}
                      />
                    </View>
                  </View>

                  {/* ── Add Players Section ── */}
                  <View style={ctStyles.sectionCard}>
                    <View style={ctStyles.sectionHeader}>
                      <View style={ctStyles.sectionIconWrap}>
                        <Ionicons name="person-add" size={16} color="#B71C1C" />
                      </View>
                      <Text style={ctStyles.sectionTitle}>Add Players</Text>
                      <Text style={ctStyles.sectionOptional}>Optional</Text>
                    </View>
                    <Text style={ctStyles.addPlayersNote}>
                      Invite players now or after team creation
                    </Text>

                    <View style={ctStyles.addOptions}>
                      {/* Team Link */}
                      <TouchableOpacity
                        style={ctStyles.addOption}
                        activeOpacity={0.8}
                        onPress={() => {
                          const link = `https://gamelens.app/join/${currentTeamName.replace(/\s+/g, "-").toLowerCase()}-${Date.now().toString(36)}`;
                          Alert.alert(
                            "🔗 Team Invite Link",
                            `Share this link with players:\n\n${link}`,
                            [
                              {
                                text: "Copy Link",
                                onPress: () =>
                                  Alert.alert(
                                    "✅ Copied!",
                                    "Link copied to clipboard.",
                                  ),
                              },
                              {
                                text: "Share",
                                onPress: () =>
                                  Alert.alert(
                                    "Shared!",
                                    "Link shared via WhatsApp, SMS, etc.",
                                  ),
                              },
                              { text: "Close", style: "cancel" },
                            ],
                          );
                        }}
                      >
                        <View
                          style={[
                            ctStyles.addOptionIcon,
                            { backgroundColor: "#EFF6FF" },
                          ]}
                        >
                          <Ionicons name="link" size={20} color="#3B82F6" />
                        </View>
                        <View style={ctStyles.addOptionInfo}>
                          <Text style={ctStyles.addOptionTitle}>Team Link</Text>
                          <Text style={ctStyles.addOptionSub}>
                            Generate & share invite
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#9E9E9E"
                        />
                      </TouchableOpacity>

                      {/* QR Code */}
                      <TouchableOpacity
                        style={ctStyles.addOption}
                        activeOpacity={0.8}
                        onPress={() => {
                          Alert.alert(
                            "📷 QR Code",
                            `Team QR Code generated!\n\nTeam: ${currentTeamName || "Your Team"}\nCode: GL-${Date.now().toString(36).toUpperCase()}`,
                            [
                              {
                                text: "Save to Gallery",
                                onPress: () =>
                                  Alert.alert("✅ Saved!", "QR code saved."),
                              },
                              {
                                text: "Share",
                                onPress: () =>
                                  Alert.alert("Shared!", "QR code shared."),
                              },
                              { text: "Close", style: "cancel" },
                            ],
                          );
                        }}
                      >
                        <View
                          style={[
                            ctStyles.addOptionIcon,
                            { backgroundColor: "#F0FDF4" },
                          ]}
                        >
                          <Ionicons name="qr-code" size={20} color="#16A34A" />
                        </View>
                        <View style={ctStyles.addOptionInfo}>
                          <Text style={ctStyles.addOptionTitle}>QR Code</Text>
                          <Text style={ctStyles.addOptionSub}>
                            Players scan to join
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#9E9E9E"
                        />
                      </TouchableOpacity>

                      {/* From Contacts */}
                      <TouchableOpacity
                        style={ctStyles.addOption}
                        activeOpacity={0.8}
                        onPress={() => {
                          Alert.alert(
                            "📞 Access Contacts",
                            "Allow GameLens to access your contacts to invite players?",
                            [
                              {
                                text: "Allow",
                                onPress: () =>
                                  setTimeout(
                                    () =>
                                      Alert.alert(
                                        "✅ Contacts Loaded",
                                        "Found 25 contacts. Select players to invite!",
                                      ),
                                    800,
                                  ),
                              },
                              { text: "Deny", style: "cancel" },
                            ],
                          );
                        }}
                      >
                        <View
                          style={[
                            ctStyles.addOptionIcon,
                            { backgroundColor: "#FFF7ED" },
                          ]}
                        >
                          <Ionicons name="people" size={20} color="#EA580C" />
                        </View>
                        <View style={ctStyles.addOptionInfo}>
                          <Text style={ctStyles.addOptionTitle}>
                            From Contacts
                          </Text>
                          <Text style={ctStyles.addOptionSub}>
                            Select from phone contacts
                          </Text>
                        </View>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#9E9E9E"
                        />
                      </TouchableOpacity>

                      {/* TODO(dev-only): Manual Add Players — temporary testing feature */}
                      <TouchableOpacity
                        style={ctStyles.addOption}
                        activeOpacity={0.8}
                        onPress={() => setShowManualPlayerModal(true)}
                      >
                        <View
                          style={[
                            ctStyles.addOptionIcon,
                            { backgroundColor: "#FBE9E7" },
                          ]}
                        >
                          <Ionicons name="pencil" size={18} color="#B71C1C" />
                        </View>
                        <View style={ctStyles.addOptionInfo}>
                          <Text style={ctStyles.addOptionTitle}>
                            Manual Add
                          </Text>
                          <Text style={ctStyles.addOptionSub}>
                            Type player names (testing)
                          </Text>
                        </View>
                        {manualPlayers.length > 0 && (
                          <View
                            style={{
                              backgroundColor: "#B71C1C",
                              borderRadius: 10,
                              paddingHorizontal: 7,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFF",
                                fontSize: 11,
                                fontWeight: "800",
                              }}
                            >
                              {manualPlayers.length}
                            </Text>
                          </View>
                        )}
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#9E9E9E"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* TODO(dev-only): Manual Add Player Modal */}
                  <Modal
                    visible={showManualPlayerModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowManualPlayerModal(false)}
                  >
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "flex-end",
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#FFF",
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                          padding: 20,
                          maxHeight: "70%",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "800",
                              color: "#212121",
                            }}
                          >
                            Add Players Manually
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowManualPlayerModal(false)}
                          >
                            <Ionicons name="close" size={24} color="#616161" />
                          </TouchableOpacity>
                        </View>

                        <Text
                          style={{
                            fontSize: 12,
                            color: "#9E9E9E",
                            marginBottom: 12,
                          }}
                        >
                          ⚠️ DEV ONLY — Session-only, not saved to backend
                        </Text>

                        <View
                          style={{
                            flexDirection: "row",
                            gap: 10,
                            marginBottom: 16,
                          }}
                        >
                          <TextInput
                            style={{
                              flex: 1,
                              backgroundColor: "#FAFAFA",
                              borderRadius: 12,
                              borderWidth: 1,
                              borderColor: "#E0E0E0",
                              paddingHorizontal: 14,
                              paddingVertical: 12,
                              fontSize: 15,
                              color: "#212121",
                            }}
                            placeholder="Player Name"
                            placeholderTextColor="#9E9E9E"
                            value={manualPlayerName}
                            onChangeText={setManualPlayerName}
                            onSubmitEditing={() => {
                              if (manualPlayerName.trim()) {
                                setManualPlayers((prev) => [
                                  ...prev,
                                  manualPlayerName.trim(),
                                ]);
                                setManualPlayerName("");
                              }
                            }}
                            returnKeyType="done"
                          />
                          <TouchableOpacity
                            style={{
                              backgroundColor: "#B71C1C",
                              borderRadius: 12,
                              paddingHorizontal: 16,
                              justifyContent: "center",
                            }}
                            onPress={() => {
                              if (manualPlayerName.trim()) {
                                setManualPlayers((prev) => [
                                  ...prev,
                                  manualPlayerName.trim(),
                                ]);
                                setManualPlayerName("");
                              }
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFF",
                                fontWeight: "800",
                                fontSize: 14,
                              }}
                            >
                              Add
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {manualPlayers.length > 0 && (
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: "#616161",
                              marginBottom: 8,
                            }}
                          >
                            Players ({manualPlayers.length})
                          </Text>
                        )}

                        <ScrollView
                          style={{ maxHeight: 200 }}
                          showsVerticalScrollIndicator={false}
                        >
                          {manualPlayers.map((name, idx) => (
                            <View
                              key={`${name}-${idx}`}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: "#FAFAFA",
                                borderRadius: 10,
                                padding: 12,
                                marginBottom: 8,
                              }}
                            >
                              <View
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 14,
                                  backgroundColor: "#FFCDD2",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: 10,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 12,
                                    fontWeight: "800",
                                    color: "#B71C1C",
                                  }}
                                >
                                  {idx + 1}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: 15,
                                  fontWeight: "600",
                                  color: "#212121",
                                }}
                              >
                                {name}
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  setManualPlayers((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color="#D32F2F"
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>

                        {manualPlayers.length > 0 && (
                          <TouchableOpacity
                            style={{
                              backgroundColor: "#B71C1C",
                              borderRadius: 14,
                              paddingVertical: 14,
                              alignItems: "center",
                              marginTop: 12,
                            }}
                            onPress={() => setShowManualPlayerModal(false)}
                          >
                            <Text
                              style={{
                                color: "#FFF",
                                fontSize: 16,
                                fontWeight: "800",
                              }}
                            >
                              Done ({manualPlayers.length} players)
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </Modal>

                  {/* ── Create Button ── */}
                  <TouchableOpacity
                    style={ctStyles.createBtn}
                    onPress={handleSaveTeam}
                    activeOpacity={0.88}
                  >
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000", "#8B0000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={ctStyles.createBtnGrad}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#FFF"
                      />
                      <Text style={ctStyles.createBtnTxt}>Create Team</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={{ height: 120 }} />
                </View>
              </ScrollView>
            ) : currentView === "teamSelection" ? (
              /* Team Selection View — Premium Redesign */
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 250 }}
              >
                <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
                  {/* ── Team A Card ── */}
                  <View
                    style={[
                      styles.tsTeamCard,
                      teamAName && styles.tsTeamCardReady,
                    ]}
                  >
                    {/* Accent strip */}
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.tsTeamCardStrip}
                    />

                    <View style={styles.tsTeamCardInner}>
                      {/* Logo area */}
                      <View style={styles.tsTeamLogoWrap}>
                        {teamAName ? (
                          <LinearGradient
                            colors={["#B71C1C", "#8B0000"]}
                            style={styles.tsTeamLogo}
                          >
                            <Text style={styles.tsTeamLogoLetter}>
                              {teamAName.charAt(0).toUpperCase()}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.tsTeamLogoEmpty}>
                            <Ionicons
                              name="shield-outline"
                              size={28}
                              color="#BDBDBD"
                            />
                          </View>
                        )}
                        {teamAName && <View style={styles.tsReadyDot} />}
                      </View>

                      {/* Info */}
                      <View style={styles.tsTeamInfo}>
                        <View style={styles.tsTeamSlotRow}>
                          <Text style={styles.tsTeamSlot}>HOME</Text>
                          <View
                            style={[
                              styles.tsTeamStatus,
                              teamAName
                                ? styles.tsTeamStatusReady
                                : styles.tsTeamStatusEmpty,
                            ]}
                          >
                            <Text style={styles.tsTeamStatusTxt}>
                              {teamAName ? "READY" : "NOT SET"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.tsTeamName}>
                          {teamAName || "Select Team A"}
                        </Text>
                        {teamAName ? (
                          <View style={styles.tsTeamMeta}>
                            <Ionicons name="people" size={12} color="#616161" />
                            <Text style={styles.tsTeamMetaTxt}>
                              11 Players · Captain assigned
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.tsTeamEmptyHint}>
                            Tap below to select or create
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.tsTeamActions}>
                      <TouchableOpacity
                        style={styles.tsActionBtnOutline}
                        onPress={() => handleSelectTeam("A")}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color="#B71C1C"
                        />
                        <Text style={styles.tsActionBtnOutlineTxt}>Select</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.tsActionBtnOutline}
                        onPress={() => handleCreateTeam("A")}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={16}
                          color="#B91C1C"
                        />
                        <Text style={styles.tsActionBtnOutlineTxt}>Create</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ── VS Section ── */}
                  <View style={styles.tsVsRow}>
                    <View style={styles.tsVsLine} />
                    <LinearGradient
                      colors={["#F59E0B", "#D97706"]}
                      style={styles.tsVsCircle}
                    >
                      <Text style={styles.tsVsTxt}>VS</Text>
                    </LinearGradient>
                    <View style={styles.tsVsLine} />
                  </View>

                  {/* ── Team B Card ── */}
                  <View
                    style={[
                      styles.tsTeamCard,
                      teamBName && styles.tsTeamCardReady,
                    ]}
                  >
                    <LinearGradient
                      colors={["#8B0000", "#8B0000"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.tsTeamCardStrip}
                    />

                    <View style={styles.tsTeamCardInner}>
                      <View style={styles.tsTeamLogoWrap}>
                        {teamBName ? (
                          <LinearGradient
                            colors={["#8B0000", "#8B0000"]}
                            style={styles.tsTeamLogo}
                          >
                            <Text style={styles.tsTeamLogoLetter}>
                              {teamBName.charAt(0).toUpperCase()}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={styles.tsTeamLogoEmpty}>
                            <Ionicons
                              name="shield-outline"
                              size={28}
                              color="#BDBDBD"
                            />
                          </View>
                        )}
                        {teamBName && <View style={styles.tsReadyDot} />}
                      </View>

                      <View style={styles.tsTeamInfo}>
                        <View style={styles.tsTeamSlotRow}>
                          <Text style={styles.tsTeamSlot}>AWAY</Text>
                          <View
                            style={[
                              styles.tsTeamStatus,
                              teamBName
                                ? styles.tsTeamStatusReady
                                : styles.tsTeamStatusEmpty,
                            ]}
                          >
                            <Text style={styles.tsTeamStatusTxt}>
                              {teamBName ? "READY" : "NOT SET"}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.tsTeamName}>
                          {teamBName || "Select Team B"}
                        </Text>
                        {teamBName ? (
                          <View style={styles.tsTeamMeta}>
                            <Ionicons name="people" size={12} color="#616161" />
                            <Text style={styles.tsTeamMetaTxt}>
                              11 Players · Captain assigned
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.tsTeamEmptyHint}>
                            Tap below to select or create
                          </Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.tsTeamActions}>
                      <TouchableOpacity
                        style={styles.tsActionBtnOutline}
                        onPress={() => handleSelectTeam("B")}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color="#B71C1C"
                        />
                        <Text style={styles.tsActionBtnOutlineTxt}>Select</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.tsActionBtnOutline}
                        onPress={() => handleCreateTeam("B")}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={16}
                          color="#B91C1C"
                        />
                        <Text style={styles.tsActionBtnOutlineTxt}>Create</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ── Ready indicator ── */}
                  {(teamAName || teamBName) && (
                    <View style={styles.tsReadyBar}>
                      <View
                        style={[
                          styles.tsReadyBarSlot,
                          teamAName && styles.tsReadyBarSlotDone,
                        ]}
                      />
                      <View
                        style={[
                          styles.tsReadyBarSlot,
                          teamBName && styles.tsReadyBarSlotDone,
                        ]}
                      />
                    </View>
                  )}

                  {/* ── Let's Play ── */}
                  {teamAName && teamBName && (
                    <TouchableOpacity
                      style={styles.tsPlayBtn}
                      onPress={handleLetsPlay}
                      activeOpacity={0.88}
                    >
                      <LinearGradient
                        colors={["#F59E0B", "#D97706", "#B45309"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.tsPlayBtnGrad}
                      >
                        <Ionicons name="play-circle" size={24} color="#FFF" />
                        <Text style={styles.tsPlayBtnTxt}>{"Let's Play!"}</Text>
                        <Ionicons
                          name="arrow-forward-circle"
                          size={22}
                          color="rgba(255,255,255,0.7)"
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {/* ── Empty state hint ── */}
                  {!teamAName && !teamBName && (
                    <View style={styles.tsEmptyHint}>
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color="#9E9E9E"
                      />
                      <Text style={styles.tsEmptyHintTxt}>
                        Set both teams to start the match
                      </Text>
                    </View>
                  )}

                  <View style={{ height: 100 }} />
                </View>
              </ScrollView>
            ) : (
              /* Matches/Tournaments/Teams View */
              <Animated.ScrollView
                ref={horizontalScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleHorizontalScrollEnd}
                onScrollEndDrag={handleMainScrollEndDrag}
                style={styles.content}
                scrollEventThrottle={16}
                nestedScrollEnabled
              >
                <ScrollView
                  style={{ width: SCREEN_WIDTH }}
                  showsVerticalScrollIndicator={false}
                >
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
                      colors={["#B71C1C", "#8B0000", "#8B0000"]}
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
                              <Ionicons
                                name="add-circle"
                                size={28}
                                color="#FFF"
                              />
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

                        <Animated.View
                          style={{ transform: [{ scale: scaleAnim }] }}
                        >
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
                                color="#B71C1C"
                              />
                            </LinearGradient>
                          </TouchableOpacity>
                        </Animated.View>
                      </View>
                    </LinearGradient>
                  </Animated.View>

                  {/* Animated Filter Tabs */}
                  <Animated.View
                    style={[styles.filterTabs, { opacity: fadeAnim }]}
                  >
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
                            colors={["#B71C1C", "#8B0000"]}
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
                            `${match.type}\nStatus: ${match.status}\nDate: ${match.date}\nTime: ${match.time}\nLocation: ${match.location}\nFormat: ${match.format} (${match.overs})${match.result ? `\nResult: ${match.result}` : ""}`,
                            [
                              { text: "Close", style: "cancel" },
                              match.status === "Live"
                                ? {
                                    text: "Watch Live",
                                    onPress: () =>
                                      Alert.alert(
                                        "Live Match",
                                        "Opening live match view...",
                                      ),
                                  }
                                : match.status === "Upcoming"
                                  ? {
                                      text: "Set Reminder",
                                      onPress: () =>
                                        Alert.alert(
                                          "Reminder Set",
                                          "You'll be notified before the match starts!",
                                        ),
                                    }
                                  : {
                                      text: "View Scorecard",
                                      onPress: () =>
                                        Alert.alert(
                                          "Scorecard",
                                          "Opening detailed scorecard...",
                                        ),
                                    },
                            ],
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
                                  color="#B71C1C"
                                />
                              </View>
                              <Text style={styles.matchType}>{match.type}</Text>
                            </View>
                            <LinearGradient
                              colors={
                                match.status === "Live"
                                  ? ["#EF4444", "#C62828"]
                                  : match.status === "Upcoming"
                                    ? ["#F59E0B", "#D97706"]
                                    : match.status === "Completed"
                                      ? ["#10B981", "#C62828"]
                                      : ["#B71C1C", "#8B0000"]
                              }
                              style={styles.statusBadge}
                            >
                              {match.status === "Live" && (
                                <View style={styles.liveIndicator} />
                              )}
                              <Text style={styles.statusText}>
                                {match.status}
                              </Text>
                            </LinearGradient>
                          </View>

                          <View style={styles.matchBody}>
                            <View style={styles.teamSection}>
                              <LinearGradient
                                colors={["#B71C1C", "#8B0000"]}
                                style={styles.teamInitial}
                              >
                                <Text style={styles.teamInitialText}>
                                  {match.team.charAt(0)}
                                </Text>
                              </LinearGradient>
                              <View style={styles.teamInfo}>
                                <Text style={styles.teamName}>
                                  {match.team}
                                </Text>
                                {match.result && (
                                  <View style={styles.resultContainer}>
                                    <Ionicons
                                      name="trophy"
                                      size={10}
                                      color="#B71C1C"
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
                                    color="#B71C1C"
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
                                    color="#B71C1C"
                                  />
                                </View>
                                <Text style={styles.detailText}>
                                  {match.location}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.scheduleContainer}>
                              <Ionicons
                                name="time-outline"
                                size={10}
                                color="#999"
                              />
                              <Text style={styles.matchSchedule}>
                                Match scheduled to begin on {match.date} at{" "}
                                {match.time}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.matchFooter}>
                            <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert("Insights", "Match insights and statistics coming soon")}>
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
                                  color="#B71C1C"
                                />
                                <Text style={styles.footerButtonText}>
                                  Insights
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                            <View style={styles.footerDivider} />
                            <TouchableOpacity style={styles.footerButton} onPress={() => Alert.alert("Squads", "View team squads and player details")}>
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
                                  color="#B71C1C"
                                />
                                <Text style={styles.footerButtonText}>
                                  Squads
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* Tournaments Tab Content */}
                <ScrollView
                  style={{ width: SCREEN_WIDTH }}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.tournamentsContainer}>
                    {/* Create Tournament Card */}
                    <TouchableOpacity
                      style={styles.createTournamentCard}
                      onPress={() => setCurrentView("createTournament")}
                    >
                      <LinearGradient
                        colors={["#B71C1C", "#8B0000", "#8B0000"]}
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
                    <Animated.View
                      style={[styles.filterTabs, { opacity: fadeAnim }]}
                    >
                      {["your", "participate", "network", "all"].map(
                        (filter) => (
                          <TouchableOpacity
                            key={filter}
                            style={[
                              styles.filterTab,
                              activeTournamentFilter === filter &&
                                styles.activeFilterTab,
                            ]}
                            onPress={() => setActiveTournamentFilter(filter)}
                          >
                            {activeTournamentFilter === filter ? (
                              <LinearGradient
                                colors={["#B71C1C", "#8B0000"]}
                                style={styles.filterGradient}
                              >
                                <Text style={styles.activeFilterText}>
                                  {filter.charAt(0).toUpperCase() +
                                    filter.slice(1)}
                                </Text>
                              </LinearGradient>
                            ) : (
                              <Text style={styles.filterText}>
                                {filter.charAt(0).toUpperCase() +
                                  filter.slice(1)}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ),
                      )}
                    </Animated.View>

                    {/* Tournaments List */}
                    <Text style={styles.sectionTitle}>
                      {activeTournamentFilter === "your" && "Your Tournaments"}
                      {activeTournamentFilter === "participate" &&
                        "Tournaments to Participate"}
                      {activeTournamentFilter === "network" &&
                        "Network Tournaments"}
                      {activeTournamentFilter === "all" && "All Tournaments"}
                    </Text>

                    {activeTournamentFilter === "your" &&
                      allTournaments
                        .filter((t) => t.category === "your")
                        .map((tournament) => (
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
                                    colors={["#EF9A9A", "#C62828"]}
                                    style={styles.tournamentIcon}
                                  >
                                    <Ionicons
                                      name="trophy"
                                      size={18}
                                      color="#FFF"
                                    />
                                  </LinearGradient>
                                  <View style={styles.tournamentHeaderInfo}>
                                    <Text
                                      style={styles.tournamentName}
                                      numberOfLines={1}
                                    >
                                      {tournament.name}
                                    </Text>
                                    <View style={styles.tournamentMeta}>
                                      <Ionicons
                                        name="calendar-outline"
                                        size={11}
                                        color="#999"
                                      />
                                      <Text style={styles.tournamentMetaText}>
                                        {tournament.startDate}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <LinearGradient
                                  colors={
                                    tournament.status === "Ongoing"
                                      ? ["#B71C1C", "#8B0000"]
                                      : ["#C62828", "#8B0000"]
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
                                            ? "#B71C1C"
                                            : tournament.progress > 40
                                              ? "#C62828"
                                              : "#B71C1C",
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
                                    <Ionicons
                                      name="people"
                                      size={12}
                                      color="#B71C1C"
                                    />
                                  </View>
                                  <Text style={styles.tournamentStatText}>
                                    {tournament.teams} Teams
                                  </Text>
                                </View>
                                <View style={styles.tournamentStat}>
                                  <View style={styles.statIcon}>
                                    <Ionicons
                                      name="baseball"
                                      size={12}
                                      color="#B71C1C"
                                    />
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
                                    colors={["#B71C1C", "#8B0000"]}
                                    style={styles.tournamentButtonGradient}
                                  >
                                    <Ionicons
                                      name="settings-outline"
                                      size={13}
                                      color="#FFF"
                                    />
                                    <Text style={styles.tournamentButtonText}>
                                      Manage
                                    </Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}

                    {activeTournamentFilter === "participate" &&
                      allTournaments
                        .filter((t) => t.category === "participate")
                        .map((tournament) => (
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
                                    colors={["#EF9A9A", "#C62828"]}
                                    style={styles.tournamentIcon}
                                  >
                                    <Ionicons
                                      name="trophy"
                                      size={18}
                                      color="#FFF"
                                    />
                                  </LinearGradient>
                                  <View style={styles.tournamentHeaderInfo}>
                                    <Text
                                      style={styles.tournamentName}
                                      numberOfLines={1}
                                    >
                                      {tournament.name}
                                    </Text>
                                    <View style={styles.tournamentMeta}>
                                      <Ionicons
                                        name="calendar-outline"
                                        size={11}
                                        color="#999"
                                      />
                                      <Text style={styles.tournamentMetaText}>
                                        {tournament.startDate}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <LinearGradient
                                  colors={["#B71C1C", "#8B0000"]}
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
                                        backgroundColor: "#B71C1C",
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
                                    <Ionicons
                                      name="people"
                                      size={12}
                                      color="#B71C1C"
                                    />
                                  </View>
                                  <Text style={styles.tournamentStatText}>
                                    {tournament.teams} Teams
                                  </Text>
                                </View>
                                <View style={styles.tournamentStat}>
                                  <View style={styles.statIcon}>
                                    <Ionicons
                                      name="baseball"
                                      size={12}
                                      color="#B71C1C"
                                    />
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
                                    colors={["#B71C1C", "#8B0000"]}
                                    style={styles.tournamentButtonGradient}
                                  >
                                    <Ionicons
                                      name="stats-chart-outline"
                                      size={13}
                                      color="#FFF"
                                    />
                                    <Text style={styles.tournamentButtonText}>
                                      Stats
                                    </Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}

                    {activeTournamentFilter === "network" &&
                      allTournaments
                        .filter((t) => t.category === "network")
                        .map((tournament) => (
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
                                    colors={["#EF9A9A", "#C62828"]}
                                    style={styles.tournamentIcon}
                                  >
                                    <Ionicons
                                      name="trophy"
                                      size={18}
                                      color="#FFF"
                                    />
                                  </LinearGradient>
                                  <View style={styles.tournamentHeaderInfo}>
                                    <Text
                                      style={styles.tournamentName}
                                      numberOfLines={1}
                                    >
                                      {tournament.name}
                                    </Text>
                                    <View style={styles.tournamentMeta}>
                                      <Ionicons
                                        name="calendar-outline"
                                        size={11}
                                        color="#999"
                                      />
                                      <Text style={styles.tournamentMetaText}>
                                        {tournament.startDate}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <LinearGradient
                                  colors={
                                    tournament.status === "Ongoing"
                                      ? ["#B71C1C", "#8B0000"]
                                      : ["#C62828", "#8B0000"]
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
                                            ? "#B71C1C"
                                            : tournament.progress > 40
                                              ? "#C62828"
                                              : "#B71C1C",
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
                                    <Ionicons
                                      name="people"
                                      size={12}
                                      color="#B71C1C"
                                    />
                                  </View>
                                  <Text style={styles.tournamentStatText}>
                                    {tournament.teams} Teams
                                  </Text>
                                </View>
                                <View style={styles.tournamentStat}>
                                  <View style={styles.statIcon}>
                                    <Ionicons
                                      name="baseball"
                                      size={12}
                                      color="#B71C1C"
                                    />
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
                                        {
                                          text: "Join",
                                          onPress: () =>
                                            console.log("Joined tournament"),
                                        },
                                      ],
                                    );
                                  }}
                                >
                                  <LinearGradient
                                    colors={["#B71C1C", "#8B0000"]}
                                    style={styles.tournamentButtonGradient}
                                  >
                                    <Ionicons
                                      name="add-circle-outline"
                                      size={13}
                                      color="#FFF"
                                    />
                                    <Text style={styles.tournamentButtonText}>
                                      Join
                                    </Text>
                                  </LinearGradient>
                                </TouchableOpacity>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        ))}

                    {activeTournamentFilter === "all" &&
                      allTournaments.map((tournament) => (
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
                                  colors={["#EF9A9A", "#C62828"]}
                                  style={styles.tournamentIcon}
                                >
                                  <Ionicons
                                    name="trophy"
                                    size={18}
                                    color="#FFF"
                                  />
                                </LinearGradient>
                                <View style={styles.tournamentHeaderInfo}>
                                  <Text
                                    style={styles.tournamentName}
                                    numberOfLines={1}
                                  >
                                    {tournament.name}
                                  </Text>
                                  <View style={styles.tournamentMeta}>
                                    <Ionicons
                                      name="calendar-outline"
                                      size={11}
                                      color="#999"
                                    />
                                    <Text style={styles.tournamentMetaText}>
                                      {tournament.startDate}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <LinearGradient
                                colors={
                                  tournament.status === "Ongoing"
                                    ? ["#B71C1C", "#8B0000"]
                                    : tournament.status === "Completed"
                                      ? ["#B71C1C", "#8B0000"]
                                      : ["#C62828", "#8B0000"]
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
                                          ? "#B71C1C"
                                          : tournament.progress > 40
                                            ? "#C62828"
                                            : tournament.progress === 100
                                              ? "#B71C1C"
                                              : "#B71C1C",
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
                                  <Ionicons
                                    name="people"
                                    size={12}
                                    color="#B71C1C"
                                  />
                                </View>
                                <Text style={styles.tournamentStatText}>
                                  {tournament.teams} Teams
                                </Text>
                              </View>
                              <View style={styles.tournamentStat}>
                                <View style={styles.statIcon}>
                                  <Ionicons
                                    name="baseball"
                                    size={12}
                                    color="#B71C1C"
                                  />
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
                                  shareContent({
                                    title: tournament.name,
                                    message: `Join and follow the tournament ${tournament.name} on GameLens!`,
                                    type: "match",
                                    id: tournament.id,
                                  });
                                }}
                              >
                                <LinearGradient
                                  colors={["#B71C1C", "#8B0000"]}
                                  style={styles.tournamentButtonGradient}
                                >
                                  <Ionicons
                                    name="share-social-outline"
                                    size={13}
                                    color="#FFF"
                                  />
                                  <Text style={styles.tournamentButtonText}>
                                    Share
                                  </Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}

                    <View style={{ height: 20 }} />
                  </View>
                </ScrollView>

                {/* Teams Tab Content */}
                <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
                  <ScrollView
                    style={styles.teamsContainer}
                    showsVerticalScrollIndicator={false}
                  >
                    <Text style={styles.teamsTitle}>My Teams</Text>
                    <Text style={styles.teamsSubtitle}>
                      Create or select teams for your matches
                    </Text>

                    {/* Team Options */}
                    <View style={styles.teamOptionsContainer}>
                      {/* Select Team Option */}
                      <TouchableOpacity
                        style={styles.teamOption}
                        onPress={() => {
                          console.log(
                            "Select Team pressed - navigating to team selection",
                          );
                          setCurrentView("teamsSelection");
                        }}
                      >
                        <LinearGradient
                          colors={["#C62828", "#047857"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.teamOptionGradient}
                        >
                          <View style={styles.teamOptionIconContainer}>
                            <Ionicons name="people" size={32} color="#FFF" />
                          </View>
                          <View style={styles.teamOptionContent}>
                            <Text style={styles.teamOptionTitle}>
                              Select Team
                            </Text>
                            <Text style={styles.teamOptionDescription}>
                              Choose from existing teams
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={24}
                            color="#FFF"
                          />
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
                          colors={["#B71C1C", "#8B0000"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.teamOptionGradient}
                        >
                          <View style={styles.teamOptionIconContainer}>
                            <Ionicons
                              name="add-circle"
                              size={32}
                              color="#FFF"
                            />
                          </View>
                          <View style={styles.teamOptionContent}>
                            <Text style={styles.teamOptionTitle}>
                              Create Team
                            </Text>
                            <Text style={styles.teamOptionDescription}>
                              Build a new team from scratch
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

                    {/* Recent Teams Section */}
                    <View style={styles.recentTeamsSection}>
                      <Text style={styles.recentTeamsTitle}>Recent Teams</Text>

                      {/* TODO(backend): fetch recent teams from API / LocalStorage */}
                      {(
                        [] as {
                          name: string;
                          players: number;
                          lastUsed: string;
                          color: string;
                        }[]
                      ).map((team, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.recentTeamCard}
                          onPress={() => {
                            Alert.alert(
                              team.name,
                              `Players: ${team.players}\nLast Used: ${team.lastUsed}\n\nWhat would you like to do?`,
                              [
                                {
                                  text: "View Details",
                                  onPress: () =>
                                    Alert.alert(
                                      "Team Details",
                                      `Showing details for ${team.name}`,
                                    ),
                                },
                                {
                                  text: "Edit Team",
                                  onPress: () =>
                                    Alert.alert(
                                      "Edit Team",
                                      `Editing ${team.name}`,
                                    ),
                                },
                                { text: "Cancel", style: "cancel" },
                              ],
                            );
                          }}
                        >
                          <View
                            style={[
                              styles.recentTeamIcon,
                              { backgroundColor: team.color },
                            ]}
                          >
                            <Text style={styles.recentTeamInitial}>
                              {team.name.charAt(0)}
                            </Text>
                          </View>
                          <View style={styles.recentTeamInfo}>
                            <Text style={styles.recentTeamName}>
                              {team.name}
                            </Text>
                            <Text style={styles.recentTeamMeta}>
                              {team.players} players • {team.lastUsed}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#999"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Bottom spacing for scroll */}
                    <View style={{ height: 100 }} />
                  </ScrollView>
                </View>
              </Animated.ScrollView>
            )}
          </AnimatedViewTransition>
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
                <TouchableOpacity
                  onPress={() => setShowTournamentSettings(false)}
                >
                  <Ionicons name="close-circle" size={26} color="#CCC" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  {
                    label: "Add Teams",
                    icon: "people-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Rounds (League Matches, Final, etc.)",
                    icon: "git-branch-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Groups (Group A, Group B, etc.)",
                    icon: "grid-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Start A Match",
                    icon: "baseball-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Schedule Matches",
                    icon: "calendar-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Delete Schedule",
                    icon: "trash-bin-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Add/Remove Scorers (Admins)",
                    icon: "person-add-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Tournament Officials",
                    icon: "shield-checkmark-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Add Live Streamer",
                    icon: "videocam-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Tournament Awards",
                    icon: "ribbon-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Tournament Settings",
                    icon: "settings-outline",
                    danger: false,
                    badge: "NEW",
                  },
                  {
                    label: "Premium Features",
                    icon: "star-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Find Scorers / Umpires",
                    icon: "search-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Smart NRR Calculator",
                    icon: "calculator-outline",
                    danger: false,
                    badge: null,
                  },
                  {
                    label: "Edit/Delete Tournament",
                    icon: "create-outline",
                    danger: true,
                    badge: null,
                  },
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
                              {
                                text: "Delete Tournament",
                                style: "destructive",
                                onPress: () => {},
                              },
                              { text: "Cancel", style: "cancel" },
                            ],
                          );
                        } else {
                          Alert.alert(item.label, `Opening ${item.label}…`);
                        }
                      }, 300);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.tsMenuIcon,
                        item.danger && { backgroundColor: "#FFCDD2" },
                      ]}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.danger ? "#C62828" : "#555"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.tsMenuLabel,
                        item.danger && styles.tsMenuLabelDanger,
                      ]}
                    >
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
                        color={item.danger ? "#C62828" : "#CCC"}
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
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults({ tournaments: [], matches: [] });
                  }}
                >
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={styles.searchResults}
              showsVerticalScrollIndicator={false}
            >
              {searchQuery.length === 0 ? (
                <>
                  <Text style={styles.searchResultsTitle}>Recent Searches</Text>
                  <TouchableOpacity style={styles.searchResultItem} onPress={() => setSearchQuery("Mumbai Premier League")}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.searchResultText}>
                      Mumbai Premier League
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.searchResultItem} onPress={() => setSearchQuery("T20 Match")}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.searchResultText}>T20 Match</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.searchResultItem} onPress={() => setSearchQuery("Wankhede Stadium")}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.searchResultText}>
                      Wankhede Stadium
                    </Text>
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
                                  colors={["#EF9A9A", "#C62828"]}
                                  style={styles.tournamentIcon}
                                >
                                  <Ionicons
                                    name="trophy"
                                    size={18}
                                    color="#FFF"
                                  />
                                </LinearGradient>
                                <View style={styles.tournamentHeaderInfo}>
                                  <Text
                                    style={styles.tournamentName}
                                    numberOfLines={1}
                                  >
                                    {tournament.name}
                                  </Text>
                                  <View style={styles.tournamentMeta}>
                                    <Ionicons
                                      name="calendar-outline"
                                      size={11}
                                      color="#999"
                                    />
                                    <Text style={styles.tournamentMetaText}>
                                      {tournament.startDate}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <LinearGradient
                                colors={
                                  tournament.status === "Ongoing"
                                    ? ["#B71C1C", "#8B0000"]
                                    : ["#C62828", "#8B0000"]
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
                                          ? "#B71C1C"
                                          : tournament.progress > 40
                                            ? "#C62828"
                                            : "#B71C1C",
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
                                  <Ionicons
                                    name="people"
                                    size={12}
                                    color="#B71C1C"
                                  />
                                </View>
                                <Text style={styles.tournamentStatText}>
                                  {tournament.teams} Teams
                                </Text>
                              </View>
                              <View style={styles.tournamentStat}>
                                <View style={styles.statIcon}>
                                  <Ionicons
                                    name="baseball"
                                    size={12}
                                    color="#B71C1C"
                                  />
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
                                  colors={["#B71C1C", "#8B0000"]}
                                  style={styles.tournamentButtonGradient}
                                >
                                  <Ionicons
                                    name="eye-outline"
                                    size={13}
                                    color="#FFF"
                                  />
                                  <Text style={styles.tournamentButtonText}>
                                    View Details
                                  </Text>
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
                      <Text
                        style={[
                          styles.searchResultsTitle,
                          {
                            marginTop:
                              searchResults.tournaments.length > 0 ? 20 : 0,
                          },
                        ]}
                      >
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
                              <View
                                style={[
                                  styles.searchMatchStatus,
                                  {
                                    backgroundColor:
                                      match.status === "Live"
                                        ? "#B71C1C"
                                        : match.status === "Upcoming"
                                          ? "#C62828"
                                          : "#666",
                                  },
                                ]}
                              >
                                <Text style={styles.searchMatchStatusText}>
                                  {match.status}
                                </Text>
                              </View>
                              <Text style={styles.searchMatchType}>
                                {match.type}
                              </Text>
                            </View>
                            <Text
                              style={styles.searchMatchTeam}
                              numberOfLines={1}
                            >
                              {match.team}
                            </Text>
                            <View style={styles.searchMatchMeta}>
                              <View style={styles.searchMatchMetaItem}>
                                <Ionicons
                                  name="calendar-outline"
                                  size={12}
                                  color="#999"
                                />
                                <Text style={styles.searchMatchMetaText}>
                                  {match.date} • {match.time}
                                </Text>
                              </View>
                              <View style={styles.searchMatchMetaItem}>
                                <Ionicons
                                  name="location-outline"
                                  size={12}
                                  color="#999"
                                />
                                <Text
                                  style={styles.searchMatchMetaText}
                                  numberOfLines={1}
                                >
                                  {match.location}
                                </Text>
                              </View>
                              <View style={styles.searchMatchMetaItem}>
                                <Ionicons
                                  name="baseball-outline"
                                  size={12}
                                  color="#999"
                                />
                                <Text style={styles.searchMatchMetaText}>
                                  {match.format} • {match.overs}
                                </Text>
                              </View>
                            </View>
                            {match.result && (
                              <Text style={styles.searchMatchResult}>
                                {match.result}
                              </Text>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* No Results */}
                  {searchResults.tournaments.length === 0 &&
                    searchResults.matches.length === 0 &&
                    searchQuery.length > 0 && (
                      <View style={styles.noResultsContainer}>
                        <Ionicons
                          name="search-outline"
                          size={48}
                          color="#CCC"
                        />
                        <Text style={styles.noResultsTitle}>
                          No results found
                        </Text>
                        <Text style={styles.noResultsText}>
                          Try searching for tournament names, match teams, or
                          locations
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

            <ScrollView
              style={styles.playersList}
              showsVerticalScrollIndicator={false}
            >
              {(playerModalType === "striker" ||
              playerModalType === "nonStriker"
                ? battingTeamPlayers
                : bowlingTeamPlayers
              ).map((player) => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.playerItem,
                    (playerModalType === "striker" &&
                      selectedStriker?.id === player.id) ||
                    (playerModalType === "nonStriker" &&
                      selectedNonStriker?.id === player.id) ||
                    (playerModalType === "bowler" &&
                      selectedBowler?.id === player.id)
                      ? styles.playerItemSelected
                      : null,
                  ]}
                  onPress={() => {
                    // Validation: Don't allow same player for striker and non-striker
                    if (
                      playerModalType === "striker" &&
                      selectedNonStriker?.id === player.id
                    ) {
                      Alert.alert(
                        "Invalid Selection",
                        "This player is already selected as Non-striker. Please choose a different player.",
                      );
                      return;
                    }
                    if (
                      playerModalType === "nonStriker" &&
                      selectedStriker?.id === player.id
                    ) {
                      Alert.alert(
                        "Invalid Selection",
                        "This player is already selected as Striker. Please choose a different player.",
                      );
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
                      {player.image ? (
                        <Image
                          source={{ uri: player.image }}
                          style={styles.playerAvatarImage}
                        />
                      ) : (
                        <Text style={styles.playerAvatarText}>
                          {player.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </Text>
                      )}
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerRole}>{player.role}</Text>
                    </View>
                    {((playerModalType === "striker" &&
                      selectedStriker?.id === player.id) ||
                      (playerModalType === "nonStriker" &&
                        selectedNonStriker?.id === player.id) ||
                      (playerModalType === "bowler" &&
                        selectedBowler?.id === player.id)) && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#B71C1C"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    </TabScreenWrapper>
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
    paddingHorizontal: 14,
    paddingTop: 40,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  headerBackButton: {
    padding: 4,
    marginLeft: -8,
  },
  headerRight: {
    flexDirection: "row",
    gap: 1,
    marginRight: -4,
  },
  iconButton: {
    padding: 6,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF9A9A",
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
    borderBottomColor: "#B71C1C",
  },
  tabText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#B71C1C",
    fontWeight: "700",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 3,
    backgroundColor: "#B71C1C",
  },
  content: {
    flex: 1,
  },
  startMatchSection: {
    padding: 16,
  },
  startMatchCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#B71C1C",
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
    color: "#B71C1C",
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
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  matchCardGradient: {
    borderRadius: 20,
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
    shadowColor: "#B71C1C",
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
    color: "#B71C1C",
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
    color: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    borderBottomColor: "#E0E0E0",
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
    borderBottomColor: "#E0E0E0",
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
    borderBottomColor: "#B71C1C",
  },
  dashboardTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  dashboardTabTextActive: {
    color: "#B71C1C",
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
    borderColor: "#E0E0E0",
  },
  pointsTableHeader: {
    flexDirection: "row",
    backgroundColor: "#B71C1C",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  pointsTableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
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
    color: "#B71C1C",
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
    backgroundColor: "#EF9A9A",
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
    color: "#B71C1C",
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
    borderTopColor: "#E0E0E0",
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
    color: "#10B981",
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
    backgroundColor: "#10B981",
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
    borderBottomColor: "#E0E0E0",
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
    borderRadius: 20,
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
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    backgroundColor: "#E0E0E0",
  },
  vsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  selectTeamCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    gap: 10,
  },
  selectTeamIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  selectTeamInitial: {
    fontSize: 17,
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
    borderColor: "#E0E0E0",
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
    borderColor: "#E0E0E0",
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
    borderColor: "#E0E0E0",
  },
  countryCodeDropdown: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    borderColor: "#E0E0E0",
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
    borderColor: "#E0E0E0",
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
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    padding: 14,
    backgroundColor: "#F7F7F7",
  },
  matchSetupTitle: {
    fontSize: 22,
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
    marginBottom: 14,
  },
  setupSection: {
    marginBottom: 14,
  },
  setupSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333",
    marginBottom: 8,
  },
  matchTypeCubeContainer: {
    borderRadius: 10,
    padding: 6,
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
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
    borderColor: "#B71C1C",
    backgroundColor: "#B71C1C",
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  matchTypePillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B71C1C",
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
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  matchTypeCardActive: {
    borderColor: "#B71C1C",
    backgroundColor: "rgba(185, 28, 28, 0.05)",
  },
  matchTypeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#666",
    textAlign: "center",
  },
  matchTypeTextActive: {
    color: "#B71C1C",
  },
  locationButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#B71C1C",
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
    color: "#B71C1C",
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
    color: "#B71C1C",
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
    backgroundColor: "#E0E0E0",
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
    shadowColor: "#B71C1C",
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
    backgroundColor: "#B71C1C",
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
    color: "#B71C1C",
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
  realPitchGrid: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: 12,
    paddingTop: 2,
  },
  realPitchOption: {
    alignItems: "center",
    minWidth: 54,
    paddingVertical: 2,
  },
  realPitchOptionSelected: {
    transform: [{ translateY: -1 }],
  },
  pitchSurface: {
    width: 48,
    height: 66,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  pitchLane: {
    width: 22,
    height: 58,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  pitchCrease: {
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  pitchStumpsRow: {
    flexDirection: "row",
    gap: 2,
  },
  pitchStump: {
    width: 2,
    height: 8,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.86)",
  },
  pitchCenterLine: {
    width: 1,
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    marginVertical: 2,
  },
  pitchMattingLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-evenly",
  },
  pitchMattingLine: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  pitchSelectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    alignItems: "center",
    justifyContent: "center",
  },
  realPitchLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#555",
  },
  realPitchLabelSelected: {
    color: "#B71C1C",
    fontWeight: "900",
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
    borderColor: "#E0E0E0",
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
    shadowColor: "#8B0000",
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
    borderColor: "#8B0000",
    backgroundColor: "#8B0000",
    shadowColor: "#8B0000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pitchTypePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8B0000",
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
    borderColor: "#E0E0E0",
  },
  pitchTypeChipActive: {
    borderColor: "#B71C1C",
    backgroundColor: "rgba(185, 28, 28, 0.1)",
  },
  pitchTypeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#666",
  },
  pitchTypeTextActive: {
    color: "#B71C1C",
  },
  ballTypeGrid: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 18,
    paddingTop: 2,
  },
  realBallOption: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 58,
    paddingVertical: 4,
  },
  realBallOptionSelected: {
    transform: [{ translateY: -1 }],
  },
  realBall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 3,
  },
  realBallHighlight: {
    position: "absolute",
    top: 7,
    left: 8,
    width: 10,
    height: 7,
    borderRadius: 8,
    opacity: 0.38,
  },
  realBallSeamLeft: {
    position: "absolute",
    left: 7,
    width: 17,
    height: 48,
    borderRightWidth: 1.4,
    borderRadius: 20,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.9,
  },
  realBallSeamRight: {
    position: "absolute",
    right: 7,
    width: 17,
    height: 48,
    borderLeftWidth: 1.4,
    borderRadius: 20,
    transform: [{ rotate: "-18deg" }],
    opacity: 0.9,
  },
  realBallStitchLine: {
    position: "absolute",
    width: 1.4,
    height: 30,
    opacity: 0.75,
    transform: [{ rotate: "-18deg" }],
  },
  realBallCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    alignItems: "center",
    justifyContent: "center",
  },
  realBallLabel: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: "700",
    color: "#555",
  },
  realBallLabelSelected: {
    color: "#B71C1C",
    fontWeight: "900",
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
    borderColor: "#E0E0E0",
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
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: "#B71C1C",
  },
  startMatchButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#B71C1C",
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
    backgroundColor: "#B71C1C",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    borderRadius: 20,
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
    backgroundColor: "#E0E0E0",
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
    borderTopColor: "#E0E0E0",
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
    backgroundColor: "#E0E0E0",
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
    backgroundColor: "#FAFAFA",
  },
  formHeaderBlock: {
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#171717",
    marginBottom: 6,
  },
  formSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666",
  },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addMediaButton: {
    alignItems: "center",
    marginBottom: 20,
  },
  mediaUploadStage: {
    minHeight: 174,
    marginBottom: 18,
  },
  bannerUploadButton: {
    width: "100%",
  },
  bannerMediaPlaceholder: {
    width: "100%",
    height: 128,
    backgroundColor: "#FFF7F7",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  mediaPlaceholder: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  emptyBannerContent: {
    alignItems: "center",
    gap: 5,
  },
  emptyBannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
  },
  emptyBannerSubtitle: {
    fontSize: 12,
    color: "#777",
  },
  logoUploadButton: {
    position: "absolute",
    left: 14,
    bottom: 0,
    alignItems: "center",
  },
  logoMediaPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    borderWidth: 4,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  tournamentBannerPreview: {
    width: "100%",
    height: "100%",
  },
  tournamentLogoPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },
  cameraIconBadge: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
  },
  logoCameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#B71C1C",
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  addMediaText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  logoUploadText: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "800",
    color: "#B71C1C",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
    fontWeight: "700",
  },
  formInput: {
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  emailHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "800",
    color: "#222",
    marginBottom: 10,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  dateInputActive: {
    borderColor: "#B71C1C",
    backgroundColor: "#FFF7F7",
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
    shadowColor: "#B71C1C",
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
    backgroundColor: "#FBE9E7",
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
    backgroundColor: "#B71C1C",
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
    gap: 7,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipText: {
    fontSize: 12,
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
    color: "#B71C1C",
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
    backgroundColor: "#B71C1C",
    borderColor: "#B71C1C",
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
    shadowColor: "#B71C1C",
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
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
    color: "#B71C1C",
    fontWeight: "800",
  },
  tdTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "15%",
    right: "15%",
    height: 3,
    backgroundColor: "#B71C1C",
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
    color: "#B71C1C",
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
    borderLeftColor: "#10B981",
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
    color: "#B71C1C",
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
    borderBottomColor: "#FBE9E7",
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
    color: "#C62828",
    fontWeight: "600",
  },
  tsMenuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tsNewBadge: {
    backgroundColor: "#C62828",
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
    borderBottomColor: "#E0E0E0",
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
    color: "#B71C1C",
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
    padding: 16,
    backgroundColor: "#F7F7F7",
  },
  tossHero: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  coinStage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF7D6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  coinOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#B45309",
    alignItems: "center",
    justifyContent: "center",
  },
  coinInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#78350F",
    alignItems: "center",
    justifyContent: "center",
  },
  tossTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#171717",
    textAlign: "center",
  },
  tossSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
  tossTeamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  tossTeamCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tossTeamCardSelected: {
    borderColor: "#B71C1C",
    backgroundColor: "#FFF7F7",
  },
  tossTeamJersey: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    position: "relative",
  },
  tossCheckBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  tossTeamName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#666",
    textAlign: "center",
  },
  tossTeamNameSelected: {
    color: "#B71C1C",
  },
  tossDecisionSection: {
    marginBottom: 24,
  },
  tossDecisionTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#333",
    textAlign: "center",
    marginBottom: 14,
  },
  tossDecisionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  tossDecisionCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tossDecisionCardSelected: {
    borderColor: "#B71C1C",
    backgroundColor: "#FFF7F7",
  },
  cricketActionFigure: {
    width: 78,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 12,
  },
  figureHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#8B0000",
  },
  figureBody: {
    width: 24,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#B71C1C",
    marginTop: 2,
  },
  bowlerFigureBody: {
    transform: [{ rotate: "-10deg" }],
  },
  figureLegs: {
    width: 32,
    height: 18,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderColor: "#8B0000",
    marginTop: -1,
  },
  batHandle: {
    position: "absolute",
    right: 12,
    bottom: 14,
    width: 8,
    height: 48,
    borderRadius: 4,
    backgroundColor: "#92400E",
    transform: [{ rotate: "28deg" }],
  },
  bowlingArm: {
    position: "absolute",
    right: 18,
    top: 24,
    width: 8,
    height: 40,
    borderRadius: 4,
    backgroundColor: "#8B0000",
    transform: [{ rotate: "-42deg" }],
  },
  bowlingBall: {
    position: "absolute",
    right: 8,
    top: 14,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#B71C1C",
  },
  tossDecisionText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#666",
  },
  tossDecisionTextSelected: {
    color: "#B71C1C",
  },
  // Player Selection Page Styles
  playerSelectionContainer: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    padding: 16,
  },
  playerSelectionHero: {
    marginBottom: 18,
  },
  playerSelectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#171717",
  },
  playerSelectionSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#666",
  },
  playerSection: {
    marginBottom: 22,
  },
  playerSectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#333",
    marginBottom: 12,
  },
  playerSelectionRow: {
    flexDirection: "row",
    gap: 16,
  },
  playerSelectionCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerSelectionCardSelected: {
    borderColor: "#B71C1C",
    backgroundColor: "#FFF7F7",
  },
  bowlerCard: {
    maxWidth: "48%",
  },
  playerIconContainer: {
    marginBottom: 12,
  },
  selectionPlayerImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 10,
  },
  playerRoleFigure: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FBE9E7",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 10,
    overflow: "hidden",
  },
  playerSelectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  selectedPlayerName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#B71C1C",
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
    backgroundColor: "#E0E0E0",
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#10B981",
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
    color: "#B71C1C",
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
    backgroundColor: "#B71C1C",
    borderColor: "#B71C1C",
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
    backgroundColor: "#F7F7F7",
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
    borderBottomColor: "#E0E0E0",
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
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playerItemSelected: {
    backgroundColor: "#FFF7F7",
    borderWidth: 1,
    borderColor: "#B71C1C",
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
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  playerAvatarImage: {
    width: "100%",
    height: "100%",
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
    backgroundColor: "#111827",
  },
  scoringHeader: {
    backgroundColor: "#212121",
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  endMatchButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#D32F2F",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
  },
  endMatchButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  scoringTeamName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#EF9A9A",
    marginBottom: 4,
  },
  scoringTotal: {
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    color: "#FFF",
  },
  matchHeaderText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    opacity: 0.9,
  },
  batsmenSection: {
    flexDirection: "row",
    backgroundColor: "#212121",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  batsmanCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#2C3E50",
  },
  batsmanIcon: {
    marginRight: 8,
  },
  scoringPlayerImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  batsmanName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
    flex: 1,
  },
  batsmanScore: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
  },
  bowlerSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#212121",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2C3E50",
  },
  bowlerIcon: {
    marginRight: 8,
  },
  bowlerName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
    flex: 1,
  },
  bowlerStats: {
    marginRight: 8,
  },
  bowlerFigures: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFF",
  },
  wicketTypeSection: {
    flexDirection: "row",
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  wicketTypeButton: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
    marginHorizontal: 4,
  },
  wicketTypeButtonActive: {
    borderColor: "#10B981",
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
    backgroundColor: "#F3F4F6",
    padding: 8,
    gap: 8,
  },
  scoringRow: {
    flexDirection: "row",
    flex: 1,
    gap: 8,
  },
  scoreButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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

  // ── Team Selection Premium Styles ──────────────────────────────
  tsMatchHeader: {
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  tsHeaderDecoL: {
    position: "absolute",
    top: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(185,28,28,0.18)",
  },
  tsHeaderDecoR: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(245,158,11,0.12)",
  },
  tsHeaderTop: { marginBottom: 10 },
  tsHeaderBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,158,11,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.35)",
  },
  tsHeaderBadgeTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: "#F59E0B",
    letterSpacing: 1.2,
  },
  tsHeaderTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tsHeaderSub: { fontSize: 13, color: "#9E9E9E", fontWeight: "500" },

  tsTeamCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tsTeamCardB: {
    shadowColor: "#1E3A5F",
  },
  tsTeamCardReady: {
    borderColor: "#BBF7D0",
    shadowColor: "#16A34A",
    shadowOpacity: 0.15,
  },
  tsTeamCardStrip: {
    height: 5,
    width: "100%",
  },
  tsTeamCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  tsTeamLogoWrap: { position: "relative" },
  tsTeamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  tsTeamLogoLetter: { fontSize: 26, fontWeight: "900", color: "#FFF" },
  tsTeamLogoEmpty: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  tsReadyDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  tsTeamInfo: { flex: 1 },
  tsTeamSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  tsTeamSlot: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B71C1C",
    letterSpacing: 1.2,
  },
  tsTeamStatus: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tsTeamStatusReady: { backgroundColor: "#DCFCE7" },
  tsTeamStatusEmpty: { backgroundColor: "#F1F5F9" },
  tsTeamStatusTxt: { fontSize: 9, fontWeight: "700", color: "#374151" },
  tsTeamName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#212121",
    marginBottom: 4,
  },
  tsTeamMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  tsTeamMetaTxt: { fontSize: 11, color: "#616161", fontWeight: "500" },
  tsTeamEmptyHint: { fontSize: 11, color: "#9E9E9E", fontStyle: "italic" },
  tsTeamActions: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tsActionBtnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#B71C1C",
    backgroundColor: "#FFF9F9",
  },
  tsActionBtnOutlineTxt: { fontSize: 13, fontWeight: "700", color: "#B71C1C" },
  tsActionBtnFill: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  tsActionBtnFillGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
  },
  tsActionBtnFillTxt: { fontSize: 13, fontWeight: "700", color: "#FFF" },

  tsVsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 14,
    paddingHorizontal: 4,
  },
  tsVsLine: { flex: 1, height: 1.5, backgroundColor: "#E2E8F0" },
  tsVsCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 14,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  tsVsTxt: { fontSize: 15, fontWeight: "900", color: "#FFF", letterSpacing: 1 },

  tsReadyBar: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  tsReadyBarSlot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
  tsReadyBarSlotDone: { backgroundColor: "#22C55E" },

  tsPlayBtn: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tsPlayBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 17,
    gap: 10,
  },
  tsPlayBtnTxt: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 0.5,
  },

  tsEmptyHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tsEmptyHintTxt: { fontSize: 13, color: "#9E9E9E", fontWeight: "500" },
});

// ── Create Team Styles (ctStyles) ────────────────────────────────
const ctStyles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  headerDeco1: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  headerDeco2: {
    position: "absolute",
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  headerTop: { marginBottom: 6 },
  headerSlotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerSlotTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "500",
    marginBottom: 12,
  },
  progressBar: { flexDirection: "row", gap: 5, width: "100%", marginBottom: 4 },
  progressSlot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressSlotDone: { backgroundColor: "#FFF" },
  progressLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "600",
  },

  body: { padding: 10, gap: 8 },

  sectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#FBE9E7",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#212121", flex: 1 },
  sectionOptional: {
    fontSize: 10,
    color: "#9E9E9E",
    fontWeight: "600",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  fieldGroup: { marginBottom: 8 },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  fieldHint: { fontSize: 10, color: "#9E9E9E", marginBottom: 4 },
  req: { color: "#EF4444" },
  fieldInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  fieldInputDone: { borderColor: "#BBF7D0", backgroundColor: "#F0FFF4" },
  fieldText: { flex: 1, fontSize: 13, color: "#212121", fontWeight: "500" },

  mobileRow: { flexDirection: "row", gap: 6 },
  dialCodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  dialCodeTxt: { fontSize: 13, fontWeight: "700", color: "#212121" },
  dialDropdown: {
    marginTop: 4,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  dialOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
  },
  dialFlag: { fontSize: 16 },
  dialCountry: { flex: 1, fontSize: 12, color: "#374151", fontWeight: "500" },
  dialCode: { fontSize: 12, color: "#616161", fontWeight: "600" },

  captainBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
  },
  captainBadgeTxt: { fontSize: 10, fontWeight: "900", color: "#FFF" },

  chipRow: { flexDirection: "row", gap: 6, marginTop: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#FAFAFA",
  },
  chipActive: { borderColor: "#B71C1C", backgroundColor: "#FBE9E7" },
  chipTxt: { fontSize: 12, fontWeight: "700", color: "#616161" },
  chipTxtActive: { color: "#B71C1C" },

  ruleBox: {
    marginTop: 8,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    padding: 10,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#B71C1C",
  },
  ruleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ruleTxt: { fontSize: 11, color: "#475569", flex: 1 },
  ruleCheck: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },

  addPlayersNote: {
    fontSize: 11,
    color: "#9E9E9E",
    marginBottom: 8,
    fontStyle: "italic",
  },
  addOptions: { gap: 7 },
  addOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  addOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addOptionInfo: { flex: 1 },
  addOptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 1,
  },
  addOptionSub: { fontSize: 10, color: "#616161" },

  createBtn: {
    borderRadius: 13,
    overflow: "hidden",
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  createBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  createBtnTxt: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.2,
  },
});
