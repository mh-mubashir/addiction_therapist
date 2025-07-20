// Data optimization utilities for Supabase free tier

export const dataOptimization = {
  // Estimate storage usage for a user
  estimateUserStorage(userData) {
    const estimates = {
      patientProfile: 1, // ~1KB
      conversationSessions: userData.sessionsCount * 0.5, // ~500B per session
      messages: userData.messagesCount * 2, // ~2KB per message
      triggerHistory: userData.triggersCount * 1, // ~1KB per trigger
      recoveryProgress: userData.daysActive * 0.5, // ~500B per day
    };
    
    const totalKB = Object.values(estimates).reduce((sum, val) => sum + val, 0);
    return {
      breakdown: estimates,
      totalKB,
      totalMB: totalKB / 1024
    };
  },

  // Check if user is approaching storage limits
  checkStorageLimits(userId, currentUsage) {
    const freeTierLimit = 500; // 500MB
    const warningThreshold = 400; // 80% of limit
    const criticalThreshold = 450; // 90% of limit
    
    if (currentUsage.totalMB > criticalThreshold) {
      return {
        status: 'critical',
        message: 'Storage limit nearly reached. Old data will be automatically cleaned up.',
        action: 'cleanup'
      };
    } else if (currentUsage.totalMB > warningThreshold) {
      return {
        status: 'warning',
        message: 'Storage usage is high. Consider cleaning up old data.',
        action: 'monitor'
      };
    }
    
    return {
      status: 'ok',
      message: 'Storage usage is within limits.',
      action: 'none'
    };
  },

  // Data retention policies
  retentionPolicies: {
    messages: {
      keepDays: 30, // Keep detailed messages for 30 days
      archiveAfter: 7, // Archive after 7 days (move to summary)
      maxLength: 1000 // Max characters per message
    },
    triggerHistory: {
      keepDays: 90, // Keep trigger history for 90 days
      maxReasoningLength: 200, // Limit reasoning text
      maxMessageLength: 300 // Limit stored message length
    },
    conversationSessions: {
      keepDays: 365, // Keep session metadata for 1 year
      summarizeAfter: 30 // Create summary after 30 days
    },
    recoveryProgress: {
      keepDays: 730, // Keep progress data for 2 years
      aggregateAfter: 7 // Aggregate daily data after 7 days
    }
  },

  // Truncate text to save space
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  // Compress trigger analysis data
  compressTriggerAnalysis(analysis) {
    return {
      triggerDetected: analysis.triggerDetected,
      triggerCategory: analysis.triggerCategory,
      triggerIntensity: analysis.triggerIntensity,
      confidence: analysis.confidence,
      // Exclude verbose fields to save space
      // reasoning: analysis.reasoning?.substring(0, 200),
      // contextNotes: analysis.contextNotes?.substring(0, 200)
    };
  },

  // Generate storage usage report
  async generateStorageReport(userId, dbService) {
    try {
      // Get user data counts
      const [
        { count: sessionsCount },
        { count: messagesCount },
        { count: triggersCount },
        { count: progressDays }
      ] = await Promise.all([
        dbService.supabase.from('conversation_sessions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        dbService.supabase.from('messages').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        dbService.supabase.from('trigger_history').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        dbService.supabase.from('recovery_progress').select('*', { count: 'exact', head: true }).eq('user_id', userId)
      ]);

      const userData = {
        sessionsCount: sessionsCount || 0,
        messagesCount: messagesCount || 0,
        triggersCount: triggersCount || 0,
        daysActive: progressDays || 0
      };

      const storageEstimate = this.estimateUserStorage(userData);
      const limitsCheck = this.checkStorageLimits(userId, storageEstimate);

      return {
        userData,
        storageEstimate,
        limitsCheck,
        recommendations: this.generateRecommendations(storageEstimate, limitsCheck)
      };
    } catch (error) {
      console.error('Error generating storage report:', error);
      return null;
    }
  },

  // Generate recommendations based on storage usage
  generateRecommendations(storageEstimate, limitsCheck) {
    const recommendations = [];

    if (limitsCheck.status === 'critical') {
      recommendations.push('Immediate data cleanup required');
      recommendations.push('Consider archiving old conversations');
      recommendations.push('Reduce message storage retention period');
    } else if (limitsCheck.status === 'warning') {
      recommendations.push('Monitor storage usage closely');
      recommendations.push('Consider enabling automatic cleanup');
    }

    if (storageEstimate.totalMB > 100) {
      recommendations.push('High storage usage detected');
      recommendations.push('Consider optimizing message storage');
    }

    return recommendations;
  }
}; 