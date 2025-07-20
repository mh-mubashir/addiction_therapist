-- Supabase Database Schema for Addiction Recovery Platform
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patient profiles table
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Patient summary (updated live during conversations)
  patient_summary TEXT DEFAULT '',
  recovery_stage VARCHAR(50) DEFAULT 'early', -- early, intermediate, advanced
  primary_addiction VARCHAR(100),
  sobriety_date DATE,
  support_network_available BOOLEAN DEFAULT true,
  
  -- Recovery metrics
  total_conversations INTEGER DEFAULT 0,
  total_triggers_detected INTEGER DEFAULT 0,
  last_conversation_date TIMESTAMP WITH TIME ZONE,
  
  -- Preferences
  trigger_sensitivity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  notification_preferences JSONB DEFAULT '{}',
  
  UNIQUE(user_id)
);

-- Conversation sessions table
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_profile_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Session metadata
  session_duration_minutes INTEGER,
  messages_count INTEGER DEFAULT 0,
  triggers_detected_count INTEGER DEFAULT 0,
  
  -- Session summary
  session_summary TEXT,
  risk_level VARCHAR(20), -- low, medium, high
  primary_concerns TEXT[]
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Message content
  sender VARCHAR(10) NOT NULL, -- 'user' or 'bot'
  content TEXT NOT NULL,
  
  -- Trigger analysis (for user messages)
  trigger_analysis JSONB, -- Claude's analysis result
  trigger_detected BOOLEAN DEFAULT false,
  trigger_category VARCHAR(50),
  trigger_intensity VARCHAR(20),
  trigger_confidence VARCHAR(20)
);

-- Trigger history table
CREATE TABLE trigger_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Trigger details
  category VARCHAR(50) NOT NULL,
  intensity VARCHAR(20) NOT NULL,
  confidence VARCHAR(20) NOT NULL,
  reasoning TEXT,
  
  -- Context
  user_message TEXT,
  bot_response TEXT,
  coping_strategies_provided BOOLEAN DEFAULT false,
  
  -- Follow-up tracking
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_method VARCHAR(100)
);

-- Recovery progress tracking
CREATE TABLE recovery_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily metrics
  conversations_count INTEGER DEFAULT 0,
  triggers_detected INTEGER DEFAULT 0,
  high_risk_triggers INTEGER DEFAULT 0,
  coping_strategies_used INTEGER DEFAULT 0,
  
  -- Mood and progress
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  recovery_confidence INTEGER CHECK (recovery_confidence >= 1 AND recovery_confidence <= 10),
  notes TEXT,
  
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX idx_conversation_sessions_created_at ON conversation_sessions(created_at);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_trigger_history_user_id ON trigger_history(user_id);
CREATE INDEX idx_trigger_history_created_at ON trigger_history(created_at);
CREATE INDEX idx_recovery_progress_user_id_date ON recovery_progress(user_id, date);

-- Enable Row Level Security (RLS)
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trigger_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Patient profiles: users can only access their own profile
CREATE POLICY "Users can view own profile" ON patient_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON patient_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON patient_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Conversation sessions: users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON conversation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON conversation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON conversation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: users can only access their own messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger history: users can only access their own triggers
CREATE POLICY "Users can view own triggers" ON trigger_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triggers" ON trigger_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triggers" ON trigger_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Recovery progress: users can only access their own progress
CREATE POLICY "Users can view own progress" ON recovery_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON recovery_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON recovery_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for patient_profiles
CREATE TRIGGER update_patient_profiles_updated_at 
    BEFORE UPDATE ON patient_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 