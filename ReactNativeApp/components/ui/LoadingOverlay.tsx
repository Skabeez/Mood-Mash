import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Loading...',
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.gradient}
          >
            <ActivityIndicator size="large" color="#9333EA" />
            <Text style={styles.message}>{message}</Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  gradient: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 16,
  },
  message: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoadingOverlay;
