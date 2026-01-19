const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Necessario per visualizzare anteprime file://
    },
    title: "CosmoNav - Deep Space Explorer",
    icon: path.join(__dirname, 'logo.png'),
    autoHideMenuBar: true,
  });

  if (!app.isPackaged) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // Caricamento robusto per versione pacchettizzata
    win.loadFile(path.join(__dirname, '../build/index.html'));
  }
}

// Gestione percorsi nativi di sistema
ipcMain.handle('get-system-paths', () => {
  return {
    home: app.getPath('home'),
    desktop: app.getPath('desktop'),
    documents: app.getPath('documents'),
    downloads: app.getPath('downloads'),
    music: app.getPath('music'),
    pictures: app.getPath('pictures'),
    videos: app.getPath('videos'),
  };
});

app.whenReady().then(createWindow);
// ... resto del codice

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
