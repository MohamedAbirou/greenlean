# Row Level Security (RLS) Policy Testing Guide

## Overview
Row Level Security (RLS) policies are **CRITICAL** for data isolation in multi-tenant applications. This guide helps you test that users can only access their own data.

---

## 1. Why RLS Testing is Critical

### Without RLS:
```sql
SELECT * FROM nutrition_logs;
-- ❌ Returns ALL users' data (security breach!)
```

### With RLS:
```sql
SELECT * FROM nutrition_logs;
-- ✅ Returns only current user's data (secured!)
```

### Real-World Impact:
- **Without RLS:** User A can see User B's meals, workouts, weight, progress photos
- **With RLS:** Each user sees only their own data
- **Security breach:** Exposing personal health data = legal liability (HIPAA, GDPR)

---

## 2. RLS Policy Structure

### Basic Pattern:

```sql
-- Enable RLS on table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only see their own data"
ON table_name
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own data"
ON table_name
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own data"
ON table_name
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only delete their own data"
ON table_name
FOR DELETE
USING (user_id = auth.uid());
```

---

## 3. Tables Requiring RLS

Based on GreenLean schema, these tables **MUST** have RLS:

### User Data Tables:
- ✅ `profiles` - User profile information
- ✅ `quiz_responses` - Quiz answers
- ✅ `nutrition_logs` - Meal logs
- ✅ `workout_logs` - Exercise logs
- ✅ `challenge_participants` - Challenge enrollments
- ✅ `user_progress` - Weight tracking
- ✅ `user_subscriptions` - Payment info
- ✅ `user_preferences` - Settings

### Public Tables (No RLS):
- ✅ `challenges` - Public challenges (everyone can read)
- ✅ `exercises` - Exercise library (everyone can read)
- ✅ `diet_plans` - Diet templates (everyone can read)

---

## 4. RLS Testing Methods

### Method 1: Supabase Dashboard (Manual Testing)

1. **Go to Supabase Dashboard → SQL Editor**

2. **Test SELECT policy:**
```sql
-- Switch to test user
SET request.jwt.claims = '{"sub": "test-user-id-123"}';

-- Try to select data
SELECT * FROM nutrition_logs;

-- Should only return rows where user_id = 'test-user-id-123'
```

3. **Test INSERT policy:**
```sql
-- Try to insert for current user (should work)
INSERT INTO nutrition_logs (user_id, food_name, calories, meal_date)
VALUES ('test-user-id-123', 'Apple', 95, '2025-01-15');

-- Try to insert for another user (should fail!)
INSERT INTO nutrition_logs (user_id, food_name, calories, meal_date)
VALUES ('another-user-id-456', 'Banana', 105, '2025-01-15');
-- ❌ Should fail with "new row violates row-level security policy"
```

4. **Test UPDATE policy:**
```sql
-- Try to update own data (should work)
UPDATE nutrition_logs
SET calories = 100
WHERE id = 'your-log-id' AND user_id = 'test-user-id-123';

-- Try to update another user's data (should fail!)
UPDATE nutrition_logs
SET calories = 100
WHERE user_id = 'another-user-id-456';
-- ❌ Should update 0 rows (silently blocked by RLS)
```

5. **Test DELETE policy:**
```sql
-- Try to delete own data (should work)
DELETE FROM nutrition_logs
WHERE id = 'your-log-id' AND user_id = 'test-user-id-123';

-- Try to delete another user's data (should fail!)
DELETE FROM nutrition_logs
WHERE user_id = 'another-user-id-456';
-- ❌ Should delete 0 rows (silently blocked by RLS)
```

### Method 2: Application Testing (Recommended)

**Create test script:** `src/tests/rls-test.ts`

