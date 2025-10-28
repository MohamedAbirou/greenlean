import { queryKeys } from "@/lib/queryKeys";
import { supabase } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface PlatformSettings {
  id: string;
  theme_color: string;
  theme_mode: "light" | "dark" | "system";
  platform_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  admin_2fa_required: boolean;
  account_lockout_attempts: number;
  session_timeout_minutes: number;
  maintenance_mode: boolean;
  maintenance_message: string | null;
  maintenance_start_time: string | null;
  maintenance_end_time: string | null;
  email_notifications_enabled: boolean;
  notification_frequency: "daily" | "weekly" | "monthly";
}

export const fetchSettings = async (): Promise<PlatformSettings | null> => {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const useSettingsQuery = () =>
  useQuery<PlatformSettings | null>({
    queryKey: queryKeys.settings,
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
  });

