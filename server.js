const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Check if API key is loaded
const apiKeyLoaded = !!process.env.CLAUDE_API_KEY;
console.log('🔑 API Key loaded:', apiKeyLoaded ? 'Yes' : 'No');

// Claude API proxy endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  
  console.log('📨 Received chat request:', { 
    messageCount: messages.length, 
    hasSystem: messages.some(m => m.role === 'system'),
    apiKeyPresent: !!process.env.CLAUDE_API_KEY
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
    res.json({ response: response.content[0].text });

  } catch (error) {
    console.error('❌ Error calling Claude API:', error);
    res.status(500).json({ 
      error: 'Failed to get response from Claude API',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Therapist API is running',
    apiKeyConfigured: !!process.env.CLAUDE_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Therapist API server running on port ${PORT}`);
  console.log(`📝 Make sure to set your CLAUDE_API_KEY in the .env file`);
}); 