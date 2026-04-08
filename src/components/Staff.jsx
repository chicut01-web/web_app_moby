import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';

export default function Staff() {
  const [volontari, setVolontari] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Detail view states
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [presenze, setPresenze] = useState([]);
  const [loadingPresenze, setLoadingPresenze] = useState(false);

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

  const handleSelectVolunteer = async (volontario) => {
    setSelectedVolunteer(volontario);
    setLoadingPresenze(true);
    setPresenze([]); // clear previous

    // Fetch presenze for this volunteer
    const { data: presenzeData, error } = await db
      .from('presenze')
      .select('*')
      .eq('volontario_id', volontario.id)
      .order('timestamp', { ascending: false }); // Latest first

    if (presenzeData) {
      setPresenze(presenzeData);
    }
    setLoadingPresenze(false);
  };

  const filteredVolontari = volontari.filter(v => 
    `${v.nome} ${v.cognome}`.toLowerCase().includes(search.toLowerCase())
  );

  // === DETAIL VIEW ===
  if (selectedVolunteer) {
    return (
      <div className="space-y-6 animate-reveal">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-2">
          <button 
            onClick={() => setSelectedVolunteer(null)}
            className="w-10 h-10 rounded-full liquid-glass glass-gradient-bg flex items-center justify-center text-slate-500 hover:text-primary active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
            Scheda<br />
            <span style={{ color: 'rgba(74,142,170,0.8)' }}>Volontario</span>
          </h1>
        </div>
        
        {/* Info Card */}
        <div className="liquid-glass glass-gradient-bg rounded-[2.5rem] p-6 flex flex-col items-center relative overflow-hidden text-center shadow-sm">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-white/40 mb-4 shadow-sm z-10">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 40 }}>person</span>
           </div>
           <h2 className="text-2xl font-black text-slate-800 z-10 leading-none">{selectedVolunteer.nome} {selectedVolunteer.cognome}</h2>
           {selectedVolunteer.email && (
             <p className="text-sm font-bold text-slate-500 mt-2 z-10">{selectedVolunteer.email}</p>
           )}
           {/* Volunteer Extra Info */}
           <div className="mt-4 w-full flex flex-col space-y-2 z-10 text-left bg-white/40 p-4 rounded-2xl border border-white/50 text-xs">
              {selectedVolunteer.telefono && (
                <p className="text-slate-600"><span className="font-bold text-primary">Telefono:</span> {selectedVolunteer.telefono}</p>
              )}
              {selectedVolunteer.codice_fiscale && (
                <p className="text-slate-600 uppercase"><span className="font-bold text-primary">C.F.:</span> {selectedVolunteer.codice_fiscale}</p>
              )}
              {selectedVolunteer.data_nascita && (
                <p className="text-slate-600"><span className="font-bold text-primary">Data nascita:</span> {new Date(selectedVolunteer.data_nascita).toLocaleDateString('it-IT')}</p>
              )}
              {selectedVolunteer.codice_progetto && (
                <p className="text-slate-600"><span className="font-bold text-primary">Cod. Progetto:</span> {selectedVolunteer.codice_progetto}</p>
              )}
              {selectedVolunteer.titolo_progetto && (
                <p className="text-slate-600"><span className="font-bold text-primary">Progetto:</span> {selectedVolunteer.titolo_progetto}</p>
              )}
              {selectedVolunteer.codice_sede && (
                <p className="text-slate-600"><span className="font-bold text-primary">Cod. Sede:</span> {selectedVolunteer.codice_sede}</p>
              )}
           </div>
           <div className="mt-4 bg-white/40 px-4 py-1.5 rounded-full border border-white/50 z-10 shadow-sm">
              <span className="text-[10px] uppercase tracking-widest font-black text-primary">Volontario Moby Dick</span>
           </div>
        </div>

        {/* History / Timeline */}
        <div className="pl-1 pb-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-3" style={{ color: 'rgba(74,142,170,0.6)' }}>
             Storico Presenze
           </h3>
           <div className="space-y-3">
             {loadingPresenze ? (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
             ) : presenze.length === 0 ? (
                <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-6 text-center shadow-sm">
                   <p className="text-slate-400 text-sm italic font-medium">Nessuna attività registrata</p>
                </div>
             ) : (
                presenze.map((p) => {
                  const date = new Date(p.timestamp);
                  const isEntrata = p.tipo === 'entrata';
                  return (
                    <div key={p.id} className="liquid-glass glass-gradient-bg rounded-[2rem] p-3.5 flex items-center space-x-4 shadow-sm animate-reveal" style={{ animationDuration: '0.4s' }}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                        isEntrata ? 'bg-emerald-400/20 text-emerald-600 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-600 border border-rose-400/30'
                      }`}>
                         <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                           {isEntrata ? 'login' : 'logout'}
                         </span>
                      </div>
                      <div className="flex-1">
                         <p className={`text-base font-black leading-tight ${isEntrata ? 'text-emerald-700' : 'text-rose-700'}`}>
                           {isEntrata ? 'Entrata' : 'Uscita'}
                         </p>
                         <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                           {date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} — {date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                    </div>
                  );
                })
             )}
           </div>
        </div>
      </div>
    );
  }

  // === SEARCH LIST VIEW ===
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
      <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-2 flex items-center space-x-3 animate-reveal shadow-sm" style={{ animationDelay: '0.1s' }}>
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
          <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-8 text-center shadow-sm">
             <p className="text-slate-400 text-sm italic">Nessun volontario trovato.</p>
          </div>
        ) : (
          filteredVolontari.map((v) => (
            <div 
              key={v.id} 
              onClick={() => handleSelectVolunteer(v)}
              className="liquid-glass glass-gradient-bg rounded-[2.5rem] p-4 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-white/40">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>person</span>
                </div>
                <div>
                  <p className="font-black text-slate-800 leading-tight">{v.nome} {v.cognome}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Volontario</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
