import electron, { app, BrowserWindow, ipcMain, protocol, session } from 'electron';
import log from 'electron-log';
import path from 'node:path';
import * as pkg from '../../package.json';
import { setupAutoUpdater } from './utils/auto-update';
import { isDev, DEFAULT_PORT } from './utils/constants';
import { initNextServer, stopNextServer } from './utils/next-server';
import { setupMenu } from './ui/menu';
import { createWindow } from './ui/window';
import { initCookies } from './utils/cookie';
import { serveNextBuild } from './utils/serve';
import { reloadOnChange } from './utils/reload';

Object.assign(console, log.functions);

console.log('main: isDev:', isDev);
console.log('NODE_ENV:', global.process.env.NODE_ENV);
console.log('isPackaged:', app.isPackaged);

// Log unhandled errors
process.on('uncaughtException', async (error) => {
  console.log('Uncaught Exception:', error);
});

process.on('unhandledRejection', async (error) => {
  console.log('Unhandled Rejection:', error);
});

(() => {
  const root = global.process.env.APP_PATH_ROOT;

  if (root === undefined) {
    console.log('no given APP_PATH_ROOT. default path is used.');
    return;
  }

  if (!path.isAbsolute(root)) {
    console.log('APP_PATH_ROOT must be absolute path.');
    global.process.exit(1);
  }

  console.log(`APP_PATH_ROOT: ${root}`);

  const subdirName = pkg.name;

  for (const [key, val] of [
    ['appData', ''],
    ['userData', subdirName],
    ['sessionData', subdirName],
  ] as const) {
    app.setPath(key, path.join(root, val));
  }

  app.setAppLogsPath(path.join(root, subdirName, 'Logs'));
})();

console.log('appPath:', app.getAppPath());

// Performance optimizations
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder');

if (process.platform !== 'darwin') {
  app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');
}

console.log('start whenReady');

declare global {
  var __electron__: typeof electron;
}

(async () => {
  await app.whenReady();
  console.log('App is ready');

  // Load cookies
  await initCookies();

  const nextBuildPath = isDev 
    ? path.join(process.cwd(), '.next')  // Dev: use .next folder
    : path.join(app.getAppPath(), 'dist');  // Prod: use dist from app path
    
  console.log('Next.js build path:', nextBuildPath);

  protocol.handle('http', async (req) => {
    req.headers.append('Referer', req.referrer);

    try {
      const url = new URL(req.url);

      // Forward to dev server in development
      if (isDev && url.port === String(DEFAULT_PORT)) {
        // Let Next.js handle dev requests
        return await fetch(req);
      }

      // Serve from Next.js build in production
      const res = await serveNextBuild(req, nextBuildPath);

      if (res) {
        return res;
      }

      // Sync cookies
      const cookies = await session.defaultSession.cookies.get({});
      if (cookies.length > 0) {
        req.headers.set('Cookie', cookies.map((c) => `${c.name}=${c.value}`).join('; '));
      }

      return new Response('Not Found', { status: 404 });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error handling request:', req.url, error.message);

      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'content-type': 'text/plain' },
      });
    }
  });

  const rendererURL = isDev 
    ? await initNextServer()
    : `http://localhost:${DEFAULT_PORT}`;

  console.log('Using renderer URL:', rendererURL);

  const win = createWindow(rendererURL);

  // Window controls
  ipcMain.handle('window-minimize', () => win.minimize());
  ipcMain.handle('window-maximize', () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  ipcMain.handle('window-close', () => win.close());
  ipcMain.handle('window-is-maximized', () => win.isMaximized());
  ipcMain.handle('window-get-platform', () => process.platform);

  win.on('maximize', () => win.webContents.send('window-maximized'));
  win.on('unmaximize', () => win.webContents.send('window-unmaximized'));

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow(rendererURL);
    }
  });

  console.log('end whenReady');
  return win;
})()
  .then((win) => {
    // Cookie handlers
    ipcMain.handle('cookie-set', async (_, name: string, value: string, options?: any) => {
      try {
        await session.defaultSession.cookies.set({
          name, value,
          path: options?.path || '/',
          domain: options?.domain,
          secure: options?.secure || false,
          httpOnly: options?.httpOnly || false,
          expirationDate: options?.expires ? Math.floor(new Date(options.expires).getTime() / 1000) : undefined,
          url: `http://localhost:${DEFAULT_PORT}`,
          sameSite: 'lax',
        });
        return true;
      } catch (error) {
        console.error('Failed to set cookie:', error);
        return false;
      }
    });

    ipcMain.handle('cookie-get', async (_, name: string) => {
      try {
        const cookies = await session.defaultSession.cookies.get({ name, url: `http://localhost:${DEFAULT_PORT}` });
        return cookies.length > 0 ? cookies[0].value : null;
      } catch (error) {
        return null;
      }
    });

    ipcMain.handle('cookie-get-all', async () => {
      try {
        const cookies = await session.defaultSession.cookies.get({});
        return cookies.map(c => ({
          name: c.name, value: c.value, path: c.path, domain: c.domain,
          secure: c.secure, httpOnly: c.httpOnly, expirationDate: c.expirationDate,
        }));
      } catch (error) {
        return [];
      }
    });

    ipcMain.handle('cookie-remove', async (_, name: string) => {
      try {
        await session.defaultSession.cookies.remove(`http://localhost:${DEFAULT_PORT}`, name);
        return true;
      } catch (error) {
        return false;
      }
    });

    return win;
  })
  .then(syncCookiesToRenderer)
  .then(setupMenu);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

reloadOnChange();
setupAutoUpdater();

let lastCookieSync = 0;
const COOKIE_SYNC_THROTTLE = 5000;

async function syncCookiesToRenderer(win: BrowserWindow) {
  const now = Date.now();
  if (now - lastCookieSync < COOKIE_SYNC_THROTTLE) return;
  lastCookieSync = now;

  try {
    const cookies = await session.defaultSession.cookies.get({});
    win.webContents.send('sync-cookies', cookies);
    if (isDev) console.log(`Synced ${cookies.length} cookies`);
  } catch (error) {
    console.error('Sync failed:', error);
  }
}