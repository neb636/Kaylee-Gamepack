// Tic-tac-toe with Putto at the big table downstairs. Kaylee is the pink hearts and goes first; Putto is the blue fish.
// No losing: Putto is five too, so he never finishes a line of his own (he gets distracted, giggles, and plays
// somewhere else). He gets a little better each game: the first game he plays anywhere, then he starts blocking her
// lines now and then. A tie is "again!". After a while with nothing tapped, the empty squares pulse, and the square
// that would win for her pulses brighter.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, sounds, type PuppetHandle } from '../../../../../../sdk'
import { sfx } from '../../../sfx'
import { TEXT, VOICED } from './lines'
import { PuttoPuppet } from './puppets'
import { Room, RoundButton, useBubble } from './Room'

type Mark = 'k' | 'p' | null
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]
const winner = (b: Mark[]) => LINES.find((l) => b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) ?? null
/** Squares where `who` would finish a line. */
const finishing = (b: Mark[], who: 'k' | 'p') => b.flatMap((m, i) => (m ? [] : LINES.some((l) => l.includes(i) && l.filter((j) => j !== i).every((j) => b[j] === who)) ? [i] : []))

/** Putto's move: never a winning one (unless it's the only square left); blocks her `block` of the time. */
function puttoMove(b: Mark[], block: number) {
  const empty = b.flatMap((m, i) => (m ? [] : [i]))
  const mine = new Set(finishing(b, 'p'))
  const safe = empty.filter((i) => !mine.has(i))
  const pool = safe.length ? safe : empty
  const stop = finishing(b, 'k').filter((i) => pool.includes(i))
  if (stop.length && Math.random() < block) return stop[0]
  // Otherwise somewhere near his own fish, or anywhere.
  return pool[Math.floor(Math.random() * pool.length)]
}

