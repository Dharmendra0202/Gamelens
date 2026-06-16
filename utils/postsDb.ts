import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@gamelens_posts';

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

// In-memory fallback for environments where AsyncStorage might fail or during SSR
let memoryPosts: CricketPost[] = [];

// Helper to check if AsyncStorage is available
const isAsyncStorageAvailable = () => {
  return typeof AsyncStorage !== 'undefined' && AsyncStorage !== null;
};

// Get all posts from storage
export async function getPosts(): Promise<CricketPost[]> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data) as CricketPost[];
          memoryPosts = parsed;
          return parsed;
        }
      }
    } else if (isAsyncStorageAvailable()) {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as CricketPost[];
        memoryPosts = parsed;
        return parsed;
      }
    }
  } catch (error) {
    console.warn('AsyncStorage not available, using in-memory posts store.', error);
  }
  return memoryPosts;
}

// Save all posts to storage
export async function savePosts(posts: CricketPost[]): Promise<void> {
  memoryPosts = posts;
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      }
    } else if (isAsyncStorageAvailable()) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }
  } catch (error) {
    console.warn('AsyncStorage save not available, using in-memory posts store.', error);
  }
}

// Add a new post
export async function addPost(post: CricketPost): Promise<CricketPost[]> {
  const posts = await getPosts();
  const updatedPosts = [post, ...posts];
  await savePosts(updatedPosts);
  return updatedPosts;
}

// Like / unlike a post
export async function toggleLikePost(id: number): Promise<CricketPost[]> {
  const posts = await getPosts();
  const updatedPosts = posts.map(p => {
    if (p.id === id) {
      const liked = !p.liked;
      return {
        ...p,
        liked,
        likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1)
      };
    }
    return p;
  });
  await savePosts(updatedPosts);
  return updatedPosts;
}

// Save / unsave a post
export async function toggleSavePost(id: number): Promise<CricketPost[]> {
  const posts = await getPosts();
  const updatedPosts = posts.map(p => {
    if (p.id === id) {
      return {
        ...p,
        saved: !p.saved
      };
    }
    return p;
  });
  await savePosts(updatedPosts);
  return updatedPosts;
}

// Add a comment to a post
export async function addCommentToPost(postId: number, comment: CricketComment): Promise<{ posts: CricketPost[], updatedPost: CricketPost | null }> {
  const posts = await getPosts();
  let updatedPost: CricketPost | null = null;
  const updatedPosts = posts.map(p => {
    if (p.id === postId) {
      const list = p.commentsList || [];
      const updatedList = [...list, comment];
      updatedPost = {
        ...p,
        comments: updatedList.length,
        commentsList: updatedList
      };
      return updatedPost;
    }
    return p;
  });
  await savePosts(updatedPosts);
  return { posts: updatedPosts, updatedPost };
}

// Increment shares on a post
export async function incrementShares(id: number): Promise<CricketPost[]> {
  const posts = await getPosts();
  const updatedPosts = posts.map(p => {
    if (p.id === id) {
      return {
        ...p,
        shares: p.shares + 1
      };
    }
    return p;
  });
  await savePosts(updatedPosts);
  return updatedPosts;
}

// Delete a post
export async function deletePost(id: number): Promise<CricketPost[]> {
  const posts = await getPosts();
  const updatedPosts = posts.filter(p => p.id !== id);
  await savePosts(updatedPosts);
  return updatedPosts;
}
