import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import { sendMessage, formatMessages } from '../services/claudeAPI.js';
import { 
  detectTriggersInMessage, 
  getTriggerSummary, 
  getCopingStrategies,
  getNextQuestion,
  evaluateResponse,
  resetQuestionTracker
} from '../services/triggerDetection.js';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triggerAssessments, setTriggerAssessments] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionMode, setQuestionMode] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversation from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('therapist-chat');
    const savedAssessments = localStorage.getItem('trigger-assessments');
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Add welcome message
      setMessages([{
        id: Date.now(),
        sender: 'bot',
        text: "Hello! I'm here to support you in your recovery journey. How are you feeling today? Remember, this is a safe space to share your thoughts and feelings."
      }]);
    }
    
    if (savedAssessments) {
      setTriggerAssessments(JSON.parse(savedAssessments));
    }
    
    // Reset question tracker for new sessions
    resetQuestionTracker();
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('therapist-chat', JSON.stringify(messages));
  }, [messages]);

  // Save trigger assessments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('trigger-assessments', JSON.stringify(triggerAssessments));
  }, [triggerAssessments]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if we should ask a trigger question
  const shouldAskTriggerQuestion = () => {
    // Ask trigger questions every 3-4 messages
    const messageCount = messages.filter(m => m.sender === 'user').length;
    return messageCount > 0 && messageCount % 3 === 0 && !questionMode;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage.trim()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let botResponse = '';
      let detectedTriggers = [];

      // If we're in question mode, evaluate the response to the current question
      if (questionMode && currentQuestion) {
        const evaluation = evaluateResponse(userMessage.text, currentQuestion);
        
        if (evaluation.triggered !== null) {
          detectedTriggers.push(evaluation);
          setTriggerAssessments(prev => [...prev, evaluation]);
          
          // Provide feedback based on the evaluation
          if (evaluation.triggered) {
            const copingStrategies = getCopingStrategies(evaluation.category);
            botResponse = `I understand that ${evaluation.categoryName} situations can be challenging. Here are some strategies that might help:\n\n${copingStrategies.join('\n\n')}\n\nHow are you feeling about this?`;
          } else {
            botResponse = `That's great! It sounds like you're handling ${evaluation.categoryName} situations well. What other areas of your recovery would you like to discuss?`;
          }
        } else {
          botResponse = "I'd like to understand better. Could you tell me more about how you feel in those situations?";
        }
        
        setQuestionMode(false);
        setCurrentQuestion(null);
      } else {
        // Regular conversation mode
        const conversationHistory = [...messages, userMessage];
        const formattedMessages = formatMessages(conversationHistory);
        botResponse = await sendMessage(formattedMessages);

        // Check if we should ask a trigger question
        if (shouldAskTriggerQuestion()) {
          const nextQuestion = getNextQuestion();
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            setQuestionMode(true);
            botResponse += `\n\nI'd like to understand your triggers better. ${nextQuestion.question}`;
          }
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse
      };

      // Add bot message to chat
      setMessages(prev => [...prev, botMessage]);

      // If triggers were detected and we're not in question mode, add coping strategies
      if (detectedTriggers.length > 0 && !questionMode) {
        const primaryTrigger = detectedTriggers[0];
        const copingStrategies = getCopingStrategies(primaryTrigger.category);
        const copingMessage = {
          id: Date.now() + 2,
          sender: 'bot',
          text: `I notice you might be experiencing some triggers related to ${primaryTrigger.categoryName}. Here are some coping strategies that might help:\n\n${copingStrategies.join('\n\n')}`,
          isCopingMessage: true
        };
        setMessages(prev => [...prev, copingMessage]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: Date.now(),
      sender: 'bot',
      text: "Hello! I'm here to support you in your recovery journey. How are you feeling today? Remember, this is a safe space to share your thoughts and feelings."
    }]);
    setTriggerAssessments([]);
    setQuestionMode(false);
    setCurrentQuestion(null);
    resetQuestionTracker();
    localStorage.removeItem('therapist-chat');
    localStorage.removeItem('trigger-assessments');
  };

  const getTriggerSummaryForMessage = (messageId) => {
    // Show trigger summary every 5 messages or when coping strategies are provided
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0 && (messageIndex % 5 === 0 || messages[messageIndex]?.isCopingMessage)) {
      return getTriggerSummary(triggerAssessments);
    }
    return null;
  };

  const getTriggerAlertForMessage = (message) => {
    if (message.sender === 'user') {
      const detectedTriggers = detectTriggersInMessage(message.text);
      if (detectedTriggers.length > 0) {
        const primaryTrigger = detectedTriggers[0];
        const copingStrategies = getCopingStrategies(primaryTrigger.category);
        return {
          categoryName: primaryTrigger.categoryName,
          copingStrategy: copingStrategies[0],
          reasoning: primaryTrigger.reasoning
        };
      }
    }
    return null;
  };

  return (
    <div className="chat-container">
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
                Thinking
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
        <input
          type="text"
          className="input-field"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={questionMode ? "Answer the question above..." : "Type your message here..."}
          disabled={isLoading}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          ➤
        </button>
      </div>

      <div className="controls">
        <button className="control-button" onClick={clearConversation}>
          Clear Conversation
        </button>
      </div>
    </div>
  );
};

export default ChatInterface; 