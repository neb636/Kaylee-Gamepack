import { useSyncExternalStore } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'game'; id: string }
  | { name: 'trophies' }
  | { name: 'playground' }
  // Around the World: #/world, #/world/passport, #/world/coloring, #/world/<place>, #/world/<place>/<activity>
  | { name: 'world'; place?: string; activity?: string }

function parse(hash: string): Route {
  const [, first, second, third] = hash.replace(/^#/, '').split('/')
  if (first === 'game' && second) return { name: 'game', id: decodeURIComponent(second) }
  if (first === 'trophies') return { name: 'trophies' }
  if (first === 'playground') return { name: 'playground' }
  if (first === 'world') return { name: 'world', place: second ? decodeURIComponent(second) : undefined, activity: third ? decodeURIComponent(third) : undefined }
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
}
