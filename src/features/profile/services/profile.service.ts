import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import type { Invoice, Profile, ProfileUpdateData, SubscriptionInfo } from "../types/profile.types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*, admin_users(role)").eq("id", userId).single();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: ProfileUpdateData): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadAvatar(userId: string, file: File): Promise<string> {
    // Compress the image
    const options = {
      maxSizeMB: 0.1, // 100KB max! adjust as needed
      maxWidthOrHeight: 400, // resize to 300x300 max
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // Construct path (first folder = userId, matches your RLS)
    const fileExt = compressedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, compressedFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await this.updateProfile(userId, { avatar_url: data.publicUrl });

    return data.publicUrl;
  }

  // static async uploadAvatar(userId: string, file: File): Promise<string> {
  //   const fileExt = file.name.split(".").pop();
  //   const fileName = `${userId}-${Date.now()}.${fileExt}`;
  //   const filePath = `${userId}/${fileName}`;

  //   const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, {
  //     upsert: true,
  //     metadata: { user_id: userId }, // 🔹 crucial for RLS
  //   });

  //   if (uploadError) throw uploadError;

  //   const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  //   await this.updateProfile(userId, { avatar_url: data.publicUrl });

  //   return data.publicUrl;
  // }

  static async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    const path = avatarUrl.split("/avatars/")[1];
    if (path) {
      await supabase.storage.from("avatars").remove([`avatars/${path}`]);
    }
    await this.updateProfile(userId, { avatar_url: null });
  }

  // Stripe-related methods
  static async getSubscription(customerId: string): Promise<SubscriptionInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stripe/customer/${customerId}`);
      const result = await response.json();

      if (!result.success || !result.customer.subscriptions?.data?.length) {
        return null;
      }

      const sub = result.customer.subscriptions.data[0];
      return {
        subscription_id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        plan_id: sub.items.data[0].price.id,
        plan_name: sub.items.data[0].price.nickname || "Unknown",
      };
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  }

  static async getInvoices(customerId: string): Promise<Invoice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/invoices?customer_id=${customerId}`);
      const result = await response.json();

      if (!result.success) return [];

      return result.invoices.map((inv: any) => ({
        id: inv.id,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        created: inv.created,
        currency: inv.currency,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
        status: inv.status,
        period_start: inv.period_start,
        period_end: inv.period_end,
      }));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stripe/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }

  static async changePlan(subscriptionId: string, newPriceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stripe/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          new_price_id: newPriceId,
        }),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error changing plan:", error);
      return false;
    }
  }
}
