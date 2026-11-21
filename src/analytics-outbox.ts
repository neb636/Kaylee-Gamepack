// Play data she makes offline (on a plane, on the boat, in the mountains) waits here and goes to PostHog when the iPad
// is back online. posthog-js only retries in memory, so without this a session played offline was lost when the app
// closed. Each event keeps its own uuid and the time it happened, so a resend never double-counts and the play data
// shows when she really played. A full iPad loses play data, never the game: every write is allowed to fail.
import type { BeforeSendFn, CaptureResult } from 'posthog-js'

const KEY = 'gamepack.outbox'
const MAX_EVENTS = 2000
const MAX_CHARS = 1_500_000
const BATCH = 200

interface Saved {
  uuid: string
  event: string
  properties: Record<string, unknown>
  timestamp: string
  $set?: Record<string, unknown>
  $set_once?: Record<string, unknown>
}

function read(): Saved[] {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function write(list: Saved[]) {
  try {
    let json = JSON.stringify(list.slice(-MAX_EVENTS))
    // Too big for the space we allow ourselves: drop the oldest half until it fits.
    while (json.length > MAX_CHARS && list.length > 1) {
      list = list.slice(Math.ceil(list.length / 2))
      json = JSON.stringify(list)
    }
    if (list.length) localStorage.setItem(KEY, json)
    else localStorage.removeItem(KEY)
  } catch {
    // Storage full or blocked: this bit of play data is lost.
  }
}

/** The events waiting to be sent (QA reads it). */
export const outbox = (): readonly Saved[] => read()

/** A `before_send` step: offline, the event goes into the outbox instead of the network. */
export const keepOffline: BeforeSendFn = (cr: CaptureResult) => {
  if (typeof navigator === 'undefined' || navigator.onLine !== false) return cr
  const saved: Saved = {
    uuid: cr.uuid,
    event: cr.event,
    properties: cr.properties,
    timestamp: (cr.timestamp ?? new Date()).toISOString(),
  }
  if (cr.$set) saved.$set = cr.$set
  if (cr.$set_once) saved.$set_once = cr.$set_once
  write([...read(), saved])
  return null
}

let flushing: Promise<void> | null = null

/** Sends what's waiting, oldest first. An event leaves the outbox only once PostHog has said it got it: a wifi login
 *  page answers 200 too, but not with PostHog's JSON. */
function flush(host: string, token: string): Promise<void> {
  flushing ??= (async () => {
    for (;;) {
      if (navigator.onLine === false) return
      const batch = read().slice(0, BATCH)
      if (!batch.length) return
      const ok = await fetch(`${host.replace(/\/+$/, '')}/batch/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: token,
          batch: batch.map((e) => ({ ...e, properties: { ...e.properties, $replayed_offline: true } })),
        }),
      })
        .then(async (res) => res.ok && /json/i.test(res.headers.get('content-type') ?? '') && (await res.json().catch(() => null)) !== null)
        .catch(() => false)
      if (!ok) return // try again when the iPad next comes online or opens the app
      const sent = new Set(batch.map((e) => e.uuid))
      write(read().filter((e) => !sent.has(e.uuid)))
    }
  })().finally(() => (flushing = null))
  return flushing
}

/** Sends the outbox now and whenever the iPad comes back online or the app comes back to the front. */
export function startOutbox(host: string, token: string) {
  const go = () => void flush(host, token)
  go()
  window.addEventListener('online', go)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && go())
}
