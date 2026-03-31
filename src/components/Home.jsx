import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';

export default function Home({ onScannerOpen }) {
  const [entrate, setEntrate] = useState(0);
  const [uscite, setUscite] = useState(0);
  const [inSede, setInSede] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);

  // Load real stats and logs from Supabase
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    async function fetchData() {
      // Fetch stats for today including volunteer names
      const { data: presenzeData } = await db
        .from('presenze')
        .select('tipo, timestamp, volontari(nome, cognome)')
        .gte('timestamp', today + 'T00:00:00')
        .lte('timestamp', today + 'T23:59:59')
        .order('timestamp', { ascending: true });

      if (presenzeData) {
        const countEntrate = presenzeData.filter(r => r.tipo === 'entrata').length;
        const countUscite = presenzeData.filter(r => r.tipo === 'uscita').length;
        setEntrate(countEntrate);
        setUscite(countUscite);
        setInSede(Math.max(0, countEntrate - countUscite));

        // Get the latest 3 entries for the live feed
        const latest = [...presenzeData].reverse().slice(0, 3);
        setRecentLogs(latest);
      }
    }

    fetchData();

    // Set up real-time subscription for updates
    const channel = db.channel('public:presenze')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'presenze' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <>
      {/* Page header */}
      <div className="mb-4 pl-2 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-0.5" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Live Intelligence
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Panoramica<br />
          <span style={{ color: 'rgba(74,142,170,0.8)' }}>Real-time</span>
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
        {/* Stat 1 — Entrate */}
        <div className="shard-1 liquid-glass glass-gradient-bg animate-float flex flex-col items-center justify-center p-3 h-[110px] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-[-10px] w-16 h-16 bg-emerald-400/20 rounded-full blur-xl"></div>
          <span className="material-symbols-outlined text-emerald-500 mb-0.5" style={{ fontSize: 24 }}>login</span>
          <span className="text-4xl font-black text-slate-800 leading-none">{entrate}</span>
          <span className="text-[9px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest text-center">Entrate<br/>Oggi</span>
        </div>

        {/* Stat 2 — Uscite */}
        <div className="shard-2 liquid-glass flex flex-col items-center justify-center p-3 h-[110px] relative overflow-hidden shadow-sm" style={{ background: 'rgba(255,255,255,0.4)', animationDelay: '-1.5s' }}>
          <div className="absolute top-0 left-[-10px] w-16 h-16 bg-rose-400/20 rounded-full blur-xl"></div>
          <span className="material-symbols-outlined text-rose-500 mb-0.5" style={{ fontSize: 24 }}>logout</span>
          <span className="text-4xl font-black text-slate-800 leading-none">{uscite}</span>
          <span className="text-[9px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest text-center">Uscite<br/>Oggi</span>
        </div>

        {/* Stat 3 — In Sede */}
        <div className="col-span-2 liquid-glass glass-gradient-bg rounded-[2rem] p-5 flex flex-row items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Attualmente</span>
            <span className="text-3xl font-black text-slate-800 leading-none">In Sede</span>
          </div>
          <div className="flex items-center space-x-3 bg-white/50 px-4 py-2 rounded-3xl border border-white/60">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>group</span>
            <span className="text-3xl font-black text-primary leading-none">{inSede}</span>
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="animate-reveal" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-2 pl-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(74,142,170,0.6)' }}>
            Live Feed
          </h2>
          <span className="text-[10px] font-bold text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></span>
            Attivo
          </span>
        </div>

        <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-4 h-[185px] shadow-sm relative flex flex-col overflow-y-auto">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col space-y-3 z-10 w-full">
            {recentLogs.length > 0 ? (
              recentLogs.map((log, index) => {
                const isEntrata = log.tipo === 'entrata';
                const timeStr = new Date(log.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
                const nomeCompleto = log.volontari ? `${log.volontari.nome} ${log.volontari.cognome}` : 'Sconosciuto';

                return (
                  <div key={index} className="flex items-center space-x-3 border-b border-black/5 pb-2.5 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner ${
                      isEntrata ? 'bg-emerald-400/20 text-emerald-600 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-600 border border-rose-400/30'
                    }`}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        {isEntrata ? 'login' : 'logout'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 truncate">{nomeCompleto}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        {isEntrata ? 'Entrato' : 'Uscito'} alle {timeStr}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 py-6">
                <span className="material-symbols-outlined text-3xl mb-1 text-slate-400">pending_actions</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nessun movimento oggi</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
