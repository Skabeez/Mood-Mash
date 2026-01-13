# Chat Integration Testing Checklist

## Pre-Testing Setup ✅

### 1. Environment Configuration
- [ ] Create `.env` file in `ReactNativeApp/` directory
- [ ] Add `DEEPSEEK_API_KEY=your_key_here`
- [ ] Add `LASTFM_API_KEY=your_key_here`
- [ ] Add `YOUTUBE_API_KEY=your_key_here`
- [ ] Add `SUPABASE_URL=your_url_here`
- [ ] Add `SUPABASE_ANON_KEY=your_key_here`
- [ ] Verify `app.config.js` loads environment variables
- [ ] Run `npm start` to restart with new env vars

### 2. API Keys Verification
**DeepSeek API:**
- Get key from: https://platform.deepseek.com/api_keys
- Test with curl:
```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"model": "deepseek-chat", "messages": [{"role": "user", "content": "Hello"}]}'
```

**Last.fm API:**
- Get key from: https://www.last.fm/api/account/create
- Test with curl:
```bash
curl "http://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=YOUR_KEY&format=json"
```

**YouTube Data API:**
- Get key from: https://console.cloud.google.com/apis/credentials
- Enable YouTube Data API v3
- Test with curl:
```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=music&key=YOUR_KEY"
```

**Supabase:**
- Get from: Your Supabase project settings
- URL format: `https://your-project.supabase.co`
- Key is the "anon" public key

## Basic Functionality Tests 🧪

### Test 1: App Launch
- [ ] App starts without crashes
- [ ] Chat screen loads with welcome message
- [ ] No console errors on mount
- [ ] Profile loads from Supabase (if logged in)

### Test 2: UI Elements
- [ ] Welcome message displays properly
- [ ] Suggestion chips are visible and clickable
- [ ] Input bar is present at bottom
- [ ] Send button is visible
- [ ] Gradient background renders correctly

### Test 3: Basic Message Flow
- [ ] Type "Hello" in input
- [ ] Press send button
- [ ] User message appears (purple bubble, right-aligned)
- [ ] Loading indicator shows with rotating messages
- [ ] AI response appears (gray bubble, left-aligned)

## Recommendation Engine Tests 🎵

### Test 4: Mood-Based Recommendations
**Input:** "I'm feeling happy and energetic"
- [ ] Loading messages rotate every 2 seconds
- [ ] AI responds within 30 seconds
- [ ] Response includes personalized message
- [ ] Recommendations include:
  - [ ] 1 Highlight track (large card)
  - [ ] 3 Deep Cuts (smaller cards)
  - [ ] 3 Mainstream Picks (smaller cards)
- [ ] All tracks have:
  - [ ] Album art (or fallback image)
  - [ ] Artist name
  - [ ] Track title
  - [ ] Duration
  - [ ] YouTube video ID
- [ ] Recommendations match "happy" and "energetic" mood

### Test 5: Genre-Based Recommendations
**Input:** "Play some jazz music"
- [ ] AI extracts genre intent correctly
- [ ] Returns jazz tracks
- [ ] Mix of known and obscure jazz artists
- [ ] Personalized response mentions jazz

### Test 6: Activity-Based Recommendations
**Input:** "Music for working out"
- [ ] High-energy tracks returned
- [ ] Fast tempo songs (120+ BPM implied)
- [ ] Motivational genres (hip-hop, EDM, rock)
- [ ] Response mentions workout context

### Test 7: Vague Request Handling
**Input:** "Something good"
- [ ] AI asks clarifying questions OR
- [ ] Returns varied recommendations across genres
- [ ] Response is helpful and engaging

### Test 8: Multi-Turn Conversation
1. Send: "I like rock music"
   - [ ] AI responds with rock recommendations
2. Send: "Something more mellow"
   - [ ] AI remembers previous context (rock)
   - [ ] Returns softer rock/alternative
   - [ ] Response references previous message

## Loading States Tests ⏳

### Test 9: Loading Message Rotation
- [ ] Send any message
- [ ] First message: "🎵 Analyzing your music taste..."
- [ ] Wait 2 seconds: Changes to "🎸 Finding the perfect tracks..."
- [ ] Wait 2 more seconds: Changes to "💿 Curating your playlist..."
- [ ] Messages continue rotating through all 5

