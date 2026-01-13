# System Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT NATIVE APP                         │
│                     (Expo + TypeScript)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ↓                     ↓                     ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Chat Screen │    │History Screen│    │Profile Screen│
│  (index.tsx) │    │              │    │              │
└──────┬───────┘    └──────────────┘    └──────┬───────┘
       │                                         │
       │                                         │
       └────────────┬────────────────────────────┘
                    ↓
           ┌────────────────┐
           │  ChatContext   │
           │  (State Mgmt)  │
           └────────┬───────┘
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ AsyncStorage │ │Recommendation│ │   Supabase   │
│ (Offline)    │ │    Engine    │ │   Client     │
└──────────────┘ └──────┬───────┘ └──────┬───────┘
                        │                 │
              ┌─────────┼─────────┐       │
              ↓         ↓         ↓       ↓
        ┌──────────┐┌──────┐┌─────────┐┌──────┐
        │ DeepSeek ││Last.fm││ YouTube ││ Auth │
        │   API    ││  API  ││   API   ││ DB   │
        └──────────┘└───────┘└─────────┘└──────┘
```

## Component Architecture

```
app/
├── _layout.tsx ← Root (wraps with ChatProvider)
│
├── (tabs)/
│   ├── _layout.tsx ← Tab navigator
│   │
│   ├── index.tsx ← CHAT SCREEN (Main Integration Point)
│   │   ├── Uses: useChatContext()
│   │   ├── State: messages, loading, error from context
│   │   ├── Actions: generateRecommendations()
│   │   └── UI:
│   │       ├── MessageBubble (user/AI)
│   │       ├── RecommendationList (highlight, deep-cuts, mainstream)
│   │       ├── LoadingIndicator (rotating messages)
│   │       ├── ErrorBubble (with retry)
│   │       └── InputBar (send messages)
│   │
│   ├── history.tsx ← History Screen
│   │   ├── Search & filters
│   │   ├── Past recommendations
│   │   └── Empty state
│   │
│   └── profile.tsx ← Profile Screen
│       ├── User stats
│       ├── Preference chips
│       ├── Settings
│       └── Clear chat
│
└── details/
    └── [id].tsx ← Song details (future)
```

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ChatContext                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ STATE:                                              │   │
│  │  - messages: Message[]                              │   │
│  │  - isLoading: boolean                               │   │
│  │  - error: string | null                             │   │
│  │  - currentUser: UserProfile | null                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ACTIONS (via dispatch):                             │   │
│  │  - ADD_MESSAGE                                       │   │
│  │  - SET_LOADING                                       │   │
│  │  - SET_ERROR                                         │   │
│  │  - UPDATE_PROFILE                                    │   │
│  │  - CLEAR_CHAT                                        │   │
│  │  - REMOVE_MESSAGE                                    │   │
│  │  - UPDATE_MESSAGE                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ METHODS:                                             │   │
│  │  - generateRecommendations(userMessage)   ← NEW!    │   │
│  │  - loadUserProfile()                      ← NEW!    │   │
│  │  - addMessage(message)                               │   │
│  │  - setLoading(isLoading)                             │   │
│  │  - clearChat()                                       │   │
│  │  - updateProfile(profile)                            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Message Flow

```
1. USER ACTION
   ↓
   User types: "I want energetic music"
   ↓
   Presses send button

2. UI LAYER (index.tsx)
   ↓
   handleSend() called
   ↓
   Validates input (not empty)
   ↓
   Checks not already loading
   ↓
   Clears input field
   ↓
   Calls context.generateRecommendations(message)

3. CONTEXT LAYER (ChatContext.tsx)
   ↓
   generateRecommendations(userMessage) executes:
   
   a) Dispatch: SET_LOADING (true)
   b) Dispatch: SET_ERROR (null)
   c) Create user message object
   d) Dispatch: ADD_MESSAGE (user message)
   e) Convert UserProfile → EngineUserProfile
   f) Call recommendationEngine.generateRecommendations()
      ↓
      [See Engine Flow below]
      ↓
   g) Receive: { aiResponse, recommendations }
   h) Create AI message object with recommendations
   i) Dispatch: ADD_MESSAGE (AI message)
   j) Save to AsyncStorage (automatic via reducer)
   k) TODO: Save to Supabase
   l) Dispatch: SET_LOADING (false)

   (Error path: catch → ADD_MESSAGE with error → SET_ERROR → SET_LOADING false)

4. UI UPDATE
   ↓
   Context state changes
   ↓
   useChatContext() hook triggers re-render
   ↓
   FlatList receives new messages array
   ↓
   renderMessage() called for new items
   ↓
   MessageBubble components render
   ↓
   RecommendationList components render
   ↓
   Auto-scroll to bottom
