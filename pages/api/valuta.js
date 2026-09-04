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
    return res.status(500).json({ errore: "Manca la chiave ANTHROPIC_API_KEY nelle variabili d'ambiente." });
  }

  const prompt = `Sei un insegnante di lettere che valuta la parafrasi di uno studente.
Verso originale: "${verso.testo}"
Concetti chiave attesi: ${verso.concetti || "nessuno specificato, valuta la comprensione generale del verso"}
Parafrasi dello studente: "${parafrasi.trim()}"

Valuta quanto la parafrasi sia fedele e completa rispetto ai concetti chiave, indipendentemente dalle parole usate. Non dare un punteggio alto a risposte solo superficialmente simili al verso ma che non ne colgono il significato.
Rispondi SOLO con un oggetto JSON, senza testo aggiuntivo, in questo formato esatto:
{"punteggio": numero intero da 0 a 10, "feedback": "una frase di massimo 25 parole in italiano, rivolta allo studente"}`;

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

    if (!rispostaClaude.ok) {
      const dettaglio = await rispostaClaude.text();
      throw new Error("Errore dal servizio di valutazione: " + dettaglio);
    }

    const dati = await rispostaClaude.json();
    const testoGrezzo = dati.content.map((blocco) => blocco.text || "").join("").trim();
    const pulito = testoGrezzo.replace(/```json|```/g, "").trim();
    const valutazione = JSON.parse(pulito);

    const punteggio = Math.max(0, Math.min(10, Math.round(valutazione.punteggio)));
    aggiornaPunteggio(codice, nome, punteggio);

    res.status(200).json({
      punteggio,
      feedback: valutazione.feedback,
      classifica: classifica(codice)
    });
  } catch (errore) {
    console.error(errore);
    res.status(500).json({ errore: "Non e' stato possibile valutare la parafrasi. Riprova." });
  }
}
