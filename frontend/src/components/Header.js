import React from 'react';
import './Header.css';

function Header() {
  return (
    <div className="header-container">
      <h1 className="header-title">
        <span className="header-gradient">RRB</span>
        <span className="header-white">MARKS CALCULATOR</span>
      </h1>
      <div className="header-subrow">
        <span className="header-highlight">🚀 Analyze • 💡 Improve • 🎯 Excel</span>
      </div>
      <p className="header-desc">
        Smart Analysis • Instant Results • Performance Tracking
      </p>
    </div>
  );
}

export default Header; 