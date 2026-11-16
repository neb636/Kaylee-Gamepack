// Writes dist/sw.js (from src/offline/sw.js) listing every built file, so the app can run offline on the iPad.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

export function offline(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'kaylee-offline',
    apply: 'build',
    configResolved(c) {
      config = c
    },
    closeBundle() {
      const out = resolve(config.root, config.build.outDir)
      const files = walk(out)
        .map((f) => relative(out, f).split('\\').join('/'))
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map') && !f.startsWith('.') && !f.startsWith('review/') && !f.startsWith('docs/'))
        .sort()
      // A build is its file list (hashed names change with their contents) plus index.html, the one unhashed file
      // that points at the rest. The worker saves each build in its own cache and checks index.html against this.
      const index = sha256(readFileSync(join(out, 'index.html')))
      const build = sha256(JSON.stringify(files) + index).slice(0, 16)
      const template = readFileSync(resolve(config.root, 'src/offline/sw.js'), 'utf8')
      const sw = template
        .replace('__PRECACHE__', JSON.stringify(files))
        .replace('__FOLDER__', JSON.stringify(`gamepack:${config.base}`))
        .replace('__BUILD__', JSON.stringify(build))
        .replace('__INDEX_SHA256__', JSON.stringify(index))
      if (/__[A-Z0-9_]+__/.test(sw.replace(/\/\/.*$/gm, ''))) throw new Error('sw.js has a placeholder vite-offline.ts does not fill')
      writeFileSync(join(out, 'sw.js'), sw)
    },
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
}

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
