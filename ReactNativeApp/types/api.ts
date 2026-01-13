/**
 * API Type Definitions
 * Defines all types for external API responses and requests
 */

// ============================================================================
// DeepSeek AI API Types
// ============================================================================

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DeepSeekIntent {
  mood?: string;
  genre?: string;
  artist?: string;
  activity?: string;
  query?: string;
}

export interface DeepSeekError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

// ============================================================================
// Last.fm API Types
// ============================================================================

export interface LastFmArtist {
  name: string;
  playcount?: string;
  listeners?: string;
  mbid?: string;
  url?: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
}

export interface LastFmTrack {
  name: string;
  artist: string | { name: string; mbid?: string; url?: string };
  playcount?: string;
  listeners?: string;
  duration?: string;
  url?: string;
  mbid?: string;
  image?: Array<{
    '#text': string;
    size: string;
  }>;
}

export interface LastFmTopArtistsResponse {
  topartists: {
    artist: LastFmArtist[];
    '@attr': {
      user: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
}

export interface LastFmSimilarArtistsResponse {
  similarartists: {
    artist: LastFmArtist[];
    '@attr': {
      artist: string;
    };
  };
}

export interface LastFmTopTracksResponse {
  toptracks: {
    track: LastFmTrack[];
    '@attr': {
      artist: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
}

export interface LastFmTrackSearchResponse {
  results: {
    trackmatches: {
      track: LastFmTrack[];
    };
    '@attr': {
      for: string;
    };
  };
}

export interface LastFmTrackInfoResponse {
  track: {
    name: string;
    artist: {
      name: string;
      mbid?: string;
      url?: string;
    };
    album?: {
      title: string;
      artist: string;
      image: Array<{
        '#text': string;
        size: 'small' | 'medium' | 'large' | 'extralarge' | 'mega';
      }>;
    };
    duration?: string;
    listeners?: string;
    playcount?: string;
    url?: string;
  };
}

export interface LastFmError {
  error: number;
  message: string;
}

// ============================================================================
// YouTube Data API Types
// ============================================================================

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration?: string;
  publishedAt?: string;
}

export interface YouTubeVideoDetails {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  likeCount?: string;
  publishedAt: string;
}

export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Array<{
    kind: string;
    etag: string;
    id: {
      kind: string;
      videoId: string;
    };
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
      liveBroadcastContent: string;
    };
  }>;
}

export interface YouTubeVideoDetailsResponse {
  kind: string;
  etag: string;
  items: Array<{
    kind: string;
    etag: string;
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
      };
      channelTitle: string;
    };
    contentDetails: {
      duration: string;
      dimension: string;
      definition: string;
    };
    statistics: {
      viewCount: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
}

export interface YouTubeError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

// ============================================================================
// Supabase Types
// ============================================================================

export interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

export interface SupabaseProfile {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  favorite_genres?: string[];
  favorite_moods?: string[];
  lastfm_username?: string;
}

export interface SupabaseAuthResponse {
  user: SupabaseUser | null;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
    user: SupabaseUser;
  } | null;
  error: {
    message: string;
    status: number;
  } | null;
}

// ============================================================================
// Common API Types
// ============================================================================

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}
