// Wake the Sphinx: the Great Sphinx is buried in sand (it really was, for centuries). She rubs the sand away: his face
// first (the dust makes him sneeze), then his two lion paws, then his back, where pieces of an old pot are hiding. Then she
// fits the three pieces back together, and the Sphinx asks if anyone has seen his nose.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, DragArea, Draggable, DropZone, pick, say, sounds, useAlive, wait, type PuppetHandle } from '../../../../sdk'
import { ScratchReveal, type RevealRegion, type ScratchRevealHandle } from '../../../kit/ScratchReveal'
import { sfx } from '../../../kit/sfx'
import { Stage } from '../../../kit/Stage'
import { StoryBeat } from '../../../kit/StoryBeat'
import { useLandscape } from '../../../kit/useLandscape'
import { art } from '../art'
import { L } from '../lines'
import type { ActivityProps } from '../Place'
import { Miu } from '../puppets/Miu'
import { SPHINX_BOX, SPHINX_REGIONS, Sphinx as SphinxPuppet } from '../puppets/Sphinx'

type Stage3 = 'face' | 'paws' | 'back'
const STAGES: Stage3[] = ['face', 'paws', 'back']
const PROMPTS = { face: L.sphinx.rub, paws: L.sphinx.paws, back: L.sphinx.back }
const DONE_AT = 0.5 // share of a region she has to rub before the rest puffs away by itself

// The sand box is a bit taller than the Sphinx, so the heap has a rounded top above his headdress.
const PAD_TOP = 0.12
// ...and wider, so the heap slopes down to the ground on both sides.
const PAD_X = 0.08
const toSand = (r: RevealRegion): RevealRegion => ({ x: (PAD_X * 100 + r.x) / (1 + 2 * PAD_X), w: r.w / (1 + 2 * PAD_X), y: (PAD_TOP * 100 + r.y) / (1 + PAD_TOP), h: r.h / (1 + PAD_TOP) })
const REGIONS = STAGES.map((s) => toSand(SPHINX_REGIONS[s]))
// Pot pieces hidden under the sand on his back (in % of the Sphinx).
const PIECE_SPOTS = [
  { x: 76, y: 62 },
  { x: 86, y: 52 },
  { x: 92, y: 76 },
].map((p) => {
  const r = toSand({ x: p.x, y: p.y, w: 0, h: 0 })
  return { x: r.x, y: r.y }
})
// The pot comes apart in three bands (clip-path insets: top, bottom).
const PIECES = [
  { top: 0, bottom: 62 },
  { top: 38, bottom: 30 },
  { top: 70, bottom: 0 },
]

