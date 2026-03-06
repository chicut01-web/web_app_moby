import React, { useState, useEffect } from 'react';
import { Wifi, LogIn, LogOut, History } from 'lucide-react';

export default function Home() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = time.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const dateLabel = time.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

  // In a real app with state management, these would be pulled from a global store/context
  const stats = { entrate: 0, uscite: 0 };
  const logs = [];

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <img
          src="logo/logo_mobydickets-1-3.png"
          alt="Moby Dick ETS"
          className="header-logo"
          onError={(e) => {
            e.target.src = '';
            e.target.alt = 'MOBY DICK ETS';
          }}
        />
      </div>

      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div className="date-small" id="dateLabel">{dateLabel}</div>
        <div className="time-large" id="clock">{clock}</div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '0.8rem', color: 'var(--moby-green)' }}>
          <Wifi size={16} /> Sistema Operativo
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-box entrata">
          <LogIn size={80} className="stat-icon-bg" />
          <div className="stat-val" id="statEntrate">{stats.entrate}</div>
          <div className="stat-lbl">Entrate Oggi</div>
        </div>
        <div className="stat-box uscita">
          <LogOut size={80} className="stat-icon-bg" />
          <div className="stat-val" id="statUscite">{stats.uscite}</div>
          <div className="stat-lbl">Uscite Oggi</div>
        </div>
      </div>

      <div className="section-title">
        <History size={16} /> Log Attività
      </div>
      <div className="glass-card" style={{ padding: '16px' }}>
        <div className="activity-list" id="logList">
          {logs.length === 0 ? (
            <div className="log-empty">Nessun movimento registrato oggi nelle profondità.</div>
          ) : (
             logs.map((log, i) => (
               <div key={i} className="activity-item">
                  <div className={`act-icon ${log.tipo}`}>
                    {log.tipo === 'entrata' ? <LogIn size={20} /> : <LogOut size={20} />}
                  </div>
                  <div className="act-info">
                    <div className="act-name">{log.nome}</div>
                    <div className="act-type">{log.tipo === 'entrata' ? 'IN' : 'OUT'} Registrata</div>
                  </div>
                  <div className="act-time">{new Date(log.ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
             ))
          )}
        </div>
      </div>
    </>
  );
}
