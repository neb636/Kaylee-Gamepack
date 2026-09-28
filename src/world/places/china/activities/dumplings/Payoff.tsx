// The payoff: the whole restaurant claps, Chef Fu gives Sparkle a little chef hat, Lulu calls from her sick bed, and the
// dim sum cart rolls by (tap a dish to hear its name). Then the stamp.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, BigButton, Buddy, say, SparklePuppet, sounds, useAlive, useLandscape, wait, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { ChefHat, DimSumCart, Phone } from '../../props'
import { ChefFu } from '../../puppets/ChefFu'
import { DouDou } from '../../puppets/DouDou'
import { DiningRoom, type Seat } from './Dining'
import { useWord } from './shared'

const D = L.dumplings
const DISHES = [
  { id: 'harGow', img: art.harGow, line: D.dimsum.harGow },
  { id: 'charSiuBao', img: art.charSiuBao, line: D.dimsum.charSiuBao },
  { id: 'eggTart', img: art.eggTart, line: D.dimsum.eggTart },
  { id: 'sesameBall', img: art.sesameBall, line: D.dimsum.sesameBall },
  { id: 'springRoll', img: art.springRoll, line: D.dimsum.springRoll },
] as const

export function Payoff({ onDone }: { onDone: () => void }) {
  const landscape = useLandscape()
  const [beat, setBeat] = useState<'clap' | 'hat' | 'lulu' | 'bye' | 'done'>('clap')
  const refs = { left: useRef<PuppetHandle>(null), center: useRef<PuppetHandle>(null), right: useRef<PuppetHandle>(null) }
  const chef = useRef<PuppetHandle>(null)
  const dou = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const alive = useAlive()

  useEffect(() => {
    void (async () => {
      bigCelebration()
      sounds.fanfare()
      for (const s of ['left', 'center', 'right'] as Seat[]) void refs[s].current?.play('cheer')
      await say(D.clap)
      if (!alive()) return
      setBeat('hat')
      void chef.current?.play('toss')
      await wait(900)
      sounds.sparkle()
      void sparkle.current?.play('cheer')
      showWord('xiexie')
      await say(D.hat)
      if (!alive()) return
      setBeat('lulu')
      sounds.pop()
      await say(D.lulu)
      if (!alive()) return
      setBeat('bye')
      void dou.current?.play('hop')
      await say(D.doudouBye)
      if (alive()) setBeat('done')
    })()
  }, [])

  const basket = (id: string, colors: ('pink' | 'green' | 'yellow' | 'cream')[]) => ({ id, colors })
  const cast = 'min(30vh, 22vw)'
  return (
    <DiningRoom guests={{ left: 'bunnies', center: 'baobao', right: 'goose' }} refs={refs} served={{ left: basket('b', ['pink', 'green']), center: basket('c', ['cream', 'pink', 'yellow']), right: basket('g', ['yellow', 'yellow']) }} word={word}>
      {/* Chef Fu, Sparkle (with her new hat) and Dou Dou stand in front of the tables. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: landscape ? '2%' : '1%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 'min(3vw, 24px)', zIndex: 12 }}>
        <div style={{ height: `calc(${cast} * 1.25)` }}>
          <ChefFu ref={chef} height="100%" />
        </div>
        <div style={{ position: 'relative' }}>
          <SparklePuppet ref={sparkle} height={cast} />
          <AnimatePresence>
            {beat !== 'clap' && (
              <motion.div key="hat" initial={{ x: '-160%', y: '-120%', rotate: -40, scale: 0.6 }} animate={{ x: '0%', y: '0%', rotate: -12, scale: 1 }} transition={{ type: 'spring', bounce: 0.45, duration: 0.9 }} style={{ position: 'absolute', left: '34%', top: '-14%', width: '34%', pointerEvents: 'none' }}>
                <ChefHat />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ height: `calc(${cast} * 0.85)` }}>
          <DouDou ref={dou} height="100%" />
        </div>
      </div>
      {/* Lulu calls from bed. */}
      <AnimatePresence>
        {(beat === 'lulu' || beat === 'bye' || beat === 'done') && (
          <motion.div key="lulu" initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 6 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', right: '3%', top: 'calc(var(--top-clear) + 10px)', width: 'min(24vw, 20vh, 200px)', aspectRatio: '0.62', zIndex: 14 }}>
            <Phone style={{ height: '100%' }}>
              <Buddy img={art.lulu} voice="lulu" height="80%" />
            </Phone>
          </motion.div>
        )}
      </AnimatePresence>
      {/* The dim sum cart rolls in: tap a dish to hear it. */}
      <motion.div initial={{ x: '-110%' }} animate={{ x: 0 }} transition={{ delay: 1.2, type: 'spring', bounce: 0.25, duration: 1.4 }} style={{ position: 'absolute', left: '1%', top: 'calc(var(--top-clear) + 10px)', width: landscape ? 'min(26vw, 34vh, 300px)' : 'min(40vw, 22vh, 300px)', zIndex: 13 }}>
        <DimSumCart
          top={DISHES.slice(0, 3).map((d) => (
            <Dish key={d.id} img={d.img} line={d.line} label={d.id} />
          ))}
          bottom={DISHES.slice(3).map((d) => (
            <Dish key={d.id} img={d.img} line={d.line} label={d.id} />
          ))}
        />
      </motion.div>
      {beat === 'done' && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: [1, 1.08, 1] }} transition={{ scale: { repeat: Infinity, duration: 1.2 } }} style={{ position: 'absolute', right: '3%', bottom: landscape ? '4%' : '3%', zIndex: 18 }}>
          <BigButton onClick={onDone} ariaLabel="Get my stamp">
            🥟 ▶
          </BigButton>
        </motion.div>
      )}
    </DiningRoom>
  )
}

function Dish({ img, line, label }: { img: string; line: string; label: string }) {
  const [bounce, setBounce] = useState(0)
  return (
    <motion.button
      aria-label={label}
      key={bounce}
      animate={bounce ? { y: [0, -16, 0], rotate: [0, -8, 8, 0] } : {}}
      onClick={() => {
        sounds.pop()
        setBounce((b) => b + 1)
        void say(line)
      }}
      style={{ width: '30%', minWidth: 44, background: 'none', border: 'none', padding: 0 }}
    >
      <img src={img} alt="" style={{ width: '100%', display: 'block' }} />
    </motion.button>
  )
}
