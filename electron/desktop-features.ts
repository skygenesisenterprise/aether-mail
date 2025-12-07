import {
  Tray,
  Menu,
  nativeImage,
  Notification,
  globalShortcut,
  app,
} from "electron";
import { join } from "path";
import { mainWindow } from "./main";

let tray: Tray | null = null;

export class DesktopFeatures {
  static setupTray(): void {
    // Create tray icon
    const iconPath = join(__dirname, "../../assets/tray-icon.png");
    const trayIcon = nativeImage.createFromPath(iconPath);

    tray = new Tray(trayIcon);
    tray.setToolTip("Aether Mail");

    // Create tray context menu
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Aether Mail",
        click: () => {
          mainWindow?.show();
          mainWindow?.focus();
        },
      },
      { type: "separator" },
      {
        label: "New Email",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          mainWindow?.show();
          mainWindow?.webContents.send("new-email");
        },
      },
      {
        label: "Check Mail",
        accelerator: "CmdOrCtrl+R",
        click: () => {
          mainWindow?.webContents.send("check-mail");
        },
      },
      { type: "separator" },
      {
        label: "Settings",
        click: () => {
          mainWindow?.show();
          mainWindow?.webContents.send("navigate-to", "/settings");
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click: () => {
          if (process.platform !== "darwin") {
            app.quit();
          }
        },
      },
    ]);

    tray.setContextMenu(contextMenu);

    // Handle tray double-click
    tray.on("double-click", () => {
      mainWindow?.show();
      mainWindow?.focus();
    });
  }

  static showNotification(title: string, body: string, silent = false): void {
    if (!Notification.isSupported()) return;

    const notification = new Notification({
      title,
      body,
      silent,
      icon: join(__dirname, "../../assets/icon.png"),
      urgency: "normal",
    });

    notification.on("click", () => {
      mainWindow?.show();
      mainWindow?.focus();
    });

    notification.show();
  }

  static updateUnreadCount(count: number): void {
    // Update app badge (macOS and some Linux desktops)
    if (mainWindow) {
      if (process.platform === "darwin") {
        app.setBadgeCount(count);
      }

      // Update tray tooltip
      if (tray) {
        tray.setToolTip(`Aether Mail${count > 0 ? ` (${count} unread)` : ""}`);
      }

      // Show notification for new emails
      if (count > 0) {
        this.showNotification(
          "New Email",
          `You have ${count} unread email${count > 1 ? "s" : ""}`,
        );
      }
    }
  }

  static setupGlobalShortcuts(): void {
    // Register global shortcuts
    globalShortcut.register("CommandOrControl+N", () => {
      mainWindow?.show();
      mainWindow?.webContents.send("new-email");
    });

    globalShortcut.register("CommandOrControl+Shift+M", () => {
      if (mainWindow?.isVisible()) {
        mainWindow?.hide();
      } else {
        mainWindow?.show();
        mainWindow?.focus();
      }
    });
  }

  static cleanup(): void {
    globalShortcut.unregisterAll();

    if (tray) {
      tray.destroy();
      tray = null;
    }
  }
}
