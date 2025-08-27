/*
  # Platform Settings Table

  1. New Tables
    - `platform_settings`
      - `id` (uuid, primary key)
      - `theme_color` (text)
      - `theme_mode` (text)
      - `platform_name` (text)
      - `logo_url` (text)
      - `favicon_url` (text)
      - `admin_2fa_required` (boolean)
      - `account_lockout_attempts` (integer)
      - `session_timeout_minutes` (integer)
      - `maintenance_mode` (boolean)
      - `maintenance_message` (text)
      - `maintenance_start_time` (timestamp)
      - `maintenance_end_time` (timestamp)
      - `email_notifications_enabled` (boolean)
      - `notification_frequency` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_color text DEFAULT '#22C55E'::text,
  theme_mode text DEFAULT 'light'::text CHECK (theme_mode = ANY (ARRAY['light'::text, 'dark'::text, 'system'::text])),
  platform_name text DEFAULT 'GreenLean'::text,
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
  notification_frequency text DEFAULT 'daily'::text CHECK (notification_frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'monthly'::text])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Insert default settings if none exist
INSERT INTO platform_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);