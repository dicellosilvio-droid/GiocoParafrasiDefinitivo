import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [codice, setCodice] = useState("");
  const [errore, setErrore] = useState("");

  function entraInPartita() {
    if (!codice.trim()) {
      setErrore("Inserisci il codice della partita.");
      return;
    }
    router.push(`/partita/${codice.trim().toUpperCase()}`);
  }

  return (
    <div className="contenitore">
      <h1>Parafrasi in classe</h1>
      <p className="sottotitolo">Un gioco stile Kahoot per esercitarsi sulla parafrasi dei versi.</p>

      <div className="scheda">
        <h2>Sono un docente</h2>
        <p style={{ color: "#5F5E5A", marginBottom: 16 }}>
          Carica i versi e crea una nuova partita da assegnare alla classe.
        </p>
        <button onClick={() => router.push("/docente")}>Crea una partita</button>
      </div>

      <div className="scheda">
        <h2>Sono uno studente</h2>
        <label htmlFor="codice">Codice partita</label>
        <input
          id="codice"
          type="text"
          placeholder="Es. AB3XZ"
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
        />
        {errore && <p className="errore">{errore}</p>}
        <button onClick={entraInPartita}>Entra nella partita</button>
      </div>
    </div>
  );
}
