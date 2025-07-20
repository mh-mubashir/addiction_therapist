import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dbService } from '../../services/supabase';
import TriggerHistory from './TriggerHistory';
import RecoveryProgress from './RecoveryProgress';
import ConversationHistory from './ConversationHistory';
import PatientSummary from './PatientSummary';

const PatientDashboard = () => {
  const { user, patientProfile } = useAuth();
  const [triggerStats, setTriggerStats] = useState({});
  const [recentProgress, setRecentProgress] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Load trigger statistics
      const triggers = await dbService.getTriggerStats(user.id, 30);
      const triggerAnalysis = analyzeTriggerData(triggers);
      setTriggerStats(triggerAnalysis);

      // Load recent progress
      const progress = await dbService.getRecoveryProgress(user.id, 30);
      setRecentProgress(progress || []);

      // Load recent sessions
      const sessions = await dbService.getRecentSessions(user.id, 5);
      setRecentSessions(sessions || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeTriggerData = (triggers) => {
    const stats = {
      total: triggers.length,
      byCategory: {},
      byIntensity: {},
      trend: 'stable'
    };

    triggers.forEach(trigger => {
      // Category stats
      stats.byCategory[trigger.category] = (stats.byCategory[trigger.category] || 0) + 1;
      
      // Intensity stats
      stats.byIntensity[trigger.intensity] = (stats.byIntensity[trigger.intensity] || 0) + 1;
    });

    // Determine trend based on recent triggers
    const recentTriggers = triggers.filter(t => 
      new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    
    if (recentTriggers.length < triggers.length * 0.3) {
      stats.trend = 'improving';
    } else if (recentTriggers.length > triggers.length * 0.7) {
      stats.trend = 'concerning';
    }

    return stats;
  };

  const calculateDaysSober = (sobrietyDate) => {
    if (!sobrietyDate) return 0;
    const sobriety = new Date(sobrietyDate);
    const today = new Date();
    const diffTime = Math.abs(today - sobriety);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your recovery dashboard...</p>
      </div>
    );
  }

  if (!patientProfile) {
    return <div>No patient profile found.</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Recovery Dashboard</h1>
          <p>Track your progress and insights</p>
        </div>
        <div className="patient-info">
          <div className="info-card">
            <h3>Recovery Stage</h3>
            <p className="stage-badge">{patientProfile.recovery_stage}</p>
          </div>
          <div className="info-card">
            <h3>Days Sober</h3>
            <p className="days-sober">{calculateDaysSober(patientProfile.sobriety_date)}</p>
          </div>
          <div className="info-card">
            <h3>Primary Addiction</h3>
            <p>{patientProfile.primary_addiction}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Trigger Analysis</h3>
          <TriggerHistory triggerStats={triggerStats} />
        </div>

        <div className="dashboard-card">
          <h3>Recovery Progress</h3>
          <RecoveryProgress progress={recentProgress} />
        </div>

        <div className="dashboard-card">
          <h3>Recent Conversations</h3>
          <ConversationHistory sessions={recentSessions} />
        </div>

        <div className="dashboard-card">
          <h3>Patient Summary</h3>
          <PatientSummary profile={patientProfile} />
        </div>
      </div>

      <div className="dashboard-footer">
        <button onClick={loadDashboardData} className="refresh-button">
          Refresh Dashboard
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard; 