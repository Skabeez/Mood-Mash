/**
 * Example Usage of Recommendation Components
 * 
 * This file demonstrates how to use the recommendation card components
 * in your screens. You can copy these patterns into your actual screens.
 */

import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Recommendation } from '@/types';
import {
  RecommendationCard,
  RecommendationList,
  PlayButton,
  TypeBadge,
} from '@/components/recommendations';
import { designSystem } from '@/constants/designSystem';

/**
 * Example: Using individual RecommendationCard
 */
export const IndividualCardExample = () => {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const exampleRecommendation: Recommendation = {
    id: '1',
    title: 'Weightless',
    artist: 'Marconi Union',
    type: 'highlight',
    youtubeId: 'UfcAVejslrU',
    albumArt: 'https://example.com/album.jpg',
    duration: '8:24',
    album: 'Weightless',
    releaseYear: 2011,
  };

  const handleCardPress = (rec: Recommendation) => {
    Alert.alert('Card Pressed', `You tapped on: ${rec.title}`);
  };

  const handlePlayPress = (rec: Recommendation) => {
    if (playingSongId === rec.id) {
      setPlayingSongId(null); // Pause
    } else {
      setPlayingSongId(rec.id); // Play
    }
  };

  return (
    <View style={{ padding: designSystem.spacing[4] }}>
      <RecommendationCard
        recommendation={exampleRecommendation}
        variant="highlight"
        onPress={handleCardPress}
        onPlayPress={handlePlayPress}
        isPlaying={playingSongId === exampleRecommendation.id}
      />
    </View>
  );
};

/**
 * Example: Using RecommendationList for sections
 */
export const ListSectionExample = () => {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  const highlights: Recommendation[] = [
    {
      id: 'h1',
      title: 'Weightless',
      artist: 'Marconi Union',
      type: 'highlight',
      youtubeId: 'UfcAVejslrU',
      albumArt: 'https://example.com/album1.jpg',
      duration: '8:24',
    },
  ];

  const deepCuts: Recommendation[] = [
    {
      id: 'd1',
      title: 'Arrival',
      artist: 'Helios',
      type: 'deep-cut',
      youtubeId: 'example1',
      albumArt: 'https://example.com/album2.jpg',
      duration: '3:42',
    },
    {
      id: 'd2',
      title: 'Circular',
      artist: 'Goldmund',
      type: 'deep-cut',
      youtubeId: 'example2',
      albumArt: 'https://example.com/album3.jpg',
      duration: '4:15',
    },
  ];

  const mainstream: Recommendation[] = [
    {
      id: 'm1',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      type: 'mainstream',
      youtubeId: 'example3',
      albumArt: 'https://example.com/album4.jpg',
      duration: '3:20',
    },
    {
      id: 'm2',
      title: 'Levitating',
      artist: 'Dua Lipa',
      type: 'mainstream',
      youtubeId: 'example4',
      albumArt: 'https://example.com/album5.jpg',
      duration: '3:23',
    },
  ];

  const handlePlaySong = (rec: Recommendation) => {
    if (playingSongId === rec.id) {
      setPlayingSongId(null);
    } else {
      setPlayingSongId(rec.id);
    }
  };

  const handleCardPress = (rec: Recommendation) => {
    Alert.alert('Song Details', `${rec.title} by ${rec.artist}`);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Highlight Section */}
      <RecommendationList
        recommendations={highlights}
        type="highlight"
        onPlaySong={handlePlaySong}
        onCardPress={handleCardPress}
        playingSongId={playingSongId || undefined}
      />

      {/* Deep Cuts Section */}
      <RecommendationList
        recommendations={deepCuts}
        type="deep-cuts"
        onPlaySong={handlePlaySong}
        onCardPress={handleCardPress}
        playingSongId={playingSongId || undefined}
      />

      {/* Mainstream Section */}
      <RecommendationList
        recommendations={mainstream}
        type="mainstream"
        onPlaySong={handlePlaySong}
        onCardPress={handleCardPress}
        playingSongId={playingSongId || undefined}
      />
    </ScrollView>
  );
};

/**
 * Example: Loading states
 */
export const LoadingStateExample = () => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <RecommendationList
        recommendations={[]}
        type="highlight"
        onPlaySong={() => {}}
        onCardPress={() => {}}
        isLoading={true}
      />
      <RecommendationList
        recommendations={[]}
        type="deep-cuts"
        onPlaySong={() => {}}
        onCardPress={() => {}}
        isLoading={true}
      />
    </ScrollView>
  );
};

/**
 * Example: Using standalone components
 */
export const StandaloneComponentsExample = () => {
  return (
    <View style={{ padding: designSystem.spacing[4], gap: designSystem.spacing[4] }}>
      {/* Type Badges */}
      <View style={{ flexDirection: 'row', gap: designSystem.spacing[2] }}>
        <TypeBadge type="highlight" />
        <TypeBadge type="deep-cut" />
        <TypeBadge type="mainstream" />
      </View>

      {/* Play Button (standalone) */}
      <View style={{ width: 100, height: 100, backgroundColor: '#ccc', position: 'relative' }}>
        <PlayButton onPress={() => Alert.alert('Play pressed')} />
      </View>
    </View>
  );
};

/**
 * Example: Integration with Chat Screen
 * 
 * How to display recommendations within a chat message
 */
export const ChatIntegrationExample = () => {
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // This would come from your chat context/state
  const aiRecommendations: Recommendation[] = [
    {
      id: 'r1',
      title: 'Song Title',
      artist: 'Artist Name',
      type: 'highlight',
      youtubeId: 'example',
      albumArt: 'https://example.com/album.jpg',
      duration: '3:45',
    },
  ];

  const handlePlaySong = (rec: Recommendation) => {
    setPlayingSongId(rec.id === playingSongId ? null : rec.id);
  };

  const handleCardPress = (rec: Recommendation) => {
    // Navigate to song details or open player
    console.log('Open song:', rec);
  };

  return (
    <View style={{ padding: designSystem.spacing[4] }}>
      {/* This would be rendered inside your MessageBubble component */}
      <View>
        {aiRecommendations.map((rec) => (
          <View key={rec.id} style={{ marginBottom: designSystem.spacing[2] }}>
            <RecommendationCard
              recommendation={rec}
              variant={rec.type}
              onPress={handleCardPress}
              onPlayPress={handlePlaySong}
              isPlaying={playingSongId === rec.id}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
