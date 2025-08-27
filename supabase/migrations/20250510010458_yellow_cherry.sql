/*
  # Add platform settings table and functionality

  1. New Tables
    - `platform_settings`
      - Global platform configuration
      - Theme settings
      - Security settings
      - Notification settings
      - Maintenance settings

  2. Security
    - Enable RLS
    - Only admins can manage settings
*/

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_color text DEFAULT '#22C55E',
  theme_mode text DEFAULT 'light' CHECK (theme_mode IN ('light', 'dark', 'system')),
  platform_name text DEFAULT 'GreenLean',
  logo_url text,
  favicon_url text,
  admin_2fa_required boolean DEFAULT false,
  account_lockout_attempts integer DEFAULT 5,
  session_timeout_minutes integer DEFAULT 60,
  maintenance_mode boolean DEFAULT false,
  maintenance_message text,
  maintenance_start_time timestamptz,
  maintenance_end_time timestamptz,
  email_notifications_enabled boolean DEFAULT true,
  notification_frequency text DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage platform settings"
ON platform_settings
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert default settings
INSERT INTO platform_settings (
  theme_color,
  theme_mode,
  platform_name,
  admin_2fa_required,
  account_lockout_attempts,
  session_timeout_minutes,
  maintenance_mode,
  email_notifications_enabled,
  notification_frequency
) VALUES (
  '#22C55E',
  'light',
  'GreenLean',
  false,
  5,
  60,
  false,
  true,
  'daily'
);

-- Create function to get platform settings
CREATE OR REPLACE FUNCTION get_platform_settings()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT row_to_json(s)::jsonb
  FROM platform_settings s
  LIMIT 1;
$$;