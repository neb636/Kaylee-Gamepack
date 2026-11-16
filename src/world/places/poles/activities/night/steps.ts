// The Longest Night in play order (Night.tsx runs it; Place.tsx's film links go on along it). A film between each act,
// and where she picks up if she leaves between acts. Loaded at startup: no three.js here.
import type { FilmId } from '../story/sections'

export type Act = 'fly' | 'chorus' | 'huddle' | 'goodbye'
export type Step = { film: FilmId } | { act: Act }
/** The chapter in play order. */
export const STEPS: Step[] = [{ film: 'night-in' }, { act: 'fly' }, { film: 'night-lost' }, { act: 'chorus' }, { film: 'night-colony' }, { act: 'huddle' }, { film: 'night-sunrise' }, { film: 'night-goodbye' }, { act: 'goodbye' }, { film: 'the-end' }]
/** Each act's first section (its link). */
export const ACT_SECTION: Record<Act, string> = { fly: 'fly', chorus: 'whiteout', huddle: 'huddle', goodbye: 'goodbye' }

// Where she left off between acts (this visit to the app and the next): the step after the last act she finished.
const RESUME_KEY = 'kaylee-gamepack:poles:night-at'
export const resumeAt = () => {
  try {
    const n = Number(localStorage.getItem(RESUME_KEY))
    return Number.isInteger(n) && n > 0 && n < STEPS.length ? n : 0
  } catch {
    return 0
  }
}
export const saveResume = (n: number) => {
  try {
    if (n <= 0 || n >= STEPS.length) localStorage.removeItem(RESUME_KEY)
    else localStorage.setItem(RESUME_KEY, String(n))
  } catch {
    /* a private window: it starts from the beginning next time */
  }
}
/** Start the story over (the start-over pill): the chapter starts from its first film again. */
export const forgetNight = () => saveResume(0)
