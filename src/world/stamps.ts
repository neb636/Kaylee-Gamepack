// Kaylee's passport: which countries she visited and which stamps she earned, saved on this device.
import { useSyncExternalStore } from 'react'
import { places } from './registry'

export interface PassportData {
  visited: string[]
  stamps: Record<string, string[]>
}

// Previews live on the same website as the real app, so keep their passports separate.
const KEY = `kaylee-gamepack:${import.meta.env.BASE_URL}:world`
const EMPTY: PassportData = { visited: [], stamps: {} }
const listeners = new Set<() => void>()

function load(): PassportData {
  try {
    const data = { ...EMPTY, ...(JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<PassportData>) }
    const stamps = { ...data.stamps }
    // Retired activities must not count toward the current passport or country's progress.
    for (const { meta } of places) {
      const current = new Set(meta.activities.map((a) => a.id))
      if (stamps[meta.id]) stamps[meta.id] = stamps[meta.id].filter((id) => current.has(id))
    }
    return { ...data, stamps }
  } catch {
    return EMPTY
  }
}

let cache: PassportData | undefined
function read(): PassportData {
  return (cache ??= load())
}

// Another tab (or the same app in a second window) may have saved since this tab last looked: every change starts
// from what's saved now, never from this tab's in-memory copy, so one tab can't erase the other's stamps.
function fresh(): PassportData {
  return (cache = load())
}

function write(next: PassportData) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((l) => l())
}

// Keep this tab's screens in step when another tab saves.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY && e.key !== null) return
    cache = load()
    listeners.forEach((l) => l())
  })
}

export function markVisited(place: string) {
  const data = fresh()
  if (!data.visited.includes(place)) write({ ...data, visited: [...data.visited, place] })
}

/** Returns true if this is a new stamp. */
export function addStamp(place: string, activity: string): boolean {
  const data = fresh()
  const have = data.stamps[place] ?? []
  if (have.includes(activity)) return false
  write({ ...data, stamps: { ...data.stamps, [place]: [...have, activity] } })
  return true
}

/** Test/dev helper. */
export function setStamps(place: string, activities: string[]) {
  const data = fresh()
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
