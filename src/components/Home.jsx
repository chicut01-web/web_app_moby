import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home({ onScannerOpen }) {
  const [scansioni, setScansioni] = useState(0);
  const [inSede, setInSede] = useState(0);
  const [chartData, setChartData] = useState([]);

  // Load real stats and logs from Supabase
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    async function fetchData() {
      // Fetch stats for today
      const { data: presenzeData } = await db
        .from('presenze')
        .select('tipo, timestamp')
        .gte('timestamp', today + 'T00:00:00')
        .lte('timestamp', today + 'T23:59:59')
        .order('timestamp', { ascending: true });

      if (presenzeData) {
        setScansioni(presenzeData.length);
        const entrate = presenzeData.filter(r => r.tipo === 'entrata').length;
        const uscite = presenzeData.filter(r => r.tipo === 'uscita').length;
        setInSede(Math.max(0, entrate - uscite));

        // Group by hour for the chart
        const hourlyBuckets = Array.from({ length: 15 }, (_, i) => {
          const hour = i + 7; // From 07:00 to 21:00
          return { time: `${hour}:00`, count: 0 };
        });

        presenzeData.forEach(p => {
          const hour = new Date(p.timestamp).getHours();
          if (hour >= 7 && hour <= 21) {
            hourlyBuckets[hour - 7].count += 1;
          }
        });

        // Filter out trailing zero hours after current time
        const currentHour = new Date().getHours();
        const activeData = hourlyBuckets.filter((_, i) => (i + 7) <= Math.max(currentHour, 10)); // Show at least up to 10:00

        setChartData(activeData);
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

  // Custom visual tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="liquid-glass glass-gradient-bg p-3 rounded-2xl border border-white/40 shadow-xl">
          <p className="text-[10px] font-bold text-slate-500 mb-1">{label}</p>
          <p className="text-xl font-black text-primary leading-none">{payload[0].value} <span className="text-[10px] uppercase text-slate-400">Scans</span></p>
        </div>
      );
    }
    return null;
  };

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
      <div className="relative h-[200px] mb-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
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

      {/* Trend Chart */}
      <div className="animate-reveal" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4 pl-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(74,142,170,0.6)' }}>
            Flusso Presenze
          </h2>
          <span className="text-[10px] font-bold text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></span>
            Oggi
          </span>
        </div>

        <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-4 pt-6 h-[220px] shadow-sm relative overflow-hidden">
          {/* Subtle background glow for the chart */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A8EAA" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4A8EAA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                minTickGap={15}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(74,142,170,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#4A8EAA" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
