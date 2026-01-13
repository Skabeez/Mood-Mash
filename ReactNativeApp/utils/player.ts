/**
 * Player Utility Functions
 * Helper functions for YouTube player and audio playback
 */

/**
 * Format duration in seconds to MM:SS or HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted time string (e.g., "3:45" or "1:23:45")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const paddedMinutes = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const paddedSeconds = String(secs).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Parse YouTube ISO 8601 duration format to seconds
 * @param isoDuration - ISO 8601 duration string (e.g., "PT3M45S")
 * @returns Duration in seconds
 */
export function parseYouTubeDuration(isoDuration: string): number {
  if (!isoDuration || typeof isoDuration !== 'string') {
    return 0;
  }

  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Get audio-only URL for YouTube video (not directly supported, returns embed URL)
 * Note: YouTube doesn't provide direct audio URLs. This returns the embed URL.
 * @param videoId - YouTube video ID
 * @returns YouTube embed URL
 */
export function getAudioOnlyUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&modestbranding=1&rel=0`;
}

/**
 * Validate YouTube video ID format
 * @param id - Video ID to validate
 * @returns True if valid YouTube video ID
 */
export function validateVideoId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // YouTube video IDs are 11 characters, alphanumeric with _ and -
  const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeIdPattern.test(id);
}

/**
 * Extract video ID from YouTube URL
 * @param url - YouTube URL
 * @returns Video ID or null if invalid
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get thumbnail URL for YouTube video
 * @param videoId - YouTube video ID
 * @param quality - Thumbnail quality ('default' | 'medium' | 'high' | 'maxres')
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}

/**
 * Calculate progress percentage
 * @param currentTime - Current playback time in seconds
 * @param duration - Total duration in seconds
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(currentTime: number, duration: number): number {
  if (!duration || duration === 0) {
    return 0;
  }
  return (currentTime / duration) * 100;
}
