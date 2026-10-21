// Aunt Joy's beauty salon, by the grey couch downstairs: Kaylee makes Aunt Joy pretty. Six drawers along the bottom
// (lipstick, blush, eyeshadow, earrings, a flower for her hair, a necklace); tap one and its colors or pieces come out,
// tap one of those and Joy wears it at once with a sparkle and a giggle (tap it again to take it off). The ✨ button
// dresses her up at random, and 📸 takes her picture (she poses; Kaylee's look for her is remembered on the iPad).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { burst, pick, sounds, useSaved, type PuppetHandle } from '../../../../../../sdk'
import { TEXT, VOICED } from './lines'
import { JoyPuppet, NO_LOOK, Plumeria, star, type Look } from './puppets'
import { Room, RoundButton, useBubble } from './Room'

type Slot = keyof Look
interface Option {
  id: string
  /** What Joy wears (a color for makeup, a kind for the rest). */
  value: string
  icon: ReactNode
}

const dot = (c: string) => <span style={{ display: 'block', width: '70%', height: '70%', borderRadius: '50%', background: c, border: '4px solid var(--ink)' }} />
const svg = (children: ReactNode) => <svg viewBox="0 0 100 100" style={{ width: '80%', height: '80%', overflow: 'visible' }}>{children}</svg>
const S = { stroke: '#2B2330', strokeWidth: 5, strokeLinejoin: 'round' as const }

const colors = (list: [string, string][]): Option[] => list.map(([id, c]) => ({ id, value: c, icon: dot(c) }))

export const SLOTS: { id: Slot; icon: string; say: string; options: Option[] }[] = [
  { id: 'lips', icon: '💄', say: TEXT.salon.lips, options: colors([['pink', '#FF5FA2'], ['red', '#E8344F'], ['coral', '#FF8A65'], ['purple', '#A35BD9']]) },
  { id: 'cheeks', icon: '🌸', say: TEXT.salon.cheeks, options: colors([['rose', '#FF7FA8'], ['peach', '#FFA07A'], ['lilac', '#C49BFF']]) },
  { id: 'eyes', icon: '👀', say: TEXT.salon.eyes, options: colors([['sky', '#7EC8F5'], ['lavender', '#B79CF2'], ['mint', '#7FE0C0'], ['gold', '#F5C542']]) },
  {
    id: 'earrings', icon: '💎', say: TEXT.salon.earrings, options: [
      { id: 'pearl', value: 'pearl', icon: svg(<><circle cx={50} cy={52} r={26} fill="#FFFDF8" {...S} /><circle cx={42} cy={44} r={7} fill="#fff" /></>) },
      { id: 'hoop', value: 'hoop', icon: svg(<circle cx={50} cy={50} r={32} fill="none" stroke="#F5B82E" strokeWidth={12} />) },
      { id: 'heart', value: 'heart', icon: svg(<path d="M50 86 C10 60 12 24 32 22 C42 21 48 28 50 36 C52 28 58 21 68 22 C88 24 90 60 50 86Z" fill="#FF5FA2" {...S} />) },
      { id: 'star', value: 'star', icon: svg(<path d={star(50, 52, 40, 17)} fill="#FFD84A" {...S} />) },
      { id: 'flower', value: 'flower', icon: svg(<Plumeria x={50} y={50} r={40} />) },
    ],
  },
  {
    id: 'hair', icon: '🌺', say: TEXT.salon.hair, options: [
      { id: 'plumeria', value: 'plumeria', icon: svg(<Plumeria x={50} y={50} r={40} />) },
      { id: 'orchid', value: 'orchid', icon: svg(<><ellipse cx={50} cy={30} rx={16} ry={24} fill="#C77DFF" {...S} /><ellipse cx={28} cy={58} rx={16} ry={22} fill="#C77DFF" {...S} transform="rotate(-60 28 58)" /><ellipse cx={72} cy={58} rx={16} ry={22} fill="#C77DFF" {...S} transform="rotate(60 72 58)" /><ellipse cx={50} cy={60} rx={14} ry={12} fill="#8E44C9" {...S} /></>) },
      { id: 'bow', value: 'bow', icon: svg(<><path d="M50 50 L12 26 Q4 50 12 74Z M50 50 L88 26 Q96 50 88 74Z" fill="#FF7FB5" {...S} /><circle cx={50} cy={50} r={12} fill="#FF5FA2" {...S} /></>) },
      { id: 'tiara', value: 'tiara', icon: svg(<path d="M10 76 L18 30 L36 56 L50 18 L64 56 L82 30 L90 76 Q50 66 10 76Z" fill="#FFD84A" {...S} />) },
    ],
  },
  {
    id: 'necklace', icon: '📿', say: TEXT.salon.necklace, options: [
      { id: 'pearls', value: 'pearls', icon: svg(<>{[...Array(7)].map((_, i) => { const a = Math.PI * (0.1 + (0.8 * i) / 6); return <circle key={i} cx={50 - Math.cos(a) * 36} cy={20 + Math.sin(a) * 50} r={9} fill="#FFFDF8" {...S} strokeWidth={3.5} /> })}</>) },
      { id: 'gold', value: 'gold', icon: svg(<><path d="M14 18 Q50 80 86 18" fill="none" stroke="#F5B82E" strokeWidth={7} /><path d="M50 88 C34 76 38 60 50 70 C62 60 66 76 50 88Z" fill="#F5B82E" {...S} strokeWidth={4} /></>) },
      { id: 'garland', value: 'garland', icon: svg(<>{[...Array(8)].map((_, i) => { const a = Math.PI * (0.05 + (0.9 * i) / 7); return <circle key={i} cx={50 - Math.cos(a) * 36} cy={18 + Math.sin(a) * 50} r={10} fill={i % 2 ? '#FFFDF8' : '#FFE07A'} {...S} strokeWidth={3.5} /> })}<circle cx={50} cy={80} r={11} fill="#FF5F7E" {...S} strokeWidth={3.5} /></>) },
    ],
  },
]

