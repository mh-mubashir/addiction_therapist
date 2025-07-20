import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import ChatInterface from './components/ChatInterface';
import PatientDashboard from './components/Dashboard/PatientDashboard';
import Navigation from './components/Navigation';
import DebugInfo from './components/DebugInfo';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Loading timeout reached, forcing continue...');
        setTimeoutReached(true);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  if (loading && !timeoutReached) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          If this takes too long, check the debug info in the top right corner
        </p>
      </div>
    );
  }
  
  // If timeout reached, show auth page or continue
  if (timeoutReached && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  return user ? children : <Navigate to="/auth" replace />;
};

// Main app content
const AppContent = () => {
  const { user, signOut } = useAuth();

  const handleAuthSuccess = (user) => {
    console.log('✅ User authenticated:', user.email);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Router>
      <div className="app">
        {/* Debug component - remove in production */}
        <DebugInfo />
        
        {user ? (
          <>
            <Navigation onSignOut={handleSignOut} />
            <main className="main-content">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <ChatInterface />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <PatientDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/auth" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route 
              path="/auth" 
              element={<AuthPage onAuthSuccess={handleAuthSuccess} />} 
            />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
};

// Main App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App; 