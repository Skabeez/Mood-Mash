/**
 * Full Player Component
 * Full-screen modal player with large controls and queue
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { usePlayerContext } from '@/context/PlayerContext';
import YouTubePlayer, { YouTubePlayerRef } from './YouTubePlayer';
import { getThumbnailUrl, formatDuration, calculateProgress } from '@/utils/player';
import { colors, spacing } from '@/constants/designSystem';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import type { Recommendation } from '@/types';

// Use dark mode colors and spacing
const COLORS = {
  textPrimary: colors.dark.text.primary,
  textSecondary: colors.dark.text.secondary,
  primary: colors.primary.main,
  background: colors.dark.background.primary,
  surface: colors.dark.surface.primary,
  border: colors.dark.border.medium,
};
const SPACING = {
  xs: spacing[1],
  sm: spacing[2],
  md: spacing[3],
  lg: spacing[4],
  xl: spacing[5],
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FullPlayerProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const ALBUM_ART_SIZE = SCREEN_WIDTH * 0.8;

// ============================================================================
// COMPONENT
// ============================================================================

export const FullPlayer: React.FC<FullPlayerProps> = ({ visible, onClose }) => {
  const {
    currentSong,
    playlist,
    isPlaying,
    currentTime,
    duration,
    volume,
    repeatMode,
    shuffleEnabled,
    pause,
    resume,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    updateCurrentTime,
    updateDuration,
    setIsLoading,
    onSongEnd,
    playSong,
  } = usePlayerContext();

  const playerRef = useRef<YouTubePlayerRef>(null);
  const [showQueue, setShowQueue] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Animation for modal
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Control player
  useEffect(() => {
    if (!playerRef.current || !visible) return;

    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying, visible]);

  // Load new video
  useEffect(() => {
    if (!playerRef.current || !currentSong || !visible) return;
    playerRef.current.loadVideo(currentSong.youtubeId || '');
  }, [currentSong?.youtubeId, visible]);

  // Poll current time
  useEffect(() => {
    if (!playerRef.current || !isPlaying || !visible) return;

    const interval = setInterval(async () => {
      try {
        const time = await playerRef.current?.getCurrentTime();
        if (time !== undefined && !isSeeking) {
          updateCurrentTime(time);
        }
      } catch (error) {
        console.error('Error getting current time:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, visible, isSeeking]);

  if (!currentSong) return null;

  const thumbnailUrl = getThumbnailUrl(currentSong.youtubeId || '', 'maxres');
  const progress = calculateProgress(currentTime, duration);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleSeek = async (value: number) => {
    setIsSeeking(true);
    updateCurrentTime(value);
    
    if (playerRef.current) {
      await playerRef.current.seekTo(value);
    }
    
    seek(value);
    setTimeout(() => setIsSeeking(false), 100);
  };

  const handlePlayerReady = async () => {
    if (!playerRef.current) return;

    try {
      const dur = await playerRef.current.getDuration();
      updateDuration(dur);
    } catch (error) {
      console.error('Error getting duration:', error);
    }
  };

  const handleStateChange = (state: string) => {
    if (state === 'ended') {
      onSongEnd();
    } else if (state === 'buffering') {
      setIsLoading(true);
    } else if (state === 'playing') {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (playerRef.current) {
      playerRef.current.setVolume(value);
    }
  };

  const handleQueueItemPress = (song: Recommendation, index: number) => {
    playSong(song, playlist);
    setShowQueue(false);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return 'repeat-outline'; // Will show '1' badge
      case 'all':
        return 'repeat';
      default:
        return 'repeat-outline';
    }
  };

  const getRepeatColor = () => {
    return repeatMode !== 'off' ? COLORS.primary : COLORS.textSecondary;
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent={false}
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Hidden YouTube Player */}
        <View style={styles.hiddenPlayer}>
          <YouTubePlayer
            ref={playerRef}
            videoId={currentSong.youtubeId || ''}
            onReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onError={(error: string) => console.error('Player error:', error)}
            autoplay={isPlaying}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-down" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Album Art */}
          <View style={styles.albumArtContainer}>
            <Image source={{ uri: thumbnailUrl }} style={styles.albumArt} />
          </View>

          {/* Song Info */}
          <View style={styles.songInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 100}
              value={currentTime}
              onValueChange={updateCurrentTime}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.primary}
            />
            <View style={styles.timeLabels}>
              <Text style={styles.timeText}>{formatDuration(currentTime)}</Text>
              <Text style={styles.timeText}>{formatDuration(duration)}</Text>
            </View>
          </View>

          {/* Main Controls */}
          <View style={styles.mainControls}>
            {/* Shuffle */}
            <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryButton}>
              <Ionicons
                name="shuffle"
                size={24}
                color={shuffleEnabled ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>

            {/* Previous */}
            <TouchableOpacity onPress={previous} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={32} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
              <Ionicons
                name={isPlaying ? 'pause-circle' : 'play-circle'}
                size={72}
                color={COLORS.primary}
              />
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity onPress={next} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={32} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity onPress={cycleRepeat} style={styles.secondaryButton}>
              <Ionicons name={getRepeatIcon()} size={24} color={getRepeatColor()} />
              {repeatMode === 'one' && (
                <View style={styles.repeatOneBadge}>
                  <Text style={styles.repeatOneText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Volume Control */}
          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={20} color={COLORS.textSecondary} />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.border}
              thumbTintColor={COLORS.primary}
            />
            <Ionicons name="volume-high" size={20} color={COLORS.textSecondary} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Favorite</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowQueue(!showQueue)}
            >
              <Ionicons name="list" size={24} color={COLORS.textSecondary} />
              <Text style={styles.actionText}>Queue ({playlist.length})</Text>
            </TouchableOpacity>
          </View>

          {/* Queue */}
          {showQueue && (
            <View style={styles.queue}>
              <Text style={styles.queueTitle}>Up Next</Text>
              {playlist.map((song, index) => (
                <Pressable
                  key={`${song.youtubeId}-${index}`}
                  style={[
                    styles.queueItem,
                    song.youtubeId === currentSong.youtubeId && styles.queueItemActive,
                  ]}
                  onPress={() => handleQueueItemPress(song, index)}
                >
                  <Image
                    source={{ uri: getThumbnailUrl(song.youtubeId || '', 'default') }}
                    style={styles.queueItemImage}
                  />
                  <View style={styles.queueItemInfo}>
                    <Text
                      style={[
                        styles.queueItemTitle,
                        song.youtubeId === currentSong.youtubeId &&
                          styles.queueItemTitleActive,
                      ]}
                      numberOfLines={1}
                    >
                      {song.title}
                    </Text>
                    <Text style={styles.queueItemArtist} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </View>
                  {song.youtubeId === currentSong.youtubeId && (
                    <Ionicons name="volume-high" size={16} color={COLORS.primary} />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  hiddenPlayer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },

  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  content: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  albumArtContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },

  albumArt: {
    width: ALBUM_ART_SIZE,
    height: ALBUM_ART_SIZE,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },

  songInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },

  artist: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  progressContainer: {
    marginBottom: SPACING.xl,
  },

  slider: {
    width: '100%',
    height: 40,
  },

  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },

  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },

  playButton: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controlButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  repeatOneBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  repeatOneText: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.background,
  },

  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },

  volumeSlider: {
    flex: 1,
    height: 40,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
  },

  actionButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },

  actionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  queue: {
    marginTop: SPACING.md,
  },

  queueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.xs,
  },

  queueItemActive: {
    backgroundColor: COLORS.surface,
  },

  queueItemImage: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: COLORS.border,
  },

  queueItemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },

  queueItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },

  queueItemTitleActive: {
    color: COLORS.primary,
  },

  queueItemArtist: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
