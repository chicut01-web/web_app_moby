import React, { useState } from 'react';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Staff from './components/Staff';
import Events from './components/Events';
import Menu from './components/Menu';
import FeedbackOverlay from './components/FeedbackOverlay';
import './index.css';

export default function App() {
  const [view, setView] = useState('home');
  const [feedback, setFeedback] = useState({ show: false, type: '', title: '', sub: '' });

  const showFeedback = (type, title, sub) => {
    setFeedback({ show: true, type, title, sub });
    if (type !== 'loading') {
      setTimeout(() => setFeedback(f => ({ ...f, show: false })), 3500);
    }
  };

  const hideFeedback = () => setFeedback(f => ({ ...f, show: false }));

  return (
    <div className="min-h-dvh flex flex-col relative text-slate-800">
      {/* Animated mesh blobs — keep to 2 for performance */}
      <div className="mesh-blob animate-float-slow" style={{ width: 500, height: 500, top: '5%', right: '0%', background: 'rgba(74,142,170,0.18)', animationDuration: '14s' }} />
      <div className="mesh-blob animate-float" style={{ width: 380, height: 380, bottom: '10%', left: '-8%', background: 'rgba(220,235,242,0.5)', animationDelay: '-4s' }} />

      {/* Header */}
      <header className="fixed top-4 left-4 right-4 z-50 animate-reveal">
        <div className="liquid-glass glass-gradient-bg rounded-[2rem] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <img
              alt="Moby Dick Logo"
              className="h-8 w-auto"
              src="/logo/logo_mobydickets-1-3.png"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-slate-700 active:scale-90 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/40">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>account_circle</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="relative z-10 flex-grow pt-36 pb-32 px-6 max-w-md mx-auto w-full">
        {view === 'home' && <Home onScannerOpen={() => setView('scanner')} />}
        {view === 'scanner' && <Scanner active={true} showFeedback={showFeedback} hideFeedback={hideFeedback} />}
        {view === 'events' && <Events />}
        {view === 'staff' && <Staff />}
        {view === 'menu' && <Menu />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="liquid-glass glass-gradient-bg rounded-[2.5rem] px-8 py-3 flex justify-between items-center max-w-md mx-auto">
          <NavBtn icon="dashboard" label="Home" active={view === 'home'} fill onClick={() => setView('home')} />
          <NavBtn icon="calendar_month" label="Eventi" active={view === 'events'} onClick={() => setView('events')} />

          {/* Center FAB */}
          <div className="relative -top-8">
            <button
              onClick={() => setView('scanner')}
              className="w-16 h-16 liquid-glass glass-gradient-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-90 transition-transform border-4 border-white/60 animate-float animate-glow"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 30, fontWeight: 700 }}>qr_code_scanner</span>
            </button>
          </div>

          <NavBtn icon="group" label="Staff" active={view === 'staff'} onClick={() => setView('staff')} />
          <NavBtn icon="settings" label="Menu" active={view === 'menu'} onClick={() => setView('menu')} />
        </div>
      </nav>

      {/* Feedback overlay */}
      <FeedbackOverlay {...feedback} />
    </div>
  );
}

function NavBtn({ icon, label, active, fill, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center group transition-colors duration-300 ${active ? 'text-primary' : 'text-slate-400'}`}
    >
      <span
        className={`material-symbols-outlined transition-transform group-active:scale-75${active && fill ? ' fill-1' : ''}`}
        style={{ fontSize: 24 }}
      >
        {icon}
      </span>
      <span className={`text-[9px] mt-0.5 uppercase tracking-tighter transition-all ${active ? 'font-black scale-110' : 'font-bold'}`}>{label}</span>
    </button>
  );
}
