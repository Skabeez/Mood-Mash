# Recommendation Components

Beautiful, performant React Native components for displaying music recommendations in the chat interface.

## Components

### 1. `RecommendationCard`

The main card component for displaying individual song recommendations.

**Features:**
- Three visual variants: highlight (large), deep-cut, mainstream
- Album art with play button overlay
- Title, artist, type badge, and duration
- Press animations (scale to 0.98)
- Graceful image error handling
- Gradient border for highlights

**Props:**
```typescript
interface RecommendationCardProps {
  recommendation: Recommendation;
  onPress: (recommendation: Recommendation) => void;
  variant: 'highlight' | 'deep-cut' | 'mainstream';
  isPlaying?: boolean;
  onPlayPress?: (recommendation: Recommendation) => void;
  isLoading?: boolean;
}
```

**Usage:**
```tsx
<RecommendationCard
  recommendation={song}
  variant="highlight"
  onPress={handleCardPress}
  onPlayPress={handlePlaySong}
  isPlaying={currentSongId === song.id}
/>
```

---

### 2. `RecommendationList`

Section wrapper component that displays multiple recommendations with proper layouts.

**Features:**
- Three section types: highlight, deep-cuts, mainstream
- Automatic layout switching (vertical for highlights, horizontal for others)
- Section headers with emojis
- Loading skeletons with shimmer effect
- Empty states
- Performance optimized with FlatList

**Props:**
```typescript
interface RecommendationListProps {
  recommendations: Recommendation[];
  type: 'highlight' | 'deep-cuts' | 'mainstream';
  onPlaySong: (recommendation: Recommendation) => void;
  onCardPress: (recommendation: Recommendation) => void;
  playingSongId?: string;
  isLoading?: boolean;
  showWhenEmpty?: boolean;
}
```

**Usage:**
```tsx
<RecommendationList
  recommendations={highlights}
  type="highlight"
  onPlaySong={handlePlay}
  onCardPress={handleCardPress}
  playingSongId={currentSongId}
/>
```

---

### 3. `TypeBadge`

Small pill badge for indicating recommendation type.

**Features:**
- Three variants with different colors and icons
- Highlight: ⭐ Yellow background
- Deep Cut: 💎 Purple background
- Mainstream: 🔥 Orange background
- 24px height, perfect for compact displays

**Props:**
```typescript
interface TypeBadgeProps {
  type: 'highlight' | 'deep-cut' | 'mainstream';
  style?: ViewStyle;
}
```

**Usage:**
```tsx
<TypeBadge type="deep-cut" />
```

---

### 4. `PlayButton`

Circular play/pause button overlay for album artwork.

**Features:**
- Semi-transparent black background (70% opacity)
- White play/pause icon
- Press animation (scale up to 1.1)
- Automatic icon switching based on play state
- Customizable size
- Medium shadow for depth

**Props:**
```typescript
interface PlayButtonProps {
  onPress: () => void;
  isPlaying?: boolean;
  size?: number; // default: 36
  accessibilityLabel?: string;
}
```

**Usage:**
```tsx
<PlayButton
  onPress={handlePlayPress}
  isPlaying={isCurrentlyPlaying}
  size={44}
/>
```

---

## Design System Integration

All components use `designSystem` constants for:
- ✅ Colors: `designSystem.colors.*`
- ✅ Typography: `designSystem.typography.*`
- ✅ Spacing: `designSystem.spacing[*]`
- ✅ Border Radius: `designSystem.borderRadius.*`
- ✅ Shadows: `designSystem.shadows.*`
- ✅ Animations: `designSystem.animation.duration.*`

No hardcoded values anywhere!

---

## Variants Comparison

| Feature | Highlight | Deep Cut | Mainstream |
|---------|-----------|----------|------------|
| Image Size | 120x120 | 80x80 | 80x80 |
| Layout | Horizontal | Vertical | Vertical |
| Card Width | Full width | 180px | 180px |
| Shadow | Large | Medium | Medium |
| Border | Gradient | Purple accent | Blue accent |
| Section Icon | 🌟 | 💎 | 🔥 |

