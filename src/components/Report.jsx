import React, { useState } from 'react';
import { db } from '../utils/supabase';

export default function Report() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('presenze')
        .select(`
          id,
          timestamp,
          tipo,
          volontari (
            nome,
            cognome,
            email,
            telefono,
            codice_progetto,
            titolo_progetto,
            codice_sede,
            codice_fiscale,
            data_nascita
          )
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Nessun dato da esportare.");
        setLoading(false);
        return;
      }

      const headers = "Nome,Cognome,Email,Telefono,Codice Progetto,Titolo Progetto,Codice Sede,Codice Fiscale,Data di Nascita,Azione,Data,Ora\n";
      const rows = data.map(e => {
          const date = new Date(e.timestamp);
          const dateStr = date.toLocaleDateString('it-IT');
          const timeStr = date.toLocaleTimeString('it-IT');
          const vol = e.volontari || {};
          
          // Quotes are used to handle commas inside text fields correctly
          const nome = `"${vol.nome || ''}"`;
          const cognome = `"${vol.cognome || ''}"`;
          const email = `"${vol.email || ''}"`;
          const telefono = `"${vol.telefono || ''}"`;
          const codiceProgetto = `"${vol.codice_progetto || ''}"`;
          const titoloProgetto = `"${vol.titolo_progetto || ''}"`;
          const codiceSede = `"${vol.codice_sede || ''}"`;
          const codiceFiscale = `"${vol.codice_fiscale || ''}"`;
          // Formattiamo la data dal DB se esiste
          let dataNascitaVal = vol.data_nascita ? new Date(vol.data_nascita).toLocaleDateString('it-IT') : '';
          const dataNascita = `"${dataNascitaVal}"`;
          const tipo = `"${e.tipo || ''}"`;
          
          return `${nome},${cognome},${email},${telefono},${codiceProgetto},${titoloProgetto},${codiceSede},${codiceFiscale},${dataNascita},${tipo},${dateStr},${timeStr}`;
      }).join("\n");

      // Blob ensures encoding is preserved and download works for large files
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `moby_presenze_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error("Errore esportazione CSV:", err);
      alert("Si è verificato un errore durante l'esportazione.");
    } finally {
      setLoading(false);
    }
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
          disabled={loading}
          className={`w-full ${loading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'liquid-btn text-white'} p-4 rounded-full font-black flex items-center justify-center space-x-2 active:scale-95 transition-all`}
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20 }}>sync</span>
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
          )}
          <span>{loading ? 'Generazione in corso...' : 'Scarica CSV'}</span>
        </button>
      </div>
    </div>
  );
}
