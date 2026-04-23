import path from "node:path";
import { spawn } from 'node:child_process';

export async function initNextServer(): Promise<string> {
  const port = 3000;

  const rootDir = path.resolve(__dirname, "../../");

  console.log("Starting Next.js from:", rootDir);

  return new Promise((resolve, reject) => {
    nextDevProcess = spawn(
      "pnpm",
      ["next", "dev", "-p", String(port), "-H", "127.0.0.1"],
      {
        cwd: rootDir,
        stdio: "inherit",
        shell: true,
        env: { ...process.env, NODE_ENV: "development" },
      }
    );

    nextDevProcess.on("spawn", () => {
      console.log("Next.js dev server started on port", port);
      resolve(`http://localhost:${port}`);
    });

    nextDevProcess.on("error", (err) => {
      console.error("Failed to start Next.js dev server:", err);
      reject(err);
    });
  });
}