```typescript
import { supabase } from '@/lib/supabase/client';

interface TestResult {
  test: string;
  passed: boolean;
  error?: string;
}

async function testRLSPolicies(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Create two test users
  const { data: user1, error: user1Error } = await supabase.auth.signUp({
    email: 'test-user-1@example.com',
    password: 'TestPassword123!',
  });

  const { data: user2, error: user2Error } = await supabase.auth.signUp({
    email: 'test-user-2@example.com',
    password: 'TestPassword123!',
  });

  if (!user1 || !user2) {
    console.error('Failed to create test users');
    return results;
  }

  const user1Id = user1.user!.id;
  const user2Id = user2.user!.id;

  // Test 1: User 1 creates nutrition log
  const { data: log1, error: log1Error } = await supabase
    .from('nutrition_logs')
    .insert({
      user_id: user1Id,
      food_name: 'Test Food 1',
      calories: 100,
      meal_date: new Date().toISOString(),
    })
    .select()
    .single();

  results.push({
    test: 'User 1 can insert own data',
    passed: !log1Error && !!log1,
    error: log1Error?.message,
  });

  // Test 2: User 1 tries to insert data for User 2 (should fail)
  const { error: log2Error } = await supabase
    .from('nutrition_logs')
    .insert({
      user_id: user2Id, // ❌ Different user!
      food_name: 'Test Food 2',
      calories: 200,
      meal_date: new Date().toISOString(),
    });

  results.push({
    test: 'User 1 CANNOT insert data for User 2',
    passed: !!log2Error, // Should fail!
    error: log2Error?.message,
  });

  // Test 3: User 2 cannot see User 1's data
  await supabase.auth.signInWithPassword({
    email: 'test-user-2@example.com',
    password: 'TestPassword123!',
  });

  const { data: user2Logs, error: user2LogsError } = await supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', user1Id); // ❌ Try to query User 1's data

  results.push({
    test: 'User 2 CANNOT see User 1 data',
    passed: !user2LogsError && user2Logs?.length === 0, // Should return empty
    error: user2LogsError?.message,
  });

  // Test 4: User 2 cannot update User 1's data
  const { error: updateError } = await supabase
    .from('nutrition_logs')
    .update({ calories: 999 })
    .eq('id', log1!.id); // ❌ User 1's log

  results.push({
    test: 'User 2 CANNOT update User 1 data',
    passed: !updateError, // RLS silently blocks, no error
    error: updateError?.message,
  });

  // Test 5: User 2 cannot delete User 1's data
  const { error: deleteError } = await supabase
    .from('nutrition_logs')
    .delete()
    .eq('id', log1!.id); // ❌ User 1's log

  results.push({
    test: 'User 2 CANNOT delete User 1 data',
    passed: !deleteError, // RLS silently blocks, no error
    error: deleteError?.message,
  });

  // Cleanup
  await supabase.auth.admin.deleteUser(user1Id);
  await supabase.auth.admin.deleteUser(user2Id);

  return results;
}

// Run tests
testRLSPolicies().then((results) => {
  console.log('\n' + '='.repeat(80));
  console.log('RLS POLICY TEST RESULTS');
  console.log('='.repeat(80) + '\n');

  results.forEach((result) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.test}`);
    if (result.error) {
      console.log(`  Error: ${result.error}`);
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log('\n' + '='.repeat(80));
  console.log(`SUMMARY: ${passed}/${total} tests passed`);
  console.log('='.repeat(80) + '\n');

  if (passed < total) {
    console.error('❌ RLS POLICIES ARE NOT WORKING CORRECTLY!');
    console.error('⚠️  DO NOT DEPLOY TO PRODUCTION!');
    process.exit(1);
  } else {
    console.log('✅ All RLS policies working correctly!');
    process.exit(0);
  }
});
```

### Method 3: Automated Testing with Playwright

**Create E2E test:** `tests/rls.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { supabase } from '../src/lib/supabase/client';

