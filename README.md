# Parafrasi in classe

Un gioco stile Kahoot per far esercitare gli studenti sulla parafrasi dei versi,
con valutazione automatica tramite intelligenza artificiale.

Non serve scrivere codice per pubblicarlo: segui questi passaggi una sola volta.

## 1. Procurati una chiave API Anthropic

1. Vai su https://console.anthropic.com e crea un account (o accedi).
2. Nella sezione "API Keys", crea una nuova chiave.
3. Copiala e tienila da parte: ti servirà al passaggio 4. Non condividerla con nessuno.

## 2. Carica questo progetto su GitHub

1. Vai su https://github.com e crea un account gratuito, se non ne hai già uno.
2. Crea un nuovo repository (pulsante verde "New").
3. Dai un nome al repository, ad esempio `parafrasi-in-classe`, e clicca "Create repository".
4. Nella pagina del repository appena creato, clicca su "uploading an existing file"
   e trascina dentro tutta la cartella di questo progetto (tutti i file e le sottocartelle).
5. Clicca "Commit changes" in fondo alla pagina.

## 3. Pubblica il sito con Vercel

1. Vai su https://vercel.com e accedi con lo stesso account GitHub.
2. Clicca "Add New..." poi "Project".
3. Seleziona il repository che hai appena caricato (`parafrasi-in-classe`).
4. Prima di cliccare "Deploy", apri la sezione "Environment Variables" e aggiungi:
   - Nome: `ANTHROPIC_API_KEY`
   - Valore: la chiave copiata al passaggio 1
5. Clicca "Deploy" e attendi un paio di minuti.
6. Al termine, Vercel ti darà un indirizzo del tipo `parafrasi-in-classe.vercel.app`:
   è il link del tuo sito, sempre online.

## 4. Come si usa in classe

1. Tu (docente) apri il sito, clicca "Crea una partita" e incolli i versi nel formato:
   `autore/opera | verso | concetti chiave`, una riga per ogni verso.
2. Il sito ti dà un codice a 5 lettere.
3. Scrivi il codice alla lavagna (o condividi il link diretto): gli studenti lo inseriscono
   nella homepage per entrare.
4. Ogni studente vede il verso, ha un timer per scrivere la parafrasi, e riceve subito
   un punteggio da 0 a 10 con un breve commento, oltre alla classifica in tempo reale.

## Limiti di questa prima versione

- Le partite sono salvate in memoria: se il sito resta inattivo a lungo e Vercel lo
  "riavvia", le partite create in precedenza vengono perse (basta crearne una nuova).
- Non c'è un login per il docente: chiunque abbia il link può creare partite.
- Per una versione con salvataggio permanente, storico delle partite e più controlli
  per il docente, si può evolvere aggiungendo un database (richiede altre modifiche
  al codice, che possiamo fare in un secondo momento).
