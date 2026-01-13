import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type = 'info',
  title,
  message,
  onClose,
  primaryButtonText = 'OK',
  secondaryButtonText,
  onSecondaryPress,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle' as const, color: '#10B981' };
      case 'error':
        return { name: 'close-circle' as const, color: '#EF4444' };
      case 'warning':
        return { name: 'warning' as const, color: '#F59E0B' };
      default:
        return { name: 'information-circle' as const, color: '#3B82F6' };
    }
  };

  const icon = getIcon();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.alertContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name={icon.name} size={48} color={icon.color} />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {secondaryButtonText && onSecondaryPress && (
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => {
                    onSecondaryPress();
                    onClose();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButtonText}
                  </Text>
                </Pressable>
              )}
              
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: icon.color },
                ]}
                onPress={onClose}
              >
                <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#9333EA',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  secondaryButtonText: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
