import { useSyncExternalStore } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'game'; id: string }
  | { name: 'trophies' }
  | { name: 'playground' }
  // Around the World: #/world, #/world/passport, #/world/coloring, #/world/<place>, #/world/<place>/<activity>,
  // and deep links into one section of an activity: #/world/<place>/<activity>/<section>?<state> (see world/kit/sections.ts)
  | { name: 'world'; place?: string; activity?: string; section?: string; params: Record<string, string> }
  // I Spy: #/ispy is the shelf of books, #/ispy/<book> opens one, #/ispy/<book>/<section>?<state> a page of it.
  | { name: 'ispy'; book?: string; section?: string; params: Record<string, string> }

export function parse(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  const [, first, second, third, fourth] = path.split('/')
  if (first === 'game' && second) return { name: 'game', id: decodeURIComponent(second) }
  if (first === 'trophies') return { name: 'trophies' }
  if (first === 'playground') return { name: 'playground' }
  const part = (p?: string) => (p ? decodeURIComponent(p) : undefined)
  if (first === 'ispy') return { name: 'ispy', book: part(second), section: part(third), params: Object.fromEntries(new URLSearchParams(query)) }
  if (first === 'world') {
    return { name: 'world', place: part(second), activity: part(third), section: part(fourth), params: Object.fromEntries(new URLSearchParams(query)) }
  }
  return { name: 'home' }
}

let current = parse(location.hash)
const subscribe = (cb: () => void) => {
  const on = () => {
    current = parse(location.hash)
    cb()
  }
  window.addEventListener('hashchange', on)
  return () => window.removeEventListener('hashchange', on)
}

export const useRoute = () => useSyncExternalStore(subscribe, () => current)

export const go = {
  home: () => (location.hash = '#/'),
  game: (id: string) => (location.hash = `#/game/${encodeURIComponent(id)}`),
  trophies: () => (location.hash = '#/trophies'),
  /** `go.world()` is the world map; `go.world('australia', 'reef')` opens a place or one of its activities. */
  world: (...parts: string[]) => (location.hash = ['#/world', ...parts.map(encodeURIComponent)].join('/')),
  /** `go.ispy()` is the shelf; `go.ispy('sparkly-abc')` opens a book. */
  ispy: (...parts: string[]) => (location.hash = ['#/ispy', ...parts.map(encodeURIComponent)].join('/')),
}

/** The hash for one page of an I Spy book, with its state: `#/ispy/sparkly-abc/page?letter=B&n=3`. */
export function ispyLink(book: string, section?: string, params: Record<string, string> = {}) {
  const path = ['#/ispy', book, ...(section ? [section] : [])].map((p, i) => (i ? encodeURIComponent(p) : p)).join('/')
  const query = new URLSearchParams(params).toString().replace(/%2C/g, ',')
  return query ? `${path}?${query}` : path
}

/** The hash for one section of an activity, with the state it needs: `#/world/italy/pizzeria/own?at=oven&sauce=pink`. */
export function worldLink(place: string, activity: string, section?: string, params: Record<string, string> = {}) {
  const path = ['#/world', place, activity, ...(section ? [section] : [])].map((p, i) => (i ? encodeURIComponent(p) : p)).join('/')
  // Commas stay readable in lists (toppings=basil,olive).
  const query = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v).replace(/%2C/g, ',')}`)
    .join('&')
  return query ? `${path}?${query}` : path
}
