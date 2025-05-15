const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); // Détecter si on est en mode développement

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Renforce la sécurité
      enableRemoteModule: false, // Désactiver les modules distants
    },
  });

  if (isDev) {
    // Charger le serveur de développement Vite en mode développement
    mainWindow.loadURL('http://localhost:5173');
  } else {
    // Charger le fichier HTML généré par Vite en mode production
    mainWindow.loadFile(path.join(__dirname, '../dist/frontend/index.html'));
  }

  mainWindow.webContents.openDevTools(); // Ouvre les outils de développement (optionnel)
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

