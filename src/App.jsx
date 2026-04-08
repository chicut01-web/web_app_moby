import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Scanner from './components/Scanner';
import Staff from './components/Staff';
import Report from './components/Report';
import Menu from './components/Menu';
import Login from './components/Login';
import FeedbackOverlay from './components/FeedbackOverlay';
import { db } from './utils/supabase';
import './index.css';

export default function App() {
  const [view, setView] = useState('home');
  const [menuShortcut, setMenuShortcut] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ show: false, type: '', title: '', sub: '' });

  const goToMenu = (shortcut) => {
    setMenuShortcut(shortcut);
    setView('menu');
  };

  useEffect(() => {
    // Check active session
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showFeedback = (type, title, sub) => {
    setFeedback({ show: true, type, title, sub });
    if (type !== 'loading') {
      setTimeout(() => setFeedback(f => ({ ...f, show: false })), 3500);
    }
  };

  const hideFeedback = () => setFeedback(f => ({ ...f, show: false }));

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center text-primary">
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 40 }}>sync</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh flex flex-col relative text-slate-800">
      <div className="mesh-blob animate-float-slow" style={{ width: 500, height: 500, top: '5%', right: '0%', background: 'radial-gradient(circle, rgba(74,142,170,0.2) 0%, rgba(74,142,170,0) 70%)', animationDuration: '14s' }} />
        <div className="mesh-blob animate-float" style={{ width: 380, height: 380, bottom: '10%', left: '-8%', background: 'radial-gradient(circle, rgba(160,200,220,0.3) 0%, rgba(160,200,220,0) 70%)', animationDelay: '-4s' }} />
        
        <main className="relative z-10 flex-grow pt-10 pb-10 px-5 max-w-md mx-auto w-full flex flex-col items-center justify-center">
          <img
            alt="Moby Dick Logo"
            className="h-16 w-auto mb-8 animate-reveal"
            src="/logo/logo_mobydickets-1-3.png"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <Login />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col relative text-slate-800">
      {/* Animated mesh blobs */}
      <div className="mesh-blob animate-float-slow" style={{ width: 500, height: 500, top: '5%', right: '0%', background: 'radial-gradient(circle, rgba(74,142,170,0.2) 0%, rgba(74,142,170,0) 70%)', animationDuration: '14s' }} />
      <div className="mesh-blob animate-float" style={{ width: 380, height: 380, bottom: '10%', left: '-8%', background: 'radial-gradient(circle, rgba(160,200,220,0.4) 0%, rgba(160,200,220,0) 70%)', animationDelay: '-4s' }} />

      {/* Header */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <div className="bg-white rounded-[2rem] px-5 py-3 flex items-center justify-between max-w-md mx-auto shadow-md border border-slate-100">
          <div className="flex items-center">
            <img
              alt="Moby Dick Logo"
              className="h-8 w-auto"
              src="/logo/logo_mobydickets-1-3.png"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => goToMenu('Notifiche')} className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-slate-700 active:scale-90 transition-transform">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
            </button>
            <button onClick={() => goToMenu('Profilo Utente')} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-white/40 active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>account_circle</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="relative z-10 flex-grow pt-28 pb-32 px-5 max-w-md mx-auto w-full flex flex-col">
        {view === 'home' && <Home onScannerOpen={() => setView('scanner')} />}
        {view === 'scanner' && <Scanner active={true} showFeedback={showFeedback} hideFeedback={hideFeedback} />}
        {view === 'report' && <Report />}
        {view === 'staff' && <Staff />}
        {view === 'menu' && <Menu initialModal={menuShortcut} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white rounded-[2.5rem] px-8 py-3 flex justify-between items-center max-w-md mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
          <NavBtn icon="dashboard" label="Home" active={view === 'home'} fill onClick={() => setView('home')} />
          <NavBtn icon="analytics" label="Report" active={view === 'report'} onClick={() => setView('report')} />

          {/* Center FAB */}
          <div className="relative -top-8">
            <button
              onClick={() => setView('scanner')}
              className="w-16 h-16 liquid-glass glass-gradient-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 active:scale-90 transition-transform border-4 border-white/60 animate-float animate-glow"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 30, fontWeight: 700 }}>qr_code_scanner</span>
            </button>
          </div>

          <NavBtn icon="search" label="Cerca" active={view === 'staff'} onClick={() => setView('staff')} />
          <NavBtn icon="settings" label="Menu" active={view === 'menu'} onClick={() => goToMenu(null)} />
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
