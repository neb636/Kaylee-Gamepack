// Kaylee's passport: which countries she visited and which stamps she earned, saved on this device.
import { useSyncExternalStore } from 'react'

export interface PassportData {
  visited: string[]
  stamps: Record<string, string[]>
}

// Previews live on the same website as the real app, so keep their passports separate.
const KEY = `kaylee-gamepack:${import.meta.env.BASE_URL}:world`
const EMPTY: PassportData = { visited: [], stamps: {} }
const listeners = new Set<() => void>()

let cache: PassportData | undefined
function read(): PassportData {
  if (!cache) {
    try {
      cache = { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<PassportData>) }
    } catch {
      cache = EMPTY
    }
  }
  return cache
}

function write(next: PassportData) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((l) => l())
}

export function markVisited(place: string) {
  const data = read()
  if (!data.visited.includes(place)) write({ ...data, visited: [...data.visited, place] })
}

/** Returns true if this is a new stamp. */
export function addStamp(place: string, activity: string): boolean {
  const data = read()
  const have = data.stamps[place] ?? []
  if (have.includes(activity)) return false
  write({ ...data, stamps: { ...data.stamps, [place]: [...have, activity] } })
  return true
}

/** Test/dev helper. */
export function setStamps(place: string, activities: string[]) {
  const data = read()
  write({ ...data, visited: [...new Set([...data.visited, place])], stamps: { ...data.stamps, [place]: activities } })
}

export function resetPassport() {
  write(EMPTY)
}

export function usePassport(): PassportData {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    read,
  )
}

export const totalStamps = (data: PassportData) => Object.values(data.stamps).reduce((n, s) => n + s.length, 0)
