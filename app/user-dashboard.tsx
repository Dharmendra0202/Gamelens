import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { useAuth } from "@/hooks/use-auth";
import { LocalStorage } from "@/services/storage";
import type { Match, Tournament } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { profile } = useAuth();

  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [matchHistory, tournamentList] = await Promise.all([
      LocalStorage.getMatchHistory(),
      LocalStorage.getTournaments(),
    ]);
    setMatches(matchHistory);
    setTournaments(tournamentList);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Stats derived from real data
  const totalMatches = profile?.matches_played ?? matches.length;
  const totalTournaments = tournaments.length;
  const matchesWon = matches.filter(
    (m) => m.status === "completed" && m.innings.length >= 2
  ).length; // simplified — refine with actual win logic

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Your Dashboard</Text>
          <Text style={styles.headerSubtitle}>Your cricket overview</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#7C3AED"]} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="baseball-outline" size={18} color="#7C3AED" />
            <Text style={styles.statNumber}>{totalMatches}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={18} color="#D97706" />
            <Text style={styles.statNumber}>{totalTournaments}</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="ribbon-outline" size={18} color="#059669" />
            <Text style={styles.statNumber}>{matchesWon}</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            {matches.length > 0 && (
              <TouchableOpacity onPress={() => Alert.alert("Match History", "Full match history coming soon")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {matches.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="baseball-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptyDesc}>
                Start a match from the Sport tab to see your history here.
              </Text>
            </View>
          ) : (
            matches.slice(0, 3).map((match) => (
              <View key={match.id} style={styles.matchCard}>
                <View style={styles.matchTeams}>
                  <Text style={styles.matchTeamName}>{match.teamA.name}</Text>
                  <Text style={styles.matchVs}>vs</Text>
                  <Text style={styles.matchTeamName}>{match.teamB.name}</Text>
                </View>
                <View style={styles.matchMeta}>
                  <Text style={styles.matchDate}>{match.matchDate}</Text>
                  <View
                    style={[
                      styles.matchStatusBadge,
                      {
                        backgroundColor:
                          match.status === "completed" ? "#DCFCE7" : "#FEF3C7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchStatusText,
                        {
                          color:
                            match.status === "completed" ? "#166534" : "#92400E",
                        },
                      ]}
                    >
                      {match.status === "completed" ? "Completed" : "Live"}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* My Tournaments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tournaments</Text>
            {tournaments.length > 0 && (
              <TouchableOpacity onPress={() => Alert.alert("Tournaments", "Full tournament list coming soon")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {tournaments.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="trophy-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No tournaments</Text>
              <Text style={styles.emptyDesc}>
                Create or join a tournament from the Sport tab.
              </Text>
            </View>
          ) : (
            tournaments.slice(0, 3).map((t) => (
              <View key={t.id} style={styles.tournamentCard}>
                <View style={styles.tournamentInfo}>
                  <Ionicons name="trophy" size={18} color="#D97706" />
                  <Text style={styles.tournamentName}>{t.name}</Text>
                </View>
                <View style={styles.tournamentMeta}>
                  <Text style={styles.tournamentTeams}>
                    {t.teams.length} teams
                  </Text>
                  <View
                    style={[
                      styles.matchStatusBadge,
                      {
                        backgroundColor:
                          t.status === "completed"
                            ? "#DCFCE7"
                            : t.status === "live"
                            ? "#FEF3C7"
                            : "#EDE9FE",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchStatusText,
                        {
                          color:
                            t.status === "completed"
                              ? "#166534"
                              : t.status === "live"
                              ? "#92400E"
                              : "#5B21B6",
                        },
                      ]}
                    >
                      {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinks}>
            {[
              {
                icon: "calendar-outline" as const,
                label: "My Bookings",
                color: "#2563EB",
                route: "/profile/my-bookings",
              },
              {
                icon: "location-outline" as const,
                label: "Saved Addresses",
                color: "#7C3AED",
                route: "/profile/saved-addresses",
              },
              {
                icon: "card-outline" as const,
                label: "Payment Methods",
                color: "#059669",
                route: "/profile/payment-methods",
              },
              {
                icon: "headset-outline" as const,
                label: "Help & Support",
                color: "#DC2626",
                route: "/profile/help-support",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickLinkItem}
                activeOpacity={0.7}
                onPress={() => router.push(item.route as never)}
              >
                <View
                  style={[
                    styles.quickLinkIcon,
                    { backgroundColor: item.color + "15" },
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.quickLinkLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color="#9E9E9E" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#212121",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#616161",
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7C3AED",
  },

  // Empty State
  emptyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  // Match Card
  matchCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  matchTeams: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  matchTeamName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
  },
  matchVs: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  matchMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  matchDate: {
    fontSize: 12,
    color: "#64748B",
  },
  matchStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Tournament Card
  tournamentCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tournamentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tournamentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
  },
  tournamentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  tournamentTeams: {
    fontSize: 12,
    color: "#64748B",
  },

  // Quick Links
  quickLinks: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  quickLinkIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLinkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
});
