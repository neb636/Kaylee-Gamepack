// Writes dist/sw.js (from src/offline/sw.js) listing every built file, so the app can run offline on the iPad.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

/** In index.html (see there): the worker treats a page without it as a wifi login page, not the app. */
export const APP_MARK = '<meta name="gamepack-offline" content="app" />'

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
      // Each file's size: the worker saves a download only when it is exactly this long (a wifi login page or a
      // download cut short never is). closeBundle runs after every plugin's writeBundle, so these are the final files.
      const sizes = Object.fromEntries(files.map((f) => [f, statSync(join(out, f)).size]))
      // A build is its files (hashed names change with their contents) plus index.html, the one unhashed file that
      // points at the rest, plus the worker itself: a changed worker saves into a fresh cache instead of trusting
      // copies an older one checked differently. The worker checks index.html against this.
      const indexHtml = readFileSync(join(out, 'index.html'))
      if (!indexHtml.includes(APP_MARK)) throw new Error(`index.html lost ${APP_MARK}: the worker would take every deploy for a wifi login page`)
      const index = sha256(indexHtml)
      const template = readFileSync(resolve(config.root, 'src/offline/sw.js'), 'utf8')
      const build = sha256(JSON.stringify(sizes) + index + template).slice(0, 16)
      const sw = template
        .replace('__FILES__', JSON.stringify(sizes))
        .replace('__FOLDER__', JSON.stringify(`gamepack:${config.base}`))
        .replace('__BUILD__', JSON.stringify(build))
        .replace('__INDEX_SHA256__', JSON.stringify(index))
        .replace('__APP_MARK__', JSON.stringify(APP_MARK))
      if (/__[A-Z0-9_]+__/.test(sw.replace(/\/\/.*$/gm, ''))) throw new Error('sw.js has a placeholder vite-offline.ts does not fill')
      writeFileSync(join(out, 'sw.js'), sw)
    },
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
}

const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex')
