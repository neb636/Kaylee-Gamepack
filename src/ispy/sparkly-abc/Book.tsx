// Sparkly I Spy: an alphabet I Spy picture book (after Webber Books' "I Spy for Girls").
// Sparkle spies a letter ("I spy something beginning with B!"), Kaylee searches a page of pictures and taps the one that
// begins with it, and the page turns to "B is for butterfly!". Every picture reacts to a tap and says its own first
// letter ("Cupcake starts with C!"), so a wrong guess teaches a letter too. Eight pages a sitting, busier as she goes
// (3 pictures up to 8); letters she hasn't found yet come first, so the whole alphabet comes round over a few sittings.
import { AnimatePresence, motion, useAnimate } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { burst, pick, say, shuffle, sounds, SparklePuppet, useAlive, useElementSize, useSaved, wait, type GameProps, type PuppetHandle } from '../../sdk'
import { foundKey, useBookSections } from '../sections'
import { clashes, ITEMS, LETTERS, PAGE_SIZES, PAGES, type Item, type Letter } from './items'
import cover from './assets/cover.webp'
import { L } from './lines'
import SECTIONS from './sections'

type Phase = { at: 'cover' } | { at: 'page'; n: number; letter: Letter } | { at: 'found'; n: number; letter: Letter } | { at: 'end' }

const asLetter = (s: string) => (LETTERS.includes(s as Letter) ? (s as Letter) : 'B')
/** A letter she hasn't found yet (ever), else one not used in this sitting. */
function nextLetter(used: Letter[], ever: string[]): Letter {
  const fresh = LETTERS.filter((l) => !used.includes(l) && !ever.includes(l))
  return pick(fresh.length ? fresh : LETTERS.filter((l) => !used.includes(l)))
}

const PAPER: CSSProperties = {
  background: 'radial-gradient(circle, rgba(255,143,184,0.18) 2.5px, transparent 3px) 0 0 / 34px 34px, #FFF7F0',
  borderRadius: 32,
  border: '6px solid #fff',
  boxShadow: 'var(--shadow)',
}
/** Clears the shell's 🏠 button and stars. */
const TOP = 'calc(var(--safe-top) + 100px)'

/** A picture that breathes, and wiggles, hops or dances on cue. */
function Pic({ item, size, cue, style }: { item: Item; size: number; cue: { kind: 'wiggle' | 'hop' | 'dance'; n: number } | null; style?: CSSProperties }) {
  const [scope, animate] = useAnimate()
  useEffect(() => {
    if (!cue || !scope.current) return
    if (cue.kind === 'wiggle') void animate(scope.current, { rotate: [0, -14, 12, -8, 5, 0], scale: [1, 1.08, 1.04, 1] }, { duration: 0.6 })
    // Crouch, jump, land with a squash.
    else if (cue.kind === 'hop') void animate(scope.current, { y: [0, 6, -size * 0.28, 0, 0], scaleY: [1, 0.82, 1.12, 0.86, 1], scaleX: [1, 1.12, 0.92, 1.1, 1] }, { duration: 0.75, times: [0, 0.18, 0.5, 0.8, 1] })
    else void animate(scope.current, { rotate: [0, -12, 12, -12, 12, 0], y: [0, -size * 0.1, 0, -size * 0.1, 0, 0] }, { duration: 1.3 })
  }, [cue])
  return (
    <div ref={scope} style={{ width: size, height: size, transformOrigin: '50% 100%', ...style }}>
      <img
        src={item.img}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain', transformOrigin: '50% 100%', animation: `ispy-breathe 2.6s ease-in-out ${(item.letter.charCodeAt(0) % 7) * -0.37}s infinite` }}
      />
    </div>
  )
}

