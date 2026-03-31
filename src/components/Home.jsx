import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home({ onScannerOpen }) {
  const [entrate, setEntrate] = useState(0);
  const [uscite, setUscite] = useState(0);
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
        const countEntrate = presenzeData.filter(r => r.tipo === 'entrata').length;
        const countUscite = presenzeData.filter(r => r.tipo === 'uscita').length;
        setEntrate(countEntrate);
        setUscite(countUscite);
        setInSede(Math.max(0, countEntrate - countUscite));

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

      {/* Trend Chart */}
      <div className="animate-reveal" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-2 pl-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(74,142,170,0.6)' }}>
            Flusso Presenze
          </h2>
          <span className="text-[10px] font-bold text-slate-400 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-1"></span>
            Oggi
          </span>
        </div>

        <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-3 pt-5 h-[170px] shadow-sm relative overflow-hidden">
          {/* Subtle background glow for the chart */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          
          <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} style={{ outline: 'none' }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A8EAA" stopOpacity={0.6}/>
                  <stop offset="80%" stopColor="#4A8EAA" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 700 }}
                minTickGap={20}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: 'rgba(74,142,170,0.3)', strokeWidth: 2, strokeDasharray: '4 4' }} 
              />
              <Area 
                type="natural" 
                dataKey="count" 
                stroke="#4A8EAA" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorCount)" 
                animationDuration={2000}
                animationEasing="ease-out"
                activeDot={{ r: 6, fill: '#4A8EAA', stroke: '#fff', strokeWidth: 3, style: { filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' } }}
                style={{ filter: 'drop-shadow(0px 6px 8px rgba(74, 142, 170, 0.25))' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
