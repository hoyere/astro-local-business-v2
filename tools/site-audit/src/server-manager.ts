import * as fs from 'fs';
import * as path from 'path';
import { exec } from './utils';
import { ChildProcess, spawn } from 'child_process';

let serverProcess: ChildProcess | null = null;

/**
 * Check if a server is already running at the given URL.
 */
async function isServerRunning(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(3000) });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

/**
 * Wait for a server to become available, with timeout.
 */
async function waitForServer(baseUrl: string, timeoutMs: number = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerRunning(baseUrl)) return true;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}

/**
 * Start the Astro preview server if not already running.
 * Returns true if a server was started (and needs to be stopped later).
 */
export async function ensureServer(
  baseUrl: string,
  projectRoot: string
): Promise<boolean> {
  if (await isServerRunning(baseUrl)) {
    console.log(`  Server already running at ${baseUrl}`);
    return false;
  }

  console.log(`  Starting preview server at ${baseUrl}...`);

  // Build first if dist/ doesn't exist
  const distDir = path.join(projectRoot, 'dist');

  if (!fs.existsSync(distDir)) {
    console.log('  Building site first (npm run build)...');
    const buildResult = exec('npm run build', { cwd: projectRoot, timeoutMs: 120_000 });
    if (buildResult.exitCode !== 0) {
      throw new Error(`Build failed: ${buildResult.stderr}`);
    }
  }

  serverProcess = spawn('npm', ['run', 'preview'], {
    cwd: projectRoot,
    stdio: 'pipe',
    detached: false,
  });

  serverProcess.on('error', (err) => {
    console.error(`  Server process error: ${err.message}`);
  });

  const ready = await waitForServer(baseUrl);
  if (!ready) {
    stopServer();
    throw new Error(`Server failed to start at ${baseUrl} within timeout`);
  }

  console.log(`  Server started at ${baseUrl}`);
  return true;
}

/**
 * Stop the preview server if we started one.
 */
export function stopServer(): void {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
    console.log('  Preview server stopped.');
  }
}
