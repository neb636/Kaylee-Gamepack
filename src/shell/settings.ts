import { useSyncExternalStore } from 'react'

export interface Settings {
  debugMode: boolean
}

const KEY = `kaylee-gamepack:${import.meta.env.BASE_URL}:settings`
const DEFAULTS: Settings = { debugMode: false }
const listeners = new Set<() => void>()

function load(): Settings {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (saved && typeof saved === 'object' && 'debugMode' in saved && typeof saved.debugMode === 'boolean') {
      return { debugMode: saved.debugMode }
    }
  } catch { /* Unavailable storage or invalid JSON uses defaults. */ }
  return DEFAULTS
}

let current = load()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, () => current)
}

export function setDebugMode(debugMode: boolean) {
  current = { debugMode }
  try { localStorage.setItem(KEY, JSON.stringify(current)) } catch { /* Keep the setting for this visit. */ }
  listeners.forEach((listener) => listener())
}

window.addEventListener('storage', (event) => {
  if (event.key !== KEY && event.key !== null) return
  current = load()
  listeners.forEach((listener) => listener())
})