### Test 10: Extended Loading
- [ ] Trigger slow API response (network throttling)
- [ ] After 10 seconds, see "Still generating..." message
- [ ] Loading continues until response arrives
- [ ] No timeout errors before 30 seconds

### Test 11: Multiple Rapid Messages
- [ ] Send message
- [ ] Immediately try to send another
- [ ] Second send is blocked (button disabled)
- [ ] First request completes
- [ ] Can now send second message

## Error Handling Tests ❌

### Test 12: Network Error
- [ ] Disconnect internet
- [ ] Send: "Any message"
- [ ] Error message appears in chat
- [ ] Message is red with border
- [ ] "🔄 Retry" button is visible
- [ ] Click retry button
- [ ] Reconnect internet
- [ ] Request retries successfully

### Test 13: Invalid API Key
- [ ] Temporarily change `DEEPSEEK_API_KEY` to invalid
- [ ] Send message
- [ ] Error message appears
- [ ] Can retry after fixing key
- [ ] Fallback responses may appear

### Test 14: API Rate Limit
- [ ] Send 10+ messages rapidly (if APIs allow)
- [ ] If rate limited, see appropriate error
- [ ] Error message is user-friendly
- [ ] Retry works after cooldown

### Test 15: Empty Input Handling
- [ ] Try to send empty message
- [ ] Nothing happens (validated)
- [ ] Try to send only spaces
- [ ] Message is ignored (trimmed)

## Recommendation Interaction Tests 🎼

### Test 16: Play Button
- [ ] Click play button on any recommendation
- [ ] Button state toggles (play ↔ pause icon)
- [ ] Console logs "Playing song: [title]"
- [ ] Click again to pause
- [ ] Only one song plays at a time

### Test 17: Favorite Button
- [ ] Click heart icon on recommendation
- [ ] Heart fills in (becomes solid)
- [ ] Click again to unfavorite
- [ ] Heart becomes outline
- [ ] Favorite state persists across recommendations

### Test 18: Card Press
- [ ] Click anywhere on recommendation card (not buttons)
- [ ] Console logs "Card pressed: [title]"
- [ ] Ready for navigation implementation

### Test 19: Album Art Loading
- [ ] Wait for recommendations with various album arts
- [ ] All images load successfully OR
- [ ] Fallback images show for broken URLs
- [ ] No broken image icons visible

## Persistence Tests 💾

### Test 20: Message History
- [ ] Send several messages with recommendations
- [ ] Close app completely
- [ ] Reopen app
- [ ] All messages are restored from AsyncStorage
- [ ] Scroll position may reset (expected)

### Test 21: Profile Persistence
- [ ] Set favorite genres in Profile screen
- [ ] Close and reopen app
- [ ] Preferences are remembered
- [ ] Recommendations reflect saved preferences

### Test 22: Clear Chat
- [ ] Send some messages
- [ ] Go to Profile screen
- [ ] Find and click "Clear Chat" option
- [ ] Return to Chat screen
- [ ] All messages are gone
- [ ] Welcome message shows again

## Supabase Integration Tests 🔐

### Test 23: User Authentication
- [ ] Sign up with new account
- [ ] Profile is created in Supabase
- [ ] User ID is stored in context
- [ ] Recommendations save to user's history

### Test 24: Profile Sync
- [ ] Log in to existing account
- [ ] Profile loads from Supabase
- [ ] Favorite genres populate
- [ ] Last.fm username (if set) is available

### Test 25: Favorites Sync
- [ ] Mark tracks as favorite
- [ ] Check Supabase database
- [ ] Favorites are saved with user ID
- [ ] Favorites persist across sessions

## Performance Tests ⚡

### Test 26: Caching
- [ ] Send: "Jazz music"
- [ ] Note response time
- [ ] Send: "More jazz"
- [ ] Second response should be faster (cached Last.fm data)
- [ ] Third similar request also fast

### Test 27: Smooth Scrolling
- [ ] Generate 10+ message exchanges
- [ ] Scroll up and down
- [ ] No lag or jank
- [ ] Auto-scroll to bottom works smoothly

### Test 28: Memory Usage
- [ ] Open app, check memory baseline
- [ ] Send 20+ messages with recommendations
- [ ] Memory doesn't grow excessively
- [ ] No memory leaks on chat clear

