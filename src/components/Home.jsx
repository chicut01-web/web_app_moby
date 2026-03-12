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



    </>
  );
}
