// Registers the offline worker (src/offline/sw.js) in deployed builds, and asks it to top up its copies whenever
// the app opens online. Not in `npm run dev` or test browsers, so tests and QA always hit the network.
import posthog, { isPostHogEnabled } from '../posthog'
const enabled = import.meta.env.PROD && 'serviceWorker' in navigator && (!navigator.webdriver || location.search.includes('sw=1'))

if (enabled) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      void navigator.storage?.persist?.() // ask iOS not to clear the copies
      const ready = await navigator.serviceWorker.ready
      // Always the worker in charge now: after a deploy the new one takes over during this launch (controllerchange)
      // and should start saving its build straight away, not on the next launch.
      const fill = () => navigator.onLine && (navigator.serviceWorker.controller ?? ready.active)?.postMessage('fill')
      fill()
      window.addEventListener('online', fill)
      navigator.serviceWorker.addEventListener('controllerchange', fill)
      // The worker couldn't save a new build (the iPad is out of space): once per build, into the play data.
      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data as { type?: string; build?: string } | null
        if (data?.type !== 'offline-save-failed' || !isPostHogEnabled) return
        try {
          if (localStorage.getItem('gamepack.save-failed') === data.build) return
          localStorage.setItem('gamepack.save-failed', String(data.build))
        } catch {
          // storage full or blocked: report it anyway
        }
        const props: Record<string, unknown> = { ...data }
        delete props.type
        posthog.capture('offline_save_failed', props)
      })
    } catch {
      // No worker (private browsing, old Safari): the app just needs the network, as before.
    }
  })
}
