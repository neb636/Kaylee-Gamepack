import { useSyncExternalStore } from 'react'

const query = typeof matchMedia === 'undefined' ? undefined : matchMedia('(orientation: landscape)')

/** True in landscape (re-renders when the iPad turns). */
export function useLandscape() {
  return useSyncExternalStore(
    (cb) => {
      query?.addEventListener('change', cb)
      return () => query?.removeEventListener('change', cb)
    },
    () => !!query?.matches,
  )
}
