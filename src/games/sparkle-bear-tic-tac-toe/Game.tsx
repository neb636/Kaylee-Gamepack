import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { burst, Mascot, say, SayButton, sounds, type GameProps } from '../../sdk'
import bear from './assets/bear.webp'
import scene from './assets/scene.webp'
import './game.css'

type Mark = 'heart' | 'star' | null
type Board = Mark[]
type Result = 'heart' | 'draw' | null

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]
const ROUND_LINES = [
  'Round one! You are hearts. Bear is stars. Take turns and make three hearts in a row!',
  'Round two! Look for a line of two. Add a heart to make three, or block Bear with a heart!',
  'Final round, Kaylee! Find a clever spot for your heart. Can you make a line?',
]
const HEART_HINT = 'One more heart makes a line! Tap the glowing square.'
const BLOCK_HINT = 'Bear has two stars! Put a heart in the glowing square to block.'
const BEAR_LINE = 'Bear placed a star. Your turn, Kaylee!'
const ROUND_WIN = 'Three hearts in a row! You won this round, Kaylee!'
const ROUND_DRAW = 'The board is full! You and Bear made a great team!'
const NEXT_LINE = 'Tap the big pink button for the next round!'
const FINAL_LINE = 'You and Bear played all three rounds. Great thinking, Kaylee!'
const BEAR_GENTLE = 'Bear almost made a line. Let’s try that turn again. Tap the glowing square to block!'

function lineFor(board: Board, mark: Mark): number[] | undefined {
  return LINES.find((line) => line.every((index) => board[index] === mark))
}

function lineOpportunity(board: Board, mark: Exclude<Mark, null>): number | undefined {
  for (const line of LINES) {
    const marks = line.map((index) => board[index])
    if (marks.filter((value) => value === mark).length === 2 && marks.filter((value) => value === null).length === 1) {
      return line[marks.indexOf(null)]
    }
  }
  return undefined
}

function bearChoice(board: Board, round: number): number {
  const order = round === 0 ? [2, 6, 8, 1, 3, 5, 7, 4, 0] : [4, 0, 8, 2, 6, 1, 3, 5, 7]
  const empty = order.filter((index) => board[index] === null)
  // Bear grows more thoughtful after the first round, but leaves plenty of
  // chances for Kaylee to discover a winning line herself.
  const block = round > 0 ? lineOpportunity(board, 'heart') : undefined
  const preferred = block !== undefined ? [block, ...empty.filter((index) => index !== block)] : empty
  return preferred.find((index) => {
    const next = [...board]
    next[index] = 'star'
    return !lineFor(next, 'star')
  }) ?? preferred[0]
}

