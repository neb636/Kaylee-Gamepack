import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { BigButton, burst, Piece, PlayArea, say, sounds, SparklePuppet, Target, useAlive, type PuppetHandle } from '../../../../../sdk'
import { Stage } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { sfx } from '../../../../kit/sfx'
import type { ActivityProps } from '../../Place'
import { art } from '../../art'
import { L } from '../../lines'
import { Lupa } from '../../puppets/Lupa'
import './trevi.css'

const HEIGHTS = [100, 80, 60]
const ORDER = [1, 2, 0]
const T = L.trevi

/** A working model of a Roman water bridge; the actual Aqua Virgo also runs underground. */
function Arch({ height, ghost = false }: { height: number; ghost?: boolean }) {
  return <svg viewBox="0 0 120 120" preserveAspectRatio="none" width="100%" height="100%" aria-hidden>
    <path d={`M8 116 V${116 - height} L112 ${136 - height} V116 H84 V${146 - height} Q60 ${116 - height} 36 ${146 - height} V116 Z`}
      fill={ghost ? '#FFF7F080' : '#F7E7DA'} stroke="#6E3B24" strokeWidth="5" strokeLinejoin="round" strokeDasharray={ghost ? '7 6' : undefined} />
    {!ghost && <path d={`M9 ${128 - height} L111 ${148 - height} M20 100 H35 M85 100 H100`} stroke="#C58A65" strokeWidth="3" />}
  </svg>
}

