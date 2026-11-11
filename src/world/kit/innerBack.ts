// The browser's Back inside an activity. Sections rewrite the address bar in place (kit/sections.ts), so Back normally
// leaves the whole activity. An activity with a hub of its own (the Nan map) can say "she's away from the hub" with
// `useInnerBack(away, onBack)`: while `away`, there is one extra history entry, and Back pops it and calls `onBack`
// (back to the hub, the route and the activity kept as they are) instead of leaving. When she goes back to the hub by
// herself, the extra entry is popped quietly, so the next Back leaves the activity as before.
import { useEffect, useRef } from 'react'
import { keepRoute, releaseRoute } from '../../router'

const MARK = '__kayleeInner'

// A traversal that changes no hash fires no hashchange, so the guard would stay armed and swallow the next real
// navigation. The hashchange of a traversal follows its popstate at once; if it hasn't come soon, disarm.
function keepRouteForThisPop() {
  keepRoute()
  setTimeout(releaseRoute, 100)
}

export function useInnerBack(away: boolean, onBack: () => void) {
  const latest = useRef(onBack)
  latest.current = onBack
  const pushed = useRef(false)
  const quiet = useRef<string | null>(null)
  const base = useRef<string | null>(null) // the hub entry's hash, kept in the marked entry's state

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (quiet.current !== null) {
        // Our own pop (she went back by herself): keep the route, and put the hub's newest link back in the bar.
        keepRouteForThisPop()
        history.replaceState(history.state, '', quiet.current)
        quiet.current = null
        return
      }
      if (!pushed.current || (e.state && e.state[MARK])) return
      // Only the activity's own Back lands on the entry under the extra one (the hub's link). Any other hash
      // navigation (the stamp's close button going home) fires popstate too and must reach the router.
      if (base.current !== null && location.hash !== base.current) return
      pushed.current = false
      keepRouteForThisPop()
      latest.current()
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    if (away && !pushed.current) {
      // The hub's entry stays behind this one (its link is in the bar right now). After a reload on an away section,
      // this entry is already the extra one: reuse it instead of stacking another.
      const marked = history.state?.[MARK]
      if (typeof marked === 'string') base.current = marked
      else {
        base.current = location.hash
        history.pushState({ ...(history.state ?? {}), [MARK]: location.hash }, '', location.hash)
      }
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
