import { useEffect, useState } from 'react'

/** Device-local dates match the day Kaylee sees. A normal query survives hash navigation. */
export function isHalloween(date = new Date(), search = location.search) {
  const theme = new URLSearchParams(search).get('theme')
  if (theme === 'halloween') return true
  if (theme === 'default') return false
  return date.getMonth() === 9 && date.getDate() >= 30
}

export function useHalloween() {
  const [active, setActive] = useState(() => isHalloween())
  useEffect(() => {
    // An iPad left open overnight returns to its regular look after Halloween.
    const refresh = () => setActive(isHalloween())
    const timer = setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])
  return active
}
