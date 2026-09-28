// Steaming, shared by all three services: baskets on the wok, turn the knob, pop the steam puffs while the dumplings
// cook (and wobble), then lift the lid: whoosh, shiny cooked dumplings.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, Piece, say, sounds, Target, useAlive, wait } from '../../../../../sdk'
import { L } from '../../lines'
import { Lid, SteamPuff, Steamer, Stove } from '../../props'
import { Dumpling, type DoughColor } from '../../puppets/Dumpling'

const D = L.dumplings

export interface Basket {
  id: string
  colors: DoughColor[]
  ribbon?: string
}

export type CookStage = 'idle' | 'fire' | 'steam' | 'lift' | 'cooked'

/** Dumplings sitting in a basket (small, in a row or two). */
export function BasketDumplings({ colors, state, max = 6 }: { colors: (DoughColor | null)[]; state: 'pleated' | 'steaming' | 'cooked'; max?: number }) {
  const per = colors.length > 4 || max > 4 ? 3 : Math.max(colors.length, 2)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${per}, 1fr)`, gap: '2%', width: '100%', alignItems: 'end', justifyItems: 'center' }}>
      {colors.map((c, i) => (c ? <Dumpling key={i} state={state} color={c} size="100%" style={{ maxWidth: 130 }} steam={state === 'cooked'} /> : <div key={i} />))}
    </div>
  )
}

/** The stove with a stack of baskets, run through fire → steam → lift. */
export function CookStove({ baskets, stage, onStage, steamPops = 6 }: { baskets: Basket[]; stage: CookStage; onStage: (s: CookStage) => void; steamPops?: number }) {
  const alive = useAlive()
  const [puffs, setPuffs] = useState<{ id: number; x: number }[]>([])
  const popped = useRef(0)
  const nextId = useRef(0)
  const lidOn = stage !== 'cooked'

  // Steam: puffs rise from the top basket; each pop plays a note. Moves on after enough pops or ~10 s.
  useEffect(() => {
    if (stage !== 'steam') return
    popped.current = 0
    const spawn = setInterval(() => setPuffs((p) => [...p.slice(-5), { id: nextId.current++, x: Math.random() * 60 - 30 }]), 850)
    const giveUp = setTimeout(() => alive() && onStage('lift'), 11000)
    return () => {
      clearInterval(spawn)
      clearTimeout(giveUp)
    }
  }, [stage])

  const pop = (id: number) => {
    setPuffs((p) => p.filter((q) => q.id !== id))
    sounds.note(popped.current % 10)
    popped.current++
    if (popped.current === steamPops) onStage('lift')
  }

  const lift = async () => {
    if (stage !== 'lift') return
    sounds.whoosh()
    onStage('cooked')
    burst(0.8, 0.5)
    await wait(300)
    if (alive()) void say(D.tada)
  }

  return (
    <Stove
      on={stage === 'steam' || stage === 'lift'}
      hint={stage === 'fire'}
      onKnob={() => {
        if (stage !== 'fire') return
        sounds.pop()
        onStage('steam')
      }}
    >
      {baskets.map((b, i) => {
        const top = i === baskets.length - 1
        return (
          <motion.div
            key={b.id}
            layoutId={`basket-${b.id}`}
            animate={stage === 'steam' && top ? { rotate: [0, -2, 2, -1, 0] } : { rotate: 0 }}
            transition={stage === 'steam' ? { repeat: Infinity, duration: 0.5 } : undefined}
            style={{ width: '100%', marginBottom: i ? '-12%' : 0, position: 'relative', zIndex: i }}
            onClick={top ? lift : undefined}
            role={top && stage === 'lift' ? 'button' : undefined}
            aria-label={top && stage === 'lift' ? 'steamer lid' : undefined}
          >
            <Steamer lid={top ? lidOn : true} ribbon={b.ribbon} glow={top && stage === 'lift'} leaf={top}>
              {top && !lidOn && <BasketDumplings colors={b.colors} state="cooked" />}
            </Steamer>
          </motion.div>
        )
      })}
      {/* The lid flies off when she lifts it. */}
      <AnimatePresence>
        {stage === 'cooked' && (
          <motion.div key="lid" initial={{ y: 0, rotate: 0, opacity: 1 }} animate={{ y: -220, x: 90, rotate: 40, opacity: 0 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', top: 0, width: '100%', pointerEvents: 'none' }}>
            <Lid />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Steam puffs to pop. */}
      <div style={{ position: 'absolute', left: '50%', top: 0, width: 0, height: 0 }}>
        <AnimatePresence>
          {puffs.map((p) => (
            <motion.button
              key={p.id}
              aria-label="steam puff"
              initial={{ y: 0, x: p.x, scale: 0.3, opacity: 0 }}
              animate={{ y: -260, x: p.x + (p.x > 0 ? 40 : -40), scale: 1, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 3.4, ease: 'easeOut' }}
              onPointerDown={() => pop(p.id)}
              onAnimationComplete={() => setPuffs((q) => q.filter((x) => x.id !== p.id))}
              style={{ position: 'absolute', left: -48, top: -40, width: 96, height: 80, background: 'none', border: 'none', padding: 0 }}
            >
              <SteamPuff />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </Stove>
  )
}

/** A big open basket on the counter that she drags (or taps) finished dumplings into. */
export function FillBasket({ ready, placed, onPlace, ribbon, max, hint }: { ready: DoughColor[]; placed: DoughColor[]; onPlace: (color: DoughColor, index: number) => void; ribbon?: string; max: number; hint?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'min(2vh, 16px)', width: '100%' }}>
      <div style={{ display: 'flex', gap: 'min(2cqw, 20px)', justifyContent: 'center', minHeight: 'min(26cqh, 21cqw, 170px)', alignItems: 'flex-end' }}>
        {ready.map((c, i) => (
          <Piece key={`${i}-${c}`} id={`raw-${i}`} snapTo="basket" onPlace={({ target }) => (target === 'basket' ? (onPlace(c, i), 'snap') : 'home')} onTap={() => onPlace(c, i)} label="dumpling">
            <Dumpling state="pleated" color={c} size="min(26cqh, 21cqw, 170px)" />
          </Piece>
        ))}
      </div>
      <Target id="basket" hint={hint} style={{ width: 'min(76cqw, 70cqh, 460px)', borderRadius: '40%' }}>
        <Steamer ribbon={ribbon}>
          <BasketDumplings colors={[...placed, ...Array<null>(Math.max(0, max - placed.length)).fill(null)]} state="pleated" max={max} />
        </Steamer>
      </Target>
    </div>
  )
}
