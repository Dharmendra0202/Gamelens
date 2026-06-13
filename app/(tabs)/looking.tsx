import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TabScreenWrapper } from '@/components/ui/tab-screen-wrapper';
import { SectionHeader } from '@/components/ui/section-header';

const quickActions = [
  {
    id: 'opponent',
    icon: 'people-outline',
    title: 'Looking for opponent',
    subtitle: 'Post match time, ground, ball type',
  },
  {
    id: 'tournament',
    icon: 'trophy-outline',
    title: 'Create tournament post',
    subtitle: 'Invite teams and solo players',
  },
  {
    id: 'player',
    icon: 'person-add-outline',
    title: 'Find players',
    subtitle: 'Ask for batter, bowler, keeper',
  },
] as const;

type QuickActionId = (typeof quickActions)[number]['id'];

type Post = {
  id: number;
  name: string;
  role: string;
  time: string;
  tag: string;
  message: string;
  meta: string[];
  replies: number;
};

const actionTemplates: Record<QuickActionId, string> = {
  opponent:
    'Looking for an opponent this weekend. Ground: , time: , overs: , ball type: .',
  tournament:
    'Creating a tournament soon. Teams needed: , entry fee: , location: , date: .',
  player:
    'Need players for our match. Role needed: , location: , time: .',
};

const actionTags: Record<QuickActionId, string> = {
  opponent: 'Opponent needed',
  tournament: 'Tournament',
  player: 'Players needed',
};

const initialPosts: Post[] = [
  {
    id: 1,
    name: 'Aman XI',
    role: 'Team captain',
    time: '10 min ago',
    tag: 'Opponent needed',
    message:
      'Need one leather ball team for Sunday 7 AM at Shivaji Ground. 20 overs, umpire available. DM if your team is ready.',
    meta: ['Borivali', '20 overs', 'Leather ball'],
    replies: 8,
  },
  {
    id: 2,
    name: 'Rohit Sharma',
    role: 'All-rounder',
    time: '24 min ago',
    tag: 'Available player',
    message:
      'I can join any team this weekend. Right hand batter, medium pace bowler. Prefer morning matches near Andheri or Bandra.',
    meta: ['All-rounder', 'Morning slot', 'Mumbai'],
    replies: 4,
  },
  {
    id: 3,
    name: 'Night Riders Club',
    role: 'Tournament host',
    time: '1 hr ago',
    tag: 'Tournament',
    message:
      'Launching a 16-team box cricket tournament next month. Entry open for corporate and local teams. Winners get cash prize and trophies.',
    meta: ['16 teams', 'Box cricket', 'Registration open'],
    replies: 16,
  },
];

