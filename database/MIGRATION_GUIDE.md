# Database Migration Guide

## Overview

This guide explains how to safely apply database migrations to fix critical security issues and add production-ready features to GreenLean.

---

## ⚠️ CRITICAL: Read Before Applying

### Prerequisites

1. **Backup your database** before applying any migration
2. **Test in staging environment** first (if you have one)
3. **Apply migrations during low-traffic period**
4. **Have rollback plan ready**

### Migration Order

Migrations MUST be applied in order:

1. `001_critical_security_fixes.sql` - **REQUIRED before production**
2. `002_high_priority_security_fixes.sql` - Required within 1 week
3. `003_production_tables.sql` - Required within 1 week
4. `004_performance_indexes.sql` - Recommended within 2 weeks

---

## Migration 1: Critical Security Fixes (URGENT)

**File:** `001_critical_security_fixes.sql`
**Priority:** 🔴 CRITICAL
**Estimated Time:** 2-3 minutes
**Downtime:** None

### What It Fixes:
- **add_admin() vulnerability** - Anyone could make themselves admin!
- **Notifications vulnerability** - Users could impersonate system
- **plans table** - No RLS policies at all

### How to Apply:

#### Option A: Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `001_critical_security_fixes.sql`
3. Paste into SQL Editor
4. Click "Run"
5. Verify success (should see "SUCCESS")

#### Option B: psql Command Line

```bash
psql -h your-db-host -U postgres -d postgres -f database/migrations/001_critical_security_fixes.sql
```

### Verification:

```sql
-- Verify plans RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'plans';
-- Should return: plans | true

-- Verify notification policies updated
SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND cmd = 'INSERT';
-- Should return 0 rows (INSERT policy removed)

-- Test add_admin() security (as non-admin user)
SELECT add_admin('00000000-0000-0000-0000-000000000000', 'admin');
-- Should fail with: "Only super_admin can grant admin privileges"
```

### Rollback (if needed):

```sql
-- Rollback is complex due to policy changes
-- Best approach: Restore from backup
-- Or manually revert each change
```

---

## Migration 2: High Priority Security Fixes

**File:** `002_high_priority_security_fixes.sql`
**Priority:** 🟡 HIGH
**Estimated Time:** 5-10 minutes
**Downtime:** None

### What It Fixes:
- Adds permission checks to 5 SECURITY DEFINER functions
- Fixes badges table policies (confusing roles)
- Fixes profiles INSERT policy (too permissive)
- Adds RLS to engagement_snapshots
- Simplifies challenge_participant_rewards policies

### How to Apply:

Same as Migration 1 - use Supabase Dashboard SQL Editor or psql.

### Verification:

```sql
-- Verify badge policies use correct roles
SELECT policyname, roles FROM pg_policies WHERE tablename = 'badges';
-- Should show authenticated (not public) for admin policies

-- Verify engagement_snapshots has RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'engagement_snapshots';
-- Should return: engagement_snapshots | true

-- Test get_platform_stats() as non-admin
SELECT get_platform_stats(30);
-- Should fail with: "Only admins can access platform stats"
```

---

## Migration 3: Production Tables

**File:** `003_production_tables.sql`
**Priority:** 🟡 HIGH
**Estimated Time:** 10-15 minutes
**Downtime:** None

### What It Adds:
- `email_logs` - Track sent emails
- `email_preferences` - User email preferences & unsubscribe
- `subscription_history` - Subscription change tracking
- `payment_transactions` - Payment attempt history
- `stripe_webhook_events` - Webhook debugging
- `audit_logs` - Sensitive operation tracking

### How to Apply:

Same as above - SQL Editor or psql.

### Verification:

```sql
-- Verify all tables were created
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'email_logs',
    'email_preferences',
    'subscription_history',
    'payment_transactions',
    'stripe_webhook_events',
    'audit_logs'
  );
-- Should return 6 rows

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN (
  'email_logs',
  'email_preferences',
  'subscription_history',
  'payment_transactions',
  'stripe_webhook_events',
  'audit_logs'
);
-- All should have rowsecurity = true

-- Verify policies exist
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN (
  'email_logs',
  'email_preferences',
  'subscription_history',
  'payment_transactions',
  'stripe_webhook_events',
  'audit_logs'
)
GROUP BY tablename;
-- Each table should have at least 2 policies
```

### Integration Required:

After applying this migration, update your application code:

1. **Email Service** - Use `email_logs` table to track sent emails
2. **Stripe Webhooks** - Store events in `stripe_webhook_events`
3. **Subscription Changes** - Record in `subscription_history`
4. **Payment Processing** - Log to `payment_transactions`
5. **Sensitive Operations** - Call `log_audit()` function

Example:
```typescript
// After sending email
await supabase.from('email_logs').insert({
  user_id: userId,
  email_type: 'welcome',
  recipient_email: email,
  subject: 'Welcome to GreenLean!',
  status: 'sent',
  resend_message_id: messageId
});
```

---

## Migration 4: Performance Indexes

**File:** `004_performance_indexes.sql`
**Priority:** 🟠 MEDIUM
**Estimated Time:** 5-10 minutes (varies with data size)
**Downtime:** None (uses CONCURRENTLY)

### What It Adds:
- 40+ performance indexes
- Composite indexes for common queries
- GIN indexes for JSONB fields
- Partial indexes for filtered queries

### How to Apply:

**IMPORTANT:** This migration uses `CREATE INDEX CONCURRENTLY` which:
- ✅ Doesn't lock tables
- ✅ Safe for production
- ❌ Cannot run inside BEGIN/COMMIT transaction

#### For Production (Recommended):

```bash
# Apply directly (CONCURRENTLY doesn't work in transactions)
psql -h your-db-host -U postgres -d postgres -f database/migrations/004_performance_indexes.sql
```

