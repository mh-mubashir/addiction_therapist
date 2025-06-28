import { triggerCategories } from '../data/triggerQuestions.js';

// Track which questions have been asked and answered
let questionTracker = {
  askedQuestions: new Set(),
  answeredQuestions: new Set(),
  currentCategory: null,
  categoryOrder: ['celebratory', 'environmental', 'social', 'emotional', 'cognitive', 'physiological']
};

// Reset question tracker
export function resetQuestionTracker() {
  questionTracker = {
    askedQuestions: new Set(),
    answeredQuestions: new Set(),
    currentCategory: null,
    categoryOrder: ['celebratory', 'environmental', 'social', 'emotional', 'cognitive', 'physiological']
  };
}

// Get next question to ask
export function getNextQuestion() {
  // Find the next category that hasn't been fully explored
  for (const categoryKey of questionTracker.categoryOrder) {
    const category = triggerCategories[categoryKey];
    const categoryQuestions = category.questions.map(q => q.id);
    const askedInCategory = categoryQuestions.filter(qId => questionTracker.askedQuestions.has(qId));
    
    if (askedInCategory.length < categoryQuestions.length) {
      // Find the first unasked question in this category
      for (const question of category.questions) {
        if (!questionTracker.askedQuestions.has(question.id)) {
          questionTracker.currentCategory = categoryKey;
          questionTracker.askedQuestions.add(question.id);
          return {
            ...question,
            category: categoryKey,
            categoryName: category.name
          };
        }
      }
    }
  }
  
  return null; // All questions have been asked
}

// Evaluate response to a specific question
export function evaluateResponse(userResponse, question) {
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
  
  // Mark question as answered if we got a clear result
  if (result !== null) {
    questionTracker.answeredQuestions.add(question.id);
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

// Legacy function for backward compatibility
export function detectTriggersInMessage(userMessage) {
  const detectedTriggers = [];
  const message = userMessage.toLowerCase();
  
  // Skip trigger detection for very short or basic messages
  if (message.length < 10 || isBasicResponse(message)) {
    console.log('✅ Skipping trigger detection for basic response:', userMessage);
    return detectedTriggers;
  }
  
  // Check each trigger category
  Object.entries(triggerCategories).forEach(([categoryKey, category]) => {
    category.questions.forEach(question => {
      const analysis = analyzeResponse(userMessage, {
        ...question,
        category: categoryKey
      });
      
      // Only add triggers with medium or high confidence
      if (analysis.triggered === true && analysis.confidence !== 'low') {
        detectedTriggers.push({
          category: categoryKey,
          categoryName: category.name,
          questionId: question.id,
          question: question.question,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning
        });
      }
    });
  });
  
  // Limit to maximum 2 triggers per message to avoid overwhelming
  return detectedTriggers.slice(0, 2);
}

// Improved keyword-based trigger detection with better context awareness
export function analyzeResponse(userMessage, currentQuestion) {
  const message = userMessage.toLowerCase();
  
  // Skip very basic responses
  if (message.length < 10 || isBasicResponse(message)) {
    return { triggered: false, category: currentQuestion.category, confidence: 'low', reasoning: 'Basic response' };
  }
  
  // Check against yes indicators (suggests triggering)
  const yesMatches = currentQuestion.yesIndicators.filter(indicator => 
    message.includes(indicator.toLowerCase())
  );
  
  // Check against no indicators (suggests not triggering)  
  const noMatches = currentQuestion.noIndicators.filter(indicator =>
    message.includes(indicator.toLowerCase())
  );
  
  // Calculate confidence score based on multiple factors
  const yesScore = yesMatches.length;
  const noScore = noMatches.length;
  
  // Require stronger evidence for trigger detection
  if (yesScore >= 2 && noScore === 0) {
    return { 
      triggered: true, 
      category: currentQuestion.category, 
      confidence: 'high',
      reasoning: `Multiple trigger indicators found: ${yesMatches.join(', ')}`
    };
  } else if (yesScore >= 1 && noScore === 0) {
    return { 
      triggered: true, 
      category: currentQuestion.category, 
      confidence: 'medium',
      reasoning: `Trigger indicator found: ${yesMatches.join(', ')}`
    };
  } else if (noScore >= 1 && yesScore === 0) {
    return { 
      triggered: false, 
      category: currentQuestion.category, 
      confidence: 'high',
      reasoning: `No trigger indicators found`
    };
  } else {
    return { 
      triggered: null, 
      category: currentQuestion.category, 
      confidence: 'low',
      reasoning: 'Unclear - mixed indicators'
    };
  }
}

// Helper function to identify basic responses that shouldn't trigger detection
function isBasicResponse(message) {
  const basicResponses = [
    'good', 'fine', 'ok', 'okay', 'great', 'awesome', 'excellent',
    'bad', 'terrible', 'awful', 'horrible',
    'yes', 'no', 'maybe', 'sure', 'alright',
    'i am good', 'i am fine', 'i am ok', 'i am okay',
    'feeling good', 'feeling fine', 'feeling ok',
    'doing good', 'doing fine', 'doing ok',
    'i feel good', 'i feel fine', 'i feel ok'
  ];
  
  return basicResponses.some(response => 
    message.includes(response) && message.length < 50
  );
}

export function getTriggerSummary(triggerAssessments) {
  const summary = {};
  
  triggerAssessments.forEach(assessment => {
    if (!summary[assessment.category]) {
      summary[assessment.category] = {
        name: assessment.categoryName,
        count: 0,
        confidence: []
      };
    }
    summary[assessment.category].count++;
    summary[assessment.category].confidence.push(assessment.confidence);
  });
  
  return Object.values(summary).map(category => ({
    ...category,
    riskLevel: category.count >= 3 ? 'high' : category.count >= 2 ? 'medium' : 'low'
  }));
}

export function getCopingStrategies(triggerCategory) {
  const strategies = {
    celebratory: [
      "Try celebrating with healthy activities like exercise, meditation, or spending time with loved ones",
      "Create a list of non-substance rewards you can give yourself for achievements",
      "Practice gratitude and acknowledge your success without needing external substances"
    ],
    environmental: [
      "Avoid places where you used to use substances",
      "Create new, positive associations with triggering locations",
      "Have an exit plan when you encounter triggering environments"
    ],
    social: [
      "Surround yourself with supportive, sober friends",
      "Practice saying 'no' to peer pressure",
      "Have a trusted person you can call when feeling pressured"
    ],
    emotional: [
      "Practice deep breathing and mindfulness techniques",
      "Talk to a therapist or support group about your emotions",
      "Use healthy coping mechanisms like exercise, journaling, or creative activities"
    ],
    cognitive: [
      "Challenge negative thoughts with positive affirmations",
      "Focus on the present moment rather than dwelling on the past",
      "Practice cognitive behavioral therapy techniques"
    ],
    physiological: [
      "Address HALT states: eat when hungry, rest when tired, connect when lonely, process anger healthily",
      "Maintain a regular sleep schedule and healthy eating habits",
      "Practice stress-reduction techniques like yoga or meditation"
    ]
  };
  
  return strategies[triggerCategory] || [
    "Remember your reasons for recovery",
    "Reach out to your support network",
    "Use healthy coping strategies you've learned"
  ];
} 