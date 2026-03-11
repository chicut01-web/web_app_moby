import React from 'react';

export default function Events() {
  const events = [
    { id: 1, title: 'Assemblea Generale', date: '15 Mar', time: '18:30', category: 'Interno' },
    { id: 2, title: 'Raccolta Alimentare', date: '21 Mar', time: '09:00', category: 'Sociale' },
    { id: 3, title: 'Corso Formazione', date: '28 Mar', time: '14:00', category: 'Training' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="animate-reveal">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Programma Attività
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Eventi<br />
          <span style={{ color: 'rgba(74,142,170,0.8)' }}>Calendario</span>
        </h1>
      </div>

      {/* Events List */}
      <div className="space-y-3 animate-reveal" style={{ animationDelay: '0.1s' }}>
        {events.map((event, index) => (
          <div key={event.id} className="liquid-glass glass-gradient-bg rounded-[2.5rem] p-5 flex items-center space-x-6 hover:-translate-y-1 transition-all group">
            <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex flex-col items-center justify-center border border-white/40 shadow-inner">
              <p className="text-[10px] font-black uppercase tracking-tighter text-primary/60">{event.date.split(' ')[1]}</p>
              <p className="text-xl font-black text-primary leading-none">{event.date.split(' ')[0]}</p>
            </div>
            <div className="flex-grow">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                  {event.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{event.time}</span>
              </div>
              <p className="font-black text-slate-800 text-lg leading-tight tracking-tight">{event.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State / Bottom Info */}
      <div className="animate-reveal" style={{ animationDelay: '0.3s' }}>
        <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest py-8">
          Altri eventi in arrivo...
        </p>
      </div>
    </div>
  );
}
