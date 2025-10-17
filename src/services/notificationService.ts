import { supabase } from "@/lib/supabase";

interface CreateNotificationOptions {
  recipient_id: string;
  sender_id: string;
  type: "like" | "comment" | "reply" | "challenge" | "mention" | "profile_changes" | "role_change";
  entity_id: string;
  entity_type: "post" | "comment" | "challenge" | "profile_changes" | "role_change";
  message: string;
}

export async function createNotification(options: CreateNotificationOptions) {
  const { recipient_id, sender_id, type, entity_id, entity_type, message } = options;
  if (recipient_id === sender_id) return; // Avoid notifying yourself
  await supabase.from("notifications").insert([
    { recipient_id, sender_id, type, entity_id, entity_type, message },
  ]);
}
