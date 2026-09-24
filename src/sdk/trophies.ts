// Kaylee's trophy collection, saved on this device.
import { useSyncExternalStore } from 'react'

export interface Trophy {
  gameId: string
  gameTitle: string
  trophyTitle: string
  emoji: string
  firstEarnedAt: string
  lastEarnedAt: string
  /** How many times she has won this game. */
  count: number
}

// Previews live on the same website as the real app, so keep their trophies separate.
const KEY = `kaylee-gamepack:${import.meta.env.BASE_URL}:trophies`
const listeners = new Set<() => void>()

let cache: Trophy[] | undefined
function read(): Trophy[] {
  if (!cache) {
    try {
      cache = JSON.parse(localStorage.getItem(KEY) ?? '[]') as Trophy[]
    } catch {
      cache = []
    }
  }
  return cache
}

export function getTrophies(): Trophy[] {
  return read()
}

export function awardTrophy(t: Pick<Trophy, 'gameId' | 'gameTitle' | 'trophyTitle' | 'emoji'>): Trophy {
  const now = new Date().toISOString()
  const existing = read().find((x) => x.gameId === t.gameId)
  const trophy: Trophy = existing
    ? { ...existing, ...t, lastEarnedAt: now, count: existing.count + 1 }
    : { ...t, firstEarnedAt: now, lastEarnedAt: now, count: 1 }
  cache = [trophy, ...read().filter((x) => x.gameId !== t.gameId)]
  localStorage.setItem(KEY, JSON.stringify(cache))
  listeners.forEach((l) => l())
  return trophy
}

export function useTrophies(): Trophy[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    read,
  )
}
