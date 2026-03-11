import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { db } from '../utils/supabase';

export default function Scanner({ active, showFeedback, hideFeedback }) {
  const [tipo, setTipo] = useState('entrata');
  const [scanStatus, setScanStatus] = useState('IN ATTESA DEL BERSAGLIO');
  const [scanState, setScanState] = useState('idle'); // idle | scanning | success | error
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
    setScanStatus('INIZIALIZZAZIONE CAMERA...');
    setScanState('idle');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setScanStatus('ACCESSO CAMERA NEGATO');
      setScanState('error');
      showFeedback('error', 'Fotocamera inaccessibile', 'Concedi il permesso nel browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const handleVideoLoad = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setScanStatus('IN ATTESA DEL BERSAGLIO');
    setScanState('idle');

    let lastScan = 0;
    const tick = (timestamp) => {
      if (!streamRef.current || !active) return;
      if (timestamp - lastScan > 200 && video.readyState === video.HAVE_ENOUGH_DATA) {
        lastScan = timestamp;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
        if (code) onQRDetected(code.data);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const onQRDetected = async (code) => {
    if (cooldownRef.current || code === ultimoScanRef.current) return;
    cooldownRef.current = true;
    ultimoScanRef.current = code;
    setScanStatus('SCANSIONE IN CORSO...');
    setScanState('scanning');
    showFeedback('loading', 'Decodifica in corso', 'Attendi...');

    try {
      const { data: vol, error: ve } = await db.from('volontari').select('*').eq('codice_qr', code).single();
      hideFeedback();

      if (ve || !vol) {
        showFeedback('error', 'QR Non Valido', 'Codice non riconosciuto.');
        setScanStatus('SCANSIONE FALLITA');
        setScanState('error');
      } else {
        const ts = new Date().toISOString();
        const nome = `${vol.nome} ${vol.cognome}`;
        await db.from('presenze').insert({ volontario_id: vol.id, tipo, timestamp: ts });
        showFeedback('success', 'Successo!', `${nome} — ${tipo.toUpperCase()} registrata.`);
        setScanStatus('BERSAGLIO ACQUISITO ✓');
        setScanState('success');
      }
    } catch {
      hideFeedback();
      showFeedback('error', 'Errore DB', 'Controlla la connessione.');
      setScanStatus('ERRORE DI RETE');
      setScanState('error');
    }

    setTimeout(() => {
      cooldownRef.current = false;
      ultimoScanRef.current = null;
      setScanState('idle');
      if (streamRef.current && active) setScanStatus('IN ATTESA DEL BERSAGLIO');
    }, 4000);
  };

  const statusColor = {
    idle: 'text-slate-500',
    scanning: 'text-primary',
    success: 'text-emerald-500',
    error: 'text-rose-500',
  }[scanState];

  const frameColor = {
    idle: 'border-white/40',
    scanning: 'border-primary/60',
    success: 'border-emerald-400/80',
    error: 'border-rose-400/80',
  }[scanState];

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Page heading */}
      <div className="w-full pl-2 animate-reveal">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(74,142,170,0.6)' }}>
          QR Scanner
        </h2>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          Registra<br /><span style={{ color: 'rgba(74,142,170,0.8)' }}>Presenza</span>
        </h1>
      </div>

      {/* Status badge */}
      <div className={`text-[10px] font-black uppercase tracking-widest ${statusColor} transition-colors`}>
        {scanStatus}
      </div>

      {/* Video frame */}
      <div className={`liquid-glass ${frameColor} border-2 rounded-[2rem] overflow-hidden relative w-full max-w-sm aspect-square transition-all`}>
        <video
          ref={videoRef}
          autoPlay muted playsInline
          onLoadedMetadata={handleVideoLoad}
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {/* Corner decorations */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-primary/60 rounded-tl-xl" />
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-primary/60 rounded-tr-xl" />
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-primary/60 rounded-bl-xl" />
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-primary/60 rounded-br-xl" />
        {/* Scan line */}
        {active && scanState === 'idle' && <div className="scan-anim-line" />}
      </div>

      {/* Entrata / Uscita toggle */}
      <div className="liquid-glass glass-gradient-bg rounded-[2rem] p-1.5 flex space-x-1 w-full max-w-sm">
        <button
          onClick={() => setTipo('entrata')}
          className={`flex-1 py-3 rounded-[1.5rem] flex items-center justify-center space-x-2 font-black text-sm uppercase tracking-wider transition-all ${
            tipo === 'entrata'
              ? 'bg-emerald-400/80 text-white shadow-md'
              : 'text-slate-500 hover:bg-white/30'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>login</span>
          <span>Entrata</span>
        </button>
        <button
          onClick={() => setTipo('uscita')}
          className={`flex-1 py-3 rounded-[1.5rem] flex items-center justify-center space-x-2 font-black text-sm uppercase tracking-wider transition-all ${
            tipo === 'uscita'
              ? 'bg-rose-400/80 text-white shadow-md'
              : 'text-slate-500 hover:bg-white/30'
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          <span>Uscita</span>
        </button>
      </div>
    </div>
  );
}