/** Paints the heap of sand: a big rounded dune with a few ripples and pebbles. */
function paintSand(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  // A dune: it slopes down to the ground on both sides, and the very top of his headdress pokes out.
  const top = h * 0.2
  const ridge = new Path2D()
  ridge.moveTo(-w * 0.02, h * 1.01)
  ridge.bezierCurveTo(w * 0.02, h * 0.62, w * 0.12, top, w * 0.4, top)
  ridge.bezierCurveTo(w * 0.56, top, w * 0.62, h * 0.28, w * 0.78, h * 0.32)
  ridge.bezierCurveTo(w * 0.94, h * 0.36, w * 0.99, h * 0.7, w * 1.02, h * 1.01)
  const heap = new Path2D(ridge)
  heap.closePath()
  ctx.fillStyle = '#F2C98E'
  ctx.fill(heap)
  // Only the top of the dune gets a line; its feet melt into the ground.
  ctx.lineWidth = Math.max(3, w * 0.006)
  ctx.strokeStyle = '#C99B6A'
  ctx.stroke(ridge)
  ctx.fillStyle = '#F2C98E'
  ctx.fillRect(0, h * 0.94, w, h * 0.06)
  // Ripples
  ctx.strokeStyle = '#E3B477'
  ctx.lineCap = 'round'
  ctx.lineWidth = Math.max(4, w * 0.008)
  for (const [x, y, len] of [
    [0.12, 0.5, 0.14],
    [0.3, 0.3, 0.12],
    [0.52, 0.46, 0.16],
    [0.72, 0.52, 0.14],
    [0.2, 0.78, 0.18],
    [0.62, 0.84, 0.16],
    [0.42, 0.66, 0.12],
    [0.86, 0.7, 0.1],
  ]) {
    ctx.beginPath()
    ctx.moveTo(w * x, h * y)
    ctx.quadraticCurveTo(w * (x + len / 2), h * (y - 0.03), w * (x + len), h * y)
    ctx.stroke()
  }
  // Pebbles
  ctx.fillStyle = '#D9A876'
  for (let i = 0; i < 26; i++) {
    const x = ((i * 97) % 100) / 100
    const y = 0.35 + (((i * 53) % 60) / 100)
    ctx.beginPath()
    ctx.ellipse(w * x, h * y, w * 0.006, w * 0.004, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function Sphinx({ onDone, setProgress }: ActivityProps) {
  const [phase, setPhase] = useState<'story' | Stage3 | 'pot' | 'end'>('story')
  const [awake, setAwake] = useState(false)
  const [rubbed, setRubbed] = useState(false)
  const [grains, setGrains] = useState<{ id: number; x: number; y: number }[]>([])
  const [placed, setPlaced] = useState<number[]>([])
  const sand = useRef<ScratchRevealHandle>(null)
  const sphinx = useRef<PuppetHandle>(null)
  const miu = useRef<PuppetHandle>(null)
  const busy = useRef(false)
  const lastGrain = useRef(0)
  const alive = useAlive()
  const landscape = useLandscape()

  const stageIndex = STAGES.indexOf(phase as Stage3)
  useEffect(() => setProgress(phase === 'pot' ? 3 : phase === 'end' ? 4 : Math.max(0, stageIndex), 4), [phase, stageIndex, setProgress])
  useEffect(() => setRubbed(false), [phase])

  const finishStage = async (s: Stage3) => {
    busy.current = true
    sand.current?.clearRegion(REGIONS[STAGES.indexOf(s)])
    sfx.fwip()
    if (s === 'face') {
      // All that dust tickles his nose.
      setAwake(true)
      await wait(300)
      if (!alive()) return
      await sphinx.current?.play('sneeze')
      if (!alive()) return
      void say(L.sphinx.sneeze)
      sand.current?.clearCircle(REGIONS[0].x + REGIONS[0].w / 2, 30, 20)
      burst(0.4, 0.4)
      await wait(900)
      if (!alive()) return
      void sphinx.current?.play('smile')
      await say(L.sphinx.hello)
      if (!alive()) return
      setPhase('paws')
    } else if (s === 'paws') {
      sounds.correct()
      void sphinx.current?.play('smile')
      void miu.current?.play('cheer')
      await say(L.sphinx.twoPaws)
      if (!alive()) return
      setPhase('back')
    } else {
      sounds.correct()
      // The last of the sand blows away.
      sand.current?.clearRegion({ x: -20, y: -20, w: 140, h: 140 })
      burst(0.5, 0.5)
      void sphinx.current?.play('cheer')
      await say(L.sphinx.lion)
      if (!alive()) return
      void say(L.sphinx.pieces)
      setPhase('pot')
    }
    busy.current = false
  }

  const progress = (cleared: number[]) => {
    if (busy.current || stageIndex < 0) return
    if (cleared[stageIndex] >= DONE_AT) void finishStage(phase as Stage3)
  }

  const rub = (x: number, y: number) => {
    if (!rubbed) setRubbed(true)
    const now = performance.now()
    if (now - lastGrain.current < 90) return
    lastGrain.current = now
    if (Math.random() < 0.35) sfx.fwip()
    const id = now + Math.random()
    setGrains((g) => [...g.slice(-10), { id, x, y }])
    setTimeout(() => setGrains((g) => g.filter((q) => q.id !== id)), 650)
  }

  const fit = async (i: number) => {
    if (placed.includes(i)) return true
    const next = [...placed, i]
    setPlaced(next)
    sfx.thump()
    sounds.note(next.length * 3)
    if (next.length < PIECES.length) return true
    busy.current = true
    sounds.correct()
    burst(landscape ? 0.7 : 0.5, 0.5)
    void miu.current?.play('cheer')
    await say(L.sphinx.potDone)
    if (!alive()) return true
    setPhase('end')
    void sphinx.current?.play('smile')
    await say(L.sphinx.nose)
    if (!alive()) return true
    void miu.current?.play('purr')
    await say(L.sphinx.noseAns)
    if (!alive()) return true
    void sphinx.current?.play('cheer')
    await wait(700)
    if (alive()) onDone()
    return true
  }

  if (phase === 'story') return <StoryBeat lines={[L.sphinx.story]} friend={<Miu height="100%" />} bg={art.bgSphinx} onDone={() => setPhase('face')} />

  const prompt = stageIndex >= 0 ? PROMPTS[phase as Stage3] : phase === 'pot' ? L.sphinx.pieces : undefined
  const hintRegion = stageIndex >= 0 && !rubbed ? REGIONS[stageIndex] : null
  const aspect = (SPHINX_BOX[0] * (1 + 2 * PAD_X)) / (SPHINX_BOX[1] * (1 + PAD_TOP))

  return (
    <Stage bg={art.bgSphinx} prompt={prompt} style={{ backgroundPosition: 'center bottom' }}>
      <div style={{ position: 'absolute', inset: 0, containerType: 'size', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '3cqh' }}>
        <div style={{ position: 'relative', width: `min(96cqw, calc(88cqh * ${aspect}))`, aspectRatio: String(aspect) }}>
          {/* The Sphinx, the pot pieces hidden in the sand, then the sand on top. */}
          <div
            role="button"
            aria-label="Sphinx"
            onClick={() => phase === 'end' && !busy.current && (void sphinx.current?.play('smile'), void say(pick(L.tickle.sphinx)))}
            style={{ position: 'absolute', left: `${(PAD_X * 100) / (1 + 2 * PAD_X)}%`, width: `${100 / (1 + 2 * PAD_X)}%`, bottom: 0, height: `${100 / (1 + PAD_TOP)}%` }}
          >
            <SphinxPuppet ref={sphinx} height="100%" asleep={!awake} />
          </div>
          {phase !== 'pot' && phase !== 'end' &&
            PIECE_SPOTS.map((p, i) => (
              <img key={i} src={art.pot} alt="" style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: '13%', aspectRatio: '1', translate: '-50% -50%', rotate: `${(i - 1) * 25}deg`, objectFit: 'contain', clipPath: `inset(${PIECES[i].top}% 0 ${PIECES[i].bottom}% 0)`, pointerEvents: 'none' }} />
            ))}
          <ScratchReveal ref={sand} paint={paintSand} brush={5.5} regions={REGIONS} onProgress={progress} onRub={rub} disabled={stageIndex < 0} style={{ zIndex: 2 }} />
          {hintRegion && (
            <motion.div
              animate={{ x: ['-30%', '30%', '-30%'], y: ['0%', '12%', '0%'] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ position: 'absolute', left: `${hintRegion.x + hintRegion.w / 2}%`, top: `${hintRegion.y + hintRegion.h / 2}%`, translate: '-50% -50%', fontSize: 'min(64px, 9cqh)', zIndex: 3, pointerEvents: 'none' }}
            >
              👆
            </motion.div>
          )}
          <AnimatePresence>
            {grains.map((g) =>
              [0, 1, 2].map((k) => (
                <motion.div
                  key={`${g.id}${k}`}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: (k - 1) * 40 + (Math.random() - 0.5) * 30, y: [-10, -40 - k * 12, 10], opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{ position: 'absolute', left: `${g.x}%`, top: `${g.y}%`, width: 10, height: 10, borderRadius: '50%', background: '#E3B477', zIndex: 4, pointerEvents: 'none' }}
                />
              )),
            )}
          </AnimatePresence>
          <div style={{ position: 'absolute', left: landscape ? '-14%' : '2%', bottom: landscape ? '0%' : '-2%', height: '30%', zIndex: 5, pointerEvents: 'none' }}>
            <Miu ref={miu} height="100%" />
          </div>
        </div>
      </div>
      {(phase === 'pot' || phase === 'end') && <PotPuzzle placed={placed} onFit={(i) => void fit(i)} />}
    </Stage>
  )
}