/** The big "B b" card. Tap it to hear the line again. */
function LetterCard({ letter, line, size }: { letter: Letter; line: string; size: number }) {
  return (
    <motion.button
      aria-label="Hear it again"
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        sounds.pop()
        void say(line)
      }}
      style={{ position: 'relative', flexShrink: 0, width: size, height: size, borderRadius: 28, background: '#fff', boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'baseline', justifyContent: 'center', paddingTop: size * 0.08, gap: size * 0.04, color: 'var(--hotpink)', fontWeight: 700, lineHeight: 1 }}
    >
      <span style={{ fontSize: size * 0.62 }}>{letter}</span>
      <span style={{ fontSize: size * 0.4, color: 'var(--lavender-dark)' }}>{letter.toLowerCase()}</span>
      <span style={{ position: 'absolute', right: -8, bottom: -8, width: 44, height: 44, borderRadius: '50%', background: 'var(--butter)', boxShadow: 'var(--shadow)', display: 'grid', placeItems: 'center', fontSize: 22 }}>🔊</span>
    </motion.button>
  )
}

function Sparkle({ height, cheer }: { height: string; cheer: number }) {
  const ref = useRef<PuppetHandle>(null)
  useEffect(() => {
    if (cheer) void ref.current?.play('cheer')
  }, [cheer])
  return (
    <button
      aria-label="Sparkle"
      onClick={() => {
        sounds.sparkle()
        void ref.current?.play('wiggle')
        void say(pick(L.tickle))
      }}
      style={{ background: 'none', padding: 0, flexShrink: 0, height, display: 'flex', alignItems: 'flex-end' }}
    >
      <SparklePuppet ref={ref} height={height} />
    </button>
  )
}

/** The page frame: the letter and Sparkle beside (wide screens) or above (tall) the picture area. */
function Spread({ wide, sideSize, side, children }: { wide: boolean; sideSize: number; side: ReactNode; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: `${TOP} 16px 16px 16px`, display: 'flex', flexDirection: wide ? 'row-reverse' : 'column', gap: 14 }}>
      <div style={{ flex: 'none', display: 'flex', flexDirection: wide ? 'column' : 'row', alignItems: 'center', justifyContent: wide ? 'flex-start' : 'center', gap: 14, ...(wide ? { width: sideSize + 24 } : { height: sideSize + 12 }) }}>{side}</div>
      <div style={{ ...PAPER, flex: 1, minWidth: 0, minHeight: 0, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

/** Best grid for n pictures in a w×h box: as many columns as make each cell biggest. */
function grid(n: number, w: number, h: number) {
  let best = { cols: 1, rows: n, cell: 0 }
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols)
    const cell = Math.min(w / cols, h / rows)
    if (cell > best.cell) best = { cols, rows, cell }
  }
  return best
}

