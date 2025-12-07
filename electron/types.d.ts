// Type definitions for Electron APIs
declare global {
  interface Window {
    electronAPI: {
      showMessageBox: (
        options: Electron.MessageBoxOptions,
      ) => Promise<Electron.MessageBoxReturnValue>;
      showErrorBox: (title: string, content: string) => Promise<void>;
      getAppVersion: () => Promise<string>;
      getPlatform: () => Promise<string>;
      isWindows: () => boolean;
      isMacOS: () => boolean;
      isLinux: () => boolean;
      isDev: () => boolean;
    };
    nodeAPI: {
      // Additional Node.js APIs can be exposed here
    };
  }
}

export {};
