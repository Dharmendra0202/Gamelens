import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/ui/section-header";
import { TabScreenWrapper } from "@/components/ui/tab-screen-wrapper";
import { HEADER_PADDING_BOTTOM, HEADER_PADDING_TOP } from "@/constants/app-theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Easing,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const quickActions = [
  {
    id: "opponent",
    icon: "people-outline",
    title: "Looking for opponent",
    subtitle: "Post match time, ground, ball type",
  },
  {
    id: "tournament",
    icon: "trophy-outline",
    title: "Create tournament post",
    subtitle: "Invite teams and solo players",
  },
  {
    id: "player",
    icon: "person-add-outline",
    title: "Find players",
    subtitle: "Ask for batter, bowler, keeper",
  },
] as const;

type QuickActionId = (typeof quickActions)[number]["id"];

type Post = {
  id: number;
  name: string;
  role: string;
  time: string;
  tag: string;
  message: string;
  meta: string[];
  replies: number;
  replyMessages?: string[];
};

type ReplyModalState = {
  visible: boolean;
  postId: number | null;
  postAuthor: string;
};

const actionTemplates: Record<QuickActionId, string> = {
  opponent:
    "Looking for an opponent this weekend. Ground: , time: , overs: , ball type: .",
  tournament:
    "Creating a tournament soon. Teams needed: , entry fee: , location: , date: .",
  player: "Need players for our match. Role needed: , location: , time: .",
};

const actionTags: Record<QuickActionId, string> = {
  opponent: "Opponent needed",
  tournament: "Tournament",
  player: "Players needed",
};

const initialPosts: Post[] = [];
// TODO(backend): fetch community looking-posts from API / Supabase 'looking_posts' table

