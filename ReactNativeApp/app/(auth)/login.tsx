import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/api/supabase';
import CustomAlert from '@/components/ui/CustomAlert';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ visible: false, type: 'info', title: '', message: '' });

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter your email address',
      });
      return;
    }

    if (!password.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Password Required',
        message: 'Please enter your password',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
      });
      return;
    }

    setLoading(true);
    try {
      if (!supabase) {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Service Unavailable',
          message: 'Authentication service is not configured. Please check your environment settings.',
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Handle specific error types
        let errorMessage = 'Unable to sign in. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.';
        }

        setAlert({
          visible: true,
          type: 'error',
          title: 'Login Failed',
          message: errorMessage,
        });
        return;
      }

      // Success - navigation will be handled by auth state listener
      setAlert({
        visible: true,
        type: 'success',
        title: 'Welcome Back!',
        message: 'Successfully signed in',
      });
      
      // Small delay for success message
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    } catch (error: any) {
      console.error('Login error:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Unexpected Error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#030712', '#111827']}
        style={StyleSheet.absoluteFill}
      />

      <LoadingOverlay visible={loading} message="Signing in..." />
      
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#F9FAFB" />
            </Pressable>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.forgotButton}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    marginTop: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F9FAFB',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#374151',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#F9FAFB',
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#9333EA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: 14,
    color: '#A78BFA',
    fontWeight: '600',
  },
});
