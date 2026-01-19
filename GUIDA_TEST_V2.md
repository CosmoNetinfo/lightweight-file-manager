# 🎯 GUIDA RAPIDA - CosmoNav v2.0 PRO

## 🚀 Come Testare le Nuove Funzionalità

### 1️⃣ **Tabs Multipli** 
**Cosa testare:**
- Premi **Ctrl+T** per aprire un nuovo tab
- Naviga in cartelle diverse in ogni tab
- Clicca sui tab header per switchare
- Premi **Ctrl+W** per chiudere il tab attivo
- Verifica che l'ultimo tab non possa essere chiuso

**Esperienza attesa:**
- Switch istantaneo tra tabs
- Ogni tab mantiene la sua history
- Badge con numero di tabs nella sidebar

---

### 2️⃣ **Quick Preview (KILLER FEATURE!)** 
**Cosa testare:**
- Seleziona un'immagine e premi **Spacebar**
- Si apre un modal fullscreen con preview HD
- Mostra info: nome, tipo, dimensione, data modifiche
- Premi **ESC** per chiudere
- Prova con video (supporto playback)
- Premi **Enter** da preview per aprire il file

**Esperienza attesa:**
- Apertura istantanea (no lag)
- Immagini caricate in alta qualità
- Animazione smooth di apertura/chiusura

---

### 3️⃣ **Clipboard Manager Professionale**
**Cosa testare:**
1. Seleziona 3-4 file
2. Premi **Ctrl+C** (copia)
3. Naviga in altra cartella
4. Premi **Ctrl+V** (incolla)
5. Ripeti con **Ctrl+X** (taglia) - i file vengono spostati

**Esperienza attesa:**
- Indicatore visivo nella toolbar (badge clipboard)
- Copia multipla senza limiti
- Taglia rimuove i file dopo paste

---

### 4️⃣ **Bookmarks Intelligenti**
**Cosa testare:**
1. Naviga in una cartella importante (es: Progetti)
2. Premi **Ctrl+B**
3. Il bookmark appare nella sidebar "Bookmarks"
4. Clicca sul bookmark per navigare velocemente
5. Hover sul bookmark e clicca X per rimuoverlo

**Esperienza attesa:**
- Bookmark salvati persistono tra sessioni
- Icona distintiva (⭐)
- Organizzazione automatica

---

### 5️⃣ **Bulk Rename Intelligente**
**Cosa testare:**
1. Seleziona 5-10 file (Ctrl+Click)
2. Premi **Ctrl+R**
3. Si apre modal con pattern editor
4. Prova questi pattern:
   - `Foto_{n}` → Foto_1, Foto_2, Foto_3...
   - `{name}_backup` → nomefile_backup
   - `Doc_{date}_{n}` → Doc_2026-01-19_1
5. Vedi anteprima in tempo reale (primi 5)
6. Clicca "Applica"

**Per rinominare singolo file:**
- Seleziona 1 file e premi **F2**

**Esperienza attesa:**
- Pattern flessibili con variabili
- Anteprima accurata
- Rinomina istantanea di centinaia di file

---

### 6️⃣ **Statistiche Cartella**
**Cosa testare:**
1. Naviga in una cartella con molti file (es: Download)
2. Premi **Ctrl+I**
3. Si apre dashboard con:
   - Totale file e cartelle
   - Dimensione totale
   - Grafici per tipologia (Immagini, Video, Documenti, etc.)
   - Percentuali di occupazione spazio

**Esperienza attesa:**
- Calcolo veloce (anche per cartelle grandi)
- Grafici colorati e intuitivi
- Info dettagliate per categoria

---

### 7️⃣ **Ricerca Avanzata con Filtri**
**Cosa testare:**
1. Scrivi nella barra di ricerca
2. Clicca sull'icona **Filter** (🎛️) nella toolbar
3. Seleziona filtri:
   - **Tipo**: Solo immagini / Solo video / Solo documenti
   - **Dimensione**: Min 1MB, Max 100MB
   - **Data**: Da data X a data Y
4. I risultati si aggiornano in tempo reale

