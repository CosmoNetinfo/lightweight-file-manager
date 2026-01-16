# 🗂️ Lightweight File Manager

Un file manager ultraleggero e performante sviluppato in React come alternativa moderna e veloce a Windows Explorer.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
<img width="1911" height="911" alt="Screenshot 2026-01-16 054657" src="https://github.com/user-attachments/assets/50cc3112-4a1a-4006-bdcf-5384dd595f51" />

## ✨ Caratteristiche

- **🚀 Ultraleggero**: Interfaccia reattiva e veloce senza appesantimenti
- **🎨 UI Moderna**: Design pulito e intuitivo ispirato a Windows Explorer
- **📁 Navigazione Intuitiva**: Avanti/Indietro, navigazione breadcrumb e accesso rapido
- **🔍 Ricerca Integrata**: Trova rapidamente i tuoi file e cartelle
- **👁️ Due Modalità di Visualizzazione**: Vista griglia o vista lista dettagliata
- **🎯 Selezione Multipla**: Seleziona più file con Ctrl+Click
- **📂 Accesso Rapido**: Collegamenti diretti a Desktop, Documenti, Download, ecc.
- **🎨 Icone Personalizzate**: Icone distinte per ogni tipo di file (documenti, immagini, video, musica, archivi, codice)

## 🛠️ Tecnologie Utilizzate

- **React 18.2**: Framework UI moderno e performante
- **Lucide React**: Libreria di icone moderna e leggera
- **React Scripts**: Toolchain ottimizzata per lo sviluppo
- **CSS3**: Styling responsive e animazioni fluide

## 📋 Requisiti

- Node.js 14.0 o superiore
- npm 6.0 o superiore

## 🚀 Installazione

### 1. Clona il repository

```bash
git clone https://github.com/CosmoNetinfo/lightweight-file-manager.git
cd lightweight-file-manager
```

### 2. Installa le dipendenze

```bash
npm install
```

### 3. Avvia l'applicazione

```bash
npm start
```

L'applicazione si aprirà automaticamente su `http://localhost:3000`

## 📦 Build per Produzione

Per creare una build ottimizzata per la produzione:

```bash
npm run build
```

I file ottimizzati saranno generati nella cartella `build/` pronti per il deployment.

## 🎮 Utilizzo

### Navigazione Base

- **Doppio click** su una cartella per aprirla
- **Click singolo** per selezionare un file/cartella
- **Ctrl + Click** per selezione multipla
- **Pulsanti Avanti/Indietro** per navigare nella cronologia

### Barra degli Strumenti

| Icona | Funzione |
|-------|----------|
| ⬅️ ➡️ | Navigazione cronologia |
| 📁 | Torna alla cartella superiore |
| 🔄 | Aggiorna vista corrente |
| ➕📄 | Crea nuovo file |
| ➕📁 | Crea nuova cartella |
| 📋 | Copia elementi selezionati |
| ✂️ | Taglia elementi selezionati |
| 🗑️ | Elimina elementi selezionati |
| ⊞ ☰ | Cambia modalità di visualizzazione |

### Accesso Rapido

La sidebar laterale offre collegamenti rapidi a:
- 🏠 Desktop
- 📄 Documenti
- ⬇️ Download
- 🖼️ Immagini
- 🎬 Video
- 🎵 Musica
- 💾 Disco locale (C:)

## 🎨 Tipi di File Supportati

Il file manager riconosce e mostra icone personalizzate per:

- **Documenti**: .txt, .doc, .docx, .pdf
- **Immagini**: .jpg, .jpeg, .png, .gif, .bmp
- **Video**: .mp4, .avi, .mkv, .mov
- **Musica**: .mp3, .wav, .flac
- **Archivi**: .zip, .rar, .7z
- **Codice**: .js, .py, .java, .cpp, .html, .css

## 🔧 Personalizzazione

### Aggiungere Nuove Cartelle

Modifica l'oggetto `fileSystem` in `src/App.jsx`:

```javascript
const fileSystem = {
  'C:\\NuovaCartella': {
    type: 'folder',
    children: ['file1.txt', 'file2.jpg']
  }
};
```

### Aggiungere Nuovi Tipi di File

Estendi la funzione `getFileIcon()` in `src/App.jsx`:

```javascript
if (['nuova', 'estensione'].includes(ext)) {
  return <TuaIcona className="w-8 h-8 text-colore" />;
}
```

## 📝 Roadmap

- [ ] Integrazione con file system reale (Electron)
- [ ] Operazioni CRUD complete (copia, sposta, elimina)
- [ ] Anteprima file (immagini, documenti)
- [ ] Supporto drag & drop
- [ ] Temi personalizzabili (dark mode)
- [ ] Compressione/estrazione archivi
- [ ] Sincronizzazione cloud
- [ ] Gestione permessi file

## 🤝 Contribuire

I contributi sono benvenuti! Per contribuire:

1. Fai il fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push sul branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è rilasciato sotto licenza MIT. Vedi il file [LICENSE](LICENSE) per i dettagli.

## 👤 Autore

**CosmoNet**

- Website: [www.cosmonet.info](https://www.cosmonet.info)
- GitHub: [@CosmoNetinfo](https://github.com/CosmoNetinfo)

## 🙏 Ringraziamenti

- [Lucide Icons](https://lucide.dev/) per le icone bellissime
- [React](https://react.dev/) per il framework UI
- La community open source per l'ispirazione

---

⭐ Se questo progetto ti è stato utile, lascia una stella su GitHub!
