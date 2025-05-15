const { contextBridge, ipcRenderer } = require('electron');

// Exposer des fonctionnalités sécurisées au frontend
contextBridge.exposeInMainWorld('electronAPI', {
  getVersions: () => ({
    chrome: process.versions.chrome,
    node: process.versions.node,
    electron: process.versions.electron,
  }),
  sendMessage: (channel, data) => {
    const validChannels = ['toMain']; // Liste blanche des canaux autorisés
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  onMessage: (channel, callback) => {
    const validChannels = ['fromMain']; // Liste blanche des canaux autorisés
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
});

window.addEventListener('DOMContentLoaded', (event) => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector);
      if (element) element.innerText = text;
    };
  
    for (const type of ['chrome', 'node', 'electron']) {
      replaceText(`${type}-version`, process.versions[type]);
    }
  });