export function Trevi({ onDone, setProgress }: ActivityProps) {
  const [intro, setIntro] = useState(true)
  const [phase, setPhase] = useState<'build' | 'water' | 'coins' | 'wish'>('build')
  const [placed, setPlaced] = useState<number[]>([])
  const [hint, setHint] = useState(false)
  const [miss, setMiss] = useState(0)
  const [coins, setCoins] = useState(0)
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const finished = useRef(false)
  const lupa = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const alive = useAlive()
  const prompt = phase === 'build' ? (placed.length === 3 ? T.water : T.build[placed.length])
    : phase === 'water' ? T.visit : phase === 'coins' ? T.coins : T.star

  useEffect(() => { setProgress(0, 8) }, [setProgress])

  function place(index: number) {
    if (placed.includes(index) || phase !== 'build' || placed.length === 3) return false
    if (index !== placed.length) {
      setHint(true)
      setMiss(m => m + 1)
      sounds.oops()
      void lupa.current?.play('shake')
      void say(T.hints[placed.length])
      return false
    }
    setPlaced(p => [...p, index])
    setHint(false)
    sounds.snap()
    burst((index + 1) / 4, 0.45)
    void lupa.current?.play('hop')
    void sparkle.current?.play('nod')
    setProgress(index + 1, 8)
    return true
  }

  async function toss() {
    if (locked.current || phase !== 'coins' || coins >= 3) return
    locked.current = true
    setBusy(true)
    setCoins(n => n + 1)
    setProgress(5 + coins, 8)
    sfx.splash()
    void lupa.current?.play('hop')
    await say(T.count[coins])
    if (!alive()) return
    if (coins === 2) {
      setPhase('wish')
      void lupa.current?.play('howl')
    }
    locked.current = false
    setBusy(false)
  }

  async function finish() {
    if (finished.current) return
    finished.current = true
    setBusy(true)
    sounds.sparkle()
    burst()
    setProgress(8, 8)
    void sparkle.current?.play('cheer')
    void lupa.current?.play('cheer')
    await say(T.wish)
    if (alive()) onDone()
  }

  if (intro) return <StoryBeat lines={[T.intro]} friend={<Lupa height="100%" />} bg={art.bgTrevi} onDone={() => setIntro(false)} />

  return <Stage bg="" prompt={prompt} style={{ backgroundColor: '#A8DCFF' }}>
    <div className={`trevi-world trevi-${phase}`} style={phase === 'coins' || phase === 'wish' ? { backgroundImage: `url(${art.bgTrevi})` } : undefined}>
      {(phase === 'build' || phase === 'water') ? <PlayArea style={{ position: 'absolute', inset: 0 }}>
        <div className="trevi-landscape" aria-hidden>
          <svg viewBox="0 0 1000 600" preserveAspectRatio="none">
            <path d="M0 0H1000V600H0Z" fill="#A8DCFF" />
            <path d="M0 220Q180 60 370 230T740 220T1000 200V600H0Z" fill="#B9DFC3" />
            <path d="M0 410Q230 350 500 420T1000 390V600H0Z" fill="#8FE3C8" />

          </svg>
          <motion.span className="trevi-cloud" animate={{ x: [0, 35, 0] }} transition={{ repeat: Infinity, duration: 14 }}>☁️</motion.span>
        </div>
        <div className="trevi-source" aria-hidden><svg viewBox="0 0 100 300" preserveAspectRatio="none"><path d="M0 8H100V300H0Z" fill="#C9B3A0" stroke="#6E3B24" strokeWidth="3" /><path d="M0 8H100" stroke="#6EC3E6" strokeWidth="9" /></svg></div>
        <div className="trevi-outlet" aria-hidden><svg viewBox="0 0 100 300" preserveAspectRatio="none"><path d="M0 8H100V300H0Z" fill="#EBCDA5" stroke="#6E3B24" strokeWidth="3" />{phase === 'water' && <path d="M0 8H100" stroke="#6EC3E6" strokeWidth="9" />}</svg></div>
        <div className="trevi-bridge">
          {HEIGHTS.map((height, index) => <Target key={index} id={`arch-${index}`} hint={hint && index === placed.length} style={{ width: '33.333%', height: '100%' }}>
            <div className="trevi-arch" data-filled={placed.includes(index)}><Arch height={height} ghost={!placed.includes(index)} /></div>
          </Target>)}
          {placed.length === 3 && <svg className="trevi-flow" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden><path d="M0 16L120 36L240 56L360 76" stroke="#6E3B24" strokeWidth="12" /><path d="M0 16L120 36L240 56L360 76" stroke="#F7E7DA" strokeWidth="8" /></svg>}
          {phase === 'water' && <svg className="trevi-flow" viewBox="0 0 360 120" preserveAspectRatio="none" aria-label="Water flowing downhill">
            <motion.path d="M0 16L120 36L240 56L360 76" fill="none" stroke="#36AFE0" strokeWidth="8" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8 }} />
            <motion.path d="M0 16L120 36L240 56L360 76" fill="none" stroke="#E3FAFF" strokeWidth="3" strokeDasharray="8 14" animate={{ strokeDashoffset: [0, -44] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
          </svg>}
        </div>
        {phase === 'build' && placed.length < 3 && <div className="trevi-tray">
          {ORDER.filter(index => !placed.includes(index)).map(index => <motion.div key={index} className="trevi-tray-item"
            animate={hint && index === placed.length ? { scale: [1, 1.07, 1] } : { scale: 1 }} transition={{ repeat: hint ? Infinity : 0, duration: 1 }}>
            <Piece id={`stone-${index}`} label={['Tall arch', 'Medium arch', 'Short arch'][index]} snapTo={`arch-${index}`} snapRadius={35}
              onTap={() => place(index)} onPlace={({ target }) => {
                if (target === `arch-${index}` && index === placed.length) return place(index) ? 'snap' : 'home'
                setHint(true); setMiss(m => m + 1); sounds.oops(); void lupa.current?.play('shake'); void say(T.hints[placed.length]); return 'home'
              }} style={{ width: '100%', height: '100%' }}>
              <motion.div key={miss} style={{ width: '100%', height: '100%' }} animate={hint && index !== placed.length ? { rotate: [0, -5, 5, 0] } : {}}><Arch height={HEIGHTS[index]} /></motion.div>
            </Piece>
          </motion.div>)}
        </div>}
        {placed.length === 3 && <div className="trevi-action">
          <BigButton ariaLabel={phase === 'build' ? 'Let the water flow' : 'Visit Trevi Fountain'} onClick={() => {
            if (phase === 'build') { setPhase('water'); setProgress(4, 8); sfx.splash(); void lupa.current?.play('cheer') }
            else { setPhase('coins'); sounds.whoosh() }
          }}>{phase === 'build' ? '💧 ▶' : '⛲ ▶'}</BigButton>
        </div>}
      </PlayArea> : <PlayArea style={{ position: 'absolute', inset: 0 }}>
        <Target id="fountain" hint={hint} style={{ position: 'absolute', left: '20%', top: 'calc(100cqh - max(35cqh, 23.333cqw))', width: '60%', height: 'max(14cqh, 9.333cqw)', borderRadius: '50%' }}>
          <div className="trevi-pool" aria-hidden>
            {[0, 1, 2].map(i => <motion.div key={i} className="trevi-ripple" animate={{ scale: [0.2, 1], opacity: [0.8, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.8 }} />)}
          </div>
        </Target>
        {Array.from({ length: coins }, (_, i) => <motion.div key={i} className="trevi-flying-coin" style={{ left: `${43 + i * 7}%`, top: 'calc(100cqh - max(28cqh, 18.667cqw) - 50px)' }} initial={{ y: 220, scale: 1.2 }} animate={{ y: [220, -180, 0], scale: [1.2, 1, 0.55], rotate: 360 }} transition={{ duration: 0.75 }} aria-hidden>★</motion.div>)}
        {phase === 'coins' && <div className="trevi-coin-tray">
          <Piece id="wishing-coin" label="Wishing coin" snapTo="fountain" disabled={busy} onTap={() => void toss()}
            onPlace={({ target }) => { if (target === 'fountain') { setHint(false); void toss(); return 'reset' } setHint(true); sounds.oops(); void lupa.current?.play('shake'); void say(T.coinHint); return 'home' }}
            style={{ width: 100, height: 100 }}><div className="trevi-coin">★</div></Piece>
          <div className="trevi-count" aria-label={`${coins} of 3 coins`}>{[0, 1, 2].map(i => <span key={i}>{i < coins ? '💛' : '🤍'}</span>)}</div>
        </div>}
        {phase === 'wish' && <div className="trevi-action"><BigButton ariaLabel="Give Lupa her wishing star" onClick={() => void finish()} disabled={busy}>⭐ 💖</BigButton></div>}
      </PlayArea>}
      <div className="trevi-friends">
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.5} />
        <Lupa ref={lupa} height="100%" onTap={() => { sounds.pop(); void lupa.current?.play('wag'); void say(T.tickle) }} />
      </div>
      <button className="trevi-fact" aria-label={phase === 'build' || phase === 'water' ? 'Hear about Roman aqueducts' : 'Hear about the fountain coins'} onClick={() => { void say(phase === 'build' || phase === 'water' ? T.aqueduct : T.charity); void sparkle.current?.play('wave') }}>💡 🔊</button>
    </div>
  </Stage>
}
