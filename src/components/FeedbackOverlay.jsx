import React, { useEffect, useState } from 'react';

export default function FeedbackOverlay({ show, type, title, sub, icon }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible && !show) return null;

  return (
    <div className={`feedback-overlay ${show ? 'show' : ''}`}>
      <div className="feedback-card">
        <div className={`fb-icon ${type}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
            {icon}
          </span>
        </div>
        <div className="fb-title">{title}</div>
        <div className="fb-sub">{sub}</div>
      </div>
    </div>
  );
}
