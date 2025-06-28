const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Session management
const sessions = new Map();
const SESSION_TIMEOUT = 2 * 60 * 1000; // 30 minutes in milliseconds

// Clean up expired sessions
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(sessionId);
      console.log(`🗑️ Cleaned up expired session: ${sessionId}`);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

// Get or create session
function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      questionTracker: {
        askedQuestions: new Set(),
        answeredQuestions: new Set(),
        currentCategory: null,
        categoryOrder: ['celebratory', 'environmental', 'social', 'emotional', 'cognitive', 'physiological']
      },
      lastActivity: Date.now()
    });
    console.log(`🆕 Created new session: ${sessionId}`);
  } else {
    // Update last activity
    sessions.get(sessionId).lastActivity = Date.now();
  }
  return sessions.get(sessionId);
}

// Check if API key is loaded
const apiKeyLoaded = !!process.env.CLAUDE_API_KEY;
console.log('🔑 API Key loaded:', apiKeyLoaded ? 'Yes' : 'No');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    apiKeyLoaded,
    activeSessions: sessions.size,
    uptime: process.uptime()
  });
});

// Session management endpoints
app.post('/api/session/create', (req, res) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  getSession(sessionId);
  res.json({ sessionId });
});

app.get('/api/session/:sessionId/status', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const timeSinceActivity = Date.now() - session.lastActivity;
  const isExpired = timeSinceActivity > SESSION_TIMEOUT;
  
  res.json({
    sessionId,
    isExpired,
    timeSinceActivity,
    timeRemaining: Math.max(0, SESSION_TIMEOUT - timeSinceActivity),
    questionTracker: {
      askedQuestions: Array.from(session.questionTracker.askedQuestions),
      answeredQuestions: Array.from(session.questionTracker.answeredQuestions),
      currentCategory: session.questionTracker.currentCategory
    }
  });
});

