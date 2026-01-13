# API Setup Quick Guide 🚀

## Overview
This guide helps you obtain all necessary API keys for the music recommendation app.

---

## 1. DeepSeek API (AI Chat & Intent Extraction)

### Purpose
- Extract user intent (mood, genre, activity)
- Generate personalized AI responses
- Provide conversational experience

### Steps to Get API Key

1. **Visit:** https://platform.deepseek.com/
2. **Sign Up:**
   - Click "Sign Up" or "Get Started"
   - Use email or GitHub account
3. **Navigate to API Keys:**
   - Go to https://platform.deepseek.com/api_keys
   - Or: Dashboard → API Keys
4. **Create New Key:**
   - Click "Create API Key"
   - Name it: "MusicRecommendationApp"
   - Copy the key immediately (won't show again!)
5. **Add to .env:**
   ```env
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Pricing
- **Free Tier:** $5 credit for new users
- **Paid:** ~$0.14 per 1M input tokens, ~$0.28 per 1M output tokens
- **Estimate:** ~100 conversations with free tier

### Testing
```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## 2. Last.fm API (Music Data)

### Purpose
- Fetch user's top artists
- Find similar artists
- Get track information
- Discover new music based on preferences

### Steps to Get API Key

1. **Create Account:** https://www.last.fm/join
2. **Navigate to API Page:** https://www.last.fm/api/account/create
3. **Fill Application Form:**
   - **Application Name:** Music Recommendation App
   - **Application Description:** Mobile app for personalized music recommendations
   - **Application Homepage:** https://yourapp.com (can use GitHub repo)
   - **Callback URL:** Leave empty (not needed for now)
4. **Submit & Copy:**
   - After submission, you'll get:
     - API Key (use this)
     - Shared Secret (save for future use)
5. **Add to .env:**
   ```env
   LASTFM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Features Used
- `user.getTopArtists` - Get user's favorite artists
- `artist.getSimilar` - Find similar artists
- `track.search` - Search for tracks
- `chart.getTopArtists` - Get popular artists

### Limitations
- **Rate Limit:** 5 requests per second per IP
- **Free:** Unlimited requests
- **Note:** Some methods require user authentication

### Testing
```bash
curl "http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=YOUR_KEY&format=json&limit=5"
```

---

## 3. YouTube Data API v3 (Video Search)

### Purpose
- Search for music videos
- Get video details and thumbnails
- Provide playback integration
- Extract album art from thumbnails

### Steps to Get API Key

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Create a Project:**
   - Click "Select a project" → "New Project"
   - **Project Name:** MusicRecommendationApp
   - Click "Create"
3. **Enable YouTube Data API v3:**
   - Search for "YouTube Data API v3"
   - Click on it
   - Click "Enable"
4. **Create Credentials:**
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. **Restrict API Key (Recommended):**
   - Click on the key to edit
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose "YouTube Data API v3"
   - Under "Application restrictions":
     - Choose "Android apps" or "iOS apps"
     - Add your app's package name/bundle ID
   - Click "Save"
6. **Add to .env:**
   ```env
   YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Quota & Limits
- **Daily Quota:** 10,000 units (free tier)
- **Search Cost:** 100 units per request
- **Estimate:** ~100 searches per day
- **Quota Resets:** Daily at midnight Pacific Time

### Quota Management in App
The app tracks quota usage and stops at 9,000 units (90% of limit)

### Testing
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=jazz+music&type=video&videoCategoryId=10&maxResults=5&key=YOUR_KEY"
```

---

## 4. Supabase (Database & Auth)

### Purpose
- User authentication (sign up/in/out)
- Store user profiles
- Save recommendation history
- Sync favorites across devices

### Steps to Set Up

1. **Create Account:** https://supabase.com/
2. **Create New Project:**
   - Click "New Project"
   - **Name:** music-recommendations
   - **Database Password:** (save this!)
   - **Region:** Choose closest to your users
   - Click "Create new project"
3. **Wait for Setup:** (2-3 minutes)
4. **Get API Credentials:**
   - Go to: Settings → API
   - Copy:
     - **Project URL:** `https://xxxxx.supabase.co`
     - **anon public key:** (under "Project API keys")
5. **Add to .env:**
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
   ```

### Database Setup

#### Create Tables

**1. Profiles Table:**
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  favorite_genres TEXT[],
  favorite_moods TEXT[],
  lastfm_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**2. Recommendations Table:**
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  query TEXT NOT NULL,
  ai_response TEXT,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" ON recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON recommendations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**3. Favorites Table:**
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  track_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  album_art TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, youtube_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);
```

### Authentication Setup

1. **Enable Email Auth:**
   - Go to: Authentication → Providers
   - Enable "Email"
   - Configure email templates if needed

2. **Configure Auth Settings:**
   - Go to: Authentication → Settings
   - Set up redirect URLs for your app
   - Configure email confirmation (optional)

### Testing Supabase
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Test query
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log(data, error);
```

---

## Complete .env Template

Create this file: `ReactNativeApp/.env`

```env
# DeepSeek API (AI Chat)
# Get from: https://platform.deepseek.com/api_keys
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Last.fm API (Music Data)
# Get from: https://www.last.fm/api/account/create
LASTFM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# YouTube Data API v3 (Video Search)
# Get from: https://console.cloud.google.com/
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Supabase (Database & Auth)
# Get from: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

---

## Security Best Practices

### ✅ DO:
- Store `.env` in `.gitignore`
- Use environment variables for all secrets
- Restrict API keys to specific services
- Rotate keys periodically
- Use Supabase Row Level Security (RLS)

### ❌ DON'T:
- Commit `.env` to Git
- Hardcode API keys in source code
- Share API keys publicly
- Use production keys in development
- Ignore rate limits

---

## Cost Estimation

### Free Tier Limits (Per Month)

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **DeepSeek** | $5 credit (~100 conversations) | ~$0.14/1M tokens |
| **Last.fm** | Unlimited requests | Free forever |
| **YouTube** | 10,000 units/day (~100 searches) | $0 (quota-based) |
| **Supabase** | 500MB database, 2GB bandwidth | $25/month Pro |

### Monthly Cost Estimate (Light Usage)
- **100 users, 10 requests each:**
  - DeepSeek: ~$1-2
  - Last.fm: Free
  - YouTube: Free (within quota)
  - Supabase: Free
- **Total: $1-2/month**

### Monthly Cost Estimate (Heavy Usage)
- **1,000 users, 50 requests each:**
  - DeepSeek: ~$10-20
  - Last.fm: Free
  - YouTube: May need paid tier
  - Supabase: ~$25 (Pro plan)
- **Total: $35-45/month**

---

## Troubleshooting

### "Invalid API Key" Error
- **Check:** Key is copied correctly without spaces
- **Check:** Key is for the correct service
- **Check:** API is enabled in dashboard
- **Solution:** Regenerate key and update .env

### "Quota Exceeded" Error
- **YouTube:** Wait until midnight PT for quota reset
- **DeepSeek:** Check billing and add credits
- **Solution:** Implement caching to reduce calls

### "CORS Error" (Web Only)
- **Cause:** API doesn't allow web requests
- **Solution:** Use proxy or server-side calls
- **Note:** React Native doesn't have CORS issues

### "Network Request Failed"
- **Check:** Device has internet connection
- **Check:** API endpoint is reachable
- **Check:** Firewall/VPN not blocking requests
- **Solution:** Test with curl first

---

## Testing All APIs Together

Run this test script in your app:

```typescript
// Test script: testApis.ts
import { testDeepSeek } from '@/services/api/deepseek';
import { testLastFm } from '@/services/api/lastfm';
import { testYouTube } from '@/services/api/youtube';
import { testSupabase } from '@/services/api/supabase';

export async function testAllApis() {
  console.log('🧪 Testing all APIs...\n');

  // Test DeepSeek
  try {
    const response = await sendMessage([
      { role: 'user', content: 'Hello, test!' }
    ]);
    console.log('✅ DeepSeek API: Working');
  } catch (error) {
    console.error('❌ DeepSeek API:', error);
  }

  // Test Last.fm
  try {
    const artists = await getTopArtists();
    console.log('✅ Last.fm API: Working');
  } catch (error) {
    console.error('❌ Last.fm API:', error);
  }

  // Test YouTube
  try {
    const videos = await searchMusic('test music');
    console.log('✅ YouTube API: Working');
  } catch (error) {
    console.error('❌ YouTube API:', error);
  }

  // Test Supabase
  try {
    const { data } = await supabase.auth.getSession();
    console.log('✅ Supabase API: Working');
  } catch (error) {
    console.error('❌ Supabase API:', error);
  }

  console.log('\n✨ API test complete!');
}
```

---

## Support & Resources

### Official Documentation
- **DeepSeek:** https://platform.deepseek.com/docs
- **Last.fm:** https://www.last.fm/api/intro
- **YouTube:** https://developers.google.com/youtube/v3
- **Supabase:** https://supabase.com/docs

### Community Support
- **DeepSeek Discord:** https://discord.gg/deepseek
- **Last.fm Forum:** https://www.last.fm/forum
- **YouTube Developers:** https://support.google.com/youtube/
- **Supabase Discord:** https://discord.supabase.com/

### Alternative APIs (If Needed)
- **AI:** OpenAI GPT, Anthropic Claude, Cohere
- **Music:** Spotify API, Apple Music API, Deezer API
- **Video:** Vimeo API, Dailymotion API
- **Database:** Firebase, MongoDB Atlas, PlanetScale

---

## Ready to Test! 🎉

Once you have all API keys in your `.env` file:

1. Restart the development server: `npm start`
2. Open the app on your device/simulator
3. Send a test message: "I want chill music"
4. Watch the magic happen! ✨

**Need Help?** Check the [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) for comprehensive testing instructions.
