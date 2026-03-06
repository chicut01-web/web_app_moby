import React, { useState } from 'react';
import { LayoutDashboard, Maximize, Settings } from 'lucide-react';
import Background3D from './components/Background3D';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Tools from './components/Tools';
import FeedbackOverlay from './components/FeedbackOverlay';
import './index.css';

export default function App() {
  const [view, setView] = useState('home');
  const [feedback, setFeedback] = useState({ show: false, type: '', title: '', sub: '' });

  const showFeedback = (type, title, sub) => {
    setFeedback({ show: true, type, title, sub });
    if (type !== 'loading') {
      setTimeout(() => setFeedback((f) => ({ ...f, show: false })), 3500);
    }
  };

  const hideFeedback = () => setFeedback((f) => ({ ...f, show: false }));

  return (
    <>
      <Background3D />
      <main id="app">
        <div className="view-container">
          <div className={`view ${view === 'home' ? 'active' : ''}`}>
            {view === 'home' && <Home />}
          </div>
          <div className={`view ${view === 'scanner' ? 'active' : ''}`}>
             <Scanner active={view === 'scanner'} showFeedback={showFeedback} hideFeedback={hideFeedback} />
          </div>
          <div className={`view ${view === 'tools' ? 'active' : ''}`}>
            {view === 'tools' && <Tools showFeedback={showFeedback} />}
          </div>
        </div>

        <nav className="bottom-nav">
          <button 
            className={`nav-item ${view === 'home' ? 'active' : ''}`} 
            onClick={() => setView('home')}
            style={{background: 'transparent', border: 'none'}}
          >
            <LayoutDashboard size={26} />
            <span className="nav-label">Home</span>
          </button>
          
          <button 
            className={`nav-item ${view === 'scanner' ? 'active' : ''}`} 
            onClick={() => setView('scanner')}
            style={{background: 'transparent', border: 'none'}}
          >
            <Maximize size={26} />
            <span className="nav-label">Scanner</span>
          </button>
          
          <button 
            className={`nav-item ${view === 'tools' ? 'active' : ''}`} 
            onClick={() => setView('tools')}
            style={{background: 'transparent', border: 'none'}}
          >
            <Settings size={26} />
            <span className="nav-label">Strumenti</span>
          </button>
        </nav>

        <FeedbackOverlay 
          {...feedback} 
          icon={feedback.type === 'success' ? 'check_circle' : feedback.type === 'error' ? 'warning' : 'hourglass_empty'} 
        />
      </main>
    </>
  );
}
