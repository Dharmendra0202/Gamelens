import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { TabScreenWrapper } from '@/components/ui/tab-screen-wrapper';
import { shareContent } from '@/utils/share';
import { useTabNavigator } from '@/contexts/TabNavigatorContext';
import { CricketPostCard } from '@/components/ui/cricket-post-card';

// Persistence Imports
import {
  getPosts,
  addPost,
  toggleLikePost,
  toggleSavePost,
  addCommentToPost,
  incrementShares,
  deletePost
} from '@/utils/postsDb';
import { getProfile, saveProfile as persistProfile } from '@/utils/profileDb';
import { CreatePostModal } from '@/components/ui/create-post-modal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  bannerUri: string;
  matches: string;
  runs: string;
  wickets: string;
  isPublic: boolean;
  showStats: boolean;
  isLookingForTeam: boolean;
};

const initialProfile: Profile = {
  name: 'Dharmendra Vishwakarma',
  phone: '8383999973',
  role: 'All-rounder',
  location: 'Mumbai',
  battingStyle: 'Right hand bat',
  bowlingStyle: 'Medium pace',
  friends: '125',
  posts: '0',
  imageUri: '',
  bannerUri: '',
  matches: '47',
  runs: '1048',
  wickets: '34',
  isPublic: true,
  showStats: true,
  isLookingForTeam: true,
};

// Collapsible Card Helper Component
const CollapsibleCard = ({ title, summary, icon, isCollapsed, onToggle, children }: any) => {
  return (
    <View style={styles.collapsibleCard}>
      <TouchableOpacity onPress={onToggle} style={styles.collapsibleHeader} activeOpacity={0.7}>
        <View style={styles.collapsibleHeaderLeft}>
          <View style={styles.collapsibleIconBox}>
            <Ionicons name={icon} size={18} color="#00A66A" />
          </View>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.collapsibleTitle}>{title}</Text>
            {isCollapsed && summary ? (
              <Text style={styles.collapsibleSummary} numberOfLines={1}>
                {summary}
              </Text>
            ) : null}
          </View>
        </View>
        <Ionicons name={isCollapsed ? "chevron-down" : "chevron-up"} size={18} color="#666" />
      </TouchableOpacity>
      {!isCollapsed && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
};

// Custom Switch/Toggle Component
const CustomToggle = ({ label, description, value, onValueChange, disabled }: any) => {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description ? <Text style={styles.toggleDescription}>{description}</Text> : null}
      </View>
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.8}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        style={[
          styles.switchContainer,
          value ? styles.switchContainerActive : styles.switchContainerInactive,
          disabled && { opacity: 0.6 }
        ]}
      >
        <View style={[styles.switchThumb, value ? styles.switchThumbActive : styles.switchThumbInactive]} />
      </TouchableOpacity>
    </View>
  );
};

const PLAYER_ROLES = ['All-rounder', 'Batsman', 'Bowler', 'Wicketkeeper'];
const BATTING_STYLES = ['Right hand bat', 'Left hand bat'];
const BOWLING_STYLES = ['Medium pace', 'Fast pace', 'Off spin', 'Leg spin', 'Left-arm spin', 'None'];
const POPULAR_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

