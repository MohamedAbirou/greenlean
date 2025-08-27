import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: { full_name?: string; avatar_url?: string; username?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and confirm your account before signing in.');
      }
      if (error.message === 'Invalid login credentials') {
        throw new Error('The email or password you entered is incorrect. Please try again or use the "Forgot Password" option if you need to reset your password.');
      }
      throw new Error('Unable to sign in. Please check your credentials and try again.');
    }
  };

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    try {
      // Check if username is available
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      if (existingUsername) {
        return { error: 'This username is already taken. Please choose another.' };
      }

      // Check if email exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingProfile) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }

      // Proceed with signup
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error 
          ? error.message 
          : 'An error occurred during signup' 
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updateProfile = async (data: { full_name?: string; avatar_url?: string; username?: string }) => {
    if (!user) throw new Error('No user logged in');

    // If updating username, check availability
    if (data.username) {
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', data.username.toLowerCase())
        .neq('id', user.id)
        .maybeSingle();

      if (existingUsername) {
        throw new Error('This username is already taken');
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword, 
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};