/** `lips-pink,earrings-pearl` ↔ a Look (the section param `look`). */
export function parseLook(s: string): Look {
  const look = { ...NO_LOOK }
  for (const part of s.split(',')) {
    const [slot, id] = part.split('-') as [Slot, string]
    const o = SLOTS.find((x) => x.id === slot)?.options.find((x) => x.id === id)
    if (o) look[slot] = o.value
  }
  return look
}
export function lookParam(look: Look) {
  return SLOTS.flatMap((s) => {
    const o = s.options.find((x) => x.value === look[s.id])
    return o ? [`${s.id}-${o.id}`] : []
  }).join(',')
}

export function Salon({ onClose, start, onLook }: { onClose(): void; start?: string; onLook(param: string): void }) {
  const joy = useRef<PuppetHandle>(null)
  const { text, talk } = useBubble()
  const [saved, setSaved] = useSaved<string>('thailand-joy-look', '')
  const [look, setLook] = useState<Look>(() => parseLook(start ?? saved))
  const [open, setOpen] = useState<Slot>('lips')
  const [flash, setFlash] = useState(0)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    talk(VOICED.joyHi)
    void joy.current?.play('wiggle')
    const t = setTimeout(() => talk({ show: TEXT.salon.start }), 1500)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => {
    const p = lookParam(look)
    onLook(p)
    setSaved(p)
  }, [look])

  const wear = (slot: Slot, value: string) => {
    setTouched(true)
    const off = look[slot] === value
    setLook((l) => ({ ...l, [slot]: off ? '' : value }))
    if (off) {
      sounds.whoosh()
      void joy.current?.play('nod')
      return
    }
    sounds.sparkle()
    void joy.current?.play(Math.random() < 0.5 ? 'giggle' : 'wiggle')
    if (slot === 'necklace' && value === 'garland') talk({ show: TEXT.salon.garland })
    else if (Math.random() < 0.4) talk({ show: TEXT.salon.love })
  }
  const surprise = () => {
    setTouched(true)
    const l = { ...NO_LOOK }
    for (const s of SLOTS) if (Math.random() < 0.8) l[s.id] = pick(s.options).value
    setLook(l)
    sounds.sparkle()
    burst()
    void joy.current?.play('cheer')
  }
  const photo = () => {
    setFlash((n) => n + 1)
    sounds.pop()
    talk({ show: TEXT.salon.photo })
    void joy.current?.play('cheer')
    setTimeout(() => {
      sounds.fanfare()
      burst()
    }, 500)
  }
  const slot = SLOTS.find((s) => s.id === open)!

  return (
    <Room name="Aunt Joy" wall="#F3E8FF" floor="#E4D2F0" bubble={text} onClose={onClose} host={
      <button aria-label="Aunt Joy" onClick={() => { sounds.pop(); void joy.current?.play('giggle') }} style={{ width: '100%', height: '100%', background: 'none', border: 'none', padding: 0, position: 'relative' }}>
        <span style={{ position: 'relative', display: 'block', width: '100%', height: '100%' }}>
          <JoyPuppet ref={joy} height="100%" look={look} mirror />
        </span>
      </button>
    }>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 'min(14px, 1.6vh)' }}>
        {/* What's in the open drawer */}
        <AnimatePresence mode="wait">
          <motion.div key={open} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.18 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 'min(16px, 2vw)', justifyContent: 'center', alignContent: 'center', flex: 1, minHeight: 0 }}>
            {slot.options.map((o) => (
              <RoundButton key={o.id} label={`${slot.id} ${o.id}`} icon={o.icon} color="#fff" size="min(128px, 15vh, 22vw)" active={look[slot.id] === o.value} onClick={() => wear(slot.id, o.value)} />
            ))}
          </motion.div>
        </AnimatePresence>
        {/* The drawers */}
        <div style={{ display: 'flex', gap: 'min(10px, 1.4vw)', justifyContent: 'center', flexWrap: 'wrap', background: '#F5C9DD', border: '5px solid var(--ink)', borderRadius: 28, padding: 'min(12px, 1.4vh)' }}>
          {SLOTS.map((s) => (
            <RoundButton key={s.id} label={s.id} icon={s.icon} color={open === s.id ? 'var(--hotpink)' : 'var(--cream)'} size="min(var(--target), 11vw)" active={open === s.id} pulse={!touched && s.id === 'lips'} onClick={() => {
              sounds.pop()
              setOpen(s.id)
              talk({ show: s.say })
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <RoundButton label="Surprise me" icon="✨" color="var(--lavender)" onClick={surprise} />
          <RoundButton label="Take a picture" icon="📸" color="var(--mint)" onClick={photo} pulse={touched} />
        </div>
      </div>
      <AnimatePresence>
        {flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} style={{ position: 'fixed', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 60 }} />}
      </AnimatePresence>
    </Room>
  )
}
