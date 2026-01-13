/**
 * Recommendation Engine
 * Orchestrates all API clients to generate personalized music recommendations
 */

import { groqClient } from './api/groq';
import { lastfmClient } from './api/lastfm';
import { youtubeClient } from './api/youtube';
import { Message, Recommendation, RecommendationType } from '@/types';
import { DeepSeekIntent, YouTubeVideo } from '@/types/api';
import { env } from '@/config/env';

// ============================================================================
// Types
// ============================================================================

export interface UserProfile {
  id?: string;
  username?: string;
  favoriteGenres?: string[];
  favoriteMoods?: string[];
  lastfmUsername?: string;
  favoriteArtists?: string[];
}

export interface RecommendationResult {
  aiResponse: string;
  recommendations: Recommendation[];
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// ============================================================================
// Cache Configuration
// ============================================================================

const CACHE_DURATION = {
  LASTFM: 5 * 60 * 1000, // 5 minutes
  YOUTUBE: 10 * 60 * 1000, // 10 minutes
};

const cache = {
  lastfm: new Map<string, CacheEntry<any>>(),
  youtube: new Map<string, CacheEntry<YouTubeVideo[]>>(),
};

// ============================================================================
// Recommendation Engine Class
// ============================================================================

export class RecommendationEngine {
  /**
   * Generates personalized music recommendations based on user message and profile
   */
  async generateRecommendations(
    userMessage: string,
    userProfile: UserProfile,
    conversationHistory: Message[] = []
  ): Promise<RecommendationResult> {
    try {
      if (env.isDevelopment) {
        console.log('🎯 Starting recommendation generation...');
        console.log('User message:', userMessage);
      }

      // Step 1: Extract intent from user message
      const intent = await groqClient.extractIntent(userMessage);
      if (env.isDevelopment) {
        console.log('📊 Extracted intent:', intent);
      }

      // Step 2: Generate seed tracks based on intent
      const seedArtists = await this.generateSeedArtists(intent, userProfile);
      if (env.isDevelopment) {
        console.log('🎵 Seed artists:', seedArtists);
      }

      // Step 3: Search for tracks on YouTube
      const allTracks = await this.searchTracksForArtists(seedArtists, intent);
      if (env.isDevelopment) {
        console.log(`🔍 Found ${allTracks.length} total tracks`);
      }

      // Step 4: Categorize tracks
      const highlight = await this.selectHighlight(allTracks, intent);
      const excludeIds = [highlight.id];
      
      const deepCuts = await this.selectDeepCuts(allTracks, excludeIds);
      excludeIds.push(...deepCuts.map(r => r.id));
      
      const mainstream = await this.selectMainstream(allTracks, excludeIds);

      const recommendations: Recommendation[] = [
        highlight,
        ...deepCuts.slice(0, 3), // Take top 3 deep cuts
        ...mainstream.slice(0, 3), // Take top 3 mainstream
      ];

      if (env.isDevelopment) {
        console.log(`✅ Generated ${recommendations.length} recommendations`);
        console.log(`  - 1 highlight, ${deepCuts.length} deep cuts, ${mainstream.length} mainstream`);
      }

      // Step 5: Generate AI response
      const aiResponse = await this.generateAIResponse(
        userMessage,
        recommendations,
        intent,
        conversationHistory
      );

      return {
        aiResponse,
        recommendations,
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback to generic recommendations
      return this.getFallbackRecommendations(userMessage, conversationHistory);
    }
  }

  /**
   * Generates seed artists based on user intent and profile
   */
  private async generateSeedArtists(
    intent: DeepSeekIntent,
    userProfile: UserProfile
  ): Promise<string[]> {
    const seedArtists: string[] = [];

    // If specific artist mentioned, get similar artists
    if (intent.artist) {
      try {
        const similar = await this.getCachedLastFmData(
          `similar_${intent.artist}`,
          () => lastfmClient.getSimilarArtists(intent.artist!, 10)
        );
        seedArtists.push(intent.artist, ...similar.slice(0, 5));
      } catch (error) {
        console.error('Error getting similar artists:', error);
        seedArtists.push(intent.artist);
      }
    }

    // If user has Last.fm, get their top artists
    if (userProfile.lastfmUsername && seedArtists.length < 5) {
      try {
        const topArtists = await this.getCachedLastFmData(
          `top_${userProfile.lastfmUsername}`,
          () => lastfmClient.getUserTopArtists(userProfile.lastfmUsername!, 10)
        );
        seedArtists.push(...topArtists.slice(0, 5 - seedArtists.length));
      } catch (error) {
        console.error('Error getting user top artists:', error);
      }
    }

    // If user has favorite artists
    if (userProfile.favoriteArtists && seedArtists.length < 5) {
      seedArtists.push(...userProfile.favoriteArtists.slice(0, 5 - seedArtists.length));
    }

    // Use mood/genre mapping as fallback
    if (seedArtists.length < 5) {
      const genres = this.getGenresForIntent(intent, userProfile);
      const genericArtists = this.getArtistsForGenres(genres);
      seedArtists.push(...genericArtists.slice(0, 5 - seedArtists.length));
    }

    // Remove duplicates
    return [...new Set(seedArtists)].slice(0, 10);
  }

  /**
   * Searches for tracks on YouTube for given artists
   */
  private async searchTracksForArtists(
    artists: string[],
    intent: DeepSeekIntent
  ): Promise<YouTubeVideo[]> {
    const allTracks: YouTubeVideo[] = [];
    const searchPromises: Promise<YouTubeVideo[]>[] = [];

    for (const artist of artists) {
      // Build search query based on intent
      let query = artist;
      if (intent.mood) query += ` ${intent.mood}`;
      if (intent.genre) query += ` ${intent.genre}`;
      query += ' music';

      // Check cache first
      const cached = this.getCachedYouTubeData(query);
      if (cached) {
        allTracks.push(...cached);
        continue;
      }

      // Search YouTube
      searchPromises.push(
        youtubeClient.searchMusic(query, 5).then((videos) => {
          this.cacheYouTubeData(query, videos);
          return videos;
        }).catch((error) => {
          console.error(`Error searching for ${query}:`, error);
          return [];
        })
      );
    }

    // Wait for all searches to complete
    const results = await Promise.all(searchPromises);
    allTracks.push(...results.flat());

    // Diversify artists
    return this.diversifyArtists(allTracks, 2);
  }

  /**
   * Selects the highlight track (most relevant)
   */
  async selectHighlight(tracks: YouTubeVideo[], intent: DeepSeekIntent): Promise<Recommendation> {
    if (tracks.length === 0) {
      return this.createFallbackRecommendation('highlight');
    }

    // Score all tracks
    const scoredTracks = tracks.map((track) => ({
      track,
      score: this.scoreTrackRelevance(track, intent),
    }));

    // Sort by score
    scoredTracks.sort((a, b) => b.score - a.score);

    return await this.convertToRecommendation(scoredTracks[0].track, 'highlight');
  }

  /**
   * Selects deep cut tracks (niche, lower view count)
   */
  async selectDeepCuts(tracks: YouTubeVideo[], exclude: string[]): Promise<Recommendation[]> {
    const available = tracks.filter((t) => !exclude.includes(t.id));
    
    if (available.length === 0) {
      return [this.createFallbackRecommendation('deep-cut')];
    }

    // Diversify and limit
    const diversified = this.diversifyArtists(available, 1);
    
    const recommendations = await Promise.all(
      diversified
        .slice(0, 5)
        .map((track) => this.convertToRecommendation(track, 'deep-cut'))
    );
    
    return recommendations;
  }

  /**
   * Selects mainstream tracks (popular, high view count)
   */
  async selectMainstream(tracks: YouTubeVideo[], exclude: string[]): Promise<Recommendation[]> {
    const available = tracks.filter((t) => !exclude.includes(t.id));
    
    if (available.length === 0) {
      return [this.createFallbackRecommendation('mainstream')];
    }

    // Diversify and limit
    const diversified = this.diversifyArtists(available, 1);
    
    const recommendations = await Promise.all(
      diversified
        .slice(0, 5)
        .map((track) => this.convertToRecommendation(track, 'mainstream'))
    );
    
    return recommendations;
  }

  /**
   * Generates conversational AI response explaining recommendations
   */
  private async generateAIResponse(
    userMessage: string,
    recommendations: Recommendation[],
    intent: DeepSeekIntent,
    conversationHistory: Message[]
  ): Promise<string> {
    try {
      // Build context for AI
      const trackList = recommendations
        .map((r, i) => `${i + 1}. "${r.title}" by ${r.artist}`)
        .join('\n');

      const contextMessage = `User said: "${userMessage}"

I've found these tracks for them:
${trackList}

Intent detected: ${JSON.stringify(intent)}

Please write a friendly, conversational response explaining why these tracks match their request. Be enthusiastic about the music!`;

      const response = await groqClient.sendMessage(contextMessage, conversationHistory);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackAIResponse(recommendations, intent);
    }
  }

  /**
   * Scores track relevance based on intent and profile
   */
  private scoreTrackRelevance(track: YouTubeVideo, intent: DeepSeekIntent): number {
    let score = 0;
    const title = track.title.toLowerCase();
    const channel = track.channelTitle.toLowerCase();

    // Title/Artist match with intent (40%)
    if (intent.artist && (title.includes(intent.artist.toLowerCase()) || channel.includes(intent.artist.toLowerCase()))) {
      score += 40;
    } else if (intent.genre && title.includes(intent.genre.toLowerCase())) {
      score += 30;
    } else if (intent.mood && title.includes(intent.mood.toLowerCase())) {
      score += 25;
    } else {
      score += 10; // Base score
    }

    // Keywords match (30%)
    const keywords = [
      intent.mood,
      intent.genre,
      intent.activity,
      intent.query,
    ].filter(Boolean);

    for (const keyword of keywords) {
      if (keyword && title.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Quality indicators (20%)
    if (title.includes('official')) score += 10;
    if (title.includes('audio') || title.includes('video')) score += 5;
    if (!title.includes('cover') && !title.includes('karaoke')) score += 5;

    // Recency (10%)
    if (track.publishedAt) {
      const daysSincePublish = (Date.now() - new Date(track.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePublish < 365) score += 10; // Recent (< 1 year)
      else if (daysSincePublish < 365 * 3) score += 5; // Somewhat recent (< 3 years)
    }

    return Math.min(score, 100);
  }

  /**
   * Ensures diversity by limiting tracks per artist
   */
  private diversifyArtists(tracks: YouTubeVideo[], maxPerArtist: number = 2): YouTubeVideo[] {
    const artistCounts = new Map<string, number>();
    const diversified: YouTubeVideo[] = [];

    for (const track of tracks) {
      const artist = track.channelTitle;
      const count = artistCounts.get(artist) || 0;

      if (count < maxPerArtist) {
        diversified.push(track);
        artistCounts.set(artist, count + 1);
      }
    }

    return diversified;
  }

  /**
   * Converts YouTube video to Recommendation type with Last.fm album art
   */
  private async convertToRecommendation(
    video: YouTubeVideo,
    type: RecommendationType
  ): Promise<Recommendation> {
    // Extract artist and title from video title
    const parts = video.title.split('-');
    const artist = parts.length > 1 ? parts[0].trim() : video.channelTitle;
    const title = parts.length > 1 ? parts.slice(1).join('-').trim() : video.title;

    // Clean up title (remove parentheses content like (Official Video), (Lyrics), etc.)
    const cleanTitle = title.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

    // Try to fetch album art from Last.fm
    let albumArt = video.thumbnail; // Fallback to YouTube thumbnail
    
    try {
      const lastfmArt = await lastfmClient.getTrackInfo(artist, cleanTitle);
      if (lastfmArt) {
        albumArt = lastfmArt;
      }
    } catch (error) {
      // Silently fall back to YouTube thumbnail
      if (env.isDevelopment) {
        console.log(`Using YouTube thumbnail for ${artist} - ${cleanTitle}`);
      }
    }

    return {
      id: video.id,
      title: cleanTitle,
      artist: artist,
      albumArt: albumArt,
      youtubeId: video.id,
      type: type,
      duration: video.duration || '0:00',
    };
  }

  /**
   * Gets genres for given intent and user profile
   */
  private getGenresForIntent(intent: DeepSeekIntent, userProfile: UserProfile): string[] {
    const genres: string[] = [];

    // Use explicit genre from intent
    if (intent.genre) {
      genres.push(intent.genre);
    }

    // Map mood to genres
    if (intent.mood) {
      const moodGenres = this.getMoodGenreMapping()[intent.mood.toLowerCase()];
      if (moodGenres) {
        genres.push(...moodGenres);
      }
    }

    // Map activity to genres
    if (intent.activity) {
      const activityGenres = this.getActivityGenreMapping()[intent.activity.toLowerCase()];
      if (activityGenres) {
        genres.push(...activityGenres);
      }
    }

    // Use user's favorite genres
    if (userProfile.favoriteGenres) {
      genres.push(...userProfile.favoriteGenres);
    }

    // Fallback to popular genres
    if (genres.length === 0) {
      genres.push('Pop', 'Rock', 'Indie');
    }

    return [...new Set(genres)].slice(0, 5);
  }

  /**
   * Gets representative artists for genres
   */
  private getArtistsForGenres(genres: string[]): string[] {
    const genreArtists: Record<string, string[]> = {
      'Pop': ['Taylor Swift', 'The Weeknd', 'Dua Lipa'],
      'Rock': ['Arctic Monkeys', 'The Strokes', 'Queens of the Stone Age'],
      'Electronic': ['Daft Punk', 'Disclosure', 'ODESZA'],
      'Indie': ['Tame Impala', 'Mac DeMarco', 'Beach House'],
      'Hip-Hop': ['Kendrick Lamar', 'J. Cole', 'Tyler, The Creator'],
      'Jazz': ['Miles Davis', 'John Coltrane', 'Bill Evans'],
      'Classical': ['Ludovico Einaudi', 'Max Richter', 'Ólafur Arnalds'],
      'Ambient': ['Brian Eno', 'Tycho', 'Boards of Canada'],
      'Alternative': ['Radiohead', 'Bon Iver', 'The National'],
      'R&B': ['Frank Ocean', 'SZA', 'Daniel Caesar'],
    };

    const artists: string[] = [];
    for (const genre of genres) {
      const genreArtist = genreArtists[genre];
      if (genreArtist) {
        artists.push(...genreArtist);
      }
    }

    return artists.length > 0 ? artists : ['Radiohead', 'Bon Iver', 'Arctic Monkeys'];
  }

  /**
   * Mood to genre mapping
   */
  getMoodGenreMapping(): Record<string, string[]> {
    return {
      'energetic': ['Electronic', 'Rock', 'Pop', 'Dance'],
      'chill': ['Lo-fi', 'Jazz', 'Acoustic', 'Ambient'],
      'relax': ['Ambient', 'Classical', 'Jazz'],
      'focus': ['Classical', 'Ambient', 'Instrumental', 'Lo-fi'],
      'happy': ['Pop', 'Dance', 'Funk', 'Indie'],
      'sad': ['Indie', 'Alternative', 'Singer-Songwriter', 'Acoustic'],
      'melancholic': ['Indie', 'Alternative', 'Ambient'],
      'upbeat': ['Pop', 'Dance', 'Electronic', 'Funk'],
      'angry': ['Rock', 'Metal', 'Hip-Hop'],
      'romantic': ['R&B', 'Soul', 'Jazz', 'Acoustic'],
    };
  }

  /**
   * Activity to genre mapping
   */
  private getActivityGenreMapping(): Record<string, string[]> {
    return {
      'workout': ['Hip-Hop', 'EDM', 'Rock', 'Electronic'],
      'gym': ['Hip-Hop', 'EDM', 'Rock'],
      'study': ['Classical', 'Ambient', 'Lo-fi', 'Instrumental'],
      'work': ['Classical', 'Ambient', 'Jazz', 'Lo-fi'],
      'focus': ['Classical', 'Ambient', 'Instrumental'],
      'sleep': ['Ambient', 'Classical', 'Acoustic'],
      'party': ['Dance', 'Pop', 'Hip-Hop', 'Electronic'],
      'drive': ['Rock', 'Indie', 'Electronic'],
      'relax': ['Ambient', 'Jazz', 'Acoustic', 'Classical'],
    };
  }

  /**
   * Cache helper for Last.fm data
   */
  private async getCachedLastFmData<T>(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = cache.lastfm.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION.LASTFM) {
      return cached.data;
    }

    const data = await fetcher();
    cache.lastfm.set(key, { data, timestamp: now });
    return data;
  }

  /**
   * Cache helper for YouTube data
   */
  private getCachedYouTubeData(query: string): YouTubeVideo[] | null {
    const cached = cache.youtube.get(query);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION.YOUTUBE) {
      return cached.data;
    }

    return null;
  }

  /**
   * Cache YouTube search results
   */
  private cacheYouTubeData(query: string, videos: YouTubeVideo[]): void {
    cache.youtube.set(query, { data: videos, timestamp: Date.now() });
  }

  /**
   * Creates fallback recommendation
   */
  private createFallbackRecommendation(type: RecommendationType): Recommendation {
    const fallbacks = [
      {
        id: 'fallback_1',
        title: 'Weightless',
        artist: 'Marconi Union',
        albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
        youtubeId: 'UfcAVejslrU',
        duration: '8:08',
      },
      {
        id: 'fallback_2',
        title: 'Holocene',
        artist: 'Bon Iver',
        albumArt: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=400&h=400&fit=crop',
        youtubeId: 'TWcyIpul8OE',
        duration: '5:36',
      },
      {
        id: 'fallback_3',
        title: 'Intro',
        artist: 'The xx',
        albumArt: 'https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=400&h=400&fit=crop',
        youtubeId: 'KmrRXU-fBx0',
        duration: '2:12',
      },
    ];

    const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return { ...randomFallback, type };
  }

  /**
   * Fallback AI response
   */
  private getFallbackAIResponse(recommendations: Recommendation[], intent: DeepSeekIntent): string {
    const highlight = recommendations.find(r => r.type === 'highlight');
    
    let response = "I've found some great music for you! ";

    if (highlight) {
      response += `\n\n✨ **Highlight Pick:** "${highlight.title}" by ${highlight.artist}`;
    }

    if (intent.mood) {
      response += `\n\nThese tracks match your ${intent.mood} mood perfectly.`;
    } else if (intent.activity) {
      response += `\n\nPerfect for ${intent.activity}!`;
    }

    response += "\n\nLet me know what you think, or ask for more recommendations! 🎵";

    return response;
  }

  /**
   * Fallback recommendations when everything fails
   */
  private async getFallbackRecommendations(
    userMessage: string,
    conversationHistory: Message[]
  ): Promise<RecommendationResult> {
    const recommendations: Recommendation[] = [
      this.createFallbackRecommendation('highlight'),
      this.createFallbackRecommendation('deep-cut'),
      this.createFallbackRecommendation('mainstream'),
    ];

    let aiResponse: string;
    try {
      aiResponse = await groqClient.sendMessage(userMessage, conversationHistory);
    } catch {
      aiResponse = "I've found some great music for you! These are some popular tracks that many people enjoy. Let me know what you think! 🎵";
    }

    return { aiResponse, recommendations };
  }

  /**
   * Clears all caches
   */
  clearCache(): void {
    cache.lastfm.clear();
    cache.youtube.clear();
    if (env.isDevelopment) {
      console.log('🗑️  Cache cleared');
    }
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();
