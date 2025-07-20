const SYSTEM_PROMPT = `You are a compassionate addiction recovery therapist chatbot. Your role is to:

1. Provide supportive conversation for someone recovering from drug addiction
2. Focus on building rapport and understanding their recovery journey
3. Only assess potential relapse triggers when there are clear, specific indicators in the conversation
4. Use these 6 trigger categories to evaluate risk (but don't actively look for them):
   - Celebratory/Positive: Success-based reward patterns
   - Environmental: Location and situational triggers
   - Social: Peer pressure and social dynamics  
   - Emotional: Stress, anxiety, depression responses
   - Cognitive: Thought patterns and mental associations
   - Physiological: HALT states (Hungry, Angry, Lonely, Tired)

Guidelines:
- Be warm, empathetic, and non-judgmental
- Focus on the person's overall well-being and recovery progress
- Don't interrogate or actively search for triggers - let them emerge naturally
- Only address triggers when the person explicitly mentions concerning patterns
- Keep responses conversational and supportive
- Ask follow-up questions about their recovery journey, goals, and challenges
- Celebrate their progress and acknowledge their strength
- Keep responses concise (under 200 words)
- Always be encouraging and focus on recovery progress

Remember: Your primary goal is to be a supportive companion in their recovery journey, not a trigger detector. Only address potential triggers when they are clearly and specifically mentioned by the person.`;

// Use local proxy server to avoid CORS issues
const API_BASE_URL = 'http://localhost:3001';

// Session management (simplified - no local server needed)
let currentSessionId = null;

export async function createSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const data = await response.json();
    currentSessionId = data.sessionId;
    localStorage.setItem('therapist-session-id', currentSessionId);
    return currentSessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function getSessionStatus(sessionId = currentSessionId) {
  if (!sessionId) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/status`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // Session expired, create new one
        return await createSession();
      }
      throw new Error('Failed to get session status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting session status:', error);
    throw error;
  }
}

export async function sendMessage(messages) {
  try {
    // Ensure we have a session ID
    if (!currentSessionId) {
      await createSession();
    }

    // Format messages for Claude API
    const formattedMessages = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text || msg.content
    }));

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...formattedMessages
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function analyzeMessageForTriggers(userMessage, conversationHistory = []) {
  try {
    // Ensure we have a session ID
    if (!currentSessionId) {
      await createSession();
    }

    const response = await fetch(`${API_BASE_URL}/api/analyze-triggers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userMessage,
        conversationHistory: formatMessages(conversationHistory)
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze triggers');
    }

    const data = await response.json();
    
    // Parse the JSON response from Claude
    try {
      const analysis = JSON.parse(data.analysis);
      return {
        ...analysis,
        rawResponse: data.analysis // Keep original for debugging
      };
    } catch (parseError) {
      console.error('Failed to parse Claude analysis:', data.analysis);
      throw new Error('Invalid analysis response format');
    }

  } catch (error) {
    console.error('Error analyzing triggers:', error);
    throw error;
  }
}

export function formatMessages(messages) {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text || msg.content
  }));
}

export function getCurrentSessionId() {
  return currentSessionId;
}

export function clearSession() {
  currentSessionId = null;
  localStorage.removeItem('therapist-session-id');
} 