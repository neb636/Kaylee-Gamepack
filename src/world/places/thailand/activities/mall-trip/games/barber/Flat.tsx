// The Barber Salon without WebGL (an old browser, a test browser without a GPU, or ?gl=off): Daddy (or the kid) as a
// big picture with a crown of hair bars on top, and the trolley as big buttons. Each tool does its thing to the bars
// (grow, snip, spikes, a poof, rainbow stripes, a bow), with a sound. The 🪞 spins the chair for the reveal (and a
// flash); then the next round, or the next kid.
import { motion } from 'motion/react'
import { useState } from 'react'
import { BOW_COLORS, decodeHair, encodeHair, HAIR_COLORS, LEN_STEPS, RAINBOW, type ColorId } from './hair'
import { CardPicture } from './Card'
import { CUSTOMERS, ENOUGH, TOOL_ICONS, TRAYS, type Round, type ToolId } from './layout'
import { barberSfx as sfx } from './sounds'

interface Props {
  round: Round
  hair: string
  onRound: (n: Round) => void
  onHair: (code: string) => void
  onRevealed: (n: Round) => void
  onAllDone: () => void
}

const big = { width: 'clamp(88px, 13vmin, 120px)', height: 'clamp(88px, 13vmin, 120px)', borderRadius: 24, border: '5px solid #fff', background: 'rgba(255,255,255,.8)', boxShadow: 'var(--shadow)', fontSize: 'clamp(44px, 7vmin, 62px)', padding: 0 } as const
const KID_FACES = ['🐶', '🐴', '🐼']
const BARS = 9

interface Look {
  len: number
  color: ColorId
  spiky: boolean
  poof: boolean
  bows: number
}

const fromCode = (code: string): Look => {
  const h = decodeHair(code)
  const t = h.tufts[0]
  return { len: t.len, color: t.color, spiky: t.style === 's', poof: t.style === 'c', bows: h.bows.length }
}

export function BarberFlat({ round: start, hair, onRound, onHair, onRevealed, onAllDone }: Props) {
  const [round, setRound] = useState<Round>(start)
  const [kid, setKid] = useState(0)
  const [look, setLook] = useState<Look>(() => (start === 3 ? fromCode('') : fromCode(hair)))
  const [stripes, setStripes] = useState<ColorId[]>([])
  const [work, setWork] = useState(0)
  const [spin, setSpin] = useState(0)
  const [done, setDone] = useState(false)

  const save = (l: Look) => {
    if (round === 3) return
    const h = decodeHair('')
    h.tufts.forEach((t, i) => {
      t.len = l.len
      t.color = stripes.length ? stripes[i % stripes.length] : l.color
      t.style = l.spiky ? 's' : l.poof ? 'c' : 'n'
    })
    for (let i = 0; i < l.bows; i++) h.bows.push({ tuft: i * 4, bow: 'p' })
    onHair(encodeHair(h))
  }

  const use = (tool: ToolId) => {
    if (done) return
    const l = { ...look }
    const fx: Record<ToolId, () => void> = {
      tonic: () => ((l.len = Math.min(LEN_STEPS, l.len + 5)), sfx.grow()),
      scissors: () => ((l.len = Math.max(1, l.len - 4)), sfx.snip()),
      comb: () => ((l.spiky = !l.spiky), (l.poof = false), sfx.zip(l.spiky)),
      dryer: () => ((l.poof = true), (l.spiky = false), sfx.dryer(1)),
      spray: () => {
        setStripes(RAINBOW)
        sfx.pssht()
      },
      bow: () => ((l.bows = Math.min(4, l.bows + 1)), sfx.clip()),
      clip: () => ((l.bows = Math.min(4, l.bows + 1)), sfx.clip()),
    }
    fx[tool]()
    setLook(l)
    setWork((w) => w + 2)
    save(l)
  }

  const mirror = () => {
    if (work < ENOUGH || done) {
      sfx.chime()
      return
    }
    setSpin((s) => s + 1)
    sfx.spin()
    setTimeout(() => {
      sfx.shutter()
      sfx.cheer()
      onRevealed(round)
      setWork(0)
      if (round < 3) {
        const n = (round + 1) as Round
        setRound(n)
        onRound(n)
        if (n === 3) {
          setLook(fromCode(''))
          setStripes([])
        }
      } else if (kid + 1 < CUSTOMERS.length) {
        setKid(kid + 1)
        setLook(fromCode(''))
        setStripes([])
      } else {
        setDone(true)
        onAllDone()
      }
    }, 1100)
  }

  const colorAt = (i: number) => {
    const c = stripes.length ? stripes[i % stripes.length] : look.color
    return c === 'n' ? (round === 3 ? '#B9A6F5' : '#8EC9F5') : HAIR_COLORS[c]
  }
  const h = 14 + look.len * 4

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#DCEBFF, #F6F0FF)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--top-clear)', paddingBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <motion.div key={spin} animate={{ rotateY: spin ? [0, 180, 360] : 0 }} transition={{ duration: 1 }} style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
          <div aria-hidden style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: h, transform: look.poof ? 'scale(1.35)' : undefined }}>
            {Array.from({ length: BARS }, (_, i) => (
              <div key={i} style={{ width: 14, height: h * (look.spiky ? (i % 2 ? 0.6 : 1) : 0.85 + Math.sin(i) * 0.15), background: colorAt(i), border: '3px solid var(--ink)', borderRadius: look.spiky ? '50% 50% 0 0 / 100% 100% 0 0' : 999, transform: look.poof ? `rotate(${(i - 4) * 9}deg)` : undefined }} />
            ))}
          </div>
          <div style={{ fontSize: 'clamp(110px, 24vmin, 190px)', lineHeight: 1, marginTop: -10 }}>{round === 3 ? KID_FACES[kid] : '🦄'}</div>
          {look.bows > 0 && <div style={{ position: 'absolute', top: 0, fontSize: 40 }}>{'🎀'.repeat(look.bows)}</div>}
        </motion.div>
        {round === 3 && !done && (
          <div style={{ padding: 6, borderRadius: 18, background: '#fff', border: '4px solid var(--lavender-dark)' }}>
            <CardPicture card={CUSTOMERS[kid].card} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(8px, 1.6vmin, 16px)', padding: '0 16px', maxWidth: 900 }}>
        <motion.button aria-label="The mirror" whileTap={{ scale: 0.85 }} onClick={mirror} style={{ ...big, outline: work >= ENOUGH ? '6px solid rgba(255,200,61,.85)' : 'none' }}>
          🪞
        </motion.button>
        {TRAYS[round].map((t) => (
          <motion.button key={t.key} aria-label={t.key} whileTap={{ scale: 0.85, rotate: -8 }} onClick={() => use(t.tool)} style={{ ...big, borderColor: t.color ? BOW_COLORS[t.color] : '#fff' }}>
            {TOOL_ICONS[t.tool]}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
