/**
 * Auth Hook
 * Main hook for authentication operations
 */

import { useCallback } from "react";
import { useAuthContext } from "./useAuthContext";
import { AuthService } from "../api/authService";
import type { SignInCredentials, SignUpData, UpdateProfileData, SignUpResult } from "../types";

export function useAuth() {
  const { user, profile, loading, isAuthenticated, refreshProfile } = useAuthContext();

  const signIn = useCallback(async (credentials: SignInCredentials): Promise<void> => {
    await AuthService.signIn(credentials);
  }, []);

  const signUp = useCallback(async (data: SignUpData): Promise<SignUpResult> => {
    return await AuthService.signUp(data);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await AuthService.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    await AuthService.resetPassword(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<void> => {
    await AuthService.updatePassword(newPassword);
  }, []);

  const updateProfile = useCallback(
    async (data: UpdateProfileData): Promise<void> => {
      if (!user) throw new Error("No user logged in");
      await AuthService.updateProfile(user.id, data);
      await refreshProfile();
    },
    [user, refreshProfile]
  );

  const checkUsernameAvailability = useCallback(
    async (username: string): Promise<boolean> => {
      return await AuthService.checkUsernameAvailability(username, user?.id);
    },
    [user]
  );

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    checkUsernameAvailability,
  };
}
