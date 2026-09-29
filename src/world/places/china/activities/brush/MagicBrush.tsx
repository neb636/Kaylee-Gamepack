// 🖌️ The Magic Brush (Guilin, by the Li River). Folk tale of Ma Liang and the magic paintbrush: everything he paints
// comes alive. Kaylee traces big Chinese characters on a stone slab with a water brush (people in Chinese parks really do
// this, and the writing fades). Each finished character turns into the thing it means and flies up into the painted
// scene: person, mountains, sun, tree (and a bird), big (a friend copies the pose), moon (evening). At the end her name
// is brushed in Chinese and she stamps it with a red chop. No failing: after a few misses the brush finishes the stroke.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { burst, Buddy, say, sounds, useAlive, useElementSize, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { BaoBao } from '../../puppets/BaoBao'
import { INK } from '../../puppets/ink'
import type { ActivityProps } from '../../Place'
import { CHARS } from './chars'
import { Slab } from './Slab'
import { Moon, Seal, Sun, ZH_FONT } from './Things'

const B = L.brush
const TOTAL = CHARS.length + 1
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

type Phase = 'write' | 'morph' | 'name' | 'stamp' | 'end'
type ThingId = 'person' | 'hills' | 'sun' | 'tree' | 'bird' | 'moon' | 'bao'

interface Card {
  zh: string
  py: string
  en: string
}

function WordBadge({ card }: { card: Card | null }) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={card.zh}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -3 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.45 }}
          style={{ position: 'absolute', left: '50%', top: 4, marginLeft: -60, zIndex: 35, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 20, padding: '4px 16px 6px', boxShadow: 'var(--shadow)', textAlign: 'center', pointerEvents: 'none' }}
        >
          <div lang="zh-CN" style={{ fontSize: 'clamp(30px, 5vmin, 48px)', fontWeight: 700, color: '#E8504F', fontFamily: ZH_FONT, lineHeight: 1.1 }}>
            {card.zh}
          </div>
          <div style={{ fontSize: 'clamp(16px, 2.4vmin, 22px)', fontWeight: 600, color: INK }}>{card.py}</div>
          <div style={{ fontSize: 'clamp(13px, 1.9vmin, 17px)', color: '#8A6A5A' }}>{card.en}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Where each painted thing ends up, in the scene area above (portrait) or left of (landscape) the slab. */
function slots(R: { w: number; h: number }, ground: number) {
  const personH = clamp(Math.min(R.h * 0.4, R.w * 0.27), 60, 210)
  const treeH = clamp(Math.min(R.h * 0.56, R.w * 0.36), 80, 300)
  const hillsH = clamp(Math.min(R.h * 0.6, R.w * 0.98 / 1.1), 50, 340)
  const sunS = clamp(Math.min(R.h * 0.24, R.w * 0.24), 56, 150)
  const skyY = Math.max(sunS / 2 + 44, ground - hillsH - sunS * 0.55)
  return {
    person: { cx: R.w * 0.15, foot: ground, w: personH * 0.85, h: personH },
    bao: { cx: R.w * 0.37, foot: ground, w: personH * 1.05, h: personH * 1.05 },
    tree: { cx: R.w * 0.63, foot: ground, w: treeH, h: treeH },
    hills: { cx: R.w / 2, foot: ground, w: hillsH * 1.1, h: hillsH },
    sun: { cx: R.w * 0.76, foot: skyY + sunS / 2, w: sunS, h: sunS },
    moon: { cx: R.w * 0.3, foot: skyY + sunS / 2, w: sunS, h: sunS },
    bird: { cx: R.w * 0.63 + treeH * 0.05, foot: ground - treeH * 0.8, w: treeH * 0.3, h: treeH * 0.3 },
  } satisfies Record<ThingId, { cx: number; foot: number; w: number; h: number }>
}

const Z: Record<ThingId, number> = { sun: 1, moon: 1, hills: 2, person: 3, bao: 3, tree: 3, bird: 4 }

