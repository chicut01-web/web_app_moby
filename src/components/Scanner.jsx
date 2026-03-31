import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { db } from '../utils/supabase';

export default function Scanner({ active, showFeedback, hideFeedback }) {
  const [tipo, setTipo] = useState('entrata');
  const [scanStatus, setScanStatus] = useState('');
  const [scanState, setScanState] = useState('idle'); // idle | scanning | success | error
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const cooldownRef = useRef(false);
  const ultimoScanRef = useRef(null);
  const onQRDetectedRef = useRef(null);

  useEffect(() => {
    onQRDetectedRef.current = onQRDetected;
  });

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
        video: { 
          facingMode: 'environment', 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15, max: 30 }
        }
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
    
    // Set canvas to a smaller fixed dimension strictly for jsQR parsing
    // This prevents 1080p frames from crashing the mobile CPU
    const MAX_DIM = 400;
    const scale = Math.min(MAX_DIM / video.videoWidth, MAX_DIM / video.videoHeight, 1);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    setScanStatus('');
    setScanState('idle');

    let lastScan = 0;
    const tick = (timestamp) => {
      if (!streamRef.current || !active) return;
      // Throttle to every 400ms to save CPU
      if (timestamp - lastScan > 400 && video.readyState === video.HAVE_ENOUGH_DATA) {
        lastScan = timestamp;
        // willReadFrequently optimizes performance for repeated getImageData calls
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Pass the much smaller image array to jsQR
        const code = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
        if (code && onQRDetectedRef.current) onQRDetectedRef.current(code.data);
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
        const nome = `${vol.nome} ${vol.cognome}`;
        
        // Trova l'inizio della giornata odierna
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Controlla presenze esistenti per questo volontario oggi
        const { data: presenzeOggi } = await db
          .from('presenze')
          .select('tipo')
          .eq('volontario_id', vol.id)
          .gte('timestamp', startOfDay.toISOString());

        const hasEntrata = presenzeOggi && presenzeOggi.some(p => p.tipo === 'entrata');
        const hasUscita = presenzeOggi && presenzeOggi.some(p => p.tipo === 'uscita');

        if (tipo === 'entrata' && hasEntrata) {
          showFeedback('error', 'Già Registrato', `${nome} ha già un'ENTRATA oggi.`);
          setScanStatus('DUPLICATO VIETATO');
          setScanState('error');
        } else if (tipo === 'uscita' && hasUscita) {
          showFeedback('error', 'Già Registrato', `${nome} ha già un'USCITA oggi.`);
          setScanStatus('DUPLICATO VIETATO');
          setScanState('error');
        } else if (tipo === 'uscita' && !hasEntrata) {
          showFeedback('error', 'Manca Entrata', `${nome} deve prima fare l'ENTRATA.`);
          setScanStatus('USCITA NON VALIDA');
          setScanState('error');
        } else {
          // Tutto regolare, registriamo
          const ts = new Date().toISOString();
          const { error: insertError } = await db.from('presenze').insert({ volontario_id: vol.id, tipo, timestamp: ts });
          
          if (insertError) throw new Error(insertError.message);

          showFeedback('success', 'Successo!', `${nome} — ${tipo.toUpperCase()} registrata.`);
          setScanStatus('BERSAGLIO ACQUISITO ✓');
          setScanState('success');
        }
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
      if (streamRef.current && active) setScanStatus('');
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
    <div className="flex flex-col items-center space-y-3 pb-8">
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
      {scanStatus && (
        <div className={`text-[10px] font-black uppercase tracking-widest ${statusColor} transition-colors`}>
          {scanStatus}
        </div>
      )}

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
