// Custom Therapist Builder Service
import { therapistProfiles } from './therapistProfiles.js';

// Default templates for custom therapist creation
export const therapistTemplates = {
  academic: {
    name: 'Academic & Research-Focused',
    description: 'Evidence-based approach with strong theoretical background',
    traits: ['analytical', 'research-oriented', 'methodical', 'knowledgeable'],
    focus: ['cognitive_restructuring', 'evidence_based_practices', 'skill_building'],
    style: 'structured_and_educational'
  },
  spiritual: {
    name: 'Spiritual & Holistic',
    description: 'Integrates spiritual practices with therapeutic techniques',
    traits: ['spiritual', 'intuitive', 'holistic', 'compassionate'],
    focus: ['spiritual_growth', 'mind_body_connection', 'inner_peace'],
    style: 'contemplative_and_nurturing'
  },
  practical: {
    name: 'Practical & Solution-Focused',
    description: 'Direct approach focused on immediate solutions and life skills',
    traits: ['practical', 'direct', 'solution-focused', 'encouraging'],
    focus: ['life_skills', 'problem_solving', 'goal_setting'],
    style: 'direct_and_encouraging'
  },
  artistic: {
    name: 'Artistic & Creative',
    description: 'Uses creative expression and artistic methods in therapy',
    traits: ['creative', 'expressive', 'imaginative', 'inspiring'],
    focus: ['creative_expression', 'emotional_processing', 'self_discovery'],
    style: 'creative_and_exploratory'
  },
  gentle: {
    name: 'Gentle & Nurturing',
    description: 'Soft, supportive approach with emphasis on emotional safety',
    traits: ['gentle', 'nurturing', 'patient', 'validating'],
    focus: ['emotional_safety', 'self_compassion', 'healing'],
    style: 'gentle_and_supportive'
  },
  motivational: {
    name: 'Motivational & Energetic',
    description: 'High energy approach focused on motivation and positive change',
    traits: ['motivational', 'energetic', 'positive', 'encouraging'],
    focus: ['motivation', 'positive_change', 'goal_achievement'],
    style: 'energetic_and_motivational'
  }
};

// Personality trait options
export const availableTraits = [
  'empathetic', 'analytical', 'creative', 'practical', 'spiritual', 'direct',
  'gentle', 'motivational', 'patient', 'encouraging', 'validating', 'solution-focused',
  'holistic', 'structured', 'flexible', 'intuitive', 'knowledgeable', 'authentic',
  'compassionate', 'energetic', 'calm', 'supportive', 'challenging', 'nurturing'
];

// Therapeutic focus areas
export const availableFocusAreas = [
  'cognitive_restructuring', 'trauma_healing', 'mindfulness_practice', 'creative_expression',
  'relationship_healing', 'life_skills', 'emotional_regulation', 'spiritual_growth',
  'goal_setting', 'self_compassion', 'boundary_setting', 'stress_reduction',
  'motivation', 'problem_solving', 'communication_skills', 'inner_peace',
  'resilience_building', 'self_discovery', 'coping_skills', 'positive_change'
];

// Communication styles
export const communicationStyles = [
  'warm_and_analytical', 'gentle_and_supportive', 'direct_and_encouraging',
  'creative_and_exploratory', 'contemplative_and_nurturing', 'energetic_and_motivational',
  'structured_and_educational', 'authentic_and_understanding', 'calm_and_centered'
];

// Session styles
export const sessionStyles = [
  'structured_but_flexible', 'conversational_and_encouraging', 'gentle_and_exploratory',
  'contemplative_and_peaceful', 'relational_and_insightful', 'creative_and_exploratory',
  'educational_and_practical', 'supportive_and_validating', 'motivational_and_energetic'
];

// Avatar options
export const avatarOptions = [
  '👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🦱', '👩‍🦰', '🧑‍🦱', '👨‍💼', '👩‍💼', '🧑‍💼',
  '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍🌾', '👩‍🌾', '🧑‍🌾',
  '👨‍🔬', '👩‍🔬', '🧑‍🔬', '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🎭', '👩‍🎭', '🧑‍🎭'
];

// Color palette options
export const colorPalettes = [
  '#667eea', '#28a745', '#e91e63', '#9c27b0', '#ff9800', '#f44336',
  '#2196f3', '#4caf50', '#ff5722', '#795548', '#607d8b', '#9e9e9e',
  '#3f51b5', '#009688', '#ff4081', '#8bc34a', '#ffc107', '#00bcd4'
];

// Create a custom therapist profile
export const createCustomTherapist = (therapistData) => {
  const {
    name,
    title,
    avatar,
    specialty,
    background,
    personality,
    personalDetails,
    therapeuticFocus,
    sessionStyle,
    voiceSettings,
    greeting,
    color
  } = therapistData;

  // Generate unique ID
  const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name,
    title,
    avatar,
    specialty,
    background,
    personality,
    personalDetails,
    therapeuticFocus,
    sessionStyle,
    voiceSettings,
    greeting,
    color,
    isCustom: true,
    createdAt: new Date().toISOString()
  };
};

