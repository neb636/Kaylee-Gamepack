// Payoff: back in the grove, bruschetta (toast with the new olive oil) for everyone. Spina crunches, the old tree's
// leaves shimmer, then Spina brings her tambourine for Lupa's band. Tapping it plays a quick pizzica rhythm and everyone
// dances. A big button finishes (the stamp follows).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { bigCelebration, BigButton, burst, say, SparklePuppet, sounds, useAlive, useLandscape, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { Lupa } from '../../puppets/Lupa'
import { Spina } from '../../puppets/Spina'
import { useWord } from '../../WordCard'
import { Scene, Stand, Table } from './bits'

const O = L.olives
// A quick pizzica (tarantella from Puglia): fast triplets, the jingles on the strong beats.
const PIZZICA = [7, 5, 7, 8, 7, 5, 4, 5, 7, 5, 4, 2, 4, 5, 7, 9]

const LAYOUT = {
  land: { tree: { x: 70, base: 74, h: 48 }, table: { l: 25, r: 57, top: 75, ground: 91 }, slices: [31, 41, 51], slice: 8.5, sparkle: { x: 15, y: 94, h: 29 }, spina: { x: 65, y: 94, h: 27 }, lupa: { x: 82, y: 94, h: 26 }, finish: { x: 22, y: 34 } },
  tall: { tree: { x: 64, base: 73, h: 34 }, table: { l: 5, r: 57, top: 74.5, ground: 85 }, slices: [15, 31, 47], slice: 15, sparkle: { x: 17, y: 93.5, h: 15 }, spina: { x: 55, y: 93.5, h: 16 }, lupa: { x: 83, y: 93.5, h: 15 }, finish: { x: 50, y: 32 } },
}

