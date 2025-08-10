import React, { useState, useEffect } from 'react';
import { toneAnalyzer } from '../services/voiceService.js';

const MemoryControl = ({ sessionId, onMemoryChange, isVoiceMode = false }) => {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [memoryStats, setMemoryStats] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);

  useEffect(() => {
    // Load memory preference from localStorage
    const savedPreference = localStorage.getItem('memory-preference');
    if (savedPreference) {
      setMemoryEnabled(JSON.parse(savedPreference));
    }
    
    updateMemoryStats();
  }, []);

  const updateMemoryStats = () => {
    const summary = toneAnalyzer.getConversationSummary();
    const permanentCount = toneAnalyzer.conversationMemory?.length || 0;
    const temporaryCount = toneAnalyzer.temporaryMemory?.length || 0;
    
    setMemoryStats({
      permanent: permanentCount,
      temporary: temporaryCount,
      total: permanentCount + temporaryCount,
      summary
    });
  };

  const handleMemoryToggle = (enabled) => {
    // If user is turning OFF memory, show suggestion
    if (!enabled && memoryEnabled) {
      setShowSuggestion(true);
      // Auto-hide suggestion after 8 seconds
      setTimeout(() => setShowSuggestion(false), 8000);
    } else {
      setShowSuggestion(false);
    }
    
    setMemoryEnabled(enabled);
    localStorage.setItem('memory-preference', JSON.stringify(enabled));
    
    if (onMemoryChange) {
      onMemoryChange(enabled);
    }
    
    updateMemoryStats();
  };

  const exportMemory = () => {
    const data = toneAnalyzer.exportMemoryData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `therapy-memory-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllMemory = () => {
    if (window.confirm('Are you sure you want to clear all conversation memory? This cannot be undone.')) {
      toneAnalyzer.clearMemory();
      toneAnalyzer.clearTemporaryMemory();
      updateMemoryStats();
    }
  };

  const getMemoryIcon = () => {
    return memoryEnabled ? '🧠' : '🧠❌';
  };

  const getMemoryStatus = () => {
    return memoryEnabled ? 'Permanent Memory' : 'Session Only';
  };

  const getMemoryDescription = () => {
    return memoryEnabled 
      ? 'Your conversation will be remembered for future sessions'
      : 'Your conversation will only be remembered for this session';
  };

  return (
    <div className="memory-control">
      {/* Memory Toggle */}
      <div className="memory-toggle">
        <div className="memory-status">
          <span className="memory-icon">{getMemoryIcon()}</span>
          <div className="memory-info">
            <div className="memory-title">{getMemoryStatus()}</div>
            <div className="memory-description">{getMemoryDescription()}</div>
          </div>
        </div>
        
        <div className="memory-switch">
          <label className="switch">
            <input
              type="checkbox"
              checked={memoryEnabled}
              onChange={(e) => handleMemoryToggle(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
          <span className="switch-label">
            {memoryEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Memory Stats */}
      <div className="memory-stats">
        <div className="stat-item">
          <span className="stat-label">Permanent:</span>
          <span className="stat-value">{memoryStats?.permanent || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Temporary:</span>
          <span className="stat-value">{memoryStats?.temporary || 0}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{memoryStats?.total || 0}</span>
        </div>
      </div>

      {/* Memory Actions */}
      <div className="memory-actions">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="memory-button details"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        
        <button
          onClick={exportMemory}
          className="memory-button export"
          disabled={!memoryStats?.total}
        >
          📥 Export Memory
        </button>
        
        <button
          onClick={clearAllMemory}
          className="memory-button clear"
          disabled={!memoryStats?.total}
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Memory Details */}
      {showDetails && (
        <div className="memory-details">
          <h4>Memory Details</h4>
          
          <div className="memory-summary">
            <strong>Current Session:</strong> {sessionId ? `Session ${sessionId.slice(-6)}` : 'No active session'}
          </div>
          
          {memoryStats?.summary && (
            <div className="memory-summary">
              <strong>Dominant Emotion:</strong> {memoryStats.summary.dominantEmotion}
            </div>
          )}
          
          <div className="memory-privacy">
            <h5>Privacy Information:</h5>
            <ul>
              <li>✅ Memory is stored locally in your browser</li>
              <li>✅ No data is sent to external servers</li>
              <li>✅ You can export or clear your data anytime</li>
              <li>✅ Session-only mode keeps nothing after you close the app</li>
            </ul>
          </div>
          
          <div className="memory-tips">
            <h5>When to use each mode:</h5>
            <div className="tip">
              <strong>Permanent Memory (Recommended):</strong> For ongoing therapy progress, emotional tracking, and continuity between sessions. This helps your AI therapist provide more personalized and effective support.
            </div>
            <div className="tip">
              <strong>Session Only:</strong> For sensitive topics, one-time discussions, or when you want complete privacy. Note that this limits the AI's ability to track your progress over time.
            </div>
          </div>
        </div>
      )}

      {/* Memory Suggestion */}
      {showSuggestion && (
        <div className="memory-suggestion">
          <span className="suggestion-icon">💡</span>
          <div className="suggestion-content">
            <div className="suggestion-title">Therapy Tip</div>
            <div className="suggestion-text">
              Your AI therapist works best when it can remember your conversations! 
              This helps provide more personalized support and track your progress over time.
            </div>
            <div className="suggestion-actions">
              <button 
                onClick={() => {
                  handleMemoryToggle(true);
                  setShowSuggestion(false);
                }}
                className="suggestion-button accept"
              >
                Keep Memory On
              </button>
              <button 
                onClick={() => setShowSuggestion(false)}
                className="suggestion-button dismiss"
              >
                Continue with Session Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Memory Warning */}
      {!memoryEnabled && !showSuggestion && (
        <div className="memory-warning">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Session-only mode: Your conversation will not be remembered after this session ends.
          </span>
        </div>
      )}
    </div>
  );
};

export default MemoryControl; 