/**
 * Profile API Service
 * Handles user profile operations
 */

import { supabase } from "@/lib/supabase/client";
import type { AvatarUploadResult, Profile, ProfileUpdate } from "../types";

export class ProfileService {
  /**
   * Fetch user profile by user ID
   */
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: ProfileUpdate
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Upload avatar image to storage
   */
  static async uploadAvatar(
    userId: string,
    file: File
  ): Promise<AvatarUploadResult> {
    try {
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file.");
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Image size should be less than 5MB.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      return { publicUrl, path: filePath };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  /**
   * Delete avatar from storage and update profile
   */
  static async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      const path = avatarUrl.split("/").slice(-2).join("/");

      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([path]);

      if (deleteError) throw deleteError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error deleting avatar:", error);
      throw error;
    }
  }

  /**
   * Update avatar in profile
   */
  static async updateAvatar(userId: string, publicUrl: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating avatar:", error);
      throw error;
    }
  }
}