export function TicTacToe({ onClose }: { onClose(): void }) {
  const putto = useRef<PuppetHandle>(null)
  const { text, talk } = useBubble()
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null))
  const [turn, setTurn] = useState<'k' | 'p'>('k')
  const [games, setGames] = useState(0)
  const [hearts, setHearts] = useState(0)
  const [over, setOver] = useState<'win' | 'tie' | null>(null)
  const [idle, setIdle] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const later = (ms: number, fn: () => void) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    talk(VOICED.puttoPlay)
    void putto.current?.play('hop')
    later(1600, () => talk({ show: TEXT.ttt.start }))
  }, [])

  // Stuck for a while on her turn: the empty squares pulse.
  useEffect(() => {
    setIdle(false)
    if (turn !== 'k' || over) return
    const t = setTimeout(() => {
      setIdle(true)
      talk({ show: finishing(board, 'k').length ? TEXT.ttt.almost : TEXT.ttt.hint })
    }, 8000)
    return () => clearTimeout(t)
  }, [turn, over, board])

  const finish = (b: Mark[]) => {
    const w = winner(b)
    if (w) {
      setOver('win')
      setHearts((h) => h + 1)
      sounds.fanfare()
      burst()
      talk({ show: TEXT.ttt.win })
      void putto.current?.play('cheer')
      return true
    }
    if (b.every(Boolean)) {
      setOver('tie')
      sounds.sparkle()
      talk({ show: TEXT.ttt.tie })
      void putto.current?.play('giggle')
      return true
    }
    return false
  }

  const tap = (i: number) => {
    if (turn !== 'k' || over) return
    if (board[i]) {
      sounds.oops()
      void putto.current?.play('shake')
      return
    }
    const b = [...board]
    b[i] = 'k'
    setBoard(b)
    sounds.note(b.filter(Boolean).length)
    if (finish(b)) return
    setTurn('p')
    later(350, () => {
      void putto.current?.play('think')
      talk({ show: TEXT.ttt.thinking })
    })
    later(1300, () => {
      const j = puttoMove(b, Math.min(0.75, games * 0.3))
      const nb = [...b]
      nb[j] = 'p'
      setBoard(nb)
      sfx.boing()
      void putto.current?.play('hop')
      if (!finish(nb)) setTurn('k')
    })
  }

  const again = () => {
    sounds.whoosh()
    setBoard(Array(9).fill(null))
    setGames((g) => g + 1)
    setOver(null)
    setTurn('k')
    talk({ show: TEXT.ttt.yourTurn })
    void putto.current?.play('nod')
  }

  const line = winner(board)
  const pulse = idle ? new Set(finishing(board, 'k').length ? finishing(board, 'k') : board.flatMap((m, i) => (m ? [] : [i]))) : new Set<number>()

  return (
    <Room name="Putto" wall="#FFF1E2" floor="#E9D2B8" bubble={text} onClose={onClose} host={
      <button aria-label="Putto" onClick={() => { sfx.boing(); void putto.current?.play('giggle') }} style={{ width: '100%', height: '100%', background: 'none', border: 'none', padding: 0 }}>
        <PuttoPuppet ref={putto} height="100%" />
      </button>
    }>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'min(16px, 2vh)' }}>
        {/* Her hearts: one for every game she wins */}
        <div aria-label={`Kaylee has won ${hearts}`} style={{ minHeight: 40, display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: hearts }, (_, i) => (
            <motion.span key={i} initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} style={{ width: 36, height: 36 }}>
              <Heart />
            </motion.span>
          ))}
        </div>
        {/* The paper on the table */}
        <div style={{ position: 'relative', width: 'min(100%, 62vh, 560px)', aspectRatio: '1', background: '#FFFDF8', borderRadius: 26, border: '5px solid var(--ink)', boxShadow: '0 10px 0 rgba(43,35,48,.18)', padding: '4%' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
            <svg viewBox="0 0 300 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <path d="M100 8 Q96 150 102 292 M200 10 Q204 150 198 290 M8 102 Q150 96 292 100 M10 200 Q150 205 290 198" stroke="#8C7FB0" strokeWidth={8} strokeLinecap="round" fill="none" />
            </svg>
            {board.map((m, i) => (
              <motion.button
                key={i}
                aria-label={`Square ${i + 1}`}
                onClick={() => tap(i)}
                animate={pulse.has(i) ? { backgroundColor: ['rgba(255,143,184,0)', 'rgba(255,143,184,.45)', 'rgba(255,143,184,0)'] } : { backgroundColor: 'rgba(255,143,184,0)' }}
                transition={pulse.has(i) ? { repeat: Infinity, duration: 1.3 } : undefined}
                style={{ position: 'relative', border: 'none', borderRadius: 20, margin: '6%', padding: '10%', display: 'grid', placeItems: 'center' }}
              >
                <AnimatePresence>
                  {m && (
                    <motion.span
                      key={m}
                      initial={{ scale: 0, y: -40, rotate: m === 'k' ? -30 : 30 }}
                      animate={{ scale: line?.includes(i) ? [1, 1.25, 1] : 1, y: 0, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={line?.includes(i) ? { repeat: Infinity, duration: 0.8 } : { type: 'spring', stiffness: 380, damping: 14 }}
                      style={{ width: '100%', height: '100%', display: 'block' }}
                    >
                      {m === 'k' ? <Heart /> : <Fish />}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>
        <div style={{ minHeight: 'var(--target)' }}>
          {over && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}>
              <RoundButton label="Play again" icon="🔁" color="var(--mint)" onClick={again} pulse />
            </motion.div>
          )}
        </div>
      </div>
    </Room>
  )
}

function Heart() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M50 88 C10 62 4 36 18 22 C30 10 46 16 50 30 C54 16 70 10 82 22 C96 36 90 62 50 88Z" fill="#FF5FA2" stroke="#2B2330" strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={30} cy={34} rx={7} ry={10} fill="#fff" opacity={0.7} transform="rotate(-30 30 34)" />
    </svg>
  )
}

function Fish() {
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M68 50 L94 28 Q88 50 94 72Z" fill="#5DB7F0" stroke="#2B2330" strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={44} cy={50} rx={36} ry={26} fill="#8EC9F5" stroke="#2B2330" strokeWidth={5} />
      <circle cx={28} cy={44} r={6} fill="#2B2330" />
      <circle cx={26} cy={42} r={2} fill="#fff" />
      <path d="M46 34 Q54 50 46 66" stroke="#5DB7F0" strokeWidth={5} fill="none" strokeLinecap="round" />
    </svg>
  )
}
