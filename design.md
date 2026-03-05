# 🐋 Design Guide — Presenze Volontari
### Tema: Moby Dick — Abisso Oceanico

Ispirazione visiva: **[moby-dick-three.vercel.app](https://moby-dick-three.vercel.app)**
Associazione: **Moby Dick ETS** — Servizio Civile

---

## 🎨 Identità visiva

Il design abbandona ogni estetica digitale generica.
Si ispira all'oceano profondo, ai diari di bordo, alle carte nautiche del XIX secolo — filtrate attraverso una sensibilità moderna e dark.

**Concept emotivo:** _stai "salpando" verso la tua giornata di servizio._
Ogni scansione è un'onda. Ogni presenza, una rotta segnata sul quaderno di bordo.

---

## 🖌️ Palette Colori

```
--ocean-deep:    #060d18   /* Fondo — abisso totale */
--ocean-dark:    #0a1628   /* Surface principale */
--ocean-mid:     #0f2040   /* Surface secondaria / card */
--ocean-light:   #1a3a6e   /* Bordi e divisori */
--foam:          #f0ede4   /* Bianco sporco — crema vecchia carta */
--parchment:     #d4c9a8   /* Testo secondario — pergamena */
--whale-white:   #e8e0cc   /* Testo primario — avorio */
--ink-gold:      #c9a84c   /* Accent 1 — inchiostro dorato */
--biolum:        #4dd9c0   /* Accent 2 — bioluminescenza */
--danger-coral:  #e05a4e   /* Errori — corallo profondo */
--wave:          #1e4f82   /* Onde e movimenti */
```

**Regola:** il background non è mai piatto — ha sempre un gradiente verticale da `#060d18` (top) a `#0a1628` (bottom), con una texture noise sottile sovrapposta al 4% di opacità per simulare la profondità dell'acqua.

---

## ✍️ Tipografia

### Font Stack

| Ruolo | Font | Peso | Importazione |
|-------|------|------|-------------|
| Display / Titoli | **Playfair Display** | 700, 900 italic | Google Fonts |
| Body / UI | **Lora** | 400, 600 | Google Fonts |
| Monospace / Dati | **Courier Prime** | 400, 700 | Google Fonts |
| Label / Tag | **Cinzel** | 400 | Google Fonts |

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,900&family=Lora:wght@400;600&family=Courier+Prime:wght@400;700&family=Cinzel&display=swap" rel="stylesheet">
```

### Gerarchia

```css
/* Titolo principale */
h1 {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 900;
  font-size: clamp(2rem, 8vw, 4.5rem);
  color: var(--whale-white);
  letter-spacing: -0.02em;
  line-height: 1.05;
}

/* Sottotitoli / sezioni */
h2 {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--ink-gold);
}

/* Testo corrente */
p {
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  color: var(--parchment);
  line-height: 1.7;
}

/* Orari / dati tecnici */
.data {
  font-family: 'Courier Prime', monospace;
  color: var(--biolum);
  letter-spacing: 0.05em;
}
```

---

## 🌊 Textures & Sfondi

### 1. Sfondo principale — Abisso
```css
body {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(30,79,130,0.25) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 80%, rgba(77,217,192,0.04) 0%, transparent 50%),
    linear-gradient(180deg, #060d18 0%, #0a1628 100%);
}

/* Noise texture sovrapposta */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}
```

### 2. Pattern carta nautica
```css
/* Linee di latitudine/longitudine sottilissime */
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(201,168,76,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(201,168,76,0.04) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}
```

### 3. Vignette laterale (senso di profondità)
```css
.vignette {
  position: fixed;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(6,13,24,0.8) 100%);
  pointer-events: none;
  z-index: 0;
}
```

---

## 🧩 Componenti UI

### Card principale
```css
.card {
  background: rgba(15, 32, 64, 0.6);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 4px; /* Spigoli quasi vivi — non arrotondati come il digitale */
  backdrop-filter: blur(12px);
  box-shadow:
    0 0 0 1px rgba(201,168,76,0.05),
    0 8px 32px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(240,237,228,0.05);
  position: relative;
}

/* Linea dorata in cima alla card */
.card::before {
  content: '';
  position: absolute;
  top: 0; left: 20%; right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--ink-gold), transparent);
  opacity: 0.5;
}
```

### Scanner QR — Mirino nautico
```css
/* Cornici a 45° come sextant crosshairs */
.scan-frame-corner {
  width: 32px; height: 32px;
  border-color: var(--ink-gold);
  border-style: solid;
  opacity: 0.9;
  box-shadow: 0 0 8px rgba(201,168,76,0.4);
}

/* Scan line = onda che scansiona */
.scan-wave {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--biolum), transparent);
  box-shadow: 0 0 12px var(--biolum), 0 0 4px rgba(77,217,192,0.8);
  animation: wave-scan 2.8s ease-in-out infinite;
}
```

### Bottoni
```css
.btn-primary {
  background: transparent;
  border: 1px solid var(--ink-gold);
  color: var(--ink-gold);
  font-family: 'Cinzel', serif;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

/* Effetto fill acqua al hover */
.btn-primary::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 0;
  background: rgba(201,168,76,0.1);
  transition: height 0.4s ease;
}
.btn-primary:hover::after { height: 100%; }
.btn-primary:hover {
  box-shadow: 0 0 20px rgba(201,168,76,0.3);
  color: var(--foam);
}

/* Entrata */
.btn-entrata {
  border-color: var(--biolum);
  color: var(--biolum);
}
.btn-entrata:hover { box-shadow: 0 0 20px rgba(77,217,192,0.3); }