app.delete('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    console.log(`🗑️ Manually deleted session: ${sessionId}`);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Chat endpoint with session management
app.post('/api/chat', async (req, res) => {
  const { messages, sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  const session = getSession(sessionId);
  
  console.log('📨 Received chat request:', { 
    sessionId,
    messageCount: messages.length, 
    hasSystem: messages.some(m => m.role === 'system'),
    apiKeyPresent: !!process.env.CLAUDE_API_KEY,
    activeSessions: sessions.size
  });

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(500).json({ 
      error: 'Claude API key not configured. Please set CLAUDE_API_KEY in your .env file.' 
    });
  }

  try {
    // Enhanced system prompt with active questioning and shorter responses
    const systemPrompt = `You are a supportive addiction recovery therapist. Your role is to:

1. **Provide brief, empathetic responses** (keep responses under 100 words)
2. **Actively ask trigger assessment questions** from the provided categories
3. **Guide the conversation naturally** while gathering information about potential relapse triggers

**Trigger Categories to Assess:**
- Celebratory/Positive triggers (success, achievement, celebration)
- Environmental triggers (locations, visual cues, time of day)
- Social triggers (peer pressure, relationships, social situations)
- Emotional triggers (stress, anxiety, depression, anger)
- Cognitive triggers (negative thoughts, self-doubt, perfectionism)
- Physiological triggers (HALT: Hungry, Angry, Lonely, Tired)

**Questioning Strategy:**
- Ask 1-2 specific trigger questions per response
- Use questions like "Do you ever feel triggered when..." or "How do you handle..."
- Listen for trigger indicators in their responses
- Provide brief coping strategies when triggers are identified

**Response Guidelines:**
- Keep responses concise and supportive
- Ask follow-up questions to understand their triggers better
- Offer brief, practical coping strategies
- Maintain a warm, non-judgmental tone
- Focus on their recovery journey and strengths

Remember: You're here to support their recovery, not just detect triggers. Build trust and provide helpful guidance.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 150, // Limit response length
      system: systemPrompt, // Pass system prompt as separate parameter
      messages: messages, // Only pass user/assistant messages
      temperature: 0.7,
    });

    console.log('✅ Claude API response received');
    res.json({ 
      response: response.content[0].text,
      sessionId,
      timeRemaining: Math.max(0, SESSION_TIMEOUT - (Date.now() - session.lastActivity))
    });

  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    res.status(500).json({ 
      error: 'Failed to get response from Claude API',
      details: error.message 
    });
  }
});

// Question tracker endpoints
app.get('/api/session/:sessionId/questions/next', (req, res) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);
  
  // Import trigger categories
  const { triggerCategories } = require('./src/data/triggerQuestions.js');
  
  // Find the next question to ask
  let nextQuestion = null;
  for (const categoryKey of session.questionTracker.categoryOrder) {
    const category = triggerCategories[categoryKey];
    const categoryQuestions = category.questions.map(q => q.id);
    const askedInCategory = categoryQuestions.filter(qId => session.questionTracker.askedQuestions.has(qId));
    
    if (askedInCategory.length < categoryQuestions.length) {
      for (const question of category.questions) {
        if (!session.questionTracker.askedQuestions.has(question.id)) {
          session.questionTracker.currentCategory = categoryKey;
          session.questionTracker.askedQuestions.add(question.id);
          nextQuestion = {
            ...question,
            category: categoryKey,
            categoryName: category.name
          };
          break;
        }
      }
      if (nextQuestion) break;
    }
  }
  
  res.json({ 
    nextQuestion,
    sessionId,
    timeRemaining: Math.max(0, SESSION_TIMEOUT - (Date.now() - session.lastActivity))
  });
});

app.post('/api/session/:sessionId/questions/evaluate', (req, res) => {
  const { sessionId } = req.params;
  const { userResponse, question } = req.body;
  
  const session = getSession(sessionId);
  
  // Evaluate response logic here
  const evaluation = evaluateResponse(userResponse, question);
  
  if (evaluation.triggered !== null) {
    session.questionTracker.answeredQuestions.add(question.id);
  }
  
  res.json({ 
    evaluation,
    sessionId,
    timeRemaining: Math.max(0, SESSION_TIMEOUT - (Date.now() - session.lastActivity))
  });
});

// Helper function to evaluate responses
function evaluateResponse(userResponse, question) {
  const response = userResponse.toLowerCase();
  
  // Check against yes indicators (suggests triggering)
  const yesMatches = question.yesIndicators.filter(indicator => 
    response.includes(indicator.toLowerCase())
  );
  
  // Check against no indicators (suggests not triggering)
  const noMatches = question.noIndicators.filter(indicator =>
    response.includes(indicator.toLowerCase())
  );
  
  // Calculate confidence and determine result
  const yesScore = yesMatches.length;
  const noScore = noMatches.length;
  
  let result = null;
  let confidence = 'low';
  let reasoning = '';
  
  if (yesScore >= 2 && noScore === 0) {
    result = true;
    confidence = 'high';
    reasoning = `Multiple trigger indicators found: ${yesMatches.join(', ')}`;
  } else if (yesScore >= 1 && noScore === 0) {
    result = true;
    confidence = 'medium';
    reasoning = `Trigger indicator found: ${yesMatches.join(', ')}`;
  } else if (noScore >= 1 && yesScore === 0) {
    result = false;
    confidence = 'high';
    reasoning = `No trigger indicators found`;
  } else if (yesScore > 0 && noScore > 0) {
    result = null;
    confidence = 'low';
    reasoning = 'Mixed indicators - unclear response';
  } else {
    result = null;
    confidence = 'low';
    reasoning = 'No clear indicators found';
  }
  
  return {
    triggered: result,
    category: question.category,
    categoryName: question.categoryName,
    questionId: question.id,
    question: question.question,
    confidence,
    reasoning,
    yesMatches,
    noMatches
  };
}

app.listen(port, () => {
  console.log(`🚀 Therapist API server running on port ${port}`);
  console.log('📝 Make sure to set your CLAUDE_API_KEY in the .env file');
  console.log(`⏰ Session timeout: ${SESSION_TIMEOUT / 1000 / 60} minutes`);
}); 