// Supabase service - Free tier optimized
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service functions - Free tier optimized
export const dbService = {
  // Patient profile management
  async getPatientProfile(userId) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createPatientProfile(profileData) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePatientSummary(userId, summary) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .update({ 
        patient_summary: summary,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePatientMetrics(userId, metrics) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .update(metrics)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Session management
  async createSession(userId, patientProfileId) {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .insert({
        user_id: userId,
        patient_profile_id: patientProfileId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async endSession(sessionId, summary) {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .update({
        ended_at: new Date().toISOString(),
        session_summary: summary
      })
      .eq('id', sessionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRecentSessions(userId, limit = 10) {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Message storage - Optimized for free tier
  async saveMessage(sessionId, userId, sender, content, triggerAnalysis = null) {
    const messageData = {
      session_id: sessionId,
      user_id: userId,
      sender,
      content: content.substring(0, 1000) // Limit content length
    };

    // Only store essential trigger data to save space
    if (triggerAnalysis) {
      messageData.trigger_analysis = {
        triggerDetected: triggerAnalysis.triggerDetected,
        triggerCategory: triggerAnalysis.triggerCategory,
        triggerIntensity: triggerAnalysis.triggerIntensity,
        confidence: triggerAnalysis.confidence
      };
      messageData.trigger_detected = triggerAnalysis.triggerDetected;
      messageData.trigger_category = triggerAnalysis.triggerCategory;
      messageData.trigger_intensity = triggerAnalysis.triggerIntensity;
      messageData.trigger_confidence = triggerAnalysis.confidence;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getSessionMessages(sessionId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Trigger history - Optimized storage
  async saveTrigger(userId, sessionId, messageId, triggerData) {
    const { data, error } = await supabase
      .from('trigger_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        message_id: messageId,
        category: triggerData.category,
        intensity: triggerData.intensity,
        confidence: triggerData.confidence,
        reasoning: triggerData.reasoning?.substring(0, 200), // Limit reasoning length
        user_message: triggerData.userMessage?.substring(0, 300), // Limit message length
        bot_response: triggerData.botResponse?.substring(0, 300) // Limit response length
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getTriggerHistory(userId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('trigger_history')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Recovery progress - Daily aggregation to save space
  async updateDailyProgress(userId, progressData) {
    const today = new Date().toISOString().split('T')[0];
    
    // Get existing progress for today
    const { data: existing } = await supabase
      .from('recovery_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from('recovery_progress')
        .update({
          conversations_count: existing.conversations_count + (progressData.conversations_count || 0),
          triggers_detected: existing.triggers_detected + (progressData.triggers_detected || 0),
          high_risk_triggers: existing.high_risk_triggers + (progressData.high_risk_triggers || 0),
          coping_strategies_used: existing.coping_strategies_used + (progressData.coping_strategies_used || 0),
          mood_rating: progressData.mood_rating || existing.mood_rating,
          recovery_confidence: progressData.recovery_confidence || existing.recovery_confidence,
          notes: progressData.notes || existing.notes
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('recovery_progress')
        .insert({
          user_id: userId,
          date: today,
          ...progressData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  async getRecoveryProgress(userId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('recovery_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Data cleanup for free tier - Keep only recent data
  async cleanupOldData(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Keep only last 30 days of detailed data
    await supabase
      .from('messages')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', thirtyDaysAgo);
    
    await supabase
      .from('trigger_history')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', thirtyDaysAgo);
  },

  // Polling-based updates instead of real-time
  async pollForUpdates(userId, lastUpdate) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .gt('created_at', lastUpdate)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Analytics and reporting
  async getTriggerStats(userId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('trigger_history')
      .select('category, intensity, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate);
    
    if (error) throw error;
    return data;
  },

  async getSessionStats(userId, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate);
    
    if (error) throw error;
    return data;
  }
}; 