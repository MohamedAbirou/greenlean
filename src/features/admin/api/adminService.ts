/**
 * Admin API Service
 * Handles admin operations
 */

import { ML_SERVICE_URL } from "@/features/quiz";
import { supabase } from "@/lib/supabase/client";
import { createNotification } from "@/services/notificationService";
import type { Challenge } from "@/shared/types/challenge";

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
  static async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<void> {
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
      const { error } = await supabase.from("challenges").delete().eq("id", challengeId);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting challenge:", error);
      throw error;
    }
  }

  /**
   * Delete a user (calls edge function)
   */
  static async deleteUser(targetUserId: string, callerUserId: string): Promise<void> {
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          target_user: targetUserId,
          caller_id: callerUserId,
        }),
      });

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

  static async getSaasMetrics(): Promise<any> {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/saas-metrics`);
    if (!res.ok) throw new Error("Failed to fetch SaaS metrics");
    const data = await res.json();
    return data;
  }

  static async getAllSubscribers(): Promise<any> {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/subscribers`);
    if (!res.ok) throw new Error("Failed to fetch subscribers");
    const data = await res.json();
    return data;
  }

  static async cancelSubscription(subscription_id: string) {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/stripe/cancel-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_id }),
    });
    return res.json();
  }

  static async resendInvoice(invoice_id: string) {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/stripe/resend-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoice_id }),
    });
    return res.json();
  }

  static async changePlan(subscription_id: string, new_price_id: string) {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/stripe/change-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_id, new_price_id }),
    });
    return res.json();
  }

  // Optionally, add applyCoupon (see backend)
  static async applyCoupon(subscription_id: string, coupon_id: string) {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/stripe/apply-coupon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_id, coupon_id }),
    });
    return res.json();
  }

  static async extendTrial(subscription_id: string, trial_end: number) {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/stripe/extend-trial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription_id, trial_end }),
    });
    return res.json();
  }

  /**
   * Get detailed user analytics
   */
  static async getUserAnalytics(userId: string) {
    const [profile, rewards, plans, activity, challenges] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_rewards").select("*").eq("user_id", userId).single(),
      supabase.from("ai_meal_plans").select("*").eq("user_id", userId),
      supabase
        .from("user_activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("activity_date", { ascending: false })
        .limit(30),
      supabase.from("challenge_participants").select("*, challenges(*)").eq("user_id", userId),
    ]);

    return {
      profile: profile.data,
      rewards: rewards.data,
      plansGenerated: plans.data?.length || 0,
      recentActivity: activity.data || [],
      challengesJoined: challenges.data?.length || 0,
      challengesCompleted: challenges.data?.filter((c) => c.completed).length || 0,
    };
  }

  /**
   * Bulk update user plans
   */
  static async bulkUpdateUserPlans(userIds: string[], newPlan: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ plan_id: newPlan })
      .in("id", userIds);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Export data to CSV
   */
  static async exportToCSV(dataType: "users" | "subscriptions" | "challenges") {
    let data;
    let headers;

    switch (dataType) {
      case "users":
        const { data: users } = await supabase
          .from("profiles")
          .select("email, full_name, plan_id, created_at");
        data = users;
        headers = ["Email", "Full Name", "Plan", "Joined Date"];
        break;

      case "subscriptions":
        const subs = await this.getAllSubscribers();
        data = subs.subscribers;
        headers = ["Email", "Status", "Plan", "Created"];
        break;

      case "challenges":
        const { data: challenges } = await supabase
          .from("challenges")
          .select("*, challenge_participants(count)");
        data = challenges;
        headers = ["Title", "Type", "Difficulty", "Participants"];
        break;
    }

    // Convert to CSV
    const csv = this.convertToCSV(data, headers);
    return csv;
  }

  private static convertToCSV(data: any[], headers: string[]): string {
    const rows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header.toLowerCase().replace(" ", "_")];
          return `"${value || ""}"`;
        })
        .join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }
}
