import { spawn, type ChildProcess } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { GAME_ORIGIN } from '../shared/labs';

export async function validateGameCheckout(root: string): Promise<void> {
  if (!path.isAbsolute(root)) throw new Error('Choose a game checkout folder.');
  await access(path.join(root, 'src/world/labs/workbench.ts'));
  try { await access(path.join(root, 'node_modules/vite/bin/vite.js')); }
  catch { throw new Error('Game dependencies are missing. Open a terminal in this checkout and run npm ci, then reopen the lab.'); }
}

/** Own the server: never attach to an unrelated process occupying the lab origin. */
export class GameServer {
  private child?: ChildProcess;
  async stop(): Promise<void> {
    const child = this.child;
    this.child = undefined;
    if (child?.pid && child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
      try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill(); }
      let timeout: ReturnType<typeof setTimeout>;
      await Promise.race([exited, new Promise<void>(resolve => { timeout = setTimeout(() => { try { process.kill(-child.pid!, 'SIGKILL'); } catch {} resolve(); }, 3000); })]);
      clearTimeout(timeout!);
    }
  }
  async start(repo: string, onFailure: (message: string) => void): Promise<void> {
    // Electron includes a Node runtime, so Finder doesn't need Node on its minimal PATH.
    const node = process.execPath;
    let occupied = false;
    try { await fetch(GAME_ORIGIN, { signal: AbortSignal.timeout(1000) }); occupied = true; } catch { /* no HTTP server */ }
    if (occupied) throw new Error(`${GAME_ORIGIN} is already in use. Quit the other Studio or game server first.`);
    const child = spawn(node, [path.join(repo, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5174', '--strictPort'], {
      cwd: repo, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
    });
    this.child = child;
    let failure = '';
    let output = '';
    let ready = false;
    const failed = (message: string) => { failure = message; if (ready && this.child === child) onFailure(message); };
    child.stdout?.on('data', data => { output = (output + data).slice(-4000); });
    child.stderr?.on('data', data => { output = (output + data).slice(-4000); });
    child.on('error', error => failed(error.message));
    child.on('exit', code => failed(`Game server exited (${code}). ${output}`));
    try {
      for (let attempt = 0; attempt < 120; attempt++) {
        if (failure) throw new Error(failure);
        try {
          const response = await fetch(`${GAME_ORIGIN}/@vite/client`, { signal: AbortSignal.timeout(1000) });
          if (response.ok) {
            // Give a port-binding error time to arrive before trusting the origin.
            await new Promise(resolve => setTimeout(resolve, 100));
            if (failure) throw new Error(failure);
            ready = true;
            return;
          }
        } catch { if (failure) throw new Error(failure); }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      throw new Error(`Could not start the game server. ${output}`);
    } catch (error) { this.stop(); throw error; }
  }
}
