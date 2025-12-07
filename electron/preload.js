const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Desktop-specific APIs
  showMessageBox: (options) => ipcRenderer.invoke("show-message-box", options),
  showErrorBox: (title, content) =>
    ipcRenderer.invoke("show-error-box", title, content),

  // App information
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getPlatform: () => ipcRenderer.invoke("get-platform"),

  // Platform detection
  isWindows: () => process.platform === "win32",
  isMacOS: () => process.platform === "darwin",
  isLinux: () => process.platform === "linux",

  // Development helpers
  isDev: () => process.env.NODE_ENV === "development",
});

// Expose Node.js APIs needed for the app
contextBridge.exposeInMainWorld("nodeAPI", {
  // File system operations can be exposed here if needed
  // For security reasons, we'll keep this minimal initially
});
