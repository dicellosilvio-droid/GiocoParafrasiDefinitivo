import { ottieniPartita, classifica } from "../../../../lib/store";

export default function handler(req, res) {
  const { codice } = req.query;
  const partita = ottieniPartita(codice);

  if (!partita) {
    return res.status(404).json({ errore: "Nessuna partita trovata con questo codice." });
  }

  // I concetti chiave non vengono mai inviati al client: servono solo al server per valutare.
  const versiPubblici = partita.versi.map(({ autore, testo }) => ({ autore, testo }));

  res.status(200).json({
    titolo: partita.titolo,
    versi: versiPubblici,
    classifica: classifica(codice)
  });
}