// Validate therapist data
export const validateTherapistData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (!data.specialty || data.specialty.trim().length < 5) {
    errors.push('Specialty must be at least 5 characters long');
  }

  if (!data.background || data.background.trim().length < 20) {
    errors.push('Background must be at least 20 characters long');
  }

  if (!data.personality?.traits || data.personality.traits.length < 2) {
    errors.push('Please select at least 2 personality traits');
  }

  if (!data.therapeuticFocus || data.therapeuticFocus.length < 2) {
    errors.push('Please select at least 2 therapeutic focus areas');
  }

  if (!data.greeting || data.greeting.trim().length < 10) {
    errors.push('Greeting must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate therapist suggestions based on user preferences
export const generateTherapistSuggestions = (userPreferences) => {
  const suggestions = [];

  // Based on preferred communication style
  if (userPreferences.communicationStyle) {
    const matchingTemplates = Object.values(therapistTemplates).filter(
      template => template.style.includes(userPreferences.communicationStyle)
    );
    suggestions.push(...matchingTemplates);
  }

  // Based on therapeutic needs
  if (userPreferences.therapeuticNeeds) {
    const needs = Array.isArray(userPreferences.therapeuticNeeds) 
      ? userPreferences.therapeuticNeeds 
      : [userPreferences.therapeuticNeeds];
    
    needs.forEach(need => {
      const matchingTemplates = Object.values(therapistTemplates).filter(
        template => template.focus.some(focus => focus.includes(need))
      );
      suggestions.push(...matchingTemplates);
    });
  }

  // Based on personality preference
  if (userPreferences.personalityType) {
    const matchingTemplates = Object.values(therapistTemplates).filter(
      template => template.traits.some(trait => 
        trait.includes(userPreferences.personalityType)
      )
    );
    suggestions.push(...matchingTemplates);
  }

  // Remove duplicates
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) =>
    index === self.findIndex(s => s.name === suggestion.name)
  );

  return uniqueSuggestions.slice(0, 3);
};

// Save custom therapist to localStorage
export const saveCustomTherapist = (therapist) => {
  try {
    const existingTherapists = JSON.parse(localStorage.getItem('customTherapists') || '[]');
    existingTherapists.push(therapist);
    localStorage.setItem('customTherapists', JSON.stringify(existingTherapists));
    return true;
  } catch (error) {
    console.error('Error saving custom therapist:', error);
    return false;
  }
};

// Load custom therapists from localStorage
export const loadCustomTherapists = () => {
  try {
    return JSON.parse(localStorage.getItem('customTherapists') || '[]');
  } catch (error) {
    console.error('Error loading custom therapists:', error);
    return [];
  }
};

// Delete custom therapist
export const deleteCustomTherapist = (therapistId) => {
  try {
    const existingTherapists = JSON.parse(localStorage.getItem('customTherapists') || '[]');
    const updatedTherapists = existingTherapists.filter(t => t.id !== therapistId);
    localStorage.setItem('customTherapists', JSON.stringify(updatedTherapists));
    return true;
  } catch (error) {
    console.error('Error deleting custom therapist:', error);
    return false;
  }
};

// Update custom therapist
export const updateCustomTherapist = (therapistId, updatedData) => {
  try {
    const existingTherapists = JSON.parse(localStorage.getItem('customTherapists') || '[]');
    const updatedTherapists = existingTherapists.map(t => 
      t.id === therapistId ? { ...t, ...updatedData, updatedAt: new Date().toISOString() } : t
    );
    localStorage.setItem('customTherapists', JSON.stringify(updatedTherapists));
    return true;
  } catch (error) {
    console.error('Error updating custom therapist:', error);
    return false;
  }
};

// Get all therapists (built-in + custom)
export const getAllTherapistsIncludingCustom = () => {
  const builtInTherapists = Object.values(therapistProfiles);
  const customTherapists = loadCustomTherapists();
  return [...builtInTherapists, ...customTherapists];
};

// Export custom therapists data
export const exportCustomTherapists = () => {
  const customTherapists = loadCustomTherapists();
  const dataStr = JSON.stringify(customTherapists, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = 'custom-therapists.json';
  link.click();
};

// Import custom therapists data
export const importCustomTherapists = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTherapists = JSON.parse(e.target.result);
        const existingTherapists = loadCustomTherapists();
        const mergedTherapists = [...existingTherapists, ...importedTherapists];
        localStorage.setItem('customTherapists', JSON.stringify(mergedTherapists));
        resolve(mergedTherapists);
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
}; 