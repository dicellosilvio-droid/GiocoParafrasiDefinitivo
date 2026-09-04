import { creaPartita } from "../../../lib/store";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ errore: "Metodo non consentito." });
  }

  const { titolo, versi } = req.body || {};

  if (!titolo || !Array.isArray(versi) || versi.length === 0) {
    return res.status(400).json({ errore: "Titolo e almeno un verso sono obbligatori." });
  }

  const partita = creaPartita({ titolo, versi });
  res.status(200).json({ codice: partita.codice, titolo: partita.titolo });
}
