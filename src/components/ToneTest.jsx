import React, { useState } from 'react';
import { toneAnalyzer } from '../services/voiceService.js';

const ToneTest = () => {
  const [testMessage, setTestMessage] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [trend, setTrend] = useState(null);
  const [toneResponse, setToneResponse] = useState('');

  const testMessages = [
    "I'm feeling really sad and hopeless today",
    "I'm so angry at everything and everyone",
    "I'm anxious and worried about my future",
    "I'm feeling happy and grateful for my progress",
    "I'm calm and at peace with myself",
    "I'm confused about what to do next",
    "I'm just having a normal day, nothing special"
  ];

  const testTone = () => {
    if (!testMessage.trim()) return;
    
    // Analyze tone
    const toneAnalysis = toneAnalyzer.analyzeTextTone(testMessage);
    const emotionalTrend = toneAnalyzer.getEmotionalTrend();
    const response = toneAnalyzer.generateToneResponse(toneAnalysis, emotionalTrend);
    
    // Add to memory
    toneAnalyzer.addToMemory(testMessage, toneAnalysis, "Test response");
    
    setAnalysis(toneAnalysis);
    setTrend(emotionalTrend);
    setToneResponse(response);
  };

  const clearMemory = () => {
    toneAnalyzer.clearMemory();
    setAnalysis(null);
    setTrend(null);
    setToneResponse('');
  };

  const getSummary = () => {
    return toneAnalyzer.getConversationSummary();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🎭 Tone Detection Test</h2>
      <p>Test the tone detection system by entering messages that would normally be spoken to the AI therapist.</p>
      
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
                cursor: 'pointer',
                fontSize: '0.9rem'
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
            marginBottom: '10px',
            fontSize: '1rem'
          }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={testTone}
            style={{
              padding: '10px 20px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Analyze Tone
          </button>
          <button
            onClick={clearMemory}
            style={{
              padding: '10px 20px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Memory
          </button>
        </div>
      </div>

      {analysis && (
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          background: '#f8f9fa',
          marginBottom: '20px'
        }}>
          <h3>🎭 Tone Analysis Results:</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div>
              <strong>Primary Emotion:</strong>
              <div style={{
                padding: '8px',
                background: '#e3f2fd',
                borderRadius: '4px',
                marginTop: '5px',
                textTransform: 'capitalize'
              }}>
                {analysis.primaryEmotion}
              </div>
            </div>
            
            <div>
              <strong>Intensity:</strong>
              <div style={{
                padding: '8px',
                background: analysis.intensity === 'high' ? '#ffebee' : 
                           analysis.intensity === 'medium' ? '#fff3e0' : '#e8f5e8',
                borderRadius: '4px',
                marginTop: '5px',
                textTransform: 'capitalize'
              }}>
                {analysis.intensity}
              </div>
            </div>
            
            <div>
              <strong>Confidence:</strong>
              <div style={{
                padding: '8px',
                background: analysis.confidence === 'high' ? '#e8f5e8' : 
                           analysis.confidence === 'medium' ? '#fff3e0' : '#f5f5f5',
                borderRadius: '4px',
                marginTop: '5px',
                textTransform: 'capitalize'
              }}>
                {analysis.confidence}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <strong>Emotion Scores:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
              {Object.entries(analysis.emotionScores).map(([emotion, score]) => (
                <span key={emotion} style={{
                  padding: '4px 8px',
                  background: score > 0 ? '#007bff' : '#f5f5f5',
                  color: score > 0 ? 'white' : '#666',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  textTransform: 'capitalize'
                }}>
                  {emotion}: {score}
                </span>
              ))}
            </div>
          </div>

          {trend && (
            <div style={{ marginBottom: '15px' }}>
              <strong>Emotional Trend:</strong>
              <div style={{
                padding: '8px',
                background: '#fff3e0',
                borderRadius: '4px',
                marginTop: '5px'
              }}>
                Dominant emotion: {trend.dominantEmotion} (appeared {trend.frequency} times in last {trend.totalMessages} messages)
              </div>
            </div>
          )}

          {toneResponse && (
            <div>
              <strong>Generated Tone Response:</strong>
              <div style={{
                padding: '12px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginTop: '5px',
                fontStyle: 'italic'
              }}>
                "{toneResponse}"
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#f8f9fa'
      }}>
        <h3>📊 Conversation Summary:</h3>
        <pre style={{
          background: 'white',
          padding: '10px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '0.9rem'
        }}>
          {JSON.stringify(getSummary(), null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ToneTest; 