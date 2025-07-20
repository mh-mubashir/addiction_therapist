import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/supabase';
import MessageBubble from './MessageBubble.jsx';
import { 
  sendMessage, 
  formatMessages, 
  analyzeMessageForTriggers
} from '../services/claudeAPI.js';
import { getCopingStrategies } from '../services/triggerDetection.js';

const ChatInterface = () => {
  const { user, patientProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionTriggers, setSessionTriggers] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      console.log('🔄 Initializing session...');
      console.log('📋 Dependencies:', { user: !!user, patientProfile: !!patientProfile });
      
      if (!user || !patientProfile) {
        console.log('❌ Missing user or patient profile, skipping session init');
        return;
      }

      try {
        console.log('🔍 Creating session for user:', user.id, 'profile:', patientProfile.id);
        const session = await dbService.createSession(user.id, patientProfile.id);
        setCurrentSession(session);
        console.log('✅ Session initialized:', session.id);
      } catch (error) {
        console.error('❌ Failed to initialize session:', error);
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
      }
    };

    initializeSession();
  }, [user, patientProfile]);

  // Load conversation from database
  useEffect(() => {
    const loadConversation = async () => {
      if (!currentSession) return;

      try {
        const sessionMessages = await dbService.getSessionMessages(currentSession.id);

        if (sessionMessages.length === 0) {
          // Add welcome message
          const welcomeMessage = {
            id: Date.now(),
            sender: 'bot',
            text: `Hello! I'm here to support you in your recovery journey. How are you feeling today? Remember, this is a safe space to share your thoughts and feelings.`
          };
          setMessages([welcomeMessage]);
          
          // Save welcome message to database
          await dbService.saveMessage(currentSession.id, user.id, 'bot', welcomeMessage.text);
        } else {
          setMessages(sessionMessages.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            text: msg.content,
            triggerInfo: msg.trigger_analysis
          })));
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    };

    loadConversation();
  }, [currentSession, user]);

  // Save conversation to database whenever messages change
  useEffect(() => {
    const saveMessages = async () => {
      if (!currentSession || messages.length === 0) return;

      try {
        // Save only new messages that haven't been saved yet
        const newMessages = messages.filter(msg => !msg.saved);
        
        for (const message of newMessages) {
          await dbService.saveMessage(
            currentSession.id,
            user.id,
            message.sender,
            message.text,
            message.triggerAnalysis
          );
          message.saved = true;
        }
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    };

    saveMessages();
  }, [messages, currentSession, user]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    console.log('🔍 Send button clicked!');
    console.log('📋 Current state:', {
      inputMessage: inputMessage,
      isLoading: isLoading,
      currentSession: currentSession,
      user: user?.id,
      patientProfile: patientProfile?.id
    });

    if (!inputMessage.trim()) {
      console.log('❌ No input message');
      return;
    }

    if (isLoading) {
      console.log('❌ Already loading');
      return;
    }

    // Fallback mode if database is not set up
    if (!currentSession) {
      console.log('❌ No current session, trying to create one...');
      try {
        if (!user || !patientProfile) {
          console.log('❌ Missing user or patient profile');
          return;
        }
        
        const newSession = await dbService.createSession(user.id, patientProfile.id);
        setCurrentSession(newSession);
        console.log('✅ Created new session:', newSession.id);
      } catch (error) {
        console.error('❌ Failed to create session:', error);
        console.log('🔄 Using fallback mode (no database)');
        
        // Create a temporary session for fallback mode
        const tempSession = {
          id: 'temp-session-' + Date.now(),
          user_id: user.id,
          patient_profile_id: patientProfile.id
        };
        setCurrentSession(tempSession);
      }
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage.trim()
    };

    console.log('📤 Sending message:', userMessage.text);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let botResponse = '';
      let detectedTriggers = [];

      // Analyze message for triggers
      console.log('🔍 Analyzing message for triggers...');
      const triggerAnalysis = await analyzeMessageForTriggers(userMessage.text, messages);
      userMessage.triggerAnalysis = triggerAnalysis;

      console.log('🔍 Trigger analysis result:', triggerAnalysis);

      // Handle trigger detection results
      if (triggerAnalysis.triggerDetected && triggerAnalysis.confidence !== 'low') {
        detectedTriggers.push({
          category: triggerAnalysis.triggerCategory,
          categoryName: triggerAnalysis.triggerCategory,
          intensity: triggerAnalysis.triggerIntensity,
          confidence: triggerAnalysis.confidence,
          reasoning: triggerAnalysis.reasoning
        });

        // Save trigger to database (only if not in fallback mode)
        if (currentSession && !currentSession.id.startsWith('temp-session-')) {
          console.log('💾 Saving trigger to database...');
          try {
            await dbService.saveTrigger(
              user.id,
              currentSession.id,
              userMessage.id,
              {
                ...triggerAnalysis,
                userMessage: userMessage.text,
                botResponse: triggerAnalysis.supportMessage || ''
              }
            );
          } catch (error) {
            console.error('❌ Failed to save trigger:', error);
          }
        }

        setSessionTriggers(prev => [...prev, triggerAnalysis]);
      }

      // Determine next action based on analysis
      if (triggerAnalysis.nextAction === 'support' && triggerAnalysis.supportMessage) {
        botResponse = triggerAnalysis.supportMessage;
      } else if (triggerAnalysis.nextAction === 'question' && triggerAnalysis.suggestedQuestion) {
        botResponse = triggerAnalysis.suggestedQuestion;
      } else {
        // Continue with regular conversation
        console.log('💬 Getting bot response...');
        const conversationHistory = [...messages, userMessage];
        botResponse = await sendMessage(conversationHistory);
      }

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse
      };

      console.log('📥 Bot response:', botResponse);
      setMessages(prev => [...prev, botMessage]);

      // If triggers were detected, add coping strategies
      if (detectedTriggers.length > 0) {
        const primaryTrigger = detectedTriggers[0];
        
        // Only provide coping strategies for medium and high risk triggers
        if (primaryTrigger.intensity === 'medium' || primaryTrigger.intensity === 'high') {
          const copingStrategies = getCopingStrategies(primaryTrigger.category);
          const copingMessage = {
            id: Date.now() + 2,
            sender: 'bot',
            text: `I notice you might be experiencing some ${primaryTrigger.intensity} risk triggers related to ${primaryTrigger.categoryName}. Here are some coping strategies that might help:\n\n${copingStrategies.join('\n\n')}`,
            isCopingMessage: true,
            triggerInfo: primaryTrigger
          };
          setMessages(prev => [...prev, copingMessage]);
        }
      }

      // Update patient summary with new insights (only if not in fallback mode)
      if (currentSession && !currentSession.id.startsWith('temp-session-')) {
        console.log('📝 Updating patient summary...');
        try {
          await updatePatientSummary();
        } catch (error) {
          console.error('❌ Failed to update patient summary:', error);
        }

        // Update daily progress
        console.log('📊 Updating daily progress...');
        try {
          await updateDailyProgress();
        } catch (error) {
          console.error('❌ Failed to update daily progress:', error);
        }
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      console.log('✅ Message handling complete');
    }
  };

  const updatePatientSummary = async () => {
    if (!user || !currentSession) return;

    try {
      // Generate summary from recent conversation
      const recentMessages = messages.slice(-10); // Last 10 messages
      const summaryPrompt = `Based on this recent conversation, provide a brief update to the patient's recovery summary. Focus on any new insights about their triggers, coping mechanisms, or progress.`;
      
      const summaryResponse = await sendMessage([
        { sender: 'bot', text: summaryPrompt },
        ...recentMessages
      ]);

      // Update patient profile
      await dbService.updatePatientSummary(user.id, summaryResponse);
      
    } catch (error) {
      console.error('Error updating patient summary:', error);
    }
  };

  const updateDailyProgress = async () => {
    if (!user) return;

    try {
      const progressData = {
        conversations_count: 1,
        triggers_detected: sessionTriggers.length,
        high_risk_triggers: sessionTriggers.filter(t => t.triggerIntensity === 'high').length,
        coping_strategies_used: sessionTriggers.filter(t => t.triggerIntensity === 'medium' || t.triggerIntensity === 'high').length
      };

      await dbService.updateDailyProgress(user.id, progressData);
    } catch (error) {
      console.error('Error updating daily progress:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = async () => {
    if (!currentSession) return;

    try {
      // End current session
      await dbService.endSession(currentSession.id, 'Session cleared by user');
      
      // Create new session
      const newSession = await dbService.createSession(user.id, patientProfile.id);
      setCurrentSession(newSession);
      
      // Reset messages
      const welcomeMessage = {
        id: Date.now(),
        sender: 'bot',
        text: `Hello! I'm here to support you in your recovery journey. How are you feeling today? Remember, this is a safe space to share your thoughts and feelings.`
      };
      setMessages([welcomeMessage]);
      setSessionTriggers([]);
      
      // Save welcome message
      await dbService.saveMessage(newSession.id, user.id, 'bot', welcomeMessage.text);
      
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  const getTriggerSummaryForMessage = (messageId) => {
    // Show trigger summary every 5 messages or when coping strategies are provided
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0 && (messageIndex % 5 === 0 || messages[messageIndex]?.isCopingMessage)) {
      return sessionTriggers.map(trigger => ({
        category: trigger.category,
        categoryName: trigger.categoryName,
        intensity: trigger.intensity,
        confidence: trigger.confidence
      }));
    }
    return null;
  };

  const getTriggerAlertForMessage = (message) => {
    // This is now handled by the Claude analysis, but keep for backward compatibility
    if (message.triggerInfo) {
      return {
        categoryName: message.triggerInfo.categoryName,
        intensity: message.triggerInfo.intensity,
        reasoning: message.triggerInfo.reasoning
      };
    }
    return null;
  };

  if (!user || !patientProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          <h2>Recovery Support</h2>
          <p>Welcome back! You're in {patientProfile.recovery_stage} recovery stage.</p>
        </div>
        <div className="session-info">
          {currentSession && (
            <span>Session: {currentSession.id.slice(0, 8)}...</span>
          )}
        </div>
      </div>

      <div className="messages">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            triggerAlert={getTriggerAlertForMessage(message)}
            triggerSummary={getTriggerSummaryForMessage(message.id)}
          />
        ))}
        
        {isLoading && (
          <div className="message bot">
            <div className="message-avatar">T</div>
            <div className="message-content">
              <div className="loading">
                Analyzing
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share your thoughts and feelings..."
          disabled={isLoading}
          rows={1}
        />
        <button 
          onClick={handleSendMessage} 
          disabled={isLoading || !inputMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </div>

      <div className="controls">
        <button onClick={clearConversation} className="clear-button">
          Clear Conversation
        </button>
      </div>
    </div>
  );
};

export default ChatInterface; 