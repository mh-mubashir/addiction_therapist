import React from 'react';

const ConversationHistory = ({ sessions }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getRiskLevelIcon = (level) => {
    switch (level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="conversation-history">
      {sessions.length === 0 ? (
        <div className="no-conversations">
          <p>💬 No conversations yet.</p>
          <p>Start your first conversation to begin tracking your recovery journey.</p>
        </div>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <div key={session.id} className="session-item">
              <div className="session-header">
                <div className="session-date">
                  {formatDate(session.created_at)}
                </div>
                {session.risk_level && (
                  <div 
                    className="risk-level"
                    style={{ color: getRiskLevelColor(session.risk_level) }}
                  >
                    {getRiskLevelIcon(session.risk_level)} {session.risk_level}
                  </div>
                )}
              </div>
              
              <div className="session-metrics">
                <div className="metric">
                  <span className="metric-label">Duration</span>
                  <span className="metric-value">{formatDuration(session.session_duration_minutes)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Messages</span>
                  <span className="metric-value">{session.messages_count}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Triggers</span>
                  <span className="metric-value">{session.triggers_detected_count}</span>
                </div>
              </div>

              {session.session_summary && (
                <div className="session-summary">
                  <p>{session.session_summary}</p>
                </div>
              )}

              {session.primary_concerns && session.primary_concerns.length > 0 && (
                <div className="primary-concerns">
                  <h5>Primary Concerns:</h5>
                  <div className="concerns-list">
                    {session.primary_concerns.map((concern, index) => (
                      <span key={index} className="concern-tag">
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="session-status">
                {session.ended_at ? (
                  <span className="status completed">Completed</span>
                ) : (
                  <span className="status active">Active</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="history-footer">
          <p>Showing last {sessions.length} conversations</p>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory; 