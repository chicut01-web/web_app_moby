import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import qrcode from 'qrcode';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAZIONE ---
// (Inserisci qui i dati reali solo quando vorrai inviare le email)
const SIMULATION_MODE = false; // Imposta a false quando sei pronto a inviare DAVVERO
const INTERVIEW_DATE = '15 Aprile alle ore 10:00';
const INTERVIEW_LOCATION = 'sede Moby Dick in Via delle Vele 32';

// Supabase (recuperato dalle tue variabili d'ambiente o mettile qui)
const SUPABASE_URL = 'https://czsbkfbtjlrbugmggzpn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6c2JrZmJ0amxyYnVnbWdnenBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTY4MzEsImV4cCI6MjA4ODE5MjgzMX0.bAl9rSpvN2eAGSUhyBYg4aKvgnwPwrLP8fDiUkQ1grM'; // Modifica se usi la Service Role Key per inserimenti con privilegi
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Mailer (Esempio per usare un account Gmail standard)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'chicut01@gmail.com', // Da cambiare
    pass: 'uxwt tocs dfkt gmgw'         // Da cambiare (App Password, non la psw dell'account)
  }
});

// --- FUNZIONAMENTO SCRIPT ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ ERRORE: Devi specificare il nome del file CSV.");
  console.log("Esempio: node scripts/invia_inviti.js documento/documento_prova.csv");
  process.exit(1);
}

const csvFilePath = path.resolve(args[0]);
const results = [];

console.log("=====================================");
console.log(`🚀 INIZIO SCRIPT (Simulazione: ${SIMULATION_MODE ? 'ATTIVA ✅' : 'DISATTIVA ❌'})`);
console.log("=====================================\n");

fs.createReadStream(csvFilePath)
  .pipe(csv({ separator: ';' })) // Usa il punto e virgola, visto che il tuo file CSV lo usa
  .on('data', (data) => results.push(data))
  .on('end', async () => {
    console.log(`📊 Letto file CSV con successo. Trovati ${results.length} volontari.`);

    for (const [index, row] of results.entries()) {
      // Esegui SOLO per il primo elemento (Christian Izzo)
      if (index > 0) {
        console.log(`\n🛑 Interrotto: Test reale configurato solo per il primo utente.`);
        break;
      }

      const nome = row['Nome'];
      const cognome = row['Cognome'];
      const email = row['Email'];
      const codiceFiscale = row['CodiceFiscale'];
      const telefono = row['Telefono'];
      const codiceProgetto = row['CodiceProgettoSelezionato'];
      const titoloProgetto = row['TitoloProgettoSelezionato'];
      const codiceSede = row['CodiceSedeSelezionata'];
      
      // Formatting data_nascita from DD/MM/YYYY to YYYY-MM-DD
      let dataNascitaFormatted = null;
      if (row['DataNascita']) {
        const parts = row['DataNascita'].split('/');
        if (parts.length === 3) {
          dataNascitaFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      if (!nome || !cognome || !email) {
        console.warn(`[!] Salto riga ${index + 1}: Dati anagrafici o email mancanti.`);
        continue;
      }

      // 1. Genera un codice identificativo univoco (QR)
      const codice_qr = uuidv4();

      if (SIMULATION_MODE) {
        console.log(`\n--- Volontario ${index + 1}: ${nome} ${cognome} ---`);
        console.log(`  ✉️  Email: ${email}`);
        console.log(`  🔑  Codice QR Generato: ${codice_qr}`);
        console.log(`  💾  (Supabase) Inserirebbe: { nome: '${nome}', cognome: '${cognome}', email: '${email}', codice_qr: '${codice_qr}', telefono: '${telefono}', codice_fiscale: '${codiceFiscale}'... }`);
        console.log(`  📧  (Email) Invierebbe invito con allegato QR a ${email}.`);
      } else {
        try {
          // 2. Inserimento nel database Supabase
          const { error: dbError } = await supabase
            .from('volontari')
            .insert({
              nome: nome,
              cognome: cognome,
              email: email,
              codice_qr: codice_qr,
              telefono: telefono,
              codice_fiscale: codiceFiscale,
              data_nascita: dataNascitaFormatted,
              codice_progetto: codiceProgetto,
              titolo_progetto: titoloProgetto,
              codice_sede: codiceSede
            });

          if (dbError) throw new Error(`Db Error: ${dbError.message}`);

          // 3. Generazione dell'immagine del QR e salvataggio in memoria (Buffer)
          const qrBuffer = await qrcode.toBuffer(codice_qr, {
            type: 'png',
            width: 300,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' }
          });

          // 4. Preparazione e Invio Email
          const mailOptions = {
            from: '"Team Moby Dick" <noreply@mobydick.it>',
            to: email,
            subject: 'Convocazione Colloquio per Servizio Civile - Il tuo Pass QR',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>Ciao ${nome} ${cognome},</h2>
                <p>Ti confermiamo che la tua candidatura è in fase di valutazione per il progetto.</p>
                <p>Sei stato/a ufficialmente convocato/a per un colloquio conoscitivo che si terrà in data <strong>${INTERVIEW_DATE}</strong> presso la <strong>${INTERVIEW_LOCATION}</strong>.</p>
                <p>In allegato a questa email troverai un <strong>Codice QR</strong> personale, che è il tuo "pass di accesso" ufficiale.</p>
                <br />
                <h3 style="color: #4A8EAA;">⚠️ Cosa Devi Fare</h3>
                <p>Salva il codice QR dell'allegato su telefono oppure stampalo. <strong>È strettamente necessario</strong> mostrarlo ai responsabili il giorno del colloquio per registrare la tua presenza nel sistema.</p>
                <br />
                <p>Restiamo a disposizione per qualsiasi dubbio.</p>
                <p>A presto,<br /><em>Lo Staff Moby Dick</em></p>
              </div>
            `,
            attachments: [
              {
                filename: `moby_qr_pass_${nome}_${cognome}.png`,
                content: qrBuffer,
                contentType: 'image/png'
              }
            ]
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`✅ [SUCCESSO] Inviato a ${email} (${nome} ${cognome}) - ID: ${info.messageId}`);
        } catch (err) {
          console.error(`❌ [ERRORE] Fallito elaborazione per ${nome} ${cognome} (${email}):`, err.message);
        }
      }
    }

    console.log("\n=====================================");
    console.log(`✅ OPERAZIONE COMPLETATA.`);
    if (SIMULATION_MODE) {
      console.log(`La simulazione è andata a buon fine. Nessun dato reale è stato alterato.\nPer avviare l'invio e il salvataggio reale, cambia "SIMULATION_MODE = false" in cima al file scripts/invia_inviti.js`);
    } else {
      console.log(`Tutti gli inserimenti e gli invii sono stati processati.`);
    }
  });
