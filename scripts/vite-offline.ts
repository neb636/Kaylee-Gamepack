// Writes dist/sw.js (from src/offline/sw.js) listing every built file, so the app can run offline on the iPad.
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
        .filter((f) => f !== 'sw.js' && !f.endsWith('.map') && !f.startsWith('.'))
        .sort()
      const template = readFileSync(resolve(config.root, 'src/offline/sw.js'), 'utf8')
      const sw = template
        .replace('__PRECACHE__', JSON.stringify(files))
        .replace('__CACHE__', JSON.stringify(`gamepack:${config.base}`))
      writeFileSync(join(out, 'sw.js'), sw)
    },
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
}
