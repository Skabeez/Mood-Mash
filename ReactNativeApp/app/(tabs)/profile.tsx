import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase, getUserProfile, getUserFavorites, getCurrentUser, saveFavoriteSong, removeFavoriteSong, updateUserProfile } from '@/services/api/supabase';
import { designSystem } from '@/constants/designSystem';
import { StatCard } from '@/components/profile/StatCard';
import { PreferenceChip } from '@/components/profile/PreferenceChip';
import { SettingItem } from '@/components/profile/SettingItem';
import { Recommendation } from '@/types';
import CustomAlert from '@/components/ui/CustomAlert';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

// Mock user data structure for type safety
const defaultUser = {
  name: 'User',
  email: 'user@example.com',
  initials: 'U',
  avatarUrl: null,
};

const mockFavorites: Recommendation[] = [];

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState(defaultUser);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Recommendation[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [favoriteMoods, setFavoriteMoods] = useState<string[]>([]);
  const [lastfmConnected, setLastfmConnected] = useState(false);
  const [lastfmUsername, setLastfmUsername] = useState('');
  const [youtubeConnected, setYoutubeConnected] = useState(true);
  
  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [explicitContent, setExplicitContent] = useState(true);
  
  // Modals
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [addGenreModal, setAddGenreModal] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [newGenre, setNewGenre] = useState('');
  
  // Auth & UI states
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onSecondaryPress?: () => void;
    secondaryButtonText?: string;
  }>({ visible: false, type: 'info', title: '', message: '' });

  // Load real user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          console.error('No authenticated user found');
          setLoading(false);
          return;
        }

        setUserId(currentUser.id);
        
        // Get user profile from database
        const userProfile = await getUserProfile(currentUser.id);
        if (userProfile) {
          const initials = userProfile.username 
            ? userProfile.username.substring(0, 2).toUpperCase()
            : 'U';
          setUser({
            name: userProfile.username || 'User',
            email: userProfile.email || currentUser.email || '',
            initials,
            avatarUrl: userProfile.avatar_url || null,
          });
          setEditName(userProfile.username || 'User');
          setEditEmail(userProfile.email || '');

          // Get user preferences if available
          if (userProfile.favorite_genres) {
            setFavoriteGenres(userProfile.favorite_genres);
          }
          if (userProfile.favorite_moods) {
            setFavoriteMoods(userProfile.favorite_moods);
          }
        } else {
          // Use email as fallback
          const initials = (currentUser.email || 'U').substring(0, 2).toUpperCase();
          setUser({
            name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
            email: currentUser.email || '',
            initials,
            avatarUrl: null,
          });
          setEditName(currentUser.email?.split('@')[0] || 'User');
          setEditEmail(currentUser.email || '');
        }

        // Get user favorites
        const userFavorites = await getUserFavorites(currentUser.id);
        if (userFavorites && userFavorites.length > 0) {
          const favIds = new Set(userFavorites.map((f: any) => f.id));
          setFavorites(userFavorites);
          setFavoriteIds(favIds);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'Failed to load profile data',
        });
      }
    };

    loadUserData();
  }, []);

  const favoriteSongs = favorites;

  const handleToggleFavorite = async (song: Recommendation) => {
    if (!userId) return;

    try {
      if (favoriteIds.has(song.id)) {
        // Remove from favorites
        const { error } = await removeFavoriteSong(userId, song.id);
        if (error) throw error;
        
        setFavorites((prev) => prev.filter((f) => f.id !== song.id));
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(song.id);
          return newSet;
        });
      } else {
        // Add to favorites
        const { error } = await saveFavoriteSong(userId, song.id, {
          title: song.title,
          artist: song.artist,
          albumArt: song.albumArt,
          youtubeId: song.youtubeId,
        });
        if (error) throw error;
        
        setFavorites((prev) => [...prev, song]);
        setFavoriteIds((prev) => new Set([...prev, song.id]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to update favorites',
      });
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setFavoriteGenres((prev) => prev.filter((g) => g !== genre));
  };

  const handleAddGenre = () => {
    if (newGenre.trim() && !favoriteGenres.includes(newGenre.trim())) {
      setFavoriteGenres((prev) => [...prev, newGenre.trim()]);
      setNewGenre('');
      setAddGenreModal(false);
    }
  };

  const handleRemoveMood = (mood: string) => {
    setFavoriteMoods((prev) => prev.filter((m) => m !== mood));
  };

  const handleSaveProfile = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { error } = await updateUserProfile(userId, {
        username: editName,
        email: editEmail,
        favorite_genres: favoriteGenres,
        favorite_moods: favoriteMoods,
      });

      if (error) throw error;

      setUser({ 
        ...user, 
        name: editName, 
        email: editEmail,
        initials: editName.substring(0, 2).toUpperCase(),
      });
      setEditProfileModal(false);
      
      setAlert({
        visible: true,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been saved successfully!',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to save profile',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    setAlert({
      visible: true,
      type: 'success',
      title: 'Cache Cleared',
      message: 'All cached data has been cleared successfully!',
    });
  };

  const handleAbout = () => {
    setAlert({
      visible: true,
      type: 'info',
      title: 'About',
      message: 'Mood Mash v1.0.0\n\nYour AI-powered music companion for discovering perfect tracks for every mood.',
    });
  };

  const handleLogout = () => {
    setAlert({
      visible: true,
      type: 'warning',
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      secondaryButtonText: 'Cancel',
      onSecondaryPress: () => {},
    });
  };

  const handleConfirmLogout = async () => {
    setLoading(true);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Logout error:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Logout Failed',
        message: 'Unable to sign out. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectLastfm = () => {
    if (lastfmConnected) {
      setLastfmConnected(false);
      setLastfmUsername('');
    } else {
      setLastfmConnected(true);
      setLastfmUsername('musiclover123');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#030712', '#111827']} // gray-950 to gray-900
        style={StyleSheet.absoluteFill}
      />

      <LoadingOverlay visible={loading} message="Signing out..." />
      
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        primaryButtonText={alert.type === 'warning' && alert.title === 'Sign Out' ? 'Sign Out' : 'OK'}
        secondaryButtonText={alert.secondaryButtonText}
        onSecondaryPress={alert.onSecondaryPress}
        onClose={() => {
          if (alert.type === 'warning' && alert.title === 'Sign Out') {
            handleConfirmLogout();
          }
          setAlert({ ...alert, visible: false });
        }}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <LinearGradient
            colors={['rgba(88, 28, 135, 0.3)', 'rgba(13, 148, 136, 0.3)']} // purple-900/30 to teal-900/30
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              {/* Avatar */}
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={['#A855F7', '#14B8A6']} // purple-500 to teal-500
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <Text style={styles.initials}>{user.initials}</Text>
                </LinearGradient>
              )}

              {/* User Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userSubtitle}>Your personal music companion</Text>
              </View>

              {/* Settings Button */}
              <Pressable
                style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
                onPress={() => setEditProfileModal(true)}
              >
                <Ionicons name="settings-outline" size={20} color="#9CA3AF" />
              </Pressable>
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Highlights"
                value="12"
                subtitle="songs discovered"
                icon="musical-notes"
                gradientColors={['rgba(147, 51, 234, 0.3)', 'rgba(147, 51, 234, 0.2)']}
                iconColor="#C084FC"
                borderColor="rgba(168, 85, 247, 0.2)"
              />
              <StatCard
                title="Genres"
                value={favoriteGenres.length}
                subtitle="explored"
                icon="albums"
                gradientColors={['rgba(236, 72, 153, 0.3)', 'rgba(236, 72, 153, 0.2)']}
                iconColor="#F9A8D4"
                borderColor="rgba(236, 72, 153, 0.2)"
              />
              <StatCard
                title="Hours"
                value="8.5"
                subtitle="this week"
                icon="time"
                gradientColors={['rgba(13, 148, 136, 0.3)', 'rgba(13, 148, 136, 0.2)']}
                iconColor="#5EEAD4"
                borderColor="rgba(13, 148, 136, 0.2)"
              />
            </View>

            {/* Music Preferences */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="musical-notes" size={20} color="#5EEAD4" />
                <Text style={styles.sectionTitle}>Your Music Taste</Text>
              </View>

              {/* Favorite Genres */}
              <View style={styles.preferenceCard}>
                <Text style={styles.preferenceCardTitle}>Favorite Genres</Text>
                <View style={styles.chipContainer}>
                  {favoriteGenres.map((genre) => (
                    <PreferenceChip
                      key={genre}
                      label={genre}
                      onRemove={() => handleRemoveGenre(genre)}
                      backgroundColor="rgba(147, 51, 234, 0.3)"
                      textColor="#D8B4FE"
                      borderColor="rgba(168, 85, 247, 0.3)"
                    />
                  ))}
                  <PreferenceChip
                    label="+ Add Genre"
                    onPress={() => setAddGenreModal(true)}
                    backgroundColor="rgba(55, 65, 81, 0.5)"
                    textColor="#9CA3AF"
                    borderColor="rgba(75, 85, 99, 0.5)"
                  />
                </View>
              </View>

              {/* Favorite Moods */}
              <View style={styles.preferenceCard}>
                <Text style={styles.preferenceCardTitle}>Favorite Moods</Text>
                <View style={styles.chipContainer}>
                  {favoriteMoods.map((mood) => (
                    <PreferenceChip
                      key={mood}
                      label={mood}
                      onRemove={() => handleRemoveMood(mood)}
                      backgroundColor="rgba(13, 148, 136, 0.3)"
                      textColor="#99F6E4"
                      borderColor="rgba(20, 184, 166, 0.3)"
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Saved Favorites */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart" size={20} color="#F9A8D4" />
                <Text style={styles.sectionTitle}>Saved Favorites</Text>
                <Text style={styles.sectionCount}>{favorites.size} songs</Text>
              </View>

              {favoriteSongs.length > 0 ? (
                <View style={styles.favoritesCard}>
                  {favoriteSongs.map((song, index) => (
                    <View
                      key={song.id}
                      style={[
                        styles.favoriteItem,
                        index !== favoriteSongs.length - 1 && styles.favoriteItemBorder,
                      ]}
                    >
                      <Image
                        source={{ uri: song.albumArt }}
                        style={styles.favoriteAlbumArt}
                      />
                      <View style={styles.favoriteInfo}>
                        <Text style={styles.favoriteTitle} numberOfLines={1}>
                          {song.title}
                        </Text>
                        <Text style={styles.favoriteArtist} numberOfLines={1}>
                          {song.artist}
                        </Text>
                      </View>
                      <Pressable onPress={() => handleToggleFavorite(song)}>
                        <Ionicons name="heart" size={20} color="#EC4899" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyFavorites}>
                  <Ionicons name="heart-outline" size={48} color="#4B5563" />
                  <Text style={styles.emptyText}>No favorites yet</Text>
                  <Text style={styles.emptySubtext}>
                    Save songs from recommendations to see them here
                  </Text>
                </View>
              )}
            </View>

            {/* Connected Accounts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="link" size={20} color="#9CA3AF" />
                <Text style={styles.sectionTitle}>Connected Accounts</Text>
              </View>

              <SettingItem
                icon="musical-note"
                title={lastfmConnected ? `Last.fm: ${lastfmUsername}` : 'Connect Last.fm'}
                subtitle={lastfmConnected ? 'Tap to disconnect' : 'Sync your listening history'}
                rightElement="custom"
                customRightElement={
                  lastfmConnected ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color="#9CA3AF" />
                  )
                }
                onPress={handleConnectLastfm}
                iconColor="#EF4444"
              />

              <SettingItem
                icon="logo-youtube"
                title={youtubeConnected ? 'YouTube Connected' : 'Connect YouTube'}
                subtitle={youtubeConnected ? 'Tap to disconnect' : 'Play songs directly'}
                rightElement="custom"
                customRightElement={
                  youtubeConnected ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  ) : (
                    <Ionicons name="add-circle-outline" size={24} color="#9CA3AF" />
                  )
                }
                onPress={() => setYoutubeConnected(!youtubeConnected)}
                iconColor="#EF4444"
              />
            </View>

            {/* Settings */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="options" size={20} color="#9CA3AF" />
                <Text style={styles.sectionTitle}>Settings</Text>
              </View>

              <SettingItem
                icon="notifications"
                title="Notifications"
                subtitle="Get updates about new recommendations"
                rightElement="switch"
                switchValue={notificationsEnabled}
                onSwitchChange={setNotificationsEnabled}
                iconColor="#F59E0B"
              />

              <SettingItem
                icon="moon"
                title="Dark Mode"
                subtitle="Always use dark theme"
                rightElement="switch"
                switchValue={darkMode}
                onSwitchChange={setDarkMode}
                iconColor="#8B5CF6"
              />

              <SettingItem
                icon="warning"
                title="Explicit Content Filter"
                subtitle="Allow explicit lyrics"
                rightElement="switch"
                switchValue={explicitContent}
                onSwitchChange={setExplicitContent}
                iconColor="#EF4444"
              />

              <SettingItem
                icon="trash"
                title="Clear Cache"
                subtitle="Free up storage space"
                rightElement="chevron"
                onPress={handleClearCache}
                iconColor="#6B7280"
              />

              <SettingItem
                icon="information-circle"
                title="About"
                subtitle="Version 1.0.0"
                rightElement="chevron"
                onPress={handleAbout}
                iconColor="#3B82F6"
              />

              <SettingItem
                icon="log-out"
                title="Logout"
                rightElement="chevron"
                onPress={handleLogout}
                iconColor="#EF4444"
                destructive
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditProfileModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#030712', '#111827']}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setEditProfileModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Pressable onPress={handleSaveProfile}>
                <Text style={styles.modalSave}>Save</Text>
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Add Genre Modal */}
      <Modal
        visible={addGenreModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddGenreModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#030712', '#111827']}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setAddGenreModal(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Add Genre</Text>
              <Pressable onPress={handleAddGenre}>
                <Text style={styles.modalSave}>Add</Text>
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Genre Name</Text>
                <TextInput
                  style={styles.input}
                  value={newGenre}
                  onChangeText={setNewGenre}
                  placeholder="Enter genre name"
                  placeholderTextColor="#6B7280"
                  autoFocus
                />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: designSystem.spacing[8],
  },
  header: {
    paddingHorizontal: designSystem.spacing[5],
    paddingTop: designSystem.spacing[8],
    paddingBottom: designSystem.spacing[6],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...designSystem.shadows.lg,
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    paddingHorizontal: designSystem.spacing[5],
    paddingTop: designSystem.spacing[6],
  },
  statsContainer: {
    flexDirection: 'row',
    gap: designSystem.spacing[3],
    marginBottom: designSystem.spacing[6],
  },
  section: {
    marginBottom: designSystem.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[2],
    marginBottom: designSystem.spacing[3],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  preferenceCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: designSystem.borderRadius['2xl'],
    padding: designSystem.spacing[4],
    marginBottom: designSystem.spacing[3],
  },
  preferenceCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: designSystem.spacing[3],
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: designSystem.spacing[2],
  },
  favoritesCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: designSystem.borderRadius['2xl'],
    overflow: 'hidden',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designSystem.spacing[3],
    padding: designSystem.spacing[4],
  },
  favoriteItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(55, 65, 81, 0.5)',
  },
  favoriteAlbumArt: {
    width: 56,
    height: 56,
    borderRadius: designSystem.borderRadius.lg,
  },
  favoriteInfo: {
    flex: 1,
    minWidth: 0,
  },
  favoriteTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  favoriteArtist: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyFavorites: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: designSystem.borderRadius['2xl'],
    padding: designSystem.spacing[8],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: designSystem.spacing[3],
  },
  emptySubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: designSystem.spacing[1],
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: designSystem.spacing[5],
    paddingVertical: designSystem.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCancel: {
    fontSize: 17,
    color: '#9CA3AF',
  },
  modalSave: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9333EA',
  },
  modalContent: {
    padding: designSystem.spacing[5],
  },
  inputGroup: {
    marginBottom: designSystem.spacing[4],
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#D1D5DB',
    marginBottom: designSystem.spacing[2],
  },
  input: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: designSystem.borderRadius.xl,
    paddingHorizontal: designSystem.spacing[4],
    paddingVertical: designSystem.spacing[3],
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
});

export default ProfileScreen;