export default function Game({ onWin, setProgress }: GameProps) {
  const [board, setBoard] = useState<Board>(() => Array(9).fill(null))
  const [round, setRound] = useState(0)
  const [turn, setTurn] = useState<'heart' | 'star' | 'done'>('heart')
  const [result, setResult] = useState<Result>(null)
  const [glow, setGlow] = useState<number | undefined>()
  const [line, setLine] = useState<number[]>([])
  const [message, setMessage] = useState(ROUND_LINES[0])
  const winCalled = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef(board)

  useEffect(() => {
    setProgress(0, 3)
    void say(ROUND_LINES[0], { interrupt: false })
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [setProgress])

  function finish(next: Board, outcome: Result) {
    boardRef.current = next
    setBoard(next)
    setResult(outcome)
    setTurn('done')
    setGlow(undefined)
    setLine(outcome === 'heart' ? lineFor(next, 'heart') ?? [] : [])
    setProgress(round + 1, 3)
    if (outcome === 'heart') {
      sounds.correct()
      burst()
    } else {
      sounds.sparkle()
    }
    const spoken = round === 2 ? FINAL_LINE : `${outcome === 'heart' ? ROUND_WIN : ROUND_DRAW} ${NEXT_LINE}`
    setMessage(spoken)
    if (round === 2 && !winCalled.current) {
      winCalled.current = true
      void say(spoken).then(onWin)
    } else {
      void say(spoken)
    }
  }

  function afterBear(next: Board) {
    boardRef.current = next
    setBoard(next)
    sounds.pop()
    if (next.every(Boolean)) {
      finish(next, 'draw')
      return
    }
    const winningSpot = lineOpportunity(next, 'heart')
    const blockingSpot = lineOpportunity(next, 'star')
    const hint = winningSpot !== undefined ? HEART_HINT : blockingSpot !== undefined ? BLOCK_HINT : BEAR_LINE
    setGlow(winningSpot ?? blockingSpot)
    setMessage(hint)
    setTurn('heart')
    void say(hint)
  }

  function play(index: number) {
    if (turn !== 'heart' || boardRef.current[index] !== null) {
      if (turn === 'heart') {
        sounds.oops()
        void say('That square is full. Pick an empty square!')
      }
      return
    }
    const next = [...boardRef.current]
    next[index] = 'heart'
    boardRef.current = next
    setBoard(next)
    setGlow(undefined)
    sounds.note(next.filter((mark) => mark === 'heart').length)
    if (lineFor(next, 'heart')) {
      finish(next, 'heart')
      return
    }
    if (next.every(Boolean)) {
      finish(next, 'draw')
      return
    }
    setTurn('star')
    setMessage('Bear is thinking...')
    timer.current = setTimeout(() => {
      const choice = bearChoice(next, round)
      const after = [...next]
      after[choice] = 'star'
      if (lineFor(after, 'star')) {
        // A friendly do-over teaches the block without ending the round.
        setTurn('heart')
        setGlow(choice)
        setMessage(BEAR_GENTLE)
        sounds.oops()
        void say(BEAR_GENTLE)
        return
      }
      afterBear(after)
    }, 620)
  }

  function nextRound() {
    if (round >= 2) return
    const upcoming = round + 1
    const blank: Board = Array(9).fill(null)
    boardRef.current = blank
    setBoard(blank)
    setRound(upcoming)
    setResult(null)
    setLine([])
    setGlow(undefined)
    setTurn('heart')
    setMessage(ROUND_LINES[upcoming])
    sounds.whoosh()
    void say(ROUND_LINES[upcoming])
  }

  return (
    <div className="bear-game" style={{ backgroundImage: `url(${scene})` }}>
      <div className="bear-top">
        <div className="bear-rounds" aria-label={`${round + 1} of 3 rounds`}>
          {[0, 1, 2].map((index) => <motion.span key={index} animate={{ scale: index < round + (result ? 1 : 0) ? 1.12 : 1 }} className={index < round + (result ? 1 : 0) ? 'grown' : ''}>🌸</motion.span>)}
        </div>
        <div className="bear-prompt"><span>{message}</span><SayButton text={message} size={88} /></div>
      </div>

      <div className="bear-play-area">
        <div className="bear-friend sparkle-friend"><Mascot pose={result === 'heart' ? 'cheer' : 'wave'} size={140} /><span>💗 Kaylee</span></div>
        <div className="bear-board-wrap">
          <div className="bear-board" role="grid" aria-label="Tic tac toe board">
            {board.map((mark, index) => (
              <motion.button
                key={`${round}-${index}`}
                role="gridcell"
                aria-label={`Square ${index + 1}: ${mark === 'heart' ? 'Kaylee heart' : mark === 'star' ? 'Bear star' : 'empty'}`}
                className={`bear-cell ${glow === index ? 'bear-glow' : ''} ${line.includes(index) ? 'bear-line' : ''}`}
                onClick={() => play(index)}
                whileTap={mark === null ? { scale: 0.9 } : undefined}
              >
                {mark && <motion.span initial={{ scale: 0, rotate: -25 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.55 }}>{mark === 'heart' ? '💗' : '⭐'}</motion.span>}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="bear-friend bear-side"><img src={bear} alt="Bear waving" /><span>⭐ Bear</span></div>
      </div>

      <div className="bear-bottom">
        {result && round < 2 ? <motion.button className="bear-next" initial={{ scale: 0.5 }} animate={{ scale: 1 }} onClick={nextRound}>Next round! ▶</motion.button> : <div className="bear-rule">{result ? '🌸 🌸 🌸' : '💗 💗 💗  ·  ⭐ ⭐ ⭐'}</div>}
      </div>
    </div>
  )
}
