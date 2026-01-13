/**
 * Chat Context for State Management
 * Handles chat state with persistence to AsyncStorage
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Message,
  UserProfile,
  ChatState,
} from '@/types';
import { recommendationEngine, UserProfile as EngineUserProfile } from '@/services/api';
import { getCurrentUser, getUserProfile } from '@/services/api/supabase';
import { generateId } from '@/utils/helpers';
import { databaseService } from '@/services/database';

/**
 * Chat action types for the reducer
 */
export type ChatAction =
  | {
      type: 'ADD_MESSAGE';
      payload: Message;
    }
  | {
      type: 'SET_LOADING';
      payload: boolean;
    }
  | {
      type: 'CLEAR_CHAT';
    }
  | {
      type: 'UPDATE_PROFILE';
      payload: UserProfile | null;
    }
  | {
      type: 'LOAD_MESSAGES';
      payload: Message[];
    }
  | {
      type: 'SET_ERROR';
      payload: string | null;
    }
  | {
      type: 'REMOVE_MESSAGE';
      payload: string;
    }
  | {
      type: 'UPDATE_MESSAGE';
      payload: Message;
    }
  | {
      type: 'SET_SESSION_ID';
      payload: string;
    };

/**
 * Context value type
 */
export interface ChatContextType {
  state: ChatState;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
  updateProfile: (profile: UserProfile | null) => void;
  removeMessage: (messageId: string) => void;
  updateMessage: (message: Message) => void;
  setError: (error: string | null) => void;
  generateRecommendations: (userMessage: string) => Promise<void>;
  loadUserProfile: () => Promise<void>;
}

/**
 * Storage keys for persistence
 */
const STORAGE_KEYS = {
  CHAT_MESSAGES: '@chat_messages',
  USER_PROFILE: '@user_profile',
  SESSION_ID: '@session_id',
} as const;

/**
 * Initial chat state
 */
const initialState: ChatState = {
  messages: [],
  isLoading: false,
  currentUser: null,
  error: null,
  sessionId: undefined,
  metadata: {},
};

/**
 * Chat reducer function
 * Handles all state updates based on actions
 */
const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        error: null,
      };

    case 'REMOVE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload),
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id ? action.payload : msg
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'CLEAR_CHAT':
      return {
        ...state,
        messages: [],
        error: null,
      };

    case 'UPDATE_PROFILE':
      return {
        ...state,
        currentUser: action.payload,
      };

    case 'LOAD_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_SESSION_ID':
      return {
        ...state,
        sessionId: action.payload,
      };

    default:
      return state;
  }
};

/**
 * Create the Chat Context
 */
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * Chat Provider Props
 */
interface ChatProviderProps {
  children: ReactNode;
}

