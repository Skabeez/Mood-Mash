/**
 * Database Service
 * Handles all database operations for the music recommendation app
 * Uses Supabase for data persistence
 */

import { supabase as supabaseClient } from './api/supabase';
import { Recommendation } from '@/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Type assertion for non-null supabase (throws if not initialized)
const supabase = supabaseClient as SupabaseClient;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  lastfmUsername?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  favoriteGenres: string[];
  favoriteMoods: string[];
  topArtists: string[];
  explicitFilter: boolean;
  updatedAt: Date;
}

export interface SavedRecommendation {
  id: string;
  userId: string;
  sessionId: string;
  userMessage: string;
  aiResponse: string;
  recommendationData: Recommendation[];
  createdAt: Date;
}

export interface Highlight {
  id: string;
  userId: string;
  recommendationId?: string;
  youtubeId: string;
  title: string;
  artist: string;
  albumArt?: string;
  moodTags: string[];
  context?: string;
  createdAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  youtubeId: string;
  title: string;
  artist: string;
  albumArt?: string;
  addedAt: Date;
}

export interface UserStats {
  totalHighlights: number;
  totalFavorites: number;
  genresExplored: number;
  totalRecommendations: number;
}

// ============================================================================
// DATABASE SERVICE CLASS
// ============================================================================

class DatabaseService {
  private isDev = __DEV__;

  /**
   * Log database operations in development mode
   */
  private log(operation: string, data?: any) {
    if (this.isDev) {
      console.log(`[DatabaseService] ${operation}`, data || '');
    }
  }

  /**
   * Handle database errors with proper logging
   */
  private handleError(operation: string, error: any): never {
    console.error(`[DatabaseService] ${operation} failed:`, error);
    throw new Error(`Database operation failed: ${operation}`);
  }

  // ==========================================================================
  // USER MANAGEMENT
  // ==========================================================================