#### For Initial Setup (Before Production):

Remove `CONCURRENTLY` from the SQL file first, then apply normally.

### Verification:

```sql
-- Check indexes were created
SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'ai_meal_plans',
    'ai_workout_plans',
    'daily_nutrition_logs',
    'daily_water_intake',
    'workout_logs',
    'challenge_participants'
  )
GROUP BY tablename;
-- Each table should have multiple indexes

-- Test specific index usage
EXPLAIN ANALYZE
SELECT * FROM daily_nutrition_logs
WHERE user_id = 'some-uuid'
  AND log_date >= CURRENT_DATE - 7;
-- Should show "Index Scan using idx_daily_nutrition_logs_user_date"
```

### Monitor Index Usage (After 1 Week):

```sql
-- Find unused indexes (candidates for removal)
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size,
  idx_scan as scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
  AND indexrelid::regclass::text NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Post-Migration Checklist

### Immediate (After Each Migration):

- [ ] Run verification queries
- [ ] Check for error messages
- [ ] Test affected features in UI
- [ ] Monitor error logs for 30 minutes

### Within 24 Hours:

- [ ] Test RLS policies with 2 test users
- [ ] Verify email tracking works
- [ ] Test Stripe webhook processing
- [ ] Check admin dashboard loads
- [ ] Run performance test queries

### Within 1 Week:

- [ ] Monitor slow query log
- [ ] Check index usage statistics
- [ ] Verify no RLS policy violations
- [ ] Test all CRUD operations
- [ ] Monitor database size growth

---

## Troubleshooting

### Migration Failed Midway

**Symptoms:** Error message during migration, partial changes applied

**Solution:**
1. Check error message for specific issue
2. If in transaction (001-003), changes rolled back automatically
3. If CONCURRENTLY (004), some indexes may be partially created
4. Fix issue and re-run migration (safe to re-run)

### Permission Denied Errors

**Symptoms:** "permission denied for table X"

**Solution:**
```sql
-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;
```

### RLS Blocking Queries

**Symptoms:** Queries return 0 rows unexpectedly

**Solution:**
```sql
-- Check if RLS is blocking
SET ROLE postgres; -- Bypass RLS temporarily
SELECT * FROM your_table;
-- If data appears, RLS policies need adjustment
```

### Performance Degradation After Indexes

**Symptoms:** Slower writes, larger database size

**Solution:**
- This is normal - indexes trade write speed for read speed
- Monitor for 1 week, then remove unused indexes
- Consider partitioning if tables >1M rows

---

## Rollback Procedures

### General Rollback:

```sql
-- Option 1: Restore from backup (safest)
-- Use your backup system

-- Option 2: Manual rollback (risky)
-- Reverse each change carefully
-- Example for dropping new tables:
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_preferences CASCADE;
-- etc.
```

### Rollback Specific Migrations:

#### Rollback Migration 1:
```sql
-- Restore original add_admin() function (from backup)
-- Restore original notification policies (from backup)
-- Disable RLS on plans table
ALTER TABLE plans DISABLE ROW LEVEL SECURITY;
```

#### Rollback Migration 3:
```sql
-- Drop new tables (data will be lost!)
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_preferences CASCADE;
DROP TABLE IF EXISTS subscription_history CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
```

#### Rollback Migration 4:
```sql
-- Drop all indexes created (safe, can recreate)
-- List indexes first:
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
-- Then drop individually or with script
```

---

## Performance Monitoring

### Key Metrics to Track:

```sql
-- 1. Slow queries (>1s)
SELECT
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 2. Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- 3. Index hit rate (should be >95%)
SELECT
  sum(idx_blks_hit) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100 AS index_hit_rate
FROM pg_statio_user_indexes;

-- 4. Connection count
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';
```

---

## Support & Resources

### If You Need Help:

1. Check DATABASE_SECURITY_AUDIT.md for detailed explanations
2. Review migration file comments
3. Test in local development first
4. Create database backup before proceeding

### Useful Supabase Documentation:

- RLS Policies: https://supabase.com/docs/guides/auth/row-level-security
- Database Functions: https://supabase.com/docs/guides/database/functions
- Performance: https://supabase.com/docs/guides/platform/performance

---

## Migration Status Tracking

Keep track of applied migrations:

```sql
-- Create migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
  id serial PRIMARY KEY,
  migration_name text UNIQUE NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by text
);

-- Record applied migrations
INSERT INTO schema_migrations (migration_name, applied_by)
VALUES ('001_critical_security_fixes', 'admin@greenlean.com');

-- Check applied migrations
SELECT * FROM schema_migrations ORDER BY applied_at DESC;
```

---

## Next Steps After Migrations

1. **Update application code** to use new tables
2. **Test thoroughly** with test users
3. **Monitor performance** for 1 week
4. **Document any issues** found
5. **Plan next optimization phase**

---

## Quick Reference

### Apply All Migrations:

```bash
# Backup first!
pg_dump -h your-host -U postgres -d postgres > backup_$(date +%Y%m%d).sql

# Apply migrations
psql -h your-host -U postgres -d postgres -f database/migrations/001_critical_security_fixes.sql
psql -h your-host -U postgres -d postgres -f database/migrations/002_high_priority_security_fixes.sql
psql -h your-host -U postgres -d postgres -f database/migrations/003_production_tables.sql
psql -h your-host -U postgres -d postgres -f database/migrations/004_performance_indexes.sql
```

### Verify Everything:

```bash
# Run verification script (create this)
psql -h your-host -U postgres -d postgres -f database/verify_migrations.sql
```

---

**Status:** Ready to apply! Start with Migration 001 (Critical Security Fixes).
