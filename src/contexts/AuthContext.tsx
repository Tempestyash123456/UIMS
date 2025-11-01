import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, AuthContextType } from '../types';
import { profileApi } from '../services/api';
import toast from 'react-hot-toast';

// AuthContextType is imported from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Tracks initial auth session load (fast check)
  const [profileLoading, setProfileLoading] = useState(false); // Tracks profile data fetch (slow query)

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const data = await profileApi.getProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Could not fetch profile.');
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  // 1. Initial auth state listener (sets authLoading to false quickly)
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        
        // CRITICAL CHANGE: Set authLoading to false IMMEDIATELY after auth state is known
        setAuthLoading(false); 
        
        if (!session?.user) {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Separate useEffect for fetching profile data once user is available
  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
    // We intentionally omit fetchProfile from dependencies as it relies on state 
    // changes of `user` which is already a dependency.
  }, [user]); 

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Sign up failed.');

      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      });
      toast.success('Account created successfully! Please check your email to verify.');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('You must be logged in to update your profile.');
    setProfileLoading(true); // Set loading for the update operation
    try {
      await profileApi.updateProfile(user.id, updates);
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setProfileLoading(false); // Clear loading
    }
  };

  const value: AuthContextType = {
    // Cast the Supabase user to the app User type to satisfy AuthContextType
    user: user as unknown as any,
    profile,
    loading: authLoading,
    profileLoading, // Pass the new profile loading status
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}