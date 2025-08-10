import React, { useState, useEffect } from 'react';
import { 
  getAllTherapists, 
  getTherapistByMood, 
  getTherapistByFocus, 
  recommendTherapist,
  calculateTherapistCompatibility 
} from '../services/therapistProfiles.js';
import { getAllTherapistsIncludingCustom } from '../services/customTherapistBuilder.js';
import CustomTherapistBuilder from './CustomTherapistBuilder.jsx';

const TherapistSelection = ({ 
  onTherapistSelect, 
  currentTherapist = null, 
  userProfile = null, 
  recentMood = null,
  sessionHistory = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [customTherapists, setCustomTherapists] = useState([]);

  const categories = [
    { id: 'all', name: 'All Therapists', icon: '👥' },
    { id: 'recommended', name: 'Recommended', icon: '⭐' },
    { id: 'mood', name: 'By Mood', icon: '😊' },
    { id: 'focus', name: 'By Focus', icon: '🎯' },
    { id: 'style', name: 'By Style', icon: '💬' },
    { id: 'custom', name: 'Custom Therapists', icon: '🎨' }
  ];

  const moodOptions = [
    { id: 'sad', name: 'Sad', icon: '😢' },
    { id: 'anxious', name: 'Anxious', icon: '😰' },
    { id: 'angry', name: 'Angry', icon: '😠' },
    { id: 'confused', name: 'Confused', icon: '😕' },
    { id: 'happy', name: 'Happy', icon: '😊' },
    { id: 'calm', name: 'Calm', icon: '😌' },
    { id: 'stressed', name: 'Stressed', icon: '😤' },
    { id: 'lonely', name: 'Lonely', icon: '😔' },
    { id: 'overwhelmed', name: 'Overwhelmed', icon: '😵' },
    { id: 'motivated', name: 'Motivated', icon: '💪' }
  ];

  const focusOptions = [
    { id: 'trauma', name: 'Trauma Healing', icon: '🛡️' },
    { id: 'relationships', name: 'Relationships', icon: '💕' },
    { id: 'mindfulness', name: 'Mindfulness', icon: '🧘' },
    { id: 'creativity', name: 'Creativity', icon: '🎨' },
    { id: 'practical', name: 'Practical Skills', icon: '🛠️' },
    { id: 'cognitive', name: 'Cognitive Work', icon: '🧠' }
  ];

  useEffect(() => {
    if (selectedCategory === 'recommended' && userProfile) {
      const recs = recommendTherapist(userProfile, recentMood, sessionHistory);
      setRecommendations(recs);
    }
  }, [selectedCategory, userProfile, recentMood, sessionHistory]);

  const getFilteredTherapists = () => {
    let therapists = getAllTherapistsIncludingCustom();

    // Filter by category
    switch (selectedCategory) {
      case 'recommended':
        return recommendations;
      case 'mood':
        if (recentMood) {
          return getTherapistByMood(recentMood);
        }
        return therapists;
      case 'focus':
        return therapists; // Will be filtered by selected focus
      case 'custom':
        return therapists.filter(t => t.isCustom);
      default:
        return therapists;
    }
  };

  const getTherapistsByFocus = (focus) => {
    return getTherapistByFocus(focus);
  };

  const filteredTherapists = getFilteredTherapists().filter(therapist =>
    therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    therapist.personality.traits.some(trait => 
      trait.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleTherapistSelect = (therapist) => {
    if (onTherapistSelect) {
      onTherapistSelect(therapist);
    }
  };

  const handleCustomTherapistCreated = (newTherapist) => {
    setCustomTherapists(prev => [...prev, newTherapist]);
    setShowBuilder(false);
    if (onTherapistSelect) {
      onTherapistSelect(newTherapist);
    }
  };

  const getCompatibilityScore = (therapist) => {
    if (!userProfile || !recentMood) return null;
    return calculateTherapistCompatibility(therapist, userProfile, recentMood);
  };

  const renderTherapistCard = (therapist) => {
    const compatibilityScore = getCompatibilityScore(therapist);
    const isCurrentTherapist = currentTherapist?.id === therapist.id;

    return (
      <div 
        key={therapist.id}
        className={`therapist-card ${isCurrentTherapist ? 'current' : ''} ${therapist.isCustom ? 'custom' : ''}`}
        onClick={() => handleTherapistSelect(therapist)}
      >
        <div className="therapist-header">
          <div className="therapist-avatar" style={{ backgroundColor: therapist.color }}>
            {therapist.avatar}
          </div>
          <div className="therapist-info">
            <div className="therapist-name">{therapist.name}</div>
            <div className="therapist-title">{therapist.title}</div>
            {compatibilityScore && (
              <div className="compatibility-score">
                <span className="score-label">Match:</span>
                <span className={`score-value ${compatibilityScore >= 70 ? 'high' : compatibilityScore >= 40 ? 'medium' : 'low'}`}>
                  {compatibilityScore}%
                </span>
              </div>
            )}
          </div>
          {isCurrentTherapist && (
            <div className="current-indicator">✓ Current</div>
          )}
          {therapist.isCustom && (
            <div className="custom-indicator">🎨 Custom</div>
          )}
        </div>

        <div className="therapist-specialty">
          <strong>Specialty:</strong> {therapist.specialty}
        </div>

        <div className="therapist-background">
          {therapist.background}
        </div>

        <div className="therapist-traits">
          <strong>Style:</strong>
          <div className="traits-list">
            {therapist.personality.traits.map(trait => (
              <span key={trait} className="trait-tag">{trait}</span>
            ))}
          </div>
        </div>

        <div className="therapist-approach">
          <strong>Approach:</strong> {therapist.personality.approach}
        </div>

        <div className="therapist-focus">
          <strong>Focus Areas:</strong>
          <div className="focus-list">
            {therapist.therapeuticFocus.map(focus => (
              <span key={focus} className="focus-tag">{focus.replace('_', ' ')}</span>
            ))}
          </div>
        </div>

        <div className="therapist-actions">
          <button 
            className={`select-button ${isCurrentTherapist ? 'current' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleTherapistSelect(therapist);
            }}
          >
            {isCurrentTherapist ? 'Current Therapist' : 'Select This Therapist'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="therapist-selection">
      <div className="selection-header">
        <h2>Choose Your Therapist</h2>
        <p>Select a therapist that matches your current needs and preferences</p>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search therapists by name, specialty, or style..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="therapist-search"
        />
      </div>

      {/* Mood/Focus Selection */}
      {selectedCategory === 'mood' && (
        <div className="mood-selection">
          <h3>How are you feeling today?</h3>
          <div className="mood-options">
            {moodOptions.map(mood => (
              <button
                key={mood.id}
                className={`mood-option ${recentMood === mood.id ? 'selected' : ''}`}
                onClick={() => setRecentMood(mood.id)}
              >
                <span className="mood-icon">{mood.icon}</span>
                <span className="mood-name">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCategory === 'focus' && (
        <div className="focus-selection">
          <h3>What would you like to focus on?</h3>
          <div className="focus-options">
            {focusOptions.map(focus => (
              <button
                key={focus.id}
                className="focus-option"
                onClick={() => setSelectedFocus(focus.id)}
              >
                <span className="focus-icon">{focus.icon}</span>
                <span className="focus-name">{focus.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Therapist Grid */}
      <div className="therapists-grid">
        {filteredTherapists.length > 0 ? (
          filteredTherapists.map(renderTherapistCard)
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">
              No therapists found matching your criteria.
              <br />
              Try adjusting your search or category selection.
            </div>
          </div>
        )}
      </div>

      {/* Quick Selection */}
      {currentTherapist && (
        <div className="current-therapist-summary">
          <div className="summary-header">
            <h3>Current Therapist</h3>
          </div>
          <div className="summary-content">
            <div className="summary-avatar" style={{ backgroundColor: currentTherapist.color }}>
              {currentTherapist.avatar}
            </div>
            <div className="summary-info">
              <div className="summary-name">{currentTherapist.name}</div>
              <div className="summary-specialty">{currentTherapist.specialty}</div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Therapist Builder */}
      {showBuilder && (
        <div className="builder-overlay">
          <CustomTherapistBuilder
            onTherapistCreated={handleCustomTherapistCreated}
            onCancel={() => setShowBuilder(false)}
          />
        </div>
      )}

      {/* Create Custom Therapist Button */}
      {selectedCategory === 'custom' && (
        <div className="create-custom-section">
          <button 
            className="create-custom-button"
            onClick={() => setShowBuilder(true)}
          >
            <span className="button-icon">✨</span>
            <span className="button-text">Create Your Own Therapist</span>
          </button>
          <p className="create-custom-description">
            Design a therapist with your preferred personality, approach, and style
          </p>
        </div>
      )}
    </div>
  );
};

export default TherapistSelection; 