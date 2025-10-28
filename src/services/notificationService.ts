import { supabase } from "@/lib/supabase/client";

interface CreateNotificationOptions {
  recipient_id: string;
  sender_id: string | null;
  type: "challenge" | "profile_changes" | "role_change" | "reward";
  entity_id: string;
  entity_type: "challenge" | "profile_changes" | "role_change" | "reward";
  message: string;
}

export async function createNotification(options: CreateNotificationOptions) {
  const { recipient_id, sender_id, type, entity_id, entity_type, message } =
    options;
  if (
    (type === "profile_changes" || type === "role_change") &&
    recipient_id === sender_id
  )
    return; // Avoid notifying yourself
  await supabase
    .from("notifications")
    .insert([
      { recipient_id, sender_id, type, entity_id, entity_type, message },
    ]);
}
