import React from 'react';
import './ErrorMessage.css';

function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="error-message-container">
      <p className="error-message-text">⚠️ {error}</p>
    </div>
  );
}

export default ErrorMessage; 