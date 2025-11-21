-- ============================================================================
-- MIGRATION 003: PRODUCTION TABLES
-- Priority: HIGH - Add within 1 week of production launch
-- Estimated time: 10-15 minutes
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABLE 1: email_logs - Track all sent emails
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_type text NOT NULL CHECK (email_type IN (
    'welcome',
    'progress_report',
    're_engagement',
    'plan_complete',
    'subscription_started',
    'subscription_cancelled',
    'payment_successful',
    'payment_failed'
  )),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN (
    'sent',
    'delivered',
    'opened',
    'clicked',
    'bounced',
    'failed',
    'spam'
  )),
  error_message text,
  resend_message_id text, -- Resend API message ID
  sent_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email logs"
ON email_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email logs"
ON email_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage email logs"
ON email_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE email_logs IS
  'Tracks all emails sent to users for delivery monitoring and debugging';

-- ============================================================================
-- TABLE 2: email_preferences - User email subscription preferences
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  welcome_emails boolean DEFAULT true,
  progress_emails boolean DEFAULT true,
  re_engagement_emails boolean DEFAULT true,
  plan_complete_emails boolean DEFAULT true,
  marketing_emails boolean DEFAULT true,
  subscription_emails boolean DEFAULT true,
  unsubscribe_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_preferences_token ON email_preferences(unsubscribe_token);

-- Trigger for updated_at
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email preferences"
ON email_preferences FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own email preferences"
ON email_preferences FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email preferences"
ON email_preferences FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Public can update via unsubscribe token (application validates token)
CREATE POLICY "Public can update via unsubscribe"
ON email_preferences FOR UPDATE
TO public
USING (unsubscribe_token IS NOT NULL)
WITH CHECK (unsubscribe_token IS NOT NULL);

-- Service role has full access
CREATE POLICY "Service role can manage email preferences"
ON email_preferences FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE email_preferences IS
  'User email subscription preferences and unsubscribe tokens';

-- Function to initialize email preferences for new users
CREATE OR REPLACE FUNCTION initialize_email_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.email_preferences (user_id, created_at, updated_at)
  VALUES (NEW.id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Trigger to auto-create email preferences
CREATE TRIGGER trigger_initialize_email_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION initialize_email_preferences();

-- ============================================================================
-- TABLE 3: subscription_history - Track subscription changes over time
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL REFERENCES plans(id),
  stripe_subscription_id text,
  status text NOT NULL CHECK (status IN (
    'active',
    'canceled',
    'past_due',
    'unpaid',
    'trialing',
    'paused'
  )),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  cancel_reason text,
  cancel_at_period_end boolean DEFAULT false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_subscription_history_started_at ON subscription_history(started_at DESC);
CREATE INDEX idx_subscription_history_status ON subscription_history(status);
CREATE INDEX idx_subscription_history_stripe_id ON subscription_history(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- RLS
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history"
ON subscription_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription history"
ON subscription_history FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage subscription history"
ON subscription_history FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE subscription_history IS
  'Historical record of all subscription changes for auditing and analytics';

-- ============================================================================
-- TABLE 4: payment_transactions - Track all payment attempts
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id text UNIQUE,
  stripe_invoice_id text,
  stripe_charge_id text,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL CHECK (status IN (
    'succeeded',
    'failed',
    'pending',
    'refunded',
    'canceled'
  )),
  payment_method_type text, -- 'card', 'bank', etc.
  card_brand text, -- 'visa', 'mastercard', etc.
  card_last4 text,
  error_code text,
  error_message text,
  refunded_amount_cents integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_intent ON payment_transactions(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment transactions"
ON payment_transactions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage payment transactions"
ON payment_transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE payment_transactions IS
  'Complete history of all payment attempts for financial records and debugging';

-- ============================================================================
-- TABLE 5: stripe_webhook_events - Store webhook events for debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL,
  processed boolean DEFAULT false,
  processing_error text,
  attempts integer DEFAULT 0,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_stripe_webhook_events_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX idx_stripe_webhook_events_received_at ON stripe_webhook_events(received_at DESC);
CREATE INDEX idx_stripe_webhook_events_stripe_id ON stripe_webhook_events(stripe_event_id);

-- RLS (admin only)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view webhook events"
ON stripe_webhook_events FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage webhook events"
ON stripe_webhook_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON TABLE stripe_webhook_events IS
  'Raw Stripe webhook events for debugging and replay in case of processing failures';

-- ============================================================================
-- TABLE 6: audit_logs - Track sensitive operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'user.created', 'user.deleted', 'admin.granted', etc.
  entity_type text, -- 'profile', 'admin_user', 'subscription', etc.
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS (admin only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can insert audit logs"
ON audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

COMMENT ON TABLE audit_logs IS
  'Audit trail of all sensitive operations for security and compliance';

-- Function to log sensitive operations
CREATE OR REPLACE FUNCTION log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    metadata,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    inet(current_setting('request.headers', true)::jsonb->>'x-forwarded-for'),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_metadata,
    now()
  )
  RETURNING id INTO audit_id;

  RETURN audit_id;
END;
$function$;

-- ============================================================================
-- Commit transaction
-- ============================================================================

COMMIT;

-- ============================================================================
-- Verification queries
-- ============================================================================

-- Verify all tables were created
-- SELECT tablename FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'email_logs',
--     'email_preferences',
--     'subscription_history',
--     'payment_transactions',
--     'stripe_webhook_events',
--     'audit_logs'
--   );

-- Verify RLS is enabled on all new tables
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'email_logs',
--     'email_preferences',
--     'subscription_history',
--     'payment_transactions',
--     'stripe_webhook_events',
--     'audit_logs'
--   );

-- Verify policies exist
-- SELECT tablename, COUNT(*) as policy_count
-- FROM pg_policies
-- WHERE tablename IN (
--   'email_logs',
--   'email_preferences',
--   'subscription_history',
--   'payment_transactions',
--   'stripe_webhook_events',
--   'audit_logs'
-- )
-- GROUP BY tablename;
