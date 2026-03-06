import React from 'react';
import { Anchor, Download } from 'lucide-react';

export default function Tools({ showFeedback }) {

  const exportCSV = () => {
    // Note: in a real implementation, you'd pull this global LOG list
    const LOG_TODAY = []; 
    
    if (LOG_TODAY.length === 0) {
      showFeedback('error', 'Estrazione Fallita', 'Nessun dato registrato oggi nella stiva.');
      return;
    }

    const rows = [['Nome', 'Tipo', 'OrARIO']];
    LOG_TODAY.forEach(e => {
      rows.push([
        e.nome,
        e.tipo,
        new Date(e.ts).toLocaleTimeString('it-IT')
      ]);
    });
    
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presenze_abisso_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    showFeedback('success', 'Estrazione Completata', 'Report scaricato con successo.');
  };

  return (
    <div style={{ paddingTop: '40px' }}>
      <div className="section-title" style={{ justifyContent: 'center', fontSize: '1.2rem', marginBottom: '30px' }}>
        <Anchor size={20} /> Strumenti Abissali
      </div>

      <button className="btn-massive" onClick={exportCSV}>
        <Download size={32} />
        SCARICA REPORT CSV
      </button>

      <div className="footer-info">
        <img 
          src="logo/logo_mobydickets-1-3.png" 
          alt="Logo" 
          style={{ height: '40px', opacity: 0.5, marginBottom: '10px', filter: 'grayscale(1)' }} 
        /><br />
        Sistema Gestione Presenze v2.0<br />
        Design "Deep Sea"
      </div>
    </div>
  );
}
