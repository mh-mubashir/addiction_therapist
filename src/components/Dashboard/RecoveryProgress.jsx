import React from 'react';

const RecoveryProgress = ({ progress }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMoodColor = (rating) => {
    if (rating >= 8) return '#28a745';
    if (rating >= 6) return '#ffc107';
    if (rating >= 4) return '#fd7e14';
    return '#dc3545';
  };

  const getConfidenceColor = (rating) => {
    if (rating >= 8) return '#28a745';
    if (rating >= 6) return '#17a2b8';
    if (rating >= 4) return '#ffc107';
    return '#dc3545';
  };

  // Calculate weekly averages
  const calculateWeeklyAverages = () => {
    const weeklyData = {};
    
    progress.forEach(day => {
      const weekStart = new Date(day.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          mood: [],
          confidence: [],
          triggers: [],
          conversations: []
        };
      }
      
      if (day.mood_rating) weeklyData[weekKey].mood.push(day.mood_rating);
      if (day.recovery_confidence) weeklyData[weekKey].confidence.push(day.recovery_confidence);
      weeklyData[weekKey].triggers.push(day.triggers_detected || 0);
      weeklyData[weekKey].conversations.push(day.conversations_count || 0);
    });

    return Object.entries(weeklyData).map(([week, data]) => ({
      week,
      avgMood: data.mood.length > 0 ? (data.mood.reduce((a, b) => a + b, 0) / data.mood.length).toFixed(1) : null,
      avgConfidence: data.confidence.length > 0 ? (data.confidence.reduce((a, b) => a + b, 0) / data.confidence.length).toFixed(1) : null,
      totalTriggers: data.triggers.reduce((a, b) => a + b, 0),
      totalConversations: data.conversations.reduce((a, b) => a + b, 0)
    }));
  };

  const weeklyData = calculateWeeklyAverages();

  return (
    <div className="recovery-progress">
      {progress.length === 0 ? (
        <div className="no-progress">
          <p>📊 No progress data available yet.</p>
          <p>Start conversations to track your recovery journey.</p>
        </div>
      ) : (
        <>
          <div className="progress-overview">
            <div className="progress-stat">
              <h4>Total Conversations</h4>
              <p className="stat-number">
                {progress.reduce((sum, day) => sum + (day.conversations_count || 0), 0)}
              </p>
            </div>
            <div className="progress-stat">
              <h4>Total Triggers</h4>
              <p className="stat-number">
                {progress.reduce((sum, day) => sum + (day.triggers_detected || 0), 0)}
              </p>
            </div>
            <div className="progress-stat">
              <h4>High Risk Triggers</h4>
              <p className="stat-number">
                {progress.reduce((sum, day) => sum + (day.high_risk_triggers || 0), 0)}
              </p>
            </div>
          </div>

          {weeklyData.length > 0 && (
            <div className="weekly-trends">
              <h4>Weekly Trends</h4>
              <div className="trend-chart">
                {weeklyData.slice(-4).map((week, index) => (
                  <div key={week.week} className="week-bar">
                    <div className="week-label">
                      {formatDate(week.week)}
                    </div>
                    <div className="week-metrics">
                      {week.avgMood && (
                        <div className="metric">
                          <span className="metric-label">Mood</span>
                          <span 
                            className="metric-value" 
                            style={{ color: getMoodColor(week.avgMood) }}
                          >
                            {week.avgMood}/10
                          </span>
                        </div>
                      )}
                      {week.avgConfidence && (
                        <div className="metric">
                          <span className="metric-label">Confidence</span>
                          <span 
                            className="metric-value" 
                            style={{ color: getConfidenceColor(week.avgConfidence) }}
                          >
                            {week.avgConfidence}/10
                          </span>
                        </div>
                      )}
                      <div className="metric">
                        <span className="metric-label">Triggers</span>
                        <span className="metric-value">{week.totalTriggers}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="recent-activity">
            <h4>Recent Activity</h4>
            <div className="activity-list">
              {progress.slice(-5).reverse().map((day, index) => (
                <div key={day.date} className="activity-item">
                  <div className="activity-date">{formatDate(day.date)}</div>
                  <div className="activity-details">
                    {day.conversations_count > 0 && (
                      <span className="activity-badge conversations">
                        {day.conversations_count} conversation{day.conversations_count !== 1 ? 's' : ''}
                      </span>
                    )}
                    {day.triggers_detected > 0 && (
                      <span className="activity-badge triggers">
                        {day.triggers_detected} trigger{day.triggers_detected !== 1 ? 's' : ''}
                      </span>
                    )}
                    {day.mood_rating && (
                      <span 
                        className="activity-badge mood"
                        style={{ color: getMoodColor(day.mood_rating) }}
                      >
                        Mood: {day.mood_rating}/10
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecoveryProgress; 