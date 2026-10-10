// Turns a five-year-old's wand swinging into beats. A beat is the moment the wand turns around (on either axis), so
// back-and-forth, up-and-down and circles all conduct. A long straight sweep also beats now and then, and a tap is one
// soft beat. Each beat carries how big the swing was (piano .. forte) and how long since the last one (the tempo).
// Pure logic: the scene feeds it pointer positions in px and seconds.

export const FEEL = {
  /** Wiggles smaller than this (px) don't count as a change of direction. */
  jitter: 6,
  /** A swing must travel at least this share of the screen's short side to be a beat. */
  minSwing: 0.05,
  /** A straight sweep this long (share of the short side) beats even without turning around. */
  sweep: 0.42,
  /** Fastest beats she can make (s). */
  minGap: 0.14,
  /** Swing size (share of the short side) that counts as tiny (0) and as huge (1). */
  tiny: 0.08,
  huge: 0.4,
  /** Tempo: the beat length is clamped to this range (s), and smoothed toward each new interval. */
  shortest: 0.22,
  longest: 0.95,
  follow: 0.6,
  /** Below / above this amp a swing is "piano" / "forte". */
  piano: 0.34,
  forte: 0.62,
}

export interface Beat {
  /** 0 (tiny swing) .. 1 (huge swing). */
  amp: number
  /** Predicted seconds until the next beat (her tempo). */
  length: number
}

export function createConductor() {
  let scale = 600
  let lastX = 0
  let lastY = 0
  let accX = 0
  let accY = 0
  let dirX = 0
  let dirY = 0
  let path = 0
  let lastBeat = -9
  let length = 0.5
  let down = false
  let downAt = 0
  /** A long sweep just beat on its own: its turnaround belongs to that beat, not a new (tiny) one. */
  let swept = false

  const fire = (t: number, amp01: number): Beat | null => {
    if (t - lastBeat < FEEL.minGap) return null
    const gap = t - lastBeat
    // After a pause (a freeze) keep the old tempo instead of jumping to a very slow one.
    if (gap < FEEL.longest * 1.4) length = length + (Math.min(FEEL.longest, Math.max(FEEL.shortest, gap)) - length) * FEEL.follow
    lastBeat = t
    path = 0
    return { amp: Math.max(0, Math.min(1, amp01)), length }
  }
  const ampOf = (px: number) => (px / scale - FEEL.tiny) / (FEEL.huge - FEEL.tiny)

  return {
    /** Short side of the screen in px (swing sizes are relative to it). */
    setScale(px: number) {
      scale = Math.max(200, px)
    },
    start(x: number, y: number, t: number) {
      lastX = x
      lastY = y
      accX = accY = 0
      dirX = dirY = 0
      path = 0
      swept = false
      down = true
      downAt = t
    },
    /** Feed every pointer move; returns a beat when one happens. */
    move(x: number, y: number, t: number): Beat | null {
      if (!down) return null
      const dx = x - lastX
      const dy = y - lastY
      lastX = x
      lastY = y
      path += Math.hypot(dx, dy)
      accX += dx
      accY += dy
      let turned = false
      if (Math.abs(accX) > FEEL.jitter) {
        const s = Math.sign(accX)
        if (dirX && s !== dirX) turned = true
        dirX = s
        accX = 0
      }
      if (Math.abs(accY) > FEEL.jitter) {
        const s = Math.sign(accY)
        if (dirY && s !== dirY) turned = true
        dirY = s
        accY = 0
      }
      if (turned && swept && path < FEEL.sweep * scale * 0.6) {
        swept = false
        path = 0
        return null
      }
      if (turned && path > FEEL.minSwing * scale) {
        swept = false
        return fire(t, ampOf(path))
      }
      if (path > FEEL.sweep * scale) {
        swept = true
        return fire(t, ampOf(path))
      }
      return null
    },
    /** Finger up: a quick tap with no swing is one soft beat. */
    end(t: number): Beat | null {
      down = false
      if (t - downAt < 0.3 && path < FEEL.minSwing * scale) return fire(t, 0.2)
      return null
    },
    /** Seconds since the last beat. */
    since(t: number) {
      return t - lastBeat
    },
    get length() {
      return length
    },
  }
}

export type Conductor = ReturnType<typeof createConductor>
