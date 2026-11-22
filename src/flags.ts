import { useEffect, useState } from 'react'
import posthog, { isPostHogEnabled } from './posthog'

/**
 * Feature flags (PostHog). Unfinished work merges behind a flag so the live site doesn't show it yet.
 *
 * Every flag is OFF unless PostHog says it's on, right now, for this browser:
 * - off in builds without PostHog (PR previews, local builds: `?all=1` still shows hidden places there),
 * - off while offline, and until this launch's flags have come back from PostHog (a saved copy isn't trusted),
 * - off if loading them failed (a hotel wifi login page).
 * So her iPad, which is often offline, never sees something half-built. Testers (`?tester=1`, `docs/play-data.md`)
 * are matched by the person property `tester = true`, which `posthog.ts` sends with the flags request.
 *
 * Add a flag: create it in PostHog (off by default, released to `tester = true`), name it here, and check it with
 * `useFlag()` (components) or `flagOn()`. A place can take one in its meta (`featureFlag`) to stay off the map until it's on.
 * Delete it here and in PostHog once the work ships to everyone.
 */
export const FLAGS = {
  /** The new Canada (Maple's Team) on the world map and the game shelf. */
  newCanadaPin: 'new-canada-pin',
} as const

export type FeatureFlag = (typeof FLAGS)[keyof typeof FLAGS]

/** True once this launch's flags came back from PostHog without an error. */
let loaded = false
const listeners = new Set<() => void>()
const changed = () => listeners.forEach((fn) => fn())

if (isPostHogEnabled) {
  posthog.onFeatureFlags((_flags, _variants, context) => {
    loaded = !context?.errorsLoading
    changed()
  })
  window.addEventListener('online', changed)
  window.addEventListener('offline', changed)
}

const online = () => typeof navigator === 'undefined' || navigator.onLine !== false

/** Is this flag on right now? False unless PostHog loaded it this launch, we're online, and it's on. */
export function flagOn(flag: FeatureFlag): boolean {
  if (!isPostHogEnabled || !loaded || !online()) return false
  return posthog.isFeatureEnabled(flag, { send_event: false }) === true
}

/** Re-renders when flags load or the connection comes and goes. Returns `flagOn`, current for this render. */
export function useFlags(): (flag: FeatureFlag) => boolean {
  const [, bump] = useState(0)
  useEffect(() => {
    const fn = () => bump((n) => n + 1)
    listeners.add(fn)
    return () => {
      listeners.delete(fn)
    }
  }, [])
  return flagOn
}

export const useFlag = (flag: FeatureFlag): boolean => useFlags()(flag)
