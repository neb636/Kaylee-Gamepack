import { useEffect, useState } from 'react'

/** Device-local dates match the day Kaylee sees. A normal query survives hash navigation. */
export function isHalloween(date = new Date(), search = location.search, dayOnly = false) {
  const theme = new URLSearchParams(search).get('theme')
  if (theme === 'halloween') return true
  if (theme === 'default') return false
  return date.getMonth() === 9 && (dayOnly ? date.getDate() === 31 : date.getDate() >= 30)
}

/** The wardrobe is a Halloween-day surprise; the home decorations start the day before. */
export const isHalloweenDay = (date = new Date(), search = location.search) => isHalloween(date, search, true)

export function useHalloween(dayOnly = false) {
  const [active, setActive] = useState(() => isHalloween(new Date(), location.search, dayOnly))
  useEffect(() => {
    // An iPad left open overnight returns to its regular look after Halloween.
    const refresh = () => setActive(isHalloween(new Date(), location.search, dayOnly))
    const timer = setInterval(refresh, 30_000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [dayOnly])
  return active
}