function FindPage({ letter, n, wide, sideSize, onFound }: { letter: Letter; n: number; wide: boolean; sideSize: number; onFound: () => void }) {
  const alive = useAlive()
  const box = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(box)
  const count = PAGE_SIZES[n - 1]
  // The answer and pictures that neither start with its sound nor look like it, in random spots, tilts and sizes.
  const page = useMemo(() => {
    const others = shuffle(LETTERS.filter((l) => !clashes(l, letter))).slice(0, count - 1)
    const letters = shuffle([letter, ...others])
    return letters.map((l) => ({ item: ITEMS[l], dx: Math.random() - 0.5, dy: Math.random() - 0.5, rot: (Math.random() - 0.5) * 24, scale: 0.86 + Math.random() * 0.18 }))
  }, [letter, n])
  const [cues, setCues] = useState<Record<string, { kind: 'wiggle' | 'hop' | 'dance'; n: number }>>({})
  const [tags, setTags] = useState<Letter[]>([]) // the first letter popping up over a picture she tapped
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const [help, setHelp] = useState(0) // 1: the answer wiggles now and then, 2: it also grows and glows
  const [done, setDone] = useState(false)
  const touched = useRef(Date.now())

  const cue = (l: Letter, kind: 'wiggle' | 'hop' | 'dance') => setCues((c) => ({ ...c, [l]: { kind, n: (c[l]?.n ?? 0) + 1 } }))

  useEffect(() => {
    void say(L.spy[letter])
  }, [letter, n])

  // Stuck for ~8 s: the answer wiggles (and Sparkle says so, once); still stuck: it grows and glows.
  useEffect(() => {
    let spoke = false
    const id = setInterval(() => {
      const idle = (Date.now() - touched.current) / 1000
      if (done || idle < 8) return
      if (!spoke) {
        spoke = true
        void say(L.stuck)
      }
      setHelp(idle >= 16 ? 2 : 1)
      if (Math.floor(idle) % 4 === 0) cue(letter, 'wiggle')
    }, 1000)
    return () => clearInterval(id)
  }, [letter, n, done])

  const tap = async (item: Item) => {
    if (done) return
    touched.current = Date.now()
    if (item.letter === letter) {
      setDone(true)
      sounds.correct()
      cue(letter, 'hop')
      const b = box.current?.getBoundingClientRect()
      if (b) burst((b.left + b.width / 2) / innerWidth, (b.top + b.height / 2) / innerHeight)
      await wait(900)
      if (alive()) onFound()
      return
    }
    // Not the one: it says its own letter, which is a little lesson too.
    sounds.pop()
    cue(item.letter, 'wiggle')
    setTags((t) => [...t.filter((x) => x !== item.letter), item.letter])
    void say(L.other[item.letter])
    setTimeout(() => alive() && setTags((t) => t.filter((x) => x !== item.letter)), 1800)
  }

  const g = grid(count, width, height)
  // Cells in a random order, so a page of 5 in a 3×2 grid leaves a different hole each time.
  const cells = useMemo(() => shuffle([...Array(g.cols * g.rows).keys()]).slice(0, count), [g.cols, g.rows, letter, n])
  const offX = (width - g.cols * g.cell) / 2
  const offY = (height - g.rows * g.cell) / 2

  return (
    <Spread
      wide={wide}
      sideSize={sideSize}
      side={
        <>
          <LetterCard letter={letter} line={L.spy[letter]} size={sideSize} />
          <Sparkle height={`${sideSize}px`} cheer={done ? 1 : 0} />
        </>
      }
    >
      <div
        ref={box}
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return
          // Tapping the empty page: a little spy-glass ring where she looked.
          touched.current = Date.now()
          const b = e.currentTarget.getBoundingClientRect()
          const r = { id: Date.now(), x: e.clientX - b.left, y: e.clientY - b.top }
          setRipples((rs) => [...rs, r])
          sounds.note(Math.floor(Math.random() * 6))
          setTimeout(() => alive() && setRipples((rs) => rs.filter((x) => x.id !== r.id)), 700)
        }}
        style={{ position: 'absolute', inset: 12 }}
      >
        {width > 0 &&
          page.map((p, i) => {
            const cell = cells[i] ?? i
            const answer = p.item.letter === letter
            const s = g.cell * 0.8 * p.scale * (answer && help === 2 ? 1.25 : 1)
            const cx = offX + ((cell % g.cols) + 0.5) * g.cell + p.dx * (g.cell - s) * 0.9
            const cy = offY + (Math.floor(cell / g.cols) + 0.5) * g.cell + p.dy * (g.cell - s) * 0.9
            return (
              <motion.button
                key={p.item.letter}
                aria-label={p.item.word}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, left: cx - s / 2, top: cy - s / 2, width: s, height: s }}
                transition={{ delay: i * 0.06, type: 'spring', bounce: 0.45 }}
                onClick={() => void tap(p.item)}
                style={{ position: 'absolute', padding: 0, background: 'none', rotate: p.rot, filter: answer && help ? 'drop-shadow(0 0 14px #FFC83D) drop-shadow(0 0 6px #fff)' : undefined }}
              >
                <Pic item={p.item} size={s} cue={cues[p.item.letter] ?? null} />
                <AnimatePresence>
                  {tags.includes(p.item.letter) && (
                    <motion.span
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      style={{ position: 'absolute', left: 'calc(50% - 32px)', top: -40, rotate: -p.rot, width: 64, height: 64, borderRadius: 999, background: 'var(--lavender-dark)', color: '#fff', fontSize: 40, fontWeight: 700, display: 'grid', placeItems: 'center', boxShadow: 'var(--shadow)', pointerEvents: 'none' }}
                    >
                      {p.item.letter}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{ position: 'absolute', left: r.x - 50, top: r.y - 50, width: 100, height: 100, borderRadius: '50%', border: '8px solid var(--pink)', pointerEvents: 'none' }}
          />
        ))}
      </div>
    </Spread>
  )
}

