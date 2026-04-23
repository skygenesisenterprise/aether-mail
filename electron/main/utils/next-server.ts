import { spawn } from 'node:child_process';
import { app } from 'electron';

let nextDevProcess: ReturnType<typeof spawn> | undefined;

// Start Next.js dev server for development mode
export async function initNextServer(): Promise<string> {
  const port = 3000;
  
  return new Promise((resolve, reject) => {
    nextDevProcess = spawn('pnpm', ['next', 'dev', '-p', String(port), '-H', '127.0.0.1'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NODE_ENV: 'development' },
    });

    nextDevProcess.on('spawn', () => {
      console.log('Next.js dev server started on port', port);
      resolve(`http://localhost:${port}`);
    });

    nextDevProcess.on('error', (err) => {
      console.error('Failed to start Next.js dev server:', err);
      reject(err);
    });
  });
}

// Stop Next.js dev server
export async function stopNextServer() {
  if (nextDevProcess) {
    nextDevProcess.kill();
    nextDevProcess = undefined;
    console.log('Next.js dev server stopped');
  }
}

// Clean up on quit
app.on('before-quit', async () => {
  await stopNextServer();
});

export { nextDevProcess as nextServer };