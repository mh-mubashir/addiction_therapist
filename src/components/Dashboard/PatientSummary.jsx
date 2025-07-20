import React, { useState } from 'react';

const PatientSummary = ({ profile }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'early': return '#dc3545';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStageDescription = (stage) => {
    switch (stage) {
      case 'early': return 'Early Recovery (0-6 months) - Focus on building foundation and coping skills';
      case 'intermediate': return 'Intermediate Recovery (6-18 months) - Strengthening recovery and addressing deeper issues';
      case 'advanced': return 'Advanced Recovery (18+ months) - Maintaining long-term sobriety and personal growth';
      default: return 'Recovery stage not specified';
    }
  };

  const truncateSummary = (summary, maxLength = 200) => {
    if (!summary) return 'No summary available yet.';
    if (summary.length <= maxLength) return summary;
    return summary.substring(0, maxLength) + '...';
  };

  return (
    <div className="patient-summary">
      <div className="profile-overview">
        <div className="profile-section">
          <h4>Recovery Stage</h4>
          <div className="stage-info">
            <span 
              className="stage-badge"
              style={{ backgroundColor: getStageColor(profile.recovery_stage) }}
            >
              {profile.recovery_stage.charAt(0).toUpperCase() + profile.recovery_stage.slice(1)}
            </span>
            <p className="stage-description">
              {getStageDescription(profile.recovery_stage)}
            </p>
          </div>
        </div>

        <div className="profile-section">
          <h4>Primary Addiction</h4>
          <p className="addiction-info">
            {profile.primary_addiction ? 
              profile.primary_addiction.charAt(0).toUpperCase() + profile.primary_addiction.slice(1) : 
              'Not specified'
            }
          </p>
        </div>

        <div className="profile-section">
          <h4>Sobriety Date</h4>
          <p className="sobriety-date">{formatDate(profile.sobriety_date)}</p>
        </div>

        <div className="profile-section">
          <h4>Support Network</h4>
          <p className="support-status">
            {profile.support_network_available ? 
              '✅ Available' : 
              '❌ Not available'
            }
          </p>
        </div>
      </div>

      <div className="summary-section">
        <h4>AI-Generated Summary</h4>
        <div className="summary-content">
          {isExpanded ? (
            <p>{profile.patient_summary || 'No summary available yet.'}</p>
          ) : (
            <p>{truncateSummary(profile.patient_summary)}</p>
          )}
          
          {profile.patient_summary && profile.patient_summary.length > 200 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="expand-button"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>

      <div className="recovery-metrics">
        <h4>Recovery Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Total Conversations</span>
            <span className="metric-value">{profile.total_conversations || 0}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Triggers Detected</span>
            <span className="metric-value">{profile.total_triggers_detected || 0}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Last Conversation</span>
            <span className="metric-value">
              {profile.last_conversation_date ? 
                formatDate(profile.last_conversation_date) : 
                'Never'
              }
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Profile Updated</span>
            <span className="metric-value">
              {profile.updated_at ? 
                formatDate(profile.updated_at) : 
                'Never'
              }
            </span>
          </div>
        </div>
      </div>

      {profile.notification_preferences && Object.keys(profile.notification_preferences).length > 0 && (
        <div className="preferences-section">
          <h4>Preferences</h4>
          <div className="preferences-list">
            {Object.entries(profile.notification_preferences).map(([key, value]) => (
              <div key={key} className="preference-item">
                <span className="preference-label">{key.replace(/_/g, ' ')}</span>
                <span className="preference-value">{value ? '✅' : '❌'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSummary; 