import { motion } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { go } from '../router'
import { findGame, type GameEntry } from './registry'
import { Mascot, sounds, StarProgress, stopSpeaking } from './sdk-internal'
import { WinCeremony } from './WinCeremony'

declare global {
  interface Window {
    /** Test/dev hook: `__kaylee.win()` jumps to the trophy ceremony. */
    __kaylee?: { win: () => void }
  }
}

function RunningGame({ entry }: { entry: GameEntry }) {
  const Game = useMemo(() => lazy(entry.load), [entry])
  const [round, setRound] = useState(0) // bump to restart the game
  const [progress, setProgressState] = useState({ done: 0, total: 0 })
  const [won, setWon] = useState(false)

  const onWin = useCallback(() => setWon(true), [])
  const setProgress = useCallback((done: number, total: number) => setProgressState({ done, total }), [])

  useEffect(() => {
    window.__kaylee = { win: onWin }
    return () => {
      delete window.__kaylee
      stopSpeaking()
    }
  }, [onWin])

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div key={round} style={{ position: 'absolute', inset: 0 }}>
        <Suspense
          fallback={
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <Mascot pose="think" />
            </div>
          }
        >
          <Game onWin={onWin} setProgress={setProgress} />
        </Suspense>
      </div>

      {/* Top bar floats above the game. */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(var(--safe-top) + 12px)',
          left: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 16px)',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <motion.button
          aria-label="Home"
          whileTap={{ scale: 0.85 }}
          onClick={() => {
            sounds.pop()
            go.home()
          }}
          style={{ pointerEvents: 'auto', flex: '0 0 76px', width: 76, height: 76, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow)', fontSize: 38, display: 'grid', placeItems: 'center' }}
        >
          🏠
        </motion.button>
        {progress.total > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: 999, padding: '8px clamp(8px, 2vw, 18px)', boxShadow: 'var(--shadow)' }}>
            <StarProgress done={progress.done} total={progress.total} size="clamp(24px, 7vw, 36px)" />
          </div>
        )}
      </div>

      {won && (
        <WinCeremony
          meta={entry.meta}
          onPlayAgain={() => {
            setWon(false)
            setProgressState({ done: 0, total: 0 })
            setRound((r) => r + 1)
          }}
          onHome={go.home}
          onTrophies={go.trophies}
        />
      )}
    </div>
  )
}

export function GameFrame({ id }: { id: string }) {
  const entry = findGame(id)
  useEffect(() => {
    if (!entry) go.home()
  }, [entry])
  return entry ? <RunningGame key={id} entry={entry} /> : null
}
