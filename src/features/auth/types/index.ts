/**
 * Auth Feature Types
 * Type definitions for authentication
 */

import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

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