```

## Recommendation Engine Flow

```
recommendationEngine.generateRecommendations(userMessage, profile, history)
   ↓
   ┌─────────────────────────────────────────────────────┐
   │ STEP 1: Extract Intent (DeepSeek AI)               │
   ├─────────────────────────────────────────────────────┤
   │ Input:                                              │
   │   - User message: "I want energetic music"          │
   │   - Conversation history                            │
   │   - User profile                                    │
   │                                                     │
   │ System Prompt:                                      │
   │   "Extract mood, activity, genre from message..."   │
   │                                                     │
   │ Output:                                             │
   │   {                                                 │
   │     mood: "energetic",                              │
   │     activity: null,                                 │
   │     genre: ["pop", "electronic"],                   │
   │     explanation: "User wants upbeat music"          │
   │   }                                                 │
   │                                                     │
   │ Error Handling:                                     │
   │   - 30s timeout                                     │
   │   - 3 retry attempts                                │
   │   - Fallback: Default intent object                 │
   └─────────────────────────────────────────────────────┘
                        ↓
   ┌─────────────────────────────────────────────────────┐
   │ STEP 2: Get Seed Artists (Last.fm API)             │
   ├─────────────────────────────────────────────────────┤
   │ Branch A: User has Last.fm username                │
   │   → getUserTopArtists(username)                     │
   │   → Get user's favorite artists                     │
   │                                                     │
   │ Branch B: No Last.fm OR fallback                   │
   │   → Map mood/genre to artist genres                 │
   │   → getTopArtists() (global charts)                 │
   │   → Filter by extracted genres                      │
   │                                                     │
   │ Enhancements:                                       │
   │   → getSimilarArtists() for variety                 │
   │                                                     │
   │ Output:                                             │
   │   ["Daft Punk", "Justice", "MGMT", "Foster..."]    │
   │                                                     │
   │ Caching: 5 minutes (reduces API calls)              │
   └─────────────────────────────────────────────────────┘
                        ↓
   ┌─────────────────────────────────────────────────────┐
   │ STEP 3: Search Music Videos (YouTube API)          │
   ├─────────────────────────────────────────────────────┤
   │ For each seed artist:                               │
   │   1. Search: "{artist} {genre}" (e.g., "MGMT pop")  │
   │   2. Filter: category=Music, type=video             │
   │   3. Limit: 3 results per artist                    │
   │   4. Extract: title, videoId, thumbnail, duration   │
   │                                                     │
   │ Parallel Execution:                                 │
   │   → Search 5 artists simultaneously                 │
   │   → Combine results (~15 videos)                    │
   │                                                     │
   │ Quota Management:                                   │
   │   → Track: 100 units per search                     │
   │   → Daily limit: 10,000 units (100 searches)        │
   │   → Stop at 90% to prevent overages                 │
   │                                                     │
   │ Output:                                             │
   │   [{                                                │
   │     id: "abc123",                                   │
   │     title: "MGMT - Electric Feel",                  │
   │     artist: "MGMT",                                 │
   │     albumArt: "https://...",                        │
   │     youtubeId: "abc123",                            │
   │     duration: "3:49",                               │
   │   }, ...]                                           │
   │                                                     │
   │ Caching: 10 minutes                                 │
   └─────────────────────────────────────────────────────┘
                        ↓
   ┌─────────────────────────────────────────────────────┐
   │ STEP 4: Score & Categorize Tracks                  │
   ├─────────────────────────────────────────────────────┤
   │ For each track:                                     │
   │   score = scoreTrackRelevance(track, intent)        │
   │                                                     │
   │ Scoring Algorithm (0-100):                          │
   │   BASE: 50 points                                   │
   │   + Mood match: +30 points                          │
   │   + Genre match: +20 points                         │
   │   + Activity match: +10 points                      │
   │   + Newness penalty: -5 per day old (max -20)       │
   │                                                     │
   │ Example:                                            │
   │   "MGMT - Electric Feel"                            │
   │   - Base: 50                                        │
   │   - Mood (energetic): +30                           │
   │   - Genre (pop): +20                                │
   │   - Activity: 0                                     │
   │   = 100 points                                      │
   │                                                     │
   │ Categorization:                                     │
   │   1. Sort by score (highest first)                  │
   │   2. HIGHLIGHT = top track                          │
   │   3. DEEP_CUTS = obscure + high score (3 tracks)    │
   │   4. MAINSTREAM = popular + high score (3 tracks)   │
   │                                                     │
   │ Obscurity Calculation:                              │
   │   - viewCount < 10M = obscure                       │
   │   - viewCount > 50M = mainstream                    │
   │                                                     │
   │ Output:                                             │
   │   {                                                 │
   │     highlight: { ... },    // 1 track              │
   │     deepCuts: [...],        // 3 tracks             │
   │     mainstream: [...]       // 3 tracks             │
   │   }                                                 │
   └─────────────────────────────────────────────────────┘
                        ↓
   ┌─────────────────────────────────────────────────────┐
   │ STEP 5: Generate AI Response (DeepSeek AI)         │
   ├─────────────────────────────────────────────────────┤
   │ Input:                                              │
   │   - User message                                    │
   │   - Extracted intent                                │
   │   - Recommendations (with metadata)                 │
   │   - User profile                                    │
   │   - Conversation history                            │
   │                                                     │
   │ System Prompt:                                      │
   │   "Generate personalized response about these       │
   │    recommendations. Be friendly and contextual."    │
   │                                                     │
   │ Response Style:                                     │
   │   - Conversational tone                             │
   │   - Acknowledges user's mood/activity               │
   │   - Explains why tracks were chosen                 │
   │   - Encourages exploration                          │
   │                                                     │
   │ Example Output:                                     │
   │   "Perfect! Here are some energetic tracks to       │
   │    pump you up! 🎵 Starting with MGMT's            │
   │    'Electric Feel' - a high-energy indie pop       │
   │    classic. Plus some underground gems and          │
   │    popular hits to keep the vibe going!"            │
   │                                                     │
   │ Error Handling:                                     │
   │   - Fallback: Generic response with track list      │
   └─────────────────────────────────────────────────────┘
                        ↓
   ┌─────────────────────────────────────────────────────┐
   │ RETURN TO CONTEXT                                   │
   ├─────────────────────────────────────────────────────┤
   │ {                                                   │
   │   aiResponse: "Perfect! Here are some...",          │
   │   recommendations: [                                │
   │     { id, title, artist, type: "highlight", ... },  │
   │     { id, title, artist, type: "deep-cut", ... },   │
   │     { id, title, artist, type: "mainstream", ... }  │
   │   ]                                                 │
   │ }                                                   │
   └─────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────────────────────────┐
