// Write Like a Pharaoh: her name in hieroglyphs inside a cartouche (the oval kings and queens wrote their names in).
// For each letter Sparkle says its sound; she presses and HOLDS the matching picture stamp until it thunks onto the
// papyrus. The first three spots show a faint outline of the sign; the last three don't. The ibis (the scribes' bird)
// nods along. Then the finished cartouche gets a gold frame and Miu reads it: "Kaylee!"
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Buddy, burst, say, sample, shuffle, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { useLandscape } from '../../../kit/useLandscape'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Miu } from '../puppets/Miu'
import { ALL_GLYPHS, Glyph, NAME_GLYPHS, type GlyphId } from './glyphs'

const PROMPTS = [L.scribe.k, L.scribe.a, L.scribe.y, L.scribe.l, L.scribe.e, L.scribe.e2]
const HINTED = 3 // the first three spots show a faint outline
const HOLD_MS = 550

function choicesFor(i: number): GlyphId[] {
  const want = NAME_GLYPHS[i].glyph
  return shuffle([want, ...sample(ALL_GLYPHS.filter((g) => g !== want), 2)])
}

export function Scribe({ onDone, setProgress }: ActivityProps) {
  const [story, setStory] = useState(true)
  const [done, setDone] = useState(0)
  const [choices, setChoices] = useState<GlyphId[]>(() => choicesFor(0))
  const [holding, setHolding] = useState<GlyphId | null>(null)
  const [wiggle, setWiggle] = useState<GlyphId | null>(null)
  const [help, setHelp] = useState(false)
  const [framed, setFramed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const early = useRef(0)
  const busy = useRef(false)
  const ibis = useRef<PuppetHandle>(null)
  const miu = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const landscape = useLandscape()
  const want = NAME_GLYPHS[Math.min(done, NAME_GLYPHS.length - 1)].glyph

  // Three stars (one per two letters): six would crowd the prompt on a phone.
  useEffect(() => setProgress(Math.floor(done / 2), NAME_GLYPHS.length / 2), [done, setProgress])
  useEffect(() => () => clearTimeout(timer.current), [])

  const press = (g: GlyphId) => {
    if (busy.current || done >= NAME_GLYPHS.length) return
    if (g !== want) {
      sounds.oops()
      setWiggle(g)
      setHelp(true)
      setTimeout(() => setWiggle(null), 500)
      void ibis.current?.play('wiggle')
      void say(L.scribe.hint)
      return
    }
    setHolding(g)
    timer.current = setTimeout(() => void stamp(), HOLD_MS)
  }

  const release = () => {
    if (!holding) return
    clearTimeout(timer.current)
    setHolding(null)
    // Let go too soon: tell her how (again every other time, so tapping never feels broken).
    if (!busy.current && early.current++ % 2 === 0) void say(L.scribe.hold)
  }

  const stamp = async () => {
    busy.current = true
    setHolding(null)
    const n = done + 1
    setDone(n)
    setHelp(false)
    sfx.thump()
    sounds.note(n + 2)
    void ibis.current?.play('nod')
    await wait(500)
    if (!alive()) return
    if (n < NAME_GLYPHS.length) {
      setChoices(choicesFor(n))
      busy.current = false
      return
    }
    setFramed(true)
    sounds.correct()
    sounds.sparkle()
    burst(0.5, 0.4)
    void miu.current?.play('cheer')
    await say(L.scribe.done)
    if (!alive()) return
    void ibis.current?.play('dance')
    await say(L.scribe.cartouche)
    await wait(400)
    if (alive()) onDone()
  }

  if (story) return <StoryBeat lines={[L.scribe.story]} friend={<Miu height="100%" />} bg={art.bgScribe} onDone={() => setStory(false)} />

  const slot = landscape ? 'min(12cqw, 30cqh)' : 'min(10cqh, 26cqw)'
  const stampSize = landscape ? 'min(19cqh, 13cqw)' : 'min(12cqh, 22cqw)'

  return (
    <Stage bg={art.bgScribe} prompt={done < NAME_GLYPHS.length ? PROMPTS[done] : undefined}>
      <div style={{ position: 'absolute', inset: 0, containerType: 'size', display: 'flex', flexDirection: landscape ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-evenly', gap: '2cqmin', padding: '1cqmin 0' }}>
        {/* The papyrus with the cartouche on it. */}
        <div style={{ position: 'relative', background: '#F7E3B5', border: '5px solid #C99B6A', borderRadius: 18, padding: '3cqmin 4cqmin', boxShadow: 'var(--shadow), inset 0 0 0 6px #EFD49B' }}>
          <motion.div
            animate={framed ? { scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 0.8 }}
            style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center', gap: '1cqmin', padding: landscape ? '1.5cqmin 5cqmin 1.5cqmin 4cqmin' : '4cqmin 1.5cqmin 5cqmin', borderRadius: 999, border: `7px solid ${framed ? 'var(--gold)' : '#3A2230'}`, boxShadow: framed ? '0 0 30px #FFE27A' : 'none', position: 'relative', transition: 'border-color 0.4s' }}
          >
            {NAME_GLYPHS.map((n, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div
                  animate={i === done ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  transition={{ repeat: i === done ? Infinity : 0, duration: 1.2 }}
                  style={{ width: slot, height: slot, borderRadius: 16, display: 'grid', placeItems: 'center', background: i === done ? 'rgba(255, 200, 61, 0.35)' : 'transparent', outline: i === done ? '4px dashed var(--gold)' : 'none' }}
                >
                  {i < done ? (
                    <motion.div initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                      <Glyph id={n.glyph} size={`calc(${slot} * 0.86)`} />
                    </motion.div>
                  ) : i === done && i < HINTED ? (
                    <Glyph id={n.glyph} size={`calc(${slot} * 0.86)`} faint />
                  ) : null}
                </motion.div>
                <span style={{ fontSize: `calc(${slot} * 0.26)`, fontWeight: 700, color: i < done ? 'var(--hotpink)' : '#B79A78', lineHeight: 1 }}>{n.letter}</span>
              </div>
            ))}
            {/* The bar at the end of a cartouche. */}
            <div style={{ position: 'absolute', ...(landscape ? { right: -22, top: '15%', bottom: '15%', width: 7 } : { bottom: -22, left: '15%', right: '15%', height: 7 }), background: framed ? 'var(--gold)' : '#3A2230', borderRadius: 4 }} />
          </motion.div>
        </div>
        {/* The stamps, and the ibis who helps. */}
        <div style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center', gap: '3cqmin' }}>
          <div style={{ height: `calc(${stampSize} * 1.3)`, pointerEvents: 'none' }}>
            <Buddy ref={ibis} img={art.ibis} voice="ibis" height="100%" />
          </div>
          {done < NAME_GLYPHS.length &&
            choices.map((g) => (
              <motion.div key={`${done}-${g}`} initial={{ scale: 0 }} animate={wiggle === g ? WIGGLE : { scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <Stamp glyph={g} size={stampSize} holding={holding === g} glow={help && g === want} onPress={() => press(g)} onRelease={release} />
              </motion.div>
            ))}
          <div style={{ height: `calc(${stampSize} * 1.2)`, pointerEvents: 'none' }}>
            <Miu ref={miu} height="100%" />
          </div>
        </div>
      </div>
    </Stage>
  )
}

/** A wooden stamp with a sign on its face. Press and hold: a ring fills up, then it goes down with a thunk. */
function Stamp({ glyph, size, holding, glow, onPress, onRelease }: { glyph: GlyphId; size: string; holding: boolean; glow: boolean; onPress: () => void; onRelease: () => void }) {
  return (
    <button
      aria-label={`${glyph} stamp`}
      onPointerDown={onPress}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      onPointerCancel={onRelease}
      onContextMenu={(e) => e.preventDefault()}
      className={glow ? 'world-glow' : undefined}
      style={{ position: 'relative', width: size, height: size, minWidth: 'var(--target)', minHeight: 'var(--target)', borderRadius: '50%', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Handle */}
      <motion.div animate={{ y: holding ? '14%' : 0 }} transition={{ duration: HOLD_MS / 1000 }} style={{ position: 'absolute', inset: 0 }}>
        <div style={{ position: 'absolute', left: '36%', right: '36%', top: '-26%', height: '40%', borderRadius: '40% 40% 10% 10%', background: '#C98A5A', border: '4px solid #3A2A33' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#F4D6A8', border: '5px solid #3A2A33', display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)' }}>
          <Glyph id={glyph} size="72%" />
        </div>
      </motion.div>
      {/* The fill ring */}
      <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: '-10%', width: '120%', height: '120%', pointerEvents: 'none', rotate: '-90deg' }}>
        <motion.circle cx="50" cy="50" r="46" fill="none" stroke="var(--hotpink)" strokeWidth="7" strokeLinecap="round" initial={false} animate={{ pathLength: holding ? 1 : 0, opacity: holding ? 1 : 0 }} transition={{ duration: holding ? HOLD_MS / 1000 : 0.15, ease: 'linear' }} />
      </svg>
    </button>
  )
}
