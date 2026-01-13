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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/api/supabase';
import CustomAlert from '@/components/ui/CustomAlert';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({ visible: false, type: 'info', title: '', message: '' });

  const handleSignup = async () => {
    // Validation
    if (!name.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Name Required',
        message: 'Please enter your name',
      });
      return;
    }

    if (!email.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter your email address',
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

    if (!password.trim()) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Password Required',
        message: 'Please enter a password',
      });
      return;
    }

    if (password.length < 8) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long',
      });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Passwords Don\'t Match',
        message: 'Please make sure your passwords match',
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

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      console.log('Signup response:', { data, error });

      if (error) {
        console.error('Signup error details:', error);
        let errorMessage = 'Unable to create account. Please try again.';
        
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('Password should be')) {
          errorMessage = error.message;
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
        } else if (error.message) {
          // Show the actual error message from Supabase
          errorMessage = error.message;
        }

        setAlert({
          visible: true,
          type: 'error',
          title: 'Signup Failed',
          message: errorMessage,
        });
        return;
      }

      // Success
      setAlert({
        visible: true,
        type: 'success',
        title: 'Account Created!',
        message: 'Please check your email to verify your account, then sign in.',
      });

      // Navigate to login after showing success
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2500);
    } catch (error: any) {
      console.error('Signup error:', error);
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

      <LoadingOverlay visible={loading} message="Creating account..." />
      
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
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
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

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
                    placeholder="At least 8 characters"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Re-enter password"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                <Text style={styles.signupButtonText}>Create Account</Text>
              </Pressable>

              <Text style={styles.terms}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
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
  signupButton: {
    backgroundColor: '#9333EA',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#A78BFA',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
