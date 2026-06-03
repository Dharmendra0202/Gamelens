import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 300;
const CARD_MARGIN = 16;
const SECTION_PADDING = 16;
const CARD_SPACING = CARD_WIDTH + CARD_MARGIN;
const SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH - (SECTION_PADDING * 2)) / 2;

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
  name: 'Dharmendra Vishwakarma',
  phone: '8383999973',
  role: 'All-rounder',
  location: 'Mumbai',
  battingStyle: 'Right hand bat',
  bowlingStyle: 'Medium pace',
  friends: '125',
  posts: '45',
  imageUri: '',
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMatchOptionsModal, setShowMatchOptionsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<{ players: any[], matches: any[], products: any[] }>({ players: [], matches: [], products: [] });

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

  const profileInitials = profile.name
    .split(' ')
    .filter(Boolean)
    .map((namePart) => namePart[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ME';

  const openProfileEditor = () => {
    setProfileDraft(profile);
    setShowProfileModal(true);
  };

  const updateProfileDraft = (key: keyof Profile, value: string) => {
    setProfileDraft((currentDraft) => ({ ...currentDraft, [key]: value }));
  };

  const saveProfile = () => {
    setProfile(profileDraft);
    setShowProfileModal(false);
  };

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      updateProfileDraft('imageUri', result.assets[0].uri);
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
    const filteredPlayers = players.filter(player =>
      player.name.toLowerCase().includes(searchTerm) ||
      player.role.toLowerCase().includes(searchTerm) ||
      player.team.toLowerCase().includes(searchTerm)
    );

    // Search matches
    const filteredMatches = matches.filter(match =>
      match.team1.toLowerCase().includes(searchTerm) ||
      match.team2.toLowerCase().includes(searchTerm) ||
      match.location.toLowerCase().includes(searchTerm)
    );

    // Search products
    const filteredProducts = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm)
    );

    setSearchResults({
      players: filteredPlayers,
      matches: filteredMatches,
      products: filteredProducts
    });
  };

  // Handle search query change
  const handleHomeSearchChange = (query: string) => {
    setSearchQuery(query);
    performHomeSearch(query);
  };

  const players = [
    { id: 1, name: 'Virat Kohli', role: 'Batsman', team: 'India', runs: '25,000+', initials: 'VK', color: '#00A66A', image: 'https://images.unsplash.com/photo-1624532227497-856e69d6382b?w=300&h=300&fit=crop' },
    { id: 2, name: 'MS Dhoni', role: 'Wicket Keeper', team: 'India', runs: '17,000+', initials: 'MS', color: '#0F766E', image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=300&h=300&fit=crop' },
    { id: 3, name: 'Rohit Sharma', role: 'Batsman', team: 'India', runs: '18,000+', initials: 'RS', color: '#059669', image: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=300&h=300&fit=crop' },
    { id: 4, name: 'Jasprit Bumrah', role: 'Bowler', team: 'India', wickets: '500+', initials: 'JB', color: '#6EE7B7', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=300&h=300&fit=crop' },
  ];

  const bannerImage = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&h=420&fit=crop';

  const products = [
    { id: 1, name: 'India Jersey', price: '₹2,499', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop' },
    { id: 2, name: 'Cricket Ball', price: '₹599', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&h=400&fit=crop' },
    { id: 3, name: 'Cricket Bat', price: '₹3,999', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=400&fit=crop' },
    { id: 4, name: 'Batting Gloves', price: '₹1,299', image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=400&h=400&fit=crop' },
    { id: 5, name: 'Cricket Helmet', price: '₹2,199', image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=400&h=400&fit=crop' },
    { id: 6, name: 'Cricket Shoes', price: '₹2,999', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
  ];

  const matches = [
    { id: 1, team1: 'Team Warriors', team2: 'Team Strikers', time: '6:00 PM', badge: 'TODAY', location: 'Wankhede Stadium, 2.5 km away', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop' },
    { id: 2, team1: 'Mumbai Indians', team2: 'Chennai Kings', time: '7:30 PM', badge: 'TODAY', location: 'Brabourne Stadium, 3.2 km away', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=600&fit=crop' },
    { id: 3, team1: 'Delhi Capitals', team2: 'Kolkata Knights', time: '4:00 PM', badge: 'TOMORROW', location: 'DY Patil Stadium, 5.1 km away', image: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&h=600&fit=crop' },
    { id: 4, team1: 'Royal Challengers', team2: 'Punjab Kings', time: '8:00 PM', badge: 'TOMORROW', location: 'MCA Stadium, 4.8 km away', image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&h=600&fit=crop' },
    { id: 5, team1: 'Rajasthan Royals', team2: 'Gujarat Titans', time: '3:30 PM', badge: 'SAT', location: 'Wankhede Stadium, 2.5 km away', image: 'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?w=800&h=600&fit=crop' },
    { id: 6, team1: 'Sunrisers', team2: 'Lucknow Super', time: '7:00 PM', badge: 'SUN', location: 'Brabourne Stadium, 3.2 km away', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=600&fit=crop' },
  ];

  const posts = [
    {
      id: 1,
      user: 'Rahul Sharma',
      userInitials: 'RS',
      userImage: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=240&h=240&fit=crop',
      time: '2 hours ago',
      content: 'Just finished an amazing match! Team won by 6 wickets 🏏🔥',
      likes: 234,
      comments: 45,
      shares: 12,
    },
    {
      id: 2,
      user: 'Priya Patel',
      userInitials: 'PP',
      userImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&h=240&fit=crop',
      time: '5 hours ago',
      content: 'Looking for players for weekend match in Mumbai. Anyone interested?',
      likes: 89,
      comments: 23,
      shares: 5,
    },
  ];

  const handlePlayerPress = (player: any) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#00A66A", "#0F766E", "#064E3B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenuDrawer(true)}>
            <Ionicons name="menu" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            GAME<Text style={styles.headerTitleOrange}>LENS</Text>
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowSearchModal(true)}>
            <Ionicons name="search" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowChatModal(true)}>
            <Ionicons name="chatbubble-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Notifications clicked')}>
            <Ionicons name="notifications-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.myProfile}
            onPress={openProfileEditor}
            activeOpacity={0.85}
          >
            <View style={styles.myProfileAvatar}>
              {profile.imageUri ? (
                <Image source={{ uri: profile.imageUri }} style={styles.myProfileImage} />
              ) : (
                <Text style={styles.myProfileInitials}>{profileInitials}</Text>
              )}
            </View>
            <View style={styles.myProfileInfo}>
              <Text style={styles.myProfileName}>{profile.name}</Text>
              <View style={styles.profileRoleContainer}>
                <Ionicons name="ribbon-outline" size={14} color="#00A66A" />
                <Text style={styles.profileRoleText}>{profile.role}</Text>
              </View>
              <View style={styles.profileStatsRow}>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatVal}>{profile.friends}</Text>
                  <Text style={styles.profileStatLbl}>Friends</Text>
                </View>
                <View style={styles.profileStatDivider} />
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatVal}>{profile.posts}</Text>
                  <Text style={styles.profileStatLbl}>Posts</Text>
                </View>
              </View>
            </View>
            <View style={styles.viewProfileButton}>
              <Ionicons name="chevron-forward" size={20} color="#00A66A" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsBar}>
          {[
            { icon: 'baseball-outline' as const, label: 'Start Match', color: '#00A66A', action: () => { router.push({ pathname: '/(tabs)/my-cricket', params: { action: 'startMatch' } }); } },
            { icon: 'trophy-outline' as const, label: 'New Tourney', color: '#0F766E', action: () => { router.push({ pathname: '/(tabs)/my-cricket', params: { action: 'createTournament' } }); } },
            { icon: 'search-outline' as const, label: 'Find Players', color: '#0EA5E9', action: () => setShowSearchModal(true) },
            { icon: 'bag-handle-outline' as const, label: 'Store', color: '#EF4444', action: () => setShowStoreModal(true) },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.quickActionItem} onPress={item.action} activeOpacity={0.8}>
              <View style={[styles.quickActionIconBg, { backgroundColor: `${item.color}12` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.quickActionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Matches Discovery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Live & Upcoming Matches</Text>
              <Text style={styles.sectionSubtitle}>Matches scheduled near you</Text>
            </View>
            <TouchableOpacity style={styles.locationButton} onPress={() => console.log('Location clicked')}>
              <Ionicons name="location" size={14} color="#00A66A" />
              <Text style={styles.locationText}>Mumbai</Text>
              <Ionicons name="chevron-down" size={12} color="#00A66A" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.matchScrollContent}
            onScroll={(event) => {
              const scrollPosition = event.nativeEvent.contentOffset.x;
              const index = Math.round(scrollPosition / CARD_SPACING);
              setActiveMatchIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {matches.map((match) => (
              <TouchableOpacity
                key={match.id}
                style={styles.matchCardContainer}
                onPress={() => console.log(`Viewing ${match.team1} vs ${match.team2}`)}
                activeOpacity={0.95}
              >
                <View style={styles.matchCard}>
                  {/* Card Header */}
                  <View style={styles.matchCardHeader}>
                    <View style={[styles.statusBadge, match.badge === 'LIVE' ? styles.statusBadgeLive : styles.statusBadgeUpcoming]}>
                      <View style={match.badge === 'LIVE' ? styles.livePulseDot : styles.upcomingDot} />
                      <Text style={[styles.statusBadgeText, match.badge === 'LIVE' ? styles.statusBadgeTextLive : styles.statusBadgeTextUpcoming]}>
                        {match.badge}
                      </Text>
                    </View>
                    <Text style={styles.matchTimeText}>{match.time}</Text>
                  </View>

                  {/* Team 1 Details */}
                  <View style={styles.matchTeamRow}>
                    <View style={styles.matchTeamLeft}>
                      <View style={styles.teamLogoWrapper}>
                        <Text style={styles.teamLogoText}>{match.team1.split(' ').map(n => n[0]).join('')}</Text>
                      </View>
                      <Text style={styles.teamNameText} numberOfLines={1}>{match.team1}</Text>
                    </View>
                    <Text style={styles.teamScoreText}>{match.badge === 'LIVE' ? '124/4 (14.2)' : 'Yet to bat'}</Text>
                  </View>

                  {/* Team 2 Details */}
                  <View style={styles.matchTeamRow}>
                    <View style={styles.matchTeamLeft}>
                      <View style={[styles.teamLogoWrapper, { backgroundColor: '#0EA5E9' }]}>
                        <Text style={styles.teamLogoText}>{match.team2.split(' ').map(n => n[0]).join('')}</Text>
                      </View>
                      <Text style={styles.teamNameText} numberOfLines={1}>{match.team2}</Text>
                    </View>
                    <Text style={styles.teamScoreText}>{match.badge === 'LIVE' ? '92/2 (11.0)' : 'Yet to bat'}</Text>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Card Footer: Location + Distance + Action */}
                  <View style={styles.matchCardFooter}>
                    <View style={styles.venueInfo}>
                      <Ionicons name="compass-outline" size={14} color="#666" />
                      <Text style={styles.venueText} numberOfLines={1}>
                        {match.location}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.cardActionButton} 
                      onPress={() => console.log('Card action clicked')}
                    >
                      <Text style={styles.cardActionText}>Details</Text>
                      <Ionicons name="chevron-forward-circle-sharp" size={16} color="#00A66A" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {matches.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeMatchIndex === index && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Banner */}
        <View style={styles.bannerSection}>
          <ImageBackground
            source={{ uri: bannerImage }}
            style={styles.banner}
            imageStyle={styles.bannerImage}
          >
            <LinearGradient
              colors={['rgba(11,21,33,0.85)', 'rgba(0,166,110,0.55)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerContent}>
              <View style={styles.bannerTag}>
                <Ionicons name="sparkles" size={12} color="#FFF" />
                <Text style={styles.bannerTagText}>Featured Match Passes</Text>
              </View>
              <Text style={styles.bannerTitle}>IPL 2024 Carnival</Text>
              <Text style={styles.bannerSubtitle}>Get tickets, match passes & rewards</Text>
              <TouchableOpacity 
                style={styles.bannerButton} 
                onPress={() => console.log('Book tickets clicked')}
                activeOpacity={0.9}
              >
                <Text style={styles.bannerButtonText}>Book Tickets</Text>
                <Ionicons name="arrow-forward" size={14} color="#0F766E" />
              </TouchableOpacity>
            </View>
            <View style={styles.bannerIcon}>
              <Ionicons name="ticket" size={44} color="#FFF" />
            </View>
          </ImageBackground>
        </View>

        {/* Popular Cricketers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Popular Cricketers</Text>
              <Text style={styles.sectionSubtitle}>Top trending players around you</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAllPlayers(!showAllPlayers)}>
              <Text style={styles.seeAll}>{showAllPlayers ? 'See Less' : 'See All'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.playersListContainer}>
            {players.slice(0, showAllPlayers ? players.length : 2).map((player, index) => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerListItem}
                onPress={() => handlePlayerPress(player)}
                activeOpacity={0.8}
              >
                <View style={[styles.playerRank, index === 0 ? styles.rank1Bg : index === 1 ? styles.rank2Bg : {}]}>
                  <Text style={[styles.playerRankNumber, index < 2 ? styles.rankWhiteText : {}]}>{index + 1}</Text>
                </View>
                
                <View style={[styles.playerAvatarCircle, { backgroundColor: player.color }]}>
                  {player.image ? (
                    <Image source={{ uri: player.image }} style={styles.playerAvatarImage} />
                  ) : (
                    <Text style={styles.playerAvatarText}>{player.initials}</Text>
                  )}
                </View>
                
                <View style={styles.playerInfoColumn}>
                  <Text style={styles.playerListName}>{player.name}</Text>
                  <View style={styles.playerMetaRow}>
                    <View style={styles.playerRoleTag}>
                      <Text style={styles.playerRoleTagText}>{player.role}</Text>
                    </View>
                    <Text style={styles.playerDivider}>•</Text>
                    <Text style={styles.playerListTeam}>{player.team}</Text>
                  </View>
                  <View style={styles.playerStatsRowSmall}>
                    {player.runs && (
                      <View style={styles.miniStatItem}>
                        <Text style={styles.playerListStats}>🏏 {player.runs}</Text>
                      </View>
                    )}
                    {player.wickets && (
                      <View style={styles.miniStatItem}>
                        <Text style={styles.playerListStats}>🎯 {player.wickets}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <TouchableOpacity style={styles.playerFollowBtn} activeOpacity={0.7}>
                  <Ionicons name="person-add" size={16} color="#00A66A" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {!showAllPlayers && players.length > 2 && (
              <TouchableOpacity 
                style={styles.seeMoreButton}
                onPress={() => setShowAllPlayers(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.seeMoreText}>See More Cricketers</Text>
                <Ionicons name="chevron-down" size={18} color="#00A66A" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Cricket Store */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Cricket Store</Text>
              <Text style={styles.sectionSubtitle}>Official gear, bats & jerseys</Text>
            </View>
            <TouchableOpacity onPress={() => setShowStoreModal(true)}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeScrollContent}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => console.log(`Viewing ${product.name}`)}
                activeOpacity={0.9}
              >
                <ImageBackground
                  source={{ uri: product.image }}
                  style={styles.productImageBackground}
                  imageStyle={styles.productImageStyle}
                >
                  <LinearGradient
                    colors={['transparent', 'rgba(0, 0, 0, 0.85)']}
                    style={styles.productOverlay}
                  >
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productPrice}>{product.price}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addToCartButton}
                      onPress={() => console.log(`Added ${product.name} to cart`)}
                    >
                      <Ionicons name="cart" size={12} color="#FFF" />
                    </TouchableOpacity>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Community Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Community Feed</Text>
              <Text style={styles.sectionSubtitle}>What fellow cricketers are saying</Text>
            </View>
          </View>

          {/* Create Post */}
          <TouchableOpacity style={styles.createPost} onPress={() => console.log('Create post clicked')} activeOpacity={0.8}>
            <View style={styles.createPostAvatar}>
              {profile.imageUri ? (
                <Image source={{ uri: profile.imageUri }} style={styles.createPostImage} />
              ) : (
                <Text style={styles.createPostInitials}>ME</Text>
              )}
            </View>
            <Text style={styles.createPostPlaceholder}>Share your match updates or tips...</Text>
            <Ionicons name="image-outline" size={20} color="#00A66A" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {/* Posts */}
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postUserAvatar}>
                  {post.userImage ? (
                    <Image source={{ uri: post.userImage }} style={styles.postUserImage} />
                  ) : (
                    <Text style={styles.postUserInitials}>{post.userInitials}</Text>
                  )}
                </View>
                <View style={styles.postUserInfo}>
                  <Text style={styles.postUserName}>{post.user}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                <TouchableOpacity style={styles.postMoreButton}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#999" />
                </TouchableOpacity>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              <View style={styles.postStats}>
                <View style={styles.postStatLikes}>
                  <View style={styles.likeIconBg}>
                    <Ionicons name="heart" size={10} color="#FFF" />
                  </View>
                  <Text style={styles.postStatsText}>{post.likes} likes</Text>
                </View>
                <Text style={styles.postStatsText}>{post.comments} comments • {post.shares} shares</Text>
              </View>

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction} onPress={() => console.log('Like clicked')} activeOpacity={0.7}>
                  <Ionicons name="heart-outline" size={20} color="#666" />
                  <Text style={styles.postActionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction} onPress={() => console.log('Comment clicked')} activeOpacity={0.7}>
                  <Ionicons name="chatbubble-outline" size={20} color="#666" />
                  <Text style={styles.postActionText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction} onPress={() => console.log('Share clicked')} activeOpacity={0.7}>
                  <Ionicons name="share-social-outline" size={20} color="#666" />
                  <Text style={styles.postActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
                <View style={[styles.modalPlayerAvatar, { backgroundColor: selectedPlayer.color }]}>
                  {selectedPlayer.image ? (
                    <Image source={{ uri: selectedPlayer.image }} style={styles.modalPlayerImage} />
                  ) : (
                    <Text style={styles.modalPlayerInitials}>{selectedPlayer.initials}</Text>
                  )}
                </View>
                <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                <Text style={styles.modalPlayerRole}>{selectedPlayer.role}</Text>
                <Text style={styles.modalPlayerTeam}>Team: {selectedPlayer.team}</Text>
                {selectedPlayer.runs && (
                  <Text style={styles.modalPlayerStats}>Career Runs: {selectedPlayer.runs}</Text>
                )}
                {selectedPlayer.wickets && (
                  <Text style={styles.modalPlayerStats}>Career Wickets: {selectedPlayer.wickets}</Text>
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
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setSearchResults({ players: [], matches: [], products: [] });
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
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
                        <View style={[styles.searchPlayerAvatar, { backgroundColor: player.color }]}>
                          {player.image ? (
                            <Image source={{ uri: player.image }} style={styles.searchPlayerImage} />
                          ) : (
                            <Text style={styles.searchPlayerInitials}>{player.initials}</Text>
                          )}
                        </View>
                        <View style={styles.searchPlayerInfo}>
                          <Text style={styles.searchPlayerName}>{player.name}</Text>
                          <Text style={styles.searchPlayerRole}>{player.role} • {player.team}</Text>
                          {player.runs && (
                            <Text style={styles.searchPlayerStats}>🏏 {player.runs}</Text>
                          )}
                          {player.wickets && (
                            <Text style={styles.searchPlayerStats}>🎯 {player.wickets}</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Match Results */}
                {searchResults.matches.length > 0 && (
                  <>
                    <Text style={[styles.searchResultsTitle, { marginTop: searchResults.players.length > 0 ? 20 : 0 }]}>
                      Matches ({searchResults.matches.length})
                    </Text>
                    {searchResults.matches.map((match: any) => (
                      <TouchableOpacity
                        key={match.id}
                        style={styles.searchMatchItem}
                        onPress={() => {
                          console.log(`Viewing match: ${match.team1} vs ${match.team2}`);
                          setShowSearchModal(false);
                        }}
                      >
                        <View style={styles.searchMatchHeader}>
                          <View style={styles.searchMatchBadge}>
                            <Text style={styles.searchMatchBadgeText}>{match.badge}</Text>
                          </View>
                          <Text style={styles.searchMatchTime}>{match.time}</Text>
                        </View>
                        <Text style={styles.searchMatchTeams}>
                          {match.team1} vs {match.team2}
                        </Text>
                        <View style={styles.searchMatchLocation}>
                          <Ionicons name="location-outline" size={12} color="#999" />
                          <Text style={styles.searchMatchLocationText}>{match.location}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Product Results */}
                {searchResults.products.length > 0 && (
                  <>
                    <Text style={[styles.searchResultsTitle, { marginTop: (searchResults.players.length > 0 || searchResults.matches.length > 0) ? 20 : 0 }]}>
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
                          <Text style={styles.searchProductName}>{product.name}</Text>
                          <Text style={styles.searchProductPrice}>{product.price}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* No Results */}
                {searchResults.players.length === 0 && searchResults.matches.length === 0 && searchResults.products.length === 0 && searchQuery.length > 0 && (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={48} color="#CCC" />
                    <Text style={styles.noResultsTitle}>No results found</Text>
                    <Text style={styles.noResultsText}>
                      Try searching for player names, match teams, or product names
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
              <Ionicons name="create-outline" size={24} color="#00A66A" />
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
              <View style={[styles.chatAvatar, { backgroundColor: '#059669' }]}>
                <Text style={styles.chatAvatarText}>PP</Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>Priya Patel</Text>
                <Text style={styles.chatMessage}>Are you joining the match?</Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={styles.chatTime}>5h</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatItem}>
              <View style={[styles.chatAvatar, { backgroundColor: '#0F766E' }]}>
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
            <View style={styles.profileEditorHeader}>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.profileEditorTitle}>Manage Profile</Text>
              <TouchableOpacity onPress={saveProfile}>
                <Text style={styles.profileSaveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.profileEditorBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.profilePhotoArea}>
                <View style={styles.profilePhotoPreview}>
                  {profileDraft.imageUri ? (
                    <Image source={{ uri: profileDraft.imageUri }} style={styles.profilePhotoImage} />
                  ) : (
                    <Text style={styles.profilePhotoInitials}>
                      {profileDraft.name
                        .split(' ')
                        .filter(Boolean)
                        .map((namePart) => namePart[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'ME'}
                    </Text>
                  )}
                </View>
                <Text style={styles.profilePhotoTitle}>Profile picture</Text>
                <Text style={styles.profilePhotoHint}>Choose a photo from your device.</Text>
                <TouchableOpacity style={styles.pickPhotoButton} onPress={pickProfileImage}>
                  <Ionicons name="image-outline" size={18} color="#FFF" />
                  <Text style={styles.pickPhotoText}>Choose from device</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.profileRow}>
                <View style={styles.profileRowField}>
                  <Text style={styles.profileInputLabel}>Name</Text>
                  <TextInput
                    style={styles.profileInput}
                    value={profileDraft.name}
                    onChangeText={(value) => updateProfileDraft('name', value)}
                    placeholder="Your name"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.profileRowField}>
                  <Text style={styles.profileInputLabel}>Phone</Text>
                  <TextInput
                    style={styles.profileInput}
                    value={profileDraft.phone}
                    onChangeText={(value) => updateProfileDraft('phone', value)}
                    placeholder="Phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <Text style={styles.profileInputLabel}>Role</Text>
              <TextInput
                style={styles.profileInput}
                value={profileDraft.role}
                onChangeText={(value) => updateProfileDraft('role', value)}
                placeholder="Batter, bowler, all-rounder"
                placeholderTextColor="#999"
              />

              <Text style={styles.profileInputLabel}>Location</Text>
              <TextInput
                style={styles.profileInput}
                value={profileDraft.location}
                onChangeText={(value) => updateProfileDraft('location', value)}
                placeholder="City or area"
                placeholderTextColor="#999"
              />

              <View style={styles.profileRow}>
                <View style={styles.profileRowField}>
                  <Text style={styles.profileInputLabel}>Batting</Text>
                  <TextInput
                    style={styles.profileInput}
                    value={profileDraft.battingStyle}
                    onChangeText={(value) => updateProfileDraft('battingStyle', value)}
                    placeholder="Right hand bat"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.profileRowField}>
                  <Text style={styles.profileInputLabel}>Bowling</Text>
                  <TextInput
                    style={styles.profileInput}
                    value={profileDraft.bowlingStyle}
                    onChangeText={(value) => updateProfileDraft('bowlingStyle', value)}
                    placeholder="Medium pace"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.profileRow}>
                <View style={styles.profileRowField}>
                  <Text style={styles.profileInputLabel}>Friends</Text>
                  <TextInput
                    style={styles.profileInput}
                    value={profileDraft.friends}
                    onChangeText={(value) => updateProfileDraft('friends', value)}
                    placeholder="125"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.profileRowField}>
                  <Text style={styles.profileInputLabel}>Posts</Text>
                  <TextInput
                    style={styles.profileInput}
                    value={profileDraft.posts}
                    onChangeText={(value) => updateProfileDraft('posts', value)}
                    placeholder="45"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.clearPhotoButton} onPress={() => updateProfileDraft('imageUri', '')}>
                <Ionicons name="trash-outline" size={18} color="#00A66A" />
                <Text style={styles.clearPhotoText}>Remove profile picture</Text>
              </TouchableOpacity>
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
                  <Image source={{ uri: profile.imageUri }} style={styles.drawerProfileImage} />
                ) : (
                  <Text style={styles.drawerProfileInitials}>{profileInitials}</Text>
                )}
              </View>
              <View style={styles.drawerProfileInfo}>
                <Text style={styles.drawerProfileName} numberOfLines={1}>{profile.name}</Text>
                <Text style={styles.drawerProfilePhone}>{profile.phone}</Text>
              </View>
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  setShowMenuDrawer(false);
                }}
              >
                <Ionicons name="close-circle-outline" size={24} color="#FFF" />
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
                    pathname: '/(tabs)/my-cricket',
                    params: { action: 'createTournament' }
                  });
                }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="trophy-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Add a Tournament/Series</Text>
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
                    pathname: '/(tabs)/my-cricket',
                    params: { source: 'drawer', section: 'menu', t: Date.now() }
                  });
                }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="baseball" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>My Cricket</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => {
                  setShowMenuDrawer(false);
                  router.push({
                    pathname: '/(tabs)/my-cricket',
                    params: { tab: 'tournaments', t: Date.now() }
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
                    pathname: '/(tabs)/my-cricket',
                    params: { tab: 'matches', t: Date.now() }
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
                onPress={() => { setShowMenuDrawer(false); setShowStoreModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="bag-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>CricHeroes Store</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowLeaderboardModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="podium-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Leaderboards</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowAwardsModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="ribbon-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>CricHeroes Awards</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowAssociationsModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="people-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Associations</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowClubsModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="business-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Clubs</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowContactModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Contact</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowShareModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="share-social-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Share the app</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerMenuItem}
                onPress={() => { setShowMenuDrawer(false); setShowRateModal(true); }}
              >
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="star-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Rate us</Text>
                <Ionicons name="chevron-forward" size={16} color="#00A66A" style={{ marginLeft: 'auto' }} />
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
                router.push({
                  pathname: '/(tabs)/my-cricket',
                  params: { action: 'startMatch' }
                });
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#00A66A", "#0F766E", "#064E3B"]}
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
                  pathname: '/(tabs)/my-cricket',
                  params: { action: 'createTournament' }
                });
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#00A66A", "#0F766E", "#064E3B"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.matchOptionGradient}
              >
                <View style={styles.matchOptionIconCircle}>
                  <Ionicons name="trophy" size={32} color="#FFF" />
                </View>
                <View style={styles.matchOptionTextContainer}>
                  <Text style={styles.matchOptionTitle}>Create Tournament</Text>
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
      <Modal visible={showStoreModal} transparent animationType="slide" onRequestClose={() => setShowStoreModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowStoreModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>CricHeroes Store</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.storeHeroBanner}>
              <Ionicons name="bag" size={48} color="#00A66A" />
              <Text style={styles.storeHeroTitle}>Official Cricket Gear</Text>
              <Text style={styles.storeHeroSubtitle}>Premium equipment for every cricketer</Text>
            </View>
            {[
              { id: 1, name: 'SG Cricket Bat', price: '₹4,999', originalPrice: '₹6,500', category: 'Bats', rating: 4.8, reviews: 234, badge: 'BESTSELLER' },
              { id: 2, name: 'Kookaburra Ball', price: '₹899', originalPrice: '₹1,200', category: 'Balls', rating: 4.6, reviews: 189, badge: 'NEW' },
              { id: 3, name: 'MRF Batting Gloves', price: '₹1,499', originalPrice: '₹2,000', category: 'Gloves', rating: 4.7, reviews: 156, badge: null },
              { id: 4, name: 'SS Helmet Pro', price: '₹2,799', originalPrice: '₹3,500', category: 'Helmets', rating: 4.9, reviews: 312, badge: 'TOP RATED' },
              { id: 5, name: 'Adidas Cricket Shoes', price: '₹3,299', originalPrice: '₹4,200', category: 'Footwear', rating: 4.5, reviews: 98, badge: null },
              { id: 6, name: 'India Team Jersey', price: '₹2,199', originalPrice: '₹2,800', category: 'Apparel', rating: 4.8, reviews: 445, badge: 'HOT' },
            ].map(item => (
              <TouchableOpacity key={item.id} style={styles.storeProductCard} activeOpacity={0.85}>
                <View style={styles.storeProductImageBox}>
                  <Ionicons name="bag-handle" size={36} color="#00A66A" />
                  {item.badge && <View style={styles.storeBadge}><Text style={styles.storeBadgeText}>{item.badge}</Text></View>}
                </View>
                <View style={styles.storeProductInfo}>
                  <Text style={styles.storeProductCategory}>{item.category}</Text>
                  <Text style={styles.storeProductName}>{item.name}</Text>
                  <View style={styles.storeRatingRow}>
                    {[1,2,3,4,5].map(s => <Ionicons key={s} name={s <= Math.floor(item.rating) ? "star" : "star-outline"} size={12} color="#F59E0B" />)}
                    <Text style={styles.storeRatingText}>{item.rating} ({item.reviews})</Text>
                  </View>
                  <View style={styles.storePriceRow}>
                    <Text style={styles.storePrice}>{item.price}</Text>
                    <Text style={styles.storeOriginalPrice}>{item.originalPrice}</Text>
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
      <Modal visible={showLeaderboardModal} transparent animationType="slide" onRequestClose={() => setShowLeaderboardModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowLeaderboardModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Leaderboards</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.lbTabRow}>
              {['Batting', 'Bowling', 'All-Round'].map((tab, i) => (
                <View key={tab} style={[styles.lbTab, i === 0 && styles.lbTabActive]}>
                  <Text style={[styles.lbTabText, i === 0 && styles.lbTabTextActive]}>{tab}</Text>
                </View>
              ))}
            </View>
            {[
              { rank: 1, name: 'Virat Kohli', team: 'India', stat: '892 pts', initials: 'VK', color: '#00A66A' },
              { rank: 2, name: 'Rohit Sharma', team: 'India', stat: '845 pts', initials: 'RS', color: '#0F766E' },
              { rank: 3, name: 'Steve Smith', team: 'Australia', stat: '820 pts', initials: 'SS', color: '#059669' },
              { rank: 4, name: 'Kane Williamson', team: 'New Zealand', stat: '798 pts', initials: 'KW', color: '#10B981' },
              { rank: 5, name: 'Joe Root', team: 'England', stat: '776 pts', initials: 'JR', color: '#34D399' },
              { rank: 6, name: 'Babar Azam', team: 'Pakistan', stat: '754 pts', initials: 'BA', color: '#6EE7B7' },
              { rank: 7, name: 'David Warner', team: 'Australia', stat: '731 pts', initials: 'DW', color: '#00A66A' },
              { rank: 8, name: 'KL Rahul', team: 'India', stat: '718 pts', initials: 'KR', color: '#0F766E' },
            ].map(player => (
              <View key={player.rank} style={[styles.lbRow, player.rank <= 3 && styles.lbRowTop]}>
                <View style={[styles.lbRankBadge, player.rank === 1 && { backgroundColor: '#F59E0B' }, player.rank === 2 && { backgroundColor: '#9CA3AF' }, player.rank === 3 && { backgroundColor: '#D97706' }]}>
                  <Text style={styles.lbRankText}>{player.rank}</Text>
                </View>
                <View style={[styles.lbAvatar, { backgroundColor: player.color }]}>
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
      <Modal visible={showAwardsModal} transparent animationType="slide" onRequestClose={() => setShowAwardsModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowAwardsModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>CricHeroes Awards</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.awardsHero}>
              <Ionicons name="trophy" size={56} color="#F59E0B" />
              <Text style={styles.awardsHeroTitle}>Season Awards 2024</Text>
              <Text style={styles.awardsHeroSub}>Celebrating the best in cricket</Text>
            </View>
            {[
              { award: 'Player of the Year', winner: 'Virat Kohli', team: 'India', icon: 'trophy', color: '#F59E0B' },
              { award: 'Best Batsman', winner: 'Rohit Sharma', team: 'India', icon: 'baseball', color: '#00A66A' },
              { award: 'Best Bowler', winner: 'Jasprit Bumrah', team: 'India', icon: 'radio-button-on', color: '#0F766E' },
              { award: 'Best All-Rounder', winner: 'Hardik Pandya', team: 'India', icon: 'star', color: '#059669' },
              { award: 'Best Wicket Keeper', winner: 'MS Dhoni', team: 'India', icon: 'shield', color: '#10B981' },
              { award: 'Emerging Player', winner: 'Shubman Gill', team: 'India', icon: 'flash', color: '#34D399' },
              { award: 'Best Captain', winner: 'Rohit Sharma', team: 'India', icon: 'ribbon', color: '#00A66A' },
            ].map((item, i) => (
              <View key={i} style={styles.awardCard}>
                <View style={[styles.awardIconCircle, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon as any} size={28} color={item.color} />
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
      <Modal visible={showAssociationsModal} transparent animationType="slide" onRequestClose={() => setShowAssociationsModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowAssociationsModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Associations</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionSubHeader}>Cricket Associations Near You</Text>
            {[
              { name: 'Mumbai Cricket Association', members: '1,240', tournaments: 18, city: 'Mumbai', initials: 'MCA' },
              { name: 'Delhi & District Cricket Association', members: '980', tournaments: 14, city: 'Delhi', initials: 'DDCA' },
              { name: 'Board of Control for Cricket in India', members: '5,000+', tournaments: 45, city: 'National', initials: 'BCCI' },
              { name: 'Karnataka State Cricket Association', members: '760', tournaments: 12, city: 'Bangalore', initials: 'KSCA' },
              { name: 'Tamil Nadu Cricket Association', members: '820', tournaments: 16, city: 'Chennai', initials: 'TNCA' },
              { name: 'Rajasthan Cricket Association', members: '540', tournaments: 9, city: 'Jaipur', initials: 'RCA' },
            ].map((assoc, i) => (
              <TouchableOpacity key={i} style={styles.assocCard} activeOpacity={0.85}>
                <View style={styles.assocAvatar}>
                  <Text style={styles.assocAvatarText}>{assoc.initials}</Text>
                </View>
                <View style={styles.assocInfo}>
                  <Text style={styles.assocName}>{assoc.name}</Text>
                  <Text style={styles.assocCity}>{assoc.city}</Text>
                  <View style={styles.assocStats}>
                    <Ionicons name="people" size={12} color="#666" />
                    <Text style={styles.assocStatText}>{assoc.members} members</Text>
                    <Ionicons name="trophy" size={12} color="#666" style={{ marginLeft: 8 }} />
                    <Text style={styles.assocStatText}>{assoc.tournaments} tournaments</Text>
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
      <Modal visible={showClubsModal} transparent animationType="slide" onRequestClose={() => setShowClubsModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowClubsModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Clubs</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.createClubBtn}>
              <LinearGradient colors={["#00A66A", "#0F766E"]} style={styles.createClubGradient}>
                <Ionicons name="add-circle" size={22} color="#FFF" />
                <Text style={styles.createClubText}>Create a New Club</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.sectionSubHeader}>Popular Clubs Near You</Text>
            {[
              { name: 'Mumbai Warriors CC', members: 24, wins: 18, matches: 25, founded: '2018', initials: 'MW', color: '#00A66A' },
              { name: 'Delhi Strikers Club', members: 18, wins: 12, matches: 20, founded: '2019', initials: 'DS', color: '#0F766E' },
              { name: 'Bangalore Challengers', members: 22, wins: 15, matches: 22, founded: '2017', initials: 'BC', color: '#059669' },
              { name: 'Chennai Kings CC', members: 20, wins: 10, matches: 18, founded: '2020', initials: 'CK', color: '#10B981' },
              { name: 'Kolkata Knights Club', members: 16, wins: 8, matches: 15, founded: '2021', initials: 'KK', color: '#34D399' },
            ].map((club, i) => (
              <TouchableOpacity key={i} style={styles.clubCard} activeOpacity={0.85}>
                <View style={[styles.clubAvatar, { backgroundColor: club.color }]}>
                  <Text style={styles.clubAvatarText}>{club.initials}</Text>
                </View>
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName}>{club.name}</Text>
                  <Text style={styles.clubFounded}>Founded {club.founded}</Text>
                  <View style={styles.clubStats}>
                    <Ionicons name="people" size={12} color="#666" />
                    <Text style={styles.clubStatText}>{club.members} members</Text>
                    <Ionicons name="trophy" size={12} color="#666" style={{ marginLeft: 8 }} />
                    <Text style={styles.clubStatText}>{club.wins}/{club.matches} W</Text>
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
      <Modal visible={showContactModal} transparent animationType="slide" onRequestClose={() => setShowContactModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowContactModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Contact Us</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.contactHero}>
              <Ionicons name="headset" size={56} color="#00A66A" />
              <Text style={styles.contactHeroTitle}>We are here to help!</Text>
              <Text style={styles.contactHeroSub}>Reach out to us anytime</Text>
            </View>
            {[
              { icon: 'call', label: 'Phone Support', value: '+91 98765 43210', sub: 'Mon-Sat, 9AM - 6PM' },
              { icon: 'mail', label: 'Email Support', value: 'support@gamelens.com', sub: 'Response within 24 hours' },
              { icon: 'logo-whatsapp', label: 'WhatsApp', value: '+91 98765 43210', sub: 'Quick responses' },
              { icon: 'location', label: 'Office Address', value: 'GameLens HQ, Mumbai', sub: 'Maharashtra, India - 400001' },
            ].map((item, i) => (
              <TouchableOpacity key={i} style={styles.contactCard} activeOpacity={0.85}>
                <View style={styles.contactIconCircle}>
                  <Ionicons name={item.icon as any} size={24} color="#00A66A" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>{item.label}</Text>
                  <Text style={styles.contactValue}>{item.value}</Text>
                  <Text style={styles.contactSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#00A66A" />
              </TouchableOpacity>
            ))}
            <View style={styles.contactFormSection}>
              <Text style={styles.contactFormTitle}>Send us a message</Text>
              <TextInput style={styles.contactInput} placeholder="Your name" placeholderTextColor="#999" />
              <TextInput style={styles.contactInput} placeholder="Your email" placeholderTextColor="#999" keyboardType="email-address" />
              <TextInput style={[styles.contactInput, { height: 100, textAlignVertical: 'top' }]} placeholder="Your message..." placeholderTextColor="#999" multiline />
              <TouchableOpacity style={styles.contactSendBtn}>
                <LinearGradient colors={["#00A66A", "#0F766E"]} style={styles.contactSendGradient}>
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
      <Modal visible={showShareModal} transparent animationType="slide" onRequestClose={() => setShowShareModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowShareModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Share the App</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.shareHero}>
              <View style={styles.shareAppIcon}>
                <Text style={styles.shareAppIconText}>{"CRICK\nBUZ"}</Text>
              </View>
              <Text style={styles.shareHeroTitle}>Invite Your Friends!</Text>
              <Text style={styles.shareHeroSub}>Share GameLens and earn rewards for every friend who joins</Text>
            </View>
            <View style={styles.shareReferralBox}>
              <Text style={styles.shareReferralLabel}>Your Referral Code</Text>
              <View style={styles.shareReferralCodeRow}>
                <Text style={styles.shareReferralCode}>GAME2024</Text>
                <TouchableOpacity style={styles.shareCopyBtn}>
                  <Ionicons name="copy" size={18} color="#00A66A" />
                  <Text style={styles.shareCopyText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.shareViaLabel}>Share via</Text>
            <View style={styles.shareOptionsGrid}>
              {[
                { icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366' },
                { icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
                { icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2' },
                { icon: 'mail', label: 'Email', color: '#00A66A' },
                { icon: 'logo-instagram', label: 'Instagram', color: '#E1306C' },
                { icon: 'share-social', label: 'More', color: '#666' },
              ].map((opt, i) => (
                <TouchableOpacity key={i} style={styles.shareOption} activeOpacity={0.8}>
                  <View style={[styles.shareOptionIcon, { backgroundColor: opt.color }]}>
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
                <Text style={styles.shareRewardText}>Get 50 GameCoins for every friend who signs up using your code!</Text>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* ===== Rate Us Modal ===== */}
      <Modal visible={showRateModal} transparent animationType="slide" onRequestClose={() => setShowRateModal(false)}>
        <View style={styles.fullModalContainer}>
          <LinearGradient colors={["#00A66A", "#0F766E", "#064E3B"]} style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setShowRateModal(false)} style={styles.fullModalBack}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Rate Us</Text>
            <View style={{ width: 40 }} />
          </LinearGradient>
          <ScrollView style={styles.fullModalBody} showsVerticalScrollIndicator={false}>
            {ratingSubmitted ? (
              <View style={styles.ratingThanksBox}>
                <Ionicons name="checkmark-circle" size={72} color="#22C55E" />
                <Text style={styles.ratingThanksTitle}>Thank You!</Text>
                <Text style={styles.ratingThanksSub}>Your feedback means a lot to us. We will keep improving GameLens for you!</Text>
                <TouchableOpacity style={styles.ratingDoneBtn} onPress={() => { setShowRateModal(false); setRatingSubmitted(false); setSelectedRating(0); }}>
                  <Text style={styles.ratingDoneBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.rateHero}>
                  <Ionicons name="star" size={56} color="#F59E0B" />
                  <Text style={styles.rateHeroTitle}>Enjoying GameLens?</Text>
                  <Text style={styles.rateHeroSub}>Your rating helps us improve and reach more cricket fans</Text>
                </View>
                <View style={styles.rateStarsRow}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setSelectedRating(star)} style={styles.rateStar}>
                      <Ionicons name={star <= selectedRating ? "star" : "star-outline"} size={48} color={star <= selectedRating ? "#F59E0B" : "#CCC"} />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.rateLabel}>
                  {selectedRating === 0 ? 'Tap a star to rate' : selectedRating === 1 ? 'Poor' : selectedRating === 2 ? 'Fair' : selectedRating === 3 ? 'Good' : selectedRating === 4 ? 'Very Good' : 'Excellent!'}
                </Text>
                {[
                  { title: 'Easy to use', icon: 'phone-portrait' },
                  { title: 'Great features', icon: 'flash' },
                  { title: 'Accurate scoring', icon: 'checkmark-circle' },
                  { title: 'Good community', icon: 'people' },
                ].map((tag, i) => (
                  <View key={i} style={styles.rateTagRow}>
                    <Ionicons name={tag.icon as any} size={18} color="#00A66A" />
                    <Text style={styles.rateTagText}>{tag.title}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={[styles.rateSubmitBtn, selectedRating === 0 && { opacity: 0.5 }]}
                  disabled={selectedRating === 0}
                  onPress={() => setRatingSubmitted(true)}
                >
                  <LinearGradient colors={["#00A66A", "#0F766E"]} style={styles.rateSubmitGradient}>
                    <Text style={styles.rateSubmitText}>Submit Rating</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rateLaterBtn} onPress={() => setShowRateModal(false)}>
                  <Text style={styles.rateLaterText}>Maybe Later</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F7F4',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerTitleOrange: {
    color: '#6EE7B7',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
  },
  myProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  myProfileAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  myProfileImage: {
    width: '100%',
    height: '100%',
  },
  myProfileInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  myProfileInfo: {
    flex: 1,
    marginLeft: 10,
  },
  myProfileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  myProfileStats: {
    fontSize: 12,
    color: '#666',
  },
  viewProfileButton: {
    padding: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
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
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#00A66A',
    fontWeight: '600',
  },
  matchScrollContent: {
    paddingHorizontal: SIDE_PADDING,
  },
  matchCardContainer: {
    marginRight: CARD_MARGIN,
    width: CARD_WIDTH,
    paddingVertical: 4,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  matchCardImage: {
    borderRadius: 12,
  },
  matchCardOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchBadge: {
    backgroundColor: '#00A66A',
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
    color: '#FFF',
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchTeam: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  matchVs: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginHorizontal: 10,
  },
  matchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
    justifyContent: 'center',
  },
  matchLocationText: {
    fontSize: 14,
    color: '#FFF',
  },
  joinMatchButton: {
    backgroundColor: '#00A66A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinMatchText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6EE7B7',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#00A66A',
  },
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  banner: {
    backgroundColor: '#0F766E',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 148,
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#6EE7B7',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#6EE7B7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F766E',
  },
  bannerIcon: {
    marginLeft: 16,
    zIndex: 1,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAll: {
    fontSize: 14,
    color: '#00A66A',
    fontWeight: '600',
  },
  playersListContainer: {
    gap: 12,
  },
  playerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  playerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerRankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  playerAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
  },
  playerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  playerAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  playerInfoColumn: {
    flex: 1,
    gap: 4,
  },
  playerListName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerListRole: {
    fontSize: 12,
    color: '#00A66A',
    fontWeight: '600',
  },
  playerDivider: {
    fontSize: 12,
    color: '#999',
  },
  playerListTeam: {
    fontSize: 12,
    color: '#666',
  },
  playerListStats: {
    fontSize: 11,
    color: '#666',
  },
  playerFollowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00A66A',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#6EE7B7',
    borderStyle: 'dashed',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A66A',
  },
  playerCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  playerInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  playerRole: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  productCard: {
    width: 120,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  productImageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  productImageStyle: {
    borderRadius: 12,
  },
  productOverlay: {
    backgroundColor: 'transparent',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  productInfo: {
    flex: 1,
    marginRight: 6,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00A66A',
  },
  addToCartButton: {
    backgroundColor: '#00A66A',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#00A66A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  createPost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  createPostImage: {
    width: '100%',
    height: '100%',
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
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  postUserImage: {
    width: '100%',
    height: '100%',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  modalPlayerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  modalPlayerImage: {
    width: '100%',
    height: '100%',
  },
  modalPlayerInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalPlayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalPlayerRole: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  modalPlayerTeam: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  modalPlayerStats: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  followButton: {
    backgroundColor: '#00A66A',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 20,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 50,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  chatModalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    marginTop: 50,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  chatModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
  chatMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  chatBadge: {
    backgroundColor: '#00A66A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  chatBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  profileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  profileEditor: {
    maxHeight: '92%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  profileEditorHeader: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileEditorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222',
  },
  profileSaveText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00A66A',
  },
  profileEditorBody: {
    padding: 16,
  },
  profilePhotoArea: {
    alignItems: 'center',
    marginBottom: 18,
  },
  profilePhotoPreview: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  profilePhotoImage: {
    width: '100%',
    height: '100%',
  },
  profilePhotoInitials: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
  },
  profilePhotoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222',
  },
  profilePhotoHint: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  pickPhotoButton: {
    minHeight: 40,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#00A66A',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pickPhotoText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  profileInputLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  profileInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#222',
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileRowField: {
    flex: 1,
  },
  clearPhotoButton: {
    minHeight: 44,
    marginTop: 16,
    marginBottom: 28,
    borderRadius: 8,
    backgroundColor: '#F0F7F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  clearPhotoText: {
    color: '#00A66A',
    fontSize: 14,
    fontWeight: '800',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  drawerContainer: {
    width: '80%',
    height: '100%',
    backgroundColor: '#FFF',
  },
  drawerProfile: {
    backgroundColor: '#4A4A4A',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerProfileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  drawerProfileImage: {
    width: '100%',
    height: '100%',
  },
  drawerProfileInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  drawerProfileInfo: {
    flex: 1,
  },
  drawerProfileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  drawerProfilePhone: {
    fontSize: 14,
    color: '#DDD',
    marginBottom: 6,
  },
  progressContainer: {
    backgroundColor: '#4A4A4A',
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#666',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#00A66A',
  },
  progressText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  drawerMenu: {
    flex: 1,
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  drawerMenuIcon: {
    width: 32,
    marginRight: 12,
  },
  drawerMenuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  drawerMenuBadge: {
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  drawerMenuBadgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  matchOptionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  matchOptionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchOptionCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  matchOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  matchOptionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchOptionTextContainer: {
    flex: 1,
  },
  matchOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  matchOptionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Search Results Styles
  searchPlayerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchPlayerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  searchPlayerImage: {
    width: '100%',
    height: '100%',
  },
  searchPlayerInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  searchPlayerInfo: {
    flex: 1,
  },
  searchPlayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  searchPlayerRole: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  searchPlayerStats: {
    fontSize: 12,
    color: '#00A66A',
    fontWeight: '500',
  },
  searchMatchItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  searchMatchBadge: {
    backgroundColor: '#00A66A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  searchMatchBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  searchMatchTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  searchMatchTeams: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchMatchLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchMatchLocationText: {
    fontSize: 12,
    color: '#666',
  },
  searchProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchProductInfo: {
    flex: 1,
  },
  searchProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  searchProductPrice: {
    fontSize: 14,
    color: '#00A66A',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ===== Shared Full-Screen Modal Styles =====
  fullModalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  fullModalBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  fullModalBody: {
    flex: 1,
    padding: 16,
  },
  sectionSubHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ===== Store Styles =====
  storeHeroBanner: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeHeroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  storeHeroSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  storeProductCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  storeProductImageBox: {
    width: 100,
    height: 120,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeBadge: {
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#00A66A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  storeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFF',
  },
  storeProductInfo: {
    flex: 1,
    padding: 12,
  },
  storeProductCategory: {
    fontSize: 11,
    color: '#00A66A',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  storeProductName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storeRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 6,
  },
  storeRatingText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  storePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  storePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00A66A',
  },
  storeOriginalPrice: {
    fontSize: 13,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  storeAddCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A66A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  storeAddCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },

  // ===== Leaderboard Styles =====
  lbTabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lbTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  lbTabActive: {
    backgroundColor: '#00A66A',
  },
  lbTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  lbTabTextActive: {
    color: '#FFF',
  },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lbRowTop: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  lbRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  lbRankText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
  lbAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  lbAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  lbInfo: {
    flex: 1,
  },
  lbName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  lbTeam: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lbStat: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00A66A',
  },

  // ===== Awards Styles =====
  awardsHero: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  awardsHeroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  awardsHeroSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  awardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  awardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  awardInfo: {
    flex: 1,
  },
  awardTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  awardWinner: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  awardTeam: {
    fontSize: 13,
    color: '#00A66A',
    marginTop: 2,
  },

  // ===== Associations Styles =====
  assocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  assocAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  assocAvatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  assocInfo: {
    flex: 1,
  },
  assocName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  assocCity: {
    fontSize: 12,
    color: '#00A66A',
    marginBottom: 4,
  },
  assocStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assocStatText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  assocJoinBtn: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00A66A',
  },
  assocJoinText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A66A',
  },

  // ===== Clubs Styles =====
  createClubBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  createClubGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  createClubText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  clubAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clubAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  clubFounded: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  clubStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubStatText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  clubJoinBtn: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00A66A',
  },
  clubJoinText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00A66A',
  },

  // ===== Contact Styles =====
  contactHero: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactHeroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  contactHeroSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  contactSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  contactFormSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactFormTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  contactInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  contactSendBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  contactSendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  contactSendText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // ===== Share Styles =====
  shareHero: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  shareAppIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareAppIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 18,
  },
  shareHeroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  shareHeroSub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  shareReferralBox: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  shareReferralLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  shareReferralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderStyle: 'dashed',
  },
  shareReferralCode: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00A66A',
    letterSpacing: 2,
  },
  shareCopyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareCopyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00A66A',
  },
  shareViaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  shareOption: {
    width: '28%',
    alignItems: 'center',
    gap: 6,
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  shareRewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  shareRewardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  shareRewardText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // ===== Rate Us Styles =====
  rateHero: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rateHeroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  rateHeroSub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  rateStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rateStar: {
    padding: 4,
  },
  rateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A66A',
    textAlign: 'center',
    marginBottom: 20,
    minHeight: 24,
  },
  rateTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  rateTagText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  rateSubmitBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 12,
  },
  rateSubmitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  rateSubmitText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rateLaterBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  rateLaterText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  ratingThanksBox: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  ratingThanksTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 10,
  },
  ratingThanksSub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  ratingDoneBtn: {
    backgroundColor: '#00A66A',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 28,
  },
  ratingDoneBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // ===== Redesign Styles =====
  profileRoleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 6,
  },
  profileRoleText: {
    fontSize: 13,
    color: '#00A66A',
    fontWeight: '600',
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileStatItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  profileStatVal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  profileStatLbl: {
    fontSize: 11,
    color: '#666',
  },
  profileStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickActionItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  matchCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeLive: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeUpcoming: {
    backgroundColor: '#F3F4F6',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  upcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadgeTextLive: {
    color: '#EF4444',
  },
  statusBadgeTextUpcoming: {
    color: '#6B7280',
  },
  matchTimeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  matchTeamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  matchTeamLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  teamLogoWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A66A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  teamNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  teamScoreText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  matchCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  venueText: {
    fontSize: 12,
    color: '#666',
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00A66A',
  },
  bannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  rank1Bg: {
    backgroundColor: '#F59E0B',
  },
  rank2Bg: {
    backgroundColor: '#94A3B8',
  },
  rankWhiteText: {
    color: '#FFF',
  },
  playerRoleTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  playerRoleTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  playerStatsRowSmall: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  miniStatItem: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  storeScrollContent: {
    paddingRight: 16,
  },
  postMoreButton: {
    padding: 4,
  },
  postStatLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIconBg: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
