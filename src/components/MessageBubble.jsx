import React from 'react';

const MessageBubble = ({ message, triggerAlert, triggerSummary }) => {
  const isBot = message.sender === 'bot';
  const isCopingMessage = message.isCopingMessage;
  const isFallback = message.isFallback;
  const isEmergency = message.isEmergency;

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high': return '#ff4444';    // Red - 80-100% relapse risk
      case 'medium': return '#ff8800';  // Orange - 40-79% relapse risk
      case 'low': return '#ffaa00';     // Yellow - 10-39% relapse risk
      case 'minimal': return '#4caf50'; // Green - 0-9% relapse risk
      default: return '#666666';
    }
  };

  const getIntensityIcon = (intensity) => {
    switch (intensity) {
      case 'high': return '🔴';     // Red circle - High relapse risk
      case 'medium': return '🟡';   // Yellow circle - Medium relapse risk
      case 'low': return '🟠';      // Orange circle - Low relapse risk
      case 'minimal': return '🟢';  // Green circle - Minimal relapse risk
      default: return '⚪';
    }
  };

  const getIntensityLabel = (intensity) => {
    switch (intensity) {
      case 'high': return 'High Risk (80-100%)';
      case 'medium': return 'Medium Risk (40-79%)';
      case 'low': return 'Low Risk (10-39%)';
      case 'minimal': return 'Minimal Risk (0-9%)';
      default: return 'Unknown Risk';
    }
  };

  return (
    <div className={`message ${isBot ? 'bot' : 'user'} ${isFallback ? 'fallback' : ''} ${isEmergency ? 'emergency' : ''}`}>
      <div className="message-avatar">
        {isBot ? 'T' : 'U'}
      </div>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        
        {/* Trigger Alert for User Messages */}
        {triggerAlert && (
          <div className="trigger-alert" style={{ borderLeftColor: getIntensityColor(triggerAlert.intensity) }}>
            <div className="trigger-header">
              <span className="trigger-icon">{getIntensityIcon(triggerAlert.intensity)}</span>
              <span className="trigger-category">{triggerAlert.categoryName}</span>
              <span className="trigger-intensity">({getIntensityLabel(triggerAlert.intensity)})</span>
            </div>
            <div className="trigger-reasoning">{triggerAlert.reasoning}</div>
          </div>
        )}

        {/* Trigger Summary */}
        {triggerSummary && triggerSummary.length > 0 && (
          <div className="trigger-summary">
            <div className="summary-header">📊 Session Trigger Summary</div>
            {triggerSummary.map((category, index) => (
              <div key={index} className="summary-category">
                <div className="category-name">
                  {category.name} 
                  <span className={`risk-level risk-${category.riskLevel}`}>
                    ({category.riskLevel} risk)
                  </span>
                </div>
                <div className="category-count">
                  {category.count} trigger{category.count !== 1 ? 's' : ''} detected
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Coping Message Indicator */}
        {isCopingMessage && (
          <div className="coping-indicator">
            💡 Coping strategies provided
          </div>
        )}

        {/* Fallback Message Indicator */}
        {isFallback && (
          <div className="fallback-indicator">
            ⚠️ Backup response (AI temporarily unavailable)
          </div>
        )}

        {/* Emergency Message Indicator */}
        {isEmergency && (
          <div className="emergency-indicator">
            🚨 Emergency resources provided
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble; 