/** The page corner she taps (or swipes the page) to turn to the next page. */
function Corner({ onTurn, eager }: { onTurn: () => void; eager: boolean }) {
  return (
    <motion.button
      aria-label="Turn the page"
      onClick={onTurn}
      animate={eager ? { scale: [1, 1.18, 1], rotate: [0, -6, 0] } : { scale: [1, 1.06, 1] }}
      transition={{ repeat: Infinity, duration: eager ? 0.9 : 1.8 }}
      style={{ position: 'absolute', right: 0, bottom: 0, width: 132, height: 132, padding: 0, background: 'none', transformOrigin: '100% 100%' }}
    >
      <svg viewBox="0 0 132 132" width="100%" height="100%" aria-hidden>
        <path d="M132 24 L132 132 L24 132 Z" fill="#B9A6F5" />
        <path d="M24 132 Q70 118 132 24 Q90 60 24 132 Z" fill="#fff" stroke="#2B2330" strokeWidth="5" strokeLinejoin="round" />
        <path d="M92 104 l16 -16 M108 88 l0 14 M108 88 l-14 0" stroke="#FF4F9A" strokeWidth="7" strokeLinecap="round" fill="none" />
      </svg>
    </motion.button>
  )
}

function FoundPage({ letter, wide, sideSize, onNext }: { letter: Letter; wide: boolean; sideSize: number; onNext: () => void }) {
  const item = ITEMS[letter]
  const box = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(box)
  const [cue, setCue] = useState<{ kind: 'wiggle' | 'hop' | 'dance'; n: number }>({ kind: 'dance', n: 1 })
  const [eager, setEager] = useState(false)
  const turned = useRef(false)
  const swipe = useRef<number | null>(null)
  const turn = () => {
    if (turned.current) return
    turned.current = true
    sounds.whoosh()
    onNext()
  }

  useEffect(() => {
    sounds.sparkle()
    void say(L.found[letter])
    const b = box.current?.getBoundingClientRect()
    if (b) burst((b.left + b.width / 2) / innerWidth, (b.top + b.height * 0.4) / innerHeight)
    // Still here after a while: the corner bounces and Sparkle says to turn the page.
    const t = setTimeout(() => {
      setEager(true)
      void say(L.turn)
    }, 7000)
    return () => clearTimeout(t)
  }, [letter])

  const size = Math.max(120, Math.min(width * 0.62, height * 0.62))
  return (
    <Spread
      wide={wide}
      sideSize={sideSize}
      side={
        <>
          <LetterCard letter={letter} line={L.found[letter]} size={sideSize} />
          <Sparkle height={`${sideSize}px`} cheer={1} />
        </>
      }
    >
      <div
        ref={box}
        // Swiping the page left turns it, like a real book.
        onPointerDown={(e) => (swipe.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipe.current !== null && e.clientX - swipe.current < -70) turn()
          swipe.current = null
        }}
        style={{ position: 'absolute', inset: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {width > 0 && (
          <motion.button
            aria-label={item.word}
            initial={{ scale: 0.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            onClick={() => {
              sounds.pop()
              setCue((c) => ({ kind: c.n % 2 ? 'hop' : 'dance', n: c.n + 1 }))
              void say(item.word)
            }}
            style={{ padding: 0, background: 'none', width: size, height: size }}
          >
            <Pic item={item} size={size} cue={cue} />
          </motion.button>
        )}
        <div style={{ fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
          <span style={{ color: 'var(--hotpink)' }}>{item.word[0]}</span>
          {item.word.slice(1)}
        </div>
      </div>
      <Corner onTurn={turn} eager={eager} />
    </Spread>
  )
}

function Cover({ ever, wide, width, height, onOpen }: { ever: string[]; wide: boolean; width: number; height: number; onOpen: () => void }) {
  // The picture is as big as fits under the top bar with the title and the letters below it.
  const pic = Math.round(wide ? Math.min(width * 0.42, height - 100 - 16 - 115) : Math.min(width * 0.78, height * 0.52))
  const opened = useRef(false)
  useEffect(() => {
    void say(L.open)
  }, [])
  return (
    <div style={{ position: 'absolute', inset: `${TOP} 16px 16px 16px`, display: 'flex', flexDirection: wide ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <motion.button
        aria-label="Open the book"
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ repeat: Infinity, duration: 3 }}
        onClick={() => {
          if (opened.current) return
          opened.current = true
          sounds.whoosh()
          onOpen()
        }}
        style={{ ...PAPER, background: '#FFD6E7', padding: 'clamp(12px, 2vh, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: Math.max(pic + 28, Math.min(330, width - 32)) }}
      >
        <img src={cover} alt="" style={{ width: pic, aspectRatio: '1', borderRadius: 22, objectFit: 'cover' }} />
        <div style={{ fontSize: Math.max(26, Math.min(52, pic * 0.12)), fontWeight: 700, color: 'var(--hotpink)', lineHeight: 1, whiteSpace: 'nowrap' }}>{L.title}</div>
        {/* Every letter she has ever found turns pink. */}
        <div aria-hidden style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, fontSize: 'clamp(16px, 2.4vw, 24px)', fontWeight: 700 }}>
          {LETTERS.map((l) => (
            <span key={l} style={{ color: ever.includes(l) ? 'var(--hotpink)' : '#d6cde6' }}>
              {l}
            </span>
          ))}
        </div>
      </motion.button>
      <Sparkle height={wide ? 'min(36vh, 280px)' : 'min(22vh, 220px)'} cheer={0} />
    </div>
  )
}

function End({ letters, onDone }: { letters: Letter[]; onDone: () => void }) {
  const alive = useAlive()
  const [cues, setCues] = useState<Record<string, { kind: 'wiggle' | 'hop' | 'dance'; n: number }>>({})
  useEffect(() => {
    void (async () => {
      sounds.fanfare()
      burst(0.3, 0.5)
      burst(0.7, 0.5)
      // Each thing she found hops in turn.
      letters.forEach((l, i) => setTimeout(() => alive() && setCues((c) => ({ ...c, [l]: { kind: 'hop', n: 1 } })), 300 + i * 180))
      await say(L.end)
      await wait(1400)
      if (alive()) onDone()
    })()
  }, [])
  const size = `min(${Math.floor(80 / Math.ceil(letters.length / 2))}vw, 22vh, 200px)`
  return (
    <div style={{ position: 'absolute', inset: `${TOP} 16px 16px 16px`, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: 16 }}>
      {letters.map((l) => (
        <button
          key={l}
          aria-label={ITEMS[l].word}
          onClick={() => {
            sounds.pop()
            setCues((c) => ({ ...c, [l]: { kind: 'dance', n: (c[l]?.n ?? 0) + 1 } }))
            void say(ITEMS[l].word)
          }}
          style={{ ...PAPER, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: `calc(${size} + 20px)` }}
        >
          <div style={{ width: size, aspectRatio: '1' }}>
            <SizedPic item={ITEMS[l]} cue={cues[l] ?? null} />
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--hotpink)', lineHeight: 1 }}>
            {l}
            <span style={{ color: 'var(--lavender-dark)' }}>{l.toLowerCase()}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

/** A Pic that fills its parent (for CSS-sized slots). */
function SizedPic({ item, cue }: { item: Item; cue: { kind: 'wiggle' | 'hop' | 'dance'; n: number } | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const { width } = useElementSize(ref)
  return <div ref={ref} style={{ width: '100%', height: '100%' }}>{width > 0 && <Pic item={item} size={width} cue={cue} />}</div>
}

export default function Book({ onWin, setProgress }: GameProps) {
  const { start, param, enter } = useBookSections(SECTIONS)
  const [ever, setEver] = useSaved<string[]>(foundKey(SECTIONS.book), [])
  const root = useRef<HTMLDivElement>(null)
  const { width, height } = useElementSize(root)
  const wide = width > height * 1.1
  // The letter card is the biggest thing beside the page: smaller on short or narrow screens.
  const sideSize = Math.round(wide ? Math.min(width * 0.18, height * 0.3, 220) : Math.min(height * 0.15, width * 0.3, 180))

  const [sitting, setSitting] = useState<Letter[]>(() => (start === 'end' ? param('found').split(',').map(asLetter) : start === 'found' ? [asLetter(param('letter'))] : []))
  const [phase, setPhase] = useState<Phase>(() => {
    const n = Math.min(PAGES, Math.max(1, Number(param('n')) || 1))
    if (start === 'page') return { at: 'page', n, letter: asLetter(param('letter')) }
    if (start === 'found') return { at: 'found', n, letter: asLetter(param('letter')) }
    if (start === 'end') return { at: 'end' }
    return { at: 'cover' }
  })

  useEffect(() => {
    if (phase.at === 'page' || phase.at === 'found') enter(phase.at, { letter: phase.letter, n: String(phase.n) })
    else if (phase.at === 'end') enter('end', { found: sitting.join(',') })
    else enter('cover')
  }, [phase])
  useEffect(() => setProgress(sitting.length, PAGES), [sitting])

  const turnTo = (n: number) => setPhase(n > PAGES ? { at: 'end' } : { at: 'page', n, letter: nextLetter(sitting, ever) })

  return (
    <div ref={root} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(#FFE3EF, #EDE6FF)', perspective: 1800, overflow: 'hidden' }}>
      <style>{'@keyframes ispy-breathe { 0%, 100% { transform: scale(1, 1) } 50% { transform: scale(1.025, 0.975) } }'}</style>
      {width > 0 && (
        <AnimatePresence initial={false}>
          <motion.div
            key={phase.at === 'page' || phase.at === 'found' ? `${phase.at}-${phase.n}` : phase.at}
            // The old page flips away over the new one, like a book.
            exit={{ rotateY: -100, opacity: 0.4, zIndex: 5, transition: { duration: 0.55, ease: 'easeIn' } }}
            style={{ position: 'absolute', inset: 0, transformOrigin: '0% 50%', zIndex: 1, background: 'linear-gradient(#FFE3EF, #EDE6FF)' }}
          >
            {phase.at === 'cover' && <Cover ever={ever} wide={wide} width={width} height={height} onOpen={() => turnTo(1)} />}
            {phase.at === 'page' && (
              <FindPage
                letter={phase.letter}
                n={phase.n}
                wide={wide}
                sideSize={sideSize}
                onFound={() => {
                  const letter = phase.letter
                  setSitting((s) => [...s.filter((l) => l !== letter), letter])
                  setEver((e) => (e.includes(letter) ? e : [...e, letter]))
                  setPhase({ at: 'found', n: phase.n, letter })
                }}
              />
            )}
            {phase.at === 'found' && <FoundPage letter={phase.letter} wide={wide} sideSize={sideSize} onNext={() => turnTo(phase.n + 1)} />}
            {phase.at === 'end' && <End letters={sitting} onDone={onWin} />}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
