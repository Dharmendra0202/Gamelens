import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { shareContent } from '@/utils/share';

export interface CricketComment {
  id: number;
  user: string;
  initials: string;
  color: string;
  time: string;
  text: string;
}

export interface CricketPost {
  id: number;
  user: string;
  initials: string;
  color: string;
  role: string;
  time: string;
  content: string;
  tags?: string[];
  hasMedia?: boolean;
  mediaUri?: string;
  mediaType?: 'image' | 'video';
  location?: string;
  likes: number;
  comments: number;
  commentsList?: CricketComment[];
  shares: number;
  liked: boolean;
  saved: boolean;
  verified?: boolean;
}

interface CricketPostCardProps {
  post: CricketPost;
  onLike: (id: number) => void;
  onComment: (post: CricketPost) => void;
  onShare: (id: number) => void;
  onSave: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function CricketPostCard({ post, onLike, onComment, onShare, onSave, onDelete }: CricketPostCardProps) {
  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[styles.postAvatarRing, { borderColor: post.verified ? '#00A66A' : 'transparent' }]}>
          <View style={[styles.postAvatar, { backgroundColor: post.color }]}>
            <Text style={styles.postAvatarInitials}>{post.initials}</Text>
          </View>
        </View>
        <View style={styles.postUserInfo}>
          <View style={styles.postUserNameRow}>
            <Text style={styles.postUserName}>{post.user}</Text>
            {post.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#00A66A" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.postMetaRow}>
            {post.role} · {post.time}
            {post.location ? ` · 📍 ${post.location}` : ''}
          </Text>
        </View>
        {onDelete ? (
          <TouchableOpacity style={styles.postMoreBtn} onPress={() => onDelete(post.id)}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.postMoreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={styles.postContentTxt}>{post.content}</Text>

      {/* Hashtags */}
      {post.tags && post.tags.length > 0 && (
        <View style={styles.postTagsRow}>
          {post.tags.map((tag) => (
            <TouchableOpacity key={tag} style={styles.postTag}>
              <Text style={styles.postTagTxt}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Media Rendering */}
      {post.hasMedia && (
        <View style={styles.postMediaBox}>
          {post.mediaUri ? (
            post.mediaType === 'video' ? (
              <View style={{ position: 'relative', height: 200, width: '100%' }}>
                <Image
                  source={{ uri: post.mediaUri }}
                  style={{ width: '100%', height: '100%', borderRadius: 12 }}
                  resizeMode="cover"
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 }]}>
                  <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' }}>
                    <Ionicons name="play" size={24} color="#FFF" style={{ marginLeft: 3 }} />
                  </View>
                </View>
              </View>
            ) : (
              <Image
                source={{ uri: post.mediaUri }}
                style={{ width: '100%', height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
            )
          ) : (
            <LinearGradient colors={['#064E3B', '#0F766E', '#059669']} style={styles.postMediaGradient}>
              <Ionicons name="images-outline" size={36} color="rgba(255,255,255,0.5)" />
              <Text style={styles.postMediaLabel}>Match Highlights</Text>
            </LinearGradient>
          )}
        </View>
      )}

      {/* Stats */}
      <View style={styles.postStatsRow}>
        <View style={styles.postStatsLeft}>
          <View style={likeIconRowStyle}>
            <View style={styles.likeIconBg}>
              <Ionicons name="heart" size={9} color="#FFF" />
            </View>
            <View style={[styles.likeIconBg, { backgroundColor: '#0F766E', marginLeft: -4 }]}>
              <Ionicons name="thumbs-up" size={9} color="#FFF" />
            </View>
          </View>
          <Text style={styles.postStatsTxt}>{post.likes.toLocaleString()}</Text>
        </View>
        <Text style={styles.postStatsTxt}>{post.comments} comments • {post.shares} shares</Text>
      </View>

      <View style={styles.postDivider} />

      {/* Actions */}
      <View style={styles.postActionsRow}>
        <TouchableOpacity style={styles.postActionBtn} activeOpacity={0.7} onPress={() => onLike(post.id)}>
          <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={19} color={post.liked ? '#EF4444' : '#666'} />
          <Text style={[styles.postActionTxt, post.liked && { color: '#EF4444' }]}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionBtn} activeOpacity={0.7} onPress={() => onComment(post)}>
          <Ionicons name="chatbubble-outline" size={19} color="#666" />
          <Text style={styles.postActionTxt}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionBtn} activeOpacity={0.7} onPress={() => onShare(post.id)}>
          <Ionicons name="share-social-outline" size={19} color="#666" />
          <Text style={styles.postActionTxt}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionBtn} activeOpacity={0.7} onPress={() => onSave(post.id)}>
          <Ionicons
            name={post.saved ? 'bookmark' : 'bookmark-outline'}
            size={19}
            color={post.saved ? '#00A66A' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Fixed styling name for standard React Native web support
const likeIconRowStyle = { flexDirection: 'row' as const };

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
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
  postAvatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAvatarInitials: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserName: {
    color: '#222',
    fontSize: 15,
    fontWeight: '700',
  },
  postMetaRow: {
    color: '#777',
    fontSize: 12,
    marginTop: 2,
  },
  postMoreBtn: {
    padding: 4,
  },
  postContentTxt: {
    color: '#333',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  postTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  postTag: {
    backgroundColor: '#F0FFF8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  postTagTxt: {
    color: '#00A66A',
    fontSize: 12,
    fontWeight: '600',
  },
  postMediaBox: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
  },
  postMediaGradient: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  postMediaLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  postStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  postStatsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIconBg: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postStatsTxt: {
    color: '#777',
    fontSize: 12,
  },
  postDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  postActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  postActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  postActionTxt: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
});