  /**
   * Create a new user profile
   * Called automatically after signup via database trigger
   * This method is for manual profile creation if needed
   */
  async createUserProfile(
    userId: string,
    username: string,
    email: string
  ): Promise<UserProfile> {
    this.log('createUserProfile', { userId, username, email });

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          username,
          email,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default preferences
      await supabase.from('user_preferences').insert({
        user_id: userId,
      });

      return this.mapUserProfile(data);
    } catch (error) {
      this.handleError('createUserProfile', error);
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    this.log('getUserProfile', { userId });

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return this.mapUserProfile(data);
    } catch (error) {
      this.handleError('getUserProfile', error);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
  ): Promise<UserProfile> {
    this.log('updateUserProfile', { userId, data });

    try {
      const updateData: any = {};
      if (data.username) updateData.username = data.username;
      if (data.email) updateData.email = data.email;
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
      if (data.lastfmUsername !== undefined) {
        updateData.lastfm_username = data.lastfmUsername;
      }

      const { data: updated, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapUserProfile(updated);
    } catch (error) {
      this.handleError('updateUserProfile', error);
    }
  }

  /**
   * Connect Last.fm account to user profile
   */
  async connectLastFm(userId: string, lastfmUsername: string): Promise<void> {
    this.log('connectLastFm', { userId, lastfmUsername });

    try {
      const { error } = await supabase
        .from('users')
        .update({ lastfm_username: lastfmUsername })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      this.handleError('connectLastFm', error);
    }
  }

  // ==========================================================================
  // USER PREFERENCES
  // ==========================================================================

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    this.log('getUserPreferences', { userId });

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Create default preferences if none exist
          return await this.createDefaultPreferences(userId);
        }
        throw error;
      }

      return this.mapUserPreferences(data);
    } catch (error) {
      this.handleError('getUserPreferences', error);
    }
  }

  /**
   * Create default preferences for a user
   */
  private async createDefaultPreferences(
    userId: string
  ): Promise<UserPreferences> {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({ user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return this.mapUserPreferences(data);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<Omit<UserPreferences, 'id' | 'userId' | 'updatedAt'>>
  ): Promise<UserPreferences> {
    this.log('updatePreferences', { userId, preferences });

    try {
      const updateData: any = {};
      if (preferences.favoriteGenres) {
        updateData.favorite_genres = preferences.favoriteGenres;
      }
      if (preferences.favoriteMoods) {
        updateData.favorite_moods = preferences.favoriteMoods;
      }
      if (preferences.topArtists) {
        updateData.top_artists = preferences.topArtists;
      }
      if (preferences.explicitFilter !== undefined) {
        updateData.explicit_filter = preferences.explicitFilter;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.mapUserPreferences(data);
    } catch (error) {
      this.handleError('updatePreferences', error);
    }
  }

  /**
   * Add a favorite genre to user preferences
   */
  async addFavoriteGenre(userId: string, genre: string): Promise<void> {
    this.log('addFavoriteGenre', { userId, genre });

    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) throw new Error('User preferences not found');

      if (!prefs.favoriteGenres.includes(genre)) {
        await this.updatePreferences(userId, {
          favoriteGenres: [...prefs.favoriteGenres, genre],
        });
      }
    } catch (error) {
      this.handleError('addFavoriteGenre', error);
    }
  }

  /**
   * Remove a favorite genre from user preferences
   */
  async removeFavoriteGenre(userId: string, genre: string): Promise<void> {
    this.log('removeFavoriteGenre', { userId, genre });

    try {
      const prefs = await this.getUserPreferences(userId);
      if (!prefs) throw new Error('User preferences not found');

      await this.updatePreferences(userId, {
        favoriteGenres: prefs.favoriteGenres.filter((g) => g !== genre),
      });
    } catch (error) {
      this.handleError('removeFavoriteGenre', error);
    }
  }

  // ==========================================================================
  // RECOMMENDATIONS
  // ==========================================================================

  /**
   * Save a recommendation to the database
   * Returns the recommendation ID
   */
  async saveRecommendation(
    userId: string,
    sessionId: string,
    data: {
      userMessage: string;
      aiResponse: string;
      recommendations: Recommendation[];
    }
  ): Promise<string> {
    this.log('saveRecommendation', { userId, sessionId });

    try {
      const { data: saved, error } = await supabase
        .from('recommendations')
        .insert({
          user_id: userId,
          session_id: sessionId,
          user_message: data.userMessage,
          ai_response: data.aiResponse,
          recommendation_data: data.recommendations,
        })
        .select()
        .single();

      if (error) throw error;

      return saved.id;
    } catch (error) {
      this.handleError('saveRecommendation', error);
    }
  }

  /**
   * Get recommendation history for a user
   */
  async getRecommendationHistory(
    userId: string,
    limit: number = 50
  ): Promise<SavedRecommendation[]> {
    this.log('getRecommendationHistory', { userId, limit });

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(this.mapSavedRecommendation);
    } catch (error) {
      this.handleError('getRecommendationHistory', error);
    }
  }

  /**
   * Get a specific recommendation by ID
   */
  async getRecommendationById(id: string): Promise<SavedRecommendation | null> {
    this.log('getRecommendationById', { id });

    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapSavedRecommendation(data);
    } catch (error) {
      this.handleError('getRecommendationById', error);
    }
  }

  // ==========================================================================
  // HIGHLIGHTS
  // ==========================================================================

  /**
   * Save a highlight track
   */
  async saveHighlight(
    userId: string,
    recommendation: Recommendation,
    context?: string
  ): Promise<Highlight> {
    this.log('saveHighlight', { userId, recommendation, context });

    try {
      // Extract mood tags from recommendation type
      const moodTags: string[] = [];
      if (recommendation.type === 'highlight') moodTags.push('highlight');
      if (recommendation.type === 'deep-cut') moodTags.push('deep-cut');
      if (recommendation.type === 'mainstream') moodTags.push('mainstream');

      const { data, error } = await supabase
        .from('highlights')
        .insert({
          user_id: userId,
          youtube_id: recommendation.youtubeId,
          title: recommendation.title,
          artist: recommendation.artist,
          album_art: recommendation.albumArt,
          mood_tags: moodTags,
          context,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapHighlight(data);
    } catch (error) {
      this.handleError('saveHighlight', error);
    }
  }

  /**
   * Get user's highlights
   */
  async getHighlights(userId: string, limit: number = 50): Promise<Highlight[]> {
    this.log('getHighlights', { userId, limit });

    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(this.mapHighlight);
    } catch (error) {
      this.handleError('getHighlights', error);
    }
  }

  /**
   * Delete a highlight
   */
  async deleteHighlight(id: string): Promise<void> {
    this.log('deleteHighlight', { id });

    try {
      const { error } = await supabase.from('highlights').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.handleError('deleteHighlight', error);
    }
  }

  // ==========================================================================
  // FAVORITES
  // ==========================================================================

  /**
   * Add a song to favorites
   */
  async addFavorite(userId: string, song: Recommendation): Promise<Favorite> {
    this.log('addFavorite', { userId, song });

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          youtube_id: song.youtubeId,
          title: song.title,
          artist: song.artist,
          album_art: song.albumArt,
        })
        .select()
        .single();

      if (error) {
        // Check if already exists (unique constraint violation)
        if (error.code === '23505') {
          throw new Error('Song already in favorites');
        }
        throw error;
      }

      return this.mapFavorite(data);
    } catch (error) {
      if (error instanceof Error && error.message === 'Song already in favorites') {
        throw error;
      }
      this.handleError('addFavorite', error);
    }
  }

  /**
   * Get user's favorite songs
   */
  async getFavorites(userId: string): Promise<Favorite[]> {
    this.log('getFavorites', { userId });

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapFavorite);
    } catch (error) {
      this.handleError('getFavorites', error);
    }
  }

  /**
   * Remove a song from favorites
   */
  async removeFavorite(id: string): Promise<void> {
    this.log('removeFavorite', { id });

    try {
      const { error } = await supabase.from('favorites').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      this.handleError('removeFavorite', error);
    }
  }

  /**
   * Check if a song is in favorites
   */
  async isFavorite(userId: string, youtubeId: string): Promise<boolean> {
    this.log('isFavorite', { userId, youtubeId });

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('youtube_id', youtubeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return false;
        throw error;
      }

      return !!data;
    } catch (error) {
      this.handleError('isFavorite', error);
    }
  }

  // ==========================================================================
  // STATISTICS
  // ==========================================================================

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    this.log('getUserStats', { userId });

    try {
      // Get total highlights
      const { count: highlightsCount, error: highlightsError } = await supabase
        .from('highlights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (highlightsError) throw highlightsError;

      // Get total favorites
      const { count: favoritesCount, error: favoritesError } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (favoritesError) throw favoritesError;

      // Get total recommendations
      const { count: recommendationsCount, error: recommendationsError } =
        await supabase
          .from('recommendations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

      if (recommendationsError) throw recommendationsError;

      // Get genres explored from preferences
      const prefs = await this.getUserPreferences(userId);
      const genresExplored = prefs?.favoriteGenres.length || 0;

      return {
        totalHighlights: highlightsCount || 0,
        totalFavorites: favoritesCount || 0,
        genresExplored,
        totalRecommendations: recommendationsCount || 0,
      };
    } catch (error) {
      this.handleError('getUserStats', error);
    }
  }

  // ==========================================================================
  // MAPPING FUNCTIONS
  // Convert database rows to TypeScript types
  // ==========================================================================

  private mapUserProfile(data: any): UserProfile {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      avatarUrl: data.avatar_url,
      lastfmUsername: data.lastfm_username,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapUserPreferences(data: any): UserPreferences {
    return {
      id: data.id,
      userId: data.user_id,
      favoriteGenres: data.favorite_genres || [],
      favoriteMoods: data.favorite_moods || [],
      topArtists: data.top_artists || [],
      explicitFilter: data.explicit_filter || false,
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapSavedRecommendation(data: any): SavedRecommendation {
    return {
      id: data.id,
      userId: data.user_id,
      sessionId: data.session_id,
      userMessage: data.user_message,
      aiResponse: data.ai_response,
      recommendationData: data.recommendation_data,
      createdAt: new Date(data.created_at),
    };
  }

  private mapHighlight(data: any): Highlight {
    return {
      id: data.id,
      userId: data.user_id,
      recommendationId: data.recommendation_id,
      youtubeId: data.youtube_id,
      title: data.title,
      artist: data.artist,
      albumArt: data.album_art,
      moodTags: data.mood_tags || [],
      context: data.context,
      createdAt: new Date(data.created_at),
    };
  }

  private mapFavorite(data: any): Favorite {
    return {
      id: data.id,
      userId: data.user_id,
      youtubeId: data.youtube_id,
      title: data.title,
      artist: data.artist,
      albumArt: data.album_art,
      addedAt: new Date(data.added_at),
    };
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
