import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
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

export default function HomeScreen() {
  const router = useRouter();
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showMatchOptionsModal, setShowMatchOptionsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const players = [
    { id: 1, name: 'Virat Kohli', role: 'Batsman', team: 'India', runs: '25,000+', initials: 'VK', color: '#9D4EDD' },
    { id: 2, name: 'MS Dhoni', role: 'Wicket Keeper', team: 'India', runs: '17,000+', initials: 'MS', color: '#7209B7' },
    { id: 3, name: 'Rohit Sharma', role: 'Batsman', team: 'India', runs: '18,000+', initials: 'RS', color: '#C77DFF' },
    { id: 4, name: 'Jasprit Bumrah', role: 'Bowler', team: 'India', wickets: '500+', initials: 'JB', color: '#E0AAFF' },
  ];

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
        colors={["#E63946", "#C1121F", "#780000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setShowMenuDrawer(true)}>
            <Ionicons name="menu" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            CRICK<Text style={styles.headerTitleOrange}>BUZ</Text>
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
          <View style={styles.myProfile}>
            <View style={styles.myProfileAvatar}>
              <Text style={styles.myProfileInitials}>ME</Text>
            </View>
            <View style={styles.myProfileInfo}>
              <Text style={styles.myProfileName}>My Profile</Text>
              <Text style={styles.myProfileStats}>125 Friends • 45 Posts</Text>
            </View>
            <TouchableOpacity style={styles.viewProfileButton} onPress={() => console.log('View profile clicked')}>
              <Ionicons name="chevron-forward" size={20} color="#9D4EDD" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Matches Nearby */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Matches Nearby</Text>
            <TouchableOpacity style={styles.locationButton} onPress={() => console.log('Location clicked')}>
              <Ionicons name="location" size={16} color="#9D4EDD" />
              <Text style={styles.locationText}>Mumbai</Text>
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
              >
                <ImageBackground
                  source={{ uri: match.image }}
                  style={styles.matchCard}
                  imageStyle={styles.matchCardImage}
                >
                  <View style={styles.matchCardOverlay}>
                    <View style={styles.matchHeader}>
                      <View style={styles.matchBadge}>
                        <Text style={styles.matchBadgeText}>{match.badge}</Text>
                      </View>
                      <Text style={styles.matchTime}>{match.time}</Text>
                    </View>
                    <View style={styles.matchTeams}>
                      <Text style={styles.matchTeam}>{match.team1}</Text>
                      <Text style={styles.matchVs}>VS</Text>
                      <Text style={styles.matchTeam}>{match.team2}</Text>
                    </View>
                    <View style={styles.matchLocation}>
                      <Ionicons name="location-outline" size={16} color="#FFF" />
                      <Text style={styles.matchLocationText}>{match.location}</Text>
                    </View>
                    <TouchableOpacity style={styles.joinMatchButton} onPress={() => console.log('View match details clicked')}>
                      <Text style={styles.joinMatchText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
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
          <View style={styles.banner}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>IPL 2024</Text>
              <Text style={styles.bannerSubtitle}>Get your tickets now!</Text>
              <TouchableOpacity style={styles.bannerButton} onPress={() => console.log('Book tickets clicked')}>
                <Text style={styles.bannerButtonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bannerIcon}>
              <Ionicons name="ticket" size={60} color="#FFD700" />
            </View>
          </View>
        </View>

        {/* Popular Cricketers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Cricketers</Text>
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
              >
                <View style={styles.playerRank}>
                  <Text style={styles.playerRankNumber}>{index + 1}</Text>
                </View>
                
                <View style={[styles.playerAvatarCircle, { backgroundColor: player.color }]}>
                  <Text style={styles.playerAvatarText}>{player.initials}</Text>
                </View>
                
                <View style={styles.playerInfoColumn}>
                  <Text style={styles.playerListName}>{player.name}</Text>
                  <View style={styles.playerMetaRow}>
                    <Text style={styles.playerListRole}>{player.role}</Text>
                    <Text style={styles.playerDivider}>•</Text>
                    <Text style={styles.playerListTeam}>{player.team}</Text>
                  </View>
                  {player.runs && (
                    <Text style={styles.playerListStats}>🏏 {player.runs}</Text>
                  )}
                  {player.wickets && (
                    <Text style={styles.playerListStats}>🎯 {player.wickets}</Text>
                  )}
                </View>

                <TouchableOpacity style={styles.playerFollowBtn}>
                  <Ionicons name="person-add-outline" size={18} color="#9D4EDD" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {!showAllPlayers && players.length > 2 && (
              <TouchableOpacity 
                style={styles.seeMoreButton}
                onPress={() => setShowAllPlayers(true)}
              >
                <Text style={styles.seeMoreText}>See More Cricketers</Text>
                <Ionicons name="chevron-down" size={20} color="#9D4EDD" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Shopping Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cricket Store</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View Store</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => console.log(`Viewing ${product.name}`)}
              >
                <ImageBackground
                  source={{ uri: product.image }}
                  style={styles.productImageBackground}
                  imageStyle={styles.productImageStyle}
                >
                  <View style={styles.productOverlay}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{product.price}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addToCartButton}
                      onPress={() => console.log(`Added ${product.name} to cart`)}
                    >
                      <Ionicons name="cart" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Social Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feed</Text>
          </View>

          {/* Create Post */}
          <TouchableOpacity style={styles.createPost} onPress={() => console.log('Create post clicked')}>
            <View style={styles.createPostAvatar}>
              <Text style={styles.createPostInitials}>ME</Text>
            </View>
            <Text style={styles.createPostPlaceholder}>What's on your mind?</Text>
          </TouchableOpacity>

          {/* Posts */}
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postUserAvatar}>
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
                <Text style={styles.postStatsText}>{post.comments} comments • {post.shares} shares</Text>
              </View>

              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postAction} onPress={() => console.log('Like clicked')}>
                  <Ionicons name="heart-outline" size={22} color="#666" />
                  <Text style={styles.postActionText}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction} onPress={() => console.log('Comment clicked')}>
                  <Ionicons name="chatbubble-outline" size={22} color="#666" />
                  <Text style={styles.postActionText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postAction} onPress={() => console.log('Share clicked')}>
                  <Ionicons name="share-social-outline" size={22} color="#666" />
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
                  <Text style={styles.modalPlayerInitials}>{selectedPlayer.initials}</Text>
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
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.searchResults}>
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
              <Ionicons name="create-outline" size={24} color="#9D4EDD" />
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
              <View style={[styles.chatAvatar, { backgroundColor: '#C77DFF' }]}>
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
              <View style={[styles.chatAvatar, { backgroundColor: '#7209B7' }]}>
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
            <View style={styles.drawerProfile}>
              <View style={styles.drawerProfileAvatar}>
                <Text style={styles.drawerProfileInitials}>DV</Text>
              </View>
              <View style={styles.drawerProfileInfo}>
                <Text style={styles.drawerProfileName}>Dharmendra Vishw...</Text>
                <Text style={styles.drawerProfilePhone}>8383999973</Text>
                <View style={styles.drawerProfileBadge}>
                  <Text style={styles.drawerProfileBadgeText}>Free User</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Ionicons name="close-circle-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

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

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="baseball" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>My Cricket</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="bar-chart-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>My Performance</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="bag-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>CricHeroes Store</Text>
                <Ionicons name="lock-closed" size={16} color="#FFD700" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="podium-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Leaderboards</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="ribbon-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>CricHeroes Awards</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="people-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Associations</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="business-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Clubs</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="call-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="share-social-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Share the app</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.drawerMenuItem}>
                <View style={styles.drawerMenuIcon}>
                  <Ionicons name="star-outline" size={20} color="#666" />
                </View>
                <Text style={styles.drawerMenuText}>Rate us</Text>
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
                colors={["#17A2B8", "#138496", "#0E6674"]}
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
                colors={["#E63946", "#C1121F", "#780000"]}
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
    color: '#FFD60A',
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
    backgroundColor: '#9D4EDD',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#9D4EDD',
    fontWeight: '600',
  },
  matchScrollContent: {
    paddingHorizontal: SIDE_PADDING,
  },
  matchCardContainer: {
    marginRight: CARD_MARGIN,
    width: CARD_WIDTH,
  },
  matchCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    backgroundColor: '#9D4EDD',
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
    fontSize: 14,
    color: '#FFD700',
    marginHorizontal: 12,
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
    backgroundColor: '#9D4EDD',
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
    backgroundColor: '#E0D4F7',
  },
  activeDot: {
    width: 24,
    backgroundColor: '#9D4EDD',
  },
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  banner: {
    backgroundColor: '#7209B7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#E0AAFF',
    marginBottom: 12,
  },
  bannerButton: {
    backgroundColor: '#FFD60A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7209B7',
  },
  bannerIcon: {
    marginLeft: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#9D4EDD',
    fontWeight: '600',
  },
  playersListContainer: {
    gap: 12,
  },
  playerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  playerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
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
    color: '#9D4EDD',
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
    borderColor: '#9D4EDD',
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F5FF',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0D4F7',
    borderStyle: 'dashed',
  },
  seeMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9D4EDD',
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
    color: '#FFD700',
  },
  addToCartButton: {
    backgroundColor: '#9D4EDD',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#9D4EDD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  createPost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9D4EDD',
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
    backgroundColor: '#C77DFF',
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
    backgroundColor: '#9D4EDD',
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
    backgroundColor: '#F3E8FF',
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
    backgroundColor: '#9D4EDD',
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
    backgroundColor: '#9D4EDD',
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
    backgroundColor: '#9D4EDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
  drawerProfileBadge: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  drawerProfileBadgeText: {
    fontSize: 12,
    color: '#FFF',
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
    backgroundColor: '#9D4EDD',
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
});
