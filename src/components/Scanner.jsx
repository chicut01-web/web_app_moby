import React, { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import jsQR from 'jsqr';
import { db } from '../utils/supabase';

export default function Scanner({ active, showFeedback, hideFeedback }) {
  const [tipoCorrente, setTipoCorrente] = useState('entrata');
  const [scanStatus, setScanStatus] = useState('IN ATTESA DEL BERSAGLIO');
  const [scanColor, setScanColor] = useState('var(--sea-accent)');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cooldownRef = useRef(false);
  const ultimoScanRef = useRef(null);

  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [active]);

  const startCamera = async () => {
    if (streamRef.current) return;
    setScanStatus('INIZIALIZZAZIONE OTTICHE...');
    setScanColor('var(--sea-accent)');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setScanStatus('ACCESSO OTTICHE NEGATO');
      setScanColor('var(--moby-red)');
      showFeedback('error', 'Fotocamera inaccessibile', 'Fornisci i permessi necessari al browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setScanStatus('SISTEMA DISATTIVATO');
      setScanColor('var(--text-muted)');
    }
  };

  const handleVideoLoad = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setScanStatus('IN ATTESA DEL BERSAGLIO');

    const tick = () => {
      if (!streamRef.current || !active) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, {
          inversionAttempts: 'dontInvert'
        });
        if (code) {
          onQRDetected(code.data);
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
  };

  const onQRDetected = async (code) => {
    if (cooldownRef.current || code === ultimoScanRef.current) return;
    
    cooldownRef.current = true;
    ultimoScanRef.current = code;

    setScanColor('var(--sea-accent)');
    setScanStatus('SCANSIONE IN CORSO...');
    showFeedback('loading', 'Decodifica in corso', 'Attendi...');

    try {
      const { data: vol, error: ve } = await db
        .from('volontari')
        .select('*')
        .eq('codice_qr', code)
        .single();

      hideFeedback(); // rimuovi caricamento

      if (ve || !vol) {
        showFeedback('error', 'QR Non Valido', 'Codice non riconosciuto o corrotto.');
        setScanColor('var(--moby-red)');
        setScanStatus('SCANSIONE FALLITA');
      } else {
        const ts = new Date().toISOString();
        const nome = `${vol.nome} ${vol.cognome}`;

        await db.from('presenze').insert({
          volontario_id: vol.id,
          tipo: tipoCorrente,
          timestamp: ts
        });

        // Qui invocheremmo anche addLogItem dal parent (App.jsx), ignorato per semplicitá 
        // in questa riscrittura o gestibile via context/prop callbacks.
        
        showFeedback('success', 'Successo', `${nome} - ${tipoCorrente.toUpperCase()} registrata.`);
        setScanColor('var(--moby-green)');
        setScanStatus('BERSAGLIO ACQUISITO');
      }
    } catch (err) {
      hideFeedback();
      showFeedback('error', 'Errore DB', 'Controlla la connessione.');
      setScanColor('var(--moby-red)');
      setScanStatus('ERRORE DI RETE');
    }

    // Reset cooldown after 4s
    setTimeout(() => {
      cooldownRef.current = false;
      ultimoScanRef.current = null;
      setScanColor('var(--sea-accent)');
      if (streamRef.current && active) {
        setScanStatus('IN ATTESA DEL BERSAGLIO');
      }
    }, 4000);
  };

  return (
    <div className="scanner-view-inner">
      <div className="scanner-status" style={{ color: scanColor }}>
        {scanStatus}
      </div>

      <div className="scanner-frame-wrapper">
        <div className="scanner-video-container">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            onLoadedMetadata={handleVideoLoad} 
            id="video"
          />
          <canvas ref={canvasRef} id="canvas" style={{ display: 'none' }} />
          {active && <div className="scan-line" id="scanLine" style={{ display: 'block' }}></div>}
        </div>
      </div>

      <div className="toggle-container">
        <button 
          className={`toggle-btn ${tipoCorrente === 'entrata' ? 'active entrata' : ''}`}
          onClick={() => setTipoCorrente('entrata')}
        >
          <LogIn size={20} /> ENTRATA
        </button>
        <button 
          className={`toggle-btn ${tipoCorrente === 'uscita' ? 'active uscita' : ''}`}
          onClick={() => setTipoCorrente('uscita')}
        >
          <LogOut size={20} /> USCITA
        </button>
      </div>
    </div>
  );
}
