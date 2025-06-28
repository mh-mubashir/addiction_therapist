import React from 'react';

const MessageBubble = ({ message, triggerAlert, triggerSummary }) => {
  return (
    <div className={`message ${message.sender}`}>
      <div className="message-avatar">
        {message.sender === 'user' ? 'U' : 'T'}
      </div>
      <div className="message-content">
        {message.text}
        
        {triggerAlert && (
          <div className="trigger-alert">
            <strong>⚠️ Trigger Detected:</strong> {triggerAlert.categoryName}
            <br />
            <small>Consider: {triggerAlert.copingStrategy}</small>
          </div>
        )}
        
        {triggerSummary && triggerSummary.length > 0 && (
          <div className="trigger-summary">
            <h4>Session Trigger Summary:</h4>
            <div className="trigger-categories">
              {triggerSummary.map((category, index) => (
                <span 
                  key={index} 
                  className="trigger-category"
                  style={{
                    backgroundColor: category.riskLevel === 'high' ? '#ffcdd2' : 
                                   category.riskLevel === 'medium' ? '#fff3e0' : '#e8f5e8',
                    color: category.riskLevel === 'high' ? '#c62828' : 
                          category.riskLevel === 'medium' ? '#ef6c00' : '#2e7d32'
                  }}
                >
                  {category.name} ({category.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble; 