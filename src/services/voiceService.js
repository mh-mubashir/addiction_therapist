// Voice Service for AI Therapy Sessions
class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.onTranscript = null;
    this.onError = null;
    this.voice = null;
    
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  // Initialize Speech Recognition (Speech-to-Text)
  initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      // Configure recognition settings
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      // Set up event handlers
      this.recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        this.isListening = true;
      };
      
      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Call callback with results
        if (this.onTranscript) {
          this.onTranscript({
            final: finalTranscript,
            interim: interimTranscript,
            isFinal: finalTranscript.length > 0
          });
        }
      };
      
      this.recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        this.isListening = false;
        if (this.onError) {
          this.onError(event.error);
        }
      };
      
      this.recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        this.isListening = false;
      };
    } else {
      console.error('Speech recognition not supported');
    }
  }

  // Initialize Speech Synthesis (Text-to-Speech)
  initializeSpeechSynthesis() {
    // Wait for voices to load
    this.synthesis.onvoiceschanged = () => {
      const voices = this.synthesis.getVoices();
      
      // Find a good therapy voice (preferably female, calm)
      this.voice = voices.find(voice => 
        voice.lang === 'en-US' && 
        (voice.name.includes('Samantha') || 
         voice.name.includes('Karen') || 
         voice.name.includes('Alex'))
      ) || voices[0];
      
      console.log('🔊 Voice synthesis initialized with voice:', this.voice?.name);
    };
  }

  // Start listening for user speech
  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        return true;
      } catch (error) {
        console.error('Failed to start listening:', error);
        return false;
      }
    }
    return false;
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Speak AI response
  speak(text, options = {}) {
    if (this.isSpeaking) {
      this.synthesis.cancel(); // Stop current speech
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice settings
    utterance.voice = this.voice;
    utterance.rate = options.rate || 0.9; // Slightly slower for therapy
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.8;
    
    // Set up event handlers
    utterance.onstart = () => {
      console.log('🔊 Speaking:', text.substring(0, 50) + '...');
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      console.log('🔊 Finished speaking');
      this.isSpeaking = false;
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.isSpeaking = false;
    };
    
    this.synthesis.speak(utterance);
  }

  // Stop speaking
  stopSpeaking() {
    if (this.isSpeaking) {
      this.synthesis.cancel();
      this.isSpeaking = false;
    }
  }

  // Check if voice features are supported
  isSupported() {
    return !!(this.recognition && this.synthesis);
  }

  // Get current status
  getStatus() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isSupported: this.isSupported()
    };
  }

  // Set callbacks
  setCallbacks(onTranscript, onError) {
    this.onTranscript = onTranscript;
    this.onError = onError;
  }

  // Clean up
  destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.recognition = null;
    this.synthesis = null;
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Tone and emotion detection
export class ToneAnalyzer {
  constructor() {
    this.emotionKeywords = {
      sad: ['sad', 'depressed', 'hopeless', 'lonely', 'empty', 'worthless', 'tired', 'exhausted', 'down', 'blue'],
      angry: ['angry', 'furious', 'mad', 'frustrated', 'irritated', 'annoyed', 'upset', 'rage', 'hate', 'bitter'],
      anxious: ['anxious', 'worried', 'nervous', 'scared', 'afraid', 'panicked', 'stressed', 'overwhelmed', 'fearful'],
      happy: ['happy', 'excited', 'joyful', 'pleased', 'content', 'grateful', 'blessed', 'thrilled', 'elated'],
      calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'at ease', 'comfortable', 'centered'],
      confused: ['confused', 'lost', 'unsure', 'uncertain', 'doubtful', 'questioning', 'puzzled', 'bewildered']
    };
    
    this.voicePatterns = {
      slow: ['um', 'uh', 'well', 'like', 'you know', 'i mean'],
      fast: ['quickly', 'rapidly', 'urgently', 'immediately', 'now'],
      loud: ['shout', 'yell', 'scream', 'loud', 'forceful'],
      quiet: ['whisper', 'soft', 'quiet', 'gentle', 'barely']
    };
    
