import React from 'react';

export default function Report() {
  const handleExport = () => {
    // Placeholder for actual CSV generation logic
    alert("Funzionalità di esportazione report in arrivo!");
  };

  return (
    <div className="animate-reveal">
      <div className="mb-6 pl-2">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,142,170,0.6)' }}>
          Esportazione Dati
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Report<br />
          <span style={{ color: 'rgba(74,142,170,0.8)' }}>Presenze</span>
        </h1>
      </div>

      <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-6 text-center shadow-lg mb-6">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'rgba(74,142,170,0.1)' }}>
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>analytics</span>
        </div>
        <h3 className="font-black text-slate-800 text-xl mb-2">Esporta Registro</h3>
        <p className="text-sm text-slate-500 font-medium mb-6">
          Scarica il file completo di tutte le presenze registrate dai volontari in formato elaborabile.
        </p>
        
        <button 
          onClick={handleExport}
          className="w-full liquid-btn text-white p-4 rounded-full font-black flex items-center justify-center space-x-2 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
          <span>Scarica CSV</span>
        </button>
      </div>
    </div>
  );
}
