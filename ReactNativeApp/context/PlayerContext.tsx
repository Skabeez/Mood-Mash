/**
 * Player Context
 * Provides player state and controls app-wide
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { usePlayer } from '@/hooks/usePlayer';
import type { RepeatMode } from '@/hooks/usePlayer';
import type { Recommendation } from '@/types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PlayerContextType {
  // State
  currentSong: Recommendation | null;
  playlist: Recommendation[];
  originalPlaylist: Recommendation[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  isLoading: boolean;

  // Actions
  playSong: (song: Recommendation, playlist?: Recommendation[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  clearQueue: () => void;

  // Internal updates (for player component)
  updateCurrentTime: (time: number) => void;
  updateDuration: (duration: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  onSongEnd: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const playerState = usePlayer();

  return (
    <PlayerContext.Provider value={playerState}>
      {children}
    </PlayerContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to access player context
 * Must be used within PlayerProvider
 */
export const usePlayerContext = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  
  return context;
};
