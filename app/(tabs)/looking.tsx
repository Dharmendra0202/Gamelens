import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LookingScreen() {
  const [activeTab, setActiveTab] = useState('forYou');

  const matches = [
    { id: 1, team1: 'Team Warriors', team2: 'Team Strikers', time: '6:00 PM', date: 'Today', location: 'Wankhede Stadium', distance: '2.5 km' },
    { id: 2, team1: 'Mumbai Indians', team2: 'Chennai Kings', time: '7:30 PM', date: 'Today', location: 'Brabourne Stadium', distance: '3.2 km' },
    { id: 3, team1: 'Delhi Capitals', team2: 'Kolkata Knights', time: '4:00 PM', date: 'Tomorrow', location: 'DY Patil Stadium', distance: '5.1 km' },
    { id: 4, team1: 'Royal Challengers', team2: 'Punjab Kings', time: '8:00 PM', date: 'Tomorrow', location: 'MCA Stadium', distance: '4.8 km' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#E63946", "#C1121F", "#780000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="baseball" size={24} color="#FFF" />
          </View>
          <TouchableOpacity style={styles.proButton}>
            <Text style={styles.proButtonText}>PRO @ ₹199</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
          onPress={() => setActiveTab('forYou')}
        >
          <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>
            For you
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'club' && styles.activeTab]}
          onPress={() => setActiveTab('club')}
        >
          <View style={styles.proTag}>
            <Text style={styles.proTagText}>PRO</Text>
          </View>
          <Text style={[styles.tabText, activeTab === 'club' && styles.activeTabText]}>
            Club
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={32} color="#9D4EDD" />
              <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>You</Text>
          </View>
        </View>

        {/* Matches Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matches of your interest</Text>
            <TouchableOpacity>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {matches.map((match) => (
            <TouchableOpacity key={match.id} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchBadgeText}>{match.date}</Text>
                </View>
                <Text style={styles.matchTime}>{match.time}</Text>
              </View>
              <View style={styles.matchTeams}>
                <Text style={styles.teamName}>{match.team1}</Text>
                <Text style={styles.vsText}>VS</Text>
                <Text style={styles.teamName}>{match.team2}</Text>
              </View>
              <View style={styles.matchLocation}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.locationText}>
                  {match.location}, {match.distance} away
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#CCC" />
          <Text style={styles.emptyStateText}>No more matches to show</Text>
          <Text style={styles.emptyStateSubtext}>Check back later for new matches</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  proButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#00D9FF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#E63946',
  },
  tabText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#333',
    fontWeight: '600',
  },
  proTag: {
    backgroundColor: '#00D9FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  profileCard: {
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  },
  viewAll: {
    fontSize: 14,
    color: '#00D9FF',
    fontWeight: '600',
  },
  matchCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchBadge: {
    backgroundColor: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  matchTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vsText: {
    fontSize: 14,
    color: '#E63946',
    marginHorizontal: 12,
    fontWeight: '600',
  },
  matchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
  },
});
