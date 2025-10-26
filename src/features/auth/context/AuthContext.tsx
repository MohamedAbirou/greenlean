/**
 * Auth Context
 * Provides authentication state to the app
 */

import { createContext, useCallback } from "react";
import type { ReactNode } from "react";
import { useAuthState } from "../hooks/useAuthState";
import { AuthService } from "../api/authService";
import type { AuthState } from "../types";

interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authState = useAuthState();

  const refreshProfile = useCallback(async () => {
    if (authState.user) {
      try {
        await AuthService.fetchProfile(authState.user.id);
      } catch (error) {
        console.error("Error refreshing profile:", error);
      }
    }
  }, [authState.user]);

  return (
    <AuthContext.Provider value={{ ...authState, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
