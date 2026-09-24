// Unicorn Tea Party - counting to 5 (bonus to 10), from Eureka Math K Module 1 Topic B.
// Six short stations along a rainbow path, one per strategy/activity on the school paper.
import { motion } from 'motion/react'
import { useEffect, useState, type ComponentType } from 'react'
import { BigButton, KID_NAME, Mascot, say, type GameProps } from '../../sdk'
import { art, type StationProps } from './shared'
import { Enough } from './stations/Enough'
import { MarkCount } from './stations/MarkCount'
import { MoveCount } from './stations/MoveCount'
import { NumberMatch } from './stations/NumberMatch'
import { QuickLook } from './stations/QuickLook'
import { TouchCount } from './stations/TouchCount'

const STATIONS: { name: string; icon: string; Component: ComponentType<StationProps> }[] = [
  { name: 'Touch and count', icon: '👆', Component: TouchCount },
  { name: 'Move and count', icon: '✋', Component: MoveCount },
  { name: 'Mark and count', icon: '✔️', Component: MarkCount },
  { name: 'Number match', icon: '🃏', Component: NumberMatch },
  { name: 'Quick look challenge', icon: '👀', Component: QuickLook },
  { name: 'Are there enough?', icon: '🫖', Component: Enough },
]

const WORDS = ['one', 'two', 'three', 'four', 'five', 'six']
const RAINBOW = ['#FF8FB8', '#FFC2A8', '#FBEA9A', '#8FE3C8', '#A8DCFF', '#B9A6F5']

function RainbowMap({ station, onGo }: { station: number; onGo: () => void }) {
  const s = STATIONS[station]
  useEffect(() => {
    const intro = station === 0 ? `Welcome to Sparkle's tea party, ${KID_NAME}! Help Sparkle get ready by counting. ` : ''
    void say(`${intro}Stop ${WORDS[station]}! ${s.name}!`)
  }, [station, s.name])
  return (
    <div
      className="screen"
      style={{ backgroundImage: `url(${art.scene})`, backgroundSize: 'cover', backgroundPosition: 'center bottom', alignItems: 'center', justifyContent: 'center', gap: 24 }}
    >
      <motion.h1
        key={station}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 'var(--radius)', padding: '14px 36px', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700, color: 'var(--hotpink)', boxShadow: 'var(--shadow)', textAlign: 'center' }}
      >
        {station === 0 ? "Sparkle's Tea Party!" : `Stop ${station + 1}: ${s.name}`}
      </motion.h1>
      <div style={{ display: 'flex', gap: 'min(20px, 2vw)', alignItems: 'flex-end', background: 'rgba(255,255,255,0.6)', borderRadius: 999, padding: '18px 24px', marginTop: 110 }}>
        {STATIONS.map((st, i) => (
          <div key={st.name} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {i === station && (
              <div style={{ position: 'absolute', bottom: '100%' }}>
                <Mascot pose="wave" size={110} />
              </div>
            )}
            <motion.div
              animate={i === station ? { scale: [1, 1.15, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{
                width: 'min(96px, 12vw)',
                height: 'min(96px, 12vw)',
                borderRadius: '50%',
                background: RAINBOW[i],
                border: i === station ? '6px solid var(--hotpink)' : '6px solid #fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 'min(44px, 5.5vw)',
                boxShadow: 'var(--shadow)',
                opacity: i > station ? 0.55 : 1,
              }}
            >
              {i < station ? '⭐' : st.icon}
            </motion.div>
          </div>
        ))}
      </div>
      <BigButton size="xl" onClick={onGo}>
        Go! ▶
      </BigButton>
    </div>
  )
}

export default function Game({ onWin, setProgress }: GameProps) {
  const [station, setStation] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => setProgress(station, STATIONS.length), [station, setProgress])

  const next = () => {
    if (station + 1 >= STATIONS.length) {
      setProgress(STATIONS.length, STATIONS.length)
      onWin()
      return
    }
    setStation(station + 1)
    setPlaying(false)
  }

  if (!playing) return <RainbowMap station={station} onGo={() => setPlaying(true)} />
  const { Component } = STATIONS[station]
  return <Component key={station} onDone={next} />
}
