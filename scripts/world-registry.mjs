// The world's countries and their section links, read in Node from the same files the app uses (each place's meta.ts
// and every activity's sections.ts, like src/world/registry.ts), so scripts never keep their own lists of activities:
// the README directory (sections-readme.mjs) and the QA scripts' default screens (qa-lib.mjs) come from here.
// Vite loads the TypeScript (it resolves the imports and the pictures those files pull in); a few browser globals are
// stubbed because router.ts reads the address bar when it loads.
import { globSync } from 'node:fs'
import { createServer } from 'vite'

const HUB = 'hub'
const FINALE = 'party'

/** Builds a #/world link the way src/router.ts worldLink does (commas stay readable). */
export function worldLink(place, activity, section, params = {}) {
  const path = ['#/world', place, ...(activity ? [activity] : []), ...(section ? [section] : [])].map((p, i) => (i ? encodeURIComponent(p) : p)).join('/')
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%2C/g, ',')}`)
    .join('&')
  return query ? `${path}?${query}` : path
}

/**
 * Every country in play order of the app (oldest first, as the world map lists them), each with its activities in the
 * order the section index shows them: the hub, the live activities, the ones in the works, then the finale.
 * @returns {Promise<{ id: string, name: string, emoji: string, activities: { id: string, name: string, icon: string, kind: 'hub' | 'live' | 'works' | 'finale', sections: import('../src/world/kit/sections').ActivitySections | undefined }[] }[]>}
 */
export async function loadWorld() {
  const stub = { getItem: () => null, setItem() {}, removeItem() {} }
  Object.assign(globalThis, { window: globalThis, location: { hash: '', search: '', href: 'http://localhost/' }, localStorage: stub, sessionStorage: stub, history: { replaceState() {}, state: null }, addEventListener() {}, removeEventListener() {} })
  const server = await createServer({ configFile: false, root: process.cwd(), logLevel: 'error', appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true, include: [] } })
  try {
    const defs = []
    for (const file of globSync('src/world/places/*/activities/**/*sections.ts').sort()) defs.push((await server.ssrLoadModule(`/${file}`)).default)
    const places = []
    for (const file of globSync('src/world/places/*/meta.ts')) {
      const id = file.split('/')[3]
      const meta = { ...(await server.ssrLoadModule(`/${file}`)).default, id }
      const find = (activity) => defs.find((d) => d.place === id && d.activity === activity)
      const activities = [
        ...(find(HUB) ? [{ id: HUB, name: 'Home base', icon: '🏠', kind: 'hub' }] : []),
        ...meta.activities.map((a) => ({ ...a, kind: 'live' })),
        ...(meta.inTheWorks ?? []).map((a) => ({ ...a, kind: 'works' })),
        { id: FINALE, name: 'Finale', icon: '🎉', kind: 'finale' },
      ].map((a) => ({ id: a.id, name: a.name, icon: a.icon, kind: a.kind, sections: find(a.id) }))
      places.push({ id, name: meta.name, emoji: meta.emoji, createdAt: meta.createdAt, activities })
    }
    return places.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  } finally {
    await server.close()
  }
}
