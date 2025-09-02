import { User } from "@supabase/supabase-js";
import React, { createContext, useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) setProfile(data);
  }, []);


  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) fetchProfile(authUser.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) fetchProfile(authUser.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error, data: { user: authUser } } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        throw new Error(
          "Please check your email and confirm your account before signing in."
        );
      }
      if (error.message === "Invalid login credentials") {
        throw new Error(
          'The email or password you entered is incorrect. Please try again or use the "Forgot Password" option if you need to reset your password.'
        );
      }
      throw new Error(
        "Unable to sign in. Please check your credentials and try again."
      );
    }

    if (authUser) await fetchProfile(authUser.id);
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    username: string
  ) => {
    try {
      // Check if username is available
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (existingUsername) {
        return {
          error: "This username is already taken. Please choose another.",
        };
      }

      // Check if email exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existingProfile) {
        return {
          error:
            "An account with this email already exists. Please sign in instead.",
        };
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
        error:
          error instanceof Error
            ? error.message
            : "An error occurred during signup",
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updateProfile = async (data: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  }) => {
    if (!user) throw new Error("No user logged in");

    // If updating username, check availability
    if (data.username) {
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", data.username.toLowerCase())
        .neq("id", user.id)
        .maybeSingle();

      if (existingUsername) {
        throw new Error("This username is already taken");
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);

    if (error) throw error;

    // Refresh local profile
    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
