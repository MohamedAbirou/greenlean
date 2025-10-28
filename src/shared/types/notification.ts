export type NotificationType = 'profile_changes' | 'role_change' | 'challenge' | 'reward';
export type NotificationEntityType = 'profile_changes' | 'role_change' | 'challenge' | 'reward';

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string;
  type: NotificationType;
  entity_id: string;
  entity_type: NotificationEntityType;
  message: string;
  read: boolean;
  created_at: string;
}
