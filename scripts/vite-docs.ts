// Publish the gameplay report beside the app, including on PR previews. Keep the
// allowlist narrow: other docs are repository notes, not automatically public pages.
import { cpSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

export function docs(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'kaylee-docs',
    apply: 'build',
    configResolved(c) {
      config = c
    },
    writeBundle() {
      const out = resolve(config.root, config.build.outDir, 'docs')
      mkdirSync(out, { recursive: true })
      for (const name of ['gameplay-reference-report.html', 'gameplay-reference-assets']) {
        cpSync(resolve(config.root, 'docs', name), resolve(out, name), { recursive: true })
      }
    },
  }
}
