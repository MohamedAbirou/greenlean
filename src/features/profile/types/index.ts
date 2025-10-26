/**
 * Profile Feature Types
 */

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  full_name?: string;
  avatar_url?: string | null;
}

export interface AvatarUploadResult {
  publicUrl: string;
  path: string;
}
