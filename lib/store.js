// Archivio delle partite in memoria del server.
// Va benissimo per l'uso in classe (una lezione = un processo attivo).
// Se in futuro servisse conservare le partite tra riavvii del server,
// si puo' sostituire con un database tipo Vercel KV senza cambiare le API.

const partite = global.__partiteStore || (global.__partiteStore = new Map());

function generaCodice() {
  const caratteri = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codice = "";
  for (let i = 0; i < 5; i++) {
    codice += caratteri[Math.floor(Math.random() * caratteri.length)];
  }
  return codice;
}

export function creaPartita({ titolo, versi }) {
  let codice = generaCodice();
  while (partite.has(codice)) codice = generaCodice();

  const partita = {
    codice,
    titolo,
    versi, // [{ autore, testo, concetti }]
    creataIl: Date.now(),
    giocatori: {} // nome -> { punteggio, indiceCorrente }
  };
  partite.set(codice, partita);
  return partita;
}

export function ottieniPartita(codice) {
  return partite.get((codice || "").toUpperCase());
}

export function aggiungiGiocatore(codice, nome) {
  const partita = ottieniPartita(codice);
  if (!partita) return null;
  if (!partita.giocatori[nome]) {
    partita.giocatori[nome] = { punteggio: 0 };
  }
  return partita;
}

export function aggiornaPunteggio(codice, nome, punti) {
  const partita = ottieniPartita(codice);
  if (!partita) return null;
  if (!partita.giocatori[nome]) partita.giocatori[nome] = { punteggio: 0 };
  partita.giocatori[nome].punteggio += punti;
  return partita;
}

export function classifica(codice) {
  const partita = ottieniPartita(codice);
  if (!partita) return [];
  return Object.entries(partita.giocatori)
    .map(([nome, dati]) => ({ nome, punteggio: dati.punteggio }))
    .sort((a, b) => b.punteggio - a.punteggio);
}