│                  ERROR SCENARIOS                       │
└────────────────────────────────────────────────────────┘

1. NETWORK ERROR
   User offline → API call fails
   ↓
   recommendationEngine catches error
   ↓
   Throws: "Network request failed"
   ↓
   ChatContext catch block
   ↓
   Create error message: "Oops! I couldn't generate..."
   ↓
   ADD_MESSAGE (error)
   ↓
   UI renders red bubble with retry button

2. API KEY INVALID
   Invalid/expired key → API returns 401
   ↓
   API client retry logic (3 attempts)
   ↓
   All retries fail
   ↓
   recommendationEngine catches
   ↓
   Fallback to mock data (if available)
   ↓
   Return fallback recommendations
   ↓
   UI shows recommendations with note

3. QUOTA EXCEEDED
   YouTube daily limit reached
   ↓
   API returns 403 quota error
   ↓
   YouTube client detects quota
   ↓
   Returns empty array + logs warning
   ↓
   recommendationEngine continues with Last.fm only
   ↓
   Returns text-based recommendations
   ↓
   UI shows AI response without videos

4. TIMEOUT
   DeepSeek takes > 30 seconds
   ↓
   API client timeout triggers
   ↓
   Throws timeout error
   ↓
   Retry logic attempts again
   ↓
   If all retries timeout:
   ↓
   recommendationEngine uses default intent
   ↓
   Continues with generic recommendations

5. INVALID RESPONSE
   API returns malformed JSON
   ↓
   JSON.parse() fails
   ↓
   API client catches parse error
   ↓
   Logs error with request details
   ↓
   Returns empty/fallback data
   ↓
   Engine handles gracefully
