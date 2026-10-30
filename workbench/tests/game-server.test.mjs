import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { GameServer, validateGameCheckout } = require('../dist-electron/main/game-server.js');

test('packaged game server owns its process, rejects an occupied origin and releases it on stop', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'studio-server-'));
  const server = new GameServer();
  const other = new GameServer();
  try {
    await mkdir(path.join(root, 'node_modules/vite/bin'), { recursive: true });
    await mkdir(path.join(root, 'src/world/labs'), { recursive: true });
    await writeFile(path.join(root, 'src/world/labs/workbench.ts'), '');
    await writeFile(path.join(root, 'node_modules/vite/bin/vite.js'), `require('node:http').createServer((req,res)=>res.end('fixture')).listen(5174,'127.0.0.1');`);
    await validateGameCheckout(root);
    const failures = [];
    await server.start(root, message => failures.push(message));
    assert.equal(await (await fetch('http://127.0.0.1:5174/@vite/client')).text(), 'fixture');
    await assert.rejects(other.start(root, () => {}), /already in use/);
    await server.stop();
    for (let attempt = 0; attempt < 50; attempt++) {
      try { await fetch('http://127.0.0.1:5174'); } catch { break; }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    await assert.rejects(fetch('http://127.0.0.1:5174'));
    assert.deepEqual(failures, []);
    await writeFile(path.join(root, 'node_modules/vite/bin/vite.js'), 'process.exit(3)');
    await assert.rejects(server.start(root, () => {}), /Game server exited \(3\)/);
  } finally { await server.stop(); await other.stop(); await rm(root, { recursive: true, force: true }); }
});
