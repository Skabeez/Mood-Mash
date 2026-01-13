/**
 * Example Chat Component using ChatContext
 * Shows how to integrate and use the chat state management
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tw } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';

import { useChatContext } from '@/context/ChatContext';
import { Message } from '@/types';
import { generateId, formatTimestamp } from '@/utils/helpers';
import { colors, spacing } from '@/constants/theme';

/**
 * Chat Message Bubble Component
 */
interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const bubbleColor = isUser ? colors.userBubble : colors.aiBubble;
  const textColor = isUser ? colors.textInverse : colors.text;

  return (
    <View style={tw`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      <View
        style={[
          tw`rounded-2xl px-4 py-3 max-w-xs`,
          { backgroundColor: bubbleColor },
        ]}
      >
        <Text style={[tw`text-base`, { color: textColor }]}>
          {message.text}
        </Text>
        <Text
          style={[
            tw`text-xs mt-1`,
            {
              color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
            },
          ]}
        >
          {formatTimestamp(message.timestamp)}
        </Text>

        {/* Display recommendations if any */}
        {message.recommendations && message.recommendations.length > 0 && (
          <View style={tw`mt-3 border-t border-gray-300 pt-2`}>
            <Text style={[tw`text-xs font-semibold mb-2`, { color: textColor }]}>
              Recommendations:
            </Text>
            {message.recommendations.map((rec) => (
              <View
                key={rec.id}
                style={tw`bg-opacity-20 bg-white p-2 rounded mb-1`}
              >
                <Text style={[tw`text-sm font-semibold`, { color: textColor }]}>
                  {rec.title}
                </Text>
                <Text style={[tw`text-xs`, { color: textColor }]}>
                  {rec.artist}
                </Text>
                {rec.duration && (
                  <Text style={[tw`text-xs mt-1`, { color: textColor }]}>
                    {rec.duration}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Main Chat Example Component
 */
export default function ChatExample() {
  const {
    state,
    addMessage,
    setLoading,
    clearChat,
    setError,
    updateProfile,
  } = useChatContext();

  const [inputText, setInputText] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);

  const { messages, isLoading, currentUser, error } = state;

  /**
   * Handle sending a message
   */
  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage: Message = {
        id: generateId(),
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
      };

      addMessage(userMessage);
      setInputText('');

      // Simulate AI response after a delay
      simulateAIResponse(userMessage.text);
    }
  };

  /**
   * Simulate AI generating a recommendation response
   */
  const simulateAIResponse = (userQuery: string) => {
    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: generateId(),
        text: `Based on "${userQuery}", here are some recommendations for you!`,
        sender: 'ai',
        timestamp: new Date(),
        recommendations: [
          {
            id: 'rec_1',
            title: 'Midnight City',
            artist: 'M83',
            type: 'mainstream',
            youtubeId: 'dQw4w9WgXcQ',
            albumArt: 'https://via.placeholder.com/200',
            duration: '3:45',
          },
          {
            id: 'rec_2',
            title: 'Electric Feel',
            artist: 'MGMT',
            type: 'deep-cut',
            youtubeId: 'Nwam5gm8Z0c',
            albumArt: 'https://via.placeholder.com/200',
            duration: '3:49',
          },
        ],
        status: 'sent',
      };

      addMessage(aiMessage);
      setLoading(false);
    }, 1500);
  };

  /**
   * Handle clearing chat
   */
  const handleClearChat = () => {
    clearChat();
    setError(null);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      {/* Header */}
      <View
        style={[tw`px-4 py-3 flex-row items-center justify-between`, {
          backgroundColor: colors.primary,
        }]}
      >
        <Text style={tw`text-xl font-bold text-white`}>Music Chat</Text>
        <TouchableOpacity onPress={handleClearChat} disabled={messages.length === 0}>
          <MaterialIcons
            name="delete-outline"
            size={24}
            color={messages.length === 0 ? colors.disabled : 'white'}
          />
        </TouchableOpacity>
      </View>

      {/* Messages Container */}
      <ScrollView
        style={tw`flex-1 px-4 py-4`}
        onScroll={(event) => setScrollPosition(event.nativeEvent.contentOffset.y)}
      >
        {messages.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center py-12`}>
            <MaterialIcons
              name="chat-bubble-outline"
              size={48}
              color={colors.textTertiary}
              style={tw`mb-4`}
            />
            <Text style={[tw`text-lg font-semibold`, { color: colors.textSecondary }]}>
              No messages yet
            </Text>
            <Text style={[tw`text-sm mt-2`, { color: colors.textTertiary }]}>
              Start by typing a music query or recommendation request
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={tw`flex-row items-center justify-start mb-3`}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[tw`ml-2 text-sm`, { color: colors.textSecondary }]}>
              AI is thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Error Message */}
      {error && (
        <View style={[tw`mx-4 mb-2 p-3 rounded`, { backgroundColor: colors.error }]}>
          <Text style={tw`text-white text-sm`}>{error}</Text>
        </View>
      )}

      {/* Input Area */}
      <View style={[tw`px-4 py-3`, { borderTopColor: colors.borderLight, borderTopWidth: 1 }]}>
        <View style={tw`flex-row items-end gap-2`}>
          <TextInput
            style={[
              tw`flex-1 px-4 py-3 rounded-full border`,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Ask about music recommendations..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              tw`w-11 h-11 items-center justify-center rounded-full`,
              {
                backgroundColor: inputText.trim() && !isLoading ? colors.primary : colors.disabled,
              },
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <MaterialIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={[tw`text-xs mt-1 text-right`, { color: colors.textTertiary }]}>
          {inputText.length}/500
        </Text>
      </View>
    </SafeAreaView>
  );
}