/** Three pieces of an old pot to drag (or tap) back into its outline. */
function PotPuzzle({ placed, onFit }: { placed: number[]; onFit: (i: number) => void }) {
  const landscape = useLandscape()
  const pot = landscape ? 'min(46cqh, 30cqw)' : 'min(34cqh, 50cqw)'
  const [order] = useState(() => [1, 2, 0])
  const piece = (i: number) => <img src={art.pot} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', clipPath: `inset(${PIECES[i].top}% 0 ${PIECES[i].bottom}% 0)` }} />
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ position: 'absolute', inset: 0, containerType: 'size', zIndex: 10, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
      <DragArea style={{ display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center', gap: '4cqmin', background: 'rgba(255,247,240,0.92)', borderRadius: 36, padding: '3cqmin 5cqmin', boxShadow: 'var(--shadow)', pointerEvents: 'auto' }}>
        <DropZone id="pot" style={{ position: 'relative', height: pot, aspectRatio: '1' }}>
          <img src={art.pot} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'grayscale(1) brightness(1.6) opacity(0.35)' }} />
          {placed.map((i) => (
            <motion.div key={i} initial={{ scale: 1.15 }} animate={{ scale: 1 }} style={{ position: 'absolute', inset: 0 }}>
              {piece(i)}
            </motion.div>
          ))}
        </DropZone>
        <div style={{ display: 'flex', flexDirection: landscape ? 'column' : 'row', gap: '2cqmin' }}>
          {order
            .filter((i) => !placed.includes(i))
            .map((i) => (
              <motion.div key={i} initial={{ scale: 0, rotate: 0 }} animate={{ scale: 1, rotate: (i - 1) * 12 }} style={{ height: `calc(${pot} * 0.5)`, aspectRatio: '1' }}>
                <Draggable onDrop={(zone) => (zone === 'pot' ? (onFit(i), true) : false)} onTap={() => onFit(i)} style={{ width: '100%', height: '100%' }}>
                  <div role="button" aria-label="pot piece" className="world-glow" style={{ width: '100%', height: '100%', borderRadius: 24, background: 'rgba(255,255,255,0.7)', minWidth: 'var(--target)', minHeight: 'var(--target)' }}>
                    {piece(i)}
                  </div>
                </Draggable>
              </motion.div>
            ))}
        </div>
      </DragArea>
    </motion.div>
  )
}
