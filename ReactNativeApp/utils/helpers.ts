/**
 * Utility Helper Functions
 * Common utilities for the music recommendation chat app
 */

/**
 * Format a date to HH:MM format
 * @param date - The date to format
 * @returns Formatted time string (e.g., "14:30")
 */
export const formatTimestamp = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Format a date to MM/DD/YYYY format
 * @param date - The date to format
 * @returns Formatted date string (e.g., "01/13/2026")
 */
export const formatDate = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

/**
 * Format a date to full date and time format
 * @param date - The date to format
 * @returns Formatted datetime string (e.g., "Jan 13, 2026 - 2:30 PM")
 */
export const formatDateTime = (date: Date): string => {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateFormatter.format(date)} - ${timeFormatter.format(date)}`;
};

/**
 * Generate a unique ID using timestamp and random number
 * @returns Unique string ID
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomNum}`;
};

/**
 * Generate multiple unique IDs
 * @param count - Number of IDs to generate
 * @returns Array of unique IDs
 */
export const generateIds = (count: number): string[] => {
  return Array.from({ length: count }, () => generateId());
};

/**
 * Validate a YouTube video ID format
 * YouTube IDs are typically 11 characters long and contain alphanumeric characters, hyphens, and underscores
 * @param id - The YouTube ID to validate
 * @returns Whether the ID is valid
 */
export const validateYouTubeId = (id: string): boolean => {
  const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
  return youtubeIdRegex.test(id);
};

/**
 * Extract YouTube ID from a YouTube URL
 * Supports various YouTube URL formats:
 * - https://youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=...
 * @param url - YouTube URL or ID
 * @returns YouTube ID if valid, null otherwise
 */
export const extractYouTubeId = (url: string): string | null => {
  // If it's already an ID, return it
  if (validateYouTubeId(url)) {
    return url;
  }

  // Try extracting from various URL formats
  let videoId: string | null = null;

  // Format: youtu.be/VIDEO_ID
  const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortUrlMatch) {
    videoId = shortUrlMatch[1];
  }

  // Format: youtube.com/watch?v=VIDEO_ID
  const longUrlMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (longUrlMatch) {
    videoId = longUrlMatch[1];
  }

  // Format: youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }

  return videoId;
};

/**
 * Format duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "3:45")
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

/**
 * Parse duration string (MM:SS or M:SS) to seconds
 * @param durationStr - Duration string (e.g., "3:45")
 * @returns Duration in seconds
 */
export const parseDurationToSeconds = (durationStr: string): number => {
  const parts = durationStr.split(':');
  if (parts.length !== 2) {
    return 0;
  }
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  return minutes * 60 + seconds;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of a string
 * @param text - Text to capitalize
 * @returns Text with first letter capitalized
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Slugify text (convert to URL-friendly format)
 * @param text - Text to slugify
 * @returns Slugified text (e.g., "Hello World" -> "hello-world")
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns Whether the email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate genre format (alphanumeric, spaces, hyphens allowed)
 * @param genre - Genre to validate
 * @returns Whether the genre is valid
 */
export const validateGenre = (genre: string): boolean => {
  const genreRegex = /^[a-zA-Z0-9\s\-]{1,50}$/;
  return genreRegex.test(genre);
};

/**
 * Debounce a function
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Throttle a function
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Check if a string is empty or contains only whitespace
 * @param text - Text to check
 * @returns Whether the text is empty or whitespace
 */
export const isEmpty = (text: string): boolean => {
  return text.trim().length === 0;
};

/**
 * Deep clone an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Merge two objects recursively
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns Merged object
 */
export const mergeObjects = <T extends Record<string, any>>(
  obj1: T,
  obj2: Partial<T>
): T => {
  return {
    ...obj1,
    ...obj2,
  };
};

/**
 * Get a random element from an array
 * @param array - Array to pick from
 * @returns Random element from array
 */
export const getRandomElement = <T>(array: T[]): T | undefined => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Shuffle an array
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Remove duplicates from an array
 * @param array - Array to deduplicate
 * @returns Array without duplicates
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Remove null/undefined values from an array
 * @param array - Array to clean
 * @returns Array without null/undefined
 */
export const removeNullValues = <T>(array: (T | null | undefined)[]): T[] => {
  return array.filter((item): item is T => item != null);
};

/**
 * Get the initials from a name
 * @param name - Full name
 * @returns Initials (e.g., "John Doe" -> "JD")
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

/**
 * Convert bytes to human-readable format
 * @param bytes - Number of bytes
 * @returns Human-readable size (e.g., "2.5 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