export default function HomeScreen() {
  const { goToMainTab } = useTabNavigator();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [profileDraft, setProfileDraft] = useState<Profile>(initialProfile);

  // Active editing sheet ('personal' | 'cricket' | 'stats' | null)
  const [activeEditSheet, setActiveEditSheet] = useState<'personal' | 'cricket' | 'stats' | null>(null);

  // Auto-save status feedback
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | ''>('');

  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [selectedPostForComments, setSelectedPostForComments] = useState<any>(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);

  // Load database posts and user profile on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedPosts = await getPosts();
        setCommunityPosts(storedPosts);
        const storedProfile = await getProfile();
        setProfile(storedProfile);
        setProfileDraft(storedProfile);
      } catch (err) {
        console.warn('Failed to load storage data in HomeScreen:', err);
      }
    }
    loadData();
  }, []);

  const renderPostCard = useCallback((post: any) => (
    <CricketPostCard
      key={post.id}
      post={post}
      onLike={async (id) => {
        const updated = await toggleLikePost(id);
        setCommunityPosts(updated);
      }}
      onComment={(p) => {
        setSelectedPostForComments(p);
        setShowCommentsModal(true);
      }}
      onShare={async (id) => {
        const shared = await shareContent({
          title: `Post by ${post.user}`,
          message: post.content,
          type: 'post',
          id: post.id,
        });
        if (shared) {
          const updated = await incrementShares(id);
          setCommunityPosts(updated);
        }
      }}
      onSave={async (id) => {
        const updated = await toggleSavePost(id);
        setCommunityPosts(updated);
      }}
      onDelete={async (id) => {
        const performDelete = async () => {
          const updated = await deletePost(id);
          setCommunityPosts(updated);
          if (selectedPostForComments?.id === id) {
            setShowCommentsModal(false);
          }
        };

        if (Platform.OS === 'web') {
          if (confirm('Are you sure you want to delete this post?')) {
            await performDelete();
          }
        } else {
          Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: performDelete }
            ]
          );
        }
      }}
    />
  ), [selectedPostForComments]);

  const profileInitials = useMemo(() => {
    return profile.name
      .split(' ')
      .filter(Boolean)
      .map((namePart) => namePart[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ME';
  }, [profile.name]);

  const openProfileEditor = useCallback(() => {
    setProfileDraft(profile);
    setShowProfileModal(true);
  }, [profile]);

  const updateProfileDraft = useCallback((key: keyof Profile, value: any) => {
    setProfileDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  }, []);

  // saveProfile kept for reference but not wired to any button
  const saveProfile = useCallback(() => {
    setProfile(profileDraft);
    setShowProfileModal(false);
  }, [profileDraft]);

  const applySectionChanges = (section: 'personal' | 'cricket' | 'stats') => {
    const errors: Record<string, string> = {};
    if (section === 'personal') {
      if (!profileDraft.name?.trim()) {
        errors.name = 'Name cannot be empty';
      }
      if (!profileDraft.phone?.trim()) {
        errors.phone = 'Phone number cannot be empty';
      } else if (!/^\d{10}$/.test(profileDraft.phone.trim())) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }
    } else if (section === 'stats') {
      const isInteger = (val: string) => /^\d*$/.test(String(val || ''));
      if (!isInteger(profileDraft.matches)) errors.matches = 'Matches must be a number';
      if (!isInteger(profileDraft.runs)) errors.runs = 'Runs must be a number';
      if (!isInteger(profileDraft.wickets)) errors.wickets = 'Wickets must be a number';
      if (!isInteger(profileDraft.friends)) errors.friends = 'Friends must be a number';
      if (!isInteger(profileDraft.posts)) errors.posts = 'Posts must be a number';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    setProfile(profileDraft);
    persistProfile(profileDraft);
    setAutoSaveStatus('saved');
    setTimeout(() => setAutoSaveStatus(''), 1500);
    return true;
  };

  const closeEditSheet = useCallback(() => {
    setProfileDraft(profile);
    setValidationErrors({});
    setActiveEditSheet(null);
  }, [profile]);

  const handleDoneModal = () => {
    const errors: Record<string, string> = {};
    if (!profileDraft.name?.trim()) errors.name = 'Name cannot be empty';
    if (!profileDraft.phone?.trim()) {
      errors.phone = 'Phone number cannot be empty';
    } else if (!/^\d{10}$/.test(profileDraft.phone.trim())) {
      errors.phone = 'Phone must be exactly 10 digits';
    }
    const isInteger = (val: string) => /^\d*$/.test(String(val || ''));
    if (!isInteger(profileDraft.matches)) errors.matches = 'Must be a number';
    if (!isInteger(profileDraft.runs)) errors.runs = 'Must be a number';
    if (!isInteger(profileDraft.wickets)) errors.wickets = 'Must be a number';
    if (!isInteger(profileDraft.friends)) errors.friends = 'Must be a number';
    if (!isInteger(profileDraft.posts)) errors.posts = 'Must be a number';

    if (Object.keys(errors).length > 0) {
      if (errors.name || errors.phone) {
        setActiveEditSheet('personal');
      } else {
        setActiveEditSheet('stats');
      }
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setProfile(profileDraft);
    persistProfile(profileDraft);
    setShowProfileModal(false);
  };

  const handleCancelModal = useCallback(() => {
    setProfileDraft(profile);
    setValidationErrors({});
    setShowProfileModal(false);
  }, [profile]);

  // Profile completion — memoized, only recalculates when profileDraft changes
  const calculateCompletion = useCallback((p: Profile) => {
    const fields = [p.name, p.phone, p.role, p.location, p.battingStyle, p.bowlingStyle];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, []);

  const completionPercent = useMemo(() => calculateCompletion(profileDraft), [profileDraft, calculateCompletion]);

  // Image Upload trigger for profile
  const pickProfileImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      updateProfileDraft('imageUri', result.assets[0].uri);
    }
  }, [updateProfileDraft]);

  const pickBannerImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      updateProfileDraft('bannerUri', result.assets[0].uri);
    }
  }, [updateProfileDraft]);

  // entrance animations — single stagger value drives all three sections
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TabScreenWrapper swipeEnabled={false}>
      <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#00A66A", "#0F766E", "#064E3B"]}
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
          <TouchableOpacity style={styles.iconButton} onPress={() => goToMainTab(1)}>
            <Ionicons name="search" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => goToMainTab(3)}>
            <Ionicons name="chatbubble-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Notifications clicked')}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Premium Profile Card ── */}
        <Animated.View style={{
          opacity: entranceAnim,
          transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0,1], outputRange: [16,0] }) }]
        }}>
          <TouchableOpacity style={styles.profileCard} onPress={openProfileEditor} activeOpacity={0.88}>
            <LinearGradient colors={['#064E3B','#0F766E','#00A66A']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.profileCardGradient}>
              {/* Avatar */}
              <View style={styles.profileAvatarWrap}>
                <View style={styles.profileAvatarRing}>
                  <View style={styles.profileAvatarInner}>
                    {profile.imageUri
                      ? <Image source={{ uri: profile.imageUri }} style={styles.profileAvatarImg} />
                      : <Text style={styles.profileAvatarInitials}>{profileInitials}</Text>}
                  </View>
                </View>
                <View style={styles.profileOnlineDot} />
              </View>
              {/* Info */}
              <View style={styles.profileCardInfo}>
                <Text style={styles.profileCardName} numberOfLines={1}>{profile.name}</Text>
                <View style={styles.profileCardRole}>
                  <Ionicons name="ribbon" size={11} color="#6EE7B7" />
                  <Text style={styles.profileCardRoleTxt}>{profile.role} · {profile.location}</Text>
                </View>
                <View style={styles.profileCardStats}>
                  <View style={styles.profileCardStat}>
                    <Text style={styles.profileCardStatVal}>{profile.friends}</Text>
                    <Text style={styles.profileCardStatLbl}>Friends</Text>
                  </View>
                  <View style={styles.profileCardStatDiv} />
                  <View style={styles.profileCardStat}>
                    <Text style={styles.profileCardStatVal}>{communityPosts.length}</Text>
                    <Text style={styles.profileCardStatLbl}>Posts</Text>
                  </View>
                  <View style={styles.profileCardStatDiv} />
                  <View style={styles.profileCardStat}>
                    <Text style={styles.profileCardStatVal}>{profile.matches || '0'}</Text>
                    <Text style={styles.profileCardStatLbl}>Matches</Text>
                  </View>
                </View>
              </View>
              {/* Edit badge */}
              {Platform.OS !== 'web' && (
                <View style={styles.profileEditBadge}>
                  <Ionicons name="pencil" size={13} color="#FFF" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* ─ Share / Post button below profile card ─ */}
          <TouchableOpacity
            style={styles.profilePostBtn}
            activeOpacity={0.85}
            onPress={() => setShowCreatePostModal(true)}
          >
            <View style={styles.profilePostAvatarSmall}>
              {profile.imageUri
                ? <Image source={{ uri: profile.imageUri }} style={{ width: 32, height: 32, borderRadius: 16 }} />
                : <Text style={styles.profilePostInitials}>{profileInitials}</Text>}
            </View>
            <Text style={styles.profilePostPlaceholder}>Share a match story, tip or update…</Text>
            <View style={styles.profilePostActions}>
              <Ionicons name="image-outline" size={19} color="#00A66A" />
              <Ionicons name="create-outline" size={19} color="#0F766E" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>

          {/* ─ My Posts mini-feed ─ */}
          {communityPosts.length > 0 ? (
            <View style={styles.myPostsSection}>
              <Text style={styles.myPostsTitle}>My Posts</Text>
              {communityPosts.map(renderPostCard)}
            </View>
          ) : (
            <View style={styles.emptyFeedContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#CCC" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyFeedTitle}>No posts yet</Text>
              <Text style={styles.emptyFeedSubtitle}>Be the first to share a match update or tip!</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>

      {/* ── Create Post Modal ── */}
      <CreatePostModal
        visible={showCreatePostModal}
        onClose={() => setShowCreatePostModal(false)}
        userName={profile.name}
        userInitials={profileInitials}
        onPost={async (postData) => {
          await new Promise(resolve => setTimeout(resolve, 600));

          const newPost = {
            id: Date.now(),
            user: profile.name,
            initials: profileInitials,
            color: '#00A66A',
            role: profile.role,
            time: 'Just now',
            content: postData.content,
            tags: postData.tags,
            hasMedia: !!postData.mediaUri,
            mediaUri: postData.mediaUri,
            mediaType: postData.mediaType,
            location: postData.location,
            likes: 0,
            comments: 0,
            shares: 0,
            liked: false,
            saved: false,
            verified: false,
            commentsList: []
          };

          const updatedPosts = await addPost(newPost);
          setCommunityPosts(updatedPosts);
        }}
      />

      {/* ── Comments Modal ── */}
      <Modal visible={showCommentsModal} transparent animationType="slide" onRequestClose={() => setShowCommentsModal(false)}>
        <View style={styles.commentsOverlay}>
          <View style={[styles.commentsSheet, { minHeight: '80%' }]}>
            <View style={styles.commentsHandle} />
            <View style={styles.commentsHeader}>
              <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
                <Text style={styles.commentsCancel}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.commentsTitle}>Comments</Text>
              <View style={{ width: 40 }} />
            </View>

            {selectedPostForComments && (
              <View style={{ flex: 1 }}>
                <View style={[styles.commentsPostCard]}>
                  <View style={styles.commentsPostHeader}>
                    <View style={[styles.commentsPostAvatar, { backgroundColor: selectedPostForComments.color }]}>
                      <Text style={styles.commentsPostAvatarInitials}>{selectedPostForComments.initials}</Text>
                    </View>
                    <View style={styles.commentsPostUserInfo}>
                      <Text style={styles.commentsPostUserName}>{selectedPostForComments.user}</Text>
                      <Text style={styles.commentsPostMeta}>{selectedPostForComments.role} · {selectedPostForComments.time}</Text>
                    </View>
                  </View>
                  <Text style={styles.commentsPostContent}>{selectedPostForComments.content}</Text>
                </View>

                <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
                  {selectedPostForComments.commentsList && selectedPostForComments.commentsList.length > 0 ? (
                    selectedPostForComments.commentsList.map((comment: any) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <View style={[styles.commentAvatar, { backgroundColor: comment.color }]}>
                          <Text style={styles.commentInitials}>{comment.initials}</Text>
                        </View>
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeaderRow}>
                            <Text style={styles.commentUser}>{comment.user}</Text>
                            <Text style={styles.commentTime}>{comment.time}</Text>
                          </View>
                          <Text style={styles.commentText}>{comment.text}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.noCommentsContainer}>
                      <Ionicons name="chatbubbles-outline" size={48} color="#CCC" />
                      <Text style={styles.noCommentsText}>No comments yet. Start the conversation!</Text>
                    </View>
                  )}
                </ScrollView>

                <View style={styles.commentInputContainer}>
                  <View style={[styles.commentAvatar, { backgroundColor: '#00A66A' }]}>
                    <Text style={styles.commentInitials}>{profileInitials}</Text>
                  </View>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    placeholderTextColor="#999"
                    value={newCommentText}
                    onChangeText={setNewCommentText}
                  />
                  <TouchableOpacity
                    style={[styles.commentSendBtn, !newCommentText.trim() && { opacity: 0.5 }]}
                    disabled={!newCommentText.trim()}
                    onPress={async () => {
                      if (!newCommentText.trim()) return;
                      const newComment = {
                        id: Date.now(),
                        user: profile.name,
                        initials: profileInitials,
                        color: '#00A66A',
                        time: 'Just now',
                        text: newCommentText.trim(),
                      };
                      
                      const { posts: updatedPosts, updatedPost } = await addCommentToPost(
                        selectedPostForComments.id,
                        newComment
                      );
                      
                      setCommunityPosts(updatedPosts);
                      if (updatedPost) {
                        setSelectedPostForComments(updatedPost);
                      }
                      setNewCommentText('');
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

      {/* ===== Profile Editor Modal ===== */}
      <Modal visible={showProfileModal} transparent animationType="slide" onRequestClose={handleCancelModal}>
        <View style={styles.profileModalOverlay}>
          <View style={styles.profileModalContainer}>
            <View style={styles.profileModalHeader}>
              <TouchableOpacity onPress={handleCancelModal}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.profileModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={handleDoneModal}>
                <Text style={styles.profileDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Banner / Cover Picker */}
              <TouchableOpacity style={styles.bannerPicker} onPress={pickBannerImage} disabled={Platform.OS === 'web'}>
                {profileDraft.bannerUri ? (
                  <Image source={{ uri: profileDraft.bannerUri }} style={styles.bannerImage} />
                ) : (
                  <LinearGradient colors={['#0F766E', '#064E3B']} style={styles.bannerGradient}>
                    <Ionicons name="image-outline" size={24} color="rgba(255,255,255,0.6)" />
                    <Text style={styles.bannerUploadText}>Edit Cover Photo</Text>
                  </LinearGradient>
                )}
                {Platform.OS !== 'web' && (
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Avatar Picker */}
              <View style={styles.avatarPickerContainer}>
                <TouchableOpacity style={styles.avatarPicker} onPress={pickProfileImage} disabled={Platform.OS === 'web'}>
                  <View style={styles.avatarInner}>
                    {profileDraft.imageUri ? (
                      <Image source={{ uri: profileDraft.imageUri }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarInitialsText}>{profileInitials}</Text>
                    )}
                  </View>
                  {Platform.OS !== 'web' && (
                    <View style={styles.avatarCameraBadge}>
                      <Ionicons name="camera" size={12} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={styles.profileCompletionContainer}>
                  <Text style={styles.completionLabel}>Profile Strength</Text>
                  <Text style={styles.completionVal}>{completionPercent}%</Text>
                </View>
              </View>

              {/* Editing Categories */}
              <View style={styles.profileFormSections}>
                <CollapsibleCard
                  title="Personal Details"
                  summary={profileDraft.name || 'Set your name'}
                  icon="person"
                  isCollapsed={activeEditSheet !== 'personal'}
                  onToggle={() => setActiveEditSheet(activeEditSheet === 'personal' ? null : 'personal')}
                >
                  <View style={styles.inlineForm}>
                    <Text style={styles.fieldHeading}>FULL NAME</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={profileDraft.name}
                      onChangeText={(val) => updateProfileDraft('name', val)}
                      placeholder="Enter Full Name"
                      placeholderTextColor="#9CA3AF"
                    />
                    {validationErrors.name && <Text style={styles.inlineError}>{validationErrors.name}</Text>}

                    <Text style={[styles.fieldHeading, { marginTop: 12 }]}>PHONE NUMBER</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={profileDraft.phone}
                      onChangeText={(val) => updateProfileDraft('phone', val)}
                      placeholder="Enter Phone Number"
                      keyboardType="phone-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                    {validationErrors.phone && <Text style={styles.inlineError}>{validationErrors.phone}</Text>}
                  </View>
                </CollapsibleCard>

                <CollapsibleCard
                  title="Cricket Details"
                  summary={`${profileDraft.role} · ${profileDraft.location}`}
                  icon="baseball"
                  isCollapsed={activeEditSheet !== 'cricket'}
                  onToggle={() => setActiveEditSheet(activeEditSheet === 'cricket' ? null : 'cricket')}
                >
                  <View style={styles.inlineForm}>
                    <Text style={styles.fieldHeading}>PLAYER ROLE</Text>
                    <View style={styles.chipsRow}>
                      {PLAYER_ROLES.map(role => (
                        <TouchableOpacity
                          key={role}
                          style={[styles.formChip, profileDraft.role === role && styles.formChipActive]}
                          onPress={() => updateProfileDraft('role', role)}
                        >
                          <Text style={[styles.formChipText, profileDraft.role === role && styles.formChipTextActive]}>{role}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.fieldHeading, { marginTop: 16 }]}>CITY / LOCATION</Text>
                    <View style={styles.chipsRow}>
                      {POPULAR_CITIES.map(city => (
                        <TouchableOpacity
                          key={city}
                          style={[styles.formChip, profileDraft.location === city && styles.formChipActive]}
                          onPress={() => updateProfileDraft('location', city)}
                        >
                          <Text style={[styles.formChipText, profileDraft.location === city && styles.formChipTextActive]}>{city}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.fieldHeading, { marginTop: 16 }]}>BATTING STYLE</Text>
                    <View style={styles.chipsRow}>
                      {BATTING_STYLES.map(style => (
                        <TouchableOpacity
                          key={style}
                          style={[styles.formChip, profileDraft.battingStyle === style && styles.formChipActive]}
                          onPress={() => updateProfileDraft('battingStyle', style)}
                        >
                          <Text style={[styles.formChipText, profileDraft.battingStyle === style && styles.formChipTextActive]}>{style}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.fieldHeading, { marginTop: 16 }]}>BOWLING STYLE</Text>
                    <View style={styles.chipsRow}>
                      {BOWLING_STYLES.map(style => (
                        <TouchableOpacity
                          key={style}
                          style={[styles.formChip, profileDraft.bowlingStyle === style && styles.formChipActive]}
                          onPress={() => updateProfileDraft('bowlingStyle', style)}
                        >
                          <Text style={[styles.formChipText, profileDraft.bowlingStyle === style && styles.formChipTextActive]}>{style}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </CollapsibleCard>

                <CollapsibleCard
                  title="Career Statistics"
                  summary={`${profileDraft.matches} Matches · ${profileDraft.runs} Runs`}
                  icon="stats-chart"
                  isCollapsed={activeEditSheet !== 'stats'}
                  onToggle={() => setActiveEditSheet(activeEditSheet === 'stats' ? null : 'stats')}
                >
                  <View style={styles.inlineForm}>
                    <Text style={styles.fieldHeading}>MATCHES PLAYED</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={String(profileDraft.matches)}
                      onChangeText={(val) => updateProfileDraft('matches', val)}
                      keyboardType="numeric"
                    />

                    <Text style={[styles.fieldHeading, { marginTop: 12 }]}>CAREER RUNS</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={String(profileDraft.runs)}
                      onChangeText={(val) => updateProfileDraft('runs', val)}
                      keyboardType="numeric"
                    />

                    <Text style={[styles.fieldHeading, { marginTop: 12 }]}>WICKETS TAKEN</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={String(profileDraft.wickets)}
                      onChangeText={(val) => updateProfileDraft('wickets', val)}
                      keyboardType="numeric"
                    />

                    <Text style={[styles.fieldHeading, { marginTop: 12 }]}>FRIENDS COUNT</Text>
                    <TextInput
                      style={styles.inlineInput}
                      value={String(profileDraft.friends)}
                      onChangeText={(val) => updateProfileDraft('friends', val)}
                      keyboardType="numeric"
                    />
                  </View>
                </CollapsibleCard>
              </View>

              {/* Preferences Settings */}
              <View style={styles.preferencesSection}>
                <View style={styles.preferencesHeader}>
                  <Ionicons name="settings-outline" size={18} color="#00A66A" />
                  <Text style={styles.preferencesTitle}>Preferences & Settings</Text>
                </View>
                <View style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
                  <CustomToggle
                    label="Public Profile"
                    description="Allow other players to discover your profile."
                    value={profileDraft.isPublic}
                    onValueChange={(val: boolean) => updateProfileDraft('isPublic', val)}
                    disabled={Platform.OS === 'web'}
                  />
                  <View style={styles.toggleDivider} />
                  <CustomToggle
                    label="Show Career Stats"
                    description="Display runs and wickets on your card."
                    value={profileDraft.showStats}
                    onValueChange={(val: boolean) => updateProfileDraft('showStats', val)}
                    disabled={Platform.OS === 'web'}
                  />
                  <View style={styles.toggleDivider} />
                  <CustomToggle
                    label="Looking for Team"
                    description="Available to join local cricket clubs."
                    value={profileDraft.isLookingForTeam}
                    onValueChange={(val: boolean) => updateProfileDraft('isLookingForTeam', val)}
                    disabled={Platform.OS === 'web'}
                  />
                </View>
              </View>

              {Platform.OS !== 'web' && (profileDraft.imageUri || profileDraft.bannerUri) ? (
                <TouchableOpacity
                  style={styles.resetMediaBtn}
                  onPress={() => setProfileDraft(prev => ({ ...prev, imageUri: '', bannerUri: '' }))}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  <Text style={styles.resetMediaText}>Reset Profile Media</Text>
                </TouchableOpacity>
              ) : null}

              <View style={{ height: 40 }} />
            </ScrollView>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 35,
    height: Platform.OS === 'ios' ? 92 : 83,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
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
    color: '#34D399',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  profileAvatarWrap: {
    position: 'relative',
  },
  profileAvatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2.5,
    borderColor: '#FFF',
    padding: 2,
  },
  profileAvatarInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#E8FFF4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImg: {
    width: '100%',
    height: '100%',
  },
  profileAvatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00A66A',
  },
  profileOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    borderWidth: 2,
    borderColor: '#0F766E',
  },
  profileCardInfo: {
    flex: 1,
    gap: 2,
  },
  profileCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  profileCardRole: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileCardRoleTxt: {
    fontSize: 12,
    color: '#A7F3D0',
    fontWeight: '600',
  },
  profileCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  profileCardStat: {
    alignItems: 'flex-start',
  },
  profileCardStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  profileCardStatLbl: {
    fontSize: 10,
    color: '#A7F3D0',
    fontWeight: '500',
  },
  profileCardStatDiv: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileEditBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  profilePostAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A66A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profilePostInitials: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profilePostPlaceholder: {
    flex: 1,
    color: '#71717A',
    fontSize: 13,
  },
  profilePostActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  myPostsSection: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  myPostsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyFeedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyFeedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  emptyFeedSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Comments Styles
  commentsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentsSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  commentsHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentsCancel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  commentsPostCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  commentsPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentsPostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  commentsPostAvatarInitials: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  commentsPostUserInfo: {
    flex: 1,
  },
  commentsPostUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
  commentsPostMeta: {
    fontSize: 11,
    color: '#6B7280',
  },
  commentsPostContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentInitials: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentUser: {
    fontWeight: '700',
    fontSize: 12,
    color: '#111',
  },
  commentTime: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 13,
    color: '#374151',
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 13,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  commentInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#374151',
    marginRight: 8,
  },
  commentSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile Editor Styles
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  profileModalContainer: {
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
  },
  profileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111',
  },
  profileDoneText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00A66A',
  },
  bannerPicker: {
    height: 140,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  bannerUploadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: -40,
    paddingHorizontal: 20,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  avatarPicker: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 37,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitialsText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00A66A',
    borderWidth: 1.5,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCompletionContainer: {
    alignItems: 'flex-end',
    paddingBottom: 4,
  },
  completionLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  completionVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00A66A',
  },
  profileFormSections: {
    paddingHorizontal: 16,
    gap: 12,
  },
  collapsibleCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  collapsibleHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  collapsibleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8FFF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapsibleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  collapsibleSummary: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  collapsibleContent: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  inlineForm: {
    gap: 10,
  },
  fieldHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  inlineInput: {
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    fontSize: 14,
    color: '#111',
  },
  inlineError: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: -6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  formChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formChipActive: {
    backgroundColor: '#E8FFF4',
    borderColor: '#00A66A',
  },
  formChipText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  formChipTextActive: {
    color: '#00A66A',
    fontWeight: '700',
  },
  preferencesSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  preferencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  preferencesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  toggleDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  switchContainer: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  switchContainerActive: {
    backgroundColor: '#34D399',
  },
  switchContainerInactive: {
    backgroundColor: '#E5E7EB',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchThumbInactive: {
    alignSelf: 'flex-start',
  },
  toggleDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  resetMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
  },
  resetMediaText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
});
