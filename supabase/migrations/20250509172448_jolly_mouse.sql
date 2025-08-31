/*
  Recreate Profile Table Policies — idempotent
*/

DO $$
BEGIN
  -- Only run if the 'profiles' table exists
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'profiles' AND n.nspname = 'public'
  ) THEN
    -- Enable RLS (safe to run repeatedly)
    EXECUTE 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY';

    -- Public signup
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Allow users to insert their own profile during signup'
    ) THEN
      CREATE POLICY "Allow users to insert their own profile during signup"
      ON public.profiles
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = id);
    END IF;

    -- Authenticated: insert own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Users can insert own profile'
    ) THEN
      CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
    END IF;

    -- Authenticated: read own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Users can read own profile'
    ) THEN
      CREATE POLICY "Users can read own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
    END IF;

    -- Authenticated: update own profile
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Users can update own profile'
    ) THEN
      CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
    END IF;

    -- Service role: full access
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Service role can manage all profiles'
    ) THEN
      CREATE POLICY "Service role can manage all profiles"
      ON public.profiles
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    END IF;

  END IF;
END
$$;
