/**
 * usePlayer Hook
 * Custom hook for managing music player state and playback
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recommendation } from '@/types';
import { shuffleArray } from '@/utils/player';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type RepeatMode = 'off' | 'one' | 'all';

export interface PlayerState {
  currentSong: Recommendation | null;
  playlist: Recommendation[];
  originalPlaylist: Recommendation[]; // Unshuffled version
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  isLoading: boolean;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  PLAYER_STATE: '@player_state',
  VOLUME: '@player_volume',
  REPEAT_MODE: '@player_repeat',
  SHUFFLE: '@player_shuffle',
};

// ============================================================================
// usePlayer HOOK
// ============================================================================

export const usePlayer = () => {
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    playlist: [],
    originalPlaylist: [],
    currentIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    repeatMode: 'off',
    shuffleEnabled: false,
    isLoading: false,
  });

  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Load persisted player settings on mount
   */
  useEffect(() => {
    loadPersistedSettings();
    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, []);

  /**
   * Load settings from AsyncStorage
   */
  const loadPersistedSettings = async () => {
    try {
      const [volume, repeatMode, shuffle] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.VOLUME),
        AsyncStorage.getItem(STORAGE_KEYS.REPEAT_MODE),
        AsyncStorage.getItem(STORAGE_KEYS.SHUFFLE),
      ]);

      setState((prev) => ({
        ...prev,
        volume: volume ? parseFloat(volume) : 0.8,
        repeatMode: (repeatMode as RepeatMode) || 'off',
        shuffleEnabled: shuffle === 'true',
      }));
    } catch (error) {
      console.error('Error loading player settings:', error);
    }
  };

  /**
   * Persist settings to AsyncStorage
   */
  const persistSettings = useCallback(
    async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error persisting player settings:', error);
      }
    },
    []
  );

  /**
   * Play a song with optional playlist
   */
  const playSong = useCallback(
    (song: Recommendation, playlist: Recommendation[] = []) => {
      const newPlaylist = playlist.length > 0 ? playlist : [song];
      const songIndex = newPlaylist.findIndex((s) => s.id === song.id);

      setState((prev) => {
        const shuffledPlaylist = prev.shuffleEnabled
          ? shuffleArray(newPlaylist)
          : newPlaylist;

        // Find new index in shuffled playlist
        const newIndex = shuffledPlaylist.findIndex((s) => s.id === song.id);

        return {
          ...prev,
          currentSong: song,
          playlist: shuffledPlaylist,
          originalPlaylist: newPlaylist,
          currentIndex: newIndex >= 0 ? newIndex : 0,
          isPlaying: true,
          isLoading: true,
          currentTime: 0,
        };
      });
    },
    []
  );

  /**
   * Pause playback
   */
  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  /**
   * Resume playback
   */
  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  /**
   * Play next song in playlist
   */
  const next = useCallback(() => {
    setState((prev) => {
      if (prev.playlist.length === 0) return prev;

      let nextIndex: number;

      if (prev.repeatMode === 'one') {
        // Replay current song
        nextIndex = prev.currentIndex;
      } else if (prev.currentIndex >= prev.playlist.length - 1) {
        // At end of playlist
        if (prev.repeatMode === 'all') {
          nextIndex = 0; // Loop back to start
        } else {
          // Stop playing
          return {
            ...prev,
            isPlaying: false,
            currentSong: null,
            currentIndex: -1,
          };
        }
      } else {
        nextIndex = prev.currentIndex + 1;
      }

      return {
        ...prev,
        currentSong: prev.playlist[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
      };
    });
  }, []);

  /**
   * Play previous song in playlist
   */
  const previous = useCallback(() => {
    setState((prev) => {
      if (prev.playlist.length === 0) return prev;

      // If more than 3 seconds into song, restart current song
      if (prev.currentTime > 3) {
        return {
          ...prev,
          currentTime: 0,
        };
      }

      let prevIndex: number;

      if (prev.currentIndex <= 0) {
        // At start of playlist
        if (prev.repeatMode === 'all') {
          prevIndex = prev.playlist.length - 1; // Go to end
        } else {
          prevIndex = 0; // Stay at first song
        }
      } else {
        prevIndex = prev.currentIndex - 1;
      }

      return {
        ...prev,
        currentSong: prev.playlist[prevIndex],
        currentIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
      };
    });
  }, []);

  /**
   * Seek to specific time
   */
  const seek = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      setState((prev) => ({ ...prev, volume: clampedVolume }));
      persistSettings(STORAGE_KEYS.VOLUME, clampedVolume.toString());
    },
    [persistSettings]
  );

  /**
   * Toggle shuffle mode
   */
  const toggleShuffle = useCallback(() => {
    setState((prev) => {
      const newShuffleEnabled = !prev.shuffleEnabled;
      
      let newPlaylist: Recommendation[];
      let newIndex: number;

      if (newShuffleEnabled) {
        // Enable shuffle
        const currentSong = prev.currentSong;
        newPlaylist = shuffleArray(prev.originalPlaylist);
        
        // Keep current song at current position if possible
        if (currentSong) {
          const currentSongIndex = newPlaylist.findIndex((s) => s.id === currentSong.id);
          if (currentSongIndex >= 0) {
            newIndex = currentSongIndex;
          } else {
            newIndex = 0;
          }
        } else {
          newIndex = 0;
        }
      } else {
        // Disable shuffle - restore original order
        newPlaylist = [...prev.originalPlaylist];
        const currentSong = prev.currentSong;
        
        if (currentSong) {
          newIndex = newPlaylist.findIndex((s) => s.id === currentSong.id);
          if (newIndex < 0) newIndex = 0;
        } else {
          newIndex = 0;
        }
      }

      persistSettings(STORAGE_KEYS.SHUFFLE, newShuffleEnabled.toString());

      return {
        ...prev,
        shuffleEnabled: newShuffleEnabled,
        playlist: newPlaylist,
        currentIndex: newIndex,
      };
    });
  }, [persistSettings]);

  /**
   * Cycle through repeat modes: off -> all -> one -> off
   */
  const cycleRepeat = useCallback(() => {
    setState((prev) => {
      let newMode: RepeatMode;
      
      switch (prev.repeatMode) {
        case 'off':
          newMode = 'all';
          break;
        case 'all':
          newMode = 'one';
          break;
        case 'one':
          newMode = 'off';
          break;
        default:
          newMode = 'off';
      }

      persistSettings(STORAGE_KEYS.REPEAT_MODE, newMode);

      return {
        ...prev,
        repeatMode: newMode,
      };
    });
  }, [persistSettings]);

  /**
   * Clear playlist and stop playback
   */
  const clearQueue = useCallback(() => {
    setState({
      currentSong: null,
      playlist: [],
      originalPlaylist: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: state.volume,
      repeatMode: state.repeatMode,
      shuffleEnabled: state.shuffleEnabled,
      isLoading: false,
    });
  }, [state.volume, state.repeatMode, state.shuffleEnabled]);

  /**
   * Update current time (called by player)
   */
  const updateCurrentTime = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  /**
   * Update duration (called by player)
   */
  const updateDuration = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, duration }));
  }, []);

  /**
   * Set loading state
   */
  const setIsLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  /**
   * Handle song end (called by player)
   */
  const onSongEnd = useCallback(() => {
    // Auto-play next song
    next();
  }, [next]);

  return {
    // State
    ...state,

    // Actions
    playSong,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    clearQueue,

    // Internal updates
    updateCurrentTime,
    updateDuration,
    setIsLoading,
    onSongEnd,
  };
};
