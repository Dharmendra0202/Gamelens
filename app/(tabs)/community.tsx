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

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState('feed');

  const posts = [
    {
      id: 1,
      user: 'Rahul Sharma',
      userInitials: 'RS',
      time: '2 hours ago',
      content: 'Just finished an amazing match! Team won by 6 wickets 🏏🔥 #CricketLife',
      likes: 234,
      comments: 45,
      shares: 12,
      color: '#B91C1C',
    },
    {
      id: 2,
      user: 'Priya Patel',
      userInitials: 'PP',
      time: '5 hours ago',
      content: 'Looking for players for weekend match in Mumbai. Anyone interested? Need 2 batsmen and 1 bowler.',
      likes: 89,
      comments: 23,
      shares: 5,
      color: '#DC2626',
    },
    {
      id: 3,
      user: 'Vikas Kumar',
      userInitials: 'VK',
      time: '1 day ago',
      content: 'Best catch of my career today! 🙌 Thanks to my team for the support.',
      likes: 456,
      comments: 78,
      shares: 34,
      color: '#991B1B',
    },
  ];

  const groups = [
    { id: 1, name: 'Mumbai Cricket Club', members: '2.5K', icon: '🏏' },
    { id: 2, name: 'Weekend Warriors', members: '1.2K', icon: '⚡' },
    { id: 3, name: 'Cricket Enthusiasts', members: '5.8K', icon: '🎯' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
          onPress={() => setActiveTab('feed')}
        >
          <Ionicons
            name="home"
            size={20}
            color={activeTab === 'feed' ? '#B91C1C' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
            Feed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'groups' ? '#B91C1C' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'groups' && styles.activeTabText]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'events' && styles.activeTab]}
          onPress={() => setActiveTab('events')}
        >
          <Ionicons
            name="calendar"
            size={20}
            color={activeTab === 'events' ? '#B91C1C' : '#999'}
          />
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>
            Events
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'feed' && (
          <>
            {/* Create Post */}
            <View style={styles.createPostSection}>
              <TouchableOpacity style={styles.createPost}>
                <View style={styles.createPostAvatar}>
                  <Text style={styles.createPostInitials}>ME</Text>
                </View>
                <Text style={styles.createPostPlaceholder}>{"What's on your mind?"}</Text>
              </TouchableOpacity>
              <View style={styles.createPostActions}>
                <TouchableOpacity style={styles.createPostAction}>
                  <Ionicons name="image-outline" size={20} color="#B91C1C" />
                  <Text style={styles.createPostActionText}>Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createPostAction}>
                  <Ionicons name="videocam-outline" size={20} color="#B91C1C" />
                  <Text style={styles.createPostActionText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createPostAction}>
                  <Ionicons name="location-outline" size={20} color="#B91C1C" />
                  <Text style={styles.createPostActionText}>Location</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Posts */}
            {posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={[styles.postUserAvatar, { backgroundColor: post.color }]}>
                    <Text style={styles.postUserInitials}>{post.userInitials}</Text>
                  </View>
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{post.user}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                <View style={styles.postStats}>
                  <Text style={styles.postStatsText}>{post.likes} likes</Text>
                  <Text style={styles.postStatsText}>
                    {post.comments} comments • {post.shares} shares
                  </Text>
                </View>

                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="heart-outline" size={22} color="#666" />
                    <Text style={styles.postActionText}>Like</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={22} color="#666" />
                    <Text style={styles.postActionText}>Comment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="share-social-outline" size={22} color="#666" />
                    <Text style={styles.postActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === 'groups' && (
          <View style={styles.groupsSection}>
            <TouchableOpacity style={styles.createGroupButton}>
              <Ionicons name="add-circle" size={24} color="#B91C1C" />
              <Text style={styles.createGroupText}>Create New Group</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Your Groups</Text>
            {groups.map((group) => (
              <TouchableOpacity key={group.id} style={styles.groupCard}>
                <View style={styles.groupIcon}>
                  <Text style={styles.groupIconText}>{group.icon}</Text>
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupMembers}>{group.members} members</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Suggested Groups</Text>
            <TouchableOpacity style={styles.groupCard}>
              <View style={styles.groupIcon}>
                <Text style={styles.groupIconText}>🏆</Text>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>IPL Fans United</Text>
                <Text style={styles.groupMembers}>12.5K members</Text>
              </View>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'events' && (
          <View style={styles.eventsSection}>
            <TouchableOpacity style={styles.createEventButton}>
              <Ionicons name="add-circle" size={24} color="#B91C1C" />
              <Text style={styles.createEventText}>Create Event</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity style={styles.eventCard}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>15</Text>
                <Text style={styles.eventMonth}>MAY</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>Weekend Cricket Tournament</Text>
                <View style={styles.eventDetail}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>Wankhede Stadium</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>10:00 AM - 6:00 PM</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>45 attending</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.eventCard}>
              <View style={styles.eventDate}>
                <Text style={styles.eventDay}>22</Text>
                <Text style={styles.eventMonth}>MAY</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>Cricket Coaching Camp</Text>
                <View style={styles.eventDetail}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>Brabourne Stadium</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>8:00 AM - 12:00 PM</Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons name="people-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>23 attending</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
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
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#B91C1C',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#B91C1C',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  createPostSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  createPost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#B91C1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createPostInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  createPostPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  createPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  createPostActionText: {
    fontSize: 12,
    color: '#B91C1C',
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postUserInitials: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 8,
  },
  postStatsText: {
    fontSize: 12,
    color: '#666',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  groupsSection: {
    padding: 16,
  },
  createGroupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: '#B91C1C',
    borderStyle: 'dashed',
  },
  createGroupText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B91C1C',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  groupIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  groupIconText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 12,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#B91C1C',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  eventsSection: {
    padding: 16,
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: '#B91C1C',
    borderStyle: 'dashed',
  },
  createEventText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B91C1C',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  eventDate: {
    width: 60,
    height: 60,
    backgroundColor: '#B91C1C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  eventMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventDetailText: {
    fontSize: 12,
    color: '#666',
  },
});
