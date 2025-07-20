-- Fix RLS Policies for Addiction Recovery Platform
-- Run this in your Supabase SQL editor to fix the insert issues

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON patient_profiles;

DROP POLICY IF EXISTS "Users can view own sessions" ON conversation_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON conversation_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON conversation_sessions;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;

DROP POLICY IF EXISTS "Users can view own triggers" ON trigger_history;
DROP POLICY IF EXISTS "Users can insert own triggers" ON trigger_history;
DROP POLICY IF EXISTS "Users can update own triggers" ON trigger_history;

DROP POLICY IF EXISTS "Users can view own progress" ON recovery_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON recovery_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON recovery_progress;

-- Create corrected RLS policies
-- Patient profiles: More permissive policies
CREATE POLICY "Users can view own profile" ON patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON patient_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create profiles" ON patient_profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Conversation sessions
CREATE POLICY "Users can view own sessions" ON conversation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create sessions" ON conversation_sessions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own sessions" ON conversation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Trigger history
CREATE POLICY "Users can view own triggers" ON trigger_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create triggers" ON trigger_history
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own triggers" ON trigger_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Recovery progress
CREATE POLICY "Users can view own progress" ON recovery_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create progress" ON recovery_progress
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own progress" ON recovery_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 