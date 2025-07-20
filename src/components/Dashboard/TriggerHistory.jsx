import React from 'react';

const TriggerHistory = ({ triggerStats }) => {
  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      case 'minimal': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'concerning': return '⚠️';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving': return '#28a745';
      case 'concerning': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="trigger-history">
      <div className="trigger-overview">
        <div className="trigger-stat">
          <h4>Total Triggers</h4>
          <p className="stat-number">{triggerStats.total || 0}</p>
        </div>
        <div className="trigger-stat">
          <h4>Trend</h4>
          <p className="trend-indicator" style={{ color: getTrendColor(triggerStats.trend) }}>
            {getTrendIcon(triggerStats.trend)} {triggerStats.trend}
          </p>
        </div>
      </div>

      {triggerStats.byIntensity && Object.keys(triggerStats.byIntensity).length > 0 && (
        <div className="intensity-breakdown">
          <h4>By Risk Level</h4>
          <div className="intensity-bars">
            {Object.entries(triggerStats.byIntensity).map(([intensity, count]) => (
              <div key={intensity} className="intensity-bar">
                <div className="bar-label">
                  <span className="intensity-dot" style={{ backgroundColor: getIntensityColor(intensity) }}></span>
                  {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${(count / triggerStats.total) * 100}%`,
                      backgroundColor: getIntensityColor(intensity)
                    }}
                  ></div>
                  <span className="bar-count">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {triggerStats.byCategory && Object.keys(triggerStats.byCategory).length > 0 && (
        <div className="category-breakdown">
          <h4>By Category</h4>
          <div className="category-list">
            {Object.entries(triggerStats.byCategory)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <span className="category-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {triggerStats.total === 0 && (
        <div className="no-triggers">
          <p>🎉 No triggers detected in the last 30 days!</p>
          <p>Keep up the great work in your recovery journey.</p>
        </div>
      )}
    </div>
  );
};

export default TriggerHistory; 