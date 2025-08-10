import React, { useState, useEffect, useRef } from 'react';
import { voiceService, checkVoiceCommand, toneAnalyzer } from '../services/voiceService.js';
import { getFallbackResponse } from '../services/fallbackService.js';
import MemoryControl from './MemoryControl.jsx';

const VoiceInterface = ({ onMessage, onError, isAIAvailable = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle, listening, processing, speaking
  const [sessionActive, setSessionActive] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [currentToneAnalysis, setCurrentToneAnalysis] = useState(null);
  const [emotionalTrend, setEmotionalTrend] = useState(null);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const audioRef = useRef(null);
  const sessionTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize voice service
    if (voiceService.isSupported()) {
      voiceService.setCallbacks(handleTranscript, handleVoiceError);
      setVoiceStatus('ready');
    } else {
      setVoiceStatus('unsupported');
      onError('Voice features not supported in this browser');
    }

    // Cleanup on unmount
    return () => {
      voiceService.destroy();
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  const handleTranscript = (result) => {
    if (result.isFinal) {
      setTranscript(result.final);
      setInterimTranscript('');
      
      // Check for voice commands
      const command = checkVoiceCommand(result.final);
      if (command) {
        handleVoiceCommand(command);
        return;
      }
      
      // Process as regular message
      processUserMessage(result.final);
    } else {
      setInterimTranscript(result.interim);
    }
  };

  const handleVoiceError = (error) => {
    console.error('Voice error:', error);
    setVoiceStatus('error');
    onError(`Voice recognition error: ${error}`);
  };

  const handleVoiceCommand = (command) => {
    console.log('Voice command detected:', command);
    
    switch (command.command) {
      case 'start session':
        startVoiceSession();
        break;
      case 'stop session':
        stopVoiceSession();
        break;
      case 'pause':
        pauseListening();
        break;
      case 'resume':
        resumeListening();
        break;
      case 'repeat':
        repeatLastResponse();
        break;
      case 'emergency':
        triggerEmergencyMode();
        break;
      default:
        break;
    }
  };

  const startVoiceSession = () => {
    if (voiceService.startListening()) {
      const sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
      setSessionActive(true);
      setVoiceStatus('listening');
      setIsListening(true);
      
      // Welcome message
      const welcomeMessage = "Hello, I'm here to support you in your recovery journey. How are you feeling today?";
      speakResponse(welcomeMessage);
      
      // Auto-stop session after 30 minutes of inactivity
      sessionTimeoutRef.current = setTimeout(() => {
        stopVoiceSession();
      }, 30 * 60 * 1000);
    }
  };

  const stopVoiceSession = () => {
    voiceService.stopListening();
    voiceService.stopSpeaking();
    setSessionActive(false);
    setVoiceStatus('idle');
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    setInterimTranscript('');
    
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
  };

  const pauseListening = () => {
    voiceService.stopListening();
    setIsListening(false);
    setVoiceStatus('paused');
  };

  const resumeListening = () => {
    if (voiceService.startListening()) {
      setIsListening(true);
      setVoiceStatus('listening');
    }
  };

  const repeatLastResponse = () => {
    if (lastResponse) {
      speakResponse(lastResponse);
    }
  };

  const triggerEmergencyMode = () => {
    const emergencyMessage = "I understand you're in crisis. Please call the National Drug Addiction Helpline at 1-844-289-0879 immediately. You can also text HOME to 741741 for crisis support.";
    speakResponse(emergencyMessage, { rate: 0.8, volume: 1.0 });
  };

  const processUserMessage = async (message) => {
    setVoiceStatus('processing');
    
    try {
      // Analyze tone of user message
      const toneAnalysis = toneAnalyzer.analyzeTextTone(message);
      const emotionalTrend = toneAnalyzer.getEmotionalTrend();
      
      // Update state for display
      setCurrentToneAnalysis(toneAnalysis);
      setEmotionalTrend(emotionalTrend);
      
      console.log('🎭 Tone Analysis:', toneAnalysis);
      console.log('📈 Emotional Trend:', emotionalTrend);
      
      // Generate tone-based response if confident
      let toneResponse = null;
      if (toneAnalysis.confidence !== 'low') {
        toneResponse = toneAnalyzer.generateToneResponse(toneAnalysis, emotionalTrend);
        console.log('💬 Tone Response:', toneResponse);
      }
      
      // Send message to parent component (ChatInterface)
      let aiResponse = null;
      if (onMessage) {
        aiResponse = await onMessage(message);
      } else {
        // Fallback if no parent handler
        const fallbackResponse = getFallbackResponse(message);
        aiResponse = fallbackResponse.text;
      }
      
      // Add to conversation memory based on user preference
      if (memoryEnabled) {
        toneAnalyzer.addToMemory(message, toneAnalysis, aiResponse, currentSessionId, true);
      } else {
        toneAnalyzer.addToTemporaryMemory(message, toneAnalysis, aiResponse, currentSessionId);
      }
      
      // Speak tone response first if available, then AI response
      if (toneResponse) {
        await speakResponse(toneResponse);
        // Small pause between responses
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (aiResponse) {
        speakResponse(aiResponse);
      }
      
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = "I'm sorry, I'm having trouble processing your message right now. Please try again.";
      speakResponse(errorMessage);
    }
  };

  const speakResponse = (text, options = {}) => {
    setLastResponse(text);
    setVoiceStatus('speaking');
    setIsSpeaking(true);
    
    voiceService.speak(text, {
      rate: 0.9, // Slightly slower for therapy
      pitch: 1.0,
      volume: 0.8,
      ...options
    });
    
    // Update status when speaking ends
    const checkSpeakingStatus = setInterval(() => {
      const status = voiceService.getStatus();
      if (!status.isSpeaking) {
        setIsSpeaking(false);
        setVoiceStatus('listening');
        clearInterval(checkSpeakingStatus);
        
        // Resume listening after speaking
        if (sessionActive && !isListening) {
          resumeListening();
        }
      }
    }, 100);
  };

  const getStatusColor = () => {
    switch (voiceStatus) {
      case 'ready': return '#28a745';
      case 'listening': return '#007bff';
      case 'processing': return '#ffc107';
      case 'speaking': return '#17a2b8';
      case 'paused': return '#6c757d';
      case 'error': return '#dc3545';
      case 'unsupported': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (voiceStatus) {
      case 'ready': return 'Ready to start';
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      case 'paused': return 'Paused';
      case 'error': return 'Error';
      case 'unsupported': return 'Not supported';
      default: return 'Idle';
    }
  };

  if (voiceStatus === 'unsupported') {
    return (
      <div className="voice-interface unsupported">
        <div className="voice-status">
          <span className="status-icon">🔇</span>
          <span>Voice features not supported in this browser</span>
        </div>
        <p>Please use Chrome, Safari, or Edge for voice features.</p>
      </div>
    );
  }

  return (
    <div className="voice-interface">
      {/* Voice Status Display */}
      <div className="voice-status-bar">
        <div className="status-indicator" style={{ backgroundColor: getStatusColor() }}>
          <span className="status-icon">
            {voiceStatus === 'listening' ? '🎤' : 
             voiceStatus === 'speaking' ? '🔊' : 
             voiceStatus === 'processing' ? '⏳' : '🎧'}
          </span>
          <span className="status-text">{getStatusText()}</span>
        </div>
        
        {sessionActive && (
          <div className="session-info">
            <span className="session-timer">Session Active</span>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      <div className="transcript-container">
        {transcript && (
          <div className="final-transcript">
            <strong>You said:</strong> {transcript}
          </div>
        )}
        {interimTranscript && (
          <div className="interim-transcript">
            <em>Listening: {interimTranscript}</em>
          </div>
        )}
      </div>

      {/* Tone Analysis Display */}
      {currentToneAnalysis && currentToneAnalysis.confidence !== 'low' && (
        <div className="tone-analysis-container">
          <div className="tone-analysis-header">
            <span className="tone-icon">🎭</span>
            <span className="tone-label">Emotional Tone Detected</span>
          </div>
          <div className="tone-details">
            <div className="tone-emotion">
              <strong>Primary Emotion:</strong> 
              <span className={`emotion-badge ${currentToneAnalysis.primaryEmotion}`}>
                {currentToneAnalysis.primaryEmotion}
              </span>
            </div>
            <div className="tone-intensity">
              <strong>Intensity:</strong> 
              <span className={`intensity-badge ${currentToneAnalysis.intensity}`}>
                {currentToneAnalysis.intensity}
              </span>
            </div>
            <div className="tone-confidence">
              <strong>Confidence:</strong> 
              <span className={`confidence-badge ${currentToneAnalysis.confidence}`}>
                {currentToneAnalysis.confidence}
              </span>
            </div>
          </div>
          {emotionalTrend && emotionalTrend.frequency >= 3 && (
            <div className="emotional-trend">
              <strong>Trend:</strong> You've been feeling {emotionalTrend.dominantEmotion} in recent conversations
            </div>
          )}
        </div>
      )}

      {/* Voice Controls */}
      <div className="voice-controls">
        {!sessionActive ? (
          <button 
            onClick={startVoiceSession}
            className="voice-button start"
            disabled={voiceStatus === 'unsupported'}
          >
            🎤 Start Voice Session
          </button>
        ) : (
          <div className="session-controls">
            <button 
              onClick={isListening ? pauseListening : resumeListening}
              className={`voice-button ${isListening ? 'pause' : 'resume'}`}
            >
              {isListening ? '⏸️ Pause' : '▶️ Resume'}
            </button>
            
            <button 
              onClick={stopVoiceSession}
              className="voice-button stop"
            >
              🛑 End Session
            </button>
            
            {lastResponse && (
              <button 
                onClick={repeatLastResponse}
                className="voice-button repeat"
              >
                🔄 Repeat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Memory Control */}
      <div className="memory-control-section">
        <h4>🧠 Memory Settings</h4>
        <MemoryControl 
          sessionId={currentSessionId}
          onMemoryChange={setMemoryEnabled}
          isVoiceMode={true}
        />
      </div>

      {/* Voice Commands Help */}
      <div className="voice-commands-help">
        <h4>Voice Commands:</h4>
        <ul>
          <li>"Start session" - Begin voice therapy</li>
          <li>"Stop session" - End voice therapy</li>
          <li>"Pause" - Pause listening</li>
          <li>"Resume" - Resume listening</li>
          <li>"Repeat" - Repeat last response</li>
          <li>"Emergency" - Get crisis help</li>
        </ul>
      </div>

      {/* Audio Visualization */}
      {isListening && (
        <div className="audio-visualizer">
          <div className="audio-bars">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="audio-bar"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${Math.random() * 60 + 20}%`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceInterface; 