/**
 * API Services Index
 * Central export point for all API clients
 */

export { DeepSeekClient, deepseekClient } from './deepseek';
export { LastFmClient, lastfmClient } from './lastfm';
export { YouTubeClient, youtubeClient } from './youtube';
export {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  getCurrentSession,
  getUserProfile,
  updateUserProfile,
  onAuthStateChange,
  saveFavoriteSong,
  removeFavoriteSong,
  getUserFavorites,
} from './supabase';

// Re-export recommendation engine
export { RecommendationEngine, recommendationEngine } from '../recommendationEngine';
export type { UserProfile, RecommendationResult } from '../recommendationEngine';

// Re-export database service
export { databaseService } from '../database';
export type {
  UserProfile as DBUserProfile,
  UserPreferences,
  SavedRecommendation,
  Highlight,
  Favorite,
  UserStats,
} from '../database';
