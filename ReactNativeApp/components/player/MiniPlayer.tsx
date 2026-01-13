/**
 * Mini Player Component
 * Compact player UI at bottom of screen
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { usePlayerContext } from '@/context/PlayerContext';
import { getThumbnailUrl, formatDuration, calculateProgress } from '@/utils/player';
import { colors } from '@/constants/designSystem';
import { Ionicons } from '@expo/vector-icons';

// Use dark mode colors
const COLORS = colors.dark.text;
const PRIMARY = colors.primary.main;
const SURFACE = colors.dark.surface.primary;
const BORDER = colors.dark.border.medium;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface MiniPlayerProps {
  onExpand: () => void;
  onClose?: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MINI_PLAYER_HEIGHT = 72;

// ============================================================================
// COMPONENT
// ============================================================================

export const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand, onClose }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    pause,
    resume,
    next,
    clearQueue,
  } = usePlayerContext();

  // Animation values
  const slideAnim = useRef(new Animated.Value(MINI_PLAYER_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Show/hide animation
  useEffect(() => {
    if (currentSong) {
      // Slide up and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MINI_PLAYER_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentSong]);

  // Don't render if no song
  if (!currentSong) return null;

  const progress = calculateProgress(currentTime, duration);
  const thumbnailUrl = getThumbnailUrl(currentSong.youtubeId || '', 'default');

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleClose = () => {
    clearQueue();
    if (onClose) onClose();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {/* Main Content */}
      <Pressable style={styles.content} onPress={onExpand}>
        {/* Album Art */}
        <Image source={{ uri: thumbnailUrl }} style={styles.albumArt} />

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {/* Next Button */}
          <TouchableOpacity
            onPress={next}
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="play-skip-forward" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={styles.controlButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: SURFACE,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 100,
  },

  progressBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: BORDER,
  },

  progressBar: {
    height: '100%',
    backgroundColor: PRIMARY,
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 4,
  },

  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: BORDER,
  },

  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    justifyContent: 'center',
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },

  artist: {
    fontSize: 12,
    color: COLORS.secondary,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  controlButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
