/**
 * Expo App Configuration
 * Loads environment variables from .env file
 */

// Load environment variables from .env file
require('dotenv').config();

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
      LASTFM_API_KEY: process.env.LASTFM_API_KEY,
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  };
};
