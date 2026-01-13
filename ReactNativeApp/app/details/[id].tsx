import React, { useState } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { tw } from 'nativewind';

interface YouTubeProps {
  videoId: string;
}

const YouTubePlayer: React.FC<YouTubeProps> = ({ videoId }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; }
          .container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <iframe
            src="https://www.youtube.com/embed/${videoId}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      style={tw`h-64 w-full`}
      javaScriptEnabled={true}
      scalesPageToFit={true}
    />
  );
};

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showVideo, setShowVideo] = useState(false);
  
  const videoId = 'dQw4w9WgXcQ';

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`flex-1 px-4 py-4`}>
        <Text style={tw`text-3xl font-bold mb-2`}>Item #{id}</Text>
        <Text style={tw`text-gray-600 mb-6`}>Details for item with ID: {id}</Text>

        <View style={tw`bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200`}>
          <Text style={tw`text-lg font-semibold mb-2`}>Information</Text>
          <Text style={tw`text-gray-700`}>
            This is a sample details page demonstrating:
          </Text>
          <View style={tw`mt-3 ml-4`}>
            <Text style={tw`text-gray-700 my-1`}>• Dynamic routing with [id]</Text>
            <Text style={tw`text-gray-700 my-1`}>• WebView integration</Text>
            <Text style={tw`text-gray-700 my-1`}>• NativeWind styling</Text>
            <Text style={tw`text-gray-700 my-1`}>• Toggle state management</Text>
          </View>
        </View>

        <View style={tw`bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200`}>
          <View style={tw`flex-row items-center justify-between`}>
            <Text style={tw`text-lg font-semibold`}>Show YouTube Player</Text>
            <Switch
              value={showVideo}
              onValueChange={setShowVideo}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={showVideo ? '#4CAF50' : '#ccc'}
            />
          </View>
        </View>

        {showVideo && (
          <View style={tw`mb-6`}>
            <YouTubePlayer videoId={videoId} />
          </View>
        )}

        <View style={tw`bg-green-50 p-4 rounded-lg mb-4 border border-green-200`}>
          <Text style={tw`text-lg font-semibold mb-2`}>Features Used:</Text>
          <View style={tw`ml-2`}>
            <Text style={tw`text-gray-700 my-1`}>📍 Expo Router (dynamic routes)</Text>
            <Text style={tw`text-gray-700 my-1`}>🎨 NativeWind (TailwindCSS)</Text>
            <Text style={tw`text-gray-700 my-1`}>🎬 React Native WebView</Text>
            <Text style={tw`text-gray-700 my-1`}>⚛️ React Navigation</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
