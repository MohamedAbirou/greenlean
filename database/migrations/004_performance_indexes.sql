-- ============================================================================
-- MIGRATION 004: PERFORMANCE INDEXES
-- Priority: MEDIUM - Apply within 2 weeks of production launch
-- Estimated time: 5-10 minutes (depending on data size)
-- ============================================================================

-- NOTE: Create indexes CONCURRENTLY to avoid locking tables in production
-- Remove CONCURRENTLY for initial migration before production

BEGIN;

-- ============================================================================
-- User Data Filtering (RLS Performance)
-- ============================================================================

-- ai_meal_plans - Most queries filter by user_id and is_active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_meal_plans_user_active
ON ai_meal_plans(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_meal_plans_user_created
ON ai_meal_plans(user_id, created_at DESC);

-- ai_workout_plans - Most queries filter by user_id and is_active
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_workout_plans_user_active
ON ai_workout_plans(user_id) WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_workout_plans_user_created
ON ai_workout_plans(user_id, created_at DESC);

-- daily_nutrition_logs - Queries by user and date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_nutrition_logs_user_date
ON daily_nutrition_logs(user_id, log_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_nutrition_logs_user_meal_date
ON daily_nutrition_logs(user_id, meal_type, log_date DESC);

-- daily_water_intake - Queries by user and date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_water_intake_user_date
ON daily_water_intake(user_id, log_date DESC);

-- workout_logs - Queries by user and date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_logs_user_date
ON workout_logs(user_id, workout_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workout_logs_user_completed
ON workout_logs(user_id, completed, workout_date DESC);

-- quiz_results - Most recent quiz per user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_quiz_results_user_created
ON quiz_results(user_id, created_at DESC);

-- ============================================================================
-- Challenge Performance
-- ============================================================================

-- challenge_participants - Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_user_challenge
ON challenge_participants(user_id, challenge_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_challenge_user
ON challenge_participants(challenge_id, user_id);

-- Leaderboard queries (completed challenges)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_completed
ON challenge_participants(challenge_id, completed, completion_date DESC)
WHERE completed = true;

-- Active participants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_active
ON challenge_participants(challenge_id, last_progress_date DESC)
WHERE completed = false;

-- Streak expiration queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_streak_expiry
ON challenge_participants(streak_expires_at)
WHERE streak_expires_at IS NOT NULL AND completed = false;

-- challenges - Active challenges
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_active_dates
ON challenges(is_active, start_date DESC, end_date DESC)
WHERE is_active = true;

-- ============================================================================
-- Notifications Performance
-- ============================================================================

-- Unread notifications (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_unread
ON notifications(recipient_id, created_at DESC)
WHERE read = false;

-- All notifications for a user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_created
ON notifications(recipient_id, created_at DESC);

-- Notifications by type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_recipient_type
ON notifications(recipient_id, type, created_at DESC);

-- ============================================================================
-- User Rewards Performance
-- ============================================================================

-- Lookup rewards by user (should be unique, but index for joins)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_rewards_user_updated
ON user_rewards(user_id, updated_at DESC);

-- challenge_participant_rewards - Lookup by user and challenge
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_rewards_user_challenge
ON challenge_participant_rewards(user_id, challenge_id);

-- ============================================================================
-- Admin & Monitoring Performance
-- ============================================================================

-- profiles - Admin queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at
ON profiles(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_plan_renewal
ON profiles(plan_renewal_date)
WHERE plan_renewal_date IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_stripe_customer
ON profiles(stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

-- user_reviews - Public homepage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reviews_created
ON user_reviews(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_reviews_rating
ON user_reviews(rating DESC, created_at DESC);

-- ============================================================================
-- Badge Lookups
-- ============================================================================

-- badges - Lookup by ID (should be PK, but for joins)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_badges_name
ON badges(name);

-- ============================================================================
-- Admin Users Performance
-- ============================================================================

-- admin_users - Lookup by role
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_users_role
ON admin_users(role);

-- ============================================================================
-- Composite Foreign Key Performance
-- ============================================================================

-- Ensure foreign key columns are indexed (if not already by PK)

-- ai_meal_plans foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_meal_plans_quiz_result
ON ai_meal_plans(quiz_result_id)
WHERE quiz_result_id IS NOT NULL;

-- ai_workout_plans foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_workout_plans_quiz_result
ON ai_workout_plans(quiz_result_id)
WHERE quiz_result_id IS NOT NULL;

-- challenges foreign keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_badge
ON challenges(badge_id)
WHERE badge_id IS NOT NULL;

-- notifications foreign keys (sender_id might be null for system notifications)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_sender
ON notifications(sender_id)
WHERE sender_id IS NOT NULL;

-- ============================================================================
-- JSON/JSONB Indexes (for specific queries)
-- ============================================================================

-- If you frequently query specific JSONB fields, create GIN indexes
-- Example: Challenge requirements
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_requirements_gin
ON challenges USING gin(requirements);

-- User rewards badges
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_rewards_badges_gin
ON user_rewards USING gin(badges);

-- Challenge participant progress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenge_participants_progress_gin
ON challenge_participants USING gin(progress);

-- ============================================================================
-- Text Search Indexes (if implementing search)
-- ============================================================================

-- Full-text search on challenges
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_challenges_search
-- ON challenges USING gin(to_tsvector('english', title || ' ' || description));

-- Full-text search on badges
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_badges_search
-- ON badges USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- Commit transaction
-- ============================================================================

COMMIT;

-- ============================================================================
-- Verify Indexes Were Created
-- ============================================================================

-- Check all indexes on key tables
-- SELECT
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN (
--     'ai_meal_plans',
--     'ai_workout_plans',
--     'daily_nutrition_logs',
--     'daily_water_intake',
--     'workout_logs',
--     'quiz_results',
--     'challenge_participants',
--     'notifications',
--     'profiles'
--   )
-- ORDER BY tablename, indexname;

-- ============================================================================
-- Monitor Index Usage (run after production deployment)
-- ============================================================================

-- Query to check index usage statistics:
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- Query to find unused indexes (candidates for removal):
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   pg_size_pretty(pg_relation_size(indexrelid)) as index_size
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
--   AND schemaname = 'public'
--   AND indexrelid::regclass::text NOT LIKE '%_pkey'
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- Performance Testing Queries
-- ============================================================================

-- Test user's meal logs query (should use idx_daily_nutrition_logs_user_date)
-- EXPLAIN ANALYZE
-- SELECT * FROM daily_nutrition_logs
-- WHERE user_id = 'some-uuid'
--   AND log_date >= CURRENT_DATE - 7
-- ORDER BY log_date DESC;

-- Test challenge leaderboard (should use idx_challenge_participants_completed)
-- EXPLAIN ANALYZE
-- SELECT cp.*, p.full_name
-- FROM challenge_participants cp
-- JOIN profiles p ON p.id = cp.user_id
-- WHERE cp.challenge_id = 'some-uuid'
--   AND cp.completed = true
-- ORDER BY cp.completion_date ASC
-- LIMIT 100;

-- Test unread notifications (should use idx_notifications_recipient_unread)
-- EXPLAIN ANALYZE
-- SELECT * FROM notifications
-- WHERE recipient_id = 'some-uuid'
--   AND read = false
-- ORDER BY created_at DESC
-- LIMIT 50;
