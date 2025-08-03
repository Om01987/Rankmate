import React from 'react';
import './AnimatedBackground.css';

function AnimatedBackground() {
  return (
    <div className="animated-bg-root">
      {/* Floating Particles */}
      {[...Array(50)].map((_, i) => (
        <div key={i} className="animated-bg-particle" style={{
          width: Math.random() * 4 + 2,
          height: Math.random() * 4 + 2,
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDuration: (Math.random() * 10 + 10) + 's',
          animationDelay: Math.random() * 5 + 's',
          background: `rgba(78, 205, 196, ${Math.random() * 0.6 + 0.3})`,
        }} />
      ))}
      {/* Animated Grid */}
      <div className="animated-bg-grid" />
      {/* Animated Lines */}
      <div className="animated-bg-line1" />
      <div className="animated-bg-line2" />
      {/* Rotating Elements */}
      <div className="animated-bg-rot1" />
      <div className="animated-bg-rot2" />
      {/* Floating Dots */}
      {[...Array(20)].map((_, i) => (
        <div key={`dot-${i}`} className="animated-bg-dot" style={{
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDuration: (Math.random() * 8 + 6) + 's',
          animationDelay: Math.random() * 3 + 's',
          background: `rgba(78, 205, 196, ${Math.random() * 0.3 + 0.1})`,
        }} />
      ))}
      {/* Gradient Waves */}
      <div className="animated-bg-wave" />
      {/* Corner Accents */}
      <div className="animated-bg-corner1" />
      <div className="animated-bg-corner2" />
      {/* Sliding Light Beam */}
      <div className="animated-bg-beam" />
      {/* Wavy Element */}
      <div className="animated-bg-wavy" />
    </div>
  );
}

export default AnimatedBackground; 