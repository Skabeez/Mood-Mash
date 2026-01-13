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
}

const InputBar: React.FC<InputBarProps> = ({
  onSend,
  isLoading = false,
  placeholder = 'Ask for music recommendations...',
  accessibilityLabel = 'Message input field',
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [contentHeight, setContentHeight] = useState<number>(designSystem.layout.input.height);

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
    alignItems: 'flex-end',
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: designSystem.spacing[2],
    backgroundColor: designSystem.colors.light.surface.primary,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.light.border.light,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    minHeight: designSystem.layout.input.height,
    maxHeight: designSystem.layout.input.multilineMaxHeight,
    paddingHorizontal: designSystem.spacing[3],
    paddingVertical: designSystem.spacing[2],
    borderRadius: designSystem.borderRadius.full,
    backgroundColor: designSystem.colors.light.background.tertiary,
    fontSize: designSystem.typography.fontSize.base,
    fontWeight: designSystem.typography.fontWeight.regular,
    color: designSystem.colors.light.text.primary,
    marginRight: designSystem.spacing[2],
    borderWidth: 1,
    borderColor: designSystem.colors.light.border.light,
  };

  const sendButtonDisabled = !text.trim() || isLoading;
  const sendButtonSize = designSystem.components.button.icon.size;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={containerStyle}>
        {/* Text Input */}
        <TextInput
          ref={inputRef}
          style={[inputStyle, { height: contentHeight }]}
          placeholder={placeholder}
          placeholderTextColor={designSystem.colors.light.text.tertiary}
          multiline
          maxLength={500}
          editable={!isLoading}
          value={text}
          onChangeText={setText}
          onContentSizeChange={handleContentSizeChange}
          accessibilityLabel={accessibilityLabel}
        />

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
            borderRadius: designSystem.borderRadius.full,
            backgroundColor: sendButtonDisabled
              ? designSystem.colors.interactive.disabled
              : designSystem.colors.primary.main,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom:
              contentHeight === designSystem.layout.input.height
                ? 0
                : (contentHeight - designSystem.layout.input.height) / 2,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <Ionicons
            name="send"
            size={18}
            color={
              sendButtonDisabled
                ? designSystem.colors.light.text.tertiary
                : designSystem.colors.primary.foreground
            }
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputBar;
