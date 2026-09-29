// Pyramid Builders: Jamal the camel hauls stones on his sled and she stacks a pyramid, row by row (3, 2, 1), then crowns
// it with the golden capstone. On the upper rows Jamal brings a big and a small stone: small stones go on top (sizes).
// Jamal is a puppet: he walks in pulling the sled, shakes his head at a stone that's too big, and cheers at the end.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, DragArea, Draggable, DropZone, pick, say, shuffle, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { sfx } from '../../../kit/sfx'
import { Stage, WIGGLE } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { useLandscape } from '../../../kit/useLandscape'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Jamal } from '../puppets/Jamal'
import { Miu } from '../puppets/Miu'
import { PyramidStone } from './PyramidStone'

type Size = 'big' | 'mid' | 'small' | 'cap'
// Each stone's size in % of the building site: width and height. Rows get smaller toward the top, like a real pyramid.
const SIZE: Record<Size, { w: number; h: number }> = {
  big: { w: 30, h: 20 },
  mid: { w: 24, h: 17 },
  small: { w: 18, h: 14 },
  cap: { w: 16, h: 10 },
}
// The slots, bottom row first: x = center in %, bottom in % of the site.
const SLOTS: { size: Size; x: number; bottom: number }[] = [
  { size: 'big', x: 20, bottom: 0 },
  { size: 'big', x: 50, bottom: 0 },
  { size: 'big', x: 80, bottom: 0 },
  { size: 'mid', x: 38, bottom: 20 },
  { size: 'mid', x: 62, bottom: 20 },
  { size: 'small', x: 50, bottom: 37 },
  { size: 'cap', x: 50, bottom: 51 },
]
const ROW_END = [2, 4, 5, 6] // last slot of each row (the cap is its own "row")

/** What Jamal brings for a slot: one stone on the bottom row, a choice of two above it. */
function load(slot: number): Size[] {
  const want = SLOTS[slot].size
  if (want === 'big' || want === 'cap') return [want]
  return shuffle([want, 'big'])
}

