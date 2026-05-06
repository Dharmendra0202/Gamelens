import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function MyCricketScreen() {
  const stats = [
    { label: 'Matches', value: '45', icon: 'baseball-outline' },
    { label: 'Runs', value: '1,234', icon: 'trending-up-outline' },
    { label: 'Wickets', value: '23', icon: 'trophy-outline' },
    { label: 'Catches', value: '18', icon: 'hand-left-outline' },
  ];

  const recentMatches = [
    { id: 1, opponent: 'Team Warriors', result: 'Won', score: '156/8', date: '2 days ago', myScore: '45 runs' },
    { id: 2, opponent: 'Mumbai Indians', result: 'Lost', score: '142/10', date: '5 days ago', myScore: '28 runs, 2 wickets' },
    { id: 3, opponent: 'Delhi Capitals', result: 'Won', score: '178/6', date: '1 week ago', myScore: '67 runs' },
  ];

  const achievements = [
    { id: 1, title: 'Century Maker', description: 'Score 100+ runs in a match', icon: '🏆', unlocked: false },
    { id: 2, title: 'Hat-trick Hero', description: 'Take 3 wickets in 3 balls', icon: '🎯', unlocked: false },
    { id: 3, title: 'Match Winner', description: 'Win 10 matches', icon: '⭐', unlocked: true },
    { id: 4, title: 'Team Player', description: 'Play 50 matches', icon: '🤝', unlocked: true },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cricket</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="settings-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>ME</Text>
          </View>
          <Text style={styles.profileName}>My Profile</Text>
          <Text style={styles.profileRole}>All-Rounder</Text>
          <View style={styles.profileStats}>
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>4.5</Text>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>12</Text>
              <Text style={styles.profileStatLabel}>Rank</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStatItem}>
              <Text style={styles.profileStatValue}>Gold</Text>
              <Text style={styles.profileStatLabel}>Tier</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Statistics</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={32} color="#9D4EDD" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Matches</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentMatches.map((match) => (
            <TouchableOpacity key={match.id} style={styles.matchCard}>
              <View style={styles.matchCardHeader}>
                <Text style={styles.matchOpponent}>{match.opponent}</Text>
                <View style={[
                  styles.resultBadge,
                  match.result === 'Won' ? styles.wonBadge : styles.lostBadge
                ]}>
                  <Text style={styles.resultText}>{match.result}</Text>
                </View>
              </View>
              <Text style={styles.matchScore}>Score: {match.score}</Text>
              <Text style={styles.myScore}>My Performance: {match.myScore}</Text>
              <Text style={styles.matchDate}>{match.date}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.lockedAchievement
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                {!achievement.unlocked && (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={16} color="#999" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Add Match</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="bar-chart-outline" size={20} color="#9D4EDD" />
            <Text style={styles.secondaryButtonText}>View Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E8FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#9D4EDD',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  iconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFF',
    padding: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#9D4EDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9D4EDD',
    marginBottom: 4,
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 14,
    color: '#9D4EDD',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  matchCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchOpponent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  wonBadge: {
    backgroundColor: '#4CAF50',
  },
  lostBadge: {
    backgroundColor: '#F44336',
  },
  resultText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  matchScore: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  myScore: {
    fontSize: 14,
    color: '#9D4EDD',
    fontWeight: '600',
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 12,
    color: '#999',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  lockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#9D4EDD',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#9D4EDD',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9D4EDD',
  },
});
