/**
 * Environment Configuration
 * Manages and validates environment variables for the app
 */

import Constants from 'expo-constants';

interface EnvConfig {
  groqApiKey: string;
  lastfmApiKey: string;
  youtubeApiKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  isDevelopment: boolean;
}

/**
 * Gets environment variable with validation
 */
function getEnvVar(key: string): string {
  // Try to get from expo-constants extra config first
  const value = Constants.expoConfig?.extra?.[key] || process.env[key];
  
  if (!value || value.includes('your_') || value.includes('_here')) {
    throw new Error(
      `Missing or invalid environment variable: ${key}\n` +
      `Please set this in your .env file or app.config.js`
    );
  }
  
  return value;
}

/**
 * Gets optional environment variable
 */
function getOptionalEnvVar(key: string): string | undefined {
  try {
    return getEnvVar(key);
  } catch {
    return undefined;
  }
}

/**
 * Validates all required environment variables
 */
function validateEnv(): void {
  const requiredVars = [
    'GROQ_API_KEY',
    'LASTFM_API_KEY',
    'YOUTUBE_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    const value = Constants.expoConfig?.extra?.[varName] || process.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing or invalid environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please configure these in your .env file.\n` +
      `The app will use placeholder values for development.`
    );
  }
}

/**
 * Creates environment configuration with validation
 */
function createEnvConfig(): EnvConfig {
  // Validate environment in development
  if (__DEV__) {
    validateEnv();
  }

  return {
    groqApiKey: getOptionalEnvVar('GROQ_API_KEY') || 'dev_placeholder',
    lastfmApiKey: getOptionalEnvVar('LASTFM_API_KEY') || 'dev_placeholder',
    youtubeApiKey: getOptionalEnvVar('YOUTUBE_API_KEY') || 'dev_placeholder',
    supabaseUrl: getOptionalEnvVar('SUPABASE_URL') || 'http://localhost:54321',
    supabaseAnonKey: getOptionalEnvVar('SUPABASE_ANON_KEY') || 'dev_placeholder',
    isDevelopment: __DEV__,
  };
}

// Export singleton config instance
export const env = createEnvConfig();

// Log configuration status in development
if (env.isDevelopment) {
  console.log('🔧 Environment Configuration:');
  console.log(`  - Groq API: ${env.groqApiKey !== 'dev_placeholder' ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - Last.fm API: ${env.lastfmApiKey !== 'dev_placeholder' ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - YouTube API: ${env.youtubeApiKey !== 'dev_placeholder' ? '✓ Configured' : '✗ Missing'}`);
  console.log(`  - Supabase: ${env.supabaseUrl !== 'http://localhost:54321' ? '✓ Configured' : '✗ Missing'}`);
}

export type { EnvConfig };
