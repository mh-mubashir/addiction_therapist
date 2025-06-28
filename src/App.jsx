import React from 'react';
import ChatInterface from './components/ChatInterface.jsx';

function App() {
  return (
    <div className="app">
      <div className="header">
        <h1>Addiction Recovery Therapist</h1>
        <p>Your compassionate AI companion for recovery support</p>
      </div>
      <ChatInterface />
    </div>
  );
}

export default App; 