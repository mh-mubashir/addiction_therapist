-- Temporary Fix: Disable RLS to test functionality
-- Run this in Supabase SQL Editor to temporarily disable RLS

-- Disable RLS on all tables temporarily
ALTER TABLE patient_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_progress DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('patient_profiles', 'conversation_sessions', 'messages', 'trigger_history', 'recovery_progress');

-- Test insert (this should work now)
-- INSERT INTO patient_profiles (user_id, patient_summary, recovery_stage, primary_addiction) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test profile', 'early', 'test');

-- ⚠️ IMPORTANT: After testing, run the fix-rls-policies.sql to re-enable RLS with correct policies 