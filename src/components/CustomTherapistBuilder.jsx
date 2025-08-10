import React, { useState, useEffect } from 'react';
import {
  therapistTemplates,
  availableTraits,
  availableFocusAreas,
  communicationStyles,
  sessionStyles,
  avatarOptions,
  colorPalettes,
  createCustomTherapist,
  validateTherapistData,
  saveCustomTherapist,
  generateTherapistSuggestions
} from '../services/customTherapistBuilder.js';

const CustomTherapistBuilder = ({ onTherapistCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [therapistData, setTherapistData] = useState({
    name: '',
    title: '',
    avatar: '👨‍⚕️',
    specialty: '',
    background: '',
    personality: {
      style: '',
      traits: [],
      communication: '',
      approach: ''
    },
    personalDetails: {
      age: 35,
      location: '',
      education: '',
      languages: ['English'],
      hobbies: [],
      music: [],
      art: [],
      likes: [],
      dislikes: [],
      funFacts: [],
      favoriteQuote: ''
    },
    therapeuticFocus: [],
    sessionStyle: '',
    voiceSettings: {
      rate: 0.9,
      pitch: 1.0,
      volume: 0.8
    },
    greeting: '',
    color: '#667eea'
  });

  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const totalSteps = 6;

  const updateTherapistData = (field, value) => {
    setTherapistData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parentField, field, value) => {
    setTherapistData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value
      }
    }));
  };

  const handleTraitToggle = (trait) => {
    const currentTraits = therapistData.personality.traits;
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    
    updateNestedField('personality', 'traits', newTraits);
  };

  const handleFocusToggle = (focus) => {
    const currentFocus = therapistData.therapeuticFocus;
    const newFocus = currentFocus.includes(focus)
      ? currentFocus.filter(f => f !== focus)
      : [...currentFocus, focus];
    
    updateTherapistData('therapeuticFocus', newFocus);
  };

  const handleArrayFieldUpdate = (parentField, field, value, action) => {
    const currentArray = therapistData[parentField][field];
    let newArray;

    if (action === 'add') {
      newArray = [...currentArray, value];
    } else if (action === 'remove') {
      newArray = currentArray.filter(item => item !== value);
    }

    updateNestedField(parentField, field, newArray);
  };

  const handleTemplateSelect = (template) => {
    setTherapistData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        style: template.style,
        traits: template.traits,
        communication: `This therapist uses a ${template.name.toLowerCase()} approach.`,
        approach: template.description
      },
      therapeuticFocus: template.focus,
      sessionStyle: template.style.replace('_', '_and_')
    }));
  };

  const generateSuggestions = () => {
    const userPreferences = {
      communicationStyle: therapistData.personality.style,
      therapeuticNeeds: therapistData.therapeuticFocus,
      personalityType: therapistData.personality.traits[0]
    };
    
    const suggestions = generateTherapistSuggestions(userPreferences);
    setSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const validateCurrentStep = () => {
    const stepErrors = [];

    switch (currentStep) {
      case 1:
        if (!therapistData.name.trim()) stepErrors.push('Name is required');
        if (!therapistData.title.trim()) stepErrors.push('Title is required');
        if (!therapistData.specialty.trim()) stepErrors.push('Specialty is required');
        break;
      case 2:
        if (!therapistData.background.trim()) stepErrors.push('Background is required');
        if (therapistData.personality.traits.length < 2) stepErrors.push('Select at least 2 personality traits');
        break;
      case 3:
        if (therapistData.therapeuticFocus.length < 2) stepErrors.push('Select at least 2 therapeutic focus areas');
        if (!therapistData.sessionStyle) stepErrors.push('Session style is required');
        break;
      case 4:
        if (!therapistData.personalDetails.location.trim()) stepErrors.push('Location is required');
        if (!therapistData.personalDetails.education.trim()) stepErrors.push('Education is required');
        break;
      case 5:
        if (!therapistData.greeting.trim()) stepErrors.push('Greeting message is required');
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setErrors([]);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors([]);
  };

  const handleCreate = () => {
    const validation = validateTherapistData(therapistData);
    if (validation.isValid) {
      const customTherapist = createCustomTherapist(therapistData);
      if (saveCustomTherapist(customTherapist)) {
        onTherapistCreated(customTherapist);
      }
    } else {
      setErrors(validation.errors);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`step-dot ${i + 1 === currentStep ? 'active' : i + 1 < currentStep ? 'completed' : ''}`}
          onClick={() => setCurrentStep(i + 1)}
        >
          {i + 1 < currentStep ? '✓' : i + 1}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="builder-step">
      <h3>Basic Information</h3>
      <div className="form-group">
        <label>Name *</label>
        <input
          type="text"
          value={therapistData.name}
          onChange={(e) => updateTherapistData('name', e.target.value)}
          placeholder="e.g., Dr. Maya Patel"
        />
      </div>
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={therapistData.title}
          onChange={(e) => updateTherapistData('title', e.target.value)}
          placeholder="e.g., Licensed Clinical Social Worker"
        />
      </div>
      <div className="form-group">
        <label>Specialty *</label>
        <input
          type="text"
          value={therapistData.specialty}
          onChange={(e) => updateTherapistData('specialty', e.target.value)}
          placeholder="e.g., Trauma-Informed Therapy"
        />
      </div>
      <div className="form-group">
        <label>Avatar</label>
        <div className="avatar-selection">
          {avatarOptions.slice(0, 12).map(avatar => (
            <button
              key={avatar}
              className={`avatar-option ${therapistData.avatar === avatar ? 'selected' : ''}`}
              onClick={() => updateTherapistData('avatar', avatar)}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Color Theme</label>
        <div className="color-selection">
          {colorPalettes.slice(0, 12).map(color => (
            <button
              key={color}
              className={`color-option ${therapistData.color === color ? 'selected' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => updateTherapistData('color', color)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="builder-step">
      <h3>Background & Personality</h3>
      <div className="form-group">
        <label>Professional Background *</label>
        <textarea
          value={therapistData.background}
          onChange={(e) => updateTherapistData('background', e.target.value)}
          placeholder="Describe their professional experience, approach, and what makes them unique..."
          rows={4}
        />
      </div>
      <div className="form-group">
        <label>Personality Traits * (Select at least 2)</label>
        <div className="traits-grid">
          {availableTraits.map(trait => (
            <button
              key={trait}
              className={`trait-option ${therapistData.personality.traits.includes(trait) ? 'selected' : ''}`}
              onClick={() => handleTraitToggle(trait)}
            >
              {trait}
            </button>
          ))}
        </div>
      </div>
      <div className="template-suggestions">
        <h4>Quick Templates</h4>
        <div className="template-grid">
          {Object.entries(therapistTemplates).map(([key, template]) => (
            <button
              key={key}
              className="template-option"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="template-name">{template.name}</div>
              <div className="template-description">{template.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="builder-step">
      <h3>Therapeutic Approach</h3>
      <div className="form-group">
        <label>Therapeutic Focus Areas * (Select at least 2)</label>
        <div className="focus-grid">
          {availableFocusAreas.map(focus => (
            <button
              key={focus}
              className={`focus-option ${therapistData.therapeuticFocus.includes(focus) ? 'selected' : ''}`}
              onClick={() => handleFocusToggle(focus)}
            >
              {focus.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Session Style</label>
        <select
          value={therapistData.sessionStyle}
          onChange={(e) => updateTherapistData('sessionStyle', e.target.value)}
        >
          <option value="">Select a session style</option>
          {sessionStyles.map(style => (
            <option key={style} value={style}>
              {style.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Communication Style</label>
        <select
          value={therapistData.personality.style}
          onChange={(e) => updateNestedField('personality', 'style', e.target.value)}
        >
          <option value="">Select a communication style</option>
          {communicationStyles.map(style => (
            <option key={style} value={style}>
              {style.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="builder-step">
      <h3>Personal Details</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            value={therapistData.personalDetails.age}
            onChange={(e) => updateNestedField('personalDetails', 'age', parseInt(e.target.value))}
            min="25"
            max="80"
          />
        </div>
        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            value={therapistData.personalDetails.location}
            onChange={(e) => updateNestedField('personalDetails', 'location', e.target.value)}
            placeholder="e.g., Portland, OR"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Education *</label>
        <input
          type="text"
          value={therapistData.personalDetails.education}
          onChange={(e) => updateNestedField('personalDetails', 'education', e.target.value)}
          placeholder="e.g., PhD in Clinical Psychology, Stanford University"
        />
      </div>
      <div className="form-group">
        <label>Languages</label>
        <div className="languages-input">
          {therapistData.personalDetails.languages.map((lang, index) => (
            <div key={index} className="language-tag">
              {lang}
              <button
                type="button"
                onClick={() => handleArrayFieldUpdate('personalDetails', 'languages', lang, 'remove')}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            placeholder="Add language"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                handleArrayFieldUpdate('personalDetails', 'languages', e.target.value.trim(), 'add');
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Hobbies</label>
        <div className="array-input">
          {therapistData.personalDetails.hobbies.map((hobby, index) => (
            <div key={index} className="array-tag">
              {hobby}
              <button
                type="button"
                onClick={() => handleArrayFieldUpdate('personalDetails', 'hobbies', hobby, 'remove')}
              >
                ×
              </button>
            </div>
          ))}
          <input
            type="text"
            placeholder="Add hobby"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                handleArrayFieldUpdate('personalDetails', 'hobbies', e.target.value.trim(), 'add');
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="builder-step">
      <h3>Voice & Greeting</h3>
      <div className="form-group">
        <label>Greeting Message *</label>
        <textarea
          value={therapistData.greeting}
          onChange={(e) => updateTherapistData('greeting', e.target.value)}
          placeholder="How does your therapist greet clients? Make it personal and welcoming..."
          rows={3}
        />
      </div>
      <div className="voice-settings">
        <h4>Voice Settings</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Speech Rate</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={therapistData.voiceSettings.rate}
              onChange={(e) => updateNestedField('voiceSettings', 'rate', parseFloat(e.target.value))}
            />
            <span>{therapistData.voiceSettings.rate}</span>
          </div>
          <div className="form-group">
            <label>Pitch</label>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={therapistData.voiceSettings.pitch}
              onChange={(e) => updateNestedField('voiceSettings', 'pitch', parseFloat(e.target.value))}
            />
            <span>{therapistData.voiceSettings.pitch}</span>
          </div>
          <div className="form-group">
            <label>Volume</label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={therapistData.voiceSettings.volume}
              onChange={(e) => updateNestedField('voiceSettings', 'volume', parseFloat(e.target.value))}
            />
            <span>{therapistData.voiceSettings.volume}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="builder-step">
      <h3>Review & Create</h3>
      <div className="therapist-preview">
        <div className="preview-header">
          <div className="preview-avatar" style={{ backgroundColor: therapistData.color }}>
            {therapistData.avatar}
          </div>
          <div className="preview-info">
            <h4>{therapistData.name}</h4>
            <p>{therapistData.title}</p>
            <p><strong>Specialty:</strong> {therapistData.specialty}</p>
          </div>
        </div>
        <div className="preview-details">
          <p><strong>Background:</strong> {therapistData.background}</p>
          <p><strong>Personality:</strong> {therapistData.personality.traits.join(', ')}</p>
          <p><strong>Focus Areas:</strong> {therapistData.therapeuticFocus.map(f => f.replace('_', ' ')).join(', ')}</p>
          <p><strong>Location:</strong> {therapistData.personalDetails.location}</p>
          <p><strong>Greeting:</strong> "{therapistData.greeting}"</p>
        </div>
      </div>
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="custom-therapist-builder">
      <div className="builder-header">
        <h2>Create Your Custom Therapist</h2>
        <p>Design a therapist that perfectly matches your needs and preferences</p>
      </div>

      {renderStepIndicator()}

      <div className="builder-content">
        {renderCurrentStep()}
      </div>

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      <div className="builder-actions">
        {currentStep > 1 && (
          <button className="btn-secondary" onClick={prevStep}>
            Previous
          </button>
        )}
        {currentStep < totalSteps ? (
          <button className="btn-primary" onClick={nextStep}>
            Next
          </button>
        ) : (
          <button className="btn-primary" onClick={handleCreate}>
            Create Therapist
          </button>
        )}
        <button className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CustomTherapistBuilder; 