/**
 * Admin API Service
 * Handles admin operations
 */

import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import type { Challenge } from "@/types/challenge";

export class AdminService {
  /**
   * Check if user has admin privileges
   */
  static async checkAdminStatus(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking admin status:", error);
      return false;
    }
  }

  /**
   * Create a new challenge
   */
  static async createChallenge(
    challengeData: Partial<Challenge>,
    adminUserId: string
  ): Promise<Challenge> {
    try {
      const { data: inserted, error } = await supabase
        .from("challenges")
        .insert([challengeData])
        .select("*")
        .single();

      if (error) throw error;

      const { data: participants } = await supabase
        .from("challenge_participants")
        .select("user_id")
        .eq("challenge_id", inserted.id);

      if (participants?.length) {
        await Promise.all(
          participants.map((p) =>
            createNotification({
              recipient_id: p.user_id,
              sender_id: adminUserId,
              type: "challenge",
              entity_id: inserted.id,
              entity_type: "challenge",
              message: `A new challenge "${inserted.title}" has been created.`,
            })
          )
        );
      }

      return inserted;
    } catch (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
  }

  /**
   * Update a challenge
   */
  static async updateChallenge(
    challengeId: string,
    updates: Partial<Challenge>
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc("update_challenge_and_rewards", {
        p_challenge_id: challengeId,
        p_data: updates,
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error updating challenge:", error);
      throw error;
    }
  }

  /**
   * Delete a challenge
   */
  static async deleteChallenge(challengeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting challenge:", error);
      throw error;
    }
  }

  /**
   * Delete a user (calls edge function)
   */
  static async deleteUser(
    targetUserId: string,
    callerUserId: string
  ): Promise<void> {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            target_user: targetUserId,
            caller_id: callerUserId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to delete user!");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Send notification to a single user
   */
  static async sendNotification(
    notification: Parameters<typeof createNotification>[0]
  ): Promise<void> {
    try {
      await createNotification(notification);
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  }
}
