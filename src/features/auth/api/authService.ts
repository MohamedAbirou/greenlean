/**
 * Auth API Service
 * All authentication-related API calls
 */

import { supabase } from "@/lib/supabase";
import type {
  SignInCredentials,
  SignUpData,
  UpdateProfileData,
  Profile,
  SignUpResult,
} from "../types";

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signIn({ email, password }: SignInCredentials): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
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
      throw new Error("Unable to sign in. Please check your credentials and try again.");
    }
  }

  /**
   * Sign up with email, password, and profile data
   */
  static async signUp(data: SignUpData): Promise<SignUpResult> {
    try {
      const { email, password, fullName, username } = data;
      const normalizedUsername = username.toLowerCase();

      const usernameAvailable = await this.checkUsernameAvailability(normalizedUsername);
      if (!usernameAvailable) {
        return {
          success: false,
          error: "This username is already taken. Please choose another.",
        };
      }

      const emailAvailable = await this.checkEmailAvailability(email);
      if (!emailAvailable) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: normalizedUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred during signup",
      };
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  /**
   * Update password
   */
  static async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  /**
   * Fetch user profile
   */
  static async fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: UpdateProfileData): Promise<void> {
    if (data.username) {
      const normalizedUsername = data.username.toLowerCase();
      const available = await this.checkUsernameAvailability(normalizedUsername, userId);
      if (!available) {
        throw new Error("This username is already taken");
      }
      data.username = normalizedUsername;
    }

    const { error } = await supabase.from("profiles").update(data).eq("id", userId);

    if (error) throw error;
  }

  /**
   * Check if username is available
   */
  static async checkUsernameAvailability(
    username: string,
    excludeUserId?: string
  ): Promise<boolean> {
    let query = supabase
      .from("profiles")
      .select("username")
      .eq("username", username.toLowerCase());

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data } = await query.maybeSingle();
    return !data;
  }

  /**
   * Check if email is available
   */
  static async checkEmailAvailability(email: string): Promise<boolean> {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    return !data;
  }

  /**
   * Validate username format
   */
  static validateUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  }
}
