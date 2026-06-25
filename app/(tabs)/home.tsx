import { CricketPostCard } from "@/components/ui/cricket-post-card";
import { TabScreenWrapper } from "@/components/ui/tab-screen-wrapper";
import {
    HEADER_PADDING_BOTTOM,
    HEADER_PADDING_TOP,
} from "@/constants/app-theme";
import { useTabNavigator } from "@/contexts/TabNavigatorContext";
import { useAuth } from "@/hooks/use-auth";
import { shareContent, shareToPlatform } from "@/utils/share";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
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
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_MARGIN = 12;
const CARD_SPACING = CARD_WIDTH + CARD_MARGIN;

type Profile = {
  name: string;
  phone: string;
  role: string;
  location: string;
  battingStyle: string;
  bowlingStyle: string;
  friends: string;
  posts: string;
  imageUri: string;
};

const initialProfile: Profile = {
  name: "",
  phone: "",
  role: "",
  location: "",
  battingStyle: "",
  bowlingStyle: "",
  friends: "0",
  posts: "0",
  imageUri: "",
};

export default function HomeScreen() {
  const router = useRouter();
  const { goToMainTab } = useTabNavigator();
  const { signOut, profile: supaProfile } = useAuth();

  const handleLogout = async () => {
    try {
      setShowMenuDrawer(false);
      await signOut();
      while (router.canGoBack()) {
        router.back();
      }
      router.replace("/");
    } catch (e) {
      console.error("Logout error:", e);
      router.replace("/");
    }
  };
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMatchOptionsModal, setShowMatchOptionsModal] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<{
    players: any[];
    matches: any[];
    products: any[];
  }>({ players: [], matches: [], products: [] });

  // Drawer page modals
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAwardsModal, setShowAwardsModal] = useState(false);
  const [showAssociationsModal, setShowAssociationsModal] = useState(false);
  const [showClubsModal, setShowClubsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [profileDraft, setProfileDraft] = useState<Profile>(initialProfile);

  // Community feed state
  const [activeFeedTab, setActiveFeedTab] = useState("For You");
  const feedScrollRef = useRef<ScrollView>(null);

  const handleFeedTabPress = (tabName: string, index: number) => {
    setActiveFeedTab(tabName);
    feedScrollRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      animated: true,
    });
  };

  const FEED_TABS = ["For You", "Following", "Trending"];

  const handleFeedScrollEnd = (e: any) => {
    const pageIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (pageIndex >= 0 && pageIndex < FEED_TABS.length) {
      setActiveFeedTab(FEED_TABS[pageIndex]);
    }
  };

  const handleFeedScrollEndDrag = (e: any) => {
    // Disabled edge-swipe between main tabs and sub-tabs
  };

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [selectedPostForComments, setSelectedPostForComments] =
    useState<any>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  type FeedComment = {
    id: number;
    user: string;
    initials: string;
    color: string;
    time: string;
    text: string;
  };
  type FeedPost = {
    id: number;
    user: string;
    initials: string;
    color: string;
    role: string;
    time: string;
    content: string;
    tags: string[];
    hasMedia: boolean;
    likes: number;
    comments: number;
    shares: number;
    liked: boolean;
    saved: boolean;
    verified: boolean;
    commentsList?: FeedComment[];
  };
  // TODO(backend): fetch community feed from API / Supabase 'posts' table
  const [communityPosts, setCommunityPosts] = useState<FeedPost[]>([]);

  type CommunityUser = {
    id: number;
    initials: string;
    shortName: string;
    color: string;
    active: boolean;
  };
  // TODO(backend): fetch active community users from API
  const communityUsers: CommunityUser[] = [];

  const renderPostCard = (post: any) => (
    <CricketPostCard
      key={post.id}
      post={post}
      onLike={(id) => {
        setCommunityPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  liked: !p.liked,
                  likes: p.liked ? p.likes - 1 : p.likes + 1,
                }
              : p,
          ),
        );
      }}
      onComment={(p) => {
        setSelectedPostForComments(p);
        setShowCommentsModal(true);
      }}
      onShare={async (id) => {
        const shared = await shareContent({
          title: `Post by ${post.user}`,
          message: post.content,
          type: "post",
          id: post.id,
        });
        if (shared) {
          setCommunityPosts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p)),
          );
        }
      }}
      onSave={(id) => {
        setCommunityPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
        );
      }}
    />
  );

  const profileInitials =
    profile.name
      .split(" ")
      .filter(Boolean)
      .map((namePart) => namePart[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ME";

  const openProfileEditor = () => {
    router.push("/profile/setup" as never);
  };

  const updateProfileDraft = (key: keyof Profile, value: string) => {
    setProfileDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  };

  // Sync profile state from Supabase profile context
  useEffect(() => {
    if (!supaProfile) return;
    setProfile({
      name: supaProfile.full_name || "",
      phone: supaProfile.phone_number || "",
      role: supaProfile.player_role || "",
      location: supaProfile.location || "",
      battingStyle: supaProfile.batting_style || "",
      bowlingStyle: supaProfile.bowling_style || "",
      friends: String(supaProfile.friends_count ?? 0),
      posts: String(supaProfile.posts_count ?? 0),
      imageUri: supaProfile.avatar_url || "",
    });
  }, [supaProfile]);

  const saveProfile = () => {
    // Profile saving is now handled by /profile/setup screen via Supabase.
    setShowProfileModal(false);
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateProfileDraft("imageUri", result.assets[0].uri);
    }
  };

  // Search function for home screen
  const performHomeSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults({ players: [], matches: [], products: [] });
      return;
    }

    const searchTerm = query.toLowerCase().trim();

    // Search players
    const filteredPlayers = players.filter(
      (player) =>
        player.name.toLowerCase().includes(searchTerm) ||
        player.role.toLowerCase().includes(searchTerm) ||
        player.team.toLowerCase().includes(searchTerm),
    );

    // Search matches
    const filteredMatches = matches.filter(
      (match) =>
        match.team1.toLowerCase().includes(searchTerm) ||
        match.team2.toLowerCase().includes(searchTerm) ||
        match.location.toLowerCase().includes(searchTerm),
    );

    // Search products
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm),
    );

    setSearchResults({
      players: filteredPlayers,
      matches: filteredMatches,
      products: filteredProducts,
    });
  };

  // Handle search query change
  const handleHomeSearchChange = (query: string) => {
    setSearchQuery(query);
    performHomeSearch(query);
  };

  type PopularPlayer = {
    id: number;
    name: string;
    role: string;
    team: string;
    runs?: string;
    wickets?: string;
    initials: string;
    color: string;
    image: string;
  };
  // TODO(backend): fetch popular cricketers from API
  const players: PopularPlayer[] = [];

  type DiscoveryMatch = {
    id: number;
    team1: string;
    team2: string;
    time: string;
    badge: string;
    location: string;
    image: string;
  };
  // TODO(backend): fetch nearby/discovery matches from MatchService
  const matches: DiscoveryMatch[] = [];

  type StoreProduct = {
    id: number;
    name: string;
    price: string;
    image: string;
  };
  // TODO(backend): fetch featured store products from store API
  const products: StoreProduct[] = [];

  const handlePlayerPress = (player: any) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  // entrance animations
  const profileAnim = useRef(new Animated.Value(0)).current;
  const matchesAnim = useRef(new Animated.Value(0)).current;
  const playersAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(profileAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(matchesAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(playersAnim, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <TabScreenWrapper swipeEnabled={false}>
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={["#B71C1C", "#8B0000", "#8B0000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>
              GAME<Text style={styles.headerTitleOrange}>LENS</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowSearchModal(true)}
            >
              <Ionicons name="search" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowChatModal(true)}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => console.log("Notifications clicked")}
            >
              <Ionicons name="notifications-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* ── Stories / Status Row (like Instagram) ── */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesRow}
          >
            {/* Add your status */}
            <TouchableOpacity
              style={styles.storyItem}
              activeOpacity={0.8}
              onPress={async () => {
                const permission =
                  await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) return;
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ["images"],
                  allowsEditing: true,
                  aspect: [9, 16],
                  quality: 0.85,
                });
                if (!result.canceled && result.assets[0]?.uri) {
                  // TODO(backend): upload story to Supabase storage
                  console.log("Story selected:", result.assets[0].uri);
                }
              }}
            >
              <View style={styles.storyAvatarCreate}>
                <View style={styles.storyCreateInner}>
                  {profile.imageUri ? (
                    <Image
                      source={{ uri: profile.imageUri }}
                      style={styles.storyAvatarImg}
                    />
                  ) : (
                    <Text style={styles.storyAvatarInitials}>
                      {profileInitials}
                    </Text>
                  )}
                </View>
                <View style={styles.storyAddDot}>
                  <Ionicons name="add" size={12} color="#FFF" />
                </View>
              </View>
              <Text style={styles.storyName}>Add Status</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* ── Divider below stories ── */}
          <View style={styles.storiesDivider} />

          {/* ── Create Post Bar ── */}
          <TouchableOpacity
            style={styles.createPostBar}
            activeOpacity={0.85}
            onPress={() => setShowCreatePostModal(true)}
          >
            <View style={styles.createPostAvatarSmall}>
              {profile.imageUri ? (
                <Image
                  source={{ uri: profile.imageUri }}
                  style={{ width: 36, height: 36, borderRadius: 18 }}
                />
              ) : (
                <Text style={styles.createPostInitialsSmall}>
                  {profileInitials}
                </Text>
              )}
            </View>
            <View style={styles.createPostInputFake}>
              <Text style={styles.createPostPlaceholderTxt}>
                Share your match story, tips or opinions...
              </Text>
            </View>
            <View style={styles.createPostActions}>
              <Ionicons name="image-outline" size={20} color="#B71C1C" />
              <Ionicons
                name="videocam-outline"
                size={20}
                color="#8B0000"
                style={{ marginLeft: 10 }}
              />
            </View>
          </TouchableOpacity>

          {/* ── Cricket Community Feed ── */}
          <View style={styles.feedSection}>
            {/* Feed Header */}
            <View style={styles.feedHeaderRow}>
              <View>
                <Text style={styles.feedTitle}>Community Feed</Text>
                <Text style={styles.feedSubtitle}>
                  What cricketers are talking about
                </Text>
              </View>
              <TouchableOpacity
                style={styles.feedFilterBtn}
                activeOpacity={0.8}
              >
                <Ionicons name="options-outline" size={18} color="#B71C1C" />
                <Text style={styles.feedFilterTxt}>Filter</Text>
              </TouchableOpacity>
            </View>

            {/* Feed Tabs */}
            <View style={styles.feedTabsRow}>
              {["For You", "Following", "Trending"].map((tab, idx) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.feedTab,
                    activeFeedTab === tab && styles.feedTabActive,
                  ]}
                  onPress={() => handleFeedTabPress(tab, idx)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.feedTabTxt,
                      activeFeedTab === tab && styles.feedTabTxtActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Swipeable Feeds */}
            <ScrollView
              ref={feedScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleFeedScrollEnd}
              onScrollEndDrag={handleFeedScrollEndDrag}
              scrollEventThrottle={16}
              nestedScrollEnabled
            >
              <View style={{ width: SCREEN_WIDTH }}>
                {communityPosts.map(renderPostCard)}
              </View>
              <View style={{ width: SCREEN_WIDTH }}>
                {communityPosts.filter((p) => p.verified).map(renderPostCard)}
              </View>
              <View style={{ width: SCREEN_WIDTH }}>
                {communityPosts
                  .slice()
                  .sort((a, b) => b.likes - a.likes)
                  .map(renderPostCard)}
              </View>
            </ScrollView>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>

        {/* ── Create Post Modal ── */}
        <Modal
          visible={showCreatePostModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCreatePostModal(false)}
        >
          <View style={styles.createModalOverlay}>
            <View style={styles.createModalSheet}>
              <View style={styles.createModalHandle} />
              <View style={styles.createModalHeader}>
                <TouchableOpacity onPress={() => setShowCreatePostModal(false)}>
                  <Text style={styles.createModalCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.createModalTitle}>New Post</Text>
                <TouchableOpacity
                  style={[
                    styles.createModalPostBtn,
                    newPostText.trim().length === 0 && { opacity: 0.4 },
                  ]}
                  disabled={newPostText.trim().length === 0}
                  onPress={() => {
                    if (!newPostText.trim()) return;
                    const newPost = {
                      id: Date.now(),
                      user: profile.name,
                      initials: profileInitials,
                      color: "#B71C1C",
                      role: profile.role,
                      time: "Just now",
                      content: newPostText.trim(),
                      tags: [],
                      hasMedia: false,
                      likes: 0,
                      comments: 0,
                      shares: 0,
                      liked: false,
                      saved: false,
                      verified: false,
                    };
                    setCommunityPosts((prev) => [newPost, ...prev]);
                    setNewPostText("");
                    setShowCreatePostModal(false);
                  }}
                >
                  <Text style={styles.createModalPostTxt}>Post</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.createModalBody}>
                <View style={styles.createModalAvatarRow}>
                  <View
                    style={[
                      styles.postAvatar,
                      {
                        backgroundColor: "#B71C1C",
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                      },
                    ]}
                  >
                    <Text style={[styles.postAvatarInitials, { fontSize: 16 }]}>
                      {profileInitials}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.createModalUserName}>
                      {profile.name}
                    </Text>
                    <View style={styles.audiencePill}>
                      <Ionicons name="earth" size={11} color="#B71C1C" />
                      <Text style={styles.audiencePillTxt}>Everyone</Text>
                      <Ionicons name="chevron-down" size={11} color="#B71C1C" />
                    </View>
                  </View>
                </View>
                <TextInput
                  style={styles.createModalInput}
                  placeholder="What's happening in your cricket world?"
                  placeholderTextColor="#AAA"
                  multiline
                  value={newPostText}
                  onChangeText={setNewPostText}
                  autoFocus
                />
              </View>
              <View style={styles.createModalToolbar}>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <Ionicons name="image-outline" size={22} color="#B71C1C" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <Ionicons name="videocam-outline" size={22} color="#8B0000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <Ionicons name="mic-outline" size={22} color="#C62828" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <Ionicons name="pricetag-outline" size={22} color="#EF9A9A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarBtn}>
                  <Ionicons name="location-outline" size={22} color="#34D399" />
                </TouchableOpacity>
                <Text style={styles.charCount}>{newPostText.length}/500</Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── Comments Modal ── */}
        <Modal
          visible={showCommentsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCommentsModal(false)}
        >
          <View style={styles.createModalOverlay}>
            <View style={[styles.createModalSheet, { minHeight: "80%" }]}>
              <View style={styles.createModalHandle} />
              <View style={styles.createModalHeader}>
                <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                  <Text style={styles.createModalCancel}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.createModalTitle}>Comments</Text>
                <View style={{ width: 40 }} />
              </View>

              {selectedPostForComments && (
                <View style={{ flex: 1 }}>
                  <View
                    style={[
                      styles.postCard,
                      {
                        marginHorizontal: 0,
                        shadowOpacity: 0,
                        borderWidth: 0,
                        borderBottomWidth: 1,
                        borderColor: "#F0F0F0",
                        borderRadius: 0,
                      },
                    ]}
                  >
                    <View style={styles.postHeader}>
                      <View
                        style={[
                          styles.postAvatarRing,
                          { borderColor: selectedPostForComments.color },
                        ]}
                      >
                        <View
                          style={[
                            styles.postAvatar,
                            { backgroundColor: selectedPostForComments.color },
                          ]}
                        >
                          <Text style={styles.postAvatarInitials}>
                            {selectedPostForComments.initials}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.postUserInfo}>
                        <Text style={styles.postUserName}>
                          {selectedPostForComments.user}
                        </Text>
                        <Text style={styles.postMetaRow}>
                          {selectedPostForComments.role} ·{" "}
                          {selectedPostForComments.time}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.postContentTxt}>
                      {selectedPostForComments.content}
                    </Text>
                  </View>

                  <ScrollView style={{ flex: 1, padding: 16 }}>
                    {selectedPostForComments.commentsList &&
                    selectedPostForComments.commentsList.length > 0 ? (
                      selectedPostForComments.commentsList.map(
                        (comment: any) => (
                          <View key={comment.id} style={styles.commentItem}>
                            <View
                              style={[
                                styles.commentAvatar,
                                { backgroundColor: comment.color },
                              ]}
                            >
                              <Text style={styles.commentInitials}>
                                {comment.initials}
                              </Text>
                            </View>
                            <View style={styles.commentContent}>
                              <View style={styles.commentHeader}>
                                <Text style={styles.commentUser}>
                                  {comment.user}
                                </Text>
                                <Text style={styles.commentTime}>
                                  {comment.time}
                                </Text>
                              </View>
                              <Text style={styles.commentText}>
                                {comment.text}
                              </Text>
                            </View>
                          </View>
                        ),
                      )
                    ) : (
                      <View style={styles.noCommentsContainer}>
                        <Ionicons
                          name="chatbubbles-outline"
                          size={48}
                          color="#CCC"
                        />
                        <Text style={styles.noCommentsText}>
                          No comments yet. Start the conversation!
                        </Text>
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.commentInputContainer}>
                    <View
                      style={[
                        styles.commentAvatar,
                        { backgroundColor: "#B71C1C" },
                      ]}
                    >
                      <Text style={styles.commentInitials}>
                        {profileInitials}
                      </Text>
                    </View>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Write a comment..."
                      placeholderTextColor="#999"
                      value={newCommentText}
                      onChangeText={setNewCommentText}
                    />
                    <TouchableOpacity
                      style={[
                        styles.commentSendBtn,
                        !newCommentText.trim() && { opacity: 0.5 },
                      ]}
                      disabled={!newCommentText.trim()}
                      onPress={() => {
                        if (!newCommentText.trim()) return;
                        const newComment = {
                          id: Date.now(),
                          user: profile.name,
                          initials: profileInitials,
                          color: "#B71C1C",
                          time: "Just now",
                          text: newCommentText.trim(),
                        };
                        setCommunityPosts((prev) =>
                          prev.map((p) => {
                            if (p.id === selectedPostForComments.id) {
                              const updatedCommentsList = [
                                ...(p.commentsList || []),
                                newComment,
                              ];
                              return {
                                ...p,
                                comments: updatedCommentsList.length,
                                commentsList: updatedCommentsList,
                              };
                            }
                            return p;
                          }),
                        );
                        setSelectedPostForComments((prev: any) => ({
                          ...prev,
                          comments: (prev.comments || 0) + 1,
                          commentsList: [
                            ...(prev.commentsList || []),
                            newComment,
                          ],
                        }));
                        setNewCommentText("");
                      }}
                    >
                      <Ionicons name="send" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Player Details Modal */}
        <Modal
          visible={showPlayerModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPlayerModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPlayerModal(false)}
          >
            <View style={styles.modalContent}>
              {selectedPlayer && (
                <>
                  <View
                    style={[
                      styles.modalPlayerAvatar,
                      { backgroundColor: selectedPlayer.color },
                    ]}
                  >
                    {selectedPlayer.image ? (
                      <Image
                        source={{ uri: selectedPlayer.image }}
                        style={styles.modalPlayerImage}
                      />
                    ) : (
                      <Text style={styles.modalPlayerInitials}>
                        {selectedPlayer.initials}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.modalPlayerName}>
                    {selectedPlayer.name}
                  </Text>
                  <Text style={styles.modalPlayerRole}>
                    {selectedPlayer.role}
                  </Text>
                  <Text style={styles.modalPlayerTeam}>
                    Team: {selectedPlayer.team}
                  </Text>
                  {selectedPlayer.runs && (
                    <Text style={styles.modalPlayerStats}>
                      Career Runs: {selectedPlayer.runs}
                    </Text>
                  )}
                  {selectedPlayer.wickets && (
                    <Text style={styles.modalPlayerStats}>
                      Career Wickets: {selectedPlayer.wickets}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={styles.followButton}
                    onPress={() => setShowPlayerModal(false)}
                  >
                    <Text style={styles.followButtonText}>Follow</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
                placeholder="Search players, matches, products..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleHomeSearchChange}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults({
                      players: [],
                      matches: [],
                      products: [],
                    });
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
                  <TouchableOpacity style={styles.searchResultItem}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.searchResultText}>Virat Kohli</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.searchResultItem}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.searchResultText}>Cricket Bat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.searchResultItem}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.searchResultText}>IPL 2024</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Player Results */}
                  {searchResults.players.length > 0 && (
                    <>
                      <Text style={styles.searchResultsTitle}>
                        Players ({searchResults.players.length})
                      </Text>
                      {searchResults.players.map((player: any) => (
                        <TouchableOpacity
                          key={player.id}
                          style={styles.searchPlayerItem}
                          onPress={() => {
                            handlePlayerPress(player);
                            setShowSearchModal(false);
                          }}
                        >
                          <View
                            style={[
                              styles.searchPlayerAvatar,
                              { backgroundColor: player.color },
                            ]}
                          >
                            {player.image ? (
                              <Image
                                source={{ uri: player.image }}
                                style={styles.searchPlayerImage}
                              />
                            ) : (
                              <Text style={styles.searchPlayerInitials}>
                                {player.initials}
                              </Text>
                            )}
                          </View>
                          <View style={styles.searchPlayerInfo}>
                            <Text style={styles.searchPlayerName}>
                              {player.name}
                            </Text>
                            <Text style={styles.searchPlayerRole}>
                              {player.role} • {player.team}
                            </Text>
                            {player.runs && (
                              <Text style={styles.searchPlayerStats}>
                                🏏 {player.runs}
                              </Text>
                            )}
                            {player.wickets && (
                              <Text style={styles.searchPlayerStats}>
                                🎯 {player.wickets}
                              </Text>
                            )}
                          </View>
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
                              searchResults.players.length > 0 ? 20 : 0,
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
                            console.log(
                              `Viewing match: ${match.team1} vs ${match.team2}`,
                            );
                            setShowSearchModal(false);
                          }}
                        >
                          <View style={styles.searchMatchHeader}>
                            <View style={styles.searchMatchBadge}>
                              <Text style={styles.searchMatchBadgeText}>
                                {match.badge}
                              </Text>
                            </View>
                            <Text style={styles.searchMatchTime}>
                              {match.time}
                            </Text>
                          </View>
                          <Text style={styles.searchMatchTeams}>
                            {match.team1} vs {match.team2}
                          </Text>
                          <View style={styles.searchMatchLocation}>
                            <Ionicons
                              name="location-outline"
                              size={12}
                              color="#999"
                            />
                            <Text style={styles.searchMatchLocationText}>
                              {match.location}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* Product Results */}
                  {searchResults.products.length > 0 && (
                    <>
                      <Text
                        style={[
                          styles.searchResultsTitle,
                          {
                            marginTop:
                              searchResults.players.length > 0 ||
                              searchResults.matches.length > 0
                                ? 20
                                : 0,
                          },
                        ]}
                      >
                        Products ({searchResults.products.length})
                      </Text>
                      {searchResults.products.map((product: any) => (
                        <TouchableOpacity
                          key={product.id}
                          style={styles.searchProductItem}
                          onPress={() => {
                            console.log(`Viewing product: ${product.name}`);
                            setShowSearchModal(false);
                          }}
                        >
                          <View style={styles.searchProductInfo}>
                            <Text style={styles.searchProductName}>
                              {product.name}
                            </Text>
                            <Text style={styles.searchProductPrice}>
                              {product.price}
                            </Text>
                          </View>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#999"
                          />
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {/* No Results */}
                  {searchResults.players.length === 0 &&
                    searchResults.matches.length === 0 &&
                    searchResults.products.length === 0 &&
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
                          Try searching for player names, match teams, or
                          product names
                        </Text>
                      </View>
                    )}
                </>
              )}
            </ScrollView>
          </View>
        </Modal>

        {/* Chat Modal */}
        <Modal
          visible={showChatModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowChatModal(false)}
        >
          <View style={styles.chatModalContainer}>
            <View style={styles.chatModalHeader}>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.chatModalTitle}>Messages</Text>
              <TouchableOpacity>
                <Ionicons name="create-outline" size={24} color="#B71C1C" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatList}>
              <TouchableOpacity style={styles.chatItem}>
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>RS</Text>
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>Rahul Sharma</Text>
                  <Text style={styles.chatMessage}>Great match today! 🏏</Text>
                </View>
                <View style={styles.chatMeta}>
                  <Text style={styles.chatTime}>2h</Text>
                  <View style={styles.chatBadge}>
                    <Text style={styles.chatBadgeText}>2</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chatItem}>
                <View
                  style={[styles.chatAvatar, { backgroundColor: "#C62828" }]}
                >
                  <Text style={styles.chatAvatarText}>PP</Text>
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>Priya Patel</Text>
                  <Text style={styles.chatMessage}>
                    Are you joining the match?
                  </Text>
                </View>
                <View style={styles.chatMeta}>
                  <Text style={styles.chatTime}>5h</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.chatItem}>
                <View
                  style={[styles.chatAvatar, { backgroundColor: "#8B0000" }]}
                >
                  <Text style={styles.chatAvatarText}>TW</Text>
                </View>
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>Team Warriors</Text>
                  <Text style={styles.chatMessage}>Match starts at 6 PM</Text>
                </View>
                <View style={styles.chatMeta}>
                  <Text style={styles.chatTime}>1d</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Modal>

        {/* Profile Editor Modal */}
        <Modal
          visible={showProfileModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowProfileModal(false)}
        >
          <View style={styles.profileModalOverlay}>
            <View style={styles.profileEditor}>
              <LinearGradient
                colors={["#8B0000", "#8B0000"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.profileEditorHeaderGradient}
              >
                <View style={styles.profileEditorHeader}>
                  <TouchableOpacity
                    onPress={() => setShowProfileModal(false)}
                    style={styles.profileHeaderBtn}
                  >
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <Text style={styles.profileEditorTitleText}>
                    Manage Profile
                  </Text>
                  <TouchableOpacity
                    onPress={saveProfile}
                    style={styles.profileSavePillBtn}
                  >
                    <Text style={styles.profileSaveTxt}>Save</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <ScrollView
                style={styles.profileEditorBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Premium Profile Hero Area */}
                <View style={styles.profileModernHero}>
                  <View style={styles.profileHeroAvatarContainer}>
                    <View
                      style={[
                        styles.profileHeroAvatarRing,
                        { borderColor: "#B71C1C" },
                      ]}
                    >
                      <View style={styles.profileHeroAvatar}>
                        {profileDraft.imageUri ? (
                          <Image
                            source={{ uri: profileDraft.imageUri }}
                            style={styles.profileHeroImage}
                          />
                        ) : (
                          <Text style={styles.profileHeroInitials}>
                            {profileDraft.name
                              .split(" ")
                              .filter(Boolean)
                              .map((namePart) => namePart[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase() || "ME"}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.profileHeroEditBadge}
                      onPress={pickProfileImage}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="camera" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.profileHeroName}>
                    {profileDraft.name || "Your Name"}
                  </Text>
                  <Text style={styles.profileHeroUsername}>
                    @
                    {profileDraft.name
                      ? profileDraft.name.toLowerCase().replace(/\s+/g, "_")
                      : "username"}
                  </Text>
                  <Text style={styles.profileHeroLocation}>
                    <Ionicons name="location-outline" size={12} color="#666" />{" "}
                    {profileDraft.location || "Add Location"}
                  </Text>

                  {/* Horizontal stats strip */}
                  <View style={styles.profileHeroStatsStrip}>
                    <View style={styles.profileHeroStatItem}>
                      <Text style={styles.profileHeroStatNum}>
                        {profileDraft.friends || "0"}
                      </Text>
                      <Text style={styles.profileHeroStatLbl}>Friends</Text>
                    </View>
                    <View style={styles.profileHeroStatDivider} />
                    <View style={styles.profileHeroStatItem}>
                      <Text style={styles.profileHeroStatNum}>
                        {profileDraft.posts || "0"}
                      </Text>
                      <Text style={styles.profileHeroStatLbl}>Posts</Text>
                    </View>
                    <View style={styles.profileHeroStatDivider} />
                    <View style={styles.profileHeroStatItem}>
                      <Text style={styles.profileHeroStatNum}>47</Text>
                      <Text style={styles.profileHeroStatLbl}>Matches</Text>
                    </View>
                  </View>
                </View>

                {/* Personal Info Card */}
                <View style={styles.profileConfigSectionCard}>
                  <Text style={styles.profileConfigSectionTitle}>
                    Personal Information
                  </Text>

                  <View style={styles.profileConfigInputContainer}>
                    <View style={styles.profileConfigIconBox}>
                      <Ionicons
                        name="person-outline"
                        size={18}
                        color="#B71C1C"
                      />
                    </View>
                    <View style={styles.profileConfigInputWrapper}>
                      <Text style={styles.profileConfigLabel}>NAME</Text>
                      <TextInput
                        style={styles.profileConfigInput}
                        value={profileDraft.name}
                        onChangeText={(value) =>
                          updateProfileDraft("name", value)
                        }
                        placeholder="Your name"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={styles.profileConfigInputContainer}>
                    <View style={styles.profileConfigIconBox}>
                      <Ionicons name="call-outline" size={18} color="#B71C1C" />
                    </View>
                    <View style={styles.profileConfigInputWrapper}>
                      <Text style={styles.profileConfigLabel}>PHONE</Text>
                      <TextInput
                        style={styles.profileConfigInput}
                        value={profileDraft.phone}
                        onChangeText={(value) =>
                          updateProfileDraft("phone", value)
                        }
                        placeholder="Phone number"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.profileConfigInputContainer}>
                    <View style={styles.profileConfigIconBox}>
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#B71C1C"
                      />
                    </View>
                    <View style={styles.profileConfigInputWrapper}>
                      <Text style={styles.profileConfigLabel}>LOCATION</Text>
                      <TextInput
                        style={styles.profileConfigInput}
                        value={profileDraft.location}
                        onChangeText={(value) =>
                          updateProfileDraft("location", value)
                        }
                        placeholder="City or area"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>
                </View>

                {/* Cricket Details Card */}
                <View style={styles.profileConfigSectionCard}>
                  <Text style={styles.profileConfigSectionTitle}>
                    Cricket Profile
                  </Text>

                  <View style={styles.profileConfigInputContainer}>
                    <View style={styles.profileConfigIconBox}>
                      <Ionicons
                        name="ribbon-outline"
                        size={18}
                        color="#8B0000"
                      />
                    </View>
                    <View style={styles.profileConfigInputWrapper}>
                      <Text style={styles.profileConfigLabel}>PLAYER ROLE</Text>
                      <TextInput
                        style={styles.profileConfigInput}
                        value={profileDraft.role}
                        onChangeText={(value) =>
                          updateProfileDraft("role", value)
                        }
                        placeholder="Batter, bowler, all-rounder"
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={styles.profileConfigInputContainerDouble}>
                    <View
                      style={[
                        styles.profileConfigInputContainer,
                        { flex: 1, marginBottom: 0, borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.profileConfigIconBox}>
                        <Ionicons
                          name="flash-outline"
                          size={18}
                          color="#8B0000"
                        />
                      </View>
                      <View style={styles.profileConfigInputWrapper}>
                        <Text style={styles.profileConfigLabel}>BATTING</Text>
                        <TextInput
                          style={styles.profileConfigInput}
                          value={profileDraft.battingStyle}
                          onChangeText={(value) =>
                            updateProfileDraft("battingStyle", value)
                          }
                          placeholder="Right hand bat"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        width: 1,
                        backgroundColor: "#ECECEC",
                        marginVertical: 8,
                      }}
                    />
                    <View
                      style={[
                        styles.profileConfigInputContainer,
                        { flex: 1, marginBottom: 0, borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.profileConfigIconBox}>
                        <Ionicons
                          name="bowling-ball-outline"
                          size={18}
                          color="#8B0000"
                        />
                      </View>
                      <View style={styles.profileConfigInputWrapper}>
                        <Text style={styles.profileConfigLabel}>BOWLING</Text>
                        <TextInput
                          style={styles.profileConfigInput}
                          value={profileDraft.bowlingStyle}
                          onChangeText={(value) =>
                            updateProfileDraft("bowlingStyle", value)
                          }
                          placeholder="Medium pace"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Network Stats Card */}
                <View style={styles.profileConfigSectionCard}>
                  <Text style={styles.profileConfigSectionTitle}>
                    Stats & Connections
                  </Text>

                  <View style={styles.profileConfigInputContainerDouble}>
                    <View
                      style={[
                        styles.profileConfigInputContainer,
                        { flex: 1, marginBottom: 0, borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.profileConfigIconBox}>
                        <Ionicons
                          name="people-outline"
                          size={18}
                          color="#8B0000"
                        />
                      </View>
                      <View style={styles.profileConfigInputWrapper}>
                        <Text style={styles.profileConfigLabel}>FRIENDS</Text>
                        <TextInput
                          style={styles.profileConfigInput}
                          value={profileDraft.friends}
                          onChangeText={(value) =>
                            updateProfileDraft("friends", value)
                          }
                          placeholder="125"
                          placeholderTextColor="#999"
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                    <View
                      style={{
                        width: 1,
                        backgroundColor: "#ECECEC",
                        marginVertical: 8,
                      }}
                    />
                    <View
                      style={[
                        styles.profileConfigInputContainer,
                        { flex: 1, marginBottom: 0, borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.profileConfigIconBox}>
                        <Ionicons
                          name="document-text-outline"
                          size={18}
                          color="#8B0000"
                        />
                      </View>
                      <View style={styles.profileConfigInputWrapper}>
                        <Text style={styles.profileConfigLabel}>POSTS</Text>
                        <TextInput
                          style={styles.profileConfigInput}
                          value={profileDraft.posts}
                          onChangeText={(value) =>
                            updateProfileDraft("posts", value)
                          }
                          placeholder="45"
                          placeholderTextColor="#999"
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {profileDraft.imageUri ? (
                  <TouchableOpacity
                    style={styles.profileModernTrashBtn}
                    onPress={() => updateProfileDraft("imageUri", "")}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    <Text style={styles.profileModernTrashTxt}>
                      Remove Profile Picture
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Menu Drawer */}
        <Modal
          visible={showMenuDrawer}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMenuDrawer(false)}
        >
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setShowMenuDrawer(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.drawerContainer}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Profile Section */}
              <TouchableOpacity
                style={styles.drawerProfile}
                onPress={() => {
                  setShowMenuDrawer(false);
                  openProfileEditor();
                }}
                activeOpacity={0.9}
              >
                <View style={styles.drawerProfileAvatar}>
                  {profile.imageUri ? (
                    <Image
                      source={{ uri: profile.imageUri }}
                      style={styles.drawerProfileImage}
                    />
                  ) : (
                    <Text style={styles.drawerProfileInitials}>
                      {profileInitials}
                    </Text>
                  )}
                </View>
                <View style={styles.drawerProfileInfo}>
                  <Text style={styles.drawerProfileName} numberOfLines={1}>
                    {profile.name}
                  </Text>
                  <Text style={styles.drawerProfilePhone}>{profile.phone}</Text>
                </View>
                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation();
                    setShowMenuDrawer(false);
                  }}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={styles.progressFill} />
                </View>
                <Text style={styles.progressText}>50%</Text>
              </View>

              {/* Menu Items */}
              <ScrollView style={styles.drawerMenu}>
                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    router.push({
                      pathname: "/(tabs)/my-cricket",
                      params: { action: "createTournament" },
                    });
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="trophy-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>
                    Add a Tournament/Series
                  </Text>
                  <View style={styles.drawerMenuBadge}>
                    <Text style={styles.drawerMenuBadgeText}>Free</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowMatchOptionsModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="baseball-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Start A Match</Text>
                  <View style={styles.drawerMenuBadge}>
                    <Text style={styles.drawerMenuBadgeText}>Free</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.drawerMenuItem}>
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="videocam-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Go Live</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    router.push({
                      pathname: "/(tabs)/my-cricket",
                      params: {
                        source: "drawer",
                        section: "menu",
                        t: Date.now(),
                      },
                    });
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="baseball" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>My Cricket</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    router.push({
                      pathname: "/(tabs)/my-cricket",
                      params: { tab: "tournaments", t: Date.now() },
                    });
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="trophy" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>My Tournament</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    router.push({
                      pathname: "/(tabs)/my-cricket",
                      params: { tab: "matches", t: Date.now() },
                    });
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="bar-chart-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>My Performance</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowStoreModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="bag-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>CricHeroes Store</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowLeaderboardModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="podium-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Leaderboards</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowAwardsModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="ribbon-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>CricHeroes Awards</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowAssociationsModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="people-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Associations</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowClubsModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="business-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Clubs</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowContactModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="call-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Contact</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowShareModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons
                      name="share-social-outline"
                      size={20}
                      color="#666"
                    />
                  </View>
                  <Text style={styles.drawerMenuText}>Share the app</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerMenuItem}
                  onPress={() => {
                    setShowMenuDrawer(false);
                    setShowRateModal(true);
                  }}
                >
                  <View style={styles.drawerMenuIcon}>
                    <Ionicons name="star-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.drawerMenuText}>Rate us</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#B71C1C"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity
                  style={[
                    styles.drawerMenuItem,
                    {
                      marginTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#E0E0E0",
                      paddingTop: 16,
                    },
                  ]}
                  onPress={() => {
                    handleLogout();
                  }}
                >
                  <View
                    style={[
                      styles.drawerMenuIcon,
                      { backgroundColor: "#FBE9E7" },
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#D32F2F"
                    />
                  </View>
                  <Text style={[styles.drawerMenuText, { color: "#D32F2F" }]}>
                    Logout
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#D32F2F"
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Match Options Modal */}
        <Modal
          visible={showMatchOptionsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMatchOptionsModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMatchOptionsModal(false)}
          >
            <View style={styles.matchOptionsContainer}>
              <Text style={styles.matchOptionsTitle}>Choose an Option</Text>

              {/* Start a Match Card */}
              <TouchableOpacity
                style={styles.matchOptionCard}
                onPress={() => {
                  setShowMatchOptionsModal(false);
                  // New input-driven flow: players → match setup → scoring
                  router.push("/setup/players");
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#B71C1C", "#8B0000", "#8B0000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.matchOptionGradient}
                >
                  <View style={styles.matchOptionIconCircle}>
                    <Ionicons name="baseball" size={32} color="#FFF" />
                  </View>
                  <View style={styles.matchOptionTextContainer}>
                    <Text style={styles.matchOptionTitle}>Start a Match</Text>
                    <Text style={styles.matchOptionDescription}>
                      Create and manage your cricket match
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Create Tournament Card */}
              <TouchableOpacity
                style={styles.matchOptionCard}
                onPress={() => {
                  setShowMatchOptionsModal(false);
                  router.push({
                    pathname: "/(tabs)/my-cricket",
                    params: { action: "createTournament" },
                  });
                }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#B71C1C", "#8B0000", "#8B0000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.matchOptionGradient}
                >
                  <View style={styles.matchOptionIconCircle}>
                    <Ionicons name="trophy" size={32} color="#FFF" />
                  </View>
                  <View style={styles.matchOptionTextContainer}>
                    <Text style={styles.matchOptionTitle}>
                      Create Tournament
                    </Text>
                    <Text style={styles.matchOptionDescription}>
                      Add a tournament or series
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ===== CricHeroes Store Modal ===== */}
        <Modal
          visible={showStoreModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStoreModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowStoreModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>CricHeroes Store</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.storeHeroBanner}>
                <Ionicons name="bag" size={48} color="#B71C1C" />
                <Text style={styles.storeHeroTitle}>Official Cricket Gear</Text>
                <Text style={styles.storeHeroSubtitle}>
                  Premium equipment for every cricketer
                </Text>
              </View>
              {[
                {
                  id: 1,
                  name: "SG Cricket Bat",
                  price: "₹4,999",
                  originalPrice: "₹6,500",
                  category: "Bats",
                  rating: 4.8,
                  reviews: 234,
                  badge: "BESTSELLER",
                },
                {
                  id: 2,
                  name: "Kookaburra Ball",
                  price: "₹899",
                  originalPrice: "₹1,200",
                  category: "Balls",
                  rating: 4.6,
                  reviews: 189,
                  badge: "NEW",
                },
                {
                  id: 3,
                  name: "MRF Batting Gloves",
                  price: "₹1,499",
                  originalPrice: "₹2,000",
                  category: "Gloves",
                  rating: 4.7,
                  reviews: 156,
                  badge: null,
                },
                {
                  id: 4,
                  name: "SS Helmet Pro",
                  price: "₹2,799",
                  originalPrice: "₹3,500",
                  category: "Helmets",
                  rating: 4.9,
                  reviews: 312,
                  badge: "TOP RATED",
                },
                {
                  id: 5,
                  name: "Adidas Cricket Shoes",
                  price: "₹3,299",
                  originalPrice: "₹4,200",
                  category: "Footwear",
                  rating: 4.5,
                  reviews: 98,
                  badge: null,
                },
                {
                  id: 6,
                  name: "India Team Jersey",
                  price: "₹2,199",
                  originalPrice: "₹2,800",
                  category: "Apparel",
                  rating: 4.8,
                  reviews: 445,
                  badge: "HOT",
                },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.storeProductCard}
                  activeOpacity={0.85}
                >
                  <View style={styles.storeProductImageBox}>
                    <Ionicons name="bag-handle" size={36} color="#B71C1C" />
                    {item.badge && (
                      <View style={styles.storeBadge}>
                        <Text style={styles.storeBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.storeProductInfo}>
                    <Text style={styles.storeProductCategory}>
                      {item.category}
                    </Text>
                    <Text style={styles.storeProductName}>{item.name}</Text>
                    <View style={styles.storeRatingRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={
                            s <= Math.floor(item.rating)
                              ? "star"
                              : "star-outline"
                          }
                          size={12}
                          color="#F59E0B"
                        />
                      ))}
                      <Text style={styles.storeRatingText}>
                        {item.rating} ({item.reviews})
                      </Text>
                    </View>
                    <View style={styles.storePriceRow}>
                      <Text style={styles.storePrice}>{item.price}</Text>
                      <Text style={styles.storeOriginalPrice}>
                        {item.originalPrice}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.storeAddCartBtn}>
                      <Ionicons name="cart" size={14} color="#FFF" />
                      <Text style={styles.storeAddCartText}>Add to Cart</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== Leaderboards Modal ===== */}
        <Modal
          visible={showLeaderboardModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLeaderboardModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowLeaderboardModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Leaderboards</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.lbTabRow}>
                {["Batting", "Bowling", "All-Round"].map((tab, i) => (
                  <View
                    key={tab}
                    style={[styles.lbTab, i === 0 && styles.lbTabActive]}
                  >
                    <Text
                      style={[
                        styles.lbTabText,
                        i === 0 && styles.lbTabTextActive,
                      ]}
                    >
                      {tab}
                    </Text>
                  </View>
                ))}
              </View>
              {[
                {
                  rank: 1,
                  name: "Virat Kohli",
                  team: "India",
                  stat: "892 pts",
                  initials: "VK",
                  color: "#B71C1C",
                },
                {
                  rank: 2,
                  name: "Rohit Sharma",
                  team: "India",
                  stat: "845 pts",
                  initials: "RS",
                  color: "#8B0000",
                },
                {
                  rank: 3,
                  name: "Steve Smith",
                  team: "Australia",
                  stat: "820 pts",
                  initials: "SS",
                  color: "#C62828",
                },
                {
                  rank: 4,
                  name: "Kane Williamson",
                  team: "New Zealand",
                  stat: "798 pts",
                  initials: "KW",
                  color: "#10B981",
                },
                {
                  rank: 5,
                  name: "Joe Root",
                  team: "England",
                  stat: "776 pts",
                  initials: "JR",
                  color: "#34D399",
                },
                {
                  rank: 6,
                  name: "Babar Azam",
                  team: "Pakistan",
                  stat: "754 pts",
                  initials: "BA",
                  color: "#EF9A9A",
                },
                {
                  rank: 7,
                  name: "David Warner",
                  team: "Australia",
                  stat: "731 pts",
                  initials: "DW",
                  color: "#B71C1C",
                },
                {
                  rank: 8,
                  name: "KL Rahul",
                  team: "India",
                  stat: "718 pts",
                  initials: "KR",
                  color: "#8B0000",
                },
              ].map((player) => (
                <View
                  key={player.rank}
                  style={[styles.lbRow, player.rank <= 3 && styles.lbRowTop]}
                >
                  <View
                    style={[
                      styles.lbRankBadge,
                      player.rank === 1 && { backgroundColor: "#F59E0B" },
                      player.rank === 2 && { backgroundColor: "#9CA3AF" },
                      player.rank === 3 && { backgroundColor: "#D97706" },
                    ]}
                  >
                    <Text style={styles.lbRankText}>{player.rank}</Text>
                  </View>
                  <View
                    style={[styles.lbAvatar, { backgroundColor: player.color }]}
                  >
                    <Text style={styles.lbAvatarText}>{player.initials}</Text>
                  </View>
                  <View style={styles.lbInfo}>
                    <Text style={styles.lbName}>{player.name}</Text>
                    <Text style={styles.lbTeam}>{player.team}</Text>
                  </View>
                  <Text style={styles.lbStat}>{player.stat}</Text>
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== CricHeroes Awards Modal ===== */}
        <Modal
          visible={showAwardsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAwardsModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowAwardsModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>CricHeroes Awards</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.awardsHero}>
                <Ionicons name="trophy" size={56} color="#F59E0B" />
                <Text style={styles.awardsHeroTitle}>Season Awards 2024</Text>
                <Text style={styles.awardsHeroSub}>
                  Celebrating the best in cricket
                </Text>
              </View>
              {[
                {
                  award: "Player of the Year",
                  winner: "Virat Kohli",
                  team: "India",
                  icon: "trophy",
                  color: "#F59E0B",
                },
                {
                  award: "Best Batsman",
                  winner: "Rohit Sharma",
                  team: "India",
                  icon: "baseball",
                  color: "#B71C1C",
                },
                {
                  award: "Best Bowler",
                  winner: "Jasprit Bumrah",
                  team: "India",
                  icon: "radio-button-on",
                  color: "#8B0000",
                },
                {
                  award: "Best All-Rounder",
                  winner: "Hardik Pandya",
                  team: "India",
                  icon: "star",
                  color: "#C62828",
                },
                {
                  award: "Best Wicket Keeper",
                  winner: "MS Dhoni",
                  team: "India",
                  icon: "shield",
                  color: "#10B981",
                },
                {
                  award: "Emerging Player",
                  winner: "Shubman Gill",
                  team: "India",
                  icon: "flash",
                  color: "#34D399",
                },
                {
                  award: "Best Captain",
                  winner: "Rohit Sharma",
                  team: "India",
                  icon: "ribbon",
                  color: "#B71C1C",
                },
              ].map((item, i) => (
                <View key={i} style={styles.awardCard}>
                  <View
                    style={[
                      styles.awardIconCircle,
                      { backgroundColor: item.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color={item.color}
                    />
                  </View>
                  <View style={styles.awardInfo}>
                    <Text style={styles.awardTitle}>{item.award}</Text>
                    <Text style={styles.awardWinner}>{item.winner}</Text>
                    <Text style={styles.awardTeam}>{item.team}</Text>
                  </View>
                  <Ionicons name="medal" size={24} color="#F59E0B" />
                </View>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== Associations Modal ===== */}
        <Modal
          visible={showAssociationsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAssociationsModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowAssociationsModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Associations</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionSubHeader}>
                Cricket Associations Near You
              </Text>
              {[
                {
                  name: "Mumbai Cricket Association",
                  members: "1,240",
                  tournaments: 18,
                  city: "Mumbai",
                  initials: "MCA",
                },
                {
                  name: "Delhi & District Cricket Association",
                  members: "980",
                  tournaments: 14,
                  city: "Delhi",
                  initials: "DDCA",
                },
                {
                  name: "Board of Control for Cricket in India",
                  members: "5,000+",
                  tournaments: 45,
                  city: "National",
                  initials: "BCCI",
                },
                {
                  name: "Karnataka State Cricket Association",
                  members: "760",
                  tournaments: 12,
                  city: "Bangalore",
                  initials: "KSCA",
                },
                {
                  name: "Tamil Nadu Cricket Association",
                  members: "820",
                  tournaments: 16,
                  city: "Chennai",
                  initials: "TNCA",
                },
                {
                  name: "Rajasthan Cricket Association",
                  members: "540",
                  tournaments: 9,
                  city: "Jaipur",
                  initials: "RCA",
                },
              ].map((assoc, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.assocCard}
                  activeOpacity={0.85}
                >
                  <View style={styles.assocAvatar}>
                    <Text style={styles.assocAvatarText}>{assoc.initials}</Text>
                  </View>
                  <View style={styles.assocInfo}>
                    <Text style={styles.assocName}>{assoc.name}</Text>
                    <Text style={styles.assocCity}>{assoc.city}</Text>
                    <View style={styles.assocStats}>
                      <Ionicons name="people" size={12} color="#666" />
                      <Text style={styles.assocStatText}>
                        {assoc.members} members
                      </Text>
                      <Ionicons
                        name="trophy"
                        size={12}
                        color="#666"
                        style={{ marginLeft: 8 }}
                      />
                      <Text style={styles.assocStatText}>
                        {assoc.tournaments} tournaments
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.assocJoinBtn}>
                    <Text style={styles.assocJoinText}>Join</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== Clubs Modal ===== */}
        <Modal
          visible={showClubsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowClubsModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowClubsModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Clubs</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity style={styles.createClubBtn}>
                <LinearGradient
                  colors={["#B71C1C", "#8B0000"]}
                  style={styles.createClubGradient}
                >
                  <Ionicons name="add-circle" size={22} color="#FFF" />
                  <Text style={styles.createClubText}>Create a New Club</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.sectionSubHeader}>
                Popular Clubs Near You
              </Text>
              {[
                {
                  name: "Mumbai Warriors CC",
                  members: 24,
                  wins: 18,
                  matches: 25,
                  founded: "2018",
                  initials: "MW",
                  color: "#B71C1C",
                },
                {
                  name: "Delhi Strikers Club",
                  members: 18,
                  wins: 12,
                  matches: 20,
                  founded: "2019",
                  initials: "DS",
                  color: "#8B0000",
                },
                {
                  name: "Bangalore Challengers",
                  members: 22,
                  wins: 15,
                  matches: 22,
                  founded: "2017",
                  initials: "BC",
                  color: "#C62828",
                },
                {
                  name: "Chennai Kings CC",
                  members: 20,
                  wins: 10,
                  matches: 18,
                  founded: "2020",
                  initials: "CK",
                  color: "#10B981",
                },
                {
                  name: "Kolkata Knights Club",
                  members: 16,
                  wins: 8,
                  matches: 15,
                  founded: "2021",
                  initials: "KK",
                  color: "#34D399",
                },
              ].map((club, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.clubCard}
                  activeOpacity={0.85}
                >
                  <View
                    style={[styles.clubAvatar, { backgroundColor: club.color }]}
                  >
                    <Text style={styles.clubAvatarText}>{club.initials}</Text>
                  </View>
                  <View style={styles.clubInfo}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubFounded}>
                      Founded {club.founded}
                    </Text>
                    <View style={styles.clubStats}>
                      <Ionicons name="people" size={12} color="#666" />
                      <Text style={styles.clubStatText}>
                        {club.members} members
                      </Text>
                      <Ionicons
                        name="trophy"
                        size={12}
                        color="#666"
                        style={{ marginLeft: 8 }}
                      />
                      <Text style={styles.clubStatText}>
                        {club.wins}/{club.matches} W
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.clubJoinBtn}>
                    <Text style={styles.clubJoinText}>Join</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== Contact Modal ===== */}
        <Modal
          visible={showContactModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowContactModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowContactModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Contact Us</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.contactHero}>
                <Ionicons name="headset" size={56} color="#B71C1C" />
                <Text style={styles.contactHeroTitle}>
                  We are here to help!
                </Text>
                <Text style={styles.contactHeroSub}>
                  Reach out to us anytime
                </Text>
              </View>
              {[
                {
                  icon: "call",
                  label: "Phone Support",
                  value: "+91 98765 43210",
                  sub: "Mon-Sat, 9AM - 6PM",
                },
                {
                  icon: "mail",
                  label: "Email Support",
                  value: "support@gamelens.com",
                  sub: "Response within 24 hours",
                },
                {
                  icon: "logo-whatsapp",
                  label: "WhatsApp",
                  value: "+91 98765 43210",
                  sub: "Quick responses",
                },
                {
                  icon: "location",
                  label: "Office Address",
                  value: "GameLens HQ, Mumbai",
                  sub: "Maharashtra, India - 400001",
                },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.contactCard}
                  activeOpacity={0.85}
                >
                  <View style={styles.contactIconCircle}>
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color="#B71C1C"
                    />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>{item.label}</Text>
                    <Text style={styles.contactValue}>{item.value}</Text>
                    <Text style={styles.contactSub}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#B71C1C" />
                </TouchableOpacity>
              ))}
              <View style={styles.contactFormSection}>
                <Text style={styles.contactFormTitle}>Send us a message</Text>
                <TextInput
                  style={styles.contactInput}
                  placeholder="Your name"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={styles.contactInput}
                  placeholder="Your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                />
                <TextInput
                  style={[
                    styles.contactInput,
                    { height: 100, textAlignVertical: "top" },
                  ]}
                  placeholder="Your message..."
                  placeholderTextColor="#999"
                  multiline
                />
                <TouchableOpacity style={styles.contactSendBtn}>
                  <LinearGradient
                    colors={["#B71C1C", "#8B0000"]}
                    style={styles.contactSendGradient}
                  >
                    <Ionicons name="send" size={18} color="#FFF" />
                    <Text style={styles.contactSendText}>Send Message</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== Share the App Modal ===== */}
        <Modal
          visible={showShareModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowShareModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Share the App</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.shareHero}>
                <View style={styles.shareAppIcon}>
                  <Text style={styles.shareAppIconText}>{"CRICK\nBUZ"}</Text>
                </View>
                <Text style={styles.shareHeroTitle}>Invite Your Friends!</Text>
                <Text style={styles.shareHeroSub}>
                  Share GameLens and earn rewards for every friend who joins
                </Text>
              </View>
              <View style={styles.shareReferralBox}>
                <Text style={styles.shareReferralLabel}>
                  Your Referral Code
                </Text>
                <View style={styles.shareReferralCodeRow}>
                  <Text style={styles.shareReferralCode}>GAME2024</Text>
                  <TouchableOpacity style={styles.shareCopyBtn}>
                    <Ionicons name="copy" size={18} color="#B71C1C" />
                    <Text style={styles.shareCopyText}>Copy</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.shareViaLabel}>Share via</Text>
              <View style={styles.shareOptionsGrid}>
                {[
                  {
                    icon: "logo-whatsapp",
                    label: "WhatsApp",
                    color: "#25D366",
                  },
                  {
                    icon: "logo-facebook",
                    label: "Facebook",
                    color: "#1877F2",
                  },
                  { icon: "logo-twitter", label: "Twitter", color: "#1DA1F2" },
                  { icon: "mail", label: "Email", color: "#B71C1C" },
                  {
                    icon: "logo-instagram",
                    label: "Instagram",
                    color: "#E1306C",
                  },
                  { icon: "share-social", label: "More", color: "#666" },
                ].map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.shareOption}
                    activeOpacity={0.8}
                    onPress={() =>
                      shareToPlatform(opt.label, {
                        title: "Download GameLens App!",
                        message:
                          "Get real-time cricket updates, community stories, and tournaments near you. Sign up with my referral code GAME2024!",
                        type: "app",
                      })
                    }
                  >
                    <View
                      style={[
                        styles.shareOptionIcon,
                        { backgroundColor: opt.color },
                      ]}
                    >
                      <Ionicons name={opt.icon as any} size={26} color="#FFF" />
                    </View>
                    <Text style={styles.shareOptionLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.shareRewardBox}>
                <Ionicons name="gift" size={28} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.shareRewardTitle}>Earn Rewards</Text>
                  <Text style={styles.shareRewardText}>
                    Get 50 GameCoins for every friend who signs up using your
                    code!
                  </Text>
                </View>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Modal>

        {/* ===== Rate Us Modal ===== */}
        <Modal
          visible={showRateModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRateModal(false)}
        >
          <View style={styles.fullModalContainer}>
            <LinearGradient
              colors={["#B71C1C", "#8B0000", "#8B0000"]}
              style={styles.fullModalHeader}
            >
              <TouchableOpacity
                onPress={() => setShowRateModal(false)}
                style={styles.fullModalBack}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.fullModalTitle}>Rate Us</Text>
              <View style={{ width: 40 }} />
            </LinearGradient>
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
            >
              {ratingSubmitted ? (
                <View style={styles.ratingThanksBox}>
                  <Ionicons name="checkmark-circle" size={72} color="#22C55E" />
                  <Text style={styles.ratingThanksTitle}>Thank You!</Text>
                  <Text style={styles.ratingThanksSub}>
                    Your feedback means a lot to us. We will keep improving
                    GameLens for you!
                  </Text>
                  <TouchableOpacity
                    style={styles.ratingDoneBtn}
                    onPress={() => {
                      setShowRateModal(false);
                      setRatingSubmitted(false);
                      setSelectedRating(0);
                    }}
                  >
                    <Text style={styles.ratingDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.rateHero}>
                    <Ionicons name="star" size={56} color="#F59E0B" />
                    <Text style={styles.rateHeroTitle}>Enjoying GameLens?</Text>
                    <Text style={styles.rateHeroSub}>
                      Your rating helps us improve and reach more cricket fans
                    </Text>
                  </View>
                  <View style={styles.rateStarsRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setSelectedRating(star)}
                        style={styles.rateStar}
                      >
                        <Ionicons
                          name={
                            star <= selectedRating ? "star" : "star-outline"
                          }
                          size={48}
                          color={star <= selectedRating ? "#F59E0B" : "#CCC"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.rateLabel}>
                    {selectedRating === 0
                      ? "Tap a star to rate"
                      : selectedRating === 1
                        ? "Poor"
                        : selectedRating === 2
                          ? "Fair"
                          : selectedRating === 3
                            ? "Good"
                            : selectedRating === 4
                              ? "Very Good"
                              : "Excellent!"}
                  </Text>
                  {[
                    { title: "Easy to use", icon: "phone-portrait" },
                    { title: "Great features", icon: "flash" },
                    { title: "Accurate scoring", icon: "checkmark-circle" },
                    { title: "Good community", icon: "people" },
                  ].map((tag, i) => (
                    <View key={i} style={styles.rateTagRow}>
                      <Ionicons
                        name={tag.icon as any}
                        size={18}
                        color="#B71C1C"
                      />
                      <Text style={styles.rateTagText}>{tag.title}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.rateSubmitBtn,
                      selectedRating === 0 && { opacity: 0.5 },
                    ]}
                    disabled={selectedRating === 0}
                    onPress={() => setRatingSubmitted(true)}
                  >
                    <LinearGradient
                      colors={["#B71C1C", "#8B0000"]}
                      style={styles.rateSubmitGradient}
                    >
                      <Text style={styles.rateSubmitText}>Submit Rating</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rateLaterBtn}
                    onPress={() => setShowRateModal(false)}
                  >
                    <Text style={styles.rateLaterText}>Maybe Later</Text>
                  </TouchableOpacity>
                </>
              )}
              <View style={{ height: 40 }} />
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFCDD2",
    borderRadius: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#B71C1C",
    fontWeight: "600",
  },
  matchCardImage: {
    borderRadius: 12,
  },
  matchCardOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 16,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  matchBadge: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  matchBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  matchTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  matchTeams: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  matchTeam: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  matchVs: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9E9E9E",
    marginHorizontal: 10,
  },
  matchLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
    justifyContent: "center",
  },
  matchLocationText: {
    fontSize: 14,
    color: "#FFF",
  },
  joinMatchButton: {
    backgroundColor: "#B71C1C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  joinMatchText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  paginationDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF9A9A",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#B71C1C",
  },
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  banner: {
    backgroundColor: "#8B0000",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    minHeight: 148,
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.34)",
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#EF9A9A",
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: "#EF9A9A",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B0000",
  },
  bannerIcon: {
    marginLeft: 16,
    zIndex: 1,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  seeAll: {
    fontSize: 14,
    color: "#B71C1C",
    fontWeight: "600",
  },
  playersListContainer: {
    gap: 12,
  },
  playerListItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  playerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
  },
  playerRankNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  playerAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    overflow: "hidden",
  },
  playerAvatarImage: {
    width: "100%",
    height: "100%",
  },
  playerAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  playerInfoColumn: {
    flex: 1,
    gap: 4,
  },
  playerListName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  playerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerListRole: {
    fontSize: 12,
    color: "#B71C1C",
    fontWeight: "600",
  },
  playerDivider: {
    fontSize: 12,
    color: "#999",
  },
  playerListTeam: {
    fontSize: 12,
    color: "#666",
  },
  playerListStats: {
    fontSize: 11,
    color: "#666",
  },
  playerFollowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#B71C1C",
  },
  seeMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#EF9A9A",
    borderStyle: "dashed",
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B71C1C",
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  playerInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
  },
  playerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  playerRole: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  productCard: {
    width: 120,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  productImageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  productImageStyle: {
    borderRadius: 12,
  },
  productOverlay: {
    backgroundColor: "transparent",
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  productInfo: {
    flex: 1,
    marginRight: 6,
  },
  productName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#B71C1C",
  },
  addToCartButton: {
    backgroundColor: "#B71C1C",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: "80%",
  },
  modalPlayerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  modalPlayerImage: {
    width: "100%",
    height: "100%",
  },
  modalPlayerInitials: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFF",
  },
  modalPlayerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalPlayerRole: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  modalPlayerTeam: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  modalPlayerStats: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  followButton: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 50,
  },
  searchModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFCDD2",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 12,
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
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  searchResultText: {
    fontSize: 16,
    color: "#333",
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    marginTop: 50,
  },
  chatModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatAvatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: "#666",
  },
  chatMeta: {
    alignItems: "flex-end",
    gap: 4,
  },
  chatTime: {
    fontSize: 12,
    color: "#999",
  },
  chatBadge: {
    backgroundColor: "#B71C1C",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  chatBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  profileEditor: {
    maxHeight: "92%",
    backgroundColor: "#F8F9FA",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  profileEditorHeaderGradient: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  profileEditorHeader: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileEditorTitleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
  },
  profileSavePillBtn: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileSaveTxt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8B0000",
  },
  profileEditorBody: {
    padding: 16,
  },
  profileModernHero: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  profileHeroAvatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileHeroAvatarRing: {
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeroAvatar: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 47,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileHeroImage: {
    width: "100%",
    height: "100%",
  },
  profileHeroInitials: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
  },
  profileHeroEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#8B0000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  profileHeroName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  profileHeroUsername: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  profileHeroLocation: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  profileHeroStatsStrip: {
    flexDirection: "row",
    width: "100%",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    justifyContent: "space-around",
    alignItems: "center",
  },
  profileHeroStatItem: {
    alignItems: "center",
  },
  profileHeroStatNum: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  profileHeroStatLbl: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  profileHeroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#ECECEC",
  },
  profileConfigSectionCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  profileConfigSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
    marginBottom: 14,
  },
  profileConfigInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingVertical: 6,
    marginBottom: 10,
  },
  profileConfigInputContainerDouble: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    marginBottom: 10,
  },
  profileConfigIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileConfigInputWrapper: {
    flex: 1,
  },
  profileConfigLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#999",
    letterSpacing: 0.5,
  },
  profileConfigInput: {
    fontSize: 14,
    color: "#222",
    fontWeight: "600",
    paddingVertical: 2,
    marginTop: 2,
  },
  profileModernTrashBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F1",
    borderWidth: 1,
    borderColor: "#FFD1D1",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  profileModernTrashTxt: {
    fontSize: 13,
    fontWeight: "800",
    color: "#EF4444",
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },
  drawerContainer: {
    width: "80%",
    height: "100%",
    backgroundColor: "#FFF",
  },
  drawerProfile: {
    backgroundColor: "#4A4A4A",
    padding: 16,
    paddingTop: HEADER_PADDING_TOP,
    flexDirection: "row",
    alignItems: "center",
  },
  drawerProfileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  drawerProfileImage: {
    width: "100%",
    height: "100%",
  },
  drawerProfileInitials: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  drawerProfileInfo: {
    flex: 1,
  },
  drawerProfileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  drawerProfilePhone: {
    fontSize: 14,
    color: "#DDD",
    marginBottom: 6,
  },
  progressContainer: {
    backgroundColor: "#4A4A4A",
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#666",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#B71C1C",
  },
  progressText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
  },
  drawerMenu: {
    flex: 1,
  },
  drawerMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  drawerMenuIcon: {
    width: 32,
    marginRight: 12,
  },
  drawerMenuText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  drawerMenuBadge: {
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  drawerMenuBadgeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  matchOptionsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  matchOptionsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  matchOptionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  matchOptionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  matchOptionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  matchOptionTextContainer: {
    flex: 1,
  },
  matchOptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  matchOptionDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  // Search Results Styles
  searchPlayerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  searchPlayerImage: {
    width: "100%",
    height: "100%",
  },
  searchPlayerInitials: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  searchPlayerInfo: {
    flex: 1,
  },
  searchPlayerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  searchPlayerRole: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  searchPlayerStats: {
    fontSize: 12,
    color: "#B71C1C",
    fontWeight: "500",
  },
  searchMatchItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchMatchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  searchMatchBadge: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  searchMatchBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  searchMatchTime: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  searchMatchTeams: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  searchMatchLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  searchMatchLocationText: {
    fontSize: 12,
    color: "#666",
  },
  searchProductItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchProductInfo: {
    flex: 1,
  },
  searchProductName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  searchProductPrice: {
    fontSize: 14,
    color: "#B71C1C",
    fontWeight: "600",
  },
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

  // ===== Shared Full-Screen Modal Styles =====
  fullModalContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  fullModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: HEADER_PADDING_TOP,
    paddingBottom: 16,
  },
  fullModalBack: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  fullModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  fullModalBody: {
    flex: 1,
    padding: 16,
  },
  sectionSubHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ===== Store Styles =====
  storeHeroBanner: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeHeroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  storeHeroSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  storeProductCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeProductImageBox: {
    width: 100,
    height: 120,
    backgroundColor: "#FFCDD2",
    justifyContent: "center",
    alignItems: "center",
  },
  storeBadge: {
    position: "absolute",
    top: 8,
    left: 0,
    backgroundColor: "#B71C1C",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  storeBadgeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#FFF",
  },
  storeProductInfo: {
    flex: 1,
    padding: 12,
  },
  storeProductCategory: {
    fontSize: 11,
    color: "#B71C1C",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  storeProductName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  storeRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 6,
  },
  storeRatingText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  storePriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  storePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#B71C1C",
  },
  storeOriginalPrice: {
    fontSize: 13,
    color: "#999",
    textDecorationLine: "line-through",
  },
  storeAddCartBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B71C1C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    alignSelf: "flex-start",
  },
  storeAddCartText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },

  // ===== Leaderboard Styles =====
  lbTabRow: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lbTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  lbTabActive: {
    backgroundColor: "#B71C1C",
  },
  lbTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  lbTabTextActive: {
    color: "#FFF",
  },
  lbRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lbRowTop: {
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
  },
  lbRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  lbRankText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FFF",
  },
  lbAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  lbAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  lbInfo: {
    flex: 1,
  },
  lbName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  lbTeam: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  lbStat: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#B71C1C",
  },

  // ===== Awards Styles =====
  awardsHero: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  awardsHeroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  awardsHeroSub: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  awardCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  awardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  awardInfo: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  awardWinner: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 2,
  },
  awardTeam: {
    fontSize: 13,
    color: "#B71C1C",
    marginTop: 2,
  },

  // ===== Associations Styles =====
  assocCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  assocAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assocAvatarText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFF",
  },
  assocInfo: {
    flex: 1,
  },
  assocName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  assocCity: {
    fontSize: 12,
    color: "#B71C1C",
    marginBottom: 4,
  },
  assocStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  assocStatText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  assocJoinBtn: {
    backgroundColor: "#FFCDD2",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B71C1C",
  },
  assocJoinText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B71C1C",
  },

  // ===== Clubs Styles =====
  createClubBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  createClubGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  createClubText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  clubCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  clubAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  clubAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  clubFounded: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  clubStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  clubStatText: {
    fontSize: 11,
    color: "#666",
    marginLeft: 4,
  },
  clubJoinBtn: {
    backgroundColor: "#FFCDD2",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B71C1C",
  },
  clubJoinText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B71C1C",
  },

  // ===== Contact Styles =====
  contactHero: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactHeroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  contactHeroSub: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFCDD2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginTop: 2,
  },
  contactSub: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  contactFormSection: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactFormTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 14,
  },
  contactInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  contactSendBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  contactSendGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  contactSendText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },

  // ===== Share Styles =====
  shareHero: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shareAppIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shareAppIconText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    lineHeight: 18,
  },
  shareHeroTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  shareHeroSub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  shareReferralBox: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  shareReferralLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  shareReferralCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFCDD2",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderStyle: "dashed",
  },
  shareReferralCode: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#B71C1C",
    letterSpacing: 2,
  },
  shareCopyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shareCopyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B71C1C",
  },
  shareViaLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shareOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  shareOption: {
    width: "28%",
    alignItems: "center",
    gap: 6,
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  shareOptionLabel: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
  },
  shareRewardBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  shareRewardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  shareRewardText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  // ===== Rate Us Styles =====
  rateHero: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rateHeroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
    marginBottom: 6,
  },
  rateHeroSub: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  rateStarsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  rateStar: {
    padding: 4,
  },
  rateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#B71C1C",
    textAlign: "center",
    marginBottom: 20,
    minHeight: 24,
  },
  rateTagRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  rateTagText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  rateSubmitBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 12,
  },
  rateSubmitGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  rateSubmitText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFF",
  },
  rateLaterBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  rateLaterText: {
    fontSize: 15,
    color: "#999",
    fontWeight: "500",
  },
  ratingThanksBox: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  ratingThanksTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 10,
  },
  ratingThanksSub: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  ratingDoneBtn: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 28,
  },
  ratingDoneBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },

  // ===== Redesign Styles =====
  profileRoleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  profileRoleText: {
    fontSize: 13,
    color: "#B71C1C",
    fontWeight: "600",
  },
  profileStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileStatItem: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  profileStatVal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
  },
  profileStatLbl: {
    fontSize: 11,
    color: "#666",
  },
  profileStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E2E8F0",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  matchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeLive: {
    backgroundColor: "#FFCDD2",
  },
  statusBadgeUpcoming: {
    backgroundColor: "#F3F4F6",
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },
  upcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  statusBadgeTextLive: {
    color: "#EF4444",
  },
  statusBadgeTextUpcoming: {
    color: "#6B7280",
  },
  matchTimeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  matchTeamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  matchTeamLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  teamLogoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
  },
  teamLogoText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFF",
  },
  teamNameText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  teamScoreText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  matchCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  venueInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  venueText: {
    fontSize: 12,
    color: "#666",
  },
  cardActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B71C1C",
  },
  bannerTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  rank1Bg: {
    backgroundColor: "#F59E0B",
  },
  rank2Bg: {
    backgroundColor: "#9E9E9E",
  },
  rankWhiteText: {
    color: "#FFF",
  },
  playerRoleTag: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  playerRoleTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  playerStatsRowSmall: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  miniStatItem: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  storeScrollContent: {
    paddingRight: 16,
  },

  // ── Header ──────────────────────────────────────────────────────
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
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 1,
  },
  headerTitleOrange: { color: "#EF9A9A" },
  headerRight: { flexDirection: "row", gap: 1, marginRight: -4 },
  iconButton: { padding: 6 },

  // ── Premium Profile Card ─────────────────────────────────────────
  profileCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  profileCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  profileAvatarWrap: { position: "relative" },
  profileAvatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(110,231,183,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileAvatarImg: { width: "100%", height: "100%" },
  profileAvatarInitials: { fontSize: 20, fontWeight: "800", color: "#FFF" },
  profileOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4ADE80",
    borderWidth: 2,
    borderColor: "#0A2416",
  },
  profileCardInfo: { flex: 1 },
  profileCardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 3,
  },
  profileCardRole: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 8,
  },
  profileCardRoleTxt: { fontSize: 12, color: "#A7F3D0", fontWeight: "500" },
  completeProfilePrompt: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  completeProfilePromptTxt: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "700",
  },
  profileCardStats: { flexDirection: "row", alignItems: "center", gap: 12 },
  profileCardStat: { alignItems: "center" },
  profileCardStatVal: { fontSize: 15, fontWeight: "800", color: "#FFF" },
  profileCardStatLbl: { fontSize: 10, color: "#EF9A9A", fontWeight: "500" },
  profileCardStatDiv: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  profileEditBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Matches Section ──────────────────────────────────────────────
  matchesSection: {
    backgroundColor: "#FFF",
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 10,
  },
  matchesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  matchesSectionTitle: { fontSize: 17, fontWeight: "800", color: "#0A2416" },
  matchesSectionSub: { fontSize: 12, color: "#616161", marginTop: 2 },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFCDD2",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  locationPillTxt: { fontSize: 12, color: "#B71C1C", fontWeight: "700" },
  matchScrollContent: { paddingHorizontal: 16 },
  matchCardContainer: { marginRight: CARD_MARGIN, width: CARD_WIDTH },
  matchCard: {
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardActionButtonLive: {
    backgroundColor: "#EF9A9A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  // ── Cricket Profiles Section ────────────────────────────────────
  profilesSection: {
    backgroundColor: "#FFF",
    paddingTop: 16,
    paddingBottom: 16,
    marginBottom: 10,
  },
  profilesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  profilesSectionTitle: { fontSize: 17, fontWeight: "800", color: "#0A2416" },
  profilesSectionSub: { fontSize: 12, color: "#616161", marginTop: 2 },
  playerCardsScroll: { paddingHorizontal: 16, gap: 12 },
  playerCard: {
    width: 148,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  playerCardGradient: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    minHeight: 220,
  },
  playerCardRank: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#6B7280",
    marginBottom: 8,
  },
  playerCardRankTxt: { fontSize: 10, fontWeight: "800", color: "#FFF" },
  playerCardAvatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 10,
  },
  playerCardAvatar: { width: "100%", height: "100%" },
  playerCardAvatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  playerCardAvatarInitials: { fontSize: 22, fontWeight: "800", color: "#FFF" },
  playerCardName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFF",
    textAlign: "center",
    marginBottom: 5,
  },
  playerCardRolePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  playerCardRoleTxt: { fontSize: 10, color: "#E2E8F0", fontWeight: "600" },
  playerCardTeam: {
    fontSize: 11,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 10,
    fontWeight: "500",
  },
  playerCardStats: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  playerCardStat: { alignItems: "center" },
  playerCardStatVal: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  playerCardStatLbl: {
    fontSize: 9,
    color: "rgba(255,255,255,0.65)",
    fontWeight: "500",
  },
  playerCardFollowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  playerCardFollowTxt: { fontSize: 11, fontWeight: "700", color: "#B71C1C" },

  // Community Feed
  feedSection: { marginTop: 8, backgroundColor: "#F8F9FA" },
  feedHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
    letterSpacing: -0.3,
  },
  feedSubtitle: { fontSize: 12, color: "#888", marginTop: 2 },
  feedFilterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FBE9E7",
    borderWidth: 1,
    borderColor: "#B71C1C33",
  },
  feedFilterTxt: { fontSize: 12, fontWeight: "600", color: "#B71C1C" },
  storiesRow: {
    paddingHorizontal: 7,
    paddingTop: 5,
    paddingBottom: 3,
    gap: 12,
  },
  storiesDivider: {
    width: "85%",
    height: 2,
    backgroundColor: "#E0E0E0",
    borderRadius: 1,
    alignSelf: "center",
    marginVertical: 8,
  },
  storyItem: { alignItems: "center", width: 70 },
  storyAvatarCreate: {
    width: 60,
    height: 58,
    borderRadius: 20,
    position: "relative",
  },
  storyCreateInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E8FFF4",
    borderWidth: 2.5,
    borderColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  storyAvatarImg: { width: 56, height: 56, borderRadius: 28 },
  storyAddDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  storyAvatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    padding: 2,
  },
  storyAvatarInner: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  storyAvatarInitials: { fontSize: 16, fontWeight: "800", color: "#FFF" },
  storyName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#555",
    marginTop: 5,
    textAlign: "center",
  },
  createPostBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  createPostAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B71C1C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  createPostInitialsSmall: { fontSize: 13, fontWeight: "800", color: "#FFF" },
  createPostInputFake: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  createPostPlaceholderTxt: { fontSize: 13, color: "#AAA" },
  createPostActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  feedTabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  feedTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
  },
  feedTabActive: { backgroundColor: "#B71C1C" },
  feedTabTxt: { fontSize: 13, fontWeight: "600", color: "#666" },
  feedTabTxtActive: { color: "#FFF" },
  postCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  postAvatarRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    padding: 2,
    marginRight: 10,
  },
  postAvatar: {
    flex: 1,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  postAvatarInitials: { fontSize: 14, fontWeight: "800", color: "#FFF" },
  postUserInfo: { flex: 1 },
  postUserNameRow: { flexDirection: "row", alignItems: "center" },
  postUserName: { fontSize: 14, fontWeight: "700", color: "#111" },
  postMetaRow: { fontSize: 12, color: "#888", marginTop: 2 },
  postMoreBtn: { padding: 4 },
  postContentTxt: {
    fontSize: 14,
    color: "#222",
    lineHeight: 21,
    marginBottom: 10,
  },
  postTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  postTag: {
    backgroundColor: "#FBE9E7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  postTagTxt: { fontSize: 12, color: "#B71C1C", fontWeight: "600" },
  postMediaBox: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    height: 140,
  },
  postMediaGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  postMediaLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  postStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  postStatsLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeIconRow: { flexDirection: "row" },
  likeIconBg: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  postStatsTxt: { fontSize: 12, color: "#888" },
  postDivider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 10 },
  postActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  postActionTxt: { fontSize: 13, fontWeight: "600", color: "#666" },
  createModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  createModalSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  createModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  createModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  createModalCancel: { fontSize: 15, color: "#888", fontWeight: "500" },
  createModalTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  createModalPostBtn: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createModalPostTxt: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  createModalBody: { padding: 20 },
  createModalAvatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  createModalUserName: { fontSize: 15, fontWeight: "700", color: "#111" },
  audiencePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FBE9E7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#B71C1C33",
  },
  audiencePillTxt: { fontSize: 11, fontWeight: "600", color: "#B71C1C" },
  createModalInput: {
    fontSize: 16,
    color: "#222",
    lineHeight: 20,
    minHeight: 120,
    textAlignVertical: "top",
  },
  createModalToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 4,
  },
  toolbarBtn: { padding: 8 },
  charCount: { fontSize: 12, color: "#AAA", fontWeight: "500" },

  // Comments styles
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  commentInitials: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#374151",
  },
  commentTime: {
    fontSize: 10,
    color: "#9CA3AF",
  },
  commentText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  noCommentsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    marginTop: 8,
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  commentInput: {
    flex: 1,
    height: 36,
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 13,
    color: "#374151",
    marginRight: 8,
  },
  commentSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B71C1C",
    justifyContent: "center",
    alignItems: "center",
  },
});
