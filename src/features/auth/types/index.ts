/**
 * Auth Feature Types
 * Type definitions for authentication
 */

import type { Profile } from "@/features/profile";
import type { User } from "@supabase/supabase-js";


export interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  username: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
}