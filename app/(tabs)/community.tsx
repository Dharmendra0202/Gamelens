import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Animated, Platform } from 'react-native';
import { AnimatedViewTransition } from '@/components/ui/animated-view-transition';
import { TabScreenWrapper } from '@/components/ui/tab-screen-wrapper';
import { shareContent } from '@/utils/share';
import { useSwipeableTabs } from '@/hooks/use-swipeable-tabs';
import { CricketPostCard, CricketPost } from '@/components/ui/cricket-post-card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CommunityScreen() {
  const {
    activeTab,
    scrollRef: horizontalScrollRef,
    scrollX,
    goToTab: handleTabPressInternal,
    handleScroll,
    handleScrollEnd: handleHorizontalScrollEnd,
    handleScrollEndDrag,
  } = useSwipeableTabs({
    tabs: ['feed', 'groups', 'events'],
    prevMainTab: 2,  // My Cricket
    nextMainTab: 4,  // Store
  });

  const handleTabPress = (tabName: string) => handleTabPressInternal(tabName);

  const [posts, setPosts] = useState<CricketPost[]>([
    {
      id: 1,
      user: 'Rahul Sharma',
      initials: 'RS',
      role: 'Batsman',
      time: '2 hours ago',
      content: 'Just finished an amazing match! Team won by 6 wickets 🏏🔥 #CricketLife',
      tags: ['CricketLife'],
      likes: 234,
      comments: 45,
      shares: 12,
      color: '#B91C1C',
      liked: false,
      saved: false,
      verified: true,
    },
    {
      id: 2,
      user: 'Priya Patel',
      initials: 'PP',
      role: 'Wicket Keeper',
      time: '5 hours ago',
      content: 'Looking for players for weekend match in Mumbai. Anyone interested? Need 2 batsmen and 1 bowler. #CricketIndia',
      tags: ['CricketIndia'],
      likes: 89,
      comments: 23,
      shares: 5,
      color: '#DC2626',
      liked: false,
      saved: false,
      verified: false,
    },
    {
      id: 3,
      user: 'Vikas Kumar',
      initials: 'VK',
      role: 'Bowler',
      time: '1 day ago',
      content: 'Best catch of my career today! 🙌 Thanks to my team for the support. #CatchOfTheDay',
      tags: ['CatchOfTheDay'],
      likes: 456,
      comments: 78,
      shares: 34,
      color: '#991B1B',
      liked: false,
      saved: false,
      verified: false,
    },
  ]);

  const handleLike = (id: number) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === id ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 } : post
      )
    );
  };

  const handleComment = (post: CricketPost) => {
    console.log('Comment on post:', post.id);
  };

  const handleShare = async (id: number) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const shared = await shareContent({
      title: `Post by ${post.user}`,
      message: post.content,
      type: 'post',
      id: post.id,
    });
    if (shared) {
      setPosts(prev =>
        prev.map(p => (p.id === id ? { ...p, shares: p.shares + 1 } : p))
      );
    }
  };

  const handleSave = (id: number) => {
    setPosts(prev =>
      prev.map(post => (post.id === id ? { ...post, saved: !post.saved } : post))
    );
  };

  const groups = [
    { id: 1, name: 'Mumbai Cricket Club', members: '2.5K', icon: '🏏' },
    { id: 2, name: 'Weekend Warriors', members: '1.2K', icon: '⚡' },
    { id: 3, name: 'Cricket Enthusiasts', members: '5.8K', icon: '🎯' },
  ];

  return (
    <TabScreenWrapper swipeEnabled={false}>
      <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#B91C1C", "#991B1B", "#7F1D1D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            GAME<Text style={styles.headerTitleOrange}>LENS</Text> <Text style={styles.headerTitleTab}>community</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {/* Real-time sliding indicator line */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: SCREEN_WIDTH / 3 - 32,
            height: 3,
            backgroundColor: '#B91C1C',
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
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress('feed')}
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
          style={styles.tab}
          onPress={() => handleTabPress('groups')}
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
          style={styles.tab}
          onPress={() => handleTabPress('events')}
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

      <Animated.ScrollView
        ref={horizontalScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleHorizontalScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        style={styles.content}
        scrollEventThrottle={16}
        nestedScrollEnabled
      >
        {/* Tab 1: Feed */}
        <ScrollView style={{ width: SCREEN_WIDTH }} showsVerticalScrollIndicator={false}>
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
            <CricketPostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onComment={handleComment}
              onShare={handleShare}
              onSave={handleSave}
            />
          ))}
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Tab 2: Groups */}
        <ScrollView style={{ width: SCREEN_WIDTH }} showsVerticalScrollIndicator={false}>
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
          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Tab 3: Events */}
        <ScrollView style={{ width: SCREEN_WIDTH }} showsVerticalScrollIndicator={false}>
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
          <View style={{ height: 80 }} />
        </ScrollView>
      </Animated.ScrollView>
      </View>
    </TabScreenWrapper>
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
    paddingTop: Platform.OS === 'ios' ? 44 : 35,
    height: Platform.OS === 'ios' ? 92 : 83,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  headerTitleOrange: {
    color: '#FCA5A5',
  },
  headerTitleTab: {
    fontWeight: '400',
    fontSize: 15,
    color: '#FECACA',
    textTransform: 'lowercase',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
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
