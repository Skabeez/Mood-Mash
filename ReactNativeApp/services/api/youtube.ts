/**
 * YouTube Data API Client
 * Handles communication with YouTube API for music video search and playback
 */

import { env } from '@/config/env';
import {
  YouTubeVideo,
  YouTubeVideoDetails,
  YouTubeSearchResponse,
  YouTubeVideoDetailsResponse,
  YouTubeError,
  ApiError,
} from '@/types/api';

const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MUSIC_CATEGORY_ID = '10'; // YouTube Music category

// Quota tracking (YouTube has daily quota limits)
let apiCallCount = 0;
const QUOTA_WARNING_THRESHOLD = 9000; // Warn at 90% of typical 10,000 daily quota

export class YouTubeClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.youtubeApiKey;
    this.baseURL = YOUTUBE_API_URL;

    if (this.apiKey === 'dev_placeholder') {
      console.warn('⚠️  YouTube API key not configured. Using mock data.');
    }
  }

  /**
   * Searches for music videos on YouTube
   */
  async searchMusic(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockVideos(query, maxResults);
    }

    try {
      this.trackApiCall('search', 100); // Search costs 100 quota units

      if (env.isDevelopment) {
        console.log(`🎥 Searching YouTube for: ${query}`);
      }

      const params = {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: MUSIC_CATEGORY_ID,
        maxResults: maxResults.toString(),
        key: this.apiKey,
      };

      const url = `${this.baseURL}/search?${new URLSearchParams(params)}`;
      const response = await this.makeRequest<YouTubeSearchResponse>(url);

      const videos: YouTubeVideo[] = response.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
      }));

      if (env.isDevelopment) {
        console.log(`✅ Found ${videos.length} videos`);
      }

      return videos;
    } catch (error) {
      throw this.handleError(error, 'searchMusic');
    }
  }

  /**
   * Gets detailed information about a video
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails> {
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockVideoDetails(videoId);
    }

    try {
      this.trackApiCall('videos', 1); // Videos endpoint costs 1 quota unit

      if (env.isDevelopment) {
        console.log(`📹 Fetching details for video: ${videoId}`);
      }

      const params = {
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: this.apiKey,
      };

      const url = `${this.baseURL}/videos?${new URLSearchParams(params)}`;
      const response = await this.makeRequest<YouTubeVideoDetailsResponse>(url);

      if (!response.items || response.items.length === 0) {
        throw new Error('Video not found');
      }

      const item = response.items[0];
      const details: YouTubeVideoDetails = {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        publishedAt: item.snippet.publishedAt,
      };

      if (env.isDevelopment) {
        console.log(`✅ Got video details: ${details.title}`);
      }

      return details;
    } catch (error) {
      throw this.handleError(error, 'getVideoDetails');
    }
  }

  /**
   * Searches for a specific artist and track combination
   */
  async searchByArtistAndTrack(artist: string, track: string): Promise<string | null> {
    try {
      const query = `${artist} ${track} official audio`;
      const videos = await this.searchMusic(query, 1);

      if (videos.length === 0) {
        return null;
      }

      if (env.isDevelopment) {
        console.log(`✅ Found video for "${artist} - ${track}": ${videos[0].id}`);
      }

      return videos[0].id;
    } catch (error) {
      console.error('Error searching by artist and track:', error);
      return null;
    }
  }

  /**
   * Makes API request to YouTube
   */
  private async makeRequest<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: YouTubeError = await response.json();
        throw new Error(
          errorData.error?.message || `YouTube API error: ${response.status}`
        );
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout - YouTube API took too long to respond');
      }

      throw error;
    }
  }

  /**
   * Parses ISO 8601 duration to readable format
   */
  private parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Tracks API calls for quota management
   */
  private trackApiCall(endpoint: string, cost: number): void {
    apiCallCount += cost;

    if (env.isDevelopment) {
      console.log(`📊 YouTube API Quota: ${apiCallCount} units used`);
    }

    if (apiCallCount >= QUOTA_WARNING_THRESHOLD) {
      console.warn(
        `⚠️  YouTube API quota warning: ${apiCallCount} units used. ` +
        `Approaching daily limit of 10,000 units.`
      );
    }
  }

  /**
   * Gets current quota usage
   */
  getQuotaUsage(): number {
    return apiCallCount;
  }

  /**
   * Resets quota counter (call this at midnight UTC)
   */
  resetQuota(): void {
    apiCallCount = 0;
    if (env.isDevelopment) {
      console.log('🔄 YouTube API quota reset');
    }
  }

  /**
   * Handles and formats errors
   */
  private handleError(error: unknown, method: string): ApiError {
    if (error instanceof Error) {
      const message = error.message;

      if (message.includes('quotaExceeded') || message.includes('403')) {
        return {
          message: 'YouTube API quota exceeded. Please try again tomorrow.',
          code: 'QUOTA_EXCEEDED',
          status: 403,
        };
      }

      if (message.includes('keyInvalid') || message.includes('400')) {
        return {
          message: 'Invalid YouTube API key',
          code: 'INVALID_KEY',
          status: 400,
        };
      }

      return {
        message: `YouTube ${method} error: ${message}`,
        code: 'YOUTUBE_ERROR',
      };
    }

    return {
      message: `Unknown error in YouTube ${method}`,
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Mock data for development
   */
  private getMockVideos(query: string, maxResults: number): YouTubeVideo[] {
    return Array.from({ length: Math.min(maxResults, 3) }, (_, i) => ({
      id: `mock_video_${i}`,
      title: `${query} - Result ${i + 1}`,
      thumbnail: `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop`,
      channelTitle: `Artist ${i + 1}`,
      publishedAt: new Date().toISOString(),
    }));
  }

  private getMockVideoDetails(videoId: string): YouTubeVideoDetails {
    return {
      id: videoId,
      title: 'Mock Video Title',
      description: 'This is a mock video description for development.',
      thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      channelTitle: 'Mock Artist',
      duration: '4:32',
      viewCount: '1000000',
      likeCount: '50000',
      publishedAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const youtubeClient = new YouTubeClient();