---

## Performance Optimizations

All components are wrapped with `React.memo` to prevent unnecessary re-renders.

**FlatList optimizations in RecommendationList:**
- `removeClippedSubviews={true}` - Removes off-screen views
- `maxToRenderPerBatch={5}` - Renders 5 items per batch
- `updateCellsBatchingPeriod={50}` - 50ms batching
- `windowSize={5}` - Renders 5 screens worth of content

---

## Accessibility

All components include proper accessibility features:
- `accessibilityLabel` - Screen reader descriptions
- `accessibilityHint` - Action hints
- `accessibilityRole` (implied through Pressable)
- Image alt text for album art

---

## Animation Details

**Card Press Animation:**
- Scale: 1.0 → 0.98
- Spring physics with friction: 3
- Native driver enabled

**Play Button Animation:**
- Scale: 1.0 → 1.1
- Spring physics with friction: 3
- Native driver enabled

---

## Integration Example

```tsx
import { useState } from 'react';
import { ScrollView } from 'react-native';
import { RecommendationList } from '@/components/recommendations';
import { Recommendation } from '@/types';

export const ChatScreen = () => {
  const [playingSongId, setPlayingSongId] = useState<string>();
  const [recommendations, setRecommendations] = useState<{
    highlight: Recommendation[];
    deepCuts: Recommendation[];
    mainstream: Recommendation[];
  }>({
    highlight: [],
    deepCuts: [],
    mainstream: [],
  });

  const handlePlaySong = (song: Recommendation) => {
    if (playingSongId === song.id) {
      // Pause current song
      setPlayingSongId(undefined);
    } else {
      // Play new song
      setPlayingSongId(song.id);
      // Your play logic here...
    }
  };

  const handleCardPress = (song: Recommendation) => {
    // Navigate to song details
    navigation.navigate('details', { id: song.id });
  };

  return (
    <ScrollView>
      <RecommendationList
        recommendations={recommendations.highlight}
        type="highlight"
        onPlaySong={handlePlaySong}
        onCardPress={handleCardPress}
        playingSongId={playingSongId}
      />
      
      <RecommendationList
        recommendations={recommendations.deepCuts}
        type="deep-cuts"
        onPlaySong={handlePlaySong}
        onCardPress={handleCardPress}
        playingSongId={playingSongId}
      />
      
      <RecommendationList
        recommendations={recommendations.mainstream}
        type="mainstream"
        onPlaySong={handlePlaySong}
        onCardPress={handleCardPress}
        playingSongId={playingSongId}
      />
    </ScrollView>
  );
};
```

---

## Dependencies

- `react-native` - Core framework
- `expo-linear-gradient` - Gradient backgrounds (highlight cards)
- `@expo/vector-icons` - Ionicons for play/pause icons

Install with:
```bash
npx expo install expo-linear-gradient
```

---

## File Structure

```
components/recommendations/
├── index.ts                    # Barrel exports
├── RecommendationCard.tsx      # Main card component
├── RecommendationList.tsx      # Section wrapper
├── TypeBadge.tsx               # Type indicator pill
├── PlayButton.tsx              # Play/pause button
├── examples.tsx                # Usage examples
└── README.md                   # This file
```

---

## Testing

Example test cases:

```tsx
describe('RecommendationCard', () => {
  it('renders title and artist correctly', () => {
    // Test implementation
  });
  
  it('shows play button on album art', () => {
    // Test implementation
  });
  
  it('triggers onPress when card is pressed', () => {
    // Test implementation
  });
  
  it('handles image load errors gracefully', () => {
    // Test implementation
  });
});
```

---

## Future Enhancements

Potential improvements:
- [ ] Add favorite/like button
- [ ] Swipe actions (add to playlist, share)
- [ ] Parallax scroll effects
- [ ] Audio waveform visualization
- [ ] Spotify/Apple Music integration
- [ ] Offline caching for album art
- [ ] Share functionality
- [ ] Add to playlist modal

---

## Support

For issues or questions, refer to the main project documentation or check the example files in `examples.tsx`.
