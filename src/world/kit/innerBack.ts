// The browser's Back inside an activity. Sections rewrite the address bar in place (kit/sections.ts), so Back normally
// leaves the whole activity. An activity with a hub of its own (the Nan map) can say "she's away from the hub" with
// `useInnerBack(away, onBack)`: while `away`, there is one extra history entry, and Back pops it and calls `onBack`
// (back to the hub, the route and the activity kept as they are) instead of leaving. When she goes back to the hub by
// herself, the extra entry is popped quietly, so the next Back leaves the activity as before.
import { useEffect, useRef } from 'react'
import { keepRoute } from '../../router'

const MARK = '__kayleeInner'

export function useInnerBack(away: boolean, onBack: () => void) {
  const latest = useRef(onBack)
  latest.current = onBack
  const pushed = useRef(false)
  const quiet = useRef<string | null>(null)

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (quiet.current !== null) {
        // Our own pop (she went back by herself): keep the route, and put the hub's newest link back in the bar.
        keepRoute()
        history.replaceState(history.state, '', quiet.current)
        quiet.current = null
        return
      }
      if (!pushed.current || (e.state && e.state[MARK])) return
      pushed.current = false
      keepRoute()
      latest.current()
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (away && !pushed.current) {
      // The hub's entry stays behind this one (its link is in the bar right now).
      history.pushState({ ...(history.state ?? {}), [MARK]: true }, '', location.hash)
      pushed.current = true
    } else if (!away && pushed.current) {
      pushed.current = false
      // After this commit's effects (the hub's section has written its link), pop the extra entry.
      setTimeout(() => {
        quiet.current = location.hash
        history.back()
      }, 0)
    }
  }, [away])
}
