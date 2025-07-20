import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ onSignOut }) => {
  const { user, patientProfile } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItemClass = (path) => {
    return `nav-item ${isActive(path) ? 'active' : ''}`;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <h2>Recovery Support</h2>
          </Link>
        </div>

        <div className="nav-menu">
          <Link to="/" className={getNavItemClass('/')}>
            <span className="nav-icon">💬</span>
            <span className="nav-text">Chat</span>
          </Link>
          
          <Link to="/dashboard" className={getNavItemClass('/dashboard')}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
        </div>

        <div className="nav-user">
          <div className="user-info">
            <span className="user-email">{user?.email}</span>
            {patientProfile && (
              <span className="user-stage">
                {patientProfile.recovery_stage} recovery
              </span>
            )}
          </div>
          
          <button onClick={onSignOut} className="sign-out-button">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 