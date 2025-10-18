import { supabase } from "@/lib/supabase";

interface CreateNotificationOptions {
  recipient_id: string;
  sender_id: string | null;
  type: "like" | "comment" | "reply" | "challenge" | "mention" | "profile_changes" | "role_change" | "reward";
  entity_id: string;
  entity_type: "post" | "comment" | "challenge" | "profile_changes" | "role_change" | "reward";
  message: string;
}

export async function createNotification(options: CreateNotificationOptions) {
  const { recipient_id, sender_id, type, entity_id, entity_type, message } = options;
  if (recipient_id === sender_id) return; // Avoid notifying yourself
  await supabase.from("notifications").insert([
    { recipient_id, sender_id, type, entity_id, entity_type, message },
  ]);
}
