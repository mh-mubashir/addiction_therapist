const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Claude API proxy endpoints
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: messages.find(m => m.role === 'system')?.content || '',
        messages: messages.filter(m => m.role !== 'system')
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    res.json({ response: data.content[0].text });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/analyze-triggers', async (req, res) => {
  try {
    const { userMessage, conversationHistory } = req.body;
    
    const analysisPrompt = `You are a specialized relapse risk assessment system for addiction recovery. Analyze the user's message for behaviors, situations, or thought patterns that indicate movement toward relapse and provide a structured response.

**Relapse Risk Categories to Detect:**
1. **celebratory** - Using substances to celebrate achievements, success-based reward patterns
2. **environmental** - Going to places associated with previous use, exposure to substances/triggers
3. **social** - Peer pressure, toxic relationships, social situations that encourage use
4. **emotional** - Using substances to cope with negative emotions (stress, anxiety, depression)
5. **cognitive** - Defeatist thinking, "just once won't hurt", giving up on recovery
6. **physiological** - HALT states (Hungry, Angry, Lonely, Tired) leading to substance use

**Risk Assessment Guidelines:**
- Focus on ACTUAL relapse risk, not just emotional intensity
- Consider the user's recovery progress and coping mechanisms
- Look for behaviors/situations that directly increase relapse probability
- Assess risk based on proximity to substance use, not just emotional state
- Handle negation properly (e.g., "I don't feel lonely anymore")
- Consider temporal context (past vs present vs future)

**Risk Intensity Levels:**
- **high (80-100%)**: Direct relapse risk - user is actively considering, planning, or in immediate danger of using
- **medium (40-79%)**: Elevated risk - user is in triggering situations or showing concerning patterns
- **low (10-39%)**: Mild risk - user mentions triggers but shows awareness and coping strategies
- **minimal (0-9%)**: Very low risk - user shows good recovery progress and coping

**Response Format:**
Return ONLY a valid JSON object with this exact structure:

{
  "triggerDetected": boolean,
  "triggerCategory": "celebratory|environmental|social|emotional|cognitive|physiological|null",
  "triggerIntensity": "minimal|low|medium|high|null",
  "confidence": "low|medium|high",
  "reasoning": "Brief explanation of relapse risk assessment",
  "nextAction": "question|support|continue",
  "suggestedQuestion": "Specific risk assessment question to ask (if nextAction is 'question')",
  "supportMessage": "Brief supportive response (if nextAction is 'support')",
  "contextNotes": "Any relevant context about recovery progress, coping mechanisms, etc."
}

**Examples:**
- User: "I just got promoted and I'm feeling amazing!" → NO trigger (positive feelings don't equal relapse risk)
- User: "I got promoted, I deserve to celebrate with a drink" → celebratory trigger, medium intensity (planning substance use)
- User: "I'm going to that old bar tonight" → environmental trigger, high intensity (going to using location)
- User: "I used to get triggered by parties, but now I'm okay" → NO trigger (past tense, recovery progress)
- User: "I'm stressed but I know I won't relapse" → NO trigger (shows awareness and coping)
- User: "I'm so stressed, I need something to take the edge off" → emotional trigger, medium intensity (seeking substance relief)
- User: "I can't handle this anymore, I'm going to relapse" → cognitive trigger, high intensity (explicit relapse intention)

**Important:** Only return the JSON object, no additional text or formatting. Focus on ACTUAL relapse risk, not just emotional states.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: analysisPrompt,
        messages: [
          { role: 'user', content: `User message: "${userMessage}"\n\nConversation history: ${JSON.stringify(conversationHistory)}` }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Claude API error' });
    }

    const data = await response.json();
    res.json({ analysis: data.content[0].text });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Session management endpoints
app.post('/api/session/create', (req, res) => {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  res.json({ sessionId });
});

app.get('/api/session/:sessionId/status', (req, res) => {
  // Simple session validation
  res.json({ isExpired: false, sessionId: req.params.sessionId });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`🔑 Claude API Key: ${process.env.VITE_CLAUDE_API_KEY ? '✅ Set' : '❌ Missing'}`);
}); 