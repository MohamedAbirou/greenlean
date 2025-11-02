import { supabase } from "@/lib/supabase";
import type { ReviewProfile, UserReview } from "../types/review.types";

/**
 * Fetch all reviews, joining with user profile fields needed for display.
 * Sorted by created_at descending.
 */
export async function fetchAllReviewsWithProfiles(): Promise<
  Array<UserReview & { user_profile: ReviewProfile }>
> {
  try {
    // Adjust the select clause as per your actual profile field names.
    const { data, error } = await supabase
      .from("user_reviews")
      .select(`*, user_profile:profiles(id, username, full_name, avatar_url)`) // Rename as needed
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as Array<UserReview & { user_profile: ReviewProfile }>;
  } catch (error) {
    console.error("Error fetching all reviews with profiles:", error);
    throw error;
  }
}

/**
 * Fetch the current user's review, if it exists.
 */
export async function fetchMyReview(userId?: string): Promise<UserReview | null> {
  if (!userId) return null; // ✅ prevent invalid query

  try {
    const { data, error } = await supabase
      .from("user_reviews")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  } catch (error) {
    console.error("Error fetching my review:", error);
    throw error;
  }
}

/**
 * Create or update the current user's review.
 * (Enforces upsert/one review constraint.)
 */
export async function submitReview(params: Omit<UserReview, "id" | "created_at">): Promise<void> {
  const { error } = await supabase.from("user_reviews").upsert(params, { onConflict: "user_id" });
  if (error) throw error;
}
