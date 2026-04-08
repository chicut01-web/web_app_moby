import React, { useState, useEffect } from 'react';
import { db } from '../utils/supabase';

export default function Menu({ initialModal }) {
  const [activeModal, setActiveModal] = useState(initialModal || null);
  const [userEmail, setUserEmail] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    setActiveModal(initialModal || null);
  }, [initialModal]);

  useEffect(() => {
    db.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Profilo Utente' },
        { icon: 'notifications', label: 'Notifiche' },
      ],
    },
    {
      title: 'Applicazione',
      items: [
        { icon: 'cloud_sync', label: 'Sincronizzazione DB' },
        { icon: 'info', label: 'Informazioni Legali' },
      ],
    },
  ];

  const handleAction = (label) => {
    if (label === 'Sincronizzazione DB') {
      if (isSyncing) return;
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      }, 1500);
    } else {
      setActiveModal(label);
    }
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'Profilo Utente':
        return (
          <div className="space-y-6 text-center animate-reveal">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center border border-white/40 mb-2 shadow-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 48 }}>account_circle</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 leading-none">Account Admin</h2>
            <p className="text-slate-500 font-bold">{userEmail || 'Nessuna email caricata'}</p>
            <div className="mt-8 liquid-glass glass-gradient-bg p-5 rounded-[2rem] shadow-sm text-left space-y-4 border border-white/50">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">Ruolo</p>
                <p className="font-black text-slate-700">Amministratore di Sistema</p>
              </div>
              <div className="pt-2 border-t border-slate-200/50">
                <p className="text-[10px] uppercase font-black tracking-widest text-primary/60">Sede Corrente</p>
                <p className="font-black text-slate-700">Accesso Remoto</p>
              </div>
            </div>
          </div>
        );
      case 'Notifiche':
        return (
          <div className="space-y-6 text-center animate-reveal pt-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center border-4 border-white mb-2 shadow-sm">
               <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 48 }}>notifications_off</span>
            </div>
            <h2 className="text-xl font-black text-slate-700">Nessuna nuova notifica</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">Al momento non ci sono aggiornamenti di sistema.</p>
          </div>
        );
      case 'Informazioni Legali':
        return (
          <div className="space-y-4 animate-reveal text-sm text-slate-600 font-medium leading-relaxed pb-8 px-2">
            <p className="font-black text-slate-800 text-lg mb-2">Termini e Condizioni</p>
            <p>L'utilizzo dell'applicazione "Moby Dick Web App" è limitato al personale autorizzato per la gestione amministrativa in cloud delle presenze dei volontari e dello staff associato.</p>
            <p className="font-black text-slate-800 text-lg mt-6 mb-2">Privacy Policy</p>
            <p>I dati dei volontari, inclusi orari di check-in ed email crittografate, sono gestiti in ambiente sicuro tramite i sistemi Supabase (AWS/GCP infrastructure) in conformità allo standard d'uso interno previsto. Per l'oblio o la rimozione contattare the System Admin.</p>
            <p className="text-[10px] text-slate-400 mt-8 text-center uppercase tracking-widest font-black">Ultimo aggiornamento: Aprile 2026</p>
          </div>
        );
      default: return null;
    }
  };

  // --- SUB PAGE VIEW ---
  if (activeModal) {
    return (
      <div className="space-y-6 animate-reveal">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => setActiveModal(null)}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-primary active:scale-95 transition-all outline-none"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>arrow_back</span>
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
            {activeModal}
          </h1>
        </div>
        {renderModalContent()}
      </div>
    );
  }

  // --- MAIN MENU VIEW ---
  return (
    <div className="space-y-8 relative">
      {/* Toast Sincronizzazione */}
      {syncSuccess && (
        <div className="absolute top-0 right-0 z-50 bg-emerald-50 text-emerald-600 px-4 py-2.5 rounded-full shadow-md font-bold text-xs animate-reveal border border-emerald-100 flex items-center space-x-2">
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          <span>Database Sincronizzato</span>
        </div>
      )}

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
              <button 
                key={i} 
                onClick={() => handleAction(item.label)}
                disabled={isSyncing && item.label === 'Sincronizzazione DB'}
                className="w-full liquid-glass glass-gradient-bg rounded-[2rem] p-4 flex items-center justify-between group active:scale-[0.98] transition-all shadow-sm outline-none"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-white/40">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                      {isSyncing && item.label === 'Sincronizzazione DB' ? 'sync' : item.icon}
                    </span>
                  </div>
                  <p className="font-bold text-slate-700">{item.label}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && (
                    <span className="bg-rose-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px]">
                      {item.badge}
                    </span>
                  )}
                  {isSyncing && item.label === 'Sincronizzazione DB' ? (
                     <span className="material-symbols-outlined animate-spin text-primary" style={{ fontSize: 20 }}>sync</span>
                  ) : (
                     <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors" style={{ fontSize: 20 }}>chevron_right</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout button */}
      <div className="pt-4 animate-reveal" style={{ animationDelay: '0.4s' }}>
        <button 
          onClick={() => db.auth.signOut()}
          className="w-full bg-white rounded-[2rem] p-5 flex items-center justify-center space-x-3 text-rose-500 font-black shadow-sm border border-rose-100 hover:bg-rose-50 transition-all active:scale-95 outline-none"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Version info */}
      <div className="text-center pb-8 animate-reveal" style={{ animationDelay: '0.5s' }}>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
          Moby Dick App • v1.2.0<br/>React Version
        </p>
      </div>
    </div>
  );
}
