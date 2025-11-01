export interface UserReview {
  id: string;
  user_id: string;
  rating: number;
  review_text: string;
  weight_change_kg?: number | null;
  created_at: string;
}

export interface ReviewProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface ReviewWithProfile extends UserReview {
  user_profile: ReviewProfile;
}
