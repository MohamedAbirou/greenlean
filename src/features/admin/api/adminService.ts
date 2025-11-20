/**
 * Admin API Service
 * Handles admin operations
 */

import { ML_SERVICE_URL } from "@/features/quiz";
import { supabase } from "@/lib/supabase/client";
import { createNotification } from "@/services/notificationService";
import type { Challenge } from "@/shared/types/challenge";
import { AnalyticsService } from "./analyticsService";

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
   * Delete/Archive a challenge
   * Archives if it has participants, deletes if it doesn't
   */
  static async deleteChallenge(challengeId: string): Promise<{ action: 'archived' | 'deleted'; message: string }> {
    try {
      const { data, error } = await supabase.rpc("archive_challenge", {
        p_challenge_id: challengeId,
      });

      if (error) throw error;

      return data as { action: 'archived' | 'deleted'; message: string };
    } catch (error) {
      console.error("Error deleting/archiving challenge:", error);
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

  static async cancelSubscription(user_id: string, subscription_id: string) {
    const res = await fetch(`${ML_SERVICE_URL}/api/admin/stripe/cancel-subscription`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, subscription_id }),
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
  static async exportToCSV(
    dataType: "users" | "subscriptions" | "challenges" | "analytics"
  ): Promise<string> {
    let data: any[];
    let headers: string[];

    switch (dataType) {
      case "users":
        const { data: users } = await supabase
          .from("profiles")
          .select("email, full_name, plan_id, created_at");
        data = users || [];
        headers = ["Email", "Full Name", "Plan", "Joined Date"];
        break;

      case "subscriptions":
        const subs = await this.getAllSubscribers();
        data = subs.subscribers || [];
        headers = ["Email", "Status", "Plan", "Created"];
        break;

      case "challenges":
        const { data: challenges } = await supabase
          .from("challenges")
          .select("*, challenge_participants(count)");
        data = challenges || [];
        headers = ["Title", "Type", "Difficulty", "Participants"];
        break;

      case "analytics":
        const analytics = await AnalyticsService.getDashboardMetrics();

        // Flatten object to a single row for CSV export
        data = [
          {
            date: new Date().toISOString().split("T")[0],
            users: analytics.users?.total || 0,
            subscriptions: analytics.subscriptions?.active || 0,
            challenges: analytics.challenges?.total || 0,
            revenue: analytics.revenue?.thisMonth || 0,
            conversion_rate: analytics.conversionRate || 0,
            conversion_rate_growth: analytics.conversionRateGrowth || 0,
          },
        ];

        headers = [
          "Date",
          "Users",
          "Subscriptions",
          "Challenges",
          "Revenue",
          "Conversion Rate",
          "Conversion Rate Growth",
        ];
        break;

      default:
        throw new Error("Invalid data type");
    }

    // Convert to CSV
    return this.convertToCSV(data, headers);
  }

  /**
   * Convert data array to CSV format
   */
  private static convertToCSV(data: any[], headers: string[]): string {
    const rows = data.map((row) => {
      return headers
        .map((header) => {
          const key = header.toLowerCase().replace(" ", "_");
          let value = row[key];

          // Handle nested objects
          if (typeof value === "object" && value !== null) {
            value = JSON.stringify(value);
          }

          // Handle dates
          if (key.includes("date") || key === "created" || key === "joined") {
            if (typeof value === "number") {
              value = new Date(value * 1000).toISOString();
            }
          }

          return `"${value || ""}"`;
        })
        .join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }
}
