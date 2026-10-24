// Is the iPad online? For things that only work with the internet (YouTube videos): hide them when it isn't.
import { useSyncExternalStore } from 'react'

function subscribe(onChange: () => void) {
  window.addEventListener('online', onChange)
  window.addEventListener('offline', onChange)
  return () => {
    window.removeEventListener('online', onChange)
    window.removeEventListener('offline', onChange)
  }
}

export const useOnline = () => useSyncExternalStore(subscribe, () => navigator.onLine)