export default function LookingScreen() {
  const [selectedAction, setSelectedAction] =
    useState<QuickActionId>("opponent");
  const [draft, setDraft] = useState("");
  const [feedPosts, setFeedPosts] = useState<Post[]>(initialPosts);
  const [contactedPostIds, setContactedPostIds] = useState<number[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  
  // Reply modal state
  const [replyModal, setReplyModal] = useState<ReplyModalState>({
    visible: false,
    postId: null,
    postAuthor: "",
  });
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Entrance animations
  const composerAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const feedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(composerAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(feedAnim, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectAction = (actionId: QuickActionId) => {
    setSelectedAction(actionId);
    setDraft(actionTemplates[actionId]);
  };

  const submitPost = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      Alert.alert("Empty Post", "Please write something before posting.");
      return;
    }

    if (trimmedDraft.length < 10) {
      Alert.alert("Too Short", "Please write at least 10 characters.");
      return;
    }

    setIsPosting(true);

    // Simulate API call
    setTimeout(() => {
      const newPost: Post = {
        id: Date.now(),
        name: "You",
        role: "Cricket player",
        time: "Just now",
        tag: actionTags[selectedAction],
        message: trimmedDraft,
        meta: ["Open request", "Local match", "Chat available"],
        replies: 0,
        replyMessages: [],
      };

      setFeedPosts([newPost, ...feedPosts]);
      setDraft("");
      setIsPosting(false);
      
      // Show success feedback
      Alert.alert("✅ Posted!", "Your request has been posted successfully.");
    }, 500);
  };

  const openReplyModal = (postId: number, postAuthor: string) => {
    setReplyModal({
      visible: true,
      postId,
      postAuthor,
    });
    setReplyText("");
  };

  const closeReplyModal = () => {
    setReplyModal({
      visible: false,
      postId: null,
      postAuthor: "",
    });
    setReplyText("");
  };

  const submitReply = () => {
    if (!replyText.trim()) {
      Alert.alert("Empty Reply", "Please write a reply before sending.");
      return;
    }

    if (!replyModal.postId) return;

    setIsSubmittingReply(true);

    // Simulate API call
    setTimeout(() => {
      setFeedPosts((currentPosts) =>
        currentPosts.map((post) => {
          if (post.id === replyModal.postId) {
            return {
              ...post,
              replies: post.replies + 1,
              replyMessages: [
                ...(post.replyMessages || []),
                replyText.trim(),
              ],
            };
          }
          return post;
        }),
      );

      setIsSubmittingReply(false);
      closeReplyModal();
      Alert.alert("✅ Reply Sent!", "Your reply has been posted.");
    }, 500);
  };

  const handleMessage = (postId: number, postAuthor: string) => {
    const hasContacted = contactedPostIds.includes(postId);

    if (hasContacted) {
      Alert.alert(
        "Already Messaged",
        "You've already reached out to this post.",
      );
      return;
    }

    Alert.alert(
      "Contact " + postAuthor,
      "How would you like to contact them?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "WhatsApp",
          onPress: () => {
            // TODO(backend): Get actual phone number from user profile
            const phoneNumber = "1234567890";
            const message = encodeURIComponent(
              "Hi! I saw your post on CrickBuz. I'm interested in connecting.",
            );
            Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${message}`)
              .then(() => {
                toggleMessage(postId);
              })
              .catch(() => {
                Alert.alert(
                  "WhatsApp Not Available",
                  "Please make sure WhatsApp is installed on your device.",
                );
              });
          },
        },
        {
          text: "Call",
          onPress: () => {
            // TODO(backend): Get actual phone number
            const phoneNumber = "tel:1234567890";
            Linking.openURL(phoneNumber)
              .then(() => {
                toggleMessage(postId);
              })
              .catch(() => {
                Alert.alert("Error", "Unable to make a call.");
              });
          },
        },
      ],
    );
  };

  const toggleMessage = (postId: number) => {
    setContactedPostIds((currentIds) =>
      currentIds.includes(postId)
        ? currentIds.filter((id) => id !== postId)
        : [...currentIds, postId],
    );
  };

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#B71C1C", "#8B0000", "#8B0000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Looking</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert("Search", "Search feature coming soon")}
            >
              <Ionicons name="search" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert("Filter", "Filter options coming soon")}
            >
              <Ionicons name="options-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert("Notifications", "No new notifications")}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: composerAnim,
              transform: [
                {
                  translateY: composerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            }}
          >
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
                    selectedAction === "opponent" &&
                      styles.activeComposerButton,
                  ]}
                  onPress={() => selectAction("opponent")}
                >
                  <Ionicons name="search-outline" size={18} color="#B71C1C" />
                  <Text style={styles.composerButtonText}>Opponent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.composerButton,
                    selectedAction === "tournament" &&
                      styles.activeComposerButton,
                  ]}
                  onPress={() => selectAction("tournament")}
                >
                  <Ionicons name="trophy-outline" size={18} color="#B71C1C" />
                  <Text style={styles.composerButtonText}>Tournament</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.postButton,
                    (!draft.trim() || isPosting) && styles.disabledPostButton,
                  ]}
                  onPress={submitPost}
                  disabled={!draft.trim() || isPosting}
                >
                  <Text style={styles.postButtonText}>
                    {isPosting ? "Posting..." : "Post"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: actionsAnim,
              transform: [
                {
                  translateY: actionsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <View style={styles.quickActionList}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    selectedAction === action.id &&
                      styles.activeQuickActionCard,
                  ]}
                  onPress={() => selectAction(action.id)}
                >
                  <View style={styles.quickActionIcon}>
                    <Ionicons name={action.icon} size={22} color="#B71C1C" />
                  </View>
                  <View style={styles.quickActionText}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>
                      {action.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#B8B8B8" />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: feedAnim,
              transform: [
                {
                  translateY: feedAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
          >
            <SectionHeader
              title="Community posts"
              subtitle="Live requests from players and clubs"
              style={{ paddingHorizontal: 0, marginTop: 22, marginBottom: 10 }}
            />

            {feedPosts.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No posts yet"
                subtitle="Post a request above to find opponents, players or tournaments near you."
              />
            ) : (
              feedPosts.map((post) => {
                const hasContacted = contactedPostIds.includes(post.id);

                return (
                  <View key={post.id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                      <View style={styles.postAvatar}>
                        <Text style={styles.postAvatarText}>
                          {post.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
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
                        onPress={() => openReplyModal(post.id, post.name)}
                      >
                        <Ionicons
                          name="chatbubble-outline"
                          size={18}
                          color="#666"
                        />
                        <Text style={styles.footerActionText}>
                          {post.replies} {post.replies === 1 ? "reply" : "replies"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.footerAction,
                          hasContacted && styles.activeFooterAction,
                        ]}
                        onPress={() => handleMessage(post.id, post.name)}
                      >
                        <Ionicons
                          name={
                            hasContacted ? "checkmark-circle" : "send-outline"
                          }
                          size={18}
                          color={hasContacted ? "#B71C1C" : "#666"}
                        />
                        <Text
                          style={[
                            styles.footerActionText,
                            hasContacted && styles.activeFooterActionText,
                          ]}
                        >
                          {hasContacted ? "Contacted" : "Contact"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Show recent replies if any */}
                    {post.replyMessages && post.replyMessages.length > 0 && (
                      <View style={styles.repliesPreview}>
                        <Text style={styles.repliesPreviewTitle}>
                          Recent replies:
                        </Text>
                        {post.replyMessages.slice(-2).map((reply, idx) => (
                          <View key={idx} style={styles.replyItem}>
                            <Ionicons
                              name="arrow-forward"
                              size={12}
                              color="#B71C1C"
                            />
                            <Text style={styles.replyText}>{reply}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </Animated.View>
        </ScrollView>

        {/* Reply Modal */}
        <Modal
          visible={replyModal.visible}
          animationType="slide"
          transparent
          onRequestClose={closeReplyModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Reply to {replyModal.postAuthor}
                </Text>
                <TouchableOpacity
                  onPress={closeReplyModal}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="Write your reply..."
                placeholderTextColor="#999"
                value={replyText}
                onChangeText={setReplyText}
                multiline
                numberOfLines={4}
                autoFocus
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={closeReplyModal}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSubmitBtn,
                    (!replyText.trim() || isSubmittingReply) &&
                      styles.modalSubmitBtnDisabled,
                  ]}
                  onPress={submitReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                >
                  <Text style={styles.modalSubmitText}>
                    {isSubmittingReply ? "Sending..." : "Send Reply"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
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
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: HEADER_PADDING_BOTTOM,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 2 },
  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerRight: { flexDirection: "row", gap: 1, marginRight: -4 },
  iconButton: { padding: 6 },
  content: {
    padding: 16,
    paddingBottom: 92,
  },
  composer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  composerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#B71C1C",
    fontSize: 12,
    fontWeight: "800",
  },
  input: {
    flex: 1,
    minHeight: 58,
    color: "#222",
    fontSize: 15,
    lineHeight: 20,
    paddingTop: 2,
  },
  composerActions: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
  },
  composerButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#FBE9E7",
  },
  activeComposerButton: {
    borderWidth: 1,
    borderColor: "#B71C1C",
  },
  composerButtonText: {
    color: "#B71C1C",
    fontSize: 13,
    fontWeight: "700",
  },
  postButton: {
    minHeight: 36,
    marginLeft: "auto",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#B71C1C",
    paddingHorizontal: 18,
  },
  disabledPostButton: {
    backgroundColor: "#D4D4D4",
  },
  postButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  quickActionList: {
    marginTop: 16,
    gap: 10,
  },
  quickActionCard: {
    minHeight: 76,
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  activeQuickActionCard: {
    borderColor: "#B71C1C",
    backgroundColor: "#FBE9E7",
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFCDD2",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    color: "#222",
    fontSize: 15,
    fontWeight: "800",
  },
  quickActionSubtitle: {
    color: "#777",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  postCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "800",
  },
  postIdentity: {
    flex: 1,
  },
  postName: {
    color: "#222",
    fontSize: 15,
    fontWeight: "800",
  },
  postRole: {
    color: "#777",
    fontSize: 12,
    marginTop: 2,
  },
  postTag: {
    borderRadius: 12,
    backgroundColor: "#FBE9E7",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  postTagText: {
    color: "#B71C1C",
    fontSize: 11,
    fontWeight: "800",
  },
  postMessage: {
    color: "#333",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  metaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaText: {
    color: "#555",
    fontSize: 12,
    fontWeight: "700",
  },
  postFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    flexDirection: "row",
    gap: 18,
    marginTop: 14,
    paddingTop: 12,
  },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  footerActionText: {
    color: "#666",
    fontSize: 13,
    fontWeight: "700",
  },
  activeFooterAction: {
    backgroundColor: "#FBE9E7",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  activeFooterActionText: {
    color: "#B71C1C",
  },

  // Replies Preview
  repliesPreview: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  repliesPreviewTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  replyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  replyText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },

  // Reply Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#222",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#222",
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#666",
  },
  modalSubmitBtn: {
    flex: 1,
    backgroundColor: "#B71C1C",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalSubmitBtnDisabled: {
    backgroundColor: "#D4D4D4",
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFF",
  },
});
