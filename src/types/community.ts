export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  mentions: string[];
  user: Profile;
  likes: number;
  liked_by_user: boolean;
  replies_count: number;
  replies?: Comment[];
  replies_fetched?: boolean;
}

export interface Photo {
  id: string;
  photo_url: string;
  caption: string;
  week_number: number;
  created_at: string;
  user_id: string;
  user: Profile;
  profile: Profile;
  likes: number;
  liked_by_user: boolean;
  comments: Comment[];
  comments_count: number;
  comments_fetched?: boolean;
}
