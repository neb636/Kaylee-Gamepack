import { useSyncExternalStore } from 'react'

export type Route = { name: 'home' } | { name: 'game'; id: string } | { name: 'trophies' } | { name: 'playground' }

function parse(hash: string): Route {
  const [, first, second] = hash.replace(/^#/, '').split('/')
  if (first === 'game' && second) return { name: 'game', id: decodeURIComponent(second) }
  if (first === 'trophies') return { name: 'trophies' }
  if (first === 'playground') return { name: 'playground' }
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
}
