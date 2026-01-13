/**
 * Supabase API Client
 * Handles authentication and user data with Supabase
 */

import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { env } from '@/config/env';
import { SupabaseProfile, SupabaseAuthResponse } from '@/types/api';

// Initialize Supabase client
const createSupabaseClient = (): SupabaseClient | null => {
  // Check if we have actual values (not placeholders)
  if (!env.supabaseUrl || 
      !env.supabaseAnonKey || 
      env.supabaseUrl === 'http://localhost:54321' || 
      env.supabaseAnonKey === 'dev_placeholder' ||
      env.supabaseUrl.includes('your_') ||
      env.supabaseAnonKey.includes('your_')) {
    console.warn('⚠️  Supabase not configured. Authentication features disabled.');
    return null;
  }

  try {
    const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
    console.log('✅ Supabase client initialized');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return null;
  }
};

export const supabase = createSupabaseClient();

/**
 * Signs in user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: new Error('Supabase not configured'),
    };
  }

  try {
    if (env.isDevelopment) {
      console.log(`🔐 Signing in user: ${email}`);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (env.isDevelopment) {
      console.log('✅ User signed in successfully');
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('Sign in failed'),
    };
  }
}

/**
 * Signs up new user with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  username: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  if (!supabase) {
    return {
      user: null,
      session: null,
      error: new Error('Supabase not configured'),
    };
  }

  try {
    if (env.isDevelopment) {
      console.log(`📝 Signing up user: ${email}`);
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: email,
          username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Failed to create profile:', profileError);
      }
    }

    if (env.isDevelopment) {
      console.log('✅ User signed up successfully');
    }

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      user: null,
      session: null,
      error: error instanceof Error ? error : new Error('Sign up failed'),
    };
  }
}

/**
 * Signs out current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    if (env.isDevelopment) {
      console.log('👋 Signing out user');
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    if (env.isDevelopment) {
      console.log('✅ User signed out successfully');
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      error: error instanceof Error ? error : new Error('Sign out failed'),
    };
  }
}

/**
 * Gets current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Gets current session
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

/**
 * Gets user profile from database
 */
export async function getUserProfile(userId: string): Promise<SupabaseProfile | null> {
  if (!supabase) {
    return null;
  }

  try {
    if (env.isDevelopment) {
      console.log(`👤 Fetching profile for user: ${userId}`);
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data as SupabaseProfile;
  } catch (error) {
    console.error('Get user profile error:', error);
    return null;
  }
}

/**
 * Updates user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<SupabaseProfile>
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    if (env.isDevelopment) {
      console.log(`✏️  Updating profile for user: ${userId}`);
    }

    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    if (env.isDevelopment) {
      console.log('✅ Profile updated successfully');
    }

    return { error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return {
      error: error instanceof Error ? error : new Error('Update profile failed'),
    };
  }
}

/**
 * Subscribes to authentication state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  if (!supabase) {
    console.warn('Supabase not configured - auth state changes disabled');
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Saves user's favorite song
 */
export async function saveFavoriteSong(
  userId: string,
  songId: string,
  songData: {
    title: string;
    artist: string;
    albumArt: string;
    youtubeId: string;
  }
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        song_id: songId,
        ...songData,
        created_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Save favorite error:', error);
    return {
      error: error instanceof Error ? error : new Error('Save favorite failed'),
    };
  }
}

/**
 * Removes user's favorite song
 */
export async function removeFavoriteSong(
  userId: string,
  songId: string
): Promise<{ error: Error | null }> {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId);

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Remove favorite error:', error);
    return {
      error: error instanceof Error ? error : new Error('Remove favorite failed'),
    };
  }
}

/**
 * Gets user's favorite songs
 */
export async function getUserFavorites(userId: string): Promise<any[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Get favorites error:', error);
    return [];
  }
}
