import { Message, Recommendation, UserProfile } from '@/types';
import { generateId } from '@/utils/helpers';

/**
 * Mock Messages - Sample conversation for testing
 */
export const MOCK_MESSAGES: Message[] = [
  {
    id: generateId(),
    text: "👋 Hey there! I'm your AI music buddy. I'm excited to help you discover amazing music today! What kind of vibe are you feeling?",
    sender: 'ai',
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    status: 'sent',
  },
  {
    id: generateId(),
    text: "🎭 Surprise me with something energetic",
    sender: 'user',
    timestamp: new Date(Date.now() - 4 * 60000), // 4 minutes ago
    status: 'sent',
  },
  {
    id: generateId(),
    text: "Oh I LOVE that energy! 🔥 Let me dig into some high-octane tracks that'll get you moving. I'm pulling together a mix of indie rock bangers and electronic dancefloor hits.",
    sender: 'ai',
    timestamp: new Date(Date.now() - 3 * 60000), // 3 minutes ago
    status: 'sent',
    recommendations: [
      {
        id: generateId(),
        title: 'Take Me Out',
        artist: 'Franz Ferdinand',
        type: 'highlight',
        youtubeId: 'GhCXAVLRZZw',
        albumArt: 'https://via.placeholder.com/300?text=Franz+Ferdinand',
        duration: '4:00',
      },
      {
        id: generateId(),
        title: 'Reptilia',
        artist: 'The Strokes',
        type: 'deep-cut',
        youtubeId: 'ybktVcAcMEU',
        albumArt: 'https://via.placeholder.com/300?text=The+Strokes',
        duration: '4:00',
      },
    ],
  },
  {
    id: generateId(),
    text: "What about something by Arctic Monkeys? They're my favorite band right now",
    sender: 'user',
    timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
    status: 'sent',
  },
  {
    id: generateId(),
    text: "Arctic Monkeys? YES! 🎸 Alex Turner is a genius. I'm curating a collection that spans their whole discography - from the raw Sheffield sound to their psychedelic Tranquility Base Hotel & Casino era. You're going to love this!",
    sender: 'ai',
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    status: 'sent',
    recommendations: [
      {
        id: generateId(),
        title: 'R U Mine?',
        artist: 'Arctic Monkeys',
        type: 'mainstream',
        youtubeId: 'gKKzJcUevN8',
        albumArt: 'https://via.placeholder.com/300?text=Arctic+Monkeys',
        duration: '3:00',
      },
      {
        id: generateId(),
        title: 'Fluorescent Adolescent',
        artist: 'Arctic Monkeys',
        type: 'mainstream',
        youtubeId: 'MA-Mq03HhLc',
        albumArt: 'https://via.placeholder.com/300?text=Arctic+Monkeys',
        duration: '3:00',
      },
      {
        id: generateId(),
        title: 'Cornerstone',
        artist: 'Arctic Monkeys',
        type: 'deep-cut',
        youtubeId: 'VEwvDj7uGlM',
        albumArt: 'https://via.placeholder.com/300?text=Arctic+Monkeys',
        duration: '4:00',
      },
    ],
  },
];

/**
 * Mock Recommendations - Comprehensive testing data
 */
export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  // Highlight (1)
  {
    id: generateId(),
    title: 'Take Me Out',
    artist: 'Franz Ferdinand',
    type: 'highlight',
    youtubeId: 'GhCXAVLRZZw',
    albumArt: 'https://via.placeholder.com/300?text=Franz+Ferdinand',
    duration: '4:00',
  },

  // Deep Cuts (5)
  {
    id: generateId(),
    title: 'Reptilia',
    artist: 'The Strokes',
    type: 'deep-cut',
    youtubeId: 'ybktVcAcMEU',
    albumArt: 'https://via.placeholder.com/300?text=The+Strokes',
    duration: '4:00',
  },
  {
    id: generateId(),
    title: 'Cornerstone',
    artist: 'Arctic Monkeys',
    type: 'deep-cut',
    youtubeId: 'VEwvDj7uGlM',
    albumArt: 'https://via.placeholder.com/300?text=Arctic+Monkeys',
    duration: '4:00',
  },
  {
    id: generateId(),
    title: 'Two Weeks',
    artist: 'Grimes',
    type: 'deep-cut',
    youtubeId: '4AjL6P7BPR8',
    albumArt: 'https://via.placeholder.com/300?text=Grimes',
    duration: '4:00',
  },
  {
    id: generateId(),
    title: 'Purple Bottle',
    artist: 'The Black Lips',
    type: 'deep-cut',
    youtubeId: 'qe2rLCNJhAU',
    albumArt: 'https://via.placeholder.com/300?text=The+Black+Lips',
    duration: '3:00',
  },
  {
    id: generateId(),
    title: 'The Mother We Share',
    artist: 'CHVRCHES',
    type: 'deep-cut',
    youtubeId: 'sKYy-75dEIU',
    albumArt: 'https://via.placeholder.com/300?text=CHVRCHES',
    duration: '3:00',
  },

  // Mainstream (5)
  {
    id: generateId(),
    title: 'R U Mine?',
    artist: 'Arctic Monkeys',
    type: 'mainstream',
    youtubeId: 'gKKzJcUevN8',
    albumArt: 'https://via.placeholder.com/300?text=Arctic+Monkeys',
    duration: '3:00',
  },
  {
    id: generateId(),
    title: 'Fluorescent Adolescent',
    artist: 'Arctic Monkeys',
    type: 'mainstream',
    youtubeId: 'MA-Mq03HhLc',
    albumArt: 'https://via.placeholder.com/300?text=Arctic+Monkeys',
    duration: '3:00',
  },
  {
    id: generateId(),
    title: 'Somebody Told Me',
    artist: 'The Killers',
    type: 'mainstream',
    youtubeId: 'sFmlgP7I-Gw',
    albumArt: 'https://via.placeholder.com/300?text=The+Killers',
    duration: '3:00',
  },
  {
    id: generateId(),
    title: 'Sex on Fire',
    artist: 'Kings of Leon',
    type: 'mainstream',
    youtubeId: 'RF0HhrSCWmA',
    albumArt: 'https://via.placeholder.com/300?text=Kings+of+Leon',
    duration: '3:00',
  },
  {
    id: generateId(),
    title: 'Use Somebody',
    artist: 'Kings of Leon',
    type: 'mainstream',
    youtubeId: 'zA8mNiN2eVE',
    albumArt: 'https://via.placeholder.com/300?text=Kings+of+Leon',
    duration: '4:00',
  },
];

