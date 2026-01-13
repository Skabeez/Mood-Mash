/**
 * Music Recommendation Chat App - TypeScript Types
 * Defines all core interfaces and types for the application
 */

/**
 * Represents a recommendation type
 */
export type RecommendationType = 'highlight' | 'deep-cut' | 'mainstream';

/**
 * Represents the sender of a message
 */
export type MessageSender = 'user' | 'ai';

/**
 * Represents a music recommendation with all metadata
 */
export interface Recommendation {
  /** Unique identifier for the recommendation */
  id: string;
  
  /** Track or album title */
  title: string;
  
  /** Artist name */
  artist: string;
  
  /** Type of recommendation */
  type: RecommendationType;
  
  /** YouTube video ID for embedding */
  youtubeId: string;
  
  /** Album art URL or base64 string */
  albumArt: string;
  
  /** Duration in MM:SS format */
  duration?: string;
  
  /** Optional: Album name */
  album?: string;
  
  /** Optional: Release year */
  releaseYear?: number;
  
  /** Optional: Spotify URI */
  spotifyUri?: string;
  
  /** Optional: Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a single chat message
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  
  /** Message content/text */
  text: string;
  
  /** Who sent the message */
  sender: MessageSender;
  
  /** When the message was sent */
  timestamp: Date;
  
  /** Optional: Array of music recommendations in this message */
  recommendations?: Recommendation[];
  
  /** Optional: Message status (pending, sent, error) */
  status?: 'pending' | 'sent' | 'error';
  
  /** Optional: Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Represents user music preferences
 */
export interface UserPreferences {
  /** Favorite music genres */
  genres: string[];
  
  /** Preferred moods/vibes */
  moods: string[];
  
  /** Optional: Favorite decades */
  decades?: string[];
  
  /** Optional: Language preferences */
  languages?: string[];
  
  /** Optional: Energy level preferences (low, medium, high) */
  energyLevels?: string[];
}

/**
 * Represents a user's profile
 */
export interface UserProfile {
  /** Unique user identifier */
  userId: string;
  
  /** User email address */
  email: string;
  
  /** User display name */
  username?: string;
  
  /** User preferences for recommendations */
  preferences: UserPreferences;
  
  /** Optional: Last.fm username for integration */
  lastfmUsername?: string;
  
  /** Optional: User's top artists */
  topArtists?: string[];
  
  /** Optional: User's top genres */
  topGenres?: string[];
  
  /** Optional: Listening history */
  listeningHistory?: string[];
  
  /** Optional: Profile picture URL */
  profilePicture?: string;
  
  /** Optional: Account creation date */
  createdAt?: Date;
  
  /** Optional: Last active timestamp */
  lastActiveAt?: Date;
}

/**
 * Represents the current state of the chat
 */
export interface ChatState {
  /** Array of all messages in the chat */
  messages: Message[];
  
  /** Whether the AI is currently generating a response */
  isLoading: boolean;
  
  /** Currently logged-in user or null if not authenticated */
  currentUser: UserProfile | null;
  
  /** Optional: Error message if any */
  error?: string | null;
  
  /** Optional: Chat session ID */
  sessionId?: string;
  
  /** Optional: Chat history metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Represents an API response from the recommendation engine
 */
export interface RecommendationResponse {
  /** Generated recommendations */
  recommendations: Recommendation[];
  
  /** AI-generated explanation/commentary */
  explanation: string;
  
  /** Confidence score (0-1) */
  confidence?: number;
  
  /** Optional: Processing time in ms */
  processingTime?: number;
}

/**
 * Represents API error response
 */
export interface ApiError {
  /** Error code */
  code: string;
  
  /** Human-readable error message */
  message: string;
  
  /** Optional: Error details */
  details?: Record<string, unknown>;
}

/**
 * Represents chat action types for state management
 */
export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'REMOVE_MESSAGE'; payload: string }
  | { type: 'UPDATE_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_CHAT_STATE'; payload: ChatState };

/**
 * Represents last.fm integration data
 */
export interface LastFmData {
  /** Top tracks from user's last.fm account */
  topTracks?: Array<{ name: string; artist: string }>;
  
  /** Top artists from user's last.fm account */
  topArtists?: string[];
  
  /** User's recent tracks */
  recentTracks?: Array<{ name: string; artist: string; timestamp: Date }>;
}

/**
 * Represents analytics data for recommendations
 */
export interface RecommendationAnalytics {
  /** Recommendation ID being tracked */
  recommendationId: string;
  
  /** User ID */
  userId: string;
  
  /** Whether user clicked/played the recommendation */
  clicked: boolean;
  
  /** Timestamp of interaction */
  timestamp: Date;
  
  /** Optional: User rating (1-5) */
  rating?: number;
  
  /** Optional: Whether user saved/liked it */
  saved?: boolean;
}

/**
 * Represents filter options for recommendations
 */
export interface RecommendationFilter {
  /** Filter by recommendation type */
  type?: RecommendationType | RecommendationType[];
  
  /** Filter by artist */
  artist?: string;
  
  /** Filter by genre */
  genre?: string;
  
  /** Filter by decade */
  decade?: string;
  
  /** Maximum duration in seconds */
  maxDuration?: number;
  
  /** Minimum duration in seconds */
  minDuration?: number;
  
  /** Sort order */
  sortBy?: 'recent' | 'popularity' | 'relevance';
}
