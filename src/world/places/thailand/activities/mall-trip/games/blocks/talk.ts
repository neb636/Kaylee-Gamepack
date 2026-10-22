// Who says what in a mini game, kept short ("Talk short, play long", AGENTS.md): a reaction in a character's own voice
// only now and then, a count that never talks over anyone, a fact or a first-time line once, and Sparkle's hint once
// each time the 👆 shows. Little Land, the Golden Mountain, Muay Thai and the Sky Pod use it (lines: lines.ts `L.mall`).
import { speakingVoice, type Line } from '../../../../../../../sdk'

/** The 👆 shows after this long with nothing touched (trip/legs/stage.ts). */
export const HINT_S = 7
/** At most one reaction this often (seconds), so talk per touch stays low. */
const REACT_GAP = 12

export class Talk {
  private lastReact = -REACT_GAP
  private hintFor = -1
  private said = new Set<string>()
  private turn = 0

  constructor(private out: (l: Line) => void) {}

  /** Say it now (an opening, something new). */
  say(l: Line) {
    this.out(l)
  }
  /** A reaction, if nobody has reacted for a while (`time`: the world's clock). `l` may be a few to take in turn. */
  react(time: number, l: Line | readonly Line[]) {
    if (time - this.lastReact < REACT_GAP) return false
    this.lastReact = time
    this.out(Array.isArray(l) ? l[this.turn++ % l.length] : (l as Line))
    return true
  }
  /** Once per visit (a fact the first time she pokes the thing it's about, a first-time line). */
  once(key: string, l: Line) {
    if (this.said.has(key)) return false
    this.said.add(key)
    this.out(l)
    return true
  }
  /** A number as it pops: skipped while anyone is talking, so counting never drowns a line or a reaction. */
  count(l: Line | undefined) {
    if (l && !speakingVoice()) this.out(l)
  }
  /** Every frame: when the 👆 shows (nothing touched for HINT_S, and something to point at), Sparkle says what to
   *  touch, once each time it shows. */
  hint(time: number, lastTouch: number, showing: () => boolean, line: () => Line | null) {
    if (time - lastTouch <= HINT_S || this.hintFor === lastTouch || !showing()) return
    const l = line()
    if (!l) return
    this.hintFor = lastTouch
    this.out(l)
  }
}