/**
 * Chat Provider Component
 * Manages chat state with persistence to AsyncStorage
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  /**
   * Load messages from AsyncStorage on component mount
   */
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        // Load messages
        const messagesJson = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
        if (messagesJson) {
          const messages: Message[] = JSON.parse(messagesJson);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          dispatch({
            type: 'LOAD_MESSAGES',
            payload: messagesWithDates,
          });
        }

        // Load user profile
        const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        if (profileJson) {
          const profile: UserProfile = JSON.parse(profileJson);
          dispatch({
            type: 'UPDATE_PROFILE',
            payload: profile,
          });
        }

        // Load session ID
        const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
        if (sessionId) {
          dispatch({
            type: 'SET_SESSION_ID',
            payload: sessionId,
          });
        } else {
          // Generate new session ID if none exists
          const newSessionId = `session_${Date.now()}`;
          await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, newSessionId);
          dispatch({
            type: 'SET_SESSION_ID',
            payload: newSessionId,
          });
        }
      } catch (error) {
        console.error('Error loading persisted chat data:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: 'Failed to load chat history',
        });
      }
    };

    loadPersistedData();
  }, []);

  /**
   * Persist messages to AsyncStorage whenever they change
   */
  useEffect(() => {
    const persistMessages = async () => {
      try {
        if (state.messages.length > 0) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.CHAT_MESSAGES,
            JSON.stringify(state.messages)
          );
        } else {
          // Remove the key if no messages
          await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
        }
      } catch (error) {
        console.error('Error persisting messages:', error);
      }
    };

    persistMessages();
  }, [state.messages]);

  /**
   * Persist user profile to AsyncStorage
   */
  useEffect(() => {
    const persistProfile = async () => {
      try {
        if (state.currentUser) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.USER_PROFILE,
            JSON.stringify(state.currentUser)
          );
        } else {
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        }
      } catch (error) {
        console.error('Error persisting user profile:', error);
      }
    };

    persistProfile();
  }, [state.currentUser]);

  /**
   * Add a new message to the chat
   */
  const addMessage = useCallback((message: Message) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: message,
    });
  }, []);

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    dispatch({
      type: 'SET_LOADING',
      payload: loading,
    });
  }, []);

  /**
   * Clear all messages from the chat
   */
  const clearChat = useCallback(() => {
    dispatch({
      type: 'CLEAR_CHAT',
    });
    // Also clear from storage
    AsyncStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES).catch((error) => {
      console.error('Error clearing chat storage:', error);
    });
  }, []);

  /**
   * Update the current user profile
   */
  const updateProfile = useCallback((profile: UserProfile | null) => {
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: profile,
    });
  }, []);

  /**
   * Remove a specific message
   */
  const removeMessage = useCallback((messageId: string) => {
    dispatch({
      type: 'REMOVE_MESSAGE',
      payload: messageId,
    });
  }, []);

  /**
   * Update a specific message
   */
  const updateMessage = useCallback((message: Message) => {
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: message,
    });
  }, []);

  /**
   * Set error message
   */
  const setError = useCallback((error: string | null) => {
    dispatch({
      type: 'SET_ERROR',
      payload: error,
    });
  }, []);

  /**
   * Load user profile from Supabase
   */
  const loadUserProfile = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile) {
          const userProfile: UserProfile = {
            id: profile.id,
            username: profile.username,
            email: user.email || '',
            favoriteGenres: profile.favorite_genres || [],
            favoriteMoods: profile.favorite_moods || [],
            lastfmUsername: profile.lastfm_username,
          };
          updateProfile(userProfile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [updateProfile]);

  /**
   * Generate AI-powered music recommendations
   */
  const generateRecommendations = useCallback(async (userMessage: string) => {
    if (!userMessage.trim()) {
      return;
    }

    // Set loading state
    setLoading(true);
    setError(null);

    // Add user message to chat
    const userMsg: Message = {
      id: generateId(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    addMessage(userMsg);

    try {
      // Convert UserProfile to EngineUserProfile
      const engineProfile: EngineUserProfile = {
        id: state.currentUser?.id,
        username: state.currentUser?.username,
        favoriteGenres: state.currentUser?.favoriteGenres,
        favoriteMoods: state.currentUser?.favoriteMoods,
        lastfmUsername: state.currentUser?.lastfmUsername,
      };

      // Generate recommendations using the engine
      const { aiResponse, recommendations } = await recommendationEngine.generateRecommendations(
        userMessage,
        engineProfile,
        state.messages
      );

      // Create AI message with recommendations
      const aiMsg: Message = {
        id: generateId(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        recommendations: recommendations,
      };

      addMessage(aiMsg);

      // Save recommendations to Supabase if user is logged in
      if (state.currentUser?.id && recommendations.length > 0 && state.sessionId) {
        try {
          // Save the full recommendation to database
          await databaseService.saveRecommendation(
            state.currentUser.id,
            state.sessionId,
            {
              userMessage,
              aiResponse,
              recommendations,
            }
          );

          // Automatically save highlight track to highlights table
          const highlightTrack = recommendations.find(
            (r) => r.type === 'highlight'
          );
          if (highlightTrack) {
            await databaseService.saveHighlight(
              state.currentUser.id,
              highlightTrack,
              userMessage // Use user's message as context
            );
          }

          console.log('✅ Saved recommendation and highlight to database');
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
          // Don't throw - let the user see their recommendations even if DB save fails
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Add error message to chat
      const errorMsg: Message = {
        id: generateId(),
        text: "Oops! I couldn't generate recommendations right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      addMessage(errorMsg);
      
      setError('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  }, [state.currentUser, state.messages, state.sessionId, addMessage, setLoading, setError]);

  /**
   * Load user profile on mount
   */
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const value: ChatContextType = {
    state,
    addMessage,
    setLoading,
    clearChat,
    updateProfile,
    removeMessage,
    updateMessage,
    setError,
    generateRecommendations,
    loadUserProfile,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

/**
 * Hook to use the Chat Context
 * Must be used within ChatProvider
 *
 * @throws Error if used outside of ChatProvider
 * @returns ChatContextType
 */
export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error(
      'useChatContext must be used within a ChatProvider. ' +
      'Make sure your component is wrapped with <ChatProvider>.'
    );
  }

  return context;
};

export default ChatProvider;
