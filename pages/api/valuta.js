import { ottieniPartita, aggiornaPunteggio, classifica } from "../../lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ errore: "Metodo non consentito." });
  }

  const { codice, indiceVerso, nome, parafrasi } = req.body || {};

  if (!codice || indiceVerso === undefined || !nome || !parafrasi || !parafrasi.trim()) {
    return res.status(400).json({ errore: "Dati mancanti." });
  }

  const partita = ottieniPartita(codice);
  if (!partita) {
    return res.status(404).json({ errore: "Nessuna partita trovata con questo codice." });
  }

  const verso = partita.versi[indiceVerso];
  if (!verso) {
    return res.status(400).json({ errore: "Verso non valido." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ errore: "Manca la chiave ANTHROPIC_API_KEY nelle variabili d'ambiente su Vercel." });
  }

  const prompt = `Sei un insegnante di lettere che valuta la parafrasi di uno studente.
Verso originale: "${verso.testo}"
Concetti chiave attesi: ${verso.concetti || "nessuno specificato, valuta la comprensione generale del verso"}
Parafrasi dello studente: "${parafrasi.trim()}"

Valuta quanto la parafrasi sia fedele e completa rispetto ai concetti chiave, indipendentemente dalle parole usate. Non dare un punteggio alto a risposte solo superficialmente simili al verso ma che non ne colgono il significato.
Rispondi SOLO con un oggetto JSON, senza testo aggiuntivo prima o dopo, in questo formato esatto:
{"punteggio": numero intero da 0 a 10, "feedback": "una frase di massimo 25 parole in italiano, rivolta allo studente"}`;

  let corpoRisposta;
  try {
    const rispostaClaude = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }]
      })
    });

    corpoRisposta = await rispostaClaude.text();

    if (!rispostaClaude.ok) {
      // Mostriamo lo stato HTTP: 401 = chiave sbagliata, 429 = troppe richieste, 400 = richiesta malformata.
      return res.status(500).json({
        errore: `Il servizio di valutazione ha risposto con errore ${rispostaClaude.status}. Dettaglio: ${corpoRisposta.slice(0, 300)}`
      });
    }

    const dati = JSON.parse(corpoRisposta);
    const testoGrezzo = dati.content.map((blocco) => blocco.text || "").join("").trim();

    // Estrae il primo oggetto JSON presente nel testo, anche se il modello
    // avesse aggiunto per errore del testo prima o dopo.
    const corrispondenza = testoGrezzo.match(/\{[\s\S]*\}/);
    if (!corrispondenza) {
      return res.status(500).json({
        errore: `Risposta dell'AI non riconosciuta: "${testoGrezzo.slice(0, 200)}"`
      });
    }

    const valutazione = JSON.parse(corrispondenza[0]);
    const punteggio = Math.max(0, Math.min(10, Math.round(Number(valutazione.punteggio))));

    if (Number.isNaN(punteggio)) {
      return res.status(500).json({ errore: "Il punteggio restituito dall'AI non era un numero valido." });
    }

    aggiornaPunteggio(codice, nome, punteggio);

    res.status(200).json({
      punteggio,
      feedback: valutazione.feedback || "Nessun commento disponibile.",
      classifica: classifica(codice)
    });
  } catch (errore) {
    console.error(errore);
    res.status(500).json({ errore: `Errore imprevisto: ${errore.message}` });
  }
}
