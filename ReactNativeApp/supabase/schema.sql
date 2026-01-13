-- Music Recommendation App - Supabase Database Schema
-- Generated: January 13, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- Extends Supabase auth.users with app-specific profile data
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  lastfm_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- USER PREFERENCES TABLE
-- Stores user music preferences and settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_genres TEXT[] DEFAULT '{}',
  favorite_moods TEXT[] DEFAULT '{}',
  top_artists TEXT[] DEFAULT '{}',
  explicit_filter BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster user lookups
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- RECOMMENDATIONS TABLE
-- Stores all generated recommendations with full context
-- ============================================================================
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  recommendation_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_session_id ON recommendations(session_id);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at DESC);
CREATE INDEX idx_recommendations_user_created ON recommendations(user_id, created_at DESC);

-- ============================================================================
-- HIGHLIGHTS TABLE
-- Stores user's highlighted tracks for quick access
-- ============================================================================
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album_art TEXT,
  mood_tags TEXT[] DEFAULT '{}',
  context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_youtube_id ON highlights(youtube_id);
CREATE INDEX idx_highlights_created_at ON highlights(created_at DESC);
CREATE INDEX idx_highlights_user_created ON highlights(user_id, created_at DESC);

-- ============================================================================
-- FAVORITES TABLE
-- Stores user's favorite tracks
-- ============================================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album_art TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, youtube_id)
);

-- Create indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_youtube_id ON favorites(youtube_id);
CREATE INDEX idx_favorites_added_at ON favorites(added_at DESC);
CREATE INDEX idx_favorites_user_added ON favorites(user_id, added_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Recommendations policies
CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- Highlights policies
CREATE POLICY "Users can view own highlights"
  ON highlights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights"
  ON highlights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights"
  ON highlights FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_preferences table
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile automatically after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- VIEWS
-- Helpful views for common queries
-- ============================================================================

-- View: User profile with preferences
CREATE OR REPLACE VIEW user_profiles_with_preferences AS
SELECT
  u.id,
  u.username,
  u.email,
  u.avatar_url,
  u.lastfm_username,
  u.created_at,
  u.updated_at,
  p.favorite_genres,
  p.favorite_moods,
  p.top_artists,
  p.explicit_filter
FROM users u
LEFT JOIN user_preferences p ON u.id = p.user_id;

-- View: Recent recommendations with counts
CREATE OR REPLACE VIEW recent_recommendations AS
SELECT
  r.id,
  r.user_id,
  r.user_message,
  r.ai_response,
  jsonb_array_length(r.recommendation_data) as track_count,
  r.created_at
FROM recommendations r
ORDER BY r.created_at DESC;

-- ============================================================================
-- SAMPLE DATA SEED (for development/testing)
-- Uncomment to populate with sample data
-- ============================================================================

-- INSERT INTO users (id, username, email) VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', 'testuser', 'test@example.com');

-- INSERT INTO user_preferences (user_id, favorite_genres, favorite_moods) VALUES
--   ('550e8400-e29b-41d4-a716-446655440000', ARRAY['rock', 'jazz'], ARRAY['energetic', 'chill']);

-- ============================================================================
-- CLEANUP FUNCTIONS (for development)
-- ============================================================================

-- Function to clean up old recommendations (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_recommendations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM recommendations
  WHERE created_at < NOW() - INTERVAL '90 days'
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS (for service role)
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SCHEMA VERIFICATION
-- Query to verify all tables were created successfully
-- ============================================================================

-- SELECT table_name, table_type
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;

-- Schema setup complete!
