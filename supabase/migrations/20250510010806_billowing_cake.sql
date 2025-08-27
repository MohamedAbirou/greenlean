/*
  # Platform Settings Table

  1. New Tables
    - `platform_settings`
      - Core platform configuration
      - Theme settings
      - Security settings
      - Maintenance settings
      - Notification settings

  2. Security
    - Enable RLS
    - Add admin-only policies
    - Create admin check function
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

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can manage platform settings" ON platform_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policy
CREATE POLICY "Admins can manage platform settings"
ON platform_settings
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger for updated_at
DO $$ 
BEGIN
  DROP TRIGGER IF EXISTS update_platform_settings_updated_at ON platform_settings;
  CREATE TRIGGER update_platform_settings_updated_at
    BEFORE UPDATE ON platform_settings
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();
END $$;

-- Insert default settings if none exist
INSERT INTO platform_settings (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM platform_settings);