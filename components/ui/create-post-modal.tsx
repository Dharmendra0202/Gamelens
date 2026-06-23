import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView
} from 'react-native';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPost: (postData: {
    content: string;
    mediaUri: string;
    mediaType: 'image' | 'video' | undefined;
    location: string;
    tags: string[];
  }) => Promise<void>;
  userName: string;
  userInitials: string;
}

const POPULAR_HASHTAGS = ['cricket', 'matchday', 'IPL', 'practice', 'gamelens', 'cricketlife', 'T20', 'netpractice'];

const POPULAR_STADIUMS = [
  'Wankhede Stadium, Mumbai',
  'M. Chinnaswamy Stadium, Bangalore',
  'Narendra Modi Stadium, Ahmedabad',
  'Feroz Shah Kotla, Delhi',
  'Eden Gardens, Kolkata',
  'MA Chidambaram Stadium, Chennai'
];

export function CreatePostModal({ visible, onClose, onPost, userName, userInitials }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>(undefined);
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showTagsPanel, setShowTagsPanel] = useState(false);

  // Reset states on visibility change
  useEffect(() => {
    if (visible) {
      setContent('');
      setMediaUri('');
      setMediaType(undefined);
      setLocation('');
      setSelectedTags([]);
      setIsPosting(false);
      setShowLocationPicker(false);
      setShowTagsPanel(false);
    }
  }, [visible]);

  // Gallery Picker
  const pickMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType(asset.type === 'video' ? 'video' : 'image');
      }
    } catch (error) {
      console.error('Error picking image/video:', error);
      alert('Error picking image or video');
    }
  };

  // Camera Capture
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        alert('Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setMediaType(asset.type === 'video' ? 'video' : 'image');
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      alert('Error starting camera');
    }
  };

  // Fetch Current GPS Location
  const requestLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        alert('Permission to access location was denied. Showing cricket stadiums list instead.');
        setShowLocationPicker(true);
        setIsLocating(false);
        return;
      }

      const gps = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const addresses = await Location.reverseGeocodeAsync({
        latitude: gps.coords.latitude,
        longitude: gps.coords.longitude,
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const locationStr = addr.city || addr.subregion || addr.region || 'Cricket Ground';
        setLocation(locationStr);
      } else {
        setLocation('My Location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setShowLocationPicker(true);
    } finally {
      setIsLocating(false);
    }
  };

  // Quick Tags selection
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
      // Remove hashtag word from text if it was appended
      setContent(prev => prev.replace(new RegExp(`\\s*#${tag}\\b`, 'gi'), ''));
    } else {
      setSelectedTags(prev => [...prev, tag]);
      setContent(prev => `${prev.trim()} #${tag} `);
    }
  };

  // Form Submission
  const handlePostSubmit = async () => {
    if (!content.trim() && !mediaUri) return;
    setIsPosting(true);
    try {
      // Pass clean tags list
      await onPost({
        content: content.trim(),
        mediaUri,
        mediaType,
        location,
        tags: selectedTags,
      });
      onClose();
    } catch (error) {
      console.error('Failed to upload post:', error);
      alert('Failed to publish post. Try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.createModalOverlay}>
          <View style={styles.createModalSheet}>
            {/* Header */}
            <View style={styles.createModalHeader}>
              <TouchableOpacity onPress={onClose} style={styles.headerBtnLeft} disabled={isPosting}>
                <Text style={styles.createModalCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={styles.createModalTitle}>New Post</Text>
              
              <TouchableOpacity
                style={[
                  styles.createModalPostBtn,
                  (!content.trim() && !mediaUri) && styles.disabledPostBtn,
                  isPosting && { backgroundColor: '#A7F3D0' }
                ]}
                disabled={(!content.trim() && !mediaUri) || isPosting}
                onPress={handlePostSubmit}
              >
                {isPosting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.createModalPostTxt}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Main content body */}
            <ScrollView contentContainerStyle={styles.createModalBody} keyboardShouldPersistTaps="handled">
              {/* User Section */}
              <View style={styles.createModalAvatarRow}>
                <View style={[styles.postAvatar, { backgroundColor: '#B71C1C' }]}>
                  <Text style={styles.postAvatarInitials}>{userInitials}</Text>
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.createModalUserName}>{userName}</Text>
                  <View style={styles.pillsRow}>
                    <View style={styles.audiencePill}>
                      <Ionicons name="earth" size={11} color="#B71C1C" />
                      <Text style={styles.audiencePillTxt}>Everyone</Text>
                    </View>
                    {location ? (
                      <TouchableOpacity
                        style={[styles.audiencePill, { backgroundColor: '#EFF6FF', borderColor: '#3B82F633' }]}
                        onPress={() => setLocation('')}
                      >
                        <Ionicons name="location" size={11} color="#3B82F6" />
                        <Text style={[styles.audiencePillTxt, { color: '#3B82F6' }]}>{location}</Text>
                        <Ionicons name="close-circle" size={12} color="#3B82F6" style={{ marginLeft: 3 }} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* TextInput */}
              <TextInput
                style={styles.createModalInput}
                placeholder="What's happening in your cricket world?"
                placeholderTextColor="#A1A1AA"
                multiline
                value={content}
                onChangeText={setContent}
                maxLength={500}
                autoFocus
                editable={!isPosting}
              />

              {/* Media Preview Box */}
              {mediaUri ? (
                <View style={styles.mediaPreviewContainer}>
                  {mediaType === 'video' ? (
                    <View style={styles.videoPreviewWrapper}>
                      <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
                      <View style={styles.videoPlayOverlay}>
                        <Ionicons name="play-circle" size={48} color="#FFF" />
                        <Text style={styles.videoLabel}>Video Clip</Text>
                      </View>
                    </View>
                  ) : (
                    <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaBtn}
                    onPress={() => {
                      setMediaUri('');
                      setMediaType(undefined);
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* Suggested Hashtags */}
              <View style={styles.suggestedTagsContainer}>
                <Text style={styles.sectionHeading}>Tap to add popular tags:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestedTagsScroll}>
                  {POPULAR_HASHTAGS.map(tag => {
                    const active = selectedTags.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[styles.tagPill, active && styles.tagPillActive]}
                        onPress={() => handleTagToggle(tag)}
                      >
                        <Text style={[styles.tagPillTxt, active && styles.tagPillTxtActive]}>#{tag}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Stadium Location Picker panel */}
              {showLocationPicker ? (
                <View style={styles.locationSelectorContainer}>
                  <View style={styles.locationSelectorHeader}>
                    <Text style={styles.sectionHeading}>Select Match Venue:</Text>
                    <TouchableOpacity onPress={() => setShowLocationPicker(false)}>
                      <Text style={styles.closeSelectorBtn}>Hide</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.locationScroll}>
                    {POPULAR_STADIUMS.map(stadium => (
                      <TouchableOpacity
                        key={stadium}
                        style={[styles.locationCard, location === stadium && styles.locationCardActive]}
                        onPress={() => {
                          setLocation(stadium);
                          setShowLocationPicker(false);
                        }}
                      >
                        <Ionicons name="location-outline" size={14} color={location === stadium ? '#FFF' : '#B71C1C'} />
                        <Text style={[styles.locationCardTxt, location === stadium && styles.locationCardTxtActive]} numberOfLines={1}>
                          {stadium.split(',')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </ScrollView>

            {/* Bottom Keyboard Toolbar */}
            <View style={styles.createModalToolbar}>
              <View style={styles.toolbarActionLeft}>
                <TouchableOpacity style={styles.toolbarBtn} onPress={pickMedia} disabled={isPosting}>
                  <Ionicons name="image-outline" size={23} color="#B71C1C" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarBtn} onPress={takePhoto} disabled={isPosting}>
                  <Ionicons name="camera-outline" size={23} color="#8B0000" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.toolbarBtn, showLocationPicker && styles.toolbarBtnActive]}
                  onPress={() => setShowLocationPicker(prev => !prev)}
                  disabled={isPosting}
                >
                  <Ionicons name="location-outline" size={23} color="#3B82F6" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolbarBtn} onPress={requestLocation} disabled={isPosting || isLocating}>
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <Ionicons name="navigate-outline" size={23} color="#059669" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.toolbarActionRight}>
                <Text style={[styles.charCount, content.length > 450 && { color: '#EF4444' }]}>
                  {content.length}/500
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  createModalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  createModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  headerBtnLeft: {
    paddingVertical: 4,
    paddingRight: 12,
  },
  createModalCancel: {
    fontSize: 15,
    color: '#71717A',
    fontWeight: '500',
  },
  createModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#18181B',
    letterSpacing: -0.3,
  },
  createModalPostBtn: {
    backgroundColor: '#B71C1C',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledPostBtn: {
    backgroundColor: '#E4E4E7',
    opacity: 0.8,
  },
  createModalPostTxt: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  createModalBody: {
    padding: 20,
    paddingBottom: 40,
  },
  createModalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  createModalUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181B',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  audiencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBE9E7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B71C1C22',
  },
  audiencePillTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B71C1C',
  },
  createModalInput: {
    fontSize: 16,
    color: '#18181B',
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 0,
    marginBottom: 20,
  },
  mediaPreviewContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F4F4F5',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  mediaPreview: {
    width: '100%',
    height: 220,
  },
  videoPreviewWrapper: {
    position: 'relative',
    width: '100%',
    height: 220,
  },
  videoPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 6,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  suggestedTagsContainer: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestedTagsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  tagPill: {
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E4E4E7',
  },
  tagPillActive: {
    backgroundColor: '#B71C1C',
    borderColor: '#B71C1C',
  },
  tagPillTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525B',
  },
  tagPillTxtActive: {
    color: '#FFF',
  },
  locationSelectorContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  locationSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  closeSelectorBtn: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
  },
  locationScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  locationCardActive: {
    backgroundColor: '#B71C1C',
    borderColor: '#B71C1C',
  },
  locationCardTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  locationCardTxtActive: {
    color: '#FFF',
  },
  createModalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    backgroundColor: '#FFF',
  },
  toolbarActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolbarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
  },
  toolbarBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#3B82F622',
  },
  toolbarActionRight: {
    justifyContent: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
  },
});
