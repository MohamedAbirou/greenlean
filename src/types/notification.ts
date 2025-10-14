export type NotificationType = 'like' | 'comment' | 'reply' | 'mention' | 'challenge';
export type NotificationEntityType = 'post' | 'comment' | 'challenge';

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
