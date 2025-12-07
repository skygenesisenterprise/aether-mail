import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import { join } from "path";
import { DesktopFeatures } from "./desktop-features";

export let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load the Next.js app
  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built Next.js app
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  
  // Setup desktop features
  DesktopFeatures.setupTray();
  DesktopFeatures.setupGlobalShortcuts();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS it's common for applications to stay open
  if (process.platform !== "darwin") app.quit();
});

// IPC Handlers for desktop functionality
ipcMain.handle("show-message-box", async (_, options) => {
  const result = await dialog.showMessageBox(mainWindow!, options);
  return result;
});

ipcMain.handle("show-error-box", async (_, title, content) => {
  dialog.showErrorBox(title, content);
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("get-platform", () => {
  return process.platform;
});

// Handle app closing
app.on('before-quit', () => {
  // Cleanup before quitting
  DesktopFeatures.cleanup();
  mainWindow = null;
});