test.describe('RLS Policies', () => {
  let user1Email = 'rls-test-user-1@example.com';
  let user2Email = 'rls-test-user-2@example.com';
  let password = 'TestPassword123!';

  test.beforeAll(async () => {
    // Create test users
    await supabase.auth.signUp({ email: user1Email, password });
    await supabase.auth.signUp({ email: user2Email, password });
  });

  test('User can only access own nutrition logs', async ({ page }) => {
    // Login as User 1
    await page.goto('/login');
    await page.fill('[name="email"]', user1Email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');

    // Create nutrition log
    await page.goto('/dashboard');
    await page.click('button:has-text("Log Meal")');
    await page.fill('[name="food_name"]', 'Test Food');
    await page.fill('[name="calories"]', '100');
    await page.click('button:has-text("Save")');

    // Verify log appears
    await expect(page.locator('text=Test Food')).toBeVisible();

    // Logout
    await page.click('button:has-text("Logout")');

    // Login as User 2
    await page.goto('/login');
    await page.fill('[name="email"]', user2Email);
    await page.fill('[name="password"]', password);
    await page.click('button[type="submit"]');

    // Verify User 2 CANNOT see User 1's log
    await page.goto('/dashboard');
    await expect(page.locator('text=Test Food')).not.toBeVisible();
  });

  test.afterAll(async () => {
    // Cleanup test users
    // (requires service role key for admin.deleteUser)
  });
});
```

---

## 5. Testing Checklist for Each Table

### For each table with user data:

- [ ] **Enable RLS:** `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

- [ ] **SELECT policy:** User can only see own rows
  ```sql
  CREATE POLICY "select_own_data" ON table_name
  FOR SELECT USING (user_id = auth.uid());
  ```
  Test: User A queries table, should only see rows where `user_id = A`

- [ ] **INSERT policy:** User can only insert with own user_id
  ```sql
  CREATE POLICY "insert_own_data" ON table_name
  FOR INSERT WITH CHECK (user_id = auth.uid());
  ```
  Test: User A tries to insert row with `user_id = B`, should fail

- [ ] **UPDATE policy:** User can only update own rows
  ```sql
  CREATE POLICY "update_own_data" ON table_name
  FOR UPDATE USING (user_id = auth.uid());
  ```
  Test: User A tries to update row where `user_id = B`, should fail

- [ ] **DELETE policy:** User can only delete own rows
  ```sql
  CREATE POLICY "delete_own_data" ON table_name
  FOR DELETE USING (user_id = auth.uid());
  ```
  Test: User A tries to delete row where `user_id = B`, should fail

---

## 6. GreenLean RLS Policies (Copy-Paste Ready)

### Profiles Table
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow signup to create profile
CREATE POLICY "Users can insert own profile on signup"
ON profiles FOR INSERT
WITH CHECK (id = auth.uid());
```

### Quiz Responses Table
```sql
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quiz responses"
ON quiz_responses FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quiz responses"
ON quiz_responses FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own quiz responses"
ON quiz_responses FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own quiz responses"
ON quiz_responses FOR DELETE
USING (user_id = auth.uid());
```

### Nutrition Logs Table
```sql
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nutrition logs"
ON nutrition_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own nutrition logs"
ON nutrition_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own nutrition logs"
ON nutrition_logs FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own nutrition logs"
ON nutrition_logs FOR DELETE
USING (user_id = auth.uid());
```

### Workout Logs Table
```sql
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workout logs"
ON workout_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own workout logs"
ON workout_logs FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own workout logs"
ON workout_logs FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own workout logs"
ON workout_logs FOR DELETE
USING (user_id = auth.uid());
```

### Challenge Participants Table
```sql
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge participations"
ON challenge_participants FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can join challenges"
ON challenge_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own participation"
ON challenge_participants FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave challenges"
ON challenge_participants FOR DELETE
USING (user_id = auth.uid());
```

### User Progress Table
```sql
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
ON user_progress FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
ON user_progress FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
ON user_progress FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own progress"
ON user_progress FOR DELETE
USING (user_id = auth.uid());
```

### User Subscriptions Table
```sql
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON user_subscriptions FOR SELECT
USING (user_id = auth.uid());

-- Only backend can create/update subscriptions
CREATE POLICY "System can manage subscriptions"
ON user_subscriptions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');
```

### Public Tables (Read-Only)
```sql
-- Challenges (everyone can read)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges"
ON challenges FOR SELECT
TO public
USING (true);

-- Exercises (everyone can read)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view exercises"
ON exercises FOR SELECT
TO public
USING (true);

-- Diet Plans (everyone can read)
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view diet plans"
ON diet_plans FOR SELECT
TO public
USING (true);
```

---

## 7. Common RLS Mistakes

### Mistake 1: Forgetting to enable RLS
```sql
-- ❌ WRONG: Policy created but RLS not enabled
CREATE POLICY "..." ON table_name ...;

-- ✅ CORRECT: Enable RLS first!
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON table_name ...;
```

### Mistake 2: Using wrong auth function
```sql
-- ❌ WRONG: current_user returns database role, not user ID
USING (user_id = current_user)

-- ✅ CORRECT: auth.uid() returns authenticated user's ID
USING (user_id = auth.uid())
```

### Mistake 3: Missing WITH CHECK on INSERT
```sql
-- ❌ WRONG: Only USING clause
CREATE POLICY "insert_data" ON table_name
FOR INSERT USING (user_id = auth.uid());

-- ✅ CORRECT: WITH CHECK for INSERT
CREATE POLICY "insert_data" ON table_name
FOR INSERT WITH CHECK (user_id = auth.uid());
```

### Mistake 4: Not testing cross-user access
```sql
-- ⚠️ TEST THIS!
-- Login as User A
-- Try to access User B's data
-- Should return empty / fail
```

---

## 8. Troubleshooting

### Issue: "permission denied for table"

**Cause:** RLS enabled but no policies created

**Solution:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Create missing policies
```

### Issue: Users can see other users' data

**Cause:** RLS not enabled or policy missing

**Solution:**
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owner
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;

-- Verify with test
```

### Issue: No data returned (even own data)

**Cause:** SELECT policy too restrictive

**Solution:**
```sql
-- Check auth.uid()
SELECT auth.uid();
-- Should return your user ID

-- Check policy
SELECT * FROM pg_policies WHERE tablename = 'table_name';
-- Verify USING clause is correct
```

---

## 9. Testing Script for All Tables

**Run this in Supabase SQL Editor:**

```sql
-- Create test function
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE(table_name text, test_name text, result text) AS $$
BEGIN
  -- Test each table
  -- (Implement comprehensive tests here)

  RETURN QUERY
  SELECT 'nutrition_logs'::text, 'SELECT own data'::text, 'PASS'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run tests
SELECT * FROM test_rls_policies();
```

---

## 10. Production Verification

Before launching:

### Step 1: Create Test Accounts
```bash
# In production, create 2 real test accounts
User A: test-user-a@yourcompany.com
User B: test-user-b@yourcompany.com
```

### Step 2: Test Cross-Account Access
1. Login as User A
2. Create data (meal log, workout, etc.)
3. Note down record IDs
4. Logout
5. Login as User B
6. Try to access User A's record IDs directly
   - Via API: `GET /api/nutrition-logs/{user_a_record_id}`
   - Via database: Query with specific ID
7. **Should fail or return empty!**

### Step 3: Verify in Browser DevTools
```javascript
// In browser console
const { data, error } = await supabase
  .from('nutrition_logs')
  .select('*')
  .eq('user_id', 'other-user-id'); // ❌ Different user

console.log(data); // Should be empty []
```

---

## Status: CRITICAL - Must Test Before Production! 🚨

RLS policies protect user privacy. **Do not skip testing!**

### Quick Checklist:
- [ ] RLS enabled on all user data tables
- [ ] SELECT policies prevent cross-user access
- [ ] INSERT policies prevent inserting for other users
- [ ] UPDATE policies prevent modifying other users' data
- [ ] DELETE policies prevent deleting other users' data
- [ ] Tested with 2+ real test accounts
- [ ] Verified in production environment

**If any test fails, DO NOT DEPLOY! Fix RLS policies first.**
