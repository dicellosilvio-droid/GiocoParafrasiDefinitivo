import { useState } from "react";

const ESEMPIO = `Leopardi, L'infinito | Sempre caro mi fu quest'ermo colle, / e questa siepe, che da tanta parte / dell'ultimo orizzonte il guardo esclude. | il colle solitario e' caro al poeta; la siepe gli impedisce di vedere l'orizzonte lontano
Dante, Inferno I | Nel mezzo del cammin di nostra vita / mi ritrovai per una selva oscura, / che la diritta via era smarrita. | a meta' della vita il poeta si perde in una selva oscura; ha smarrito la retta via, cioe' il cammino giusto`;

export default function Docente() {
  const [titolo, setTitolo] = useState("");
  const [testo, setTesto] = useState("");
  const [errore, setErrore] = useState("");
  const [partitaCreata, setPartitaCreata] = useState(null);
  const [caricamento, setCaricamento] = useState(false);

  function analizzaVersi(testoGrezzo) {
    return testoGrezzo
      .split("\n")
      .map((riga) => riga.trim())
      .filter(Boolean)
      .map((riga) => {
        const parti = riga.split("|").map((p) => p.trim());
        return { autore: parti[0] || "", testo: parti[1] || "", concetti: parti[2] || "" };
      })
      .filter((v) => v.testo);
  }

  async function creaPartita() {
    setErrore("");
    const versi = analizzaVersi(testo);
    if (!titolo.trim()) {
      setErrore("Dai un titolo alla partita.");
      return;
    }
    if (versi.length === 0) {
      setErrore("Inserisci almeno un verso nel formato indicato.");
      return;
    }
    setCaricamento(true);
    try {
      const res = await fetch("/api/partite/crea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titolo, versi })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errore || "Errore nella creazione della partita.");
      setPartitaCreata(data);
    } catch (e) {
      setErrore(e.message);
    } finally {
      setCaricamento(false);
    }
  }

  if (partitaCreata) {
    const link = typeof window !== "undefined" ? `${window.location.origin}/partita/${partitaCreata.codice}` : "";
    return (
      <div className="contenitore">
        <h1>Partita creata</h1>
        <p className="sottotitolo">Condividi questo codice con la classe.</p>
        <div className="codice-partita">{partitaCreata.codice}</div>
        <div className="scheda">
          <p style={{ marginTop: 0 }}>Oppure condividi direttamente il link:</p>
          <p style={{ wordBreak: "break-all", color: "#26215C" }}>{link}</p>
        </div>
        <button className="secondario" onClick={() => setPartitaCreata(null)}>
          Crea un'altra partita
        </button>
      </div>
    );
  }

  return (
    <div className="contenitore">
      <h1>Crea una partita</h1>
      <p className="sottotitolo">Inserisci un verso per riga, nel formato: autore/opera | verso | concetti chiave.</p>

      <div className="scheda">
        <label htmlFor="titolo">Titolo della partita</label>
        <input
          id="titolo"
          type="text"
          placeholder="Es. Parafrasi - classe 2B"
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
        />

        <label htmlFor="versi">Versi</label>
        <textarea
          id="versi"
          rows={8}
          placeholder={ESEMPIO}
          value={testo}
          onChange={(e) => setTesto(e.target.value)}
        />
        <p style={{ fontSize: 13, color: "#5F5E5A", marginTop: -10 }}>
          I "concetti chiave" servono solo all'intelligenza artificiale per valutare le risposte: non vengono mai mostrati agli studenti.
        </p>

        {errore && <p className="errore">{errore}</p>}
        <button onClick={creaPartita} disabled={caricamento}>
          {caricamento ? "Creazione in corso..." : "Crea partita"}
        </button>
      </div>
    </div>
  );
}