export default function LookingScreen() {
  const [selectedAction, setSelectedAction] = useState<QuickActionId>('opponent');
  const [draft, setDraft] = useState('');
  const [feedPosts, setFeedPosts] = useState<Post[]>(initialPosts);
  const [contactedPostIds, setContactedPostIds] = useState<number[]>([]);

  // Entrance animations
  const composerAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const feedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(composerAnim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(actionsAnim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(feedAnim, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const selectAction = (actionId: QuickActionId) => {
    setSelectedAction(actionId);
    setDraft(actionTemplates[actionId]);
  };

  const submitPost = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    const newPost: Post = {
      id: Date.now(),
      name: 'You',
      role: 'Cricket player',
      time: 'Just now',
      tag: actionTags[selectedAction],
      message: trimmedDraft,
      meta: ['Open request', 'Local match', 'Chat available'],
      replies: 0,
    };

    setFeedPosts([newPost, ...feedPosts]);
    setDraft('');
  };

  const addReply = (postId: number) => {
    setFeedPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, replies: post.replies + 1 } : post
      )
    );
  };

  const toggleMessage = (postId: number) => {
    setContactedPostIds((currentIds) =>
      currentIds.includes(postId)
        ? currentIds.filter((id) => id !== postId)
        : [...currentIds, postId]
    );
  };

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
      <LinearGradient
        colors={['#00A66A', '#0F766E', '#064E3B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Looking</Text>
        <Text style={styles.headerSubtitle}>Find opponents, players, and cricket posts near you</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{
          opacity: composerAnim,
          transform: [{ translateY: composerAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        }}>
        <View style={styles.composer}>
          <View style={styles.composerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>You</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Looking for an opponent or want to post something?"
              placeholderTextColor="#8A8A8A"
              value={draft}
              onChangeText={setDraft}
              multiline
            />
          </View>
          <View style={styles.composerActions}>
            <TouchableOpacity
              style={[
                styles.composerButton,
                selectedAction === 'opponent' && styles.activeComposerButton,
              ]}
              onPress={() => selectAction('opponent')}
            >
              <Ionicons name="search-outline" size={18} color="#00A66A" />
              <Text style={styles.composerButtonText}>Opponent</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.composerButton,
                selectedAction === 'tournament' && styles.activeComposerButton,
              ]}
              onPress={() => selectAction('tournament')}
            >
              <Ionicons name="trophy-outline" size={18} color="#00A66A" />
              <Text style={styles.composerButtonText}>Tournament</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postButton, !draft.trim() && styles.disabledPostButton]}
              onPress={submitPost}
              disabled={!draft.trim()}
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

        <Animated.View style={{
          opacity: actionsAnim,
          transform: [{ translateY: actionsAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }}>
          <View style={styles.quickActionList}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  selectedAction === action.id && styles.activeQuickActionCard,
                ]}
                onPress={() => selectAction(action.id)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon} size={22} color="#00A66A" />
                </View>
                <View style={styles.quickActionText}>
                  <Text style={styles.quickActionTitle}>{action.title}</Text>
                  <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={{
          opacity: feedAnim,
          transform: [{ translateY: feedAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
        }}>
          <SectionHeader
            title="Community posts"
            subtitle="Live requests from players and clubs"
            style={{ paddingHorizontal: 0, marginTop: 22, marginBottom: 10 }}
          />

          {feedPosts.map((post) => {
            const hasContacted = contactedPostIds.includes(post.id);

            return (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postAvatar}>
                  <Text style={styles.postAvatarText}>
                    {post.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.postIdentity}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <Text style={styles.postRole}>
                    {post.role} - {post.time}
                  </Text>
                </View>
                <View style={styles.postTag}>
                  <Text style={styles.postTagText}>{post.tag}</Text>
                </View>
              </View>

              <Text style={styles.postMessage}>{post.message}</Text>

              <View style={styles.metaList}>
                {post.meta.map((item) => (
                  <View key={item} style={styles.metaPill}>
                    <Text style={styles.metaText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.footerAction}
                  onPress={() => addReply(post.id)}
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#666" />
                  <Text style={styles.footerActionText}>{post.replies} replies</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerAction, hasContacted && styles.activeFooterAction]}
                  onPress={() => toggleMessage(post.id)}
                >
                  <Ionicons
                    name={hasContacted ? 'checkmark-circle' : 'send-outline'}
                    size={18}
                    color={hasContacted ? '#00A66A' : '#666'}
                  />
                  <Text
                    style={[
                      styles.footerActionText,
                      hasContacted && styles.activeFooterActionText,
                      ]}
                    >
                      {hasContacted ? 'Messaged' : 'Message'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F4',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 18,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#D1FAE5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 92,
  },
  composer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  composerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#00A66A',
    fontSize: 12,
    fontWeight: '800',
  },
  input: {
    flex: 1,
    minHeight: 58,
    color: '#222',
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 2,
  },
  composerActions: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
  },
  composerButton: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F0FFF8',
  },
  activeComposerButton: {
    borderWidth: 1,
    borderColor: '#00A66A',
  },
  composerButtonText: {
    color: '#00A66A',
    fontSize: 13,
    fontWeight: '700',
  },
  postButton: {
    minHeight: 36,
    marginLeft: 'auto',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#00A66A',
    paddingHorizontal: 18,
  },
  disabledPostButton: {
    backgroundColor: '#D4D4D4',
  },
  postButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  quickActionList: {
    marginTop: 16,
    gap: 10,
  },
  quickActionCard: {
    minHeight: 76,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  activeQuickActionCard: {
    borderColor: '#00A66A',
    backgroundColor: '#F0FFF8',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    color: '#222',
    fontSize: 15,
    fontWeight: '800',
  },
  quickActionSubtitle: {
    color: '#777',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F4F4F4',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postAvatarText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  postIdentity: {
    flex: 1,
  },
  postName: {
    color: '#222',
    fontSize: 15,
    fontWeight: '800',
  },
  postRole: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  postTag: {
    borderRadius: 12,
    backgroundColor: '#F0FFF8',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  postTagText: {
    color: '#00A66A',
    fontSize: 11,
    fontWeight: '800',
  },
  postMessage: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  metaList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: '#555',
    fontSize: 12,
    fontWeight: '700',
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    gap: 18,
    marginTop: 14,
    paddingTop: 12,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerActionText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '700',
  },
  activeFooterAction: {
    backgroundColor: '#F0FFF8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  activeFooterActionText: {
    color: '#00A66A',
  },
});
