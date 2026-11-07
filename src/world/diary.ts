// Kaylee's play diary: which section she's in, for how long, how many taps, how many hints the game showed her (a soft
// sign she was stuck: most hints come after a while with nothing touched), and whether she left before the end. It goes
// to PostHog on the main site only (src/posthog.ts; previews and local builds send nothing), with no names and no
// pictures. The `kaylee-week` skill turns a week of it into her favorites, where she quits and what she never opens.
// Sections report themselves through kit/sections.ts's enter().
import posthog, { isPostHogEnabled } from '../posthog'

interface Open {
  place: string
  activity: string
  section: string
  at: number
  taps: number
  hints: number
}

export interface DiaryEvent {
  event: 'world_section_entered' | 'world_section_left'
  place: string
  activity: string
  section: string
  seconds?: number
  taps?: number
  hints?: number
  why?: 'next' | 'away' | 'hidden'
}

declare global {
  interface Window {
    /** The last few diary events (QA and tests read it; PostHog gets them only on the main site). */
    __kayleeDiary?: DiaryEvent[]
  }
}

let open: Open | null = null
let away: Open | null = null // the section she was in when the iPad went to sleep

function send(e: DiaryEvent) {
  const log = (window.__kayleeDiary ??= [])
  log.push(e)
  if (log.length > 50) log.shift()
  if (isPostHogEnabled) {
    const { event, ...props } = e
    posthog.capture(event, props)
  }
}

function close(why: DiaryEvent['why']) {
  if (!open) return
  const { place, activity, section, at, taps, hints } = open
  open = null
  send({ event: 'world_section_left', place, activity, section, seconds: Math.round((performance.now() - at) / 100) / 10, taps, hints, why })
}

/** A section began (kit/sections.ts calls this from enter()). */
export function diaryEnter(place: string, activity: string, section: string) {
  if (open && open.place === place && open.activity === activity && open.section === section) return
  close('next')
  open = { place, activity, section, at: performance.now(), taps: 0, hints: 0 }
  send({ event: 'world_section_entered', place, activity, section })
}

if (typeof window !== 'undefined') {
  addEventListener('pointerdown', () => open && open.taps++, { capture: true, passive: true })
  // A hint was shown or said (sdk/hints.ts spendHint, and kit/Guide's silent hints on the hubs).
  addEventListener('kaylee:hint', () => open && open.hints++)
  // Leaving the activity for the map, the shelf or another country ends the section.
  addEventListener('hashchange', () => {
    if (open && !location.hash.startsWith(`#/world/${open.place}/${open.activity}`) && !(open.activity === 'hub' && location.hash.split('?')[0] === `#/world/${open.place}`)) close('away')
  })
  // The iPad went to the home screen or the screen locked: the section ends there (PostHog sends it on the way out),
  // and starts again if she comes back to it.
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      away = open
      close('hidden')
    } else if (away && !open && location.hash.startsWith(`#/world/${away.place}`)) {
      diaryEnter(away.place, away.activity, away.section)
      away = null
    }
  })
}
