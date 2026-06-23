import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { shareContent } from '@/utils/share';

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
  likes: number;
  comments: number;
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
}

export function CricketPostCard({ post, onLike, onComment, onShare, onSave }: CricketPostCardProps) {
  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[styles.postAvatarRing, { borderColor: post.verified ? '#B71C1C' : 'transparent' }]}>
          <View style={[styles.postAvatar, { backgroundColor: post.color }]}>
            <Text style={styles.postAvatarInitials}>{post.initials}</Text>
          </View>
        </View>
        <View style={styles.postUserInfo}>
          <View style={styles.postUserNameRow}>
            <Text style={styles.postUserName}>{post.user}</Text>
            {post.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#B71C1C" style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.postMetaRow}>{post.role} · {post.time}</Text>
        </View>
        <TouchableOpacity style={styles.postMoreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#999" />
        </TouchableOpacity>
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

      {/* Media */}
      {post.hasMedia && (
        <View style={styles.postMediaBox}>
          <LinearGradient colors={['#8B0000', '#8B0000', '#059669']} style={styles.postMediaGradient}>
            <Ionicons name="images-outline" size={36} color="rgba(255,255,255,0.5)" />
            <Text style={styles.postMediaLabel}>Match Highlights</Text>
          </LinearGradient>
        </View>
      )}

      {/* Stats */}
      <View style={styles.postStatsRow}>
        <View style={styles.postStatsLeft}>
          <View style={styles.likeIconRow}>
            <View style={styles.likeIconBg}>
              <Ionicons name="heart" size={9} color="#FFF" />
            </View>
            <View style={[styles.likeIconBg, { backgroundColor: '#8B0000', marginLeft: -4 }]}>
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
            color={post.saved ? '#B71C1C' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    backgroundColor: '#FBE9E7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  postTagTxt: {
    color: '#B71C1C',
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
  likeIconRow: {
    flexDirection: 'row',
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
