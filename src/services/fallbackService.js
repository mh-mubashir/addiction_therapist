// Fallback responses for when Claude AI is unavailable
const FALLBACK_RESPONSES = {
  // General support responses
  general: [
    "I'm here to support you in your recovery journey. Remember, you're not alone in this.",
    "Recovery is a process, and every day you choose to stay sober is a victory.",
    "It's okay to have difficult days. What matters is that you keep moving forward.",
    "You've shown incredible strength in your recovery journey so far."
  ],

  // Trigger/craving responses
  triggers: [
    "When you feel triggered, try the 5-4-3-2-1 grounding technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
    "Remember your coping strategies: deep breathing, calling a friend, going for a walk, or engaging in a hobby.",
    "Cravings typically last 15-20 minutes. Try to distract yourself during this time.",
    "Think about your reasons for staying sober and how far you've come."
  ],

  // Crisis responses
  crisis: [
    "If you're in immediate crisis, please call the National Drug Addiction Helpline at 1-844-289-0879.",
    "You can also text HOME to 741741 to reach the Crisis Text Line.",
    "Remember, it's okay to ask for help. You don't have to face this alone.",
    "Your life has value, and there are people who care about you and want to help."
  ],

  // Encouragement responses
  encouragement: [
    "You're doing amazing work in your recovery. Every sober day is a step forward.",
    "Your strength inspires others. Keep going, one day at a time.",
    "Recovery isn't linear, and that's okay. What matters is that you keep trying.",
    "You have the power to change your life, and you're proving that every day."
  ],

  // Relapse prevention
  relapse_prevention: [
    "If you're thinking about using, pause and ask yourself: 'What am I really feeling right now?'",
    "Remember your relapse prevention plan. What strategies have worked for you in the past?",
    "Reach out to your support network before making any decisions.",
    "Think about the consequences of using versus the benefits of staying sober."
  ]
};

// Coping strategies database
const COPING_STRATEGIES = {
  immediate: [
    "Deep breathing exercises",
    "Call a sober friend or sponsor",
    "Go for a walk or exercise",
    "Listen to music",
    "Write in a journal",
    "Take a cold shower",
    "Practice mindfulness meditation"
  ],
  
  long_term: [
    "Attend support group meetings",
    "Find a hobby or creative outlet",
    "Build a daily routine",
    "Practice stress management techniques",
    "Develop healthy relationships",
    "Set and work toward goals"
  ]
};

// Emergency resources
const EMERGENCY_RESOURCES = {
  hotlines: [
    { name: "National Drug Addiction Helpline", number: "1-844-289-0879" },
    { name: "Crisis Text Line", text: "HOME to 741741" },
    { name: "SAMHSA National Helpline", number: "1-800-662-HELP (4357)" }
  ],
  
  websites: [
    { name: "SAMHSA", url: "https://www.samhsa.gov" },
    { name: "NA (Narcotics Anonymous)", url: "https://www.na.org" },
    { name: "AA (Alcoholics Anonymous)", url: "https://www.aa.org" }
  ]
};

// Analyze user message to determine appropriate fallback response
export function analyzeUserMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  // Check for crisis indicators
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || 
      lowerMessage.includes('end it all') || lowerMessage.includes('give up')) {
    return { type: 'crisis', priority: 'high' };
  }
  
  // Check for trigger/craving indicators
  if (lowerMessage.includes('trigger') || lowerMessage.includes('craving') || 
      lowerMessage.includes('want to use') || lowerMessage.includes('urge') ||
      lowerMessage.includes('tempted')) {
    return { type: 'triggers', priority: 'high' };
  }
  
  // Check for relapse indicators
  if (lowerMessage.includes('relapse') || lowerMessage.includes('used') || 
      lowerMessage.includes('slipped') || lowerMessage.includes('fell off')) {
    return { type: 'relapse_prevention', priority: 'medium' };
  }
  
  // Check for general distress
  if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || 
      lowerMessage.includes('anxious') || lowerMessage.includes('stressed')) {
    return { type: 'encouragement', priority: 'medium' };
  }
  
  // Default to general support
  return { type: 'general', priority: 'low' };
}

// Get appropriate fallback response
export function getFallbackResponse(userMessage) {
  const analysis = analyzeUserMessage(userMessage);
  const responses = FALLBACK_RESPONSES[analysis.type];
  
  // Get random response from appropriate category
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  // Add coping strategies for high-priority messages
  let additionalHelp = '';
  if (analysis.priority === 'high') {
    const immediateStrategies = COPING_STRATEGIES.immediate.slice(0, 3);
    additionalHelp = `\n\nTry these coping strategies: ${immediateStrategies.join(', ')}.`;
  }
  
  return {
    text: randomResponse + additionalHelp,
    type: analysis.type,
    priority: analysis.priority,
    isFallback: true
  };
}

// Get emergency resources
export function getEmergencyResources() {
  return EMERGENCY_RESOURCES;
}

// Get coping strategies
export function getCopingStrategies() {
  return COPING_STRATEGIES;
}

// Check if message needs immediate attention
export function needsImmediateAttention(message) {
  const analysis = analyzeUserMessage(message);
  return analysis.priority === 'high';
} 