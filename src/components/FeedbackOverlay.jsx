import React from 'react';

export default function FeedbackOverlay({ show, type, title, sub }) {
  if (!show) return null;

  if (type === 'success') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(220,235,242,0.6)', backdropFilter: 'blur(20px)' }}>
        <div className="success-card liquid-glass bg-white rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full opacity-20" style={{ background: 'rgba(74,210,100,0.3)', filter: 'blur(40px)' }} />
          {/* Check SVG */}
          <div className="relative mb-6 w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full blur-2xl animate-glow" style={{ background: 'rgba(74,210,100,0.2)' }} />
            <svg className="w-24 h-24 text-emerald-500 relative z-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path className="check-draw" d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{title}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{sub}</p>
          {/* Decorative blobs */}
          <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full blur-xl" style={{ background: 'rgba(74,142,170,0.2)' }} />
          <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full blur-xl" style={{ background: 'rgba(243,156,18,0.2)' }} />
        </div>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(220,235,242,0.6)', backdropFilter: 'blur(20px)' }}>
        <div className="success-card liquid-glass glass-gradient-bg rounded-[3rem] p-12 text-center shadow-2xl">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(239,68,68,0.1)' }}>
            <span className="material-symbols-outlined text-rose-500" style={{ fontSize: 48 }}>warning</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">{title}</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">{sub}</p>
        </div>
      </div>
    );
  }

  if (type === 'loading') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(220,235,242,0.5)', backdropFilter: 'blur(16px)' }}>
        <div className="liquid-glass glass-gradient-bg rounded-[2.5rem] p-10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary mx-auto mb-4 animate-spin" />
          <p className="font-black text-slate-700 text-lg">{title}</p>
          <p className="text-slate-400 text-sm mt-1">{sub}</p>
        </div>
      </div>
    );
  }

  return null;
}