export function Pyramid({ onDone, setProgress }: ActivityProps) {
  const [story, setStory] = useState(true)
  const [placed, setPlaced] = useState(0)
  const [sled, setSled] = useState<{ id: number; sizes: Size[] }>({ id: 0, sizes: load(0) })
  const [arriving, setArriving] = useState(true)
  const [wiggle, setWiggle] = useState<number | null>(null)
  const [help, setHelp] = useState(false)
  const [puffs, setPuffs] = useState<number[]>([])
  const [shine, setShine] = useState(false)
  const busy = useRef(false)
  const jamal = useRef<PuppetHandle>(null)
  const miu = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const landscape = useLandscape()
  const want = SLOTS[Math.min(placed, SLOTS.length - 1)]?.size

  const rows = ROW_END.filter((end) => placed > end).length
  useEffect(() => setProgress(rows, ROW_END.length), [rows, setProgress])

  // Jamal walks the sled in every time he brings a new load.
  useEffect(() => {
    if (story) return
    setArriving(true)
    void jamal.current?.play('walk')
    const t = setTimeout(() => setArriving(false), 1100)
    return () => clearTimeout(t)
  }, [sled.id, story])

  // The first prompt of each row.
  const prompt = placed === 0 ? L.pyramid.drag : placed === 3 ? L.pyramid.small : placed === 5 ? L.pyramid.top : placed === 6 ? L.pyramid.cap : undefined

  const give = async (index: number) => {
    if (busy.current || arriving || placed >= SLOTS.length) return false
    const size = sled.sizes[index]
    if (size !== want) {
      sounds.oops()
      setWiggle(index)
      setHelp(true)
      setTimeout(() => setWiggle(null), 500)
      void jamal.current?.play('shake')
      void say(L.pyramid.tooBig)
      return false
    }
    busy.current = true
    const n = placed + 1
    setPlaced(n)
    setHelp(false)
    setSled((s) => ({ ...s, sizes: [] }))
    // The stone drops into place with a thump and a puff of dust.
    setTimeout(() => {
      if (!alive()) return
      sfx.thump()
      setPuffs((p) => [...p, n - 1])
      setTimeout(() => setPuffs((p) => p.filter((q) => q !== n - 1)), 700)
    }, 250)
    sounds.note(n)
    if (n <= 3) {
      await say(L.pyramid.count[n - 1])
      if (!alive()) return true
    }
    if (n === 3) {
      burst(landscape ? 0.62 : 0.5, 0.5)
      sounds.correct()
      void miu.current?.play('cheer')
      await say(L.pyramid.bottom)
    } else if (n === 5) {
      sounds.correct()
      void jamal.current?.play('cheer')
      await say(L.pyramid.middle)
    } else if (n === SLOTS.length) {
      // The golden cap: the pyramid shines and everyone cheers.
      setShine(true)
      sounds.sparkle()
      sounds.correct()
      burst(landscape ? 0.62 : 0.5, 0.25)
      void jamal.current?.play('cheer')
      void miu.current?.play('pounce')
      await say(L.pyramid.done)
      if (!alive()) return true
      void miu.current?.play('dance')
      await say(L.pyramid.fact)
      await wait(400)
      if (alive()) onDone()
      return true
    }
    if (!alive()) return true
    busy.current = false
    setSled({ id: n, sizes: load(n) })
    return true
  }

  if (story) return <StoryBeat lines={[L.pyramid.story]} friend={<Jamal height="100%" />} bg={art.bgGizaDay} onDone={() => setStory(false)} />

  const site = (
    <div style={{ position: 'relative', width: 'min(100%, calc(100cqh * 1.25))', aspectRatio: '1.25', containerType: 'size' }}>
      {SLOTS.map((s, i) => {
        const { w, h } = SIZE[s.size]
        const box = { position: 'absolute' as const, left: `${s.x - w / 2}%`, bottom: `${s.bottom}%`, width: `${w}%`, height: `${h}%` }
        if (i < placed)
          return (
            <motion.div
              key={i}
              initial={{ y: '-60%', scale: 1.15, opacity: 0.4 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.45 }}
              style={{ ...box, filter: shine && s.size === 'cap' ? 'drop-shadow(0 0 18px #FFE27A)' : undefined }}
            >
              <PyramidStone cap={s.size === 'cap'} variant={i} />
            </motion.div>
          )
        if (i === placed)
          return (
            <DropZone key={i} id="slot" style={box}>
              <motion.div
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ width: '100%', height: '100%' }}
              >
                <PyramidStone cap={s.size === 'cap'} outline />
              </motion.div>
            </DropZone>
          )
        return null
      })}
      <AnimatePresence>
        {puffs.map((i) =>
          [-1, 1].map((dir) => (
            <motion.div
              key={`${i}${dir}`}
              initial={{ x: 0, scale: 0.4, opacity: 0.9 }}
              animate={{ x: dir * 60, y: -14, scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{ position: 'absolute', left: `${SLOTS[i].x}%`, bottom: `${SLOTS[i].bottom}%`, width: '12%', aspectRatio: '1.6', translate: '-50% 30%', borderRadius: '50%', background: '#F4D6AE', pointerEvents: 'none' }}
            />
          )),
        )}
      </AnimatePresence>
      {shine && (
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: [0, 1.3, 1], rotate: 90 }}
          transition={{ duration: 0.8 }}
          style={{ position: 'absolute', left: '50%', bottom: '60%', translate: '-50% 0', fontSize: '12cqh', pointerEvents: 'none' }}
        >
          ✨
        </motion.div>
      )}
    </div>
  )

  // Jamal and his sled with the stones he brought. She drags a stone (or taps it) to the glowing slot.
  const hauler = (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height: landscape ? 'min(40cqh, 19cqw)' : 'min(24cqh, 38cqw)', flexShrink: 0, maxWidth: landscape ? '42%' : '100%' }}>
      <motion.div key={sled.id} initial={{ x: '-70vw' }} animate={{ x: 0 }} transition={{ duration: 1.1, ease: 'easeOut' }} style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
        <div role="button" aria-label="Jamal" onClick={() => !busy.current && (void jamal.current?.play('chew'), void say(pick(L.tickle.jamal)))} style={{ position: 'relative', height: '100%', aspectRatio: '470 / 430', flexShrink: 0 }}>
          <Jamal ref={jamal} height="100%" />
          {/* Miu rides on Jamal's hump */}
          <div style={{ position: 'absolute', left: '30%', bottom: '58%', height: '42%', pointerEvents: 'none' }}>
            <Miu ref={miu} height="100%" />
          </div>
        </div>
        {/* The sled: two runners and a deck, with the stones on it. */}
        <div style={{ position: 'relative', height: '72%', aspectRatio: sled.sizes.length > 1 ? '1.7' : '1.2', marginLeft: '-8%', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '6%', paddingBottom: '10%' }}>
          <svg viewBox="0 0 200 40" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '18%', overflow: 'visible' }}>
            <path d="M6 14 H194 Q200 14 198 22 L196 26 H10 Q2 26 2 20 Z" fill="#C98A5A" stroke="#3A2A33" strokeWidth="4" vectorEffect="non-scaling-stroke" />
            <path d="M0 34 Q0 40 10 40 H186 Q198 40 200 28" fill="none" stroke="#8C5A3A" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          {sled.sizes.map((size, i) => {
            const s = SIZE[size]
            return (
              <motion.div key={`${sled.id}-${i}`} animate={wiggle === i ? WIGGLE : {}} style={{ height: `${(s.h / SIZE.big.h) * 88}%`, aspectRatio: String((s.w / s.h) * 1.25), position: 'relative', zIndex: 2 }}>
                <Draggable disabled={arriving} onDrop={(zone) => (zone === 'slot' ? void give(i) : false)} onTap={() => void give(i)} style={{ width: '100%', height: '100%' }}>
                  <div role="button" aria-label={`${size} stone`} className={help && size === want ? 'world-glow' : undefined} style={{ width: '100%', height: '100%', borderRadius: 12, minWidth: 'calc(var(--target) * 0.8)', minHeight: 'calc(var(--target) * 0.6)' }}>
                    <PyramidStone cap={size === 'cap'} variant={placed} />
                  </div>
                </Draggable>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )

  return (
    <Stage bg={art.bgGizaDay} prompt={prompt} style={{ backgroundPosition: 'center bottom' }}>
      <DragArea style={{ position: 'absolute', inset: 0, containerType: 'size', display: 'flex', flexDirection: landscape ? 'row' : 'column-reverse', alignItems: landscape ? 'flex-end' : 'center', justifyContent: 'space-evenly', paddingBottom: '2%', gap: '2%' }}>
        {hauler}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', containerType: 'size' }}>{site}</div>
      </DragArea>
    </Stage>
  )
}
