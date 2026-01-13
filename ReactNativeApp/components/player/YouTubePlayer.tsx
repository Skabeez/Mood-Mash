/**
 * YouTube Player Component
 * WebView-based YouTube IFrame Player with full control API
 */

import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

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

interface PlayerMessage {
  type: 'ready' | 'stateChange' | 'error' | 'currentTime' | 'duration';
  state?: number;
  error?: string;
  time?: number;
  duration?: number;
}

// ============================================================================
// YOUTUBE PLAYER COMPONENT
// ============================================================================

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(
  ({ videoId, onReady, onStateChange, onError, autoplay = false, style }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [isLoading, setIsLoading] = useState(true);
    const resolveMapRef = useRef<Map<string, (value: any) => void>>(new Map());

    /**
     * Map YouTube player state codes to readable strings
     */
    const mapPlayerState = (stateCode: number): PlayerState => {
      switch (stateCode) {
        case -1:
          return 'unstarted';
        case 0:
          return 'ended';
        case 1:
          return 'playing';
        case 2:
          return 'paused';
        case 3:
          return 'buffering';
        case 5:
          return 'cued';
        default:
          return 'unstarted';
      }
    };

    /**
     * Send command to YouTube player
     */
    const sendCommand = (command: string, args?: any) => {
      const script = args !== undefined
        ? `player.${command}(${JSON.stringify(args)});`
        : `player.${command}();`;
      
      webViewRef.current?.injectJavaScript(script);
    };

    /**
     * Send command and wait for response
     */
    const sendCommandWithResponse = (command: string, responseType: string): Promise<any> => {
      return new Promise((resolve) => {
        const requestId = `${responseType}_${Date.now()}`;
        resolveMapRef.current.set(requestId, resolve);

        const script = `
          (function() {
            const value = player.${command}();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: '${responseType}',
              requestId: '${requestId}',
              value: value
            }));
          })();
        `;

        webViewRef.current?.injectJavaScript(script);

        // Timeout after 5 seconds
        setTimeout(() => {
          if (resolveMapRef.current.has(requestId)) {
            resolveMapRef.current.delete(requestId);
            resolve(0);
          }
        }, 5000);
      });
    };

    /**
     * Handle messages from WebView
     */
    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const message: PlayerMessage = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case 'ready':
            setIsLoading(false);
            onReady?.();
            break;

          case 'stateChange':
            if (message.state !== undefined) {
              const state = mapPlayerState(message.state);
              onStateChange?.(state);
            }
            break;

          case 'error':
            if (message.error) {
              onError?.(message.error);
            }
            break;

          case 'currentTime':
          case 'duration':
            // Handle responses from sendCommandWithResponse
            const data = message as any;
            if (data.requestId && resolveMapRef.current.has(data.requestId)) {
              const resolve = resolveMapRef.current.get(data.requestId);
              resolve?.(data.value || 0);
              resolveMapRef.current.delete(data.requestId);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing WebView message:', error);
      }
    };

    /**
     * Expose player controls via ref
     */
    useImperativeHandle(ref, () => ({
      play: () => sendCommand('playVideo'),
      pause: () => sendCommand('pauseVideo'),
      seekTo: (seconds: number) => sendCommand('seekTo', seconds),
      setVolume: (volume: number) => sendCommand('setVolume', Math.round(volume * 100)),
      getCurrentTime: () => sendCommandWithResponse('getCurrentTime', 'currentTime'),
      getDuration: () => sendCommandWithResponse('getDuration', 'duration'),
      loadVideo: (newVideoId: string) => sendCommand('loadVideoById', newVideoId),
    }));

    /**
     * Generate HTML for YouTube IFrame Player
     */
    const generateHTML = () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              background-color: #000;
              overflow: hidden;
            }
            #player {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div id="player"></div>
          
          <script src="https://www.youtube.com/iframe_api"></script>
          <script>
            let player;
            let isReady = false;

            // Initialize player when API is ready
            function onYouTubeIframeAPIReady() {
              player = new YT.Player('player', {
                videoId: '${videoId}',
                playerVars: {
                  autoplay: ${autoplay ? 1 : 0},
                  controls: 0,
                  disablekb: 1,
                  fs: 0,
                  modestbranding: 1,
                  playsinline: 1,
                  rel: 0,
                  showinfo: 0,
                  iv_load_policy: 3,
                  cc_load_policy: 0,
                },
                events: {
                  onReady: onPlayerReady,
                  onStateChange: onPlayerStateChange,
                  onError: onPlayerError,
                }
              });
            }

            function onPlayerReady(event) {
              isReady = true;
              postMessage({ type: 'ready' });
            }

            function onPlayerStateChange(event) {
              postMessage({ 
                type: 'stateChange', 
                state: event.data 
              });
            }

            function onPlayerError(event) {
              const errorMessages = {
                2: 'Invalid video ID',
                5: 'HTML5 player error',
                100: 'Video not found',
                101: 'Video not allowed to be played in embedded players',
                150: 'Video not allowed to be played in embedded players',
              };
              
              postMessage({ 
                type: 'error', 
                error: errorMessages[event.data] || 'Unknown error' 
              });
            }

            function postMessage(data) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(data));
              }
            }

            // Prevent scrolling
            document.addEventListener('touchmove', function(e) {
              e.preventDefault();
            }, { passive: false });
          </script>
        </body>
      </html>
    `;

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webViewRef}
          source={{ html: generateHTML() }}
          onMessage={handleMessage}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          bounces={false}
          style={styles.webView}
        />
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333EA" />
          </View>
        )}
      </View>
    );
  }
);

YouTubePlayer.displayName = 'YouTubePlayer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default YouTubePlayer;
