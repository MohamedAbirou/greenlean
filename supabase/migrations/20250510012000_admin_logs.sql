/*
  # Admin Logs Table
  - Stores error/warning logs from both frontend and backend
  - Only admins can view and manage logs
  - Includes log level, source, message, stack trace, and metadata
*/

CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('error', 'warning', 'info', 'debug')),
  source text NOT NULL, -- 'frontend' or 'backend'
  message text NOT NULL,
  stack_trace text,
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view and manage logs
CREATE POLICY "Admins can manage admin logs"
  ON admin_logs FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert logs"
  ON admin_logs FOR INSERT TO service_role
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX admin_logs_level_idx ON admin_logs(level);
CREATE INDEX admin_logs_source_idx ON admin_logs(source);
CREATE INDEX admin_logs_created_at_idx ON admin_logs(created_at DESC);
CREATE INDEX admin_logs_user_id_idx ON admin_logs(user_id);

-- Function to log errors (can be called from frontend or backend)
CREATE OR REPLACE FUNCTION log_admin_error(
  p_level text,
  p_source text,
  p_message text,
  p_stack_trace text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_logs (
    level,
    source,
    message,
    stack_trace,
    metadata,
    user_id,
    user_agent,
    ip_address
  ) VALUES (
    p_level,
    p_source,
    p_message,
    p_stack_trace,
    p_metadata,
    p_user_id,
    current_setting('request.headers', true)::jsonb->>'user-agent',
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
  );
END;
$$;
