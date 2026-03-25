import React, { useState } from 'react';
import { db } from '../utils/supabase';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await db.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] animate-reveal">
      <div className="w-full max-w-sm liquid-glass glass-gradient-bg rounded-[2rem] p-6 shadow-xl border border-white/40">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-4xl">admin_panel_settings</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 text-center mb-2">Area Riservata</h2>
        <p className="text-xs font-bold text-slate-500 text-center mb-6 uppercase tracking-wider">Accesso Amministratore</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400"
              placeholder="admin@mobydick.it"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-400"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-center">
              <span className="text-xs font-bold text-rose-500">{error === 'Invalid login credentials' ? 'Credenziali non valide' : error}</span>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 liquid-glass glass-gradient-primary rounded-xl py-3 flex items-center justify-center space-x-2 text-white font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">sync</span>
            ) : (
              <span className="material-symbols-outlined text-lg">login</span>
            )}
            <span>{loading ? 'Accesso in corso...' : 'Accedi'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
