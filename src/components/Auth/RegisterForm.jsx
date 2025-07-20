import React, { useState } from 'react';
import { supabase, dbService } from '../../services/supabase';

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    primaryAddiction: '',
    sobrietyDate: '',
    recoveryStage: 'early',
    supportNetwork: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // Create patient profile
      const profileData = {
        user_id: authData.user.id,
        primary_addiction: formData.primaryAddiction,
        sobriety_date: formData.sobrietyDate,
        recovery_stage: formData.recoveryStage,
        support_network_available: formData.supportNetwork,
        patient_summary: `New user in ${formData.recoveryStage} recovery stage. Primary addiction: ${formData.primaryAddiction}.`
      };

      const { error: profileError } = await dbService.createPatientProfile(profileData);

      if (profileError) throw profileError;

      onRegisterSuccess(authData.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="auth-form">
      <h2>Start Your Recovery Journey</h2>
      <p className="auth-subtitle">Create an account to begin your personalized recovery support</p>
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a password (min 6 characters)"
            value={formData.password}
            onChange={(e) => updateFormData('password', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData('confirmPassword', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="primaryAddiction">Primary Addiction</label>
          <select
            id="primaryAddiction"
            value={formData.primaryAddiction}
            onChange={(e) => updateFormData('primaryAddiction', e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="">Select Primary Addiction</option>
            <option value="alcohol">Alcohol</option>
            <option value="opioids">Opioids</option>
            <option value="stimulants">Stimulants (Cocaine, Meth, etc.)</option>
            <option value="cannabis">Cannabis</option>
            <option value="benzodiazepines">Benzodiazepines</option>
            <option value="gambling">Gambling</option>
            <option value="gaming">Gaming/Internet</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="sobrietyDate">Sobriety Date</label>
          <input
            id="sobrietyDate"
            type="date"
            value={formData.sobrietyDate}
            onChange={(e) => updateFormData('sobrietyDate', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="recoveryStage">Recovery Stage</label>
          <select
            id="recoveryStage"
            value={formData.recoveryStage}
            onChange={(e) => updateFormData('recoveryStage', e.target.value)}
            disabled={isLoading}
          >
            <option value="early">Early Recovery (0-6 months)</option>
            <option value="intermediate">Intermediate (6-18 months)</option>
            <option value="advanced">Advanced (18+ months)</option>
          </select>
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.supportNetwork}
              onChange={(e) => updateFormData('supportNetwork', e.target.checked)}
              disabled={isLoading}
            />
            I have access to a support network (family, friends, or support groups)
          </label>
        </div>
        
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      
      {error && <div className="auth-error">{error}</div>}
      
      <div className="auth-footer">
        <p>Already have an account? <button onClick={onSwitchToLogin} className="auth-link">Sign in</button></p>
      </div>
    </div>
  );
};

export default RegisterForm; 