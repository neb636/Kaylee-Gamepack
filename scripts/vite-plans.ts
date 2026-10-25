// Copies the plan pages (planning/**/*.html, the viewer in planning/viewer/ and their pictures) into dist/planning/,
// so Dad can read a plan on the iPad from the main build or a PR preview: <app>/planning/around-the-world/....
// They're for reading online: the offline service worker leaves them out (scripts/vite-offline.ts).
import { cpSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

const KEEP = new Set(['.html', '.css', '.js', '.webp', '.png', '.jpg', '.jpeg', '.svg'])

export function plans(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'kaylee-plans',
    apply: 'build',
    configResolved(c) {
      config = c
    },
    writeBundle() {
      const src = resolve(config.root, 'planning')
      const out = resolve(config.root, config.build.outDir, 'planning')
      for (const f of walk(src)) if (KEEP.has(extname(f).toLowerCase())) cpSync(f, join(out, relative(src, f)))
    },
  }
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]))
}