/* Uscita */
.btn-uscita {
  border-color: var(--danger-coral);
  color: var(--danger-coral);
}
```

### Badge di feedback
```css
.feedback-ok {
  border-left: 3px solid var(--biolum);
  background: rgba(77,217,192,0.08);
  font-family: 'Lora', serif;
  font-style: italic;
  padding: 16px 20px;
  color: var(--biolum);
}

.feedback-error {
  border-left: 3px solid var(--danger-coral);
  background: rgba(224,90,78,0.08);
  color: var(--danger-coral);
}
```

### Log delle presenze — stile "quaderno di bordo"
```css
.log-entry {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(201,168,76,0.08);
  font-family: 'Lora', serif;
}

.log-time {
  font-family: 'Courier Prime', monospace;
  font-size: 0.75rem;
  color: var(--ink-gold);
  opacity: 0.7;
  flex-shrink: 0;
  min-width: 60px;
}

.log-name {
  font-size: 0.9rem;
  color: var(--whale-white);
  font-style: italic;
}

.log-tipo-badge {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  margin-left: auto;
}

.log-tipo-badge.entrata {
  border-color: rgba(77,217,192,0.4);
  color: var(--biolum);
}
.log-tipo-badge.uscita {
  border-color: rgba(224,90,78,0.4);
  color: var(--danger-coral);
}
```

---

## ✨ Animazioni

```css
/* Onde ambientali di sfondo */
@keyframes deep-pulse {
  0%, 100% { opacity: 0.03; transform: scale(1); }
  50%       { opacity: 0.08; transform: scale(1.05); }
}

/* Scan wave oceanica */
@keyframes wave-scan {
  0%   { top: 5%;  opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 95%; opacity: 0; }
}

/* Comparsa elementi — sale in superficie */
@keyframes surface {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Glow bioluminescente pulsante */
@keyframes biolum-pulse {
  0%, 100% { box-shadow: 0 0 8px rgba(77,217,192,0.3); }
  50%       { box-shadow: 0 0 24px rgba(77,217,192,0.7); }
}

/* Status dot — respiro dell'oceano */
@keyframes ocean-breath {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50%       { transform: scale(1.6); opacity: 0.4; }
}
```

---

## 🗺️ Layout & Spaziatura

```
Mobile (max-width: 480px)
  ├── padding: 24px 20px
  ├── gap tra sezioni: 28px
  └── max-width: 460px centrato

Elementi visivi speciali:
  ├── Divisore sezione: <hr> con gradiente oro
  │   background: linear-gradient(90deg, transparent, var(--ink-gold), transparent)
  │   height: 1px, border: none
  │
  ├── Numero / statistica grande:
  │   font-family: Playfair Display italic
  │   font-size: clamp(3rem, 12vw, 5rem)
  │   color: var(--whale-white) con text-shadow oro
  │
  └── Header logo:
      font-family: Playfair Display italic 900
      con sottotitolo in Cinzel letterspacing 0.3em
```

---

## 🐳 Elementi decorativi opzionali

### Sagoma balena SVG (watermark di sfondo)
```html
<!-- Balena semitrasparente come watermark -->
<svg class="whale-bg" viewBox="0 0 200 100" fill="none">
  <path d="M10,50 Q40,20 80,40 Q120,60 160,35 Q180,28 190,50
           Q180,65 160,58 Q120,75 80,60 Q40,75 20,65 Z"
        fill="rgba(240,237,228,0.025)" />
  <path d="M185,50 Q195,40 198,50 Q195,60 185,55"
        fill="rgba(240,237,228,0.025)" />
</svg>
```

```css
.whale-bg {
  position: fixed;
  bottom: 5%;
  right: -5%;
  width: 60vw;
  max-width: 400px;
  pointer-events: none;
  z-index: 0;
}
```

### Separatore — "onde" stilizzate
```html
<div class="wave-divider">〜〜〜</div>
```
```css
.wave-divider {
  text-align: center;
  color: rgba(201,168,76,0.3);
  font-size: 1.2rem;
  letter-spacing: 0.5em;
  margin: 8px 0;
}
```

---

## 🔄 Integrazione con il file `presenze-volontari.md`

Sostituire nel file di app le variabili CSS con questa palette:

```
--accent  → var(--ink-gold)     #c9a84c
--accent2 → var(--biolum)       #4dd9c0
--bg      → var(--ocean-deep)   #060d18
--surface → var(--ocean-dark)   #0a1628
--text    → var(--whale-white)  #e8e0cc
--muted   → var(--parchment)    #d4c9a8
--danger  → var(--danger-coral) #e05a4e
--border  → rgba(201,168,76,0.18)
```

E sostituire i font `Space Mono` / `Syne` con:
```
Titoli     → Playfair Display italic
Label/Tag  → Cinzel uppercase
Dati/Mono  → Courier Prime
Body       → Lora
```

---

## 📋 Checklist implementazione

- [ ] Importare i Google Fonts (Playfair Display, Lora, Courier Prime, Cinzel)
- [ ] Applicare la palette ocean al posto dei colori neon verde/cyan
- [ ] Aggiungere texture noise + griglia carta nautica al body
- [ ] Aggiungere la sagoma balena SVG come watermark fisso
- [ ] Sostituire le cornici del mirino QR con stile sextant dorato
- [ ] Cambiare la scan line in bioluminescente cyan su sfondo dark
- [ ] Usare spigoli quasi vivi (border-radius: 2–4px) invece che arrotondati
- [ ] Aggiungere border-left dorato alle card principali
- [ ] Testare su mobile con sfondo abissale full viewport

---

*"Non è tanto il mare che temi — è la profondità che non riesci a vedere."*
— ispirato a Moby Dick ETS