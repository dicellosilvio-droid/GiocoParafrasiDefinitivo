import { aggiungiGiocatore, classifica } from "../../../../lib/store";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ errore: "Metodo non consentito." });
  }

  const { codice } = req.query;
  const { nome } = req.body || {};

  if (!nome || !nome.trim()) {
    return res.status(400).json({ errore: "Inserisci un nome." });
  }

  const partita = aggiungiGiocatore(codice, nome.trim());
  if (!partita) {
    return res.status(404).json({ errore: "Nessuna partita trovata con questo codice." });
  }

  res.status(200).json({ ok: true, classifica: classifica(codice) });
}
