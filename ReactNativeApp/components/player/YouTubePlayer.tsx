/**
 * YouTube Player Component
 * Platform-aware YouTube player (iframe for web, WebView for native)
 */

import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';

export interface YouTubePlayerProps {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (state: PlayerState) => void;
  onError?: (error: string) => void;
  autoplay?: boolean;
  style?: any;
}

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
  loadVideo: (videoId: string) => void;
}

// ============================================================================
// WEB YOUTUBE PLAYER (IFRAME)
// ============================================================================

const YouTubePlayerWeb = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, onReady, onStateChange, onError, autoplay = false, style }, ref) => {
    const [loading, setLoading] = useState(true);
    const [player, setPlayer] = useState<any>(null);
    const playerIdRef = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
      // Load YouTube IFrame API
      if (typeof window === 'undefined') return;

      // Check if API already loaded
      // @ts-ignore
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (existingScript) {
        // @ts-ignore
        window.onYouTubeIframeAPIReady = initPlayer;
        return;
      }

      // Load the API
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // @ts-ignore
      window.onYouTubeIframeAPIReady = initPlayer;

      return () => {
        if (player) {
          try {
            player.destroy();
          } catch (error) {
            console.error('Error destroying player:', error);
          }
        }
      };
    }, []);

    useEffect(() => {
      if (player && videoId && typeof player.loadVideoById === 'function') {
        try {
          player.loadVideoById(videoId);
        } catch (error) {
          console.error('Error loading video:', error);
        }
      }
    }, [videoId, player]);

    const initPlayer = () => {
      // @ts-ignore
      const ytPlayer = new window.YT.Player(playerIdRef.current, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
          widget_referrer: window.location.origin,
          hd: 1,
          vq: 'hd720',
          suggestedQuality: 'hd720',
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target);
            setLoading(false);
            // Set quality to highest available
            try {
              event.target.setPlaybackQuality('hd720');
            } catch (error) {
              console.error('Error setting quality:', error);
            }
            if (autoplay) {
              event.target.playVideo();
            }
            onReady?.();
          },
          onStateChange: (event: any) => {
            const states: { [key: number]: PlayerState } = {
              '-1': 'unstarted',
              0: 'ended',
              1: 'playing',
              2: 'paused',
              3: 'buffering',
              5: 'cued',
            };
            onStateChange?.(states[event.data] || 'unstarted');
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            onError?.(event.data.toString());
          },
        },
      });
      setPlayer(ytPlayer);
    };

    useImperativeHandle(ref, () => ({
      play: () => {
        if (player && typeof player.playVideo === 'function') {
          player.playVideo();
        }
      },
      pause: () => {
        if (player && typeof player.pauseVideo === 'function') {
          player.pauseVideo();
        }
      },
      seekTo: (seconds: number) => {
        if (player && typeof player.seekTo === 'function') {
          player.seekTo(seconds, true);
        }
      },
      setVolume: (volume: number) => {
        if (player && typeof player.setVolume === 'function') {
          player.setVolume(volume);
        }
      },
      getCurrentTime: async () => {
        if (player && typeof player.getCurrentTime === 'function') {
          return player.getCurrentTime();
        }
        return 0;
      },
      getDuration: async () => {
        if (player && typeof player.getDuration === 'function') {
          return player.getDuration();
        }
        return 0;
      },
      loadVideo: (newVideoId: string) => {
        if (player && typeof player.loadVideoById === 'function') {
          player.loadVideoById(newVideoId);
        }
      },
    }), [player]);

    return (
      <View style={[styles.container, style]}>
        <div id={playerIdRef.current} style={{ width: '100%', height: '100%' }}></div>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333EA" />
          </View>
        )}
      </View>
    );
  }
);

// ============================================================================
// NATIVE YOUTUBE PLAYER (WEBVIEW)
// ============================================================================

const YouTubePlayerNative = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, onReady, onStateChange, onError, autoplay = false, style }, ref) => {
    // Import WebView dynamically for native platforms
    const WebView = require('react-native-webview').WebView;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; }
            body { background: #000; }
            iframe {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&playsinline=1&rel=0&modestbranding=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </body>
      </html>
    `;

    useEffect(() => {
      if (onReady) {
        const timer = setTimeout(() => onReady(), 1000);
        return () => clearTimeout(timer);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {},
      pause: () => {},
      seekTo: (seconds: number) => {},
      setVolume: (volume: number) => {},
      getCurrentTime: async () => 0,
      getDuration: async () => 0,
      loadVideo: (newVideoId: string) => {},
    }));

    return (
      <View style={[styles.container, style]}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.webview}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
        />
      </View>
    );
  }
);

// ============================================================================
// EXPORT PLATFORM-SPECIFIC PLAYER
// ============================================================================

const YouTubePlayer = Platform.OS === 'web' ? YouTubePlayerWeb : YouTubePlayerNative;

export default YouTubePlayer;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