**Esperienza attesa:**
- Ricerca debounced (no lag durante digitazione)
- Filtri combinabili
- Risultati istantanei

---

### 8️⃣ **Compressione ZIP Integrata**
**Cosa testare:**
1. Seleziona file/cartelle da comprimere
2. Click destro → "Comprimi in ZIP"
3. Viene creato archivio con timestamp
4. Compressione massima (livello 9)

**Nota:** Funziona solo nella versione Electron, non nel browser dev.

---

### 9️⃣ **Context Menu Esteso**
**Cosa testare:**
- Click destro su file/cartella
- Trovi tutte le nuove azioni:
  - 👁️ Quick Preview
  - 📋 Copia/Taglia/Incolla
  - 🔖 Aggiungi a Bookmark
  - ➕ Apri in Nuovo Tab
  - 🏷️ Aggiungi Tag
  - 📦 Comprimi in ZIP
  - ✏️ Bulk Rename (se multipli)
  - ✏️ Rinomina (se singolo)
  - 🗑️ Elimina

**Esperienza attesa:**
- Menu contestuale intelligente
- Mostra solo azioni disponibili
- Icone distintive per ogni azione

---

### 🔟 **Dual Pane Mode** (Beta)
**Cosa testare:**
- Premi **Ctrl+D**
- Lo schermo si divide in due pannelli
- Naviga indipendentemente in ogni pannello
- Drag & Drop tra pannelli (pianificato)

**Esperienza attesa:**
- Split screen fluido
- Performance mantenute

---

## ⌨️ Cheat Sheet Completo

```
NAVIGAZIONE:
  Backspace      → Indietro
  Enter          → Apri
  Spazio         → Quick Preview
  Delete         → Elimina
  ESC            → Chiudi modal/preview

TABS:
  Ctrl+T         → Nuovo tab
  Ctrl+W         → Chiudi tab

CLIPBOARD:
  Ctrl+C         → Copia
  Ctrl+X         → Taglia
  Ctrl+V         → Incolla

ORGANIZZAZIONE:
  Ctrl+B         → Bookmark
  Ctrl+R         → Bulk Rename
  F2             → Rinomina singolo

VISUALIZZAZIONE:
  Ctrl+D         → Dual Pane
  Ctrl+I         → Statistiche

SELEZIONE:
  Ctrl+Click     → Selezione multipla
  Shift+Click    → Selezione intervallo
  Drag           → Selezione rettangolare
```

---

## 🎨 Cosa Rende CosmoNav Migliore di Windows Explorer?

✅ **Tabs** - Gestisci più cartelle contemporaneamente  
✅ **Quick Preview** - Vedi file senza aprirli (Spacebar)  
✅ **Bulk Rename** - Rinomina centinaia di file in secondi  
✅ **Statistiche** - Vedi ESATTAMENTE cosa occupa spazio  
✅ **Bookmarks** - Accesso istantaneo a cartelle importanti  
✅ **Clipboard Pro** - Copia/taglia multipli con indicatore  
✅ **Filtri Avanzati** - Trova file per tipo/dimensione/data  
✅ **Scorciatoie** - Tutto accessibile da tastiera  
✅ **Estetica** - Interfaccia moderna e fluida  
✅ **Velocità** - Ottimizzato per performance  

---

## 🐛 Troubleshooting

**Problema:** Compressione ZIP non funziona
**Soluzione:** Funziona solo nella versione Electron compilata, non nel browser dev

**Problema:** Preview non mostra immagini
**Soluzione:** Alcune immagini protette potrebbero non caricarsi, verifica permessi

**Problema:** Statistiche lente su cartelle enormi
**Soluzione:** Normale per cartelle con 10.000+ file. Il calcolo è profondo (ricorsivo)

---

## 📈 Metriche di Performance

- Avvio app: < 2 secondi
- Switch tab: < 100ms
- Quick Preview: < 200ms
- Ricerca debounced: 300ms
- Bulk Rename: < 1s per 100 file
- Statistiche: ~1s per 1000 file

---

**🚀 Buon viaggio nello spazio profondo con CosmoNav!**