```

## Data Models

```
┌──────────────────────────────────────────────────────┐
│                    Message                           │
├──────────────────────────────────────────────────────┤
│ id: string (UUID)                                    │
│ text: string                                         │
│ sender: 'user' | 'ai'                                │
│ timestamp: Date                                      │
│ recommendations?: Recommendation[]                   │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  Recommendation                      │
├──────────────────────────────────────────────────────┤
│ id: string (UUID)                                    │
│ title: string                                        │
│ artist: string                                       │
│ albumArt: string (URL)                               │
│ youtubeId: string                                    │
│ type: 'highlight' | 'deep-cut' | 'mainstream'       │
│ duration: string (e.g., "3:45")                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                   UserProfile                        │
├──────────────────────────────────────────────────────┤
│ id?: string (UUID)                                   │
│ username?: string                                    │
│ email?: string                                       │
│ favoriteGenres?: string[]                            │
│ favoriteMoods?: string[]                             │
│ lastfmUsername?: string                              │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│                  DeepSeekIntent                      │
├──────────────────────────────────────────────────────┤
│ mood?: string                                        │
│ activity?: string                                    │
│ genre?: string[]                                     │
│ explanation?: string                                 │
└──────────────────────────────────────────────────────┘
```

## API Integration Points

```
┌────────────────────────────────────────────────────────┐
│                    DeepSeek API                        │
├────────────────────────────────────────────────────────┤
│ Endpoint: https://api.deepseek.com/v1/chat/completions│
│ Method: POST                                           │
│ Auth: Bearer token                                     │
│ Model: deepseek-chat                                   │
│                                                        │
│ Functions:                                             │
│   - sendMessage(messages)                              │
│   - extractIntent(userMessage, profile, history)       │
│   - generateResponse(message, recommendations)         │
│                                                        │
│ Rate Limits:                                           │
│   - Timeout: 30 seconds                                │
│   - Retries: 3 attempts                                │
│   - Backoff: Exponential                               │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                     Last.fm API                        │
├────────────────────────────────────────────────────────┤
│ Endpoint: http://ws.audioscrobbler.com/2.0/           │
│ Method: GET                                            │
│ Auth: API key in query string                          │
│                                                        │
│ Functions:                                             │
│   - getUserTopArtists(username, limit)                 │
│   - getSimilarArtists(artist, limit)                   │
│   - getTopTracks(limit)                                │
│   - searchTrack(artist, track)                         │
│                                                        │
│ Rate Limits:                                           │
│   - 5 requests/second per IP                           │
│   - Unlimited daily quota                              │
│                                                        │
│ Caching: 5 minutes                                     │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                   YouTube Data API                     │
├────────────────────────────────────────────────────────┤
│ Endpoint: https://www.googleapis.com/youtube/v3/      │
│ Method: GET                                            │
│ Auth: API key in query string                          │
│                                                        │
│ Functions:                                             │
│   - searchMusic(query, maxResults)                     │
│   - getVideoDetails(videoId)                           │
│   - searchByArtistAndTrack(artist, track)              │
│                                                        │
│ Rate Limits:                                           │
│   - 10,000 units/day (100 searches)                    │
│   - Search cost: 100 units                             │
│   - Tracked in memory                                  │
│                                                        │
│ Caching: 10 minutes                                    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│                      Supabase                          │
├────────────────────────────────────────────────────────┤
│ Endpoint: https://[project].supabase.co               │
│ Auth: JWT tokens                                       │
│                                                        │
│ Functions:                                             │
│   AUTH:                                                │
│     - signUp(email, password)                          │
│     - signIn(email, password)                          │
│     - signOut()                                        │
│     - getCurrentUser()                                 │
│                                                        │
│   PROFILES:                                            │
│     - getUserProfile(userId)                           │
│     - updateUserProfile(userId, data)                  │
│     - deleteUserProfile(userId)                        │
│                                                        │
│   FAVORITES:                                           │
│     - getFavorites(userId)                             │
│     - addFavorite(userId, recommendation)              │
│     - removeFavorite(userId, recommendationId)         │
│                                                        │
│ Real-time: Subscriptions available                     │
│ RLS: Row Level Security enabled                        │
└────────────────────────────────────────────────────────┘
```

## Caching Strategy

```
┌────────────────────────────────────────────────────────┐
│                  IN-MEMORY CACHE                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Last.fm Data (TTL: 5 minutes)                        │
│  ├─ Top Artists by genre                              │
│  ├─ User's top artists                                 │
│  ├─ Similar artists                                    │
│  └─ Track searches                                     │
│                                                        │
│  YouTube Data (TTL: 10 minutes)                       │
│  ├─ Music video searches                              │
│  ├─ Video details                                      │
│  └─ Artist/track combinations                          │
│                                                        │
│  DeepSeek Intent (TTL: Session)                       │
│  ├─ Extracted intents for messages                     │
│  └─ User conversation context                          │
│                                                        │
└────────────────────────────────────────────────────────┘

Why Caching?
- Reduces API costs
- Improves response time
- Prevents quota exhaustion
- Better user experience
```

This architecture provides a scalable, maintainable, and performant system for AI-powered music recommendations!
