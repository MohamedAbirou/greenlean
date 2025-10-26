/**
 * Admin Feature Types
 */

import type { Challenge } from "@/types/challenge";

export interface AdminStatus {
  isAdmin: boolean;
  userId?: string;
}

export interface AdminUser {
  id: string;
  created_at?: string;
}

export interface ChallengeWithParticipants extends Challenge {
  participant_count?: number;
}

export interface NotificationPayload {
  recipient_id: string;
  sender_id: string;
  type: string;
  entity_id: string;
  entity_type: string;
  message: string;
}