    this.conversationMemory = [];
  }

  // Analyze text for emotional tone
  analyzeTextTone(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    
    // Count emotion keywords
    const emotionScores = {};
    Object.keys(this.emotionKeywords).forEach(emotion => {
      emotionScores[emotion] = 0;
      this.emotionKeywords[emotion].forEach(keyword => {
        if (lowerText.includes(keyword)) {
          emotionScores[emotion]++;
        }
      });
    });
    
    // Analyze voice patterns
    const patternAnalysis = this.analyzeVoicePatterns(lowerText);
    
    // Determine primary emotion
    const primaryEmotion = this.getPrimaryEmotion(emotionScores);
    
    // Calculate intensity
    const intensity = this.calculateIntensity(emotionScores, patternAnalysis);
    
    return {
      primaryEmotion,
      intensity,
      emotionScores,
      patternAnalysis,
      confidence: this.calculateConfidence(emotionScores, patternAnalysis)
    };
  }

  // Analyze voice patterns in text
  analyzeVoicePatterns(text) {
    const patterns = {};
    
    Object.keys(this.voicePatterns).forEach(pattern => {
      patterns[pattern] = 0;
      this.voicePatterns[pattern].forEach(keyword => {
        if (text.includes(keyword)) {
          patterns[pattern]++;
        }
      });
    });
    
    return patterns;
  }

  // Get primary emotion from scores
  getPrimaryEmotion(emotionScores) {
    const emotions = Object.entries(emotionScores)
      .filter(([_, score]) => score > 0)
      .sort(([_, a], [__, b]) => b - a);
    
    if (emotions.length === 0) return 'neutral';
    return emotions[0][0];
  }

  // Calculate emotion intensity
  calculateIntensity(emotionScores, patternAnalysis) {
    const totalEmotionWords = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    const totalPatterns = Object.values(patternAnalysis).reduce((a, b) => a + b, 0);
    
    const score = totalEmotionWords + totalPatterns;
    
    if (score >= 5) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // Calculate confidence in analysis
  calculateConfidence(emotionScores, patternAnalysis) {
    const totalEmotionWords = Object.values(emotionScores).reduce((a, b) => a + b, 0);
    const totalPatterns = Object.values(patternAnalysis).reduce((a, b) => a + b, 0);
    
    const total = totalEmotionWords + totalPatterns;
    
    if (total >= 3) return 'high';
    if (total >= 1) return 'medium';
    return 'low';
  }

  // Add to conversation memory
  addToMemory(userMessage, toneAnalysis, aiResponse, sessionId = null, memoryEnabled = true) {
    if (!memoryEnabled) {
      console.log('🧠 Memory disabled for this session');
      return;
    }
    
    this.conversationMemory.push({
      timestamp: new Date(),
      userMessage,
      toneAnalysis,
      aiResponse,
      sessionId: sessionId || Date.now(),
      memoryEnabled: true
    });
    
    // Keep only last 20 interactions
    if (this.conversationMemory.length > 20) {
      this.conversationMemory.shift();
    }
    
    console.log('🧠 Added to permanent memory');
  }

  // Add to temporary memory (for current session only)
  addToTemporaryMemory(userMessage, toneAnalysis, aiResponse, sessionId) {
    this.temporaryMemory = this.temporaryMemory || [];
    
    this.temporaryMemory.push({
      timestamp: new Date(),
      userMessage,
      toneAnalysis,
      aiResponse,
      sessionId,
      memoryEnabled: false
    });
    
    console.log('🧠 Added to temporary memory (session only)');
  }

  // Get emotional trend from recent conversation (including temporary memory)
  getEmotionalTrend(includeTemporary = true) {
    let allMessages = [...this.conversationMemory];
    
    if (includeTemporary && this.temporaryMemory) {
      allMessages = [...allMessages, ...this.temporaryMemory];
    }
    
    if (allMessages.length < 3) return null;
    
    const recentMessages = allMessages.slice(-5);
    const emotions = recentMessages.map(msg => msg.toneAnalysis.primaryEmotion);
    
    // Count emotion frequencies
    const emotionCounts = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    // Find most common emotion
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([_, a], [__, b]) => b - a)[0];
    
    return {
      dominantEmotion: dominantEmotion[0],
      frequency: dominantEmotion[1],
      totalMessages: emotions.length
    };
  }

  // Clear temporary memory (end of session)
  clearTemporaryMemory() {
    this.temporaryMemory = [];
    console.log('🧠 Temporary memory cleared');
  }

  // Get memory status for a session
  getMemoryStatus(sessionId) {
    const permanentEntry = this.conversationMemory.find(msg => msg.sessionId === sessionId);
    const temporaryEntry = this.temporaryMemory?.find(msg => msg.sessionId === sessionId);
    
    if (permanentEntry) return 'permanent';
    if (temporaryEntry) return 'temporary';
    return 'none';
  }

  // Export memory data (for user download)
  exportMemoryData() {
    return {
      permanent: this.conversationMemory,
      temporary: this.temporaryMemory || [],
      summary: this.getConversationSummary(),
      exportDate: new Date().toISOString()
    };
  }

  // Import memory data (for user restore)
  importMemoryData(data) {
    if (data.permanent) {
      this.conversationMemory = data.permanent;
    }
    if (data.temporary) {
      this.temporaryMemory = data.temporary;
    }
    console.log('🧠 Memory data imported');
  }

  // Get emotional trend from recent conversation
  getEmotionalTrend() {
    if (this.conversationMemory.length < 3) return null;
    
    const recentMessages = this.conversationMemory.slice(-5);
    const emotions = recentMessages.map(msg => msg.toneAnalysis.primaryEmotion);
    
    // Count emotion frequencies
    const emotionCounts = {};
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    // Find most common emotion
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([_, a], [__, b]) => b - a)[0];
    
    return {
      dominantEmotion: dominantEmotion[0],
      frequency: dominantEmotion[1],
      totalMessages: emotions.length
    };
  }

  // Generate empathetic response based on tone
  generateToneResponse(toneAnalysis, emotionalTrend = null) {
    const { primaryEmotion, intensity, confidence } = toneAnalysis;
    
    if (confidence === 'low') return null; // Don't respond if not confident
    
    const responses = {
      sad: {
        low: "I notice you seem a bit down. How are you really feeling today?",
        medium: "You sound like you're having a difficult time. Would you like to talk more about what's troubling you?",
        high: "I can hear the sadness in your voice, and I want you to know that it's okay to feel this way. What's been weighing on your mind lately?"
      },
      angry: {
        low: "I sense some frustration in what you're saying. What's been bothering you?",
        medium: "You sound quite upset. Would you like to share what's making you feel this way?",
        high: "I can feel the anger in your words, and that's completely valid. What's been building up inside you?"
      },
      anxious: {
        low: "You seem a bit worried. Is there something specific on your mind?",
        medium: "I can hear the anxiety in your voice. What's causing you to feel this way?",
        high: "You sound really anxious, and I want you to know that your feelings are valid. What's been making you feel so overwhelmed?"
      },
      happy: {
        low: "It's great to hear some positivity in your voice! What's been going well?",
        medium: "You sound really happy today! I'd love to hear more about what's bringing you joy.",
        high: "Your happiness is contagious! Tell me more about what's making you feel so wonderful."
      },
      calm: {
        low: "You sound quite peaceful today. How are you feeling overall?",
        medium: "There's a real sense of calm in your voice. What's helping you feel so centered?",
        high: "You sound wonderfully calm and grounded. What's been bringing you this sense of peace?"
      },
      confused: {
        low: "You seem a bit uncertain about something. What's on your mind?",
        medium: "I can hear some confusion in your voice. What's been unclear or difficult to understand?",
        high: "You sound really confused, and that's completely understandable. What's been so unclear or difficult to figure out?"
      }
    };
    
    // Get base response
    let response = responses[primaryEmotion]?.[intensity] || null;
    
    // Add trend-based context if available
    if (emotionalTrend && emotionalTrend.frequency >= 3) {
      const trendResponses = {
        sad: "I've noticed you've been feeling down for a while now. ",
        angry: "I've sensed some ongoing frustration in our conversations. ",
        anxious: "I've picked up on some persistent anxiety in your voice. ",
        happy: "I've been hearing a lot of positivity from you lately! ",
        calm: "I've noticed you've been quite peaceful in our recent conversations. ",
        confused: "I've sensed some ongoing uncertainty in our talks. "
      };
      
      if (trendResponses[emotionalTrend.dominantEmotion]) {
        response = trendResponses[emotionalTrend.dominantEmotion] + response;
      }
    }
    
    return response;
  }

  // Get conversation summary for memory
  getConversationSummary() {
    if (this.conversationMemory.length === 0) return null;
    
    const recentMessages = this.conversationMemory.slice(-10);
    const emotions = recentMessages.map(msg => msg.toneAnalysis.primaryEmotion);
    const emotionCounts = {};
    
    emotions.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return {
      totalInteractions: this.conversationMemory.length,
      dominantEmotion: Object.entries(emotionCounts)
        .sort(([_, a], [__, b]) => b - a)[0]?.[0] || 'neutral',
      emotionalStability: this.calculateEmotionalStability(emotions),
      lastInteraction: this.conversationMemory[this.conversationMemory.length - 1]
    };
  }

  // Calculate emotional stability
  calculateEmotionalStability(emotions) {
    if (emotions.length < 2) return 'unknown';
    
    const uniqueEmotions = new Set(emotions);
    const stabilityScore = uniqueEmotions.size / emotions.length;
    
    if (stabilityScore <= 0.3) return 'stable';
    if (stabilityScore <= 0.6) return 'moderate';
    return 'unstable';
  }

  // Clear conversation memory
  clearMemory() {
    this.conversationMemory = [];
  }
}

// Create global tone analyzer instance
export const toneAnalyzer = new ToneAnalyzer();

// Voice commands
export const voiceCommands = {
  'start session': 'Begin therapy session',
  'stop session': 'End therapy session',
  'pause': 'Pause voice recognition',
  'resume': 'Resume voice recognition',
  'repeat': 'Repeat last response',
  'emergency': 'Trigger emergency mode'
};

// Check for voice command
export const checkVoiceCommand = (transcript) => {
  const lowerTranscript = transcript.toLowerCase();
  
  for (const [command, description] of Object.entries(voiceCommands)) {
    if (lowerTranscript.includes(command)) {
      return { command, description };
    }
  }
  
  return null;
}; 