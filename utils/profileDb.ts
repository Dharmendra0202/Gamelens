import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@gamelens_profile';

export interface Profile {
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
}

const initialProfile: Profile = {
  name: 'Dharmendra Vishwakarma',
  phone: '8383999973',
  role: 'All-rounder',
  location: 'Mumbai',
  battingStyle: 'Right hand bat',
  bowlingStyle: 'Medium pace',
  friends: '125',
  posts: '0', // Start with 0 posts
  imageUri: '',
  bannerUri: '',
  matches: '47',
  runs: '1048',
  wickets: '34',
  isPublic: true,
  showStats: true,
  isLookingForTeam: true,
};

let memoryProfile: Profile = initialProfile;

const isAsyncStorageAvailable = () => {
  return typeof AsyncStorage !== 'undefined' && AsyncStorage !== null;
};

export async function getProfile(): Promise<Profile> {
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          memoryProfile = JSON.parse(data) as Profile;
          return memoryProfile;
        }
      }
    } else if (isAsyncStorageAvailable()) {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        memoryProfile = JSON.parse(data) as Profile;
        return memoryProfile;
      }
    }
  } catch (error) {
    console.warn('AsyncStorage not available, using in-memory profile store.', error);
  }
  return memoryProfile;
}

export async function saveProfile(profile: Profile): Promise<void> {
  memoryProfile = profile;
  try {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } else if (isAsyncStorageAvailable()) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  } catch (error) {
    console.warn('AsyncStorage save not available, using in-memory profile store.', error);
  }
}