/**
 * Mock User Profile
 */
export const MOCK_USER_PROFILE: UserProfile = {
  userId: 'user_' + generateId(),
  email: 'musiclover@example.com',
  preferences: {
    genres: ['Rock', 'Electronic', 'Indie', 'Alternative'],
    moods: ['Energetic', 'Chill', 'Focus', 'Party'],
  },
  lastfmUsername: 'musiclover123',
  topArtists: [
    'Arctic Monkeys',
    'The Strokes',
    'Franz Ferdinand',
    'CHVRCHES',
    'The Killers',
    'Kings of Leon',
    'Grimes',
    'The Black Lips',
  ],
};

/**
 * Seed mock data into chat context
 * Adds messages with delay for realistic conversation flow
 * @param addMessage - Function from useChatContext to add messages
 * @returns Promise that resolves when all messages are added
 */
export const seedMockData = async (
  addMessage: (message: Message) => void
): Promise<void> => {
  return new Promise((resolve) => {
    MOCK_MESSAGES.forEach((message, index) => {
      setTimeout(() => {
        addMessage(message);
        if (index === MOCK_MESSAGES.length - 1) {
          resolve();
        }
      }, index * 500); // 500ms delay between messages
    });
  });
};

/**
 * Get random recommendation from mock data
 */
export const getRandomRecommendation = (): Recommendation => {
  return MOCK_RECOMMENDATIONS[
    Math.floor(Math.random() * MOCK_RECOMMENDATIONS.length)
  ];
};

/**
 * Get recommendations by type
 */
export const getRecommendationsByType = (type: 'highlight' | 'deep-cut' | 'mainstream') => {
  return MOCK_RECOMMENDATIONS.filter((rec) => rec.type === type);
};

/**
 * Create a mock AI response with recommendations
 */
export const createMockAIResponse = (
  text: string,
  count: number = 2
): Message => {
  const recommendations: Recommendation[] = [];
  const types: ('highlight' | 'deep-cut' | 'mainstream')[] = [
    'highlight',
    'deep-cut',
    'mainstream',
  ];

  for (let i = 0; i < count; i++) {
    const typeRecommendations = getRecommendationsByType(types[i % types.length]);
    const random = typeRecommendations[
      Math.floor(Math.random() * typeRecommendations.length)
    ];
    if (random) {
      recommendations.push(random);
    }
  }

  return {
    id: generateId(),
    text,
    sender: 'ai',
    timestamp: new Date(),
    status: 'sent',
    recommendations,
  };
};

/**
 * Development helper - logs mock data to console
 */
export const logMockDataSummary = (): void => {
  if (__DEV__) {
    console.log('🎵 Mock Data Summary:');
    console.log(`  Messages: ${MOCK_MESSAGES.length}`);
    console.log(`  Recommendations: ${MOCK_RECOMMENDATIONS.length}`);
    console.log(`    - Highlights: ${getRecommendationsByType('highlight').length}`);
    console.log(`    - Deep Cuts: ${getRecommendationsByType('deep-cut').length}`);
    console.log(`    - Mainstream: ${getRecommendationsByType('mainstream').length}`);
    console.log(`  User Profile: ${MOCK_USER_PROFILE.email}`);
    console.log(`  Genres: ${MOCK_USER_PROFILE.preferences.genres.join(', ')}`);
  }
};

export default {
  MOCK_MESSAGES,
  MOCK_RECOMMENDATIONS,
  MOCK_USER_PROFILE,
  seedMockData,
  getRandomRecommendation,
  getRecommendationsByType,
  createMockAIResponse,
  logMockDataSummary,
};
