import React, { useState } from 'react';
import { getFallbackResponse, needsImmediateAttention } from '../services/fallbackService.js';

const FallbackTest = () => {
  const [testMessage, setTestMessage] = useState('');
  const [response, setResponse] = useState(null);

  const testFallback = () => {
    if (!testMessage.trim()) return;
    
    const fallbackResponse = getFallbackResponse(testMessage);
    const needsAttention = needsImmediateAttention(testMessage);
    
    setResponse({
      ...fallbackResponse,
      needsAttention
    });
  };

  const testMessages = [
    "I'm feeling really triggered today",
    "I want to use drugs again",
    "I'm feeling suicidal",
    "I'm just having a bad day",
    "I'm stressed about work"
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Fallback System Test</h2>
      <p>Test the graceful degradation system by entering messages that would normally go to Claude AI.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Quick Test Messages:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {testMessages.map((msg, index) => (
            <button
              key={index}
              onClick={() => setTestMessage(msg)}
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: '#f8f9fa',
                cursor: 'pointer'
              }}
            >
              {msg}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Enter a test message..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '10px'
          }}
        />
        <button
          onClick={testFallback}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Fallback Response
        </button>
      </div>

      {response && (
        <div style={{
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: '#f8f9fa'
        }}>
          <h3>Fallback Response:</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Type:</strong> {response.type}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Priority:</strong> 
            <span style={{
              color: response.priority === 'high' ? '#dc3545' : 
                     response.priority === 'medium' ? '#ffc107' : '#28a745',
              fontWeight: 'bold'
            }}>
              {response.priority}
            </span>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Needs Immediate Attention:</strong> 
            <span style={{ color: response.needsAttention ? '#dc3545' : '#28a745' }}>
              {response.needsAttention ? 'Yes' : 'No'}
            </span>
          </div>
          <div style={{
            padding: '10px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap'
          }}>
            {response.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default FallbackTest; 