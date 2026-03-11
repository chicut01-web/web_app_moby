import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';

export default function Home({ onScannerOpen }) {
  const [scansioni, setScansioni] = useState(0);
  const [inSede, setInSede] = useState(0);
  const [logs, setLogs] = useState([]);

  // Load real stats and logs from Supabase
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    async function fetchData() {
      // Fetch stats
      const { data: presenzeData } = await db
        .from('presenze')
        .select('tipo')
        .gte('timestamp', today + 'T00:00:00')
        .lte('timestamp', today + 'T23:59:59');

      if (presenzeData) {
        setScansioni(presenzeData.length);
        const entrate = presenzeData.filter(r => r.tipo === 'entrata').length;
        const uscite = presenzeData.filter(r => r.tipo === 'uscita').length;
        setInSede(Math.max(0, entrate - uscite));
      }

      // Fetch logs (joined with volontari)
      const { data: logsData } = await db
        .from('presenze')
        .select(`
          id,
          tipo,
          timestamp,
          volontari (
            nome,
            cognome
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(5);

      if (logsData) {
        setLogs(logsData);
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
      <div className="mb-6 pl-2 animate-reveal" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Live Intelligence
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Panoramica<br />
          <span style={{ color: 'rgba(74,142,170,0.8)' }}>Real-time</span>
        </h1>
      </div>

      {/* Stats shards */}
      <div className="relative h-[200px] mb-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
        {/* Shard 1 — Scansioni */}
        <div className="shard-1 liquid-glass glass-gradient-bg animate-float absolute top-0 left-0 flex flex-col items-center justify-center p-6 z-20"
          style={{ width: '58%', height: 140 }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(74,142,170,0.1)' }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>qr_code_scanner</span>
          </div>
          <span className="text-4xl font-black text-slate-800 leading-none">{scansioni}</span>
          <span className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Scansioni Oggi</span>
        </div>

        {/* Shard 2 — In Sede */}
        <div className="shard-2 liquid-glass animate-float-slow absolute flex flex-col items-center justify-center p-6 z-10"
          style={{ width: '53%', height: 130, top: 32, right: 0, background: 'rgba(255,255,255,0.3)', animationDelay: '-1.5s' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(74,142,170,0.1)' }}>
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>group</span>
          </div>
          <span className="text-3xl font-black text-slate-800 leading-none">{inSede}</span>
          <span className="text-[8px] font-bold text-slate-500 mt-2 uppercase tracking-widest">In Sede</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4 mb-8">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] pl-2" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Azioni Rapide
        </h2>

        <div className="relative space-y-3">
          {/* Primary CTA — Scanner */}
          <button
            onClick={onScannerOpen}
            className="w-full liquid-btn text-white p-5 flex items-center space-x-5 active:scale-95 transition-all relative overflow-hidden group animate-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border border-white/30 shadow-inner"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, fontWeight: 700 }}>qr_code_scanner</span>
            </div>
            <div className="text-left relative z-10">
              <p className="font-black text-lg leading-tight tracking-tight">Registra Presenza</p>
              <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.15em]">Nuovo partecipante</p>
            </div>
            <div className="ml-auto pr-2 relative z-10">
              <span className="material-symbols-outlined opacity-60 group-hover:translate-x-1 transition-transform" style={{ fontSize: 20 }}>arrow_forward_ios</span>
            </div>
          </button>

          {/* Secondary CTA — Report */}
          <button className="w-full liquid-glass glass-gradient-bg p-4 rounded-[3rem] flex items-center space-x-5 active:scale-95 transition-all animate-reveal hover:-translate-y-1"
            style={{ animationDelay: '0.4s' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(74,142,170,0.1)' }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>analytics</span>
            </div>
            <div className="text-left">
              <p className="font-extrabold text-lg leading-tight text-slate-800">Invia Report</p>
              <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">Esporta CSV/PDF</p>
            </div>
            <div className="ml-auto pr-2">
              <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 20 }}>chevron_right</span>
            </div>
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-4 animate-reveal" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] pl-2" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Log Attività
        </h2>

        <div className="space-y-2">
          {logs.length === 0 ? (
            <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-6 text-center text-slate-400 text-xs italic">
              Nessuna attività registrata recentemente.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="liquid-glass glass-gradient-bg rounded-[2rem] p-4 flex items-center space-x-4 border-l-4"
                style={{ borderLeftColor: log.tipo === 'entrata' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: log.tipo === 'entrata' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: log.tipo === 'entrata' ? '#22c55e' : '#ef4444' }}>
                    {log.tipo === 'entrata' ? 'login' : 'logout'}
                  </span>
                </div>
                <div className="flex-grow">
                  <p className="font-bold text-slate-800 text-sm leading-tight">
                    {log.volontari?.nome} {log.volontari?.cognome}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                    {log.tipo} • {new Date(log.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