export function MagicBrush({ onDone, setProgress }: ActivityProps) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const alive = useAlive()
  const crane = useRef<PuppetHandle>(null)
  const bao = useRef<PuppetHandle>(null)
  const person = useRef<PuppetHandle>(null)
  const finished = useRef(false)

  const [story, setStory] = useState(true)
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('write')
  const [prompt, setPrompt] = useState<Line>(B.intro[0])
  const [speakPrompt, setSpeakPrompt] = useState(true)
  const [card, setCard] = useState<Card | null>(null)
  const [things, setThings] = useState<ThingId[]>([])
  const [big, setBig] = useState(false)
  const [landed, setLanded] = useState(false)
  const [evening, setEvening] = useState(false)
  const [fading, setFading] = useState(false)
  const [sparkles, setSparkles] = useState(0)
  const [nameShown, setNameShown] = useState(false)
  const [stamped, setStamped] = useState(false)
  const [stamping, setStamping] = useState(false)

  useEffect(() => {
    setProgress(0, TOTAL)
  }, [])

  const land = W > H
  const S = W > 0 ? (land ? Math.min(H * 0.98, W * 0.46) : Math.min(W * 0.9, H * 0.5)) : 0
  const slab = land ? { x: W - S - 6, y: (H - S) / 2 } : { x: (W - S) / 2, y: H - S - 14 }
  const R = land ? { w: Math.max(0, slab.x - 8), h: H } : { w: W, h: Math.max(0, H - S - 28) }
  const ground = R.h - 6
  const sl = slots(R, ground)
  const craneH = clamp(Math.min(R.h * 0.42, S * 0.5), 90, 230)
  const craneX = Math.min(R.w * 0.9, W - craneH * 0.42)
  const craneFoot = land ? ground : slab.y + 10
  const sx = slab.x + S / 2
  const sy = slab.y + S / 2

  const char = CHARS[idx]

  const complete = async (ci: number) => {
    setPhase('morph')
    setSpeakPrompt(false)
    setCard({ zh: CHARS[ci].zh, py: CHARS[ci].py, en: CHARS[ci].en })
    setProgress(ci + 1, TOTAL)
    sounds.correct()
    burst()
    void crane.current?.play('cheer')
    await wait(500)
    if (!alive()) return
    await say(B.word[ci])
    if (!alive()) return
    setPrompt(B.means[ci])
    const means = say(B.means[ci])
    const spawn: ThingId = (['person', 'hills', 'sun', 'tree', 'person', 'moon'] as const)[ci]
    if (ci !== 4) setThings((t) => [...t, spawn])
    else {
      // Big! The little person stretches up tall.
      setBig(true)
      void person.current?.play('cheer')
      sounds.whoosh()
    }
    await means
    if (!alive()) return
    // Each painted thing does its own little bit of magic once it lands.
    await wait(ci === 4 ? 300 : 1000)
    if (!alive()) return
    if (ci === 0) {
      void person.current?.play('cheer')
      sounds.sparkle()
    } else if (ci === 1) {
      sounds.sparkle()
    } else if (ci === 3) {
      setThings((t) => [...t, 'bird'])
      sounds.note(6)
      setTimeout(() => {
        if (!alive()) return
        setLanded(true)
        sounds.note(9)
        void crane.current?.play('nod')
      }, 1500)
    } else if (ci === 4) {
      setThings((t) => [...t, 'bao'])
      sounds.pop()
      await wait(700)
      if (!alive()) return
      void bao.current?.play('cheer')
      void person.current?.play('jump')
      await say(B.baoBig)
    } else if (ci === 5) {
      setEvening(true)
      sounds.sparkle()
      await say(B.night)
    }
    if (!alive()) return
    await wait(ci === 3 ? 1500 : 700)
    if (!alive()) return
    // The water writing dries and fades away. The painted thing stays.
    setFading(true)
    setSparkles((n) => n + 1)
    sounds.sparkle()
    if (ci === 0) {
      setPrompt(B.fade)
      await say(B.fade)
    } else await wait(1300)
    if (!alive()) return
    setCard(null)
    if (ci < CHARS.length - 1) {
      setIdx(ci + 1)
      setFading(false)
      setSpeakPrompt(true)
      setPrompt(B.intro[ci + 1])
      setPhase('write')
    } else {
      void nameFinale()
    }
  }

  const nameFinale = async () => {
    setFading(false)
    setPhase('name')
    setSpeakPrompt(true)
    setPrompt(B.nameIntro)
    setNameShown(true)
    sounds.whoosh()
    await wait(3400)
    if (!alive()) return
    setCard({ zh: '凯莉', py: 'kǎilì', en: 'Kaylee' })
    void crane.current?.play('nod')
    await say(B.nameSay)
    if (!alive()) return
    setPrompt(B.stamp)
    setPhase('stamp')
  }

  const stamp = async () => {
    if (phase !== 'stamp' || stamping) return
    setStamping(true)
    await wait(260)
    if (!alive()) return
    setStamped(true)
    sfx.thump()
    burst()
    sounds.fanfare()
    setProgress(TOTAL, TOTAL)
    setCard(null)
    void crane.current?.play('cheer')
    setSpeakPrompt(false)
    setPrompt(B.stamped)
    await say(B.stamped)
    if (!alive()) return
    setPrompt(B.fact)
    await say(B.fact)
    if (!alive()) return
    await say(B.end)
    if (!alive() || finished.current) return
    finished.current = true
    setPhase('end')
    onDone()
  }

  const onStroke = (i: number) => {
    void crane.current?.play('nod')
    if (i >= char.strokes.length - 1) {
      void complete(idx)
    } else {
      setPrompt(B.next)
    }
  }
  const onFail = (n: number) => {
    void crane.current?.play('wiggle')
    if (n === 2) {
      setPrompt(B.retry)
      void say(B.retry)
    } else if (n === 3) {
      setPrompt(B.hint)
      void say(B.hint)
    }
  }

  const bg = land ? art.bgLiRiver : art.bgLiRiverTall

  const flyer = (id: ThingId, child: ReactNode, extra?: { fromTop?: boolean }) => {
    const s = sl[id]
    const x0 = extra?.fromTop ? W * 0.4 : sx - s.cx
    const y0 = extra?.fromTop ? -s.foot - 120 : sy - (s.foot - s.h / 2)
    const mini = extra?.fromTop ? 0.5 : clamp((S * 0.42) / Math.max(s.w, s.h), 0.15, 1)
    return (
      <motion.div
        key={id}
        style={{ position: 'absolute', left: s.cx - s.w / 2, top: s.foot - s.h, width: s.w, height: s.h, zIndex: Z[id], transformOrigin: '50% 100%', pointerEvents: 'none' }}
        initial={{ x: x0, y: y0, scale: mini * 0.3, opacity: 0 }}
        animate={extra?.fromTop ? { x: 0, y: 0, scale: 1, opacity: 1 } : { x: [x0, x0, 0], y: [y0, y0, 0], scale: [mini * 0.3, mini, 1], opacity: [0, 1, 1] }}
        transition={extra?.fromTop ? { duration: 1.4, ease: 'easeOut' } : { duration: 1.7, times: [0, 0.3, 1], ease: 'easeInOut' }}
      >
        {child}
      </motion.div>
    )
  }

  return (
    <div className="brush-root" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(#CFEFFF, #E9F9EE)' }}>
      {/* On short phone screens the prompt sits in the top row; seven stars are wider than the usual five. */}
      <style>{`@media (max-height: 560px) { .brush-root .stage-prompt { margin-left: calc(var(--btn) + 330px) !important; } }`}</style>
      {bg && <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />}
      {/* Evening: the whole scene turns dusky when the moon rises. */}
      <motion.div
        initial={false}
        animate={{ opacity: evening ? 1 : 0 }}
        transition={{ duration: 3 }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(rgba(38,34,110,0.62), rgba(120,60,140,0.35) 60%, rgba(255,150,120,0.18))' }}
      >
        {[[12, 14], [30, 26], [52, 12], [70, 22], [88, 10], [20, 40], [80, 38], [60, 32]].map(([x, y], i) => (
          <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 + (i % 3) * 0.6, delay: i * 0.3 }} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, fontSize: 'clamp(14px, 2.4vmin, 24px)' }}>
            ✨
          </motion.div>
        ))}
      </motion.div>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 12px)', gap: 12 }}>
        {!story && <PromptBubble text={prompt} speak={speakPrompt} />}
        <div ref={box} style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
          {W > 0 && H > 0 && S > 0 && (
            <>
              {/* painted things that stay in the scene */}
              {things.includes('hills') && flyer('hills', <motion.img src={art.inkMountains} alt="" initial={{ scaleY: 0.2 }} animate={{ scaleY: 1 }} transition={{ type: 'spring', bounce: 0.4, delay: 0.7, duration: 1 }} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%', transformOrigin: '50% 100%' }} />)}
              {things.includes('sun') && flyer('sun', <motion.div animate={{ opacity: evening ? 0 : 1, y: evening ? 50 : 0 }} transition={{ duration: 2.5 }} style={{ width: '100%', height: '100%' }}><Sun /></motion.div>)}
              {things.includes('moon') && flyer('moon', <Moon />)}
              {things.includes('tree') && flyer('tree', <Buddy img={art.inkTree} height="100%" calm />)}
              {things.includes('person') && flyer('person', <motion.div animate={{ scale: big ? 1.3 : 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ height: '100%', transformOrigin: '50% 100%' }}><Buddy ref={person} img={art.inkPerson} height="100%" /></motion.div>)}
              {things.includes('bird') && flyer('bird', <motion.img src={art.inkBird} alt="" animate={landed ? { y: [0, -4, 0], rotate: 0 } : { rotate: [-10, 10, -10], y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: landed ? 1.8 : 0.35 }} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />, { fromTop: true })}
              {things.includes('bao') && (
                <motion.div
                  key="bao"
                  style={{ position: 'absolute', left: sl.bao.cx - sl.bao.w / 2, top: sl.bao.foot - sl.bao.h, width: sl.bao.w, height: sl.bao.h, zIndex: Z.bao, transformOrigin: '50% 100%' }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  <motion.div animate={{ scale: big ? 1.2 : 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ height: '100%', transformOrigin: '50% 100%' }}>
                    <BaoBao ref={bao} height="100%" />
                  </motion.div>
                </motion.div>
              )}

              {/* Lady Crane, who owns the magic brush */}
              <button
                aria-label="Lady Crane"
                onClick={() => {
                  void crane.current?.play('jump')
                  void say(B.tapCrane[Math.floor(Math.random() * B.tapCrane.length)], { interrupt: false })
                }}
                style={{ position: 'absolute', left: craneX, top: craneFoot - craneH, height: craneH, transform: 'translateX(-50%)', zIndex: 14, padding: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-end', touchAction: 'manipulation' }}
              >
                <Buddy ref={crane} img={art.crane} voice="crane" height={`${craneH}px`} />
              </button>

              {/* the stone slab */}
              <div style={{ position: 'absolute', left: slab.x, top: slab.y, width: S, height: S, zIndex: 10 }}>
                <Slab
                  key={char.id}
                  char={char}
                  size={S}
                  fading={fading}
                  brushImg={art.magicBrush}
                  locked={phase !== 'write' || story}
                  onStroke={onStroke}
                  onFail={onFail}
                />
                {/* sparkles as the water writing dries */}
                <AnimatePresence>
                  {sparkles > 0 && fading &&
                    Array.from({ length: 12 }, (_, i) => (
                      <motion.span
                        key={`${sparkles}-${i}`}
                        initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6], y: -30 - (i % 4) * 14 }}
                        transition={{ duration: 1.3, delay: (i % 6) * 0.12 }}
                        style={{ position: 'absolute', left: `${12 + ((i * 37) % 76)}%`, top: `${18 + ((i * 53) % 64)}%`, fontSize: S * 0.08, pointerEvents: 'none' }}
                      >
                        ✨
                      </motion.span>
                    ))}
                </AnimatePresence>

                {/* her name, brushed in Chinese, on a paper scroll over the slab */}
                {nameShown && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ position: 'absolute', inset: 0, borderRadius: S * 0.07, background: 'linear-gradient(#FFF9EE, #F7EAD2)', border: `${Math.max(5, S * 0.02)}px solid #C9A46A`, boxSizing: 'border-box', display: 'grid', placeItems: 'center', overflow: 'hidden' }}
                  >
                    <motion.div
                      lang="zh-CN"
                      initial={{ clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 2, ease: 'easeInOut', delay: 0.4 }}
                      style={{ fontFamily: ZH_FONT, fontWeight: 800, fontSize: S * 0.3, letterSpacing: S * 0.02, color: '#2E3944', marginTop: -S * 0.17, whiteSpace: 'nowrap', lineHeight: 1.1 }}
                    >
                      凯莉
                    </motion.div>
                    {stamped && (
                      <motion.div initial={{ scale: 1.9, opacity: 0, rotate: -12 }} animate={{ scale: 1, opacity: 0.94, rotate: -6 }} transition={{ type: 'spring', stiffness: 380, damping: 16 }} style={{ position: 'absolute', right: S * 0.08, bottom: S * 0.07, width: S * 0.27, height: S * 0.27 }}>
                        <Seal />
                      </motion.div>
                    )}
                    {phase === 'stamp' && !stamped && (
                      <motion.button
                        aria-label="Stamp"
                        onClick={stamp}
                        animate={stamping ? { y: [0, -S * 0.12, S * 0.02], rotate: [0, -8, 0] } : { scale: [1, 1.1, 1] }}
                        transition={stamping ? { duration: 0.3 } : { repeat: Infinity, duration: 1 }}
                        style={{ position: 'absolute', right: S * 0.08, bottom: S * 0.07, width: Math.max(96, S * 0.27), height: Math.max(96, S * 0.27), padding: 0, background: 'none', border: 'none', cursor: 'pointer', filter: 'drop-shadow(0 6px 0 #9E2530) drop-shadow(0 0 14px rgba(255,80,80,0.6))', touchAction: 'manipulation' }}
                      >
                        <Seal />
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </div>
            </>
          )}
          <WordBadge card={card} />
        </div>
      </div>

      {story && <StoryBeat lines={B.story} img={art.crane} bg={bg} onDone={() => setStory(false)} />}
    </div>
  )
}