export function Payoff({ onDone }: { onDone: () => void }) {
  const landscape = useLandscape()
  const lay = landscape ? LAYOUT.land : LAYOUT.tall
  const ratio = landscape ? 1.5 : 1 / 1.5
  const alive = useAlive()
  const spina = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const lupa = useRef<PuppetHandle>(null)
  const [word, showWord] = useWord()
  const [slices, setSlices] = useState(0)
  const [eaten, setEaten] = useState(false)
  const [shimmer, setShimmer] = useState(0)
  const [tambourine, setTambourine] = useState(false)
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [plays, setPlays] = useState(0)
  const [shaking, setShaking] = useState(0)
  const [finish, setFinish] = useState(false)
  const playing = useRef(false)
  const tickles = useRef(0)

  useEffect(() => {
    void (async () => {
      await wait(300)
      for (let i = 1; i <= 3; i++) {
        if (!alive()) return
        setSlices(i)
        sfx.pop()
        await wait(220)
      }
      showWord('bruschetta')
      void spina.current?.play('cheer')
      await say(O.bruschetta)
      if (!alive()) return
      setEaten(true)
      sfx.munch()
      void sparkle.current?.play('cheer')
      void lupa.current?.play('wag')
      void spina.current?.play('crunch')
      showWord('buonissima')
      await say(O.yum)
      if (!alive()) return
      // The old tree's leaves shimmer.
      setShimmer((s) => s + 1)
      sounds.sparkle()
      await wait(900)
      if (!alive()) return
      setTambourine(true)
      sfx.fwip()
      void spina.current?.play('wave')
      await say(O.tambourine)
      if (!alive()) return
      setPrompt(O.tapTambourine)
    })()
  }, [])

  const playPizzica = async () => {
    if (!tambourine || playing.current) return
    playing.current = true
    setPrompt(null)
    const first = plays === 0
    setPlays((p) => p + 1)
    setShaking((s) => s + 1)
    void spina.current?.play('dance')
    void lupa.current?.play('hop')
    void sparkle.current?.play('dance')
    if (first) void say(O.pizzica)
    for (let i = 0; i < PIZZICA.length; i++) {
      sounds.note(PIZZICA[i])
      if (i % 3 === 0) sfx.fwip()
      await wait(i % 3 === 2 ? 170 : 120)
      if (!alive()) return
    }
    playing.current = false
    if (first) {
      burst()
      void lupa.current?.play('howl')
      await say(O.band)
      if (!alive()) return
      bigCelebration()
      sounds.fanfare()
      setFinish(true)
    }
  }

  const tapSpina = () => {
    sounds.pop()
    void spina.current?.play('hop')
    void say(L.tickle.spina[tickles.current++ % L.tickle.spina.length])
  }

  const tw = (lay.tree.h * (1000 / 843)) / ratio
  const sliceH = lay.slice * (578 / 996) * ratio

  return (
    <Scene bg={art.bgOliveGrove} bgTall={art.bgOliveGroveTall} prompt={prompt} word={word}>
      {/* The old olive tree behind the picnic; its leaves shimmer after the first bite. */}
      <motion.div
        key={shimmer}
        animate={shimmer ? { rotate: [0, 1.2, -1, 0.6, 0], filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'] } : {}}
        transition={{ duration: 1.4 }}
        style={{ position: 'absolute', left: `${lay.tree.x - tw / 2}%`, top: `${lay.tree.base - lay.tree.h}%`, width: `${tw}%`, height: `${lay.tree.h}%`, transformOrigin: '50% 100%', zIndex: 1 }}
      >
        <img src={art.oliveTree} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
        {shimmer > 0 &&
          [
            [20, 30], [40, 12], [55, 20], [70, 15], [85, 38], [30, 48], [62, 40], [12, 45], [48, 30],
          ].map(([x, y], i) => (
            <motion.span key={`${shimmer}-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.2, delay: i * 0.08 }} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: landscape ? '4cqh' : '5cqw', translate: '-50% -50%' }}>
              ✨
            </motion.span>
          ))}
      </motion.div>

      {/* The picnic table with bruschetta. */}
      <div style={{ position: 'absolute', left: `${lay.table.l}%`, width: `${lay.table.r - lay.table.l}%`, top: `${lay.table.top}%`, height: `${lay.table.ground - lay.table.top}%`, zIndex: 3 }}>
        <Table style={{ inset: 0, width: '100%', height: '100%' }} />
      </div>
      <AnimatePresence>
        {lay.slices.slice(0, slices).map((x, i) =>
          eaten && i === 2 ? null : (
            <motion.img
              key={i}
              src={art.bruschetta}
              alt=""
              initial={{ y: -40, opacity: 0, scale: 0.6 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.35 } }}
              transition={{ type: 'spring', bounce: 0.5 }}
              style={{ position: 'absolute', left: `${x - lay.slice / 2}%`, top: `${lay.table.top - sliceH + 0.4}%`, width: `${lay.slice}%`, zIndex: 4, pointerEvents: 'none' }}
            />
          ),
        )}
      </AnimatePresence>

      <Stand x={lay.sparkle.x} y={lay.sparkle.y} h={`${lay.sparkle.h}cqh`} z={6}>
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
      </Stand>
      <Stand x={lay.spina.x} y={lay.spina.y} h={`${lay.spina.h}cqh`} z={6}>
        <Spina ref={spina} height="100%" onTap={tapSpina} />
      </Stand>
      <Stand x={lay.lupa.x} y={lay.lupa.y} h={`${lay.lupa.h}cqh`} z={6}>
        <Lupa ref={lupa} height="100%" flip onTap={() => {
          sounds.pop()
          void lupa.current?.play('howl')
          void say(L.tickle.lupa[tickles.current++ % L.tickle.lupa.length])
        }} />
      </Stand>

      {/* Spina's tambourine: tap it for the pizzica. */}
      <AnimatePresence>
        {tambourine && (
          <motion.button
            aria-label="Tambourine"
            className={plays === 0 ? 'world-glow' : undefined}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => void playPizzica()}
            style={{ position: 'absolute', left: `${(lay.spina.x + lay.lupa.x) / 2}%`, top: `${lay.spina.y - lay.spina.h * 0.62}%`, width: landscape ? '15cqh' : '17cqw', aspectRatio: '971 / 934', translate: '-50% -50%', zIndex: 9, background: 'none', border: 'none', padding: 0, borderRadius: '50%' }}
          >
            <motion.img key={shaking} src={art.tambourine} alt="" draggable={false} animate={shaking ? { rotate: [0, -16, 14, -12, 10, -8, 6, 0], y: [0, -8, 0, -8, 0, -6, 0, 0] } : {}} transition={{ duration: 2 }} style={{ width: '100%', height: '100%', display: 'block' }} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finish && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ position: 'absolute', left: `${lay.finish.x}%`, top: `${lay.finish.y}%`, translate: '-50% -50%', zIndex: 20 }}>
            <BigButton ariaLabel="Get my stamp" size="xl" onClick={onDone}>
              🫒 ⭐
            </BigButton>
          </motion.div>
        )}
      </AnimatePresence>
    </Scene>
  )
}
