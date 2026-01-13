import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  TextStyle,
  AccessibilityRole,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { designSystem } from '@/constants/designSystem';

interface InputBarProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  accessibilityLabel?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({
  onSend,
  isLoading = false,
  placeholder = 'Ask for music recommendations...',
  accessibilityLabel = 'Message input field',
  value: externalValue,
  onChangeText: externalOnChangeText,
}) => {
  const [internalText, setInternalText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [contentHeight, setContentHeight] = useState<number>(designSystem.layout.input.height);

  // Use external value if provided, otherwise use internal state
  const text = externalValue !== undefined ? externalValue : internalText;
  const setText = externalOnChangeText || setInternalText;

  const handleSend = async () => {
    if (text.trim() && !isLoading) {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      onSend(text.trim());
      setText('');
      setContentHeight(designSystem.layout.input.height);
      inputRef.current?.focus();
    }
  };

  const handleContentSizeChange = (event: any) => {
    const height = Math.min(
      event.nativeEvent.contentSize.height,
      designSystem.layout.input.multilineMaxHeight
    );
    setContentHeight(height);
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: designSystem.spacing[4],
    paddingBottom: designSystem.spacing[6],
    backgroundColor: 'rgba(17, 24, 39, 0.8)', // gray-900/80
    borderTopWidth: 1,
    borderTopColor: '#1F2937', // gray-800
  };

  const inputContainerStyle: ViewStyle = {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: designSystem.spacing[1],
    borderRadius: 999, // full
    backgroundColor: '#1F2937', // gray-800
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    minHeight: 44,
    maxHeight: designSystem.layout.input.multilineMaxHeight,
    paddingVertical: designSystem.spacing[2],
    fontSize: 15,
    fontWeight: designSystem.typography.fontWeight.regular,
    color: '#F3F4F6', // gray-100
  };

  const sendButtonDisabled = !text.trim() || isLoading;
  const sendButtonSize = 40;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={containerStyle}>
        {/* Input Container with rounded full design */}
        <View style={inputContainerStyle}>
          <TextInput
            ref={inputRef}
            style={inputStyle}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF" // gray-400
            multiline
            maxLength={500}
            editable={!isLoading}
            value={text}
            onChangeText={setText}
            onContentSizeChange={handleContentSizeChange}
            accessibilityLabel={accessibilityLabel}
          />
        </View>

        {/* Send Button */}
        <Pressable
          onPress={handleSend}
          disabled={sendButtonDisabled}
          accessible={true}
          accessibilityLabel="Send message"
          accessibilityHint="Double tap to send your message"
          style={{
            width: sendButtonSize,
            height: sendButtonSize,
            borderRadius: 999, // full
            backgroundColor: sendButtonDisabled
              ? '#6B7280' // gray-500
              : '#9333EA', // purple-600
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <Ionicons
            name="send"
            size={16}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputBar;
