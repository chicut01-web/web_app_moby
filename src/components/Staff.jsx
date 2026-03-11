import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';

export default function Staff() {
  const [volontari, setVolontari] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVolontari() {
      setLoading(true);
      const { data, error } = await db
        .from('volontari')
        .select('*')
        .order('cognome', { ascending: true });

      if (data) {
        setVolontari(data);
      }
      setLoading(false);
    }

    fetchVolontari();
  }, []);

  const filteredVolontari = volontari.filter(v => 
    `${v.nome} ${v.cognome}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-reveal">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Gestione Risorse
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Staff<br />
          <span style={{ color: 'rgba(74,142,170,0.8)' }}>Volontari</span>
        </h1>
      </div>

      {/* Search Bar */}
      <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-2 flex items-center space-x-3 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <div className="pl-4 text-slate-400">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>search</span>
        </div>
        <input
          type="text"
          placeholder="Cerca volontario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none w-full py-3 pr-4 text-slate-700 font-bold placeholder:text-slate-400 placeholder:font-medium"
        />
      </div>

      {/* Volunteer List */}
      <div className="space-y-3 animate-reveal" style={{ animationDelay: '0.2s' }}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : filteredVolontari.length === 0 ? (
          <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-8 text-center">
             <p className="text-slate-400 text-sm italic">Nessun volontario trovato.</p>
          </div>
        ) : (
          filteredVolontari.map((v) => (
            <div key={v.id} className="liquid-glass glass-gradient-bg rounded-[2.5rem] p-4 flex items-center justify-between group active:scale-[0.98] transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-white/40">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>person</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 leading-tight">{v.nome} {v.cognome}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Volontario</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
