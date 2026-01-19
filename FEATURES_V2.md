# 🚀 CosmoNav - Deep Space Explorer v2.0

## ✨ Nuove Funzionalità Professionali

### 📑 **Sistema di Tabs Multipli**
- **Ctrl+T**: Apri nuovo tab
- **Ctrl+W**: Chiudi tab corrente
- Gestisci più cartelle contemporaneamente in tab separati
- Switch rapido tra tabs con click

### 👁️ **Quick Preview (Spacebar)**  
- **Spacebar**: Anteprima veloce del file selezionato
- Visualizzazione immagini, video e documenti
- **ESC**: Chiudi preview
- Informazioni istantanee (tipo, dimensione, data)

### 📋 **Clipboard Manager Avanzato**
- **Ctrl+C**: Copia file selezionati
- **Ctrl+X**: Taglia file selezionati  
- **Ctrl+V**: Incolla file dalla clipboard
- Indicatore visivo della clipboard attiva
- Supporto copia/taglia multipli file

### 🔖 **Bookmarks Intelligenti**
- **Ctrl+B**: Aggiungi cartella corrente ai bookmarks
- Accesso rapido alle cartelle preferite dalla sidebar
- Rimuovi bookmark con un click
- Drag & Drop per organizzare

### 🎨 **File Tagging & Colori**
- Aggiungi tag personalizzati ai file
- 7 colori disponibili (Rosso, Arancione, Giallo, Verde, Blu, Viola, Rosa)
- Organizza visivamente i tuoi file
- Filtri per tag (in development)

### 📝 **Bulk Rename Intelligente**
- **Ctrl+R**: Rinomina multipla per file selezionati (2+)
- **F2**: Rinomina singolo file
- Pattern personalizzabili:
  - `{n}` - Numero progressivo
  - `{name}` - Nome originale
  - `{date}` - Data corrente
- Anteprima in tempo reale

### 📊 **Statistiche Cartella**
- **Ctrl+I**: Visualizza statistiche cartella corrente
- Totale file, cartelle e dimensione
- Analisi per tipologia (Immagini, Video, Documenti, Musica, Codice, Archivi)
- Grafici percentuali dello spazio occupato

### 💾 **Compressione Integrata**
- Comprimi file selezionati in ZIP
- Estrazione archivi (ZIP, RAR, 7Z)
- Compressione massima (livello 9)
- Operazioni in background

### 🔍 **Ricerca Avanzata con Filtri**
- Ricerca debounced (300ms) per performance
- Filtri per tipo:
  - Cartelle
  - Immagini (JPG, PNG, GIF, SVG, WEBP)
  - Video (MP4, AVI, MOV, MKV)
  - Documenti (PDF, DOC, DOCX, TXT)
  - Codice (JS, JSX, TS, HTML, CSS, PY)
  - Musica (MP3, WAV, FLAC)
  - Archivi (ZIP, RAR, 7Z)
- Filtro dimensione (Min/Max in MB)
- Filtro data (Da/A)

### 🪟 **Dual Pane View** _(In Development)_
- **Ctrl+D**: Attiva/disattiva vista doppio pannello
- Sposta file tra pannelli con drag & drop
- Naviga indipendentemente in ogni pannello

---

## ⌨️ Scorciatoie da Tastiera Complete

### Navigazione
- **Backspace**: Cartella precedente
- **Enter**: Apri file/cartella selezionata
- **Delete**: Elimina (sposta nel cestino)
- **Spazio**: Quick Preview del file selezionato
- **ESC**: Chiudi preview/modal

### Gestione Tab
- **Ctrl+T**: Nuovo tab
- **Ctrl+W**: Chiudi tab corrente

### Clipboard
- **Ctrl+C**: Copia
- **Ctrl+X**: Taglia
- **Ctrl+V**: Incolla

### Organizzazione
- **Ctrl+B**: Bookmark cartella corrente
- **Ctrl+R**: Bulk rename (2+ file selezionati)
- **F2**: Rinomina singolo file

### Visualizzazione
- **Ctrl+D**: Dual Pane (toggle)
- **Ctrl+I**: Statistiche cartella

### Selezione
- **Ctrl+Click**: Selezione multipla
- **Click & Drag**: Selezione rettangolare
- **Shift+Click**: Selezione intervallo

---

## 🎯 Ottimizzazioni Performance

1. **Debouncing** - Ricerca ritardata di 300ms per evitare lag durante la digitazione
2. **useMemo** - Filtri e liste memorizzati per evitare re-calcoli
3. **useCallback** - Funzioni ottimizzate per evitare re-render
4. **Lazy Loading** - Preview caricate solo quando necessario
5. **Virtual Scrolling** - Supporto liste grandi (pianificato)
6. **Web Workers** - Operazioni pesanti in background (pianificato)

---

## 🛠️ Tecnologie Utilizzate

- **React 18** - Framework UI
- **Electron** - Desktop app framework
- **Framer Motion** - Animazioni fluide
- **Tailwind CSS** - Styling moderno
- **Lucide React** - Icone vettoriali
- **Archiver** - Compressione files
- **Extract-ZIP** - Estrazione archivi

---

## 📦 Installazione & Build

```bash
# Installa dipendenze
npm install

# Avvia in sviluppo
npm start

# Build per Windows
npm run electron-pack

# File generati in /dist:
# - CosmoNav Setup 1.0.0.exe (Installer)
# - CosmoNav 1.0.0.exe (Portable)
```

---

## 🎨 Design Philosophy

CosmoNav non è solo un file manager, è un'**esperienza di navigazione spaziale**:

- 🌌 **Tema Deep Space** - Interfaccia ispirata allo spazio profondo
- ✨ **Micro-animazioni** - Ogni interazione è fluida e piacevole
- 🎯 **Focus sulla produttività** - Shortcut da tastiera per tutto
- 💎 **Glassmorphism** - Effetti moderni di trasparenza e blur
- ⚡ **Performance First** - Veloce anche con migliaia di file

---

## 🚀 Roadmap Futuro

- [ ] Dual Pane completamente funzionante
- [ ] Cloud Integration (Google Drive, Dropbox, OneDrive)
- [ ] Git Integration nativa
- [ ] Terminal integrato
- [ ] Plugin system
- [ ] Themes personalizzabili
- [ ] Sync settings cross-device

---

## 📝 Licenza

MIT License - Feel free to use, modify and distribute

---

**Made with 💙 by CosmoNet Team**