## Edge Cases Tests 🔍

### Test 29: Special Characters
- [ ] Send: "Music with émotions 🎵❤️"
- [ ] No crashes
- [ ] Special characters render correctly
- [ ] Response handles Unicode properly

### Test 30: Very Long Message
- [ ] Send 500+ character message
- [ ] Message displays correctly
- [ ] Bubble expands appropriately
- [ ] Response is still relevant

### Test 31: Rapid Genre Changes
- [ ] Send: "Rock music"
- [ ] Immediately send: "Jazz music"
- [ ] Then: "Classical music"
- [ ] Each response is contextually correct
- [ ] No crossed responses

### Test 32: No Results Scenario
- [ ] Send very obscure/nonsense request
- [ ] System handles gracefully
- [ ] Fallback recommendations appear OR
- [ ] AI asks for clarification

## Integration Tests 🔗

### Test 33: DeepSeek API
- [ ] Intent extraction works correctly
- [ ] AI responses are coherent and personalized
- [ ] Response time under 30 seconds
- [ ] Retry logic works on failures

### Test 34: Last.fm API
- [ ] Artist data fetches successfully
- [ ] Similar artist recommendations are relevant
- [ ] Track search returns results
- [ ] Caching reduces subsequent calls

### Test 35: YouTube API
- [ ] Video search returns music videos
- [ ] Video IDs are valid
- [ ] Thumbnails/album art loads
- [ ] Quota tracking prevents overuse

### Test 36: Supabase API
- [ ] Authentication works (sign in/up/out)
- [ ] Profile CRUD operations successful
- [ ] Favorites save and retrieve
- [ ] Real-time updates (if implemented)

## Accessibility Tests ♿

### Test 37: Screen Reader
- [ ] Enable VoiceOver (iOS) or TalkBack (Android)
- [ ] Navigate through chat messages
- [ ] All elements are announced properly
- [ ] Buttons have descriptive labels

### Test 38: Font Scaling
- [ ] Increase system font size
- [ ] Text scales appropriately
- [ ] Layout doesn't break
- [ ] Buttons remain tappable

### Test 39: Color Contrast
- [ ] All text is readable
- [ ] Sufficient contrast ratios
- [ ] Error states clearly visible
- [ ] Works in bright/dark environments

## Final Checks ✔️

### Test 40: Production Readiness
- [ ] No console.log statements with sensitive data
- [ ] API keys not hardcoded
- [ ] Error messages are user-friendly
- [ ] Loading states always resolve
- [ ] No infinite loops or recursive calls
- [ ] All TypeScript errors resolved
- [ ] Code follows project conventions
- [ ] Comments explain complex logic

## Testing Results Summary

**Date:** _____________

**Tester:** _____________

**Device:** _____________

**OS Version:** _____________

**Tests Passed:** _____ / 40

**Critical Issues:**
- 
- 

**Minor Issues:**
- 
- 

**Notes:**
- 
- 

**Overall Status:** [ ] PASS [ ] FAIL [ ] NEEDS WORK

---

## Quick Test Commands

```bash
# Start development server
npm start

# Clear cache and restart
npm start -- --reset-cache

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Check for TypeScript errors
npx tsc --noEmit

# Run tests (if configured)
npm test
```

## Debugging Tips

1. **Check logs:** `npx react-native log-ios` or `npx react-native log-android`
2. **Inspect AsyncStorage:** Use React Native Debugger
3. **Network requests:** Open Chrome DevTools → Network tab
4. **Supabase logs:** Check Supabase dashboard → Logs
5. **API errors:** Check console for detailed error messages

## Success Criteria

✅ **Must Have:**
- [ ] App loads without errors
- [ ] Can send messages and receive recommendations
- [ ] Loading and error states work
- [ ] All API integrations functional

🎯 **Should Have:**
- [ ] Smooth animations and transitions
- [ ] Good performance (< 2s load time)
- [ ] Helpful error messages
- [ ] Profile syncing works

⭐ **Nice to Have:**
- [ ] Advanced caching strategies
- [ ] Offline support
- [ ] Analytics tracking
- [ ] Social sharing

---

**Happy Testing! 🎉**
