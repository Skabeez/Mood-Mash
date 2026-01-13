/**
 * Last.fm API Client
 * Handles communication with Last.fm API for music data and user listening history
 */

import { env } from '@/config/env';
import {
  LastFmArtist,
  LastFmTrack,
  LastFmTopArtistsResponse,
  LastFmSimilarArtistsResponse,
  LastFmTopTracksResponse,
  LastFmTrackSearchResponse,
  LastFmTrackInfoResponse,
  LastFmError,
  ApiError,
} from '@/types/api';

const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const REQUEST_TIMEOUT = 10000; // 10 seconds

export class LastFmClient {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.lastfmApiKey;
    this.baseURL = LASTFM_API_URL;

    if (this.apiKey === 'dev_placeholder') {
      console.warn('⚠️  Last.fm API key not configured. Using mock data.');
    }
  }

  /**
   * Gets user's top artists from Last.fm
   */
  async getUserTopArtists(username: string, limit: number = 10): Promise<string[]> {
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockArtists(limit);
    }

    try {
      if (env.isDevelopment) {
        console.log(`🎵 Fetching top artists for user: ${username}`);
      }

      const params = {
        method: 'user.gettopartists',
        user: username,
        limit: limit.toString(),
        api_key: this.apiKey,
        format: 'json',
      };

      const response = await this.makeRequest<LastFmTopArtistsResponse>(params);
      
      const artists = response.topartists.artist.map((artist) => artist.name);

      if (env.isDevelopment) {
        console.log(`✅ Found ${artists.length} top artists`);
      }

      return artists;
    } catch (error) {
      throw this.handleError(error, 'getUserTopArtists');
    }
  }

  /**
   * Gets similar artists from Last.fm
   */
  async getSimilarArtists(artist: string, limit: number = 20): Promise<string[]> {
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockSimilarArtists(artist, limit);
    }

    try {
      if (env.isDevelopment) {
        console.log(`🔍 Finding similar artists to: ${artist}`);
      }

      const params = {
        method: 'artist.getsimilar',
        artist: artist,
        limit: limit.toString(),
        api_key: this.apiKey,
        format: 'json',
      };

      const response = await this.makeRequest<LastFmSimilarArtistsResponse>(params);
      
      const similarArtists = response.similarartists.artist.map((a) => a.name);

      if (env.isDevelopment) {
        console.log(`✅ Found ${similarArtists.length} similar artists`);
      }

      return similarArtists;
    } catch (error) {
      throw this.handleError(error, 'getSimilarArtists');
    }
  }

  /**
   * Gets top tracks for an artist
   */
  async getTopTracks(artist: string, limit: number = 10): Promise<LastFmTrack[]> {
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockTracks(artist, limit);
    }

    try {
      if (env.isDevelopment) {
        console.log(`🎼 Fetching top tracks for: ${artist}`);
      }

      const params = {
        method: 'artist.gettoptracks',
        artist: artist,
        limit: limit.toString(),
        api_key: this.apiKey,
        format: 'json',
      };

      const response = await this.makeRequest<LastFmTopTracksResponse>(params);
      
      const tracks = response.toptracks.track.map((track) => ({
        name: track.name,
        artist: typeof track.artist === 'string' ? track.artist : track.artist.name,
        playcount: track.playcount,
        listeners: track.listeners,
        url: track.url,
      }));

      if (env.isDevelopment) {
        console.log(`✅ Found ${tracks.length} top tracks`);
      }

      return tracks;
    } catch (error) {
      throw this.handleError(error, 'getTopTracks');
    }
  }

  /**
   * Searches for tracks matching query
   */
  async searchTrack(query: string, limit: number = 10): Promise<LastFmTrack[]> {
    if (this.apiKey === 'dev_placeholder') {
      return this.getMockSearchResults(query, limit);
    }

    try {
      if (env.isDevelopment) {
        console.log(`🔎 Searching tracks: ${query}`);
      }

      const params = {
        method: 'track.search',
        track: query,
        limit: limit.toString(),
        api_key: this.apiKey,
        format: 'json',
      };

      const response = await this.makeRequest<LastFmTrackSearchResponse>(params);
      
      const tracks = response.results.trackmatches.track.map((track) => ({
        name: track.name,
        artist: typeof track.artist === 'string' ? track.artist : track.artist.name,
        url: track.url,
      }));

      if (env.isDevelopment) {
        console.log(`✅ Found ${tracks.length} matching tracks`);
      }

      return tracks;
    } catch (error) {
      throw this.handleError(error, 'searchTrack');
    }
  }

  /**
   * Gets detailed track information including album art
   */
  async getTrackInfo(artist: string, track: string): Promise<string | null> {
    if (this.apiKey === 'dev_placeholder') {
      return null;
    }

    try {
      const params = {
        method: 'track.getInfo',
        artist: artist,
        track: track,
        api_key: this.apiKey,
        format: 'json',
      };

      const response = await this.makeRequest<LastFmTrackInfoResponse>(params);
      
      // Get the highest quality image available
      const images = response.track.album?.image || [];
      const largeImage = images.find(img => img.size === 'extralarge' || img.size === 'large');
      
      if (largeImage && largeImage['#text']) {
        return largeImage['#text'];
      }

      return null;
    } catch (error) {
      // Don't throw error for album art - it's optional
      if (env.isDevelopment) {
        console.log(`⚠️  Could not fetch album art for ${artist} - ${track}`);
      }
      return null;
    }
  }

  /**
   * Makes API request to Last.fm
   */
  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    const url = new URL(this.baseURL);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`);
      }

      const data = await response.json();

      // Check for Last.fm API errors
      if ('error' in data) {
        const error = data as LastFmError;
        throw new Error(error.message || `Last.fm error ${error.error}`);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Last.fm API took too long to respond');
      }
      
      throw error;
    }
  }

  /**
   * Handles and formats errors
   */
  private handleError(error: unknown, method: string): ApiError {
    if (error instanceof Error) {
      const message = error.message;
      
      if (message.includes('User not found') || message.includes('6')) {
        return {
          message: 'Last.fm user not found',
          code: 'USER_NOT_FOUND',
        };
      }
      
      if (message.includes('Rate limit') || message.includes('29')) {
        return {
          message: 'Last.fm API rate limit exceeded. Please try again later.',
          code: 'RATE_LIMIT',
        };
      }

      return {
        message: `Last.fm ${method} error: ${message}`,
        code: 'LASTFM_ERROR',
      };
    }

    return {
      message: `Unknown error in Last.fm ${method}`,
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Mock data for development
   */
  private getMockArtists(limit: number): string[] {
    const artists = [
      'Radiohead', 'Bon Iver', 'The National', 'Fleet Foxes',
      'Sufjan Stevens', 'Arcade Fire', 'LCD Soundsystem', 'MGMT',
      'Tame Impala', 'Beach House', 'Grizzly Bear', 'Animal Collective',
    ];
    return artists.slice(0, limit);
  }

  private getMockSimilarArtists(artist: string, limit: number): string[] {
    const similarMap: Record<string, string[]> = {
      'Radiohead': ['Thom Yorke', 'Atoms for Peace', 'Muse', 'Coldplay'],
      'Bon Iver': ['Sufjan Stevens', 'Fleet Foxes', 'The National', 'Iron & Wine'],
    };
    
    return (similarMap[artist] || this.getMockArtists(limit)).slice(0, limit);
  }

  private getMockTracks(artist: string, limit: number): LastFmTrack[] {
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      name: `Track ${i + 1} by ${artist}`,
      artist: artist,
      playcount: `${(5 - i) * 100000}`,
      listeners: `${(5 - i) * 10000}`,
    }));
  }

  private getMockSearchResults(query: string, limit: number): LastFmTrack[] {
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      name: `${query} - Result ${i + 1}`,
      artist: `Artist ${i + 1}`,
    }));
  }
}

// Export singleton instance
export const lastfmClient = new LastFmClient();
