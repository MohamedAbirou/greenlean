/**
 * Auth State Hook
 * Manages authentication state with Supabase
 */

import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { AuthService } from "../api/authService";
import type { AuthState, Profile } from "../types";

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await AuthService.fetchProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchProfile(authUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchProfile(authUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
  };
}
