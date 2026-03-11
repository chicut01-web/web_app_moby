import React from 'react';

export default function Menu() {
  const sections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Profilo Utente' },
        { icon: 'notifications', label: 'Notifiche', badge: '2' },
      ],
    },
    {
      title: 'Applicazione',
      items: [
        { icon: 'cloud_sync', label: 'Sincronizzazione DB' },
        { icon: 'help', label: 'Supporto tecnico' },
        { icon: 'info', label: 'Informazioni Legali' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="animate-reveal">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Area Personale
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Menu<br />
          <span style={{ color: 'rgba(74,142,170,0.8)' }}>Impostazioni</span>
        </h1>
      </div>

      {/* Sections */}
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-4 animate-reveal" style={{ animationDelay: `${0.1 * (idx + 1)}s` }}>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] pl-2 text-primary/60">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item, i) => (
              <button key={i} className="w-full liquid-glass glass-gradient-bg rounded-[2rem] p-4 flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-white/40">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>{item.icon}</span>
                  </div>
                  <p className="font-bold text-slate-700">{item.label}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="bg-rose-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px]">
                      {item.badge}
                    </span>
                  )}
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors" style={{ fontSize: 20 }}>chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout button */}
      <div className="pt-4 animate-reveal" style={{ animationDelay: '0.4s' }}>
        <button className="w-full liquid-glass rounded-[2rem] p-5 flex items-center justify-center space-x-3 text-rose-500 font-black border-rose-100 hover:bg-rose-50/50 transition-all active:scale-95">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Version info */}
      <div className="text-center pb-8 animate-reveal" style={{ animationDelay: '0.5s' }}>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Moby Dick App • v1.2.0
        </p>
      </div>
    </div>
  );
}
