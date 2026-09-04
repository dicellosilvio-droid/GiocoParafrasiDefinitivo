import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

const DURATA_TIMER = 45;

export default function Partita() {
  const router = useRouter();
  const { codice } = router.query;

  const [fase, setFase] = useState("caricamento"); // caricamento | lobby | gioco | risultato | fine | errore
  const [erroreCaricamento, setErroreCaricamento] = useState("");
  const [titolo, setTitolo] = useState("");
  const [versi, setVersi] = useState([]);
  const [nome, setNome] = useState("");
  const [indice, setIndice] = useState(0);
  const [testoRisposta, setTestoRisposta] = useState("");
  const [erroreForm, setErroreForm] = useState("");
  const [valutazione, setValutazione] = useState(null);
  const [classifica, setClassifica] = useState([]);
  const [tempoRimasto, setTempoRimasto] = useState(DURATA_TIMER);
  const [invioInCorso, setInvioInCorso] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!codice) return;
    fetch(`/api/partite/${codice}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.errore) {
          setErroreCaricamento(data.errore);
          setFase("errore");
        } else {
          setTitolo(data.titolo);
          setVersi(data.versi);
          setClassifica(data.classifica);
          setFase("lobby");
        }
      })
      .catch(() => {
        setErroreCaricamento("Impossibile contattare il server.");
        setFase("errore");
      });
  }, [codice]);

  useEffect(() => {
    if (fase !== "gioco") return;
    clearInterval(timerRef.current);
    setTempoRimasto(DURATA_TIMER);
    timerRef.current = setInterval(() => {
      setTempoRimasto((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          inviaRisposta(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, indice]);

  async function entraInLobby() {
    if (!nome.trim()) {
      setErroreForm("Inserisci il tuo nome.");
      return;
    }
    setErroreForm("");
    const res = await fetch(`/api/partite/${codice}/unisciti`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome })
    });
    const data = await res.json();
    if (data.errore) {
      setErroreForm(data.errore);
      return;
    }
    setClassifica(data.classifica);
    setFase("gioco");
  }

  async function inviaRisposta(daTimerScaduto) {
    const testo = daTimerScaduto ? testoRisposta.trim() || "(nessuna risposta)" : testoRisposta.trim();
    if (!daTimerScaduto && !testo) {
      setErroreForm("Scrivi una parafrasi prima di inviare.");
      return;
    }
    setErroreForm("");
    setInvioInCorso(true);
    clearInterval(timerRef.current);
    try {
      const res = await fetch("/api/valuta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codice, indiceVerso: indice, nome, parafrasi: testo })
      });
      const data = await res.json();
      if (data.errore) throw new Error(data.errore);
      setValutazione(data);
      setClassifica(data.classifica);
      setFase("risultato");
    } catch (e) {
      setErroreForm(e.message);
    } finally {
      setInvioInCorso(false);
    }
  }

  function prossimoVerso() {
    setTestoRisposta("");
    setValutazione(null);
    if (indice < versi.length - 1) {
      setIndice(indice + 1);
      setFase("gioco");
    } else {
      setFase("fine");
    }
  }

  if (fase === "caricamento") {
    return (
      <div className="contenitore">
        <p>Caricamento partita...</p>
      </div>
    );
  }

  if (fase === "errore") {
    return (
      <div className="contenitore">
        <h1>Partita non trovata</h1>
        <p className="errore">{erroreCaricamento}</p>
      </div>
    );
  }

  if (fase === "lobby") {
    return (
      <div className="contenitore">
        <h1>{titolo}</h1>
        <p className="sottotitolo">{versi.length} versi da parafrasare. Inserisci il tuo nome per iniziare.</p>
        <div className="scheda">
          <label htmlFor="nome">Il tuo nome</label>
          <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
          {erroreForm && <p className="errore">{erroreForm}</p>}
          <button onClick={entraInLobby}>Inizia a giocare</button>
        </div>
      </div>
    );
  }

  if (fase === "gioco") {
    const verso = versi[indice];
    return (
      <div className="contenitore">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 13, color: "#5F5E5A" }}>Verso {indice + 1} di {versi.length}</span>
          <span className="timer">{tempoRimasto}s</span>
        </div>
        <div className="scheda">
          <p style={{ fontSize: 13, color: "#5F5E5A", marginTop: 0 }}>{verso.autore}</p>
          <p className="verso">{verso.testo}</p>
        </div>
        <textarea
          rows={4}
          placeholder="Scrivi qui la tua parafrasi..."
          value={testoRisposta}
          onChange={(e) => setTestoRisposta(e.target.value)}
        />
        {erroreForm && <p className="errore">{erroreForm}</p>}
        <button onClick={() => inviaRisposta(false)} disabled={invioInCorso}>
          {invioInCorso ? "Valutazione in corso..." : "Invia risposta"}
        </button>
      </div>
    );
  }

  if (fase === "risultato") {
    return (
      <div className="contenitore">
        <div className="scheda">
          <p className="punteggio-grande">{valutazione.punteggio}/10</p>
          <p style={{ color: "#5F5E5A" }}>{valutazione.feedback}</p>
        </div>
        <h2>Classifica</h2>
        {classifica.map((g) => (
          <div className="riga-classifica" key={g.nome} style={g.nome === nome ? { background: "#EEEDFE" } : {}}>
            <span>{g.nome}</span>
            <span>{g.punteggio}</span>
          </div>
        ))}
        <div style={{ marginTop: 16 }}>
          <button onClick={prossimoVerso}>
            {indice < versi.length - 1 ? "Prossimo verso" : "Vedi risultato finale"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenitore">
      <h1>Partita conclusa</h1>
      <h2>Classifica finale</h2>
      {classifica.map((g, i) => (
        <div className="riga-classifica" key={g.nome} style={g.nome === nome ? { background: "#EEEDFE" } : {}}>
          <span>{i + 1}. {g.nome}</span>
          <span>{g.punteggio}</span>
        </div>
      ))}
    </div>
  );